# Stage 2 extraction and rollback

Original content baseline: `bc6060a29223a2a52443ad62f5e566a2114ffcc6`.
Stage 1 contracts: `cb5922c1c5239d2b126588c3098fc40d94adf9e9`.
The extraction manifest records source paths, source hashes, destination hashes,
source revision and the Stage 1 evidence digests. The owned-field inventory retains
classification, target and compatibility handling for each projected field.

Original registries, image/attribution/selection files, licensing and relevant
historical documents are retained byte-for-byte. JSON registry extraction and
mixed-field reconstruction are checked for semantic equality and array order.
The generated canonical manifest is read-only validation input. Canonical YAML,
unindexed historical identities and resolver semantics remain solely in Core.

Transitional `reference`, `scope`, curation and identity evidence remain in the
canonical manifest/Core. Browsing categories, regional comparisons and part-group
prose are restored through the test-only compatibility sidecar. No new aliases,
page eligibility, URL policy or review promotions are introduced.

Stage 2 changes no production consumers. Rollback requires no data restoration:
keep using unchanged Core and ignore this candidate. Do not delete Core sources or
photos. Preserve this extraction commit/manifests for reproducibility. No existing
branch or repository is rebased, rewritten or renamed.

Stage 3 must introduce explicit provider composition and sole-authority rules.
Stage 4 must validate Site generation, links, image resolution and browser output.
This stage validates all reference models and recipe rendering with Core APIs, but
does not claim a new Site build or browser validation.

The preserved CC BY 4.0 licence has a blank line at EOF. Git reports this on the
original licence and archived copy; the bytes are intentionally retained. New
tooling/documentation pass a separate whitespace check. No assertion is disabled.
