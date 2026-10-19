import {spawnSync} from 'node:child_process';
import {existsSync, lstatSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';

export const AUDIT_SNAPSHOT_SHA = 'b6866e873d28c3fce4e1a2bdea6b919ad6340dc1';
export const UPSTREAM_SHA = AUDIT_SNAPSHOT_SHA;
export const UPSTREAM = 'https://github.com/capire/skills.git';
export const SKILLS_CLI = 'skills@1.7.2';
export const SKILLS = ['cap-developer', 'cap-add-remote-service', 'cap-trivia', 'cap-upgrade'];
export const CLIENTS = {
  claude: {agent: 'claude-code', directory: '.claude/skills'},
  codex: {agent: 'codex', directory: '.agents/skills'},
  cursor: {agent: 'cursor', directory: '.agents/skills'},
  vscode: {agent: 'github-copilot', directory: '.agents/skills'},
};
const REFERENCES = ['cds-modeling.md', 'declarative.md', 'custom-logic.md', 'sample-data.md', 'nodejs.md', 'java.md'];

function present(file) {
  try { lstatSync(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
function symlink(file) {
  try { return lstatSync(file).isSymbolicLink(); } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
function linkedPath(root, target) {
  for (let directory = target; directory !== root; directory = path.dirname(directory)) if (symlink(directory)) return directory;
  return null;
}

export function getPlan(client, mode, root = process.cwd()) {
  const target = CLIENTS[client];
  if (!target) throw new Error('Client must be one of: claude, codex, cursor, vscode');
  if (!['--plan', '--install', '--verify'].includes(mode)) throw new Error('Mode must be --plan, --install, or --verify');
  return {
    client, agent: target.agent, mode, root, upstream: UPSTREAM, upstreamRef: 'main (resolved by Skills CLI at install time)', auditSnapshotSha: AUDIT_SNAPSHOT_SHA,
    skills: [...SKILLS], directory: target.directory,
    command: ['npx', '--yes', SKILLS_CLI, 'add', UPSTREAM, ...SKILLS.flatMap(name => ['--skill', name]), '--agent', target.agent, '--copy', '--yes'],
  };
}

function preflight(plan) {
  const targetDirectory = path.join(plan.root, plan.directory);
  for (let directory = targetDirectory; directory !== plan.root; directory = path.dirname(directory)) {
    if (symlink(directory)) throw new Error(`Refusing linked install path: ${path.relative(plan.root, directory)}`);
  }
  const conflicts = SKILLS.filter(skill => {
    const destination = path.join(targetDirectory, skill);
    return symlink(destination) || present(destination);
  }).map(skill => path.relative(plan.root, path.join(targetDirectory, skill)));
  if (conflicts.length) throw new Error(`Refusing install because selected skill targets already exist (${conflicts.join(', ')}). Use --verify to inspect existing skills; this helper does not overwrite or update them.`);
  const lockPath = path.join(plan.root, 'skills-lock.json');
  if (!present(lockPath)) return {lockPath, priorLock: null};
  if (symlink(lockPath)) throw new Error('Refusing linked skills-lock.json.');
  let lock;
  try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); } catch { throw new Error('Refusing invalid skills-lock.json; repair the Skills CLI state before installing.'); }
  if (!lock || lock.version !== 1 || !lock.skills || typeof lock.skills !== 'object' || Array.isArray(lock.skills)) throw new Error('Refusing unsupported skills-lock.json schema; preserve or reconcile existing Skills CLI state before installing.');
  const collisions = SKILLS.filter(name => Object.hasOwn(lock.skills, name));
  if (collisions.length) throw new Error(`Refusing selected skills already tracked in skills-lock.json (${collisions.join(', ')}); use --verify or explicit native CLI update.`);
  return {lockPath, priorLock: structuredClone(lock)};
}

export function verify(client, root = process.cwd()) {
  const plan = getPlan(client, '--verify', root);
  const missing = [];
  const invalid = [];
  const linkedDirectory = linkedPath(root, path.join(root, plan.directory));
  if (linkedDirectory) invalid.push(path.relative(root, linkedDirectory));
  for (const name of SKILLS) {
    const folder = path.join(root, plan.directory, name);
    const skillFile = path.join(folder, 'SKILL.md');
    if (symlink(folder) || symlink(skillFile)) { invalid.push(path.relative(root, folder)); continue; }
    if (!existsSync(skillFile)) { missing.push(name); continue; }
    if (!lstatSync(skillFile).isFile()) { invalid.push(path.relative(root, skillFile)); continue; }
  }
  const refRoot = path.join(root, plan.directory, 'cap-developer', 'references');
  if (symlink(refRoot)) invalid.push(path.relative(root, refRoot));
  for (const ref of REFERENCES) {
    const file = path.join(refRoot, ref);
    if (symlink(file)) invalid.push(path.relative(root, file));
    else if (!existsSync(file)) missing.push(`cap-developer/references/${ref}`);
    else if (!lstatSync(file).isFile()) invalid.push(path.relative(root, file));
  }
  if (missing.length || invalid.length) return {status: 'missing-or-invalid', client, directory: plan.directory, missing, invalid, activated: false};
  return {status: 'installed', client, directory: plan.directory, skills: [...SKILLS], upstream: UPSTREAM, upstreamRef: 'main (resolved by Skills CLI at install time)', auditSnapshotSha: AUDIT_SNAPSHOT_SHA, activated: false, note: 'Skill files are present in the selected agent directory; runtime activation has not been verified.'};
}

function runNpx(args, root) {
  const windows = process.platform === 'win32';
  const result = spawnSync(windows ? 'cmd.exe' : 'npx', windows ? ['/d', '/s', '/c', 'npx', ...args] : args, {
    cwd: root, encoding: 'utf8', timeout: 180000, windowsHide: true, shell: false,
  });
  if (result.error || result.status !== 0) {
    const detail = (result.error?.message || result.stderr || result.stdout || `exit ${result.status}${result.signal ? ` (${result.signal})` : ''}`)
      .replace(/\u001b\[[0-9;]*m/g, '').trim().slice(-1200);
    throw new Error(`Skills CLI install failed: ${detail || `exit ${result.status}`}. Partial files may remain; inspect with --verify before retrying.`);
  }
  return result;
}

export function createCapSkills({root = process.cwd(), run = runNpx} = {}) {
  return {
    plan(client) { return getPlan(client, '--plan', root); },
    verify(client) { return verify(client, root); },
    install(client) {
      const plan = getPlan(client, '--install', root);
      const {lockPath, priorLock} = preflight(plan);
      run(plan.command.slice(1), root);
      const result = verify(client, root);
      if (result.status !== 'installed') throw new Error(`Skills CLI exited successfully but required files are missing or invalid: ${[...result.missing, ...result.invalid].join(', ')}`);
      if (symlink(lockPath) || !present(lockPath)) throw new Error('Skills CLI did not leave a regular skills-lock.json; installation cannot be recorded.');
      let lock;
      try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); } catch { throw new Error('Skills CLI produced an invalid skills-lock.json.'); }
      if (!lock || lock.version !== 1 || !lock.skills || typeof lock.skills !== 'object' || Array.isArray(lock.skills)) throw new Error('Skills CLI produced an unsupported skills-lock.json schema.');
      if (priorLock) for (const [name, entry] of Object.entries(priorLock.skills)) {
        if (!isDeepStrictEqual(lock.skills[name], entry)) throw new Error(`Skills CLI changed unrelated lock entry ${name}; inspect skills-lock.json before continuing.`);
      }
      const missingLockEntries = SKILLS.filter(name => !Object.hasOwn(lock.skills, name));
      if (missingLockEntries.length) throw new Error(`Skills CLI did not record required skills in skills-lock.json: ${missingLockEntries.join(', ')}`);
      const resolvedSkillHashes = Object.fromEntries(SKILLS.map(name => [name, lock.skills[name].computedHash]).filter(([, hash]) => typeof hash === 'string'));
      return {...result, resolvedSkillHashes, unrelatedLockEntriesPreserved: Object.keys(priorLock?.skills || {}).length};
    },
  };
}

export function main(args = process.argv.slice(2), root = process.cwd()) {
  if (args.length !== 2) throw new Error('Usage: node course/scripts/cap-skills.mjs <claude|codex|cursor|vscode> --plan|--install|--verify');
  const [client, mode] = args;
  const api = createCapSkills({root});
  const result = mode === '--plan' ? api.plan(client) : mode === '--verify' ? api.verify(client) : mode === '--install' ? api.install(client) : (() => { throw new Error('Mode must be --plan, --install, or --verify'); })();
  console.log(JSON.stringify(result, null, 2));
  if (mode === '--verify' && result.status !== 'installed') process.exitCode = 1;
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(`CAP skills: ${error.message}`); process.exitCode = 1; }
}
