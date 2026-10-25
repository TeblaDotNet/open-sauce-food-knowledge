/** Explicit, disposable provider-composed workspace for migrated assertions. */
import {readFile,writeFile,mkdir,mkdtemp,cp,readdir,symlink} from 'node:fs/promises';
import {join,resolve} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {spawnSync} from 'node:child_process';
import {root,core,coreApi,readJson} from './shared.mjs';
import {build} from './build.mjs';
import {frozenBaseline} from './frozen-baseline.mjs';
export async function workspace(){
 const api=await coreApi(),node=await import(pathToFileURL(join(core,'src/vocabulary/node.ts')).href);
 const bundle=await build(),pin=await readJson(join(root,'validation/canonical-manifest.json'));
 const v=await api.composeKnowledge(await node.loadCanonicalVocabulary(join(core,'knowledge')),{snapshot:bundle.snapshot,canonicalManifest:pin,compatibility:bundle.compatibility,taxonomy:bundle.taxonomy});
 await mkdir(join(root,'work'),{recursive:true});const dir=await mkdtemp(join(root,'work/editorial-'));
 await symlink(join(core,'node_modules'),join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
 for(const p of ['src','tools','knowledge','tests/fixtures','tests/helpers','examples','LICENSES'])await cp(join(core,p),join(dir,p),{recursive:true});
 for(const p of ['tsconfig.json','package.json','README.md','SPEC.md','LICENSING.md','LICENSE'])await cp(join(core,p),join(dir,p));
 const put=async(p,value)=>writeFile(join(dir,p),JSON.stringify(value,null,2)+'\n');
 for(const e of v.entries){const domain=e.kind==='ingredient'?'ingredients':e.kind==='process'?'processes':'equipment';const p='knowledge/'+domain+'/'+e.id+'.yaml';await put(p,e);}
 await put('knowledge/enrichment.yaml',v.enrichments);await put('knowledge/resources.yaml',v.resources);await put('knowledge/taxonomy.json',v.taxonomy);
 await cp(join(root,'provenance/core/docs'),join(dir,'docs'),{recursive:true});
 await cp(join(root,'assets'),join(dir,'assets'),{recursive:true});
 await cp(join(root,'tests/editorial'),join(dir,'tests'),{recursive:true});
 await put('DERIVED.json',{editable:false,source:'Canonical Core plus explicit validated Knowledge provider'});
 return dir;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
 const dir=await workspace();const files=(await readdir(join(dir,'tests'))).filter(p=>p.endsWith('.test.ts'));
 const env={...process.env,OSF_CORPUS:resolve(process.env.OSF_CORPUS??join(root,'../corpus')),OSF_MIGRATION_KNOWLEDGE:root,OSF_STAGE0:process.env.OSF_STAGE0??await frozenBaseline()};
 const checked=spawnSync(process.execPath,[join(core,'node_modules/typescript/bin/tsc'),'--noEmit'],{cwd:dir,env,stdio:'inherit',windowsHide:true});if(checked.status!==0)process.exit(checked.status??1);
 const run=spawnSync(process.execPath,['--test',...files.map(p=>join(dir,'tests',p))],{cwd:dir,env,stdio:'inherit',windowsHide:true});
 console.log('Derived editorial workspace:',dir);process.exitCode=run.status??1;
}
