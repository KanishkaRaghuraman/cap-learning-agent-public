// Load one shared course contract and resolve a real executable, never a shell shim.
import {readFile,access} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const contract=await readFile(new URL('../../AGENTS.md',import.meta.url),'utf8');
let executable='claude',prefix=[];
if(process.platform==='win32'){
 const native=spawnSync('where.exe',['claude.exe'],{encoding:'utf8',windowsHide:true});
 const found=native.status===0?native.stdout.trim().split(/\r?\n/)[0]:null;
 if(found)executable=found;
 else {
  // npm exposes a .cmd/.ps1 wrapper; resolve its declared binary without shell arguments.
  const npmRoot=spawnSync('cmd.exe',['/d','/c','npm','root','--global'],{encoding:'utf8',windowsHide:true,timeout:30000});
  if(npmRoot.status!==0)throw Error('Claude executable not found and npm global location could not be inspected. Use the existing code-editor extension, or install the official Claude Code CLI.');
  const packageDir=path.join(npmRoot.stdout.trim(),'@anthropic-ai','claude-code');
  const pkg=JSON.parse(await readFile(path.join(packageDir,'package.json'),'utf8'));
  const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin?.claude;
  if(!bin)throw Error('Installed Claude package does not declare its executable. No learner files changed.');
  const target=path.resolve(packageDir,bin);
  if(path.relative(packageDir,target).startsWith('..'))throw Error('Unexpected Claude executable path outside its installed package.');
  await access(target);
  if(/\.exe$/i.test(target))executable=target;
  else if(/\.[cm]?js$/i.test(target)){executable=process.execPath;prefix=[target]}
  else throw Error('Unsupported Claude executable type. Use its official native installation.');
 }
}
const child=spawn(executable,[...prefix,'--append-system-prompt',contract,...process.argv.slice(2)],{cwd:root,stdio:'inherit',shell:false});
child.on('error',e=>{
 console.error('Claude Code could not start. Confirm its official CLI is installed, or use your code-editor agent with AGENTS.md. No learner files were changed.');
 console.error(e.code||e.message);process.exitCode=1;
});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
