import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from '../tailwind.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const usage = 'npm run build:external -- App.tsx [--out app.js] [--runtime runtime.json]';
if (!args.length || args.includes('--help')) {
  console.log(usage);
  process.exit(args.length ? 0 : 1);
}
const input = await fs.realpath(path.resolve(args.shift()));
let output = path.resolve('dist/app.js');
let runtime;
for (let i = 0; i < args.length; i += 2) {
  if (!args[i + 1]) throw new Error(`Missing value for ${args[i]}`);
  if (args[i] === '--out') output = path.resolve(args[i + 1]);
  else if (args[i] === '--runtime') runtime = JSON.parse(await fs.readFile(path.resolve(args[i + 1]), 'utf8'));
  else throw new Error(`Unknown option ${args[i]}. ${usage}`);
}
if (!/\.[jt]sx$/.test(input)) throw new Error('Input must be a JSX or TSX file');
if (output === input || !output.endsWith('.js')) throw new Error('Output must be a separate .js file');
if (runtime && (!runtime.imports || typeof runtime.imports !== 'object' || Array.isArray(runtime.imports))) throw new Error('runtime.json requires an imports object');
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const used = new Set();
const entryId = '\0external-app-entry';
const cssId = '\0external-app-utilities.css';
const result = await build({
  root, configFile: false, publicDir: false,
  plugins: [
    {
      name: 'external-runtime', enforce: 'pre',
      resolveId(id, importer) {
        if (id === entryId || id === cssId) return id;
        if (importer === input && (id.startsWith('.') || id.startsWith('/') || id.startsWith('@/') || id.startsWith('src/'))) {
          throw new Error(`Single-file artifacts cannot import local files: ${id}. Use an external library or define the component in this file.`);
        }
      },
      load(id) {
        if (id === entryId) return `export {default} from ${JSON.stringify(input)};\nimport ${JSON.stringify(cssId)};`;
        if (id === cssId) return '@tailwind utilities;';
      },
    },
    react(),
    {
      name: 'inline-application-css', enforce: 'post',
      generateBundle(_options, bundle) {
        const css = [];
        for (const [name, item] of Object.entries(bundle)) {
          if (item.type === 'asset' && name.endsWith('.css')) {
            css.push(String(item.source));
            delete bundle[name];
          }
        }
        const stylesheet = css.join('\n');
        if (!stylesheet) return;
        const styleId = 'artifact-' + createHash('sha256').update(stylesheet).digest('hex').slice(0, 16);
        for (const item of Object.values(bundle)) {
          if (item.type === 'chunk' && item.isEntry) {
            item.code = `if(!document.getElementById(${JSON.stringify(styleId)})){const style=document.createElement('style');style.id=${JSON.stringify(styleId)};style.textContent=${JSON.stringify(stylesheet)};document.head.appendChild(style);}\n` + item.code;
          }
        }
      },
    },
  ],
  css: { postcss: { plugins: [tailwindcss({ ...tailwindConfig, corePlugins: { preflight: false }, content: [input] }), autoprefixer()] } },
  build: {
    write: false, modulePreload: false, cssCodeSplit: false, minify: 'esbuild',
    rollupOptions: {
      input: entryId,
      preserveEntrySignatures: 'strict',
      output: { format: 'es', entryFileNames: 'app.js', inlineDynamicImports: true },
      external(id) {
        if (id.startsWith('\0') || id.startsWith('.') || path.isAbsolute(id)) return false;
        if (id.startsWith('@/') || id.startsWith('src/')) throw new Error(`Local component imports are unsupported: ${id}`);
        if (/\.(css|scss|less)(\?|$)/.test(id)) throw new Error(`Load library stylesheets in the host HTML: ${id}`);
        const name = id.startsWith('@') ? id.split('/').slice(0, 2).join('/') : id.split('/')[0];
        if (!pkg.dependencies[name] && !runtime?.imports[id]) throw new Error(`Dependency ${id} is not allowed. Add it to dependencies or map it in runtime.json.`);
        if (runtime && !runtime.imports[id]) throw new Error(`Missing host mapping for ${id} in runtime.json`);
        used.add(id);
        return true;
      },
    },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(r => r.output);
if (outputs.length !== 1 || outputs[0].type !== 'chunk') throw new Error(`Expected one JS output; got ${outputs.map(x => x.fileName).join(', ')}`);
if (!outputs[0].exports.includes('default')) throw new Error('Artifact must default-export a React component');
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, outputs[0].code);
console.log(`External-runtime JS: ${output} (${Buffer.byteLength(outputs[0].code)} bytes)`);
console.log(`Host must resolve: ${[...used].sort().join(', ')}`);
