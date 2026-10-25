# Open Sauce Food Knowledge

**Local Stage 2 migration candidate. Core remains the authoritative editable
source. Do not independently edit extracted data until the Stage 3/4 cutover.**
This repository is not published or connected to GitHub. The intended future
repository is `TeblaDotNet/open-sauce-food-knowledge`.

Open Sauce Food Knowledge holds optional culinary articles, sources, photographs,
measurements and browsing information. Sauce Code owns grammar, canonical IDs,
names, aliases, identity relationships and interpretation algorithms. A valid
canonical concept does not require an article or this provider.

The candidate preserves 911 draft articles, 775 sources, 349 photographs and one
provisional, conversion-ineligible brown-sugar observation. No typical-mass,
density or nutrition values were added. No reviews were promoted.

## Layout

- `data/enrichment.json`: existing enrichment records, with text, ordering, review,
  resources, associations, image metadata and observations unchanged.
- `data/resources.json`: the full source registry.
- `data/quantities.json`: empty at this baseline; future values use Core contracts.
- `data/compatibility.json`: Stage 1 typed field records for browsing memberships,
  regional comparisons and part-group editorial fields in mixed canonical YAML.
- `taxonomy/categories.json`: existing browsing taxonomy.
- `assets/references/`: exact original photograph paths, attribution and selections.
- `validation/`: generated, pinned canonical manifest and inventory, **not an
  independently editable vocabulary**. Sauce Code remains its only authority.
- `provenance/`: original source bytes, licensing/history and the extraction manifest.
  These archives are evidence, not alternative editable registries.
- `tools/`, `tests/`: offline build, extraction and test-only composition.

JSON follows the existing snapshot/registry shapes. Original YAML bytes remain in
`provenance/core/knowledge/`; conversion preserves values and order, not YAML layout.
Images are neither recompressed nor renamed. [Attribution](assets/references/ATTRIBUTION.md)
and [licensing](LICENSING.md) remain part of any redistribution.

## Local build and tests

Use Node.js 24 or newer. No new npm dependencies, network requests or package
installation are needed. Keep the pinned Stage 1 Core checkout beside this repo,
with its existing development dependencies available for the full parity tests.
Set `OSF_CORE` to an explicit checkout if needed. It must be commit
`cb5922c1c5239d2b126588c3098fc40d94adf9e9`.

```
node tools/build.mjs
node --test tests/*.test.mjs
```

Build reads only this repository's content and pinned Core implementation APIs.
It never reads live Core articles, source registries or photographs. The tests also
need the original Stage 1 evidence at `../_work/migration-stage-1/` and all 490
recipes in sibling Corpus (or `OSF_CORPUS`), pinned to
`921a7b27c6818aa1a25f5e2ce3b7c93ab715ced4`. Tests intentionally fail rather than
silently skip when these migration inputs are absent.

`dist/snapshot.json` implements Core's schema-version-1 offline contract. Provider
version is `0.1.0-stage-2`. Its `sourceRevision` is a SHA-256 content revision of
ordered input paths/hashes, avoiding a self-referential Git commit in generated
data. `provenance/extraction.json` records exact original Core and contract commits;
the delivery receipt also records this repository's commit.

`dist/compatibility.json` and `dist/taxonomy.json` accompany the snapshot because
Stage 1's minimal contract does not carry those dimensions. `dist/media.json`
resolves every hero to an exact asset path/hash and its original licence metadata.
Distribute `assets/` with the JSON bundle; photograph bytes are not embedded.
`dist/manifest.json` hashes every generated component. Dist is ignored and rebuildable.

For extraction reproduction, `tools/extract.mjs` uses the pinned Core and Stage 1
evidence, refusing to overwrite an existing `data/` directory. Use a fresh checkout
of the tooling with no extracted data, never delete the current candidate just to
rerun it. Core sources are read-only throughout.

Run `node tools/source-check.mjs` from a clean tracked-source export. It checks the
explicit inventory, source hashes, disallowed artifacts, paths and credential
patterns. It deliberately does not silently filter a working directory.

## Migration boundary and future contributions

`tests/compose.mjs` is a test adapter, not a production provider integration. It
combines canonical entries with the snapshot and only the approved editorial
compatibility fields. Core runtime defaults, CLI behaviour, Site URLs and editor
ranking are unchanged. Site integration is deferred to Stage 4.

Contribute to the existing Core source until ownership cutover. Later changes must
retain stable concept targets, source citations, image rights, uncertainty and
honest review status. After cutover, regenerate the snapshot and review data diffs;
never edit the generated canonical manifest to invent or rename a concept.

See [migration and rollback](docs/migration.md) and [licensing findings](docs/rights.md).

For later validated Core contracts, set OSF_CORE_REVISION to the exact 40-character
commit of the supplied Core checkout. It must descend from Stage 1; the default
remains the Stage 1 pin. This only selects implementation APIs, not live editorial
data. Extraction provenance, canonical digest and candidate authority are unchanged.
