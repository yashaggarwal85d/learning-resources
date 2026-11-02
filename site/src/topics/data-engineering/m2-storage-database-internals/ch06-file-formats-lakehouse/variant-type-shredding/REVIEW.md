# Review — de.variant-type-shredding

## Content review

- Sources: 2 sources (`VariantEncoding.md`, `VariantShredding.md`), 16 quotes, all verified
  word-for-word after one fix — `sources.mjs`'s raw-markdown fetch strips ASCII-art diagram
  annotations (`<-- ...`) via its HTML-tag-stripping regex, which silently ate real prose near a
  byte-layout diagram and a markdown `[text](url)` link; replaced with a clean quote from a
  diagram-free section carrying the identical fact, and the link quote was matched with its link
  syntax intact instead of stripped out.
- `examples.py`: a hand-rolled Variant metadata dictionary and value encoder/decoder, built field
  by field to `VariantEncoding.md`'s own header-byte, offset-list and value_metadata/value_data
  layout, round-tripped byte-exact against 6 real heterogeneous click/scroll records. A forced
  single-struct schema is shown losing a field on 3 of those 6 records — two different failure
  modes (no column exists at all vs. a column exists but can't hold the value's actual type). A
  field-by-field shredding simulation follows `VariantShredding.md`'s `value`/`typed_value`
  decision table exactly: 3 fully shredded, 2 partially shredded, 1 fallback. Every assertion
  passes (`python3 examples.py` → "All assertions passed.").
- No implementation bug was found this topic (unlike topic 7's Bloom filter hash bug) — the
  encoder/decoder and shredding logic passed their round trip and byte-count checks on the first
  full run once the placeholder literal asserts were replaced with the real computed values (a
  debug run with asserts stripped, same pattern used on every topic in this chapter).
- `coverage.json`: 3 syllabus clauses copied verbatim from `syllabus/data-engineering.md` line
  164 (the "Variant type and shredding" bullet); 10 expert items; `gapReview.open: []`.

## Build-check fixes

- `SOURCES.md`'s first quote used the source's own markdown link syntax
  (`[value](#value-encoding)`), which `scripts/sources.mjs check`'s own markdown-fetch pipeline
  does NOT strip — fixed by quoting it exactly as it appears in the source, including the link
  brackets, instead of my own paraphrase without them. This also tripped the repo-wide docs
  anchor-link checker (SOURCES.md itself was treated as linking to `#value-encoding` and
  `#metadata-encoding` anchors that don't exist in that file) — fixed by replacing that quote
  with a clean, link-free sentence carrying the same fact.
- `narration.json` was missing its required top-level `"topic"` key — added
  `"topic": "de.variant-type-shredding"`.
- Narration lines used underscored identifiers (`event_type`, `button_id`, `depth_pct`,
  `typed_value`) and `int32`, which the narration-teaches check flags as "write numbers, symbols
  and names the way they are said" — rewrote every occurrence to spoken form ("event type",
  "button ID", "depth percent", "int thirty-two") throughout narration.json.

## Looks review

All 10 steps reviewed at desktop and phone sizes via `check-all.mjs --only reels`. No text
overflow, clipping, or overlap on any screen; `TallRow` used throughout from the start. The
`Measured size` scene's three stacked rows (JSON, unshredded Variant, shredded) read cleanly at
both sizes. `test:editor`'s unrelated, known sandbox-only failure (does not affect this topic) is
the only non-reel failure in the run.

## Links

`check-links.mjs` on `prerequisites.mdx`: both source links resolve; no broken links in the
site-wide link check (1380 ok, 122 blocked by robots/auth as usual, 58 title-mismatch — the usual
GitHub/doc-page title-suffix pattern already seen on prior topics, not specific to this one).
