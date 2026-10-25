/** Offline build from this repository only; Core supplies contracts, never content. */
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {root,hash,json,stable,readJson,write,coreApi,safePath} from './shared.mjs';
export async function verifyFiles(base,records){
 const seen=new Set();
 for(const f of records){safePath(f.path);assert.ok(!seen.has(f.path),'Duplicate manifest path');seen.add(f.path);
  const bytes=await readFile(join(base,f.path));assert.equal(bytes.length,f.bytes,f.path);assert.equal(hash(bytes),f.sha256,f.path);
 }
}
export async function build(base=root,{emit=false}={}){
 const extraction=await readJson(join(base,'provenance/extraction.json'));
 await verifyFiles(base,extraction.files);
 const canonical=await readJson(join(base,'validation/canonical-manifest.json'));
 assert.equal(canonical.digest,hash(stable(canonical.entries)));
 assert.equal(canonical.digest,extraction.canonicalDigest);
 const enrichments=await readJson(join(base,'data/enrichment.json'));
 const resources=await readJson(join(base,'data/resources.json'));
 const quantities=await readJson(join(base,'data/quantities.json'));
 const compatibility=await readJson(join(base,'data/compatibility.json'));
 const taxonomy=await readJson(join(base,'taxonomy/categories.json'));
 const inputs=extraction.files.filter(f=>/^(data|taxonomy|assets)\//.test(f.path)).map(f=>({path:f.path,sha256:f.sha256}));
 const sourceRevision='sha256:'+hash(stable(inputs));
 const snapshot={schemaVersion:1,provider:{id:'open-sauce-food',version:'0.1.0-stage-2',sourceRevision},vocabulary:{digest:canonical.digest,revision:canonical.sourceRevision},resources,enrichments,quantities};
 const api=await coreApi();api.validateKnowledgeSnapshot(snapshot,new api.Vocabulary(canonical.entries),canonical.digest);
 const heroes=enrichments.filter(e=>e.hero);
 const media=heroes.map(e=>{const path='assets/'+safePath(e.hero.asset);const f=extraction.files.find(f=>f.path===path);assert.ok(f,'Missing photograph');return {target:e.target,path,sha256:f.sha256,bytes:f.bytes,hero:e.hero};});
 assert.equal(new Set(media.map(m=>m.path)).size,349);assert.equal(media.length,349);
 const required=['creator','licence','licence_url','source_page','source_file','attribution_text','changes'];
 const incompleteRights=media.flatMap(m=>{const missing=required.filter(k=>typeof m.hero[k]!=='string'||!m.hero[k].trim());return missing.length?[{target:m.target,missing}]:[];});
 const bundle={snapshot,compatibility,taxonomy,media,rights:{basis:'Existing metadata retained; no new rights verification or relicensing',incompleteRights}};
 if(emit){for(const [name,value]of Object.entries(bundle))await write(join(base,'dist',name+'.json'),json(value));await write(join(base,'dist/manifest.json'),json({sourceRevision,coreContractRevision:extraction.contractRevision,files:Object.entries(bundle).map(([n,v])=>({path:n+'.json',sha256:hash(json(v)),bytes:Buffer.byteLength(json(v))})),mediaRoot:'../assets'}));}
 return bundle;
}
if(import.meta.main){const b=await build(root,{emit:true});console.log(json({provider:b.snapshot.provider,articles:b.snapshot.enrichments.length,photos:b.media.length,rights:b.rights}));}
