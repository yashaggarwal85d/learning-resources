# Review — de.iceberg-v3-spec-features

## What this topic builds

Names Iceberg v3's eight spec features (deletion vectors, row lineage, Variant,
geometry/geography, nanosecond timestamps, the `unknown` type, column default values,
multi-argument transforms, table encryption keys), cross-references the three this chapter
already built (topics 8, 15, 20), and runs two real checks against the real installed
`pyiceberg` (0.12.0):

1. `catalog.create_table(..., properties={"format-version": "3"})` is attempted directly and
   caught raising a real, open-issue-citing `NotImplementedError`
   (`apache/iceberg-python#1551`) — v3 cannot be written by this library yet.
2. A v3-spec-only feature (a column's `initial-default` value) is added to an ordinary
   **v2-format** table (`format_version == 2`, asserted directly) via
   `UpdateSchema.add_column(..., default_value=...)`, and read back correctly on both sides of
   the fallback: an existing row gets the default, a newly appended row keeps its own written
   value. This is disclosed in FACT-CHECK.md and the reel itself as a real instance of a widely
   used v2 implementation running ahead of the version boundary the spec draws, not a v3 table.

Both results verified byte-identical across 3 separate runs of `examples.py`.

## Fixes made during this pipeline

- **coverage.json clause backticks**: the syllabus clause was initially copied verbatim from
  the Markdown source with backticks around `variant`, `geometry`/`geography`, `unknown`, and
  `initial-default`/`write-default`. `site/src/lib/syllabus.ts`'s `clean()` strips all
  backticks from the parsed syllabus scope before the coverage checker does its literal
  substring match, so the clause failed "is not in the syllabus line." Fixed by stripping all
  backticks from the clause. (Gotcha already documented in project memory
  `learning-resources-coverage-registry-gotchas.md`; this ship just re-applied it.)
- **coverage.json expert items count**: only 9 `expert.items` present, needed ≥10. Added a
  10th item documenting that the three v3 features already built in earlier topics (deletion
  vectors/topic 15, Variant/topic 8, row lineage/topic 20) are cross-referenced by name rather
  than re-demonstrated.
- **examples.py prototyping**: `catalog.create_table(..., partition_spec=None)` raised
  `AttributeError: 'NoneType' object has no attribute 'fields'` inside pyiceberg's
  `assign_fresh_partition_spec_ids`. Fixed by omitting the `partition_spec` kwarg entirely.

## Checks run

- `node scripts/sources.mjs check iceberg-v3-spec-features`: 17/17 quotes found word for word,
  0 problems.
- `python3 examples.py` ×3: byte-identical output each run.
- `node scripts/narration-teaches.mjs .../iceberg-v3-spec-features`: passed clean, no fixes
  needed (longest line 44 words).
- `node scripts/check-all.mjs --skip reels,links,narration --topic iceberg-v3-spec-features`:
  failed once on coverage.json (both issues above), passed clean on retry — locked 72.1s, docs
  0.3s, sources 0.1s, build 48.0s.
- `node scripts/check-all.mjs --only links,narration --topic iceberg-v3-spec-features`: passed,
  2136 links, 0 broken (95 title mismatches, all pre-existing/unrelated).
- `node scripts/check-all.mjs --only reels --topic .../iceberg-v3-spec-features`: passed clean
  on the first try — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Only
  the known pre-existing `test:editor` sandbox failure showed, unrelated to this topic.

## Manual screenshot review

All 24 screenshots in `site/test-results/` reviewed via direct image read:
`desktop-iceberg-v3-spec-features-01.png` through `-10.png`, `phone-...-01.png` through
`-10.png`, and all four predict-wait `-q` variants (`...-02-q.png`, `...-05-q.png` at both
desktop and phone sizes). All clean — no text overflow, no layout issues, predict/answer states
render correctly, takeaways render correctly on both viewport sizes.

## Ship status

Committed and pushed to `main` as `status: 'held'`. `renarration.json` and `registry.ts`
entries added.
