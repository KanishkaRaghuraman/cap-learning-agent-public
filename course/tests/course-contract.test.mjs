import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>['node_modules','.git','IncidentManagement'].includes(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
test('Every routed lesson exists; 0–12 have no missing or duplicate lesson rows',()=>{
 const files=fs.readdirSync(path.join(root,'course/lessons'));
 assert.match(read('AGENTS.md'),/Select the saved runtime variant by numeric lesson prefix/);
 for(const runtime of ['nodejs','java'])for(let n=0;n<=12;n++){
  const prefix=String(n).padStart(2,'0')+'-';
  const matches=files.filter(f=>f.startsWith(prefix)&&f.endsWith('.md')&&(!/\.(nodejs|java)\.md$/.test(f)||f.endsWith('.'+runtime+'.md')));
  assert.equal(matches.length,1,`canonical ${n} / ${runtime}: exactly one routed source`);
 }

});
test('Each extension has three ordered activities and evidence gates',()=>{
 for(const f of ['10-incident-mcp.md','11-incident-action.md']){
  const s=read('course/lessons/'+f);
  assert.deepEqual([...s.matchAll(/^## ([123]) —/gm)].map(x=>x[1]),['1','2','3']);
  assert.match(s,/\*\*For example:\*\*\s*\n>/);
  assert.match(s,/pending/);
  assert.match(s,/Save and read back/);
  assert.match(s,/Never begin the next lesson automatically/);
 }
});
test('Progress templates agree with current revision and cover both learning paths',()=>{
 const a=read('memory-bank/templates/activeContext.md'),p=read('memory-bank/templates/progress.md');
 for(const key of ['stateVersion','courseRevision','learningPath','preparationStatus','preparedLessons','coreStatus','extensionStatus','optionalEmbeddingStatus'])assert.equal(a.match(new RegExp(`^${key}: (.+)$`,'m'))?.[1],p.match(new RegExp(`^${key}: (.+)$`,'m'))?.[1],key);
 assert.deepEqual([...p.matchAll(/^- \[ \] Lesson (\d+):/gm)].map(x=>+x[1]),Array.from({length:13},(_,i)=>i));
 assert.ok(a.includes('single-chat-2026-09-30'));
});
test('All relative Markdown document links resolve inside the distribution',()=>{
 for(const f of walk(root).filter(f=>f.endsWith('.md'))){
  const text=fs.readFileSync(f,'utf8');
  for(const m of text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){
   const target=m[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target)||target.startsWith('/'))continue;
   assert.ok(fs.existsSync(path.resolve(path.dirname(f),decodeURIComponent(target))),`${path.relative(root,f)} -> ${target}`);
  }
 }
});
test('Markdown code fences are balanced and extension scripts contain no placeholders',()=>{
 for(const f of walk(root).filter(f=>f.endsWith('.md'))){let open=false;for(const line of fs.readFileSync(f,'utf8').split('\n')){if(!line.startsWith('```'))continue;if(open)assert.match(line,/^```\s*$/,`Malformed closing fence: ${path.relative(root,f)}`);open=!open;}assert.equal(open,false,path.relative(root,f));}
 for(const f of ['10-incident-mcp.md','11-incident-action.md'])assert.doesNotMatch(read('course/lessons/'+f),/\b(TODO|TBD|INSERT HERE)\b/);
});
test('Core completion does not retain a final9 or whole-course completion contradiction',()=>{
 for(const f of ['course/lessons/09-value-help.nodejs.md','course/lessons/09-value-help.java.md'])assert.doesNotMatch(read(f),/entire course|course COMPLETE|\(Course complete\)/);
 assert.doesNotMatch(read('AGENTS.md'),/Lesson 9 is final|do not invent lesson 10/);

});

test('Single-chat routes distinguish displayed short numbering from canonical lessons',()=>{
 const s=read('AGENTS.md');assert.match(s,/single.chat|one (?:visible )?chat/i);assert.match(s,/routeLesson/);assert.match(s,/canonical/);assert.match(s,/Node.js/);assert.match(s,/Java/);
 assert.doesNotMatch(s,/switch into PREPARER|Send this.*Builder/i);
 for(const f of ['course/lessons/00-environment-setup.java.md','course/lessons/00-environment-setup.nodejs.md'])assert.match(read(f),/For example:/);
});
