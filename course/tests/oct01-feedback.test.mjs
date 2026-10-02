// Teaching-contract checks; these do not simulate a learner conversation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('Both setup paths require a terminal-resolvable CDS CLI',()=>{
 for(const runtime of ['nodejs','java']) {
 const s=read(`course/lessons/00-environment-setup.${runtime}.md`);
 assert.match(s,/npm install -g @sap\/cds-dk/);
 assert.match(s,/cds watch --help/);
 assert.match(s,/Do not mark setup complete while `cds` is unavailable/);
 }
 assert.doesNotMatch(read('course/docs/SHORT-STARTER.md'),/npx.*cds watch/);
});
test('Final practice explains continuity and checks unsupported reasoning',()=>{
 const s=read('course/docs/FINAL-AGENT-ACTIVITY.md');
 assert.match(s,/same CAP assistant preview and app/);
 assert.match(s,/You’ve connected the app and tried an action/);
 assert.match(s,/check reasoning as well as values/);
 assert.match(s,/new_ does not prove an incident is unassigned/);
 assert.match(s,/Do not call raiseUrgency or any mutation/);
});
test('A changed action target requires another confirmation',()=>{
 assert.match(read('course/lessons/11-incident-action.md'),/another explicit confirmation before the call/);
 assert.doesNotMatch(read('memory-bank/templates/progress.md'),/deliberate/i);
});
