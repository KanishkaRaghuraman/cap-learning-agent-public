import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const installer=fileURLToPath(new URL('../scripts/install-fiori-chat.mjs',import.meta.url));
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'optional-fiori-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const web=path.join(dir,'app/incidents/webapp');fs.mkdirSync(web,{recursive:true});fs.mkdirSync(path.join(dir,'srv'));
 fs.writeFileSync(path.join(dir,'srv/incident-assistant.cds'),'service IncidentAssistant {}');
 const manifest={'sap.app':{id:'test.incidents'},'sap.ui5':{routing:{targets:{IncidentsList:{name:'sap.fe.templates.ListReport',options:{settings:{entitySet:'Incidents',content:{header:{actions:{Existing:{text:'Keep me'}}}}}}}}}}};
 const file=path.join(web,'manifest.json');fs.writeFileSync(file,JSON.stringify(manifest));
 return {dir,web,file,manifest,save:()=>fs.writeFileSync(file,JSON.stringify(manifest)),read:()=>fs.readFileSync(file,'utf8')};
}
const run=(f,opt=true)=>spawnSync(process.execPath,[installer,f.dir,...(opt?['--opt-in']:[])],{encoding:'utf8'});
const settings=f=>f.manifest['sap.ui5'].routing.targets.IncidentsList.options.settings;
test('Optional chat refuses absent opt-in or absent backend without writes',t=>{
 for(const missing of ['opt-in','backend']){
  const f=fixture(t),before=f.read();if(missing==='backend')fs.rmSync(path.join(f.dir,'srv/incident-assistant.cds'));
  const r=run(f,missing!=='opt-in');assert.notEqual(r.status,0);assert.match(r.stderr,missing==='opt-in'?/opts in/:/backend first/);
  assert.equal(f.read(),before);assert(!fs.existsSync(path.join(f.web,'ext')));
 }
});
test('Optional chat installs idempotently and preserves unrelated manifest content',t=>{
 const f=fixture(t);assert.equal(run(f).status,0);
 const saved=JSON.parse(f.read()),actions=saved['sap.ui5'].routing.targets.IncidentsList.options.settings.content.header.actions;
 assert.deepEqual(actions.Existing,{text:'Keep me'});assert.equal(actions.IncidentAssistant.press,'test.incidents.ext.IncidentChat.open');
 assert.equal(saved['sap.ui5'].routing.targets.IncidentsList.options.settings.entitySet,'Incidents');
 const before=f.read(),handler=fs.readFileSync(path.join(f.web,'ext/IncidentChat.js'),'utf8');
 assert.equal(run(f).status,0);assert.equal(f.read(),before);assert.equal(fs.readFileSync(path.join(f.web,'ext/IncidentChat.js'),'utf8'),handler);
});
test('Optional chat preserves edited handler and conflicting existing action',t=>{
 for(const kind of ['handler','action']){
  const f=fixture(t);if(kind==='handler'){fs.mkdirSync(path.join(f.web,'ext'));fs.writeFileSync(path.join(f.web,'ext/IncidentChat.js'),'learner changes');}
  else {settings(f).content.header.actions.IncidentAssistant={text:'Learner action'};f.save();}
  const before=f.read();assert.notEqual(run(f).status,0);assert.equal(f.read(),before);
  if(kind==='handler')assert.equal(fs.readFileSync(path.join(f.web,'ext/IncidentChat.js'),'utf8'),'learner changes');
 }
});
test('Optional chat refuses linked destinations, including broken symlinks',t=>{
 for(const broken of [false,true]){
  const f=fixture(t),outside=fs.mkdtempSync(path.join(os.tmpdir(),'fiori-outside-'));t.after(()=>fs.rmSync(outside,{recursive:true,force:true}));
  const sentinel=path.join(outside,'sentinel');fs.writeFileSync(sentinel,'keep');
  fs.symlinkSync(broken?path.join(outside,'missing'):outside,path.join(f.web,'ext'));
  const before=f.read(),r=run(f);assert.notEqual(r.status,0);assert.match(r.stderr,/Refusing symlink/);assert.equal(f.read(),before);assert.equal(fs.readFileSync(sentinel,'utf8'),'keep');
 }
});
test('Optional chat rejects malformed existing header without rewriting manifest',t=>{
 for(const malformed of [null,'custom',[]]){
  const f=fixture(t);settings(f).content.header=malformed;f.save();const before=f.read();
  const r=run(f);assert.notEqual(r.status,0);assert.match(r.stderr,/Unsupported existing header structure/);assert.equal(f.read(),before);assert(!fs.existsSync(path.join(f.web,'ext')));
 }
});
