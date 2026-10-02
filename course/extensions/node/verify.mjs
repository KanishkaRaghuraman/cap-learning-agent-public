// Real Streamable HTTP calls; model prose is never execution evidence.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const evidence=[];
const [stage, base='http://localhost:4004', endpointPath='/mcp/incident-agent'] = process.argv.slice(2);
assert(['read-stage','action-stage'].includes(stage),'Use read-stage or action-stage');
const endpoint=new URL(endpointPath,base);let sequence=0;
process.on('uncaughtException',async error=>{if(process.env.COURSE_TEST_REPORT)await writeFile(process.env.COURSE_TEST_REPORT,JSON.stringify({stage,endpoint:String(endpoint),passed:false,error:error.message,evidence},null,2)+'\n');console.error(error);process.exit(1)});
async function rpc(user,method,params={}) {
 const headers={'Content-Type':'application/json',Accept:'application/json, text/event-stream'};
 if(user)headers.Authorization='Basic '+Buffer.from(user+':').toString('base64');
 const response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:++sequence,method,params})});
 const text=await response.text();let result;
 if(!response.ok)result={error:{code:response.status,message:text}};
 else {const packet=text.startsWith('event:')||text.startsWith('data:')?JSON.parse(text.split('\n').find(x=>x.startsWith('data:')).slice(5)):JSON.parse(text);result=packet.error?{error:packet.error}:packet.result;}
 evidence.push({user:user||'anonymous',method,params,result});return result;
}
const failed=r=>Boolean(r.error||r.isError);
const query=(user,cql)=>rpc(user,'tools/call',{name:'query',arguments:{cql}});
async function snapshot(){const r=await query('alice','SELECT from Incidents { ID, title, status, urgency, businessPartnerName }');assert(!failed(r),'Read failed');const rows=r.structuredContent?.data;assert(Array.isArray(rows),'Expected query rows');for(const row of rows)assert.deepEqual(Object.keys(row).sort(),['ID','businessPartnerName','status','title','urgency']);return rows.sort((a,b)=>a.ID.localeCompare(b.ID));}
const listing=await rpc('alice','tools/list');assert(listing.tools,'MCP discovery failed');
assert.deepEqual(listing.tools.map(t=>t.name).sort(),stage==='read-stage'?['describe','query']:['call','describe','query']);
assert(!failed(await rpc('alice','tools/call',{name:'describe',arguments:{entities:['Incidents']}})));
const original=await snapshot();
for(const [user,cql] of [[null,'SELECT from Incidents { ID }'],['mallory','SELECT from Incidents { ID }'],['alice',"UPDATE Incidents SET urgency = 'high'"],['alice','SELECT from Incidents { inventedField }'],['alice','SELECT from BusinessPartners { ID }']]){
 assert(failed(await query(user,cql)),`Expected rejection: ${user} ${cql}`);assert.deepEqual(await snapshot(),original,'Rejected request changed data');
}
const absent=await query('alice',"SELECT from Incidents { ID } where ID = '00000000-0000-0000-0000-000000000000'");assert(!failed(absent));assert.deepEqual(absent.structuredContent?.data,[],'Missing record must return zero rows');
if(stage==='action-stage'){
 const openID=process.env.COURSE_TARGET_ID;
 assert(openID,'Action verification requires COURSE_TARGET_ID: inspect and confirm that exact synthetic target first.');
 assert(original.some(x=>x.ID===openID&&x.status!=='closed'),'Confirmed target must be an existing open incident');
 const closedID=original.find(x=>x.status==='closed')?.ID;assert(openID&&closedID,'Need open and closed seed records');
 const call=(user,parameters)=>rpc(user,'tools/call',{name:'call',arguments:{action:'raiseUrgency',parameters}});
 for(const [user,parameters] of [['bob',{incident:openID}],['alice',{}],['alice',{incident:'not-a-uuid'}],['alice',{incident:'00000000-0000-0000-0000-000000000000'}],['alice',{incident:closedID}]]){
  assert(failed(await call(user,parameters)),`Expected action rejection: ${JSON.stringify(parameters)}`);assert.deepEqual(await snapshot(),original,'Rejected action changed data');
 }
 const result=await call('alice',{incident:openID});assert(!failed(result),JSON.stringify(result));assert.equal(result.structuredContent?.result?.ID,openID);assert.equal(result.structuredContent?.result?.urgency,'high');
 const after=await snapshot();assert.deepEqual(after,original.map(x=>x.ID===openID?{...x,urgency:'high'}:x),'Wrong record/field changed');
 const again=await call('alice',{incident:openID});assert(!failed(again));assert.deepEqual(again.structuredContent,result.structuredContent);assert.deepEqual(await snapshot(),after,'Repeat changed data');
}else {
 assert(failed(await rpc('alice','tools/call',{name:'call',arguments:{action:'raiseUrgency',parameters:{incident:original[0]?.ID}}})),'Read stage action unexpectedly succeeded');assert.deepEqual(await snapshot(),original);
}
console.log(`PASS ${stage}: discovery, exact-field reads, empty result, authorization, excluded entity/field, unchanged-state negative cases${stage==='action-stage'?', persisted action and unchanged unrelated rows, missing/closed/malformed/empty parameters, repeat':''}. Client confirmation and draft cases require the additional interactive/maintainer checks.`);
if(process.env.COURSE_TEST_REPORT)await writeFile(process.env.COURSE_TEST_REPORT,JSON.stringify({stage,endpoint:String(endpoint),passed:true,evidence},null,2)+'\n');
