/** Audit a clean source export, not a filtered worktree. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {relative,join} from 'node:path';
import {root,files,readJson,json} from './shared.mjs';
import {verifyFiles,build} from './build.mjs';
const manifest=await readJson(join(root,'provenance/extraction.json'));
const tooling=['.gitattributes','.gitignore','LICENSE','LICENSING.md','README.md','package.json','docs/migration.md','docs/rights.md','docs/testing-and-migration.md','provenance/extraction.json','tools/shared.mjs','tools/extract.mjs','tools/build.mjs','tools/source-check.mjs','tests/compose.mjs','tests/migration.test.mjs'];
const expected=new Set([...tooling,...["tools/editorial-tests.mjs","tools/frozen-baseline.mjs","tools/test.mjs","provenance/stage-0/manifest.json","provenance/stage-0/source-provenance.json","provenance/stage-0/content-inventory.json","tests/editorial/browsing-categories.test.ts","tests/editorial/cocktail-foundation-v2.test.ts","tests/editorial/cocktail-foundation.test.ts","tests/editorial/existing-page-enrichment-batch-1.test.ts","tests/editorial/existing-page-enrichment-batch-2.test.ts","tests/editorial/existing-page-enrichment-batch-3.test.ts","tests/editorial/existing-page-enrichment-batch-4.test.ts","tests/editorial/ingredient-enrichment-batch-1.test.ts","tests/editorial/ingredient-enrichment-batch-2.test.ts","tests/editorial/ingredient-enrichment-batch-3.test.ts","tests/editorial/ingredient-enrichment-batch-4.test.ts","tests/editorial/ingredient-enrichment-batch-5.test.ts","tests/editorial/ingredient-localisation.test.ts","tests/editorial/ingredient-relationships.test.ts","tests/editorial/knowledge-images-batch-1.test.ts","tests/editorial/knowledge-images-batch-2.test.ts","tests/editorial/knowledge-images-batch-3.test.ts","tests/editorial/knowledge-images-batch-4.test.ts","tests/editorial/knowledge-migration.test.ts","tests/editorial/process-domain-tranche.test.ts","tests/editorial/processes-equipment-batch-2.test.ts","tests/editorial/processes-equipment-batch-3.test.ts","tests/editorial/processes-equipment-batch-4.test.ts","tests/editorial/processes-equipment-batch-5.test.ts","tests/editorial/processes-equipment-batch-6.test.ts","tests/editorial/processes-equipment-batch-7.test.ts","tests/editorial/processes-equipment-v1.test.ts","tests/editorial/provider-baseline.test.ts","tests/editorial/reference-enrichment.test.ts","tests/editorial/reference.test.ts","tests/editorial/vocabulary-quality-batch-1.test.ts"],...manifest.files.map(f=>f.path)]);
const actual=await files(root);
assert.equal(actual.length,expected.size,'Unexpected/missing source file');
for(const p of actual){const path=relative(root,p).replaceAll('\\','/');assert.ok(expected.delete(path),'Unexpected file '+path);
 assert.ok(!/\.(zip|7z|tar|gz|log)$/i.test(path),'Archive/log');
 if(!/\.(md|json|yaml|yml|ts|mjs|js|txt)$/.test(path))continue;
 const text=await readFile(p,'utf8');
 assert.ok(!/[A-Z]:[\\/](?:Users|Projects)[\\/]/.test(text),'Machine path '+path);
 assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}/.test(text),'Credential pattern '+path);
}
assert.equal(expected.size,0);await verifyFiles(root,manifest.files.filter(f=>!/^(data|taxonomy|assets)\//.test(f.path)));await verifyFiles(root,await readJson(join(root,'provenance/stage-0/manifest.json')));
const current=await build(root);assert.deepEqual(current.rights.incompleteRights,[],'Incomplete active photograph rights');
console.log(json({files:actual.length,explicitInventory:'passed',sourceHashes:'passed',privateArtifacts:'absent',credentialPatterns:'absent'}));
