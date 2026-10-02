import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const apply=fileURLToPath(new URL('../extensions/node/apply.mjs',import.meta.url));
const read=p=>readFileSync(p,'utf8');
function fixture(t,type){const dir=mkdtempSync(path.join(tmpdir(),'preview-stages-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));for(const folder of ['srv','db'])mkdirSync(path.join(dir,folder));writeFileSync(path.join(dir,'package.json'),JSON.stringify({...(type?{type}:{})}));writeFileSync(path.join(dir,'srv/incidents-service.cds'),'service IncidentsService {}');writeFileSync(path.join(dir,'db/schema.cds'),'namespace incident.mgmt;');return dir;}
const run=(dir,stage)=>spawnSync(process.execPath,[apply,dir,stage],{encoding:'utf8'});
const okay=(dir,stage)=>{const r=run(dir,stage);assert.equal(r.status,0,r.stderr);};
for(const type of [undefined,'module'])test(`Preview stages preserve foundation and are idempotent (${type||'commonjs'})`,t=>{
 const dir=fixture(t,type);okay(dir,'10-read-only');const original=read(path.join(dir,'srv/incident-agent-service.cds'));
 okay(dir,'10-preview');okay(dir,'10-preview');assert.equal(read(path.join(dir,'srv/incident-agent-service.cds')),original);
 assert.equal(JSON.parse(read(path.join(dir,'package.json'))).dependencies['@cap-js/agents'],'0.9.7');
 okay(dir,'11-action');const action=read(path.join(dir,'srv/incident-agent-service.cds'));const handler=read(path.join(dir,'srv/incident-agent-service.js'));
 okay(dir,'11-preview-action');okay(dir,'11-preview-action');assert.equal(read(path.join(dir,'srv/incident-agent-service.cds')),action);assert.equal(read(path.join(dir,'srv/incident-agent-service.js')),handler);
 assert.match(read(path.join(dir,'srv/incident-assistant.cds')),/@agent.hitl/);
 assert.match(read(path.join(dir,'srv/incident-assistant.js')),/extends IncidentAgentService/);
 for(const stage of ['10-preview','12-agent'])assert.notEqual(run(dir,stage).status,0,'Cannot remove action preview');
 assert.match(read(path.join(dir,'srv/incident-assistant.cds')),/@agent.hitl/);
});
test('Preview rejects missing stages, conflicting source and disabled per-action tools without writes',t=>{
 const dir=fixture(t);assert.notEqual(run(dir,'10-preview').status,0);okay(dir,'10-read-only');okay(dir,'11-action');assert.notEqual(run(dir,'11-preview-action').status,0);
 const other=fixture(t);okay(other,'10-read-only');const pkg=path.join(other,'package.json');const before=read(pkg);writeFileSync(path.join(other,'srv/incident-assistant.cds'),'custom');assert.notEqual(run(other,'10-preview').status,0);assert.equal(read(pkg),before);assert.equal(read(path.join(other,'srv/incident-assistant.cds')),'custom');
 const disabled=fixture(t);okay(disabled,'10-read-only');const pp=path.join(disabled,'package.json');const p=JSON.parse(read(pp));p.cds.agents={per_action_tool:false};writeFileSync(pp,JSON.stringify(p));const previous=read(pp);assert.notEqual(run(disabled,'10-preview').status,0);assert.equal(read(pp),previous);assert(!existsSync(path.join(disabled,'srv/incident-assistant.cds')));
});
