import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
export const packages=['@sap/cds-dk','@sap/generator-fiori','@cap-js/mcp-server','@sap-ux/fiori-mcp-server','@ui5/mcp-server'];
export function npm(args,options={}) {
 // npm.cmd is a command script on Windows, not an executable for execFile.
 // Arguments here are fixed names/validated versions, never raw learner shell input.
 if(!Array.isArray(args)||args.some(arg=>typeof arg!=='string'||!/^[-a-zA-Z0-9@/._=:+]+$/.test(arg)))throw Error('Unsafe npm argument refused before launching a shell.');
 const windows=process.platform==='win32';
 return spawnSync(windows?'cmd.exe':'npm',windows?['/d','/s','/c','npm',...args]:args,{encoding:'utf8',timeout:60000,windowsHide:true,...options});
}
export const stable=version=>/^\d+\.\d+\.\d+$/.test(version);
export async function readJson(file){try{return JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}}
export function semverFor(root) {
 // semver is provided by the installed UI5 MCP toolchain; do not approximate ranges.
 const require=createRequire(path.join(root,'node_modules/@ui5/mcp-server/package.json'));
 try { return require('semver'); } catch (error) {
  if(error.code==='MODULE_NOT_FOUND')throw new Error('Course setup dependencies are missing. Run npm ci from the course root, then retry the setup command.',{cause:error});
  throw error;
 }
}
export function registryPackage(name,semver,run=npm) {
 const result=run(['view',name+'@latest','version','engines','--json']);
 if(result.error||result.status!==0)throw Error(`Registry lookup failed for ${name}: ${result.error?.message||'npm exit '+result.status}. No versions/configuration changed.`);
 let value;try{value=JSON.parse(result.stdout)}catch{throw Error(`Registry returned invalid JSON for ${name}`)}
 const version=typeof value==='string'?value:value.version,engines=value.engines||{};
 if(!stable(version))throw Error(`Latest tag for ${name} is not a stable release (${version}); review compatible stable releases explicitly.`);
 return {name,version,engines,nodeCompatible:!engines.node||semver.satisfies(process.version,engines.node)};
}
export function serverConfig(root,versions,windows=process.platform==='win32') {
 for(const name of ['@cap-js/mcp-server','@sap-ux/fiori-mcp-server'])if(!stable(versions[name]))throw Error('Configuration requires an exact stable version for '+name);
 const npmServer=args=>({command:windows?'cmd':'npx',args:windows?['/d','/c','npx',...args]:args});
 return {'cds-mcp':npmServer(['-y',`@cap-js/mcp-server@${versions['@cap-js/mcp-server']}`]),'fiori-mcp':npmServer(['-y',`@sap-ux/fiori-mcp-server@${versions['@sap-ux/fiori-mcp-server']}`,'fiori-mcp']),'ui5-mcp':{command:'node',args:[path.join(root,'node_modules/@ui5/mcp-server/bin/ui5mcp.js')]}};
}
