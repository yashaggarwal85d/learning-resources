# Review — de.iceberg-statistics-puffin-files

## What this topic builds

Two real statistics mechanisms built and verified against real pyiceberg (0.12.0):

1. A real manifest's column metrics, read off `table.inspect.data_files()`: a 200-byte and a
   43-byte string value are both stored as 16-byte bounds, with the upper bound's final byte
   incremented so it still sorts above the real value. Matches the spec's statement that
   string/binary bounds are never tight.
2. A real Puffin file, byte-exact to the Puffin file format spec's Magic/Blob/Footer structure,
   holding a real from-scratch Theta/KMV sketch over the table's `id` column. Registered on the
   table through pyiceberg's own real public `update_statistics()`/`set_statistics()` API, then
   read back by parsing the raw bytes independently of pyiceberg (which has no public Puffin
   reader), with the sketch's NDV estimate checked against the table's true distinct count
   (consistently ~0.3% error on 20,000 rows across 3 determinism-check runs).

Partition statistics files and Trino's cost-based join enumeration consuming these statistics are
named from sourced documentation, not built/exercised, per this topic's own CHAPTER.md scope.

## Disclosed scope boundary

The sketch payload's wire bytes are this script's own from-scratch serialization, not the real
Apache DataSketches library's format the Puffin spec names for the `apache-datasketches-theta-v1`
blob type — this repo's baseline environment has no dependency on that library, and the house
convention (Chapter 5's HyperLogLog topic) is to implement sketch algorithms from first principles
rather than add new pip dependencies with no install path in this repo's build pipeline. The
Puffin *container* (magic bytes, blob placement, footer JSON, sizes) is genuinely byte-exact to
spec and independently re-parsed in step 7. Disclosed directly in `examples.py`'s docstring and
FACT-CHECK.md's red-team #1.

## Fixes made during this pipeline

- **reel.tsx digit provenance**: step 3's body text stated "43-byte" for the mid-length string
  value, but 43 is never a literal token in `examples.py`'s source (only computed at runtime via
  `len()`). Fixed by rewording to avoid stating that exact figure, keeping only "200-byte" (a
  literal in `examples.py` via `LONG_NAME = "z" * 200`).

## Checks run

- `node scripts/sources.mjs check iceberg-statistics-puffin-files`: 17/17 quotes found word for
  word, 0 problems.
- `python3 examples.py` ×3: byte-identical output each run.
- `node scripts/narration-teaches.mjs .../iceberg-statistics-puffin-files`: passed clean (longest
  line 47 words, no description-overlap issues).
- `node scripts/check-all.mjs --skip reels,links,narration --topic iceberg-statistics-puffin-files`:
  failed once on the digit-provenance check (above), passed clean on retry — locked 72.2s, docs
  0.2s, sources 0.0s, build 45.4s.
- `node scripts/check-all.mjs --only links,narration --topic iceberg-statistics-puffin-files`:
  passed, 2139 links, 0 broken (90 title mismatches, all pre-existing/unrelated).
- `node scripts/check-all.mjs --only reels --topic .../iceberg-statistics-puffin-files`: passed
  clean — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Only the known
  pre-existing `test:editor` sandbox failure showed, unrelated to this topic.

## Manual screenshot review

All 24 screenshots in `site/test-results/` reviewed via direct image read: desktop 01–10, phone
01–10, and all four predict-wait `-q` variants (02-q, 05-q at both sizes). All clean — no text
overflow, no layout issues, predict/answer states render correctly, takeaways render correctly on
both viewport sizes.

## Ship status

Committed and pushed to `main` as `status: 'held'`. `renarration.json` and `registry.ts` entries
added.
