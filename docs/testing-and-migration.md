# Knowledge builds, tests and migration history

This is the contributor reference for the Knowledge repository's generated data and historical extraction tests. The [README](../README.md) is the starting point for editing articles.

## Building the snapshot

Use Node.js 24+, a validated Core checkout with installed dependencies, and the exact `OSF_CORE` / `OSF_CORE_REVISION` values for that checkout. The Stage 1 default revision remains for extraction history; it is not a suitable implicit pin for ordinary current builds.

```sh
node tools/build.mjs
pnpm test
```

For the full tests, set `OSF_CORPUS` and (where required) `OSF_CORPUS_REVISION` to an approved Corpus checkout. Core provides the parsing and snapshot contract; this repository alone provides the editable articles, sources, taxonomy and photographs.

The build produces `dist/snapshot.json` (schema version 1, provider version `0.1.0-stage-2`). `sourceRevision` is a SHA-256 content revision of ordered inputs rather than the current Git HEAD. `dist/compatibility.json`, `dist/taxonomy.json` and `dist/media.json` accompany it, and `dist/manifest.json` records component hashes. Distribute the applicable `assets/` along with JSON metadata; photographs are not embedded in the snapshot.

Original YAML bytes remain under `provenance/core/knowledge/`; the current JSON preserves values and ordering, not the original YAML formatting. Images have not been renamed or recompressed.

## Two kinds of tests

**Current-content tests** check the editable `data/`, `taxonomy/` and `assets/` files, article targets, sources, review metadata and media records.

**Historical extraction/parity tests** establish that the original repository split preserved earlier content and behaviour. They use frozen Stage 0/1 evidence, Git history and a derived Core-shaped test workspace. Those historical expectations are not permanent limits on the number of articles or photographs.

Full parity tests require retained Core Git objects (including `bc6060a29223a2a52443ad62f5e566a2114ffcc6` and `cb5922c1c5239d2b126588c3098fc40d94adf9e9`), retained Knowledge history including `f3122240ff4809e4a2ee6bc68fe178da259b592d`, `git archive`, `tar`, Core dependencies and directory-link support (Windows junctions). The frozen recipe baseline uses Corpus revision `921a7b27c6818aa1a25f5e2ce3b7c93ab715ced4`; a later explicit pin is acceptable only where payload parity permits it. `OSF_STAGE0` can point to frozen fixtures; it does not replace provenance checks.

`tests/compose.mjs` is a test adapter, not a production integration. The derived `work/editorial-*` directories are disposable and must not be edited as content. Source extraction with `tools/extract.mjs` belongs in a fresh, empty extraction workspace: it refuses to overwrite existing `data/`. Never delete current data just to rerun an old extraction.

## Adding content

The initial split preserved 911 articles, 775 sources and 349 photographs. Those counts document the original extraction, not a limit on the encyclopaedia. However, `tools/build.mjs` currently expects exactly **349 photographs**. Before adding photographs, the active-inventory assertion must be separated from frozen migration parity and properly tested; deleting the assertion is not a substitute.

Change current editorial expectations only with reviewed data, keep the historical manifest intact, and run both test families. `validation/` is a generated canonical check, not an editorial source. `node tools/source-check.mjs` is intended for a clean tracked-source export.

See [migration and rollback](migration.md) and [rights findings](rights.md) for the detailed history and material-specific licensing limits.
