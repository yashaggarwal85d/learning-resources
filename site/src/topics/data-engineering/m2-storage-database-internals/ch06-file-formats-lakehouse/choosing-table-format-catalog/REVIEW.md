# Review — Choosing a table format and catalog (topic 33, §6.3.6)

## Design decision

Unlike most topics in this chapter, this one does not hand-build a running mechanism.
Its outcome requires a current, real engine read/write support matrix (Spark, Flink,
Trino, DuckDB, Snowflake, BigQuery, Redshift, across Iceberg and Delta) applied via a
decision framework to the same `analytics.events` table this chapter has built across
topics 19–32. Running seven real query engines is infeasible in this sandbox, so the
matrix is sourced data — every cell backed by a direct, word-for-word quote in
SOURCES.md from each engine's own current docs — while the decision framework that
runs over that data (`engines_that_can_write`, `recommend_format`) is real, executed
Python, asserted against a known outcome. This split is disclosed explicitly in
`examples.py`'s own docstring, SOURCES.md's Red team section, and `references.md`.

Two sourced corrections to easy assumptions are called out precisely rather than
rounded to a blanket yes/no: BigQuery's managed Iceberg tables support real DML writes
and streaming, not merely read-only external tables; and DuckDB's two write paths run
in opposite directions (Iceberg needs a catalog, then has no limit; Delta needs no
catalog, but stays append-only). The three "June 2024" consolidation events (Databricks
acquiring Tabular, Databricks open-sourcing Unity Catalog, Snowflake unveiling Polaris)
are each dated from the vendor's own press release (June 4, 12, and 3 respectively),
not rounded from a nearby month.

## Fixes made during this session

1. **Assertion-order bug** in `examples.py`: `recommend_format()` builds `missing` by
   iterating `writer_engines` in given order, not alphabetically. The initial assertion
   guessed an alphabetically-sorted result and failed; fixed to match the actual
   iteration order (`["Snowflake", "BigQuery", "DuckDB"]`). Re-verified deterministic
   across 3 runs after the fix.
2. **Apostrophe mismatch** in the Databricks Unity Catalog quote: the fetched source
   text uses a curly apostrophe (`’`), not a straight one. Caught by reading exact
   bytes around the match before writing SOURCES.md, so `sources.mjs check` passed
   clean (21/21 quotes) on the first full run.
3. **Phone-viewport text overflow** in the Recap step: the handoff line "every topic
   from here asks who reads these tables --" (10 words) ran outside the drawing frame
   at phone width. Shortened to two lines ("every topic from here asks who reads --" /
   "trino opens the general-purpose engines"), each well within the phone-width budget.
   This is the same recurring phone-text-overflow bug class as prior topics, but
   occurring in a free-standing two-line `<T>` text block rather than a `TallRow`
   label/value pair — confirming the underlying width constraint applies to any SVG
   text content, not just row pairs.

## Checks run

- `check-all.mjs --skip reels,links,narration --topic
  data-engineering/m2-storage-database-internals/ch06-file-formats-lakehouse/choosing-table-format-catalog`
  — passed clean: locked, docs, sources (21/21 quotes word-for-word), build.
- `check-all.mjs --only links,narration` — passed clean: 2176 links, 0 broken, 147
  blocked (expected), 94 pre-existing unrelated title mismatches; narration clean.
- `check-all.mjs --only reels` — first run failed on the phone Recap overflow above;
  after the `scenes.tsx` fix, re-run passed clean: "Reel smoke test passed: 1 live
  reel(s) at desktop and phone sizes."
- `test:editor` — failed with the known pre-existing sandbox limitation (not a
  regression; consistent with topics 30, 31, 32).

## Screenshot review

All 24 screenshots in `site/test-results/` reviewed manually: desktop steps 01–10,
phone steps 01–10, and the four predict-wait (`-q`) variants (desktop 02, 05; phone 02,
05). All clean. Particular attention was paid to phone step 08 (`RevealJuneTimeline`,
three stacked rows — the step shape most prone to this bug class) and phone step 10
(the fixed Recap step) — both confirmed rendering without overlap or overflow.

Closes §6.3 of chapter 6 entirely.
