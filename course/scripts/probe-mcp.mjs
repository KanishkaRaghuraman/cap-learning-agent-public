// Read-only tool calls through the selected project JSON configuration.
// No generator is invoked and no application or user/global config is modified.
import {createRequire} from 'node:module';
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const [configArg='.mcp.json',projectArg,reportArg]=process.argv.slice(2);
const configPath=path.resolve(root,configArg);
if(path.relative(root,configPath).startsWith('..'))throw Error('Use a project configuration inside the course root, not a user/global config.');
const canonicalConfig=await realpath(configPath);
if(path.relative(await realpath(root),canonicalConfig).startsWith('..'))throw Error('Configuration resolves outside the course root; select a real project config.');
const config=JSON.parse(await readFile(configPath,'utf8')),servers=config.mcpServers||config.servers;
if(!servers)throw Error('Expected mcpServers or servers in a project JSON configuration. Codex users can probe the equivalent generated portable JSON before checking active-client status.');
const require=createRequire(path.join(root,'node_modules/@ui5/mcp-server/package.json'));
const {Client}=await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/index.js')));
const {StdioClientTransport}=await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/stdio.js')));
const {ListRootsRequestSchema}=await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/types.js')));
const project=projectArg?await realpath(path.resolve(projectArg)):null;
if(project&&path.relative(await realpath(root),project).startsWith('..'))throw Error('Application must be inside this course workspace. Do not broaden MCP roots to bypass an access error.');
const report={at:new Date().toISOString(),scope:'selected project configuration, not proof of active editor selection',config:path.relative(root,configPath),node:process.version,servers:{}};
let anyFailure=false;
for(const name of ['cds-mcp','fiori-mcp','ui5-mcp']){
 const entry=servers[name];if(!entry){report.servers[name]={status:'FAIL',error:'Missing project server entry'};anyFailure=true;continue}
 const result=report.servers[name]={status:'FAIL'};
 const client=new Client({name:'cap-course-setup-probe',version:'1.0.0'},{capabilities:{roots:{listChanged:true}}});
 client.setRequestHandler(ListRootsRequestSchema,()=>({roots:[{uri:pathToFileURL(root).href,name:'CAP course'}]}));
 try{
  if(!entry.command||!Array.isArray(entry.args))throw Error('Expected a stdio command and args array');
  const transport=new StdioClientTransport({command:entry.command,args:entry.args,cwd:root,env:{...process.env,...entry.env},stderr:'pipe'});
  // Keep stderr in memory only: third-party startup output may contain local paths/settings.
  let stderrBytes=0;transport.stderr?.on('data',d=>{stderrBytes+=d.length});
  await client.connect(transport,{timeout:120000});
  const listing=await client.listTools();result.tools=listing.tools.map(t=>({name:t.name,inputSchema:t.inputSchema}));
  const toolName=name==='ui5-mcp'?'get_guidelines':'search_docs';
  const tool=listing.tools.find(t=>t.name===toolName);if(!tool)throw Error(`Required tool absent: ${toolName}`);
  const args=toolName==='get_guidelines'?{}:{query:name==='cds-mcp'?'cds init --nodejs':'Fiori elements List Report Object Page'};
  for(const required of tool.inputSchema.required||[])if(!(required in args))throw Error(`Live ${toolName} schema requires '${required}'; update the probe after review, do not guess.`);
  const response=await client.callTool({name:toolName,arguments:args},undefined,{timeout:120000});
  const texts=(response.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');
  if(response.isError||!texts.trim()||/^(no (results|matches)|nothing found)/i.test(texts.trim()))throw Error(`${toolName} failed or returned no evidence`);
  result.readProbe={tool:toolName,status:'PASS',responseCharacters:texts.length,responseExcerpt:texts.slice(0,350)};
  if(name==='cds-mcp'&&project){
   const modelTool=listing.tools.find(t=>t.name==='search_model');if(!modelTool)throw Error('search_model missing');
   const model=await client.callTool({name:'search_model',arguments:{projectPath:project,namesOnly:true,topN:10}},undefined,{timeout:120000});
   const text=(model.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');
   result.modelProbe={status:model.isError||/Failed to compile|No CDS files|outside.*roots/i.test(text)?'FAIL':'PASS',result:text};
   if(result.modelProbe.status==='FAIL'){result.status='PARTIAL';anyFailure=true;result.next='Check exact workspace root and whether any local CDS model exists. Import-only external definitions may not be in default model discovery yet. Do not fabricate a schema or label every compile failure expected; retry after the real lesson3 model exists.';continue}
  }else if(name==='cds-mcp')result.modelProbe={status:'NOT RUN',reason:'No application path supplied. Run again after creating the real course model.'};
  if(name==='fiori-mcp')result.generatorExecution={status:'NOT RUN',reason:'Read-only setup probe; lesson7 must verify generated files, install dependencies and run the UI.'};
  result.status='PASS';result.stderrBytes=stderrBytes;
 }catch(e){anyFailure=true;result.error=e.message}
 finally{await client.close()}
}
const rendered=JSON.stringify(report,null,2)+'\n';
if(reportArg)await writeFile(path.resolve(reportArg),rendered);else console.log(rendered);
if(reportArg)console.log(`MCP project probe ${anyFailure?'FAILED/PARTIAL':'PASS'}. Active editor scope and UI generation remain separate checks.`);
process.exitCode=anyFailure?1:0;
