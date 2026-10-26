# Open Sauce Food Knowledge

This repository contains the reference material behind [Open Sauce Food](https://tebla.net/opensaucefood/): articles about ingredients, equipment and cooking processes, together with sources, photographs and browsing categories.

[Sauce Code](https://github.com/TeblaDotNet/sauce-code) supplies the shared vocabulary and recipe language. This repository adds information about those terms. A term can exist in Sauce Code without having an article here.

The collection has more than 900 draft articles and 349 photographs. The articles haven't been systematically reviewed by people, and measurements for practical conversions are still largely unpopulated.

## What's here

| Path | Contents |
| --- | --- |
| `data/enrichment.json` | Articles, relationships, review information and other editorial data |
| `data/resources.json` | Article sources and references |
| `data/quantities.json` | Quantitative observations (not yet populated for useful conversions) |
| `taxonomy/categories.json` | Categories used for browsing |
| `assets/references/` | Photographs, selections and attribution |
| `provenance/` | Original source and migration records |

The generated `validation/` data is for checking that articles point to real Sauce Code terms. It's not a second vocabulary to edit.

## Building the knowledge files

The build produces an offline snapshot that applications can use alongside Sauce Code.

You'll need Node.js 24+, pnpm and a local Sauce Code Core checkout with its development dependencies. Set `OSF_CORE` to that checkout and `OSF_CORE_REVISION` to the exact commit being used, then run:

```sh
node tools/build.mjs
```

The output is in `dist/`. To run the full test suite, you'll also need the historical test inputs and a Corpus checkout described in [testing and migration notes](docs/testing-and-migration.md).

## Contributing

Article text, photographs and measurements belong here. New shared terms and aliases belong in [Sauce Code Core](https://github.com/TeblaDotNet/sauce-code). Keep article references stable, record sources and image credits, and be clear about what has and hasn't been checked.

**Licensing varies by material.** Photographs have individual licences, and some article prose has unresolved rights. The repository is not entirely CC BY 4.0. Please read [licensing](LICENSING.md) and [rights notes](docs/rights.md) before reusing content or contributing it.

For the development history and older parity tests, see [testing and migration](docs/testing-and-migration.md).
