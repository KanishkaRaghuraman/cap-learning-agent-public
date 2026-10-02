import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseLocalUrl, requestLocal, summarize, verifyFoundation } from '../scripts/verify-foundation.mjs';

test('accepts explicit local origins and runtime-specific service paths', () => {
  assert.equal(parseLocalUrl('http://localhost:4420/'), 'http://localhost:4420');
  assert.equal(parseLocalUrl('http://127.0.0.1:8080/odata/v4/IncidentsService/'), 'http://127.0.0.1:8080/odata/v4/IncidentsService');
  assert.equal(parseLocalUrl('http://[::1]:4420'), 'http://[::1]:4420');
  assert.deepEqual(parseArgs(['--url', 'http://localhost:4420', '--stage', 'core', '--output', 'a.json']), { url: 'http://localhost:4420', stage: 'core', output: 'a.json' });
});

test('rejects remote hosts, misleading local names, credentials and ambiguous targets before fetch', () => {
  for (const url of ['https://example.com:4420', 'http://localhost.example.com:4420', 'http://127.0.0.2:4420', 'http://0.0.0.0:4420', 'http://localhost', 'http://localhost:80', 'http://user:secret@localhost:4420', 'ftp://localhost:4420', 'http://localhost:4420/?x=1', 'http://localhost:4420/#x', 'http://localhost:4420/admin']) {
    assert.throws(() => parseLocalUrl(url), undefined, url);
  }
  for (const args of [[], ['--url'], ['--url', 'http://localhost:4420', '--stage', 'skip'], ['--url', 'http://localhost:4420', '--force']]) assert.throws(() => parseArgs(args));
});

test('report fails closed on empty, failed or unclassified results', () => {
  assert.equal(summarize([]).pass, false);
  assert.deepEqual(summarize([{ name: 'read', pass: true }, { name: 'assertion', pass: false }, { name: 'interrupted' }]), { total: 3, passed: 1, failed: ['assertion', 'interrupted'], pass: false });
});

async function serverFor(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('redirect response is never followed, even to another local endpoint', async t => {
  let redirectedRequests = 0;
  const url = await serverFor(t, (req, res) => {
    if (req.url === '/redirected') { redirectedRequests++; res.end('{}'); }
    else { res.writeHead(302, { location: '/redirected' }); res.end(); }
  });
  await assert.rejects(requestLocal(url));
  assert.equal(redirectedRequests, 0);
});

test('unavailable course service produces failed evidence and no mutations', async t => {
  const methods = [];
  const url = await serverFor(t, (req, res) => { methods.push(req.method); res.writeHead(404); res.end('not a course app'); });
  const report = await verifyFoundation({ url, stage: 'core' });
  assert.equal(report.summary.pass, false);
  assert(report.results.some(row => row.error?.includes('discovery failed')));
  assert.deepEqual(methods, ['GET', 'GET']);
  assert.equal(report.stage, 'core');
  assert(report.finishedAt);
});


test('CLI writes failed HTTP evidence and exits nonzero', async t => {
  const url = await serverFor(t, (_req, res) => { res.writeHead(503); res.end('startup incomplete'); });
  const directory = await mkdtemp(join(tmpdir(), 'foundation-report-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, 'report.json');
  const result = await new Promise(resolve => execFile(process.execPath, [fileURLToPath(new URL('../scripts/verify-foundation.mjs', import.meta.url)), '--url', url, '--output', output], (error, stdout, stderr) => resolve({ error, stdout, stderr })));
  assert.equal(result.error?.code, 1);
  const report = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(report.summary.pass, false);
  assert.equal(report.stage, 'full');
  assert.equal(JSON.parse(result.stdout).output, output);
  assert.equal(result.stderr, '');
});
