import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {packages,semverFor,registryPackage,readJson,serverConfig,npm} from './setup-support.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const client=process.argv[2];
const planOnly=process.argv.includes('--plan');
if(!['codex','vscode','cursor','claude'].includes(client))throw new Error('Choose: npm run setup -- codex|vscode|cursor|claude');
const semver=semverFor(root);
const coursePackage=await readJson(path.join(root,'package.json'));
const courseNodeCompatible=!coursePackage.engines?.node||semver.satisfies(process.version,coursePackage.engines.node);
const latest=packages.map(name=>registryPackage(name,semver));
const incompatible=latest.filter(p=>!p.nodeCompatible);
if(incompatible.length)throw Error('Current Node does not meet latest stable package engines: '+incompatible.map(p=>`${p.name} ${p.engines.node}`).join('; ')+'. Ask before changing Node; no configuration written.');
const versions=Object.fromEntries(latest.map(p=>[p.name,p.version]));
const ui5Installed=await readJson(path.join(root,'node_modules/@ui5/mcp-server/package.json'));
const configPaths=['.mcp.json','.vscode/mcp.json','.cursor/mcp.json','.codex/config.toml'];
const existing=[];for(const file of configPaths){try{await access(path.join(root,file));existing.push(file)}catch(e){if(e.code!=='ENOENT')throw e}}
const globalResult=npm(['ls','--global','--depth=0','--json','@sap/cds-dk','@sap/generator-fiori']);
let globalPackages={};try{globalPackages=JSON.parse(globalResult.stdout||'{}').dependencies||{}}catch{}
const installedGlobals=Object.fromEntries(['@sap/cds-dk','@sap/generator-fiori'].map(name=>[name,globalPackages[name]?.version||'NOT FOUND']));
const plan={installedGlobals,globalInspectionStatus:globalResult.error?'FAILED':globalResult.status===0?'PASS':'PARTIAL (missing package or npm diagnostic)',courseNodeRequirement:coursePackage.engines?.node||null,courseNodeCompatible,node:process.version,nodeLts:process.release.lts||null,registryCheckedAt:new Date().toISOString(),latestStable:latest,installedUI5:ui5Installed?.version||null,existingProjectConfigs:existing,
  scopeCheck:'Inspect the active client MCP list for user/project duplicates before choosing one scope. This script neither reads nor changes user/global settings.',
  updatesRequireApproval:true,proposedUI5Update:ui5Installed?.version===versions['@ui5/mcp-server']?null:`npm install --save-dev --save-exact @ui5/mcp-server@${versions['@ui5/mcp-server']}`,
  globalTools:'Inspect existing cds-dk/generator installations; ask before changing them. Install missing tools inside the course workspace by default. A machine-global install requires an explicit learner choice, even when the package is absent.'};
if(planOnly){console.log(JSON.stringify(plan,null,2));process.exit(0)}
if(!courseNodeCompatible)throw Error('Current Node does not meet the course package engines. Review an LTS update with the learner before continuing.');
if(!process.release.lts)console.log('Current Node is not an LTS build. Check its official support status with the learner; this script does not replace a compatible installation.');
console.log('Resolved current stable MCP versions. Existing installations and client settings are preserved.');
if(plan.proposedUI5Update)console.log('A newer stable UI5 MCP is available. Ask before updating: '+plan.proposedUI5Update);
const filename=path.join(root,'node_modules/@ui5/mcp-server/lib/tools/run_manifest_validation/createValidationFunction.js');
const original=await readFile(filename,'utf8');
const hash=t=>createHash('sha256').update(t).digest('hex');
const before="0a60d52e93eb7c56eb903bf55a7c7781d49af9d576a7de28c5625157ee50fd70",after="1f321433966dfee44d20365090822c6901b9574a99272c32e071e47865940694";
if(hash(original)!==after){
 if(hash(original)!==before)throw new Error('Unexpected UI5 MCP source. Patch refused; review package version.');
 const needle='                    schemaCache.set(uri, schema);';
 const replacement="                    // Canonicalize draft-06 meta-schema URI to the preloaded AJV identity.\n                    // Adaptive Cards uses HTTPS; the meta-schema declares an HTTP $id.\n                    if (schema.$schema === \"https://json-schema.org/draft-06/schema\" ||\n                        schema.$schema === \"https://json-schema.org/draft-06/schema#\") {\n                        schema.$schema = \"http://json-schema.org/draft-06/schema#\";\n                    }\n                    schemaCache.set(uri, schema);";
 if(original.split(needle).length!==3)throw new Error('Patch target count differs');
 const patched=original.replaceAll(needle,replacement);
 if(hash(patched)!==after)throw new Error('Patch verification failed');
 await writeFile(filename,patched);
}
const servers=serverConfig(root,versions);
let relative,content;
if(client==='codex'){
 relative='.codex/config.toml';
 content=Object.entries(servers).map(([name,s])=>`[mcp_servers.${JSON.stringify(name)}]\ncommand = ${JSON.stringify(s.command)}\nargs = ${JSON.stringify(s.args)}\nstartup_timeout_sec = 60\n`).join('\n');
}else{
 relative={vscode:'.vscode/mcp.json',cursor:'.cursor/mcp.json',claude:'.mcp.json'}[client];
 content=JSON.stringify(client==='vscode'?{servers:Object.fromEntries(Object.entries(servers).map(([k,v])=>[k,{type:'stdio',...v}]))}:{mcpServers:servers},null,2)+'\n';
}
const target=path.join(root,relative);
let exists=false;try{await access(target);exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
const output=exists?target+'.suggested':target;
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,content);
console.log('Validator patch verified. Configuration written to '+output);
if(exists)console.log('Existing settings preserved. Merge the suggested entries, then delete the suggested file.');
console.log('Restart/reload the selected client MCP connections and run the project-config probe. A config file is not proof of the active client scope.');
