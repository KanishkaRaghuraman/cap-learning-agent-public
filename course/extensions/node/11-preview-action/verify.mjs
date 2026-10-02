// Maintainer-only: deterministic model exercises the real plugin approval graph.
// buildModel/prepend instrumentation is package-source verified, not a learner API.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=process.argv[2];
assert(root,'Usage: node course/extensions/node/11-preview-action/verify.mjs <disposable installed fixture>');
process.chdir(root);
const require=createRequire(root+'/package.json');
process.env.CDS_REQUIRES_LLM_KIND='llm-mock';
const cds=require('@sap/cds');
cds.root=root;
const {BaseChatModel}=require('@langchain/core/language_models/chat_models');
const {AIMessage}=require('@langchain/core/messages');
class Scripted extends BaseChatModel{
 _llmType(){return 'course-scripted-test'}
 bindTools(){return this}
 async _generate(messages){
 const last=messages.at(-1);let message;
 if(last.getType()==='tool')message=new AIMessage('Scripted test finished.');
 else {const target=messages.filter(m=>m.getType()==='human').map(m=>m.content).join(' ').match(/[a-f0-9]{8}-[a-f0-9-]{27,}/)?.[0];message=new AIMessage({content:'',tool_calls:[{name:'raiseUrgency',args:{incident:target},id:crypto.randomUUID(),type:'tool_call'}]});}
 return {generations:[{text:'',message}]};
 }
}
await cds.plugins;
cds.on('serving',srv=>{if(srv.name==='IncidentAssistant')srv.prepend(function(){this.on('buildModel',()=>new Scripted({}));});});
const server=await cds.server({in_memory:true,port:0});
const base='http://127.0.0.1:'+server.address().port;
const auth={Authorization:'Basic '+Buffer.from('alice:').toString('base64')};
async function rpc(method,params){const res=await fetch(base+'/a2a/incident-assistant',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:crypto.randomUUID(),method,params})});const data=await res.json();assert(!data.error,JSON.stringify(data));return data.result;}
const send=(text,task)=>rpc('message/send',{message:{kind:'message',messageId:crypto.randomUUID(),role:'user',parts:[{kind:'text',text}],...(task?{taskId:task.id,contextId:task.contextId}:{})}});
try{
const srv=cds.services.IncidentAssistant;
assert.equal(srv.definition['@requires'],'IncidentReader');
assert.equal(srv.actions.raiseUrgency['@requires'],'IncidentManager');
assert.equal(srv.actions.raiseUrgency['@agent.hitl'],true);
assert.deepEqual(Object.keys(srv.entities.Incidents.elements).sort(),['ID','businessPartnerName','status','title','urgency']);
for(const [user,status] of [[null,401],['mallory',403]]) {
 const headers={'Content-Type':'application/json'};
 if(user)headers.Authorization='Basic '+Buffer.from(user+':').toString('base64');
 const response=await fetch(base+'/a2a/incident-assistant',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'message/send',params:{message:{kind:'message',messageId:'denied',role:'user',parts:[{kind:'text',text:'hello'}]}}})});
 assert.equal(response.status,status);
}
await srv.tx({user:new cds.User({id:'bob',roles:['IncidentReader']})},async()=>{
 const tools=await srv.send('buildTools');
 assert.equal(tools.find(t=>t.name==='raiseUrgency').isAllowed(),false,'Reader cannot use action tool');
 const query=tools.find(t=>t.name==='query');
 const names=await query.invoke({type:'tool_call',id:'names',name:'query',args:{cql:'SELECT from Incidents { title, businessPartnerName }'}});
 assert(!names.artifact?.isError);assert.match(names.content,/Northwind Traders/);
 for(const cql of ['SELECT from Incidents { businessPartner_ID }','SELECT from BusinessPartners { name }']) {
  const denied=await query.invoke({type:'tool_call',id:'denied',name:'query',args:{cql}});assert(denied.artifact?.isError);
 }

});
const rows=await cds.run(cds.ql.SELECT.from('incident.mgmt.Incidents').columns('ID','urgency','status'));
const labelRows=await cds.run(cds.ql.SELECT.from('IncidentAssistant.Incidents').columns('ID','businessPartnerName'));
assert(labelRows.some((r,i)=>r.businessPartnerName && labelRows.some((other,j)=>j!==i&&other.businessPartnerName===r.businessPartnerName)),'Fixture needs a shared partner name to check ambiguity');
const sample=await cds.run(cds.ql.SELECT.one.from('incident.mgmt.Incidents').where({ID:rows[0].ID}));
try {
 await cds.run(cds.ql.UPDATE('incident.mgmt.Incidents').set({businessPartner_ID:null}).where({ID:sample.ID}));
 const missing=await cds.run(cds.ql.SELECT.one.from('IncidentAssistant.Incidents').columns('ID','businessPartnerName').where({ID:sample.ID}));
 assert.equal(missing.businessPartnerName,null,'Missing association must stay null, not be inferred');
} finally {await cds.run(cds.ql.UPDATE('incident.mgmt.Incidents').set({businessPartner_ID:sample.businessPartner_ID}).where({ID:sample.ID}));}
const target=rows.find(r=>r.status!=='closed'&&r.urgency!=='high');assert(target);
const read=()=>cds.run(cds.ql.SELECT.one.from('incident.mgmt.Incidents').where({ID:target.ID}));
let task=await send('Raise '+target.ID);assert.equal(task.status.state,'input-required');assert.equal((await read()).urgency,target.urgency);
for(const user of ['bob','mallory']) {
 const response=await fetch(base+'/a2a/incident-assistant',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(user+':').toString('base64'),'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:crypto.randomUUID(),method:'message/send',params:{message:{kind:'message',messageId:crypto.randomUUID(),role:'user',taskId:task.id,contextId:task.contextId,parts:[{kind:'text',text:'approve'}]}}})});
 const body=await response.json();
 console.log('cross-user resume',user,response.status,body.error?.code);
 assert(response.status===403 || body.error?.code===-32001,'Cross-user resume must be forbidden or task-not-found');
 assert.equal((await read()).urgency,target.urgency,'Cross-user approval must not mutate');
}
let rejected=await send('reject',task);assert.equal((await read()).urgency,target.urgency);console.log('REJECT',rejected.status.state);
const different=rows.find(r=>r.ID!==target.ID&&r.status!=='closed'&&r.urgency!=='high');assert(different);
task=await send('Raise '+different.ID);assert.equal(task.status.state,'input-required');
assert.equal(task.status.message.parts.find(p=>p.kind==='data').data.actionRequests[0].args.incident,different.ID);
assert.equal((await read()).urgency,target.urgency);
let approved=await send('approve',task);assert.equal(approved.status.state,'completed');
assert.equal((await cds.run(cds.ql.SELECT.one.from('incident.mgmt.Incidents').where({ID:different.ID}))).urgency,'high');
assert.equal((await read()).urgency,target.urgency,'Rejected target remains unchanged');
await srv.tx({user:new cds.User({id:'alice',roles:['IncidentReader','IncidentManager']})},async()=>{
 const returned=await srv.send('raiseUrgency',{incident:different.ID});
 assert.equal(typeof returned.businessPartnerName,'string');assert(returned.businessPartnerName.length>0);
});
console.log(JSON.stringify({passed:true,model:'scripted test only',liveModelVerified:false,inputRequired:true,rejectionPreservesData:true,changedTargetRequiresNewApproval:true,approvedTargetUpdated:true,crossUserResumeDenied:true,missingPartnerStaysNull:true,duplicatePartnerNamesPreserved:true}));
}catch(e){console.error(e);process.exitCode=1;}finally{await new Promise(r=>server.close(r));await cds.shutdown();}
