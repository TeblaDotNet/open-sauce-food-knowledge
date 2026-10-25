/** Audit a clean source export, not a filtered worktree. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {relative,join} from 'node:path';
import {root,files,readJson,json} from './shared.mjs';
import {verifyFiles} from './build.mjs';
const manifest=await readJson(join(root,'provenance/extraction.json'));
const tooling=['.gitattributes','.gitignore','LICENSE','LICENSING.md','README.md','package.json','docs/migration.md','docs/rights.md','provenance/extraction.json','tools/shared.mjs','tools/extract.mjs','tools/build.mjs','tools/source-check.mjs','tests/compose.mjs','tests/migration.test.mjs'];
const expected=new Set([...tooling,...manifest.files.map(f=>f.path)]);
const actual=await files(root);
assert.equal(actual.length,expected.size,'Unexpected/missing source file');
for(const p of actual){const path=relative(root,p).replaceAll('\\','/');assert.ok(expected.delete(path),'Unexpected file '+path);
 assert.ok(!/\.(zip|7z|tar|gz|log)$/i.test(path),'Archive/log');
 if(!/\.(md|json|yaml|yml|ts|mjs|js|txt)$/.test(path))continue;
 const text=await readFile(p,'utf8');
 assert.ok(!/[A-Z]:[\\/](?:Users|Projects)[\\/]/.test(text),'Machine path '+path);
 assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}/.test(text),'Credential pattern '+path);
}
assert.equal(expected.size,0);await verifyFiles(root,manifest.files);
console.log(json({files:actual.length,explicitInventory:'passed',sourceHashes:'passed',privateArtifacts:'absent',credentialPatterns:'absent'}));
