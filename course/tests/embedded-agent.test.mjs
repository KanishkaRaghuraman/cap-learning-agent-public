import {assertAuthorizationDenied} from '../extensions/node/12-agent/verification-support.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const apply=path.join(root,'extensions/node/apply.mjs');
const read=p=>readFileSync(p,'utf8');
function fixture(t){
 const dir=mkdtempSync(path.join(tmpdir(),'course-agent-'));
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 for(const folder of ['srv','db'])mkdirSync(path.join(dir,folder));
 writeFileSync(path.join(dir,'package.json'),JSON.stringify({type:'module'}));
 writeFileSync(path.join(dir,'srv/incidents-service.cds'),'service IncidentsService {}');
 writeFileSync(path.join(dir,'db/schema.cds'),'namespace incident.mgmt;');
 return dir;
}
function run(dir,stage){return spawnSync(process.execPath,[apply,dir,stage],{encoding:'utf8'});}
function ready(t){const dir=fixture(t);for(const stage of ['10-read-only','11-action'])assert.equal(run(dir,stage).status,0);return dir;}
test('Lesson 12 is explicitly additive and leaves earlier stage output intact',t=>{
 const dir=ready(t),cds=path.join(dir,'srv/incident-agent-service.cds'),js=path.join(dir,'srv/incident-agent-service.js');
 assert(!existsSync(path.join(dir,'srv/incident-assistant.cds')));
 const original=[read(cds),read(js)],pkg=JSON.parse(read(path.join(dir,'package.json')));
 assert.equal(run(dir,'12-agent').status,0);
 assert.deepEqual([read(cds),read(js)],original);
 const next=JSON.parse(read(path.join(dir,'package.json')));
 assert.deepEqual(next.cds,pkg.cds);assert.equal(next.dependencies['@cap-js/agents'],'0.9.7');
 assert.equal(run(dir,'12-agent').status,0,'Repeat application is safe');
});
test('Lesson 12 fails without lesson 11 and preserves conflicting auth or assistant files',t=>{
 const bare=fixture(t);assert.notEqual(run(bare,'12-agent').status,0);
 const dir=ready(t),p=path.join(dir,'package.json');
 const pkg=JSON.parse(read(p));pkg.cds.requires.auth={kind:'dummy'};writeFileSync(p,JSON.stringify(pkg));
 const before=read(p);assert.notEqual(run(dir,'12-agent').status,0);assert.equal(read(p),before);
 assert(!existsSync(path.join(dir,'srv/incident-assistant.cds')));
 const other=ready(t),assistant=path.join(other,'srv/incident-assistant.cds');writeFileSync(assistant,'custom assistant');
 assert.notEqual(run(other,'12-agent').status,0);assert.equal(read(assistant),'custom assistant');
});
test('Actual CAP plugin runtime boundaries (requires installed disposable fixture)',{skip:!process.env.COURSE_AGENT_FIXTURE},()=>{
 const result=spawnSync(process.execPath,[path.join(root,'extensions/node/12-agent/verify.mjs'),process.env.COURSE_AGENT_FIXTURE],{encoding:'utf8',timeout:60000});
 assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
 assert.match(result.stdout,/"liveModelVerified": false/);
});

test('Linked assistant, package and service directory cannot write outside the chosen app',t=>{
 for(const kind of ['assistant','package','srv']) {
  const dir=ready(t),outside=fixture(t),external=path.join(outside,'external.txt');
  writeFileSync(external,kind==='package'?read(path.join(dir,'package.json')):'external sentinel');
  const before=read(external),packageBefore=read(path.join(dir,'package.json'));
  const destination=path.join(dir,kind==='assistant'?'srv/incident-assistant.cds':kind==='package'?'package.json':'srv');
  if(kind!=='assistant')rmSync(destination,{recursive:true,force:true});
  symlinkSync(kind==='srv'?path.join(outside,'srv'):external,destination);
  const result=run(dir,'12-agent');assert.notEqual(result.status,0);assert.match(result.stderr,/Unsafe extension path/);
  assert.equal(read(external),before);
  if(kind!=='package')assert.equal(read(path.join(dir,'package.json')),packageBefore);
 }
});

test('Authorization evidence rejects unrelated HTTP and JSON-RPC errors',()=>{
 for(const status of [401,403])assert.doesNotThrow(()=>assertAuthorizationDenied({httpStatus:status,error:{code:status}},status));
 for(const result of [{httpStatus:500,error:{code:500}},{httpStatus:404,error:{code:404}},{error:{code:-32601,message:'Method not found'}},{error:{code:401}},{isError:true},{}]) {
  for(const expected of [401,403])assert.throws(()=>assertAuthorizationDenied(result,expected));
 }
 assert.throws(()=>assertAuthorizationDenied({httpStatus:401},403));
});

test('CommonJS foundations retain their module style through all extension stages',t=>{
 for(const type of [undefined,'commonjs']) {
  const dir=fixture(t),p=path.join(dir,'package.json');writeFileSync(p,JSON.stringify(type?{type}:{}));
  for(const stage of ['10-read-only','11-action','12-agent'])assert.equal(run(dir,stage).status,0,stage);
  const pkg=JSON.parse(read(p));assert.equal(pkg.type,type);
  const handler=read(path.join(dir,'srv/incident-agent-service.js'));
  assert.match(handler,/const cds = require/);assert.match(handler,/module.exports = class/);assert.doesNotMatch(handler,/export default|import cds/);
  assert.equal(run(dir,'11-action').status,0,'CommonJS reapplication recognizes its reviewed handler');
 }
});
