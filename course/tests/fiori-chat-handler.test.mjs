// Unit harness executes the actual module; UI5 rendering is covered separately in browser evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../extensions/node/12-agent/fiori/IncidentChat.js',import.meta.url),'utf8');
function harness(fetcher, lookup){
 const controls=[],requests=[],timers=new Set();let api;
 class Control {
  constructor(options={}){this.options=options;this.text=options.text;this.value='';this.items=options.items||[];this.visible=options.visible;controls.push(this);}
  addStyleClass(){return this;} addItem(item){this.items.push(item);return this;}
  getValue(){return this.value;} setValue(v){this.value=v;return this;}
  setEnabled(v){this.enabled=v;return this;} setVisible(v){this.visible=v;return this;}
  setText(v){this.text=v;return this;} open(){this.opened=true;} destroy(){this.destroyed=true;}
  close(){this.options.beforeClose?.();this.options.afterClose?.();}
 }
 const Dialog=class extends Control {},VBox=class extends Control {},Text=class extends Control {},TextArea=class extends Control {},Button=class extends Control {},MessageStrip=class extends Control {},ScrollContainer=class extends Control {};
 vm.runInNewContext(source,{sap:{ui:{define:(_,factory)=>api=factory(Dialog,VBox,Text,TextArea,Button,MessageStrip,ScrollContainer)}},AbortController,
  crypto:{randomUUID:()=>String(requests.length)},fetch:async(url,opts)=>{if (!opts.body && lookup) return lookup(url,opts);if (!opts.body) return {ok:true,json:async()=>({ID:url.match(/ID=([^,]+)/)[1],title:'Sample issue',status:'new_',urgency:'low',businessPartner:{name:'Sample Partner'}})};requests.push({url,...opts,body:JSON.parse(opts.body)});return fetcher(url,opts);},
  setTimeout:fn=>{const timer={fn};timers.add(timer);return timer;},clearTimeout:t=>timers.delete(t)});
 api.open();
 return {requests,timers,controls,input:controls.find(c=>c instanceof TextArea),send:controls.find(c=>c instanceof Button&&c.options.text==='Send'),error:controls.find(c=>c instanceof MessageStrip),dialog:controls.find(c=>c instanceof Dialog),texts:()=>controls.filter(c=>c instanceof Text),ask:async function(text){this.input.setValue(text);await this.send.options.press();}};
}
const ok=result=>({ok:true,json:async()=>({result})});
const task=(text,contextId='conversation-1')=>({kind:'task',contextId,status:{state:'completed'},artifacts:[{artifactId:'response',parts:[{kind:'text',text}]}]});
test('Fiori handler keeps user and assistant braces literal and carries conversation context',async()=>{
 const h=harness(async()=>ok(task('{"count":2}')));
 await h.ask('Show {status}');
 assert.ok(h.texts().some(t=>t.text==='You: Show {status}'));
 assert.ok(h.texts().some(t=>t.text==='Assistant: {"count":2}'));
 // Dynamic text must use setText: constructor settings invoke UI5 binding parsing.
 for(const t of h.texts().filter(t=>/[{}]/.test(t.text)))assert.equal(t.options.text,undefined);
 assert.equal(h.input.value,'');assert.equal(h.send.enabled,true);assert.equal(h.timers.size,0);
 await h.ask('Which IDs?');assert.equal(h.requests[1].body.params.message.contextId,'conversation-1');
 assert.equal(h.requests[0].credentials,'same-origin');assert.equal(h.requests[0].url,'/a2a/incident-assistant');
});
test('Fiori handler rejects incomplete tasks and errors while preserving learner input',async()=>{
 for(const response of [ok({kind:'task',status:{state:'working'},parts:[{kind:'text',text:'partial'}]}),{ok:false,status:403},{ok:true,json:async()=>({error:{code:500}})},ok({kind:'task',status:{state:'completed'}})]){
  const h=harness(async()=>response);await h.ask('My question');
  assert.equal(h.input.value,'My question');assert.equal(h.error.visible,true);assert.equal(h.send.enabled,true);assert.equal(h.input.enabled,true);assert.equal(h.timers.size,0);
  assert.equal(h.texts().filter(t=>t.text?.startsWith('Assistant:')).length,0);
 }
});
test('Closing the Fiori dialog aborts its request and suppresses late error UI',async()=>{
 const h=harness((_url,opts)=>new Promise((_resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(Object.assign(new Error('aborted'),{name:'AbortError'})))));
 const pending=h.ask('Show incidents');assert.equal(h.requests.length,1);h.dialog.close();await pending;
 assert.equal(h.requests[0].signal.aborted,true);assert.equal(h.dialog.destroyed,true);assert.equal(h.error.visible,false);assert.equal(h.timers.size,0);
});
const gate=(id='task-1',target='aaaaaaaa-1111-2222-3333-444444444444')=>({kind:'task',id,contextId:'context-1',status:{state:'input-required',message:{parts:[{kind:'data',data:{actionRequests:[{name:'raiseUrgency',args:{incident:target}}]}}],metadata:{'sap.cds.agents.input-required':{options:[{value:'approve'},{value:'reject'}]}}}}});
const button=(h,label)=>h.controls.find(c=>c.options.text===label);
test('Fiori approval displays exact inputs and resumes the same task only on an explicit decision',async()=>{
 const h=harness(async()=>ok(h.requests.length===1?gate():task('Urgency is high.','context-1')));
 await h.ask('Raise urgency');
 assert.equal(h.requests.length,1);assert.equal(h.input.enabled,false);assert.equal(h.send.enabled,false);
 assert.ok(h.texts().some(t=>t.text?.includes('raiseUrgency')&&t.text.includes('aaaaaaaa-1111-2222-3333-444444444444')));
 await h.ask('approve');assert.equal(h.requests.length,1);
 await button(h,'Approve').options.press();
 const m=h.requests[1].body.params.message;
 assert.equal(m.taskId,'task-1');assert.equal(m.contextId,'context-1');assert.equal(m.parts[0].text,'approve');
 assert.equal(h.send.enabled,true);assert.equal(button(h,'Approve').visible,false);
 await button(h,'Approve').options.press();assert.equal(h.requests.length,2);
});
test('Fiori decline resumes with reject and does not send approve',async()=>{
 const h=harness(async()=>ok(h.requests.length===1?gate():task('Declined.','context-1')));
 await h.ask('Raise urgency');await button(h,'Decline').options.press();
 assert.equal(h.requests[1].body.params.message.parts[0].text,'reject');assert.equal(h.send.enabled,true);
});
test('Fiori failed approval cannot be retried or reuse stale task state',async()=>{
 const h=harness(async()=>h.requests.length===1?ok(gate()):{ok:false,status:500});
 await h.ask('Raise urgency');await button(h,'Approve').options.press();
 assert.equal(h.error.visible,true);assert.equal(h.send.enabled,false);
 await button(h,'Approve').options.press();await h.ask('try again');assert.equal(h.requests.length,2);
 assert.match(h.error.text,/check the incident data/);
});
test('Fiori rejects missing approval details without an actionable approve button',async()=>{
 const result=gate();delete result.status.message.parts;
 const h=harness(async()=>ok(result));await h.ask('Raise urgency');
 assert.equal(h.error.visible,true);assert.equal(h.send.enabled,false);assert.equal(button(h,'Approve').visible,false);
 await button(h,'Approve').options.press();assert.equal(h.requests.length,1);
});
test('Fiori sequential approvals show the current action, never the earlier approved target',async()=>{
 const result=gate();result.status.message.metadata['sap.cds.agents.hitl']={decisions:[{type:'approve'}],actionRequests:[{name:'raiseUrgency',args:{incident:'bbbbbbbb-1111-2222-3333-444444444444'}},{name:'raiseUrgency',args:{incident:'cccccccc-1111-2222-3333-444444444444'}}]};
 const h=harness(async()=>ok(result));await h.ask('Raise urgency');
 assert.ok(h.texts().some(t=>t.text?.includes('cccccccc-1111-2222-3333-444444444444')));assert.ok(!h.texts().some(t=>t.text?.includes('bbbbbbbb-1111-2222-3333-444444444444')));
});

test('Fiori rejects a decision response from a different conversation',async()=>{
 const h=harness(async()=>ok(h.requests.length===1?gate():task('Done','different-context')));
 await h.ask('Raise urgency');await button(h,'Approve').options.press();
 assert.equal(h.error.visible,true);assert.equal(h.send.enabled,false);
 assert.ok(!h.texts().some(t=>t.text==='Assistant: Done'));
});

test('Fiori approval names come from CAP lookup and technical arguments stay hidden',async()=>{
 const h=harness(async()=>ok(gate()));await h.ask('Raise urgency');
 assert.ok(h.texts().some(t=>t.text?.includes('Sample Partner — Sample issue')));
 const detail=h.texts().find(t=>t.text?.startsWith('Action:'));
 assert.equal(detail.visible,false);await button(h,'Show technical details').options.press();assert.equal(detail.visible,true);
});
test('Fiori refuses approval when target lookup fails or identifies a different record',async()=>{
 for (const lookup of [async()=>({ok:false,status:404}),async()=>({ok:true,json:async()=>({ID:'wrong',title:'Other issue'})})]) {
  const h=harness(async()=>ok(gate()),lookup);await h.ask('Raise urgency');
  assert.equal(h.error.visible,true);assert.equal(button(h,'Approve').visible,false);assert.equal(h.send.enabled,false);
 }
});
