/** One-time, pinned Stage 1 extraction. No writes to Core or other repositories. */
import {readFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {root,core,stage0,stage1,hash,json,stable,readJson,write,git,safePath} from './shared.mjs';
assert.equal(git(core,'rev-parse','HEAD'),stage1);
assert.equal(git(core,'status','--porcelain','--untracked-files=no'),'');
git(core,'merge-base','--is-ancestor',stage0,stage1);
const evidence=join(root,'../_work/migration-stage-1');
const determinism=await readJson(join(evidence,'determinism.json'));
for(const d of determinism)assert.equal(hash(await readFile(join(evidence,d.file))).toUpperCase(),d.sha256.toUpperCase());
const state=await readJson(join(evidence,'status.json'));assert.equal(state.ok,true);assert.equal(state.unresolved,0);
const culinary=await readJson(join(evidence,'culinary-projection.json'));
const canonical=await readJson(join(evidence,'canonical-projection.json'));
const original=await readJson(join(evidence,'source-provenance.json'));
const inventory=await readJson(join(evidence,'inventory-comparison.json'));
const ownership=await readJson(join(evidence,'ownership-manifest.json'));
// Never overwrite an existing extraction.
await mkdir(join(root,'data'));
const records=[];
async function save(path,bytes,source,sourceHash){safePath(path);await write(join(root,path),bytes);records.push({path,sha256:hash(bytes),bytes:Buffer.byteLength(bytes),source,sourceRevision:stage0,...(sourceHash?{sourceHash}:{})});}
async function generated(path,value,source){await save(path,json(value),source);}
await generated('data/enrichment.json',culinary.snapshot.enrichments,'knowledge/enrichment.yaml');
await generated('data/resources.json',culinary.snapshot.resources,'knowledge/resources.yaml');
await generated('data/quantities.json',culinary.snapshot.quantities??[],'No populated typical_mass/reference_density/nutrition in Stage 0');
const mixed=culinary.fields.filter(f=>f.source.startsWith('knowledge/')&&!['knowledge/enrichment.yaml','knowledge/resources.yaml'].includes(f.source));
await generated('data/compatibility.json',mixed,'Stage 1 Open Sauce Food-owned fields in mixed canonical YAML');
await generated('taxonomy/categories.json',culinary.browsingCategoryRegistry,'src/vocabulary/categories.ts');
await generated('validation/canonical-manifest.json',{generated:true,editable:false,sourceRevision:stage0,contractRevision:stage1,digest:canonical.digest,entries:canonical.entries},'Stage 1 canonical projection; validation only, never independently edit');
await generated('validation/baseline.json',{counts:inventory.counts,compatibilityRoutes:inventory.compatibilityRoutes},'Stage 0/1 inventory');
const sourceNames=new Set(['knowledge/enrichment.yaml','knowledge/resources.yaml','assets/references/selection.json']);
for(const doc of original.documents){if(!sourceNames.has(doc.source))continue;const bytes=await readFile(join(core,doc.source));assert.equal(hash(bytes),doc.sha256);assert.equal(bytes.toString('utf8'),doc.text);await save('provenance/core/'+doc.source,bytes,doc.source,doc.sha256);}
for(const doc of original.supportSources){const bytes=await readFile(join(core,doc.source));assert.equal(hash(bytes),doc.sha256);await save('provenance/core/'+doc.source,bytes,doc.source,doc.sha256);}
for(const item of ownership.files.filter(f=>f.source.startsWith('assets/references/'))){const bytes=await readFile(join(core,item.source));assert.equal(hash(bytes),item.sourceHash);await save(item.source,bytes,item.source,item.sourceHash);}
for(const name of ['MIT.txt','CC0-1.0.txt','CC-BY-4.0.txt']){const p='LICENSES/'+name;const bytes=await readFile(join(core,p));await save(p,bytes,p,hash(bytes));}
await generated('provenance/owned-fields.json',culinary.fields.map(({value,...f})=>f),'Stage 1 field manifest; values held in candidate source data');
await write(join(root,'provenance/extraction.json'),json({schemaVersion:1,status:'migration-candidate-core-remains-authority',coreSourceRevision:stage0,contractRevision:stage1,canonicalDigest:canonical.digest,stage1Evidence:determinism,counts:inventory.counts,files:records}));
console.log(json({files:records.length,counts:inventory.counts,mixedFields:mixed.length}));
