#!/usr/bin/env node
// A local evidence index for the experienced route. It never generates app code,
// executes receipt contents, or substitutes a receipt for real verification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const requiredChecks = ['environment','development-mcp','scaffold','metadata-import','model-compile','model-discovery','synthetic-data','handler-implementation','http-regression','deferred-checks','fiori-generation','ui-build','ui-details','manifest-validation','criticality','value-help','draft-save-discard','browser-journey','foundation-regression','no-early-mcp'];
export const SPEC_REVISION = 'single-chat-2026-09-30';
export function createPreparation(root) {
 root=fs.realpathSync(root);
 const journal=path.join(root,'memory-bank/preparation.json');
 const runtimeCheck = runtime => {if(!['nodejs','java'].includes(runtime))throw Error('Runtime must be nodejs or java');};
 function local(relative) {
  if(typeof relative!=='string'||!relative||path.isAbsolute(relative))throw Error('Evidence must use a course-relative path');
  const p=fs.realpathSync(path.resolve(root,relative));
  if(!p.startsWith(root+path.sep)||!fs.statSync(p).isFile())throw Error('Evidence must be a file inside this course');
  return p;
 }
 function plan(runtime) {
  runtimeCheck(runtime);
  return {runtime, spec:'course/docs/INCIDENT-APP-SPEC.md', specRevision:SPEC_REVISION, checks:requiredChecks};
 }
 function recipe(runtime) {
  runtimeCheck(runtime);
  return Object.fromEntries(['course/docs/INCIDENT-APP-SPEC.md','course/BUILDER.md','course/scripts/prepare-course.mjs','course/scripts/verify-foundation.mjs'].map(p=>[p,sha(fs.readFileSync(local(p)))]));
 }
 const read=()=>JSON.parse(fs.readFileSync(local('memory-bank/preparation.json'),'utf8'));
 function stateMatches(runtime) {
  const state=fs.readFileSync(local('memory-bank/activeContext.md'),'utf8');
  if(!/^learningPath: application-mcp$/m.test(state)||!new RegExp(`^runtime: ${runtime}$`,'m').test(state))throw Error('Select the application-mcp route and matching runtime first');
 }
 function write(s) {
  const dir=fs.realpathSync(path.dirname(journal));if(!dir.startsWith(root+path.sep))throw Error('State directory must remain inside this course');
  const tmp=path.join(dir,`preparation.json.${crypto.randomUUID()}.tmp`);
  fs.writeFileSync(tmp,JSON.stringify(s,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,journal);return s;
 }
 function validate(s) {
  if(s.version!==2)throw Error('Historical preparation journal: use reopen for an existing-app contract check; never replay lessons');
  runtimeCheck(s.runtime); stateMatches(s.runtime);
  if(s.status==='ready-for-10'&&JSON.stringify(s.app)!==JSON.stringify(snapshot()))throw Error('App changed since verification; revalidate before handover');
  if(JSON.stringify(s.recipe)!==JSON.stringify(recipe(s.runtime)))throw Error('Recipe changed: revalidate the existing app; preserve the old journal');
  if(s.receipt) {
   if(sha(fs.readFileSync(local(s.receipt.path)))!==s.receipt.hash)throw Error('Receipt changed; revalidate it');
   for(const [p,h] of Object.entries(s.receipt.evidence))if(sha(fs.readFileSync(local(p)))!==h)throw Error(`Evidence changed: ${p}`);
  }
  return s;
 }
 function snapshot() {
  const app=path.join(root,'IncidentManagement');if(!fs.existsSync(app))throw Error('IncidentManagement app is missing');
  if(fs.lstatSync(app).isSymbolicLink())throw Error('App root cannot be a symlink');
  const out={};const excluded=new Set(['node_modules','.git','target','gen','dist','.cds-services.json']);
  function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
   if(excluded.has(d.name)||/\.(db|sqlite|log)(-|$)/.test(d.name))continue;
   const p=path.join(dir,d.name);if(d.isSymbolicLink())throw Error('App snapshot does not follow symlinks');
   if(d.isDirectory())walk(p);else if(d.isFile())out[path.relative(root,p).split(path.sep).join('/')]=sha(fs.readFileSync(p));
  }}walk(app);
  if(!Object.keys(out).length)throw Error('App source is empty');
  return out;
 }
 return {
  plan, snapshot,
  history() {return read();},
  start(runtime) {
   runtimeCheck(runtime);
   stateMatches(runtime);
   if(fs.existsSync(journal)){const s=validate(read());if(s.runtime!==runtime)throw Error('Existing preparation runtime differs; preserve and reconcile');return s;}
   return write({version:2,runtime,specRevision:SPEC_REVISION,status:'building',recipe:recipe(runtime)});
  },
  reopen() {
   // Recheck the current app without rebuilding it. Keep an immutable audit copy.
   const s=read();runtimeCheck(s.runtime);stateMatches(s.runtime);
   if(![1,2].includes(s.version))throw Error('Unknown preparation journal version');
   const dir=fs.realpathSync(path.dirname(journal));if(!dir.startsWith(root+path.sep))throw Error('State directory must remain inside this course');
   const backup=path.join(dir,`preparation.json.${Date.now()}.${crypto.randomUUID()}.backup`);
   fs.writeFileSync(backup,JSON.stringify(s,null,2)+'\n',{flag:'wx'});
   return write({version:2,runtime:s.runtime,specRevision:SPEC_REVISION,status:'building',recipe:recipe(s.runtime),revalidates:path.basename(backup)});
  },
  record(receipt) {
   const s=validate(read());if(s.status==='ready-for-10')throw Error('Preparation already verified; inspect status before revalidation');

   const content=fs.readFileSync(local(receipt));const r=JSON.parse(content);
   if(r.version!==2||r.specRevision!==SPEC_REVISION||r.runtime!==s.runtime)throw Error('Receipt version/spec/runtime mismatch');
   if(!r.versions||Array.isArray(r.versions)||typeof r.versions!=='object'||!Object.keys(r.versions).length||Object.values(r.versions).some(v=>typeof v!=='string'||!v.trim()))throw Error('Actual runtime/tool versions required');
   if(!r.preview||!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/.test(r.preview.url)||r.preview.status!=='running')throw Error('Observed running local preview required');
   if(!Array.isArray(r.recovery))throw Error('Recovery history required (empty if none)');
   if(JSON.stringify(r.app)!==JSON.stringify(snapshot()))throw Error('Receipt app snapshot differs from current app');
   if(!Array.isArray(r.pendingChecks)||r.pendingChecks.length)throw Error('Receipt contains pending checks or omits pendingChecks');
   if(!Array.isArray(r.checks)||!requiredChecks.every(n=>r.checks.some(c=>c.name===n)))throw Error('Required check groups missing');
   const evidence={}; const sourceEvidence={};
   const stateDir=fs.realpathSync(path.dirname(journal));
   if(!stateDir.startsWith(root+path.sep))throw Error('State directory must remain inside this course');
   const captureDir=fs.mkdtempSync(path.join(stateDir,'preparation-evidence-'));
   for(const c of r.checks){if(c.status!=='passed'||!Array.isArray(c.evidence)||!c.evidence.length)throw Error('All checks need passed status and actual evidence files');
    for(const p of c.evidence){const bytes=fs.readFileSync(local(p));if(!bytes.toString().trim())throw Error('Evidence file is empty');const hash=sha(bytes);const captured=path.join(captureDir,hash+'.log');
     if(!fs.existsSync(captured))fs.writeFileSync(captured,bytes,{flag:'wx'});
     const relative=path.relative(root,captured).split(path.sep).join('/');evidence[relative]=hash;sourceEvidence[p]=relative;}}
   s.receipt={path:receipt,hash:sha(content),evidence,sourceEvidence};s.app=r.app;s.status='verifying';return write(s);
  },
  finish() {
   const s=validate(read());if(!s.receipt)throw Error('A complete foundation receipt is required before lesson 10');
   if(JSON.stringify(s.app)!==JSON.stringify(snapshot()))throw Error('App changed since verification; revalidate before handover');
   // A repeat finish must not bless source edits made after verification.
   if(s.status==='ready-for-10'){if(JSON.stringify(s.app)!==JSON.stringify(snapshot()))throw Error('App changed since verification; revalidate before handover');return s;}
   s.app=snapshot();s.status='ready-for-10';return write(s);
  },
  status() {const s=validate(read());if(s.status==='ready-for-10'&&JSON.stringify(s.app)!==JSON.stringify(snapshot()))throw Error('App changed since verification; revalidate before handover');return s;}
 };
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 try{const api=createPreparation(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'));const [cmd,a,b]=process.argv.slice(2);
  if(!['plan','start','record','finish','status','reopen','snapshot','history'].includes(cmd))throw Error('Usage: prepare-course.mjs plan|start <nodejs|java> | record <receipt.json> | finish | status | reopen | snapshot | history');
  const result=cmd==='record'?api.record(a):api[cmd](a);console.log(JSON.stringify(result,null,2));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
