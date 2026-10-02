// Maintainer-only integration check. Run against a DISPOSABLE installed fixture.
// Pinned plugin internal buildTools is source/runtime-verified, not a stable public API.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {assertAuthorizationDenied} from './verification-support.mjs';
const target=process.argv[2];
assert(target,'Usage: node extensions/node/12-agent/verify.mjs <disposable fixture>');
process.chdir(path.resolve(target));
process.env.CDS_REQUIRES_LLM_KIND='llm-mock';
const require=createRequire(path.join(process.cwd(),'package.json'));
const cds=require('@sap/cds');
await cds.plugins;
const server=await cds.server({in_memory:true,port:0});
const base=`http://127.0.0.1:${server.address().port}`;
const srv=cds.services.IncidentAssistant;
const auth=user=>user?{Authorization:'Basic '+Buffer.from(user+':').toString('base64')}:{};
let seq=0;
async function rpc(user,endpoint,method,params){
 const res=await fetch(base+endpoint,{method:'POST',headers:{...auth(user),'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});
 const text=await res.text();
 if(!res.ok)return {httpStatus:res.status,error:{code:res.status}};
 const packet=JSON.parse(text.startsWith('event:')||text.startsWith('data:')?text.split('\n').find(l=>l.startsWith('data:')).slice(5):text);
 return packet.error?{error:packet.error}:packet.result;
}
const failed=r=>Boolean(r.error||r.isError);
const snapshot=async()=>{
 const r=await rpc('bob','/mcp/incident-agent','tools/call',{name:'query',arguments:{cql:'SELECT from Incidents { ID, title, status, urgency, businessPartnerName } order by ID'}});
 assert(!failed(r));return r.structuredContent.data;
};
try {
 assert.equal(require('@cap-js/agents/package.json').version,'0.9.7');
 assert.equal(srv.definition['@requires'],'IncidentReader');
 assert.equal(srv.definition['@agent.connect'],'none');
 assert.equal(srv.entities.Incidents['@readonly'],true);
 assert.deepEqual(Object.keys(srv.entities.Incidents.elements).sort(),['ID','businessPartnerName','status','title','urgency']);
 const before=await snapshot();assert(before.length>0,'Need synthetic seed data');
 for(const [id,roles] of [['alice',['IncidentReader','IncidentManager']],['bob',['IncidentReader']]]) {
  await srv.tx({user:new cds.User({id,roles})},async()=>{
   const tools=await srv.send('buildTools');
   assert.deepEqual(tools.map(t=>t.name).sort(),['describe','query']);
   const query=async cql=>tools.find(t=>t.name==='query').invoke({type:'tool_call',id:String(++seq),name:'query',args:{cql}});
   const read=await query('SELECT from Incidents { ID, title, status, urgency, businessPartnerName }');
   assert(!read.artifact?.isError);assert(read.content.includes(before[0].ID));
   for(const cql of ["UPDATE Incidents SET urgency = 'high'",'DELETE from Incidents','SELECT from Incidents { createdBy }','SELECT from BusinessPartners { ID }']) {
    const result=await query(cql);assert(result.artifact?.isError,`Not rejected: ${cql}`);
   }
   const absent=await query("SELECT from Incidents { ID } where ID = '00000000-0000-0000-0000-000000000000'");
   assert(!absent.artifact?.isError);assert.match(absent.content,/count: 0/);
   await assert.rejects(srv.send({event:'UPDATE',entity:srv.entities.Incidents,data:{urgency:'high'}}));
  });
 }
 const index=await (await fetch(base)).text();
 const preview=index.match(/href="([^"]*incident-assistant[^"]*preview[^"]*)"/)[1];
 const previewResponse=await fetch(new URL(preview,base),{headers:auth('bob')});
 assert(previewResponse.ok);assert.match(await previewResponse.text(),/<html/i);
 const message={message:{kind:'message',messageId:'mock-proof',role:'user',parts:[{kind:'text',text:'List incidents'}]}};
 for(const user of [null,'mallory']) {
  const result=await rpc(user,'/a2a/incident-assistant','message/send',message);
  assertAuthorizationDenied(result,user===null?401:403);
 }
 const mock=await rpc('bob','/a2a/incident-assistant','message/send',message);
 assert(!failed(mock));assert.match(JSON.stringify(mock),/Mock LLM/);
 assert.deepEqual(await snapshot(),before,'Assistant changed incident data');
 const originalTools=await rpc('alice','/mcp/incident-agent','tools/list',{});
 assert.deepEqual(originalTools.tools.map(t=>t.name).sort(),['call','describe','query']);
 const odata=await fetch(base+'/odata/v4/incidents/$metadata',{headers:auth('bob')});assert(odata.ok);
 console.log(JSON.stringify({passed:true,provider:'llm-mock',liveModelVerified:false,tools:['describe','query'],rows:before.length,preview,previewHtml:true,browserRenderingVerified:false,authNegative:true,unchangedData:true,originalMcpActionPresent:true,versions:{node:process.version,cds:cds.version,agents:require('@cap-js/agents/package.json').version,mcp:require('@cap-js/mcp/package.json').version}},null,2));
} catch(error) {
 console.error(error);process.exitCode=1;
} finally {await new Promise(resolve=>server.close(resolve));await cds.shutdown();}
