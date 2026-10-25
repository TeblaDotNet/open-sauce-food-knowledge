import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {resolve,join,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
export const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
export const core=resolve(process.env.OSF_CORE??join(root,'../core'));
export const stage0='bc6060a29223a2a52443ad62f5e566a2114ffcc6';
export const stage1='cb5922c1c5239d2b126588c3098fc40d94adf9e9';
export const hash=b=>createHash('sha256').update(b).digest('hex');
export const json=v=>JSON.stringify(v,null,2)+'\n';
export const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
export const write=async(p,v)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,v);};
export function stable(v){if(Array.isArray(v))return '['+v.map(stable).join(',')+']';if(v&&typeof v==='object')return '{'+Object.entries(v).filter(([,x])=>x!==undefined).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}';return JSON.stringify(v);}
export const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024}).trim();
export async function coreApi(){const revision=process.env.OSF_CORE_REVISION??stage1;assert.match(revision,/^[a-f0-9]{40}$/,'Explicit full Core revision required');assert.equal(git(core,'rev-parse','HEAD'),revision,'Use the explicitly pinned Core revision');git(core,'merge-base','--is-ancestor',stage1,revision);return import(pathToFileURL(join(core,'src/index.ts')).href);}
export async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);assert.ok(!(await lstat(p)).isSymbolicLink(),'No symlinks');if(e.isDirectory())out.push(...await files(p));else out.push(p);}return out.sort();}
export function safePath(p){assert.equal(typeof p,'string');assert.ok(p.length&&!p.includes('\\')&&!p.startsWith('/')&&!p.split('/').some(x=>['..','.',''].includes(x))&&!p.includes(':')&&!p.split('/').some(x=>['__proto__','constructor','prototype'].includes(x)),'Unsafe relative path');return p;}
