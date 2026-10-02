#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export function installStarter(courseRoot) {
 const [major,minor]=process.versions.node.split('.').map(Number);
 if(major<24||(major===24&&minor<15))throw Error('Complete prerequisites first: this starter requires Node.js 24.15 or newer.');
 const root=fs.realpathSync(courseRoot), bundle=path.join(root,'course/starters/incident-management'), destination=path.join(root,'IncidentManagement');
 if((()=>{try{fs.lstatSync(destination);return true}catch(e){if(e.code==='ENOENT')return false;throw e}})())throw Error('IncidentManagement already exists; preserve and inspect it, never overwrite it');
 function regular(p,kind='file') {const s=fs.lstatSync(p);if(s.isSymbolicLink()||!(kind==='dir'?s.isDirectory():s.isFile()))throw Error('Unsafe starter path');}
 regular(path.join(root,'course/starters'),'dir');regular(bundle,'dir');regular(path.join(root,'course/starters/manifest.json'));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'course/starters/manifest.json'),'utf8'));
 if(manifest.version!==1||!manifest.files||!Object.keys(manifest.files).length)throw Error('Invalid starter manifest');
 const expected=Object.keys(manifest.files).sort(), actual=[];
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Unsafe starter symlink');if(entry.isDirectory())walk(p);else if(entry.isFile())actual.push(path.relative(bundle,p).split(path.sep).join('/'));else throw Error('Unsafe starter entry');}}walk(bundle);
 if(JSON.stringify(actual.sort())!==JSON.stringify(expected))throw Error('Starter manifest file list mismatch');
 for(const relative of expected){if(relative.includes('\\')||relative.split('/').some(x=>!x||x==='..'||x==='.')||path.isAbsolute(relative))throw Error('Unsafe manifest path');const bytes=fs.readFileSync(path.join(bundle,relative));if(crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.files[relative])throw Error('Starter integrity mismatch: '+relative);}
 const staging=fs.mkdtempSync(path.join(root,'.starter-install-'));
 try{for(const relative of expected){const target=path.join(staging,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(bundle,relative),target,fs.constants.COPYFILE_EXCL);}if(fs.existsSync(destination))throw Error('Destination appeared during installation');fs.renameSync(staging,destination);}catch(e){fs.rmSync(staging,{recursive:true,force:true});throw e;}
 return {destination,files:expected.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(installStarter(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
