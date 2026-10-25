import test from 'node:test';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {root,core,stage0,stage1,hash,json,stable,readJson,files,coreApi,git} from '../tools/shared.mjs';
import {build,verifyFiles} from '../tools/build.mjs';
import {compose} from './compose.mjs';
const api=await coreApi();
const loaders=await import(pathToFileURL(join(core,'src/vocabulary/node.ts')).href);
const ownership=await import(pathToFileURL(join(core,'tools/migration/ownership.ts')).href);
const splitter=await import(pathToFileURL(join(core,'tools/migration/dry-run.ts')).href);
const bundle=await build();
const pin=await readJson(join(root,'validation/canonical-manifest.json'));
const canonical=await loaders.loadCanonicalVocabulary(join(core,'knowledge'));
const original=await loaders.loadVocabulary(join(core,'knowledge'));
const composed=compose(api,canonical,bundle,pin.digest);
const extraction=await readJson(join(root,'provenance/extraction.json'));

test('pinned source revisions, full inventory and all extracted source/media hashes',async()=>{
 assert.equal(extraction.coreSourceRevision,stage0);assert.equal(extraction.contractRevision,stage1);
 assert.equal(pin.entries.length,969);assert.equal(pin.entries.filter(e=>!e.canonical_target).length,967);
 await verifyFiles(root,extraction.files);
 for(const f of extraction.files.filter(f=>f.sourceHash))assert.equal(hash(await readFile(join(core,f.source))),f.sourceHash,f.source);
 const b=bundle.snapshot;
 const counts={articles:b.enrichments.length,sources:b.resources.length,blocks:b.enrichments.flatMap(e=>e.editorial??[]).length,attachments:b.enrichments.flatMap(e=>e.resources??[]).length,associations:b.enrichments.flatMap(e=>e.associations??[]).length,photos:bundle.media.length,observations:b.enrichments.flatMap(e=>e.measurements??[]).length,eligible:b.enrichments.flatMap(e=>e.measurements??[]).filter(m=>m.conversion_eligible).length};
 assert.deepEqual(counts,{articles:911,sources:775,blocks:2256,attachments:1144,associations:162,photos:349,observations:1,eligible:0});
 assert.deepEqual(b.quantities,[]);assert.deepEqual(bundle.rights.incompleteRights,[]);
 assert.ok(b.enrichments.every(e=>e.review_version===0.1));
});

test('raw owned fields and preserved YAML match Stage 1 without loss or new vocabulary',async()=>{
 const stage=resolve(root,'../_work/migration-stage-1');
 const cul=await readJson(join(stage,'culinary-projection.json'));
 const can=await readJson(join(stage,'canonical-projection.json'));
 assert.deepEqual(bundle.snapshot.enrichments,cul.snapshot.enrichments);assert.deepEqual(bundle.snapshot.resources,cul.snapshot.resources);
 assert.deepEqual(bundle.taxonomy,cul.browsingCategoryRegistry);assert.deepEqual(pin.entries,can.entries);
 assert.deepEqual(bundle.compatibility,cul.fields.filter(f=>f.source.startsWith('knowledge/')&&!['knowledge/enrichment.yaml','knowledge/resources.yaml'].includes(f.source)));
 // Reconstruct mixed YAML from canonical raw fields and the extracted sidecar.
 const sources=new Set(bundle.compatibility.map(f=>f.source));
 for(const source of sources){const rebuilt=ownership.reconstruct([...can.fields.filter(f=>f.source===source),...bundle.compatibility.filter(f=>f.source===source)]);
  const parsed=splitter.splitDocument(source,await readFile(join(core,source),'utf8'),ownership.entryShape);assert.deepEqual(rebuilt,parsed.value,source);
 }
 for(const [source,shape,data]of [['knowledge/enrichment.yaml',ownership.enrichmentShape,bundle.snapshot.enrichments],['knowledge/resources.yaml',ownership.resourcesShape,bundle.snapshot.resources]]){
  const bytes=await readFile(join(root,'provenance/core',source));assert.deepEqual(bytes,await readFile(join(core,source)));assert.deepEqual(splitter.splitDocument(source,bytes.toString(),shape).value,data);
 }
});

test('snapshot determinism; builder uses no live Core editorial inputs',async()=>{
 const again=await build();assert.equal(json(again),json(bundle));
 // Build input hashes cover data, taxonomy and media; implementation never loads Core knowledge.
 const script=`import fs from 'node:fs/promises';import sync from 'node:fs';import {syncBuiltinESMExports} from 'node:module';
 const deny=p=>{const s=String(p).split(String.fromCharCode(92)).join('/').toLowerCase();if(s.startsWith(${JSON.stringify(core.split(String.fromCharCode(92)).join('/').toLowerCase())}+'/knowledge/')||s.startsWith(${JSON.stringify(core.split(String.fromCharCode(92)).join('/').toLowerCase())}+'/assets/'))throw Error('Live Core content read prohibited');};
 const asyncRead=fs.readFile;fs.readFile=(p,...args)=>{deny(p);return asyncRead(p,...args)};
 const syncRead=sync.readFileSync;sync.readFileSync=(p,...args)=>{deny(p);return syncRead(p,...args)};syncBuiltinESMExports();
 const {build}=await import(${JSON.stringify(pathToFileURL(join(root,'tools/build.mjs')).href)});await build();`;
 execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:root,windowsHide:true,stdio:'pipe'});
 assert.match(bundle.snapshot.provider.sourceRevision,/^sha256:[a-f0-9]{64}$/);
});

test('combined entries, resources, articles, categories and all reference pages are identical',()=>{
 assert.deepEqual(composed.entries,original.entries);assert.deepEqual(composed.resources,original.resources);assert.deepEqual(composed.enrichments,original.enrichments);assert.deepEqual(composed.diagnostics,original.diagnostics);
 let refs=0;
 for(const e of original.entries){const a=api.createReferencePage(original,e.kind,e.id),b=api.createReferencePage(composed,e.kind,e.id);assert.deepEqual(b,a,e.id);if(a)refs++;
  for(const name of [e.id,...Object.values(e.names),...Object.values(e.plural_names??{}),...(e.aliases??[]).map(x=>typeof x==='string'?x:x.name),...(e.exact_names??[]).map(x=>x.name)])for(const locale of [undefined,'en-GB','en-US'])assert.deepEqual(composed.resolve(name,e.kind,locale),original.resolve(name,e.kind,locale));
 }
 assert.equal(refs,913);
});

test('compatibility routes and historical evidence remain intact',async()=>{
 const refs=await import(pathToFileURL(join(core,'src/reference/index.ts')).href);
 const baseline=await readJson(join(root,'validation/baseline.json'));
 assert.deepEqual({ingredient:refs.ingredientCompatibilityRoutes,process:refs.nonReferenceProcessCompatibilityIds},baseline.compatibilityRoutes);
 assert.equal(refs.ingredientCompatibilityRoutes.length+refs.nonReferenceProcessCompatibilityIds.length,16);
 assert.equal(composed.entries.filter(e=>e.canonical_target).length,2);
 assert.equal(baseline.counts.legacy,19);
});

test('missing provider retains identities; invalid providers, links and review promotions fail',()=>{
 assert.equal(compose(api,canonical,undefined,pin.digest),canonical);
 assert.equal(canonical.entries.length,969);assert.equal(canonical.enrichments.length,0);
 assert.ok(api.createReferencePage(canonical,'ingredient','egg'));
 for(const patch of [{schemaVersion:2},{vocabulary:{digest:'0'.repeat(64)}},{enrichments:[{target:{kind:'ingredient',id:'missing'},review_version:0.1}]},{enrichments:[{target:{kind:'ingredient',id:'egg'},review_version:0.1,editorial:[{id:'bad',role:'summary',text:'Fixture',review_version:0.1,sources:['missing']}]}]}]){
  assert.throws(()=>compose(api,canonical,{...bundle,snapshot:{...bundle.snapshot,...patch}},pin.digest));
 }
 const observation=structuredClone(bundle.snapshot.enrichments.find(e=>e.measurements?.length));observation.measurements[0].conversion_eligible=true;
 assert.throws(()=>api.validateKnowledgeSnapshot({...bundle.snapshot,enrichments:[observation]},canonical,pin.digest));
 assert.throws(()=>compose(api,canonical,{...bundle,compatibility:[{...bundle.compatibility[0],path:['names'],form:'object'}]},pin.digest));
});

test('changed/missing media and unsafe manifest paths are rejected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'osf-knowledge-hash-'));await writeFile(join(dir,'photo.jpg'),'altered');
 await assert.rejects(verifyFiles(dir,[{path:'photo.jpg',bytes:7,sha256:'0'.repeat(64)}]));
 await assert.rejects(verifyFiles(dir,[{path:'missing.jpg',bytes:0,sha256:hash('')}])) ;
 await assert.rejects(verifyFiles(dir,[{path:'../photo.jpg',bytes:0,sha256:hash('')}])) ;
});

test('all 490 Corpus recipes preserve AST, diagnostics and Code/Compact/HTML',async()=>{
 const corpus=resolve(process.env.OSF_CORPUS??join(root,'../corpus'));
 assert.equal(git(corpus,'rev-parse','HEAD'),'921a7b27c6818aa1a25f5e2ce3b7c93ab715ced4');
 const recipes=(await files(join(corpus,'examples'))).filter(f=>f.endsWith('.opensauce'));assert.equal(recipes.length,490);
 for(const filename of recipes){const text=await readFile(filename,'utf8');const a=api.parseRecipe(text,{filename,vocabulary:original}),b=api.parseRecipe(text,{filename,vocabulary:composed});assert.deepEqual(b,a,filename);assert.equal(b.diagnostics.filter(d=>d.severity==='error').length,0,filename);assert.equal(api.renderCode(b),api.renderCode(a));assert.equal(api.renderCompact(b,{vocabulary:composed}),api.renderCompact(a,{vocabulary:original}));for(const view of ['code','compact'])assert.equal(api.renderHtml(b,{view,vocabulary:composed}),api.renderHtml(a,{view,vocabulary:original}));}
});
