// Source-contract tests: these verify the teaching specification, not LLM behavior.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canonicalLesson} from '../scripts/course-route.mjs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const activity=()=>read('course/docs/FINAL-AGENT-ACTIVITY.md');

test('Final route numbering preserves runtime-specific required exercises',()=>{
 for(const [route,runtime,visible] of [['guided','nodejs',12],['guided','java',12],['application-mcp','nodejs',3]]) {
  assert.equal(canonicalLesson(route,visible),12);
  const lesson=read(`course/lessons/12-embedded-agent.${runtime}.md`);
  const required=lesson.split('## Optional continuation')[0];
  assert.match(required,/required final lesson/);
  if(runtime==='nodejs') {
   assert.match(required,/course\/docs\/FINAL-AGENT-ACTIVITY.md/);
   assert.match(required,/CAP browser preview created earlier/);
   assert.match(required,/No new API key is required if that verified model connection still works/);
  } else {
   assert.match(required,/course\/docs\/JAVA-MCP-PATH.md/);
   assert.match(required,/existing editor chat/);
  }
  assert.doesNotMatch(required,/overview only|hands-on unsupported|elective/);
 }
});
test('Final practice is one learner-led activity, not three required prompts',()=>{
 const s=activity();
 assert.match(s,/optional examples, not three required activities/);
 assert.match(s,/After the learner confirms exploration and comparison with the app/);
 assert.match(s,/learner-reported verification/);
 assert.match(s,/Do not require every example/);
 assert.equal((s.match(/^\*\*For example:\*\*$/gm)||[]).length,3);
 assert.match(s,/connection failure or unexplained mismatch remains pending/);
 assert.match(s,/Do not call raiseUrgency or any mutation/);
});
test('Core completion and optional learner choice remain independent',()=>{
 const s=activity();
 assert.match(s,/After the learner confirms exploration and comparison with the app, mark canonical12 studied\/completed/);
 assert.match(s,/coreStatus: completed and extensionStatus: completed/);
 assert.match(s,/Required pendingChecks must be empty/);
 assert.match(s,/older editor-only completion does not prove this preview exercise/);
 assert.match(s,/no new API key is required/);
 assert.match(s,/or finish the course here/);
 assert.match(s,/optionalEmbeddingStatus: pending/);
 assert.match(s,/AI-CORE-NEXT-STEPS/);
 assert.match(s,/opts in and access is verified/);
 assert.match(s,/Do not request the key in chat/);
 assert.match(s,/also connect this application's MCP service to your editor's agent chat/);
 assert.match(s,/A decline means optionalEmbeddingStatus: skipped and immediate course wrap-up/);
 assert.match(s,/An optional failure does not undo core completion/);
});
test('Optional runtime boundary preserves Java and protects credentials',()=>{
 const java=read('course/lessons/12-embedded-agent.java.md');
 assert.match(java,/existing editor chat/);
 assert.match(java,/@agent.hitl.*not supported by CAP Java/);
 assert.match(java,/optionalEmbeddingStatus: unsupported/);
 assert.match(java,/Never install Node packages into Java or invent a configuration/);
 const node=read('course/lessons/12-embedded-agent.nodejs.md');
 assert.match(node,/Verify provider compatibility before access checks/);
 assert.match(node,/credentials server-side, out of chat, source control, receipts and browser code/);
 assert.match(node,/mock model or HTTP200 alone cannot complete embedding/);
 assert.match(node,/Do not reinstall the old read-only backend over its action-enabled service/);
});
test('Wrap reflects studied versus prepared work and closes both completion branches',()=>{
 const s=read('course/docs/COURSE-WRAP-UP.md');
 assert.match(s,/do not say the learner built its foundation/);
 assert.match(s,/without undoing required completion/);
 assert.match(s,/not another required task/);
 for(const url of ['https://cap.cloud.sap/docs/','https://github.com/capire','https://cap.cloud.sap/docs/guides/ai/']) assert.ok(s.includes(url));
 assert.equal(s.trim().split('\n').at(-1),'Happy Building!!!!');
});
