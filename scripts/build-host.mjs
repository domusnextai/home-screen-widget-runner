import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from '../tailwind.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(await fs.readFile(path.join(root, 'npm-shrinkwrap.json'), 'utf8'));
const host = path.join(root, 'host');
const entries = path.join(root, '.host-build-entries');
const modules = Object.keys(JSON.parse(await fs.readFile(path.join(host, 'runtime.json'), 'utf8')).imports);
const imports = {};
const versions = {};
const entryPoints = {};
await fs.mkdir(entries, { recursive: true });
try {
  for (const name of modules) {
    const filename = name.replace(/^@/, '').replaceAll('/', '--');
    const entry = path.join(entries, `${filename}.js`);
    let source;
    if (['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'].includes(name)) {
      const keys = Object.keys(require(name)).filter(k => k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k));
      source = `import value from ${JSON.stringify(name)}; export default value;\n${keys.map(k => `export const ${k} = value.${k};`).join('\n')}`;
    } else {
      source = `import * as value from ${JSON.stringify(name)}; export * from ${JSON.stringify(name)}; export default Reflect.get(value, 'default') ?? value;`;
    }
    await fs.writeFile(entry, source);
    entryPoints[filename] = entry;
    imports[name] = `./vendor/${filename}.js`;
    const packageName = name.startsWith('@') ? name.split('/').slice(0,2).join('/') : name.split('/')[0];
    versions[packageName] = lock.packages[`node_modules/${packageName}`].version;
  }
  const result = await build({
    absWorkingDir: root, entryPoints, bundle: true, splitting: true, format: 'esm',
    platform: 'browser', target: 'es2020', minify: true, outdir: path.join(host, 'vendor'),
    chunkNames: 'chunks/[name]-[hash]', metafile: true, write: false,
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });
  // Replace generated vendor files only after the complete build has succeeded.
  await fs.rm(path.join(host, 'vendor'), { recursive: true, force: true });
  for (const file of result.outputFiles) {
    await fs.mkdir(path.dirname(file.path), { recursive: true });
    await fs.writeFile(file.path, file.contents);
  }
  // Shared chunks keep React identity consistent across every library entry.
  const map = { imports };
  await fs.writeFile(path.join(host, 'runtime.json'), JSON.stringify(map, null, 2) + '\n');
  await fs.writeFile(path.join(host, 'versions.json'), JSON.stringify(versions, null, 2) + '\n');
  const sourceCss = (await fs.readFile(path.join(root, 'src/index.css'), 'utf8')).replace('@tailwind utilities;', '');
  const css = await postcss([tailwindcss({ ...tailwindConfig, content: [{ raw: '<div></div>', extension: 'html' }] }), autoprefixer()]).process(sourceCss, { from: undefined });
  await fs.writeFile(path.join(host, 'base.css'), css.css);
  await fs.writeFile(path.join(host, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Application host</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./base.css">
  <script type="importmap">${JSON.stringify(map).replaceAll('<', '\\u003c')}</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./bootstrap.js"></script>
</body>
</html>
`);
  console.log(`Host ready: ${host}`);
  console.log(`${modules.length} module mappings, ${Object.keys(result.metafile.outputs).length} shared vendor files. No CDN required.`);
  console.log('Import-map URLs are relative to host/index.html; preserve the directory layout.');
} finally {
  await fs.rm(entries, { recursive: true, force: true });
}
