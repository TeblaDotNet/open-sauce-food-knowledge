/** Test-only compatibility composition; never a new Core runtime default. */
import assert from 'node:assert/strict';
export function compose(api,canonical,bundle,digest){
 if(!bundle)return canonical;
 api.validateKnowledgeSnapshot(bundle.snapshot,canonical,digest);
 const entries=structuredClone(canonical.entries);
 const byKey=new Map(entries.map(e=>[e.kind+':'+e.id,e]));
 const seen=new Set();
 for(const f of [...bundle.compatibility].sort((a,b)=>a.path.length-b.path.length)){
  assert.equal(f.owner,'open-sauce-food');
  assert.ok(/^knowledge\/(ingredients|equipment|processes)\/[a-z0-9-]+\.yaml$/.test(f.source));
  const kind=f.source.split('/')[1]==='ingredients'?'ingredient':f.source.split('/')[1]==='equipment'?'equipment':'process';
  const target=byKey.get(kind+':'+f.target);assert.ok(target,'Missing compatibility target');
  const path=f.path;assert.ok(path.length>0);
  assert.ok(path.every(k=>!['__proto__','constructor','prototype'].includes(k)));
  // Only the Stage 1 owned subtrees may be overlaid; identities are immutable.
  const allowed=['categories','regional_mappings','typical_mass','reference_density','nutrition'].includes(path[0])||
   (path.includes('part_groups')&&path.some(k=>['description','sources'].includes(k)))||
   (path[0]==='parts'&&path.some(k=>['typical_mass','reference_density','nutrition'].includes(k)));
  assert.ok(allowed,'Non-editorial compatibility field');
  const key=f.source+JSON.stringify(path);assert.ok(!seen.has(key),'Duplicate field');seen.add(key);
  let parent=target;for(const k of path.slice(0,-1)){assert.ok(parent[k]&&typeof parent[k]==='object','Missing canonical parent');parent=parent[k];}
  parent[path.at(-1)]=f.form==='array'?[]:f.form==='object'?{}:structuredClone(f.value);
 }
 return new api.Vocabulary(entries,bundle.snapshot);
}
