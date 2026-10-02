#!/usr/bin/env node
// HTTP prerequisite evidence for lessons 3–9. Run only against a disposable local course app.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function parseLocalUrl(value) {
  const url = new URL(value);
  assert(['http:', 'https:'].includes(url.protocol), 'Use an HTTP(S) URL');
  assert(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Only literal loopback hosts or localhost are allowed');
  assert(!url.username && !url.password, 'Credentials in URLs are forbidden');
  assert(!url.search && !url.hash, 'The base URL cannot contain a query or fragment');
  assert(url.port && !['80', '443'].includes(url.port), 'Use an explicit local development port');
  // An origin discovers the standard Node/Java service paths; a service URL is also supported.
  assert(url.pathname === '/' || /^\/odata\/v4\/[\w-]+\/?$/.test(url.pathname), 'Supply an origin or one OData service URL');
  return url.href.replace(/\/$/, '');
}

export function parseArgs(args) {
  const options = { stage: 'full' };
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    assert(['--url', '--output', '--stage'].includes(key), `Unknown option: ${key}`);
    assert(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${key}`);
    assert(options[key.slice(2)] === undefined || key === '--stage', `Duplicate option: ${key}`);
    options[key.slice(2)] = args[++i];
  }
  assert(options.url, 'Usage: node course/scripts/verify-foundation.mjs --url http://localhost:4420 [--stage core|full] [--output report.json]');
  options.url = parseLocalUrl(options.url);
  assert(['core', 'full'].includes(options.stage), 'Stage must be core or full');
  return options;
}

export function summarize(results) {
  const failed = results.filter(result => result.pass !== true).map(result => result.name);
  return { total: results.length, passed: results.length - failed.length, failed, pass: results.length > 0 && failed.length === 0 };
}

export async function requestLocal(url, { method = 'GET', body, accept = 'application/json' } = {}) {
  // Never follow a redirect, including an OData nextLink to another origin.
  const target = new URL(url);
  parseLocalUrl(target.origin);
  const response = await fetch(target, {
    method, redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { accept, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const raw = await response.text();
  let data = raw;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* metadata and errors may be text */ }
  return { status: response.status, data };
}

const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const query = options => `?${new URLSearchParams(Object.entries(options).map(([key, value]) => [`$${key}`, String(value)])).toString().replaceAll('+', '%20')}`;
const incident = (id, active = true) => `/Incidents(ID=${id},IsActiveEntity=${active})`;
const business = row => Object.fromEntries(['ID', 'title', 'urgency', 'status', 'businessPartner_ID', 'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy'].map(key => [key, row[key]]));

export async function verifyFoundation({ url, stage = 'full' }) {
  url = parseLocalUrl(url);
  assert(['core', 'full'].includes(stage), 'Stage must be core or full');
  assert(process.env.NODE_ENV !== 'production', 'Refusing to run with NODE_ENV=production');
  const report = { version: 1, url, stage, startedAt: new Date().toISOString(), runId: randomUUID(), results: [], limitations: ['HTTP checks do not verify browser rendering, value-help search UI, source CSV equivalence, or production safety.'] };
  const results = report.results;
  const owned = new Map();
  let base;
  let namespace;
  const mark = (name, pass, details = {}) => results.push({ name, pass, ...details });
  const step = async (name, work) => {
    try { await work(); mark(name, true); }
    catch (error) { mark(name, false, { error: error.message }); }
  };
  const request = async (name, method, path, body, expected = [200]) => {
    const row = { name, request: { method, path, ...(body === undefined ? {} : { body }) }, expectedStatus: expected };
    results.push(row);
    try {
      const target = new URL(`${base}${path}`);
      assert.equal(target.origin, new URL(url).origin);
      const { status, data } = await requestLocal(target, { method, body });
      Object.assign(row, { status, response: data, pass: expected.includes(status) });
      assert(row.pass, `${name}: expected HTTP ${expected}, received ${status}`);
      return data;
    } catch (error) { row.pass = false; row.error = error.message; throw error; }
  };
  const read = (name, id, active = true, options) => request(name, 'GET', incident(id, active) + (options ? query(options) : ''), undefined);
  const action = (name, id, active, op, body = {}) => request(name, 'POST', `${incident(id, active)}/${namespace}.${op}`, body, [200, 201]);
  const newId = async (entity = 'Incidents') => {
    const id = randomUUID();
    const path = entity === 'Incidents' ? incident(id) : `/${entity}(${id})`;
    await request('confirm generated UUID is unused', 'GET', path, undefined, [404]);
    owned.set(id, entity);
    return id;
  };
  const create = async (label, fields = {}, activate = true) => {
    const id = await newId();
    const data = await request(`${label}: create draft`, 'POST', '/Incidents', { ID: id, title: `foundation-${report.runId} ${label}`, urgency: 'medium', status: 'new_', ...fields }, [201]);
    assert.equal(data.ID, id, 'Server must preserve the supplied disposable UUID');
    assert.equal(data.IsActiveEntity, false, 'Create must produce a draft');
    if (activate) await action(`${label}: activate`, id, false, 'draftActivate');
    return id;
  };
  const collection = async (name, path) => {
    const rows = [];
    const visited = new Set();
    for (let page = 0; path; page++) {
      assert(page < 100 && !visited.has(path), 'Unbounded/cyclic pagination');
      visited.add(path);
      const data = await request(`${name} page ${page + 1}`, 'GET', path, undefined);
      assert(Array.isArray(data.value), 'Expected OData value array');
      rows.push(...data.value);
      if (data['@odata.nextLink']) {
        const next = new URL(data['@odata.nextLink'], `${base}${path}`);
        assert.equal(next.origin, new URL(base).origin, 'Refusing external nextLink');
        assert(next.pathname.startsWith(`${new URL(base).pathname}/`), 'nextLink must stay within service');
        path = next.href.slice(base.length);
      } else path = null;
    }
    return rows;
  };

  try {
    const candidates = new URL(url).pathname === '/' ? [`${url}/odata/v4/incidents`, `${url}/odata/v4/IncidentsService`] : [url];
    const probes = [];
    for (const candidate of candidates) {
      try {
        const response = await requestLocal(`${candidate}/$metadata`, { accept: 'application/xml' });
        probes.push({ url: candidate, status: response.status });
        if (response.status !== 200 || typeof response.data !== 'string') continue;
        const xml = response.data;
        if (!['Incidents', 'BusinessPartners', 'ConversationMessages'].every(name => xml.includes(`EntitySet Name="${name}"`))) continue;
        // Course service name is fixed; verify its action rather than guessing an arbitrary namespace.
        assert(xml.includes('Namespace="IncidentsService"') && xml.includes('Name="draftEdit"') && xml.includes('Name="draftActivate"'), 'Required course draft actions missing');
        namespace = 'IncidentsService';
        base = candidate;
        report.serviceUrl = base;
        mark('discover course service and draft metadata', true, { probes });
        break;
      } catch (error) { probes.push({ url: candidate, error: error.message }); }
    }
    assert(base, `Course service discovery failed: ${JSON.stringify(probes)}`);

    let partners = [];
    await step('seed counts, UUID relationships and all enum values', async () => {
      const incidents = await collection('seed incidents', '/Incidents' + query({ filter: 'IsActiveEntity eq true' }));
      const messages = await collection('seed messages', '/ConversationMessages');
      partners = await collection('seed partners', '/BusinessPartners');
      assert(incidents.length >= 5 && messages.length >= 10 && partners.length >= 3, `Need >=5 incidents, >=10 messages, >=3 partners; got ${incidents.length}/${messages.length}/${partners.length}`);
      for (const rows of [incidents, messages, partners]) {
        assert(rows.every(row => uuid.test(row.ID)), 'Invalid UUID');
        assert.equal(new Set(rows.map(row => row.ID)).size, rows.length, 'Duplicate UUID');
      }
      const incidentIds = new Set(incidents.map(row => row.ID));
      const partnerIds = new Set(partners.map(row => row.ID));
      assert(incidents.every(row => row.businessPartner_ID == null || partnerIds.has(row.businessPartner_ID)), 'Orphaned partner reference');
      assert(messages.every(row => incidentIds.has(row.incident_ID)), 'Orphaned/missing message reference');
      for (const [field, values] of [['urgency', ['high', 'medium', 'low']], ['status', ['new_', 'assigned', 'closed']]]) {
        assert(incidents.every(row => values.includes(row[field])), `Invalid seed ${field}`);
        assert(values.every(value => incidents.some(row => row[field] === value)), `Missing seed ${field}`);
      }
    });

    await step('urgent create is elevated at activation', async () => {
      const id = await create('URGENT create', { urgency: 'low' });
      assert.equal((await read('urgent create readback', id)).urgency, 'high');
    });
    await step('normal create, active updates, closed protection and draft activation conflict', async () => {
      const id = await create('ordinary create');
      assert.equal((await read('ordinary create readback', id)).urgency, 'medium');
      const title = `foundation-${report.runId} uRgEnT updated`;
      await request('urgent active title PATCH', 'PATCH', incident(id), { title }, [200, 204]);
      const updated = await read('urgent PATCH independent readback', id);
      assert.equal(updated.urgency, 'high'); assert.equal(updated.title, title);
      await request('partial PATCH without title or ID', 'PATCH', incident(id), { status: 'assigned' }, [200, 204]);
      const partial = await read('partial PATCH independent readback', id);
      assert.equal(partial.title, title); assert.equal(partial.urgency, 'high'); assert.equal(partial.status, 'assigned');
      await request('close open incident once', 'PATCH', incident(id), { status: 'closed' }, [200, 204]);
      const closed = await read('closed snapshot', id);
      assert.equal(closed.status, 'closed');
      await request('reject closed title edit', 'PATCH', incident(id), { title: 'must not persist' }, [409]);
      await request('reject closed reopen', 'PATCH', incident(id), { status: 'new_' }, [409]);
      assert.deepEqual(business(await read('closed rejections preserve active data', id)), business(closed));
      await action('edit closed record as draft', id, true, 'draftEdit', { PreserveChanges: false });
      await request('closed draft can be edited before save', 'PATCH', incident(id, false), { title: 'must not activate', status: 'new_' }, [200, 204]);
      await request('closed draft activation conflicts', 'POST', `${incident(id, false)}/${namespace}.draftActivate`, {}, [409]);
      assert.deepEqual(business(await read('failed activation preserves active data', id)), business(closed));
      await request('discard closed verification draft', 'DELETE', incident(id, false), undefined, [204]);
    });
    await step('missing active PATCH returns 404 without upsert', async () => {
      const id = await newId();
      await request('missing PATCH', 'PATCH', incident(id), { title: `foundation-${report.runId} absent` }, [404]);
      await request('missing remains absent', 'GET', incident(id), undefined, [404]);
    });
    await step('partner service rejects writes', async () => {
      const id = await newId('BusinessPartners');
      await request('reject synthetic partner POST', 'POST', '/BusinessPartners', { ID: id, businessPartnerId: report.runId, name: 'Synthetic verification partner' }, [403, 405]);
      await request('rejected partner remains absent', 'GET', `/BusinessPartners(${id})`, undefined, [404]);
    });
    for (const field of ['urgency', 'status']) await step(`invalid ${field} rejected`, async () => {
      const id = await newId();
      const data = await request(`invalid ${field} draft create`, 'POST', '/Incidents', { ID: id, title: `foundation-${report.runId} invalid ${field}`, urgency: 'medium', status: 'new_', [field]: 'not-a-course-enum' }, [201, 400]);
      const response = results.at(-1);
      if (response.status === 201) {
        assert.equal(data.ID, id);
        await request(`invalid ${field} activation rejected`, 'POST', `${incident(id, false)}/${namespace}.draftActivate`, {}, [400]);
      }
      await request(`invalid ${field} has no active record`, 'GET', incident(id), undefined, [404]);
    });
    await step('selected partner UUID persists through activation and expansion', async () => {
      assert(partners.length, 'No partners available from seed discovery');
      const partner = partners[0];
      const id = await create('partner selection', { businessPartner_ID: partner.ID });
      const saved = await read('partner association readback', id, true, { expand: 'businessPartner' });
      assert.equal(saved.businessPartner_ID, partner.ID);
      assert.equal(saved.businessPartner.ID, partner.ID);
      assert.equal(saved.businessPartner.businessPartnerId, partner.businessPartnerId);
      assert.equal(saved.businessPartner.name, partner.name);
    });

    if (stage === 'full') await step('criticality projection, active/draft mapping, paging and counts', async () => {
      for (const active of [true, false]) {
        const cases = [];
        for (const [urgency, criticality] of [['high', 1], ['medium', 2], ['low', 3], [null, 0]]) {
          const id = await create(`criticality ${active ? 'active' : 'draft'} ${urgency}`, { urgency }, active);
          cases.push({ id, urgency, criticality });
        }
        for (const expected of cases) {
          for (const select of ['ID,criticality', 'ID,urgency,criticality', 'ID,title']) {
            const row = await read(`criticality ${active}/${expected.urgency}/${select}`, expected.id, active, { select });
            assert.equal(row.ID, expected.id);
            if (select.includes('criticality')) assert.equal(row.criticality, expected.criticality);
            else assert(!Object.hasOwn(row, 'criticality'), 'Excluded criticality leaked');
            if (select.includes('urgency')) assert.equal(row.urgency, expected.urgency);
            else assert(!Object.hasOwn(row, 'urgency'), 'Helper urgency leaked');
          }
        }
        const filter = `IsActiveEntity eq ${active} and (${cases.map(({ id }) => `ID eq ${id}`).join(' or ')})`;
        const sorted = [...cases].sort((a, b) => a.id.localeCompare(b.id));
        for (const select of ['ID,criticality', 'ID,urgency,criticality', 'ID,title']) {
          const data = await request(`criticality collection ${active}/${select}`, 'GET', '/Incidents' + query({ select, filter, orderby: 'ID', top: 2, skip: 1, count: true }), undefined);
          // OData 4.01 permits the shortened control-information name used by CAP Java.
          assert.equal(data['@odata.count'] ?? data['@count'], 4);
          assert.deepEqual(data.value.map(row => row.ID), sorted.slice(1, 3).map(row => row.id));
          for (const row of data.value) {
            const expected = cases.find(test => test.id === row.ID);
            if (select.includes('criticality')) assert.equal(row.criticality, expected.criticality);
            else assert(!Object.hasOwn(row, 'criticality'), 'Collection criticality leaked');
            if (select.includes('urgency')) assert.equal(row.urgency, expected.urgency);
            else assert(!Object.hasOwn(row, 'urgency'), 'Collection helper urgency leaked');
          }
        }
        assert.equal(Number(await request(`direct ${active} count`, 'GET', '/Incidents/$count' + query({ filter }), undefined)), 4);
        assert.equal(Number(await request(`filtered ${active} count`, 'GET', '/Incidents/$count' + query({ filter: `${filter} and urgency eq 'high'` }), undefined)), 1);
      }
    });
  } catch (error) { mark('prerequisite verification aborted', false, { error: error.message }); }
  finally {
    for (const [id, entity] of owned) await step(`cleanup ${entity} ${id}`, async () => {
      if (entity === 'Incidents') {
        await request('cleanup own draft', 'DELETE', incident(id, false), undefined, [204, 404]);
        await request('cleanup own active incident', 'DELETE', incident(id), undefined, [204, 404]);
        await request('verify own active removed', 'GET', incident(id), undefined, [404]);
        await request('verify own draft removed', 'GET', incident(id, false), undefined, [404]);
      } else {
        // A read-only rejection should leave no partner. If a broken app accepted it, try only this run's UUID.
        const path = `/${entity}(${id})`;
        const data = await request('check own synthetic partner absent', 'GET', path, undefined, [200, 404]);
        if (data && results.at(-1).status === 200) {
          await request('cleanup unexpected own partner', 'DELETE', path, undefined, [204]);
          await request('verify own partner removed', 'GET', path, undefined, [404]);
        }
      }
    });
  }
  report.finishedAt = new Date().toISOString();
  report.summary = summarize(results);
  return report;
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const report = await verifyFoundation(options);
  const json = JSON.stringify(report, null, 2) + '\n';
  if (options.output) {
    const output = resolve(options.output);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, json);
    console.log(JSON.stringify({ ...report.summary, output }, null, 2));
  } else console.log(json);
  return report.summary.pass ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.exitCode = await main(); }
  catch (error) { console.error(JSON.stringify({ pass: false, error: error.message })); process.exitCode = 1; }
}
