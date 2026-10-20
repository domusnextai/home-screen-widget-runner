import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root = new URL('../', import.meta.url);
test('emits one ESM module with injected CSS and external libraries; validates host mappings', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'artifact-test-'));
  try {
    const output = path.join(dir, 'app.js');
    const run = (...args) => execFileSync(process.execPath, ['scripts/build-external.mjs', ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    run('tests/fixtures/App.tsx', '--out', output);
    const js = await fs.readFile(output, 'utf8');
    assert.match(js, /from["']react\/jsx-runtime["']/);
    assert.match(js, /from["']lucide-react["']/);
    assert.match(js, /from["']react["']/);
    assert.match(js, /as default/);
    assert.match(js, /document\.createElement\('style'\)/);
    assert.match(js, /\.p-7\s*\{/);
    assert.match(js, /Count:/);
    assert.doesNotMatch(js, /react-dom|createRoot|importmap|esm\.sh|react\.production\.min/);
    assert.ok(Buffer.byteLength(js) < 12000);
    assert.deepEqual(await fs.readdir(dir), ['app.js']);
    const runtime = path.join(dir, 'runtime.json');
    await fs.writeFile(runtime, JSON.stringify({ imports: { react:'/runtime/react.js', 'react/jsx-runtime':'/runtime/jsx.js', 'lucide-react':'/runtime/lucide.js' } }));
    run('tests/fixtures/App.tsx', '--out', output, '--runtime', runtime);
    assert.equal(await fs.readFile(output, 'utf8'), js);
    await fs.writeFile(runtime, JSON.stringify({ imports: {} }));
    assert.throws(() => run('tests/fixtures/App.tsx', '--out', output, '--runtime', runtime), /Missing host mapping/);
    const bad = path.join(dir, 'bad.tsx');
    await fs.writeFile(bad, 'import x from "not-installed"; export default function App(){return <div>{x}</div>}');
    assert.throws(() => run(bad, '--out', output), /not allowed/);
    await fs.writeFile(bad, 'import x from "./other"; export default function App(){return <div>{x}</div>}');
    assert.throws(() => run(bad, '--out', output), /cannot import local files/);
    await fs.writeFile(bad, 'import "some-library/style.css"; export default function App(){return <div/>}');
    assert.throws(() => run(bad, '--out', output), /Load library stylesheets in the host/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
