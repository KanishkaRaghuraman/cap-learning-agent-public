import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {serverConfig,stable,registryPackage,npm} from '../scripts/setup-support.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const versions={'@cap-js/mcp-server':'0.0.6','@sap-ux/fiori-mcp-server':'1.14.0'};
test('Windows stdio wraps npx; resolved versions stay exact',()=>{
 const servers=serverConfig('C:/course',versions,true);
 assert.deepEqual(servers['cds-mcp'],{command:'cmd',args:['/d','/c','npx','-y','@cap-js/mcp-server@0.0.6']});
 assert.equal(servers['fiori-mcp'].args.at(-1),'fiori-mcp');assert(!JSON.stringify(servers).includes('@latest'));
});
test('Mac stdio uses npx; UI5 remains local',()=>{const s=serverConfig('/course',versions,false);assert.equal(s['cds-mcp'].command,'npx');assert.equal(s['ui5-mcp'].command,'node');assert(s['ui5-mcp'].args[0].split(path.sep).join('/').endsWith('node_modules/@ui5/mcp-server/bin/ui5mcp.js'));});
test('Prerelease and invalid version values cannot become a stable config',()=>{
 assert(stable('1.2.3'));for(const v of ['latest','1.2.3-beta.1','1.2.3;echo bad','v1.2.3'])assert(!stable(v));
 assert.throws(()=>serverConfig('/course',{...versions,'@cap-js/mcp-server':'0.0.6 & echo bad'},true),/exact stable version/);
 assert.throws(()=>registryPackage('@example/tool',{satisfies:()=>true},()=>({status:0,stdout:'{"version":"2.0.0-beta.1"}'})),/not a stable release/);
});
test('Registry failure is explicit and incompatible engines remain distinguishable',()=>{
 assert.throws(()=>registryPackage('@example/tool',{},()=>({status:1,stdout:''})),/Registry lookup failed/);
 const result=registryPackage('@example/tool',{satisfies:()=>false},()=>({status:0,stdout:'{"version":"2.0.0","engines":{"node":">=999"}}'}));assert.equal(result.nodeCompatible,false);
});
test('Windows shell metacharacters are rejected before any process is started',()=>{
 for(const arg of ['x & echo bad','$(touch bad)','%TEMP%','!PATH!','x\ny','"quoted"','x|y','x>y'])assert.throws(()=>npm(['view',arg]),/Unsafe npm argument/);
});
test('Failed registry lookup preserves every existing client configuration',async()=>{
 const names=['.mcp.json','.mcp.json.suggested','.vscode/mcp.json','.cursor/mcp.json','.codex/config.toml'];
 const snapshot=async()=>Object.fromEntries(await Promise.all(names.map(async name=>{try{return[name,createHash('sha256').update(await readFile(path.join(root,name))).digest('hex')]}catch(e){if(e.code==='ENOENT')return[name,null];throw e}})));
 const before=await snapshot(),cache=await mkdtemp(path.join(tmpdir(),'cap-setup-test-'));
 try{
  const result=spawnSync(process.execPath,['course/scripts/setup.mjs','claude'],{cwd:root,encoding:'utf8',timeout:20000,env:{...process.env,npm_config_registry:'http://127.0.0.1:9',npm_config_fetch_retries:'0',npm_config_fetch_timeout:'1000',npm_config_cache:cache}});
  assert.notEqual(result.status,0);assert.match(result.stderr,/Registry lookup failed/);assert.deepEqual(await snapshot(),before);
 }finally{await rm(cache,{recursive:true,force:true})}
});
