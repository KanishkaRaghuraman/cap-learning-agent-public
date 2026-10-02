import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const target=process.argv[2];
if(!target) throw new Error('Usage: node course/scripts/install-fiori-chat.mjs <CAP project> --opt-in');
if(!process.argv.includes('--opt-in')) throw new Error('Only install after the learner opts in and has configured supported server-side model access. Pass --opt-in.');
const root=fs.realpathSync(path.resolve(target));
if(!fs.existsSync(path.join(root,'srv/incident-assistant.cds'))) throw new Error('Install and verify the CAP assistant backend first.');
const web=path.join(root,'app/incidents/webapp');
const manifestPath=path.join(web,'manifest.json');
// Reject symlinks before any writes, including parent directories.
for(const name of ['app','app/incidents','app/incidents/webapp','app/incidents/webapp/ext','app/incidents/webapp/ext/IncidentChat.js','app/incidents/webapp/manifest.json']) {
 const p=path.join(root,name); try { if(fs.lstatSync(p).isSymbolicLink()) throw new Error('Refusing symlink: '+name); } catch(e) { if(e.code !== 'ENOENT') throw e; }
}
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const appId=manifest['sap.app']?.id;
if(!appId || !/^[A-Za-z][\w.]*$/.test(appId)) throw new Error('Unsupported app namespace');
const targets=manifest['sap.ui5']?.routing?.targets;
const report=Object.values(targets||{}).find(t=>t.name==='sap.fe.templates.ListReport');
if(!report) throw new Error('Expected Fiori elements V4 List Report');
const settings=report.options?.settings;
if(!settings) throw new Error('Missing List Report settings');
const source=fs.readFileSync(fileURLToPath(new URL('../extensions/node/12-agent/fiori/IncidentChat.js',import.meta.url)),'utf8');
const dest=path.join(web,'ext/IncidentChat.js');
if(fs.existsSync(dest)&&fs.readFileSync(dest,'utf8')!==source) throw new Error('Existing IncidentChat.js differs; preserve learner changes and review manually.');
const action={text:'Ask Incident Assistant',press:appId+'.ext.IncidentChat.open',visible:true,enabled:true};
for(const value of [settings.content,settings.content?.header,settings.content?.header?.actions]) { if(value!==undefined && (!value || typeof value!=='object' || Array.isArray(value))) throw new Error('Unsupported existing header structure'); }
const existing=settings.content?.header?.actions?.IncidentAssistant;
if(existing && JSON.stringify(existing)!==JSON.stringify(action)) throw new Error('Existing IncidentAssistant action differs; refusing overwrite.');
settings.content??={}; settings.content.header??={}; settings.content.header.actions??={};
settings.content.header.actions.IncidentAssistant=action;
fs.mkdirSync(path.dirname(dest),{recursive:true});
if(!fs.existsSync(dest)) fs.writeFileSync(dest,source,{flag:'wx'});
const updated=JSON.stringify(manifest,null,2)+'\n';
if(fs.readFileSync(manifestPath,'utf8')!==updated) fs.writeFileSync(manifestPath,updated);
console.log('Installed optional Fiori chat action. No credentials were read or changed. Reload the Fiori page (no CAP restart is normally needed for these UI-only changes) and verify a real conversation before marking this extension complete.');
