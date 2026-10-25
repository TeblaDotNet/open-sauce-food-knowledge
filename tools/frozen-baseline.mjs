import {mkdir,mkdtemp,writeFile,readFile,symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';import {join} from 'node:path';
import {verifyFiles} from './build.mjs';
import {root,core,stage0,readJson,hash} from './shared.mjs';
/** Immutable historical API/source fixture, never an active editorial input. */
export async function frozenBaseline(){
 await verifyFiles(root,await readJson(join(root,'provenance/stage-0/manifest.json')));
 await mkdir(join(root,'work'),{recursive:true});const dir=await mkdtemp(join(root,'work/stage0-')),tar=join(dir,'source.tar');
 execFileSync('git',['archive','--format=tar','--output='+tar,stage0,'src','knowledge','package.json'],{cwd:core,stdio:'pipe'});
 execFileSync('tar',['-xf',tar,'-C',dir],{stdio:'pipe'});
 await symlink(join(core,'node_modules'),join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
 const provenance=await readJson(join(root,'provenance/stage-0/source-provenance.json'));
 for(const f of provenance.documents){if(!f.source.startsWith('knowledge/'))continue;if(hash(f.text)!==f.sha256)throw Error('Historical source hash mismatch');const p=join(dir,f.source);await mkdir(join(p,'..'),{recursive:true});await writeFile(p,f.text);}
 for(const name of ['enrichment.yaml','resources.yaml']){const p='knowledge/'+name;await writeFile(join(dir,p),await readFile(join(root,'provenance/core',p)));}
 return dir;
}
