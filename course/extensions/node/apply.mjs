// Apply a reviewed course stage to an existing completed Node.js sample.
import { readFile, writeFile, copyFile, mkdir, access, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const [target, stage] = process.argv.slice(2);
if (!target || !['10-read-only','10-preview','11-action','11-preview-action','12-agent'].includes(stage)) throw Error('Usage: node extensions/node/apply.mjs <IncidentManagement path> 10-read-only|10-preview|11-action|11-preview-action|12-agent');
const root = await realpath(path.resolve(target)), here = path.dirname(fileURLToPath(import.meta.url));
// Reject linked mutation paths before reading or writing them; resolve the chosen root once.
for(const [relative,directory] of [['package.json',false],['srv',true],['srv/incident-agent-service.cds',false],['srv/incident-agent-service.js',false],['srv/incident-assistant.cds',false],['srv/incident-assistant.js',false]]) {
 try {
  const stat=await lstat(path.join(root,relative));
  if(stat.isSymbolicLink() || (directory?!stat.isDirectory():!stat.isFile())) throw Error(`Unsafe extension path ${relative}; no files changed.`);
 } catch(error) { if(error.code!=='ENOENT') throw error; }
}
const pkg = JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
if (pkg.type !== undefined && !['module','commonjs'].includes(pkg.type)) throw Error('Unsupported application module type; no files changed.');
const handlerSource=pkg.type==='module'?'incident-agent-service.js':'incident-agent-service.cjs';
await access(path.join(root,'srv/incidents-service.cds'));
const schema=await readFile(path.join(root,'db/schema.cds'),'utf8');
if (!schema.includes('namespace incident.mgmt;')) throw Error('Model differs from the course reference. Inspect it through CAP MCP before changing anything.');
const readIfPresent=async p=>{try{return await readFile(p,'utf8')}catch(e){if(e.code==='ENOENT')return null;throw e}};
for(const file of ['.cdsrc.json','.cdsrc-private.json','.cdsrc.yaml','.cdsrc.yml']) {
 if(await readIfPresent(path.join(root,file))!==null) throw Error(`Existing ${file} may override authentication. Review it through CAP tooling; no files changed.`);
}
const previous=await readIfPresent(path.join(root,'srv/incident-agent-service.cds'));
const expectedRead=await readFile(path.join(here,'10-read-only/srv/incident-agent-service.cds'),'utf8');
const expectedAction=await readFile(path.join(here,'11-action/srv/incident-agent-service.cds'),'utf8');
const expectedHandler=await readFile(path.join(here,'11-action/srv',handlerSource),'utf8');
const oldHandler=await readIfPresent(path.join(root,'srv/incident-agent-service.js'));
// Recognize only prior course code: comments and the newly added display-name column may differ.
// Any other code change still requires review; custom files are never replaced.
const canonical=text=>text?.replace(/\/\*\*[\s\S]*?\*\//g,'').replace(/,\s*businessPartner\.name as businessPartnerName/g,'').replace(/,\s*'businessPartner\.name as businessPartnerName'/g,'');
const reviewed=(actual,expected)=>actual!==null && canonical(actual)===canonical(expected);

if(previous!==null && !reviewed(previous,expectedRead) && !reviewed(previous,expectedAction)) throw Error('Existing extension CDS differs from the reviewed recipe; no files changed.');
if(oldHandler!==null && !reviewed(oldHandler,expectedHandler)) throw Error('Existing extension handler differs from the reviewed recipe; no files changed.');
if(stage==='10-read-only' && (oldHandler!==null||reviewed(previous,expectedAction))) throw Error('Action stage exists; do not silently roll it back. No files changed.');
if(stage==='11-action') await access(path.join(root,'srv/incident-agent-service.cds'));
pkg.cds ??= {};pkg.cds.requires ??= {};
// This is a localhost exercise configuration, never a deployment authentication strategy.
pkg.cds.requires['[development]'] ??= {};
const expectedAuth={kind:'mocked',users:{alice:{roles:['IncidentReader','IncidentManager']},bob:{roles:['IncidentReader']},mallory:{roles:[]},'*':false}};
const priorAuth=pkg.cds.requires['[development]'].auth;
if(pkg.cds.requires.auth || (priorAuth && JSON.stringify(priorAuth)!==JSON.stringify(expectedAuth))) throw Error('Existing authentication configuration needs review; no files changed.');
// Preview stages are additive: preserve the original MCP service and business handler.
if(['10-preview','11-preview-action','12-agent'].includes(stage)) {
 const actionPreview=stage==='11-preview-action';
 if(stage==='10-preview' && previous!==expectedRead) throw Error('Complete the reviewed lesson 10 read stage first; no files changed.');
 if(stage!=='10-preview' && (previous!==expectedAction || oldHandler!==expectedHandler)) throw Error('Complete the reviewed lesson 11 action stage first; no files changed.');
 const readonlyAssistant=await readFile(path.join(here,'12-agent/srv/incident-assistant.cds'),'utf8');
 const actionAssistant=await readFile(path.join(here,'11-preview-action/srv/incident-assistant.cds'),'utf8');
 const assistant=actionPreview?actionAssistant:readonlyAssistant;
 const priorAssistant=await readIfPresent(path.join(root,'srv/incident-assistant.cds'));
 if(priorAssistant!==null && ![readonlyAssistant,actionAssistant].some(expected=>reviewed(priorAssistant,expected))) throw Error('Existing assistant differs from the reviewed recipe; no files changed.');
 if(!actionPreview && reviewed(priorAssistant,actionAssistant)) throw Error('Action preview exists; do not silently remove its action. No files changed.');
 if(actionPreview && priorAssistant===null) throw Error('Complete 10-preview before adding its action; no files changed.');
 const assistantHandler=pkg.type==='module'?"import IncidentAgentService from './incident-agent-service.js';\nexport default class IncidentAssistant extends IncidentAgentService {}\n":"const IncidentAgentService = require('./incident-agent-service.js');\nmodule.exports = class IncidentAssistant extends IncidentAgentService {};\n";
 const priorAssistantHandler=await readIfPresent(path.join(root,'srv/incident-assistant.js'));
 if(priorAssistantHandler!==null && priorAssistantHandler!==assistantHandler) throw Error('Existing assistant handler differs from the reviewed recipe; no files changed.');
 if(!actionPreview && priorAssistantHandler!==null) throw Error('Assistant action handler already exists; no files changed.');
 const version=pkg.dependencies?.['@cap-js/agents'];
 if(version && version!=='0.9.7') throw Error('Existing agents version needs compatibility review; no files changed.');
 if(pkg.cds.agents?.per_action_tool===false) throw Error('Per-action tools are required for preview approval; no files changed.');
 pkg.dependencies ??= {};pkg.dependencies['@cap-js/agents']='0.9.7';
 await writeFile(path.join(root,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 await writeFile(path.join(root,'srv/incident-assistant.cds'),assistant);
 if(actionPreview) await writeFile(path.join(root,'srv/incident-assistant.js'),assistantHandler);
 console.log(`Applied additive ${stage}. Run npm install after reviewing the pinned dependency. Model access and preview remain unverified until tested.`);
 process.exit(0);
}
pkg.cds.requires['[development]'].auth=expectedAuth;
pkg.cds.mcp={...(pkg.cds.mcp||{}),autowire:false};
// All conflicts and all source files were checked before the first write.
await writeFile(path.join(root,'package.json'),JSON.stringify(pkg,null,2)+'\n');
await mkdir(path.join(root,'srv'),{recursive:true});
await copyFile(path.join(here,stage,'srv/incident-agent-service.cds'),path.join(root,'srv/incident-agent-service.cds'));
if(stage==='11-action') await copyFile(path.join(here,stage,'srv',handlerSource),path.join(root,'srv/incident-agent-service.js'));
console.log(`Applied ${stage}. Review the files, restart the local application, then run the matching verification.`);
