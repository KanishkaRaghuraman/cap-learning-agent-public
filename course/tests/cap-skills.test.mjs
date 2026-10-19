import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {CLIENTS, SKILLS, AUDIT_SNAPSHOT_SHA, createCapSkills, getPlan} from '../scripts/cap-skills.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-skills-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  return root;
}
function writeInstalled(root, client = 'codex') {
  const target = CLIENTS[client];
  for (const name of SKILLS) {
    const dir = path.join(root, target.directory, name);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${name}\n---\n`);
  }
  const refs = path.join(root, target.directory, 'cap-developer', 'references');
  fs.mkdirSync(refs, {recursive: true});
  for (const ref of ['cds-modeling.md', 'declarative.md', 'custom-logic.md', 'sample-data.md', 'nodejs.md', 'java.md']) fs.writeFileSync(path.join(refs, ref), '# reference');
  const lockPath = path.join(root, 'skills-lock.json');
  const lock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, 'utf8')) : {version: 1, skills: {}};
  for (const name of SKILLS) lock.skills[name] = {source: 'capire/skills', sourceType: 'github', computedHash: `${name}-hash`};
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
}

test('plan records the audited main snapshot, is project scoped, and does not invoke npm', t => {
  const root = fixture(t);
  let called = false;
  const api = createCapSkills({root, run() { called = true; }});
  const plan = api.plan('codex');
  assert.equal(called, false);
  assert.equal(plan.auditSnapshotSha, AUDIT_SNAPSHOT_SHA);
  assert.equal(plan.upstream, 'https://github.com/capire/skills.git');
  assert.match(plan.upstreamRef, /^main/);
  assert.deepEqual(plan.skills, SKILLS);
  assert.deepEqual(plan.command.slice(-4), ['--agent', 'codex', '--copy', '--yes']);
  assert.equal(plan.directory, '.agents/skills');
});
test('client aliases map to their project skill directories', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(CLIENTS).map(([key, value]) => [key, [value.agent, value.directory]])), {
    claude: ['claude-code', '.claude/skills'], codex: ['codex', '.agents/skills'], cursor: ['cursor', '.agents/skills'], vscode: ['github-copilot', '.agents/skills'],
  });
  assert.throws(() => getPlan('unknown', '--plan'), /Client must/);
});

test('install preserves unrelated skills and lock entries in an existing client directory', t => {
  const root = fixture(t);
  const existing = path.join(root, '.agents/skills');
  fs.mkdirSync(existing, {recursive: true});
  fs.writeFileSync(path.join(existing, 'keep.txt'), 'keep');
  fs.writeFileSync(path.join(root, 'skills-lock.json'), JSON.stringify({version: 1, skills: {unrelated: {source: 'other/repo', sourceType: 'github', computedHash: 'keep-hash'}}}));
  let called = false;
  const api = createCapSkills({root, run() { called = true; writeInstalled(root); }});
  const result = api.install('codex');
  assert.equal(result.status, 'installed');
  assert.equal(called, true);
  assert.equal(fs.readFileSync(path.join(existing, 'keep.txt'), 'utf8'), 'keep');
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'skills-lock.json'), 'utf8')).skills.unrelated.computedHash, 'keep-hash');
});

test('install refuses an existing requested skill before CLI', t => {
  const root = fixture(t);
  const existing = path.join(root, '.agents/skills/cap-developer');
  fs.mkdirSync(existing, {recursive: true});
  fs.writeFileSync(path.join(existing, 'SKILL.md'), 'user-owned');
  fs.writeFileSync(path.join(root, 'skills-lock.json'), JSON.stringify({version: 1, skills: {}}));
  let called = false;
  const api = createCapSkills({root, run() { called = true; }});
  assert.throws(() => api.install('codex'), /selected skill targets already exist/);
  assert.equal(called, false);
  assert.equal(fs.readFileSync(path.join(existing, 'SKILL.md'), 'utf8'), 'user-owned');
});

test('install refuses malformed or selected lock entries without mutation', t => {
  for (const contents of ['not-json', JSON.stringify({version: 1, skills: {'cap-developer': {source: 'existing'}}})]) {
    const root = fixture(t);
    const lockPath = path.join(root, 'skills-lock.json');
    fs.writeFileSync(lockPath, contents);
    let called = false;
    const api = createCapSkills({root, run() { called = true; }});
    assert.throws(() => api.install('codex'), /invalid skills-lock|already tracked/);
    assert.equal(called, false);
    assert.equal(fs.readFileSync(lockPath, 'utf8'), contents);
  }
});

test('install refuses symlinked client target before CLI', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, 'outside'));
  fs.symlinkSync(path.join(root, 'outside'), path.join(root, '.agents'), 'dir');
  let called = false;
  const api = createCapSkills({root, run() { called = true; }});
  assert.throws(() => api.install('codex'), /linked install path/);
  assert.equal(called, false);
});

test('failed CLI invocation leaves project unchanged', t => {
  const root = fixture(t);
  const api = createCapSkills({root, run() { throw new Error('offline'); }});
  assert.throws(() => api.install('codex'), /offline/);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('successful CLI install is verified in the selected client directory and never claims activation', t => {
  const root = fixture(t);
  const api = createCapSkills({root, run(args) { assert.ok(args.includes('--copy')); writeInstalled(root); return {status: 0}; }});
  const result = api.install('codex');
  assert.equal(result.status, 'installed');
  assert.equal(result.activated, false);
  assert.equal(api.verify('codex').status, 'installed');
});

test('verify reports absent skill files and references', t => {
  const root = fixture(t);
  const result = createCapSkills({root}).verify('codex');
  assert.equal(result.status, 'missing-or-invalid');
  assert.ok(result.missing.includes('cap-developer'));
  assert.ok(result.missing.includes('cap-developer/references/nodejs.md'));
  assert.equal(result.activated, false);
});

test('verify refuses skill directories reached through a symlinked ancestor', t => {
  const root = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-skills-outside-'));
  t.after(() => fs.rmSync(outside, {recursive: true, force: true}));
  fs.mkdirSync(path.join(outside, 'skills'));
  fs.symlinkSync(outside, path.join(root, '.agents'), 'dir');
  const result = createCapSkills({root}).verify('codex');
  assert.equal(result.status, 'missing-or-invalid');
  assert.deepEqual(result.invalid, ['.agents']);
  assert.equal(result.activated, false);
});
