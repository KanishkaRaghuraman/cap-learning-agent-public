#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
export async function checkStarter(origin,{timeoutMs=5000}={}) {
 const url=new URL(origin);
 if(url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('Use a plain local HTTP origin with no credentials, path or query');
 const checks=[];
 async function probe(name,route,verify){try{const response=await fetch(new URL(route,url),{redirect:'error',signal:AbortSignal.timeout(timeoutMs)});if(!response.ok)throw Error('HTTP '+response.status);const body=await response.text();if(!verify(body))throw Error('Unexpected response content');checks.push({name,pass:true,detail:'HTTP response and content verified'});}catch(e){checks.push({name,pass:false,detail:e.name==='TimeoutError'?'Timed out: check startup logs and port':e.message});}}
 const rows=(body,field)=>{const v=JSON.parse(body).value;return Array.isArray(v)&&v.length>0&&v.every(x=>typeof x.ID==='string'&&x.ID.length>0&&typeof x[field]==='string'&&x[field].length>0);};
 await probe('metadata','/odata/v4/incidents/$metadata',b=>b.includes('EntityType Name="Incidents"')&&b.includes('EntityType Name="BusinessPartners"'));
 await probe('incidents','/odata/v4/incidents/Incidents?$top=10',b=>rows(b,'title'));
 await probe('partners','/odata/v4/incidents/BusinessPartners?$top=10',b=>rows(b,'name'));
 await probe('ui-page','/ns.incidents/index.html',b=>/<html[\s>]/i.test(b));
 await probe('ui-manifest','/ns.incidents/manifest.json',b=>JSON.parse(b)['sap.app']?.id==='ns.incidents');
 return {pass:checks.every(c=>c.pass),checks,previewUrl:new URL('/ns.incidents/index.html',url).href,browserRenderingVerified:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),url=args[args.indexOf('--url')+1];if(!args.includes('--url'))throw Error('Usage: check-starter.mjs --url http://localhost:PORT [--output receipt.json]');const result=await checkStarter(url);const json=JSON.stringify(result,null,2)+'\n';if(args.includes('--output')){const out=args[args.indexOf('--output')+1];if(!out||out.startsWith('--'))throw Error('Provide an output path');fs.mkdirSync(path.dirname(out),{recursive:true});const temp=out+'.'+process.pid+'.tmp';fs.writeFileSync(temp,json,{flag:'wx'});fs.renameSync(temp,out);}console.log(json);if(!result.pass)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
