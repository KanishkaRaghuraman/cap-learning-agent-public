import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('Explore setup begins on selection but learner owns server startup',()=>{
 const s=read('AGENTS.md'),h=read('course/docs/SHORT-STARTER.md');
 assert.match(s,/begin setup immediately/); assert.match(s,/Do not start the preview server yourself/);
 assert.match(s,/cds watch/); assert.doesNotMatch(s,/npx(?:\.cmd)? --no-install cds watch/); assert.match(h,/serverOwner: learner/);
 assert.match(h,/pending required preview keeps lesson0 in progress/);
});
test('Node preview setup requires real model access and separately evidenced rendering',()=>{
 const s=read('course/lessons/10-incident-mcp.md');
 assert.match(s,/@cap-js\/agents package adds an assistant that runs inside CAP/);
 assert.match(s,/development MCP supplies documentation\/model context; the coding agent edits files and installs the dependency/);
 assert.match(s,/editor subscription alone is not proof/);
 assert.match(s,/keep this step pending/);
 assert.match(s,/Never substitute a mock response/);
 assert.match(s,/Discover the Preview link from the running CAP index/);
 assert.match(s,/HTTP 200 alone does not prove rendering/);
 assert.match(s,/learner types this in the browser preview, not back into the editor chat/);
 const java=read('course/docs/JAVA-MCP-PATH.md');
 assert.match(java,/none substitutes for native-client discovery, describe or query/);
 assert.match(java,/@agent.hitl is not supported by Java/);
});
test('Preview action requires server approval and readback before Fiori refresh',()=>{
 const s=read('course/lessons/11-incident-action.md');
 assert.match(s,/Add @agent.hitl/);
 assert.match(s,/instruction asking the model to be careful is not an approval control/);
 assert.match(s,/Before approval, no data may change/);
 assert.match(s,/Cancellation leaves the record unchanged/);
 assert.match(s,/editor agent must not execute the action on their behalf/);
 assert.match(s,/another explicit confirmation before the call/);
 assert.match(s,/read the record before any retry/);
 assert.match(s,/After the confirmed call, read the same incident again/);
 assert.match(s,/refresh the page to see the updated urgency/);
 assert.match(s,/browser refresh, not a CAP restart/);
 assert.match(s,/no mandatory or unsolicited regression suite/);
});
test('Optional Fiori assistant requires real rendered conversation evidence',()=>{
 const s=read('course/lessons/12-embedded-agent.nodejs.md');
 assert.match(s,/learner explicitly wants to continue/);
 assert.match(s,/actual rendered panel, real question\/answer and grounded data checks/);
 assert.match(s,/mock model or HTTP200 alone cannot complete embedding/);
});

test('Extension prompt examples use business names rather than asking learners to handle IDs',()=>{
 for(const file of ['course/lessons/10-incident-mcp.md','course/lessons/11-incident-action.md','course/docs/FINAL-AGENT-ACTIVITY.md','course/docs/JAVA-MCP-PATH.md']) {
  const examples=read(file).split('\n').filter(line=>line.startsWith('>')).join('\n');
  assert.doesNotMatch(examples,/\b(?:UUIDs?|IDs?)\b/,`${file}: learner prompt examples must not require technical keys`);
 }
 const rules=read('AGENTS.md');
 assert.match(rules,/lead with business-partner name and incident title/);
 assert.match(rules,/do not ask learners to copy, memorise or choose them/);
 assert.match(rules,/different partners can share a name/);
 assert.match(rules,/list matching incident titles\/status\/urgency and ask which one/);
 assert.match(rules,/do not silently choose the first match/);
 assert.match(rules,/Re-query the chosen record before action approval/);
 assert.match(rules,/different target requires fresh approval/);
 assert.match(rules,/technical IDs never appear/); // Do not falsely promise plugin UI hides technical keys.
});
test('Names identify the visible action while a verified internal UUID identifies the mutation',()=>{
 const node=read('course/lessons/11-incident-action.md');
 assert.match(node,/business-partner name, incident title, current urgency and proposed high urgency/);
 assert.match(node,/keep the resolved UUID as the internal action target/);
 assert.match(node,/queried businessPartnerName, never infer it from a title/);
 const java=read('course/docs/JAVA-MCP-PATH.md');
 assert.match(java,/If ambiguous, ask which of the matching records/);
 assert.match(java,/keep the resolved UUID internally/);
 assert.match(java,/Never infer a partner from the title/);
 const final=read('course/docs/FINAL-AGENT-ACTIVITY.md');
 assert.match(final,/> Which .*business-partner names and incident titles/);
 assert.match(final,/compare answers|comparison with the app/);
 assert.match(read('course/docs/FIORI-ASSISTANT.md'),/business-partner name.*incident title/);
});
