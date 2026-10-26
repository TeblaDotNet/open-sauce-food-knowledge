# Open Sauce Food Knowledge

**Open Sauce Food — an open culinary encyclopaedia and recipe collection built using Sauce Code.**

Knowledge is the default **optional** culinary provider, never an implicit parser dependency. Canonical identities can have an article, measurements, photographs, some combination or no enrichment.

**Current ownership: the sole editable source for Open Sauce Food editorial and quantitative knowledge. Sauce Code Core remains the sole canonical-vocabulary authority.**
This repository is not published or connected to GitHub. The intended future
repository is `TeblaDotNet/open-sauce-food-knowledge`.

Open Sauce Food Knowledge holds optional culinary articles, sources, photographs,
measurements and browsing information. Sauce Code owns grammar, canonical IDs,
names, aliases, identity relationships and interpretation algorithms. A valid
canonical concept does not require an article or this provider.

The initial cutover preserves 911 draft articles, 775 sources, 349 photographs and one
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

Use Node.js 24 or newer and a validated Stage 4B-or-later Core checkout with its
existing development dependencies. No network requests are needed. Set OSF_CORE
to that checkout and OSF_CORE_REVISION to its exact full commit hash. The old
Stage 1 default is retained for extraction history, not current build/test use.

Run node tools/build.mjs to build and pnpm test (or node tools/test.mjs) for the
complete snapshot and migrated editorial suite. Set OSF_CORPUS and, for a later
Corpus tooling commit, OSF_CORPUS_REVISION explicitly.

Build reads only this repository's content and pinned Core implementation APIs.
It never reads live Core articles, source registries or photographs. The tests also
use the frozen Stage 0/1 evidence in `provenance/stage-0/` and all 490
recipes in sibling Corpus (or `OSF_CORPUS`), pinned to
`921a7b27c6818aa1a25f5e2ce3b7c93ab715ced4`. A later explicitly pinned OSF_CORPUS_REVISION is allowed only with unchanged recipe/source payloads. Tests intentionally fail rather than
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
ranking are unchanged. Site consumes the explicit provider through four-input integration.

Contribute canonical identity changes to Core and editorial changes here. Changes must
retain stable concept targets, source citations, image rights, uncertainty and
honest review status. Regenerate the snapshot and review data diffs;
never edit the generated canonical manifest to invent or rename a concept.

See [migration and rollback](docs/migration.md) and [licensing findings](docs/rights.md).

For later validated Core contracts, set OSF_CORE_REVISION to the exact 40-character
commit of the supplied Core checkout. It must descend from Stage 1; the default
remains the Stage 1 pin. This only selects implementation APIs, not live editorial
data. Extraction provenance and the canonical digest remain unchanged; editorial authority moved to Knowledge in Stage 4B.

## Stage 4B test and editing workflow

Set OSF_CORE to an explicit Core checkout and OSF_CORE_REVISION to its full current commit. Set OSF_CORPUS for the full recipe parity suite. Run pnpm test for snapshot/integrity tests plus all migrated editorial assertions. Core itself never discovers Knowledge. The tests reconstruct a frozen Stage 0 API/source fixture from retained local Git history and checksum-pinned provenance; they do not read active Core editorial files. No network is needed.

Current data, taxonomy and photographs are authoritative here. Builds hash current active inputs; the initial extraction manifest remains immutable historical evidence rather than a lock on future edits. The initial-cutover parity tests deliberately retain historical expected values: future reviewed content changes must distinguish new editorial expectations from preserved extraction assertions. Canonical pins remain generated validation inputs, not independently edited vocabulary.

The derived work/editorial-* test workspace is disposable and not an editorial source. Browsing labels/descriptions/memberships come from this provider. Original prose CC BY 4.0 applies only where necessary rights are held; existing uncertain rights and photograph licences remain unchanged.

## Test families and future updates

Current-content validation builds from data/, taxonomy/ and assets/: it checks targets, sources, review metadata, image rights fields and generated snapshots. Immutable migration parity verifies the original extraction against provenance/stage-0 and historical revisions. These are different purposes, even though pnpm test currently runs them together. The original 911/775/349 extraction counts are evidence, not permanent permitted encyclopaedia sizes.

Full tests require Core Git objects including bc6060a29223a2a52443ad62f5e566a2114ffcc6 and cb5922c1c5239d2b126588c3098fc40d94adf9e9, retained Knowledge history (including f3122240ff4809e4a2ee6bc68fe178da259b592d), git archive, tar, Core node_modules and permission to create directory links (Windows junctions). OSF_STAGE0 can select an explicit frozen fixture; it is not a replacement for evidence checks. Corpus is optional to building a snapshot but required for the full editorial parity suite.

The editorial adapter constructs work/editorial-* and frozen Stage 0 workspaces so unchanged Core-shaped test imports can exercise current provider data against historical APIs. These generated workspaces are not editable sources or runtime dependencies.

**Known implementation limit:** tools/build.mjs currently requires exactly 349 photographs. Legitimate additions need a separately reviewed implementation/test change separating evolving inventory checks from immutable extraction parity. Do not delete the assertion, rewrite historical manifests or pretend this documentation removed that limit. For future content updates: retain frozen evidence, change current-content expectations with reviewed data, preserve targets/rights/review status, rebuild and run both test families.

[Architecture/setup matrix](../core/docs/ecosystem.md) · [Contribution and AI-development disclosure](../core/CONTRIBUTING.md#development-process). Code test coverage does not establish human culinary review.

## Prose reuse and publication

Original editorial prose with established rights may be CC BY 4.0. Uncertain prose receives no additional project-granted general reuse licence; third-party terms and existing valid grants remain intact. No article-level clearance metadata is inferred. See [how to determine scope](LICENSING.md#determining-the-applicable-prose-scope). Permission to publish is separate from permission granted to downstream reusers.
