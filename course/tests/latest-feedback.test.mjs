// Teaching contracts, not a simulation of model or learner behavior.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('Action asks for before-state and names the rule-question destination',()=>{
 const s=read('course/lessons/11-incident-action.md');
 assert.ok(s.indexOf('click Go and note')<s.indexOf('> Raise the urgency'));
 assert.match(s,/Back in this editor chat/);
 assert.match(s,/Never say the learner must write business logic manually/);
 assert.match(read('course/docs/JAVA-MCP-PATH.md'),/note the chosen incident’s urgency/);
});
test('Practice presents examples together without automatic execution',()=>{
 const s=read('course/docs/FINAL-AGENT-ACTIVITY.md');
 assert.match(s,/Present all three suggestions below in one message/);
 assert.match(s,/Do not make the learner return to the editor between browser messages/);
 assert.match(s,/Do not execute the suggestions on the learner’s behalf/);
 assert.match(s,/unassigned from new_ status is unsupported/);
});
test('Fiori choice waits for an authored request and preserves app state',()=>{
 const s=read('course/docs/FIORI-ASSISTANT.md');
 assert.match(s,/wait for their request before running the install script/);
 assert.match(s,/reload the Fiori preview first/);
 assert.match(s,/405.*not proof that sign-in or authorization succeeded/);
 assert.match(s,/successful assistant request in the Fiori panel/);
 assert.doesNotMatch(read('course/scripts/install-fiori-chat.mjs'),/Restart\/reload/);
});
test('Integration overview distinguishes MCP tools from A2A assistant access',()=>{
 const s=read('course/docs/INTEGRATION-OPTIONS.md');
 assert.match(s,/`\/mcp\/incident-agent` is the application MCP endpoint/);
 assert.match(s,/`\/a2a\/incident-assistant` is the assistant's A2A endpoint/);
 assert.match(s,/need support for the selected protocol/);
});
