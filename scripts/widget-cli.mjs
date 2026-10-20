#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--version')) { console.log(JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8')).version); process.exit(0); }
if (args.includes('--host-dir')) { console.log(path.join(packageRoot, 'host')); process.exit(0); }
if (args.includes('--preview-script')) { console.log(path.join(packageRoot, 'scripts/preview.py')); process.exit(0); }
if (!args.length || args.includes('--help')) {
  console.log('home-screen-widget Widget.tsx [--host /path/to/target-runtime] [--out /path/to/widget.js]\nOptions: --version, --host-dir, --preview-script');
  process.exit(args.length ? 0 : 1);
}
const source = await fs.realpath(path.resolve(args.shift()));
let runner = process.env.WIDGET_RUNNER_ROOT || packageRoot;
let output = path.resolve('widget.js');
let targetHost = process.env.WIDGET_HOST_ROOT;
for (let i = 0; i < args.length; i += 2) {
  if (!args[i + 1]) throw new Error(`Missing value for ${args[i]}`);
  if (args[i] === '--runner') runner = path.resolve(args[i + 1]);
  else if (args[i] === '--host') targetHost = path.resolve(args[i + 1]);
  else if (args[i] === '--out') output = path.resolve(args[i + 1]);
  else throw new Error(`Unknown option: ${args[i]}`);
}
runner = path.resolve(runner);
const runnerHost = path.join(runner, 'host');
const hostRoot = targetHost ? path.resolve(targetHost) : runnerHost;
const runtimePath = path.join(hostRoot, 'runtime.json');
const versionsPath = path.join(hostRoot, 'versions.json');
for (const file of [runtimePath, versionsPath, path.join(runner, 'scripts/build-external.mjs')]) await fs.access(file);
const sorted = value => JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
const runtime = JSON.parse(await fs.readFile(runtimePath, 'utf8'));
if (!runtime.imports || typeof runtime.imports !== 'object' || Array.isArray(runtime.imports)) throw new Error('runtime.json requires an imports object');
if (targetHost) {
  const runnerRuntime = JSON.parse(await fs.readFile(path.join(runnerHost, 'runtime.json'), 'utf8'));
  const runnerVersions = JSON.parse(await fs.readFile(path.join(runnerHost, 'versions.json'), 'utf8'));
  const targetVersions = JSON.parse(await fs.readFile(versionsPath, 'utf8'));
  // Deployment URLs may differ; exposed entry names and dependency versions must match.
  if (JSON.stringify(Object.keys(runtime.imports).sort()) !== JSON.stringify(Object.keys(runnerRuntime.imports).sort())
      || sorted(targetVersions) !== sorted(runnerVersions)) {
    throw new Error('Target host dependency entries/versions differ from runner; use a matching runner before publishing');
  }
}
const require = createRequire(path.join(runner, 'package.json'));
const ts = require('typescript');
const options = {
  noEmit: true, allowImportingTsExtensions: true, strict: true, skipLibCheck: true, esModuleInterop: true,
  target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  types: ['react', 'react-dom'], typeRoots: [path.join(runner, 'node_modules/@types')],
};
const host = ts.createCompilerHost(options);
host.resolveModuleNames = (names, containingFile) => names.map(name => {
  // Check bare imports against the runner's dependency tree, independent of the source directory.
  const origin = name.startsWith('.') || path.isAbsolute(name) ? containingFile : path.join(runner, '__widget_typecheck__.tsx');
  return ts.resolveModuleName(name, origin, options, ts.sys).resolvedModule;
});
const contractPath = path.join(runner, '__widget_contract__.tsx');
const contract = `import App from ${JSON.stringify(source)};\nimport type { ComponentType } from 'react';\nconst checked: ComponentType<{}> = App;\n`;
const originalReadFile = host.readFile;
const originalFileExists = host.fileExists;
host.readFile = file => file === contractPath ? contract : originalReadFile(file);
host.fileExists = file => file === contractPath || originalFileExists(file);
const program = ts.createProgram([source, contractPath], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: p => p, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
  }));
  process.exit(1);
}
const build = spawnSync(process.execPath, [path.join(runner, 'scripts/build-external.mjs'), source, '--runtime', runtimePath, '--out', output], { cwd: runner, stdio: 'inherit' });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);
const bytes = await fs.readFile(output);
if (bytes.length > 2 * 1024 * 1024) throw new Error('Widget JS exceeds the 2 MiB publication limit');
const hash = b => createHash('sha256').update(b).digest('hex');
console.log(JSON.stringify({
  status: 'built', upload: 'upload_pending', source, output, bytes: bytes.length,
  sha256: hash(bytes), hostVersionsSha256: hash(await fs.readFile(versionsPath)),
  hostImportMapSha256: hash(await fs.readFile(runtimePath)),
  targetHost: hostRoot, hostCompatibility: targetHost ? 'manifest_match' : 'runner_only_unverified',
  visualVerification: 'required_in_host',
}, null, 2));
