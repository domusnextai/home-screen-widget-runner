import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root = new URL('../', import.meta.url);
const run = (...args) => execFileSync(process.execPath, ['scripts/widget-cli.mjs', ...args], {cwd: root, encoding: 'utf8', stdio: 'pipe'});
test('CLI exposes its version and bundled preview resources', async () => {
  assert.equal(run('--version').trim(), '1.0.1');
  assert.equal(JSON.parse(await fs.readFile(path.join(run('--host-dir').trim(), 'versions.json'), 'utf8')).react, '18.3.1');
  await fs.access(run('--preview-script').trim());
});
test('CLI builds TSX and rejects invalid component exports and required props', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'widget-cli-'));
  try {
    const input=path.join(dir,'Widget.tsx'), output=path.join(dir,'widget.js');
    await fs.writeFile(input, 'export default function App(){return <div className="p-8">Hello</div>}');
    run(input,'--out',output);
    assert.match(await fs.readFile(output,'utf8'), /Hello/);
    for (const source of ['export default 123;', 'export default function App(props:{name:string}){return <div>{props.name}</div>}']) {
      await fs.writeFile(input,source);
      assert.throws(()=>run(input,'--out',output), /TS\d+/);
    }
  } finally { await fs.rm(dir,{recursive:true,force:true}); }
});
