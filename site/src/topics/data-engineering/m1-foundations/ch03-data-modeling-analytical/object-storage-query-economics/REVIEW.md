# Review — de.object-storage-query-economics

## Content summary

13 steps covering the §3.3 chapter lab's own subject: object storage's several independent
billing axes (storage, requests/retrievals, data transfer, and storage class), the two genuinely
different query-compute billing models (bytes-scanned on-demand pricing versus flat-rate
reserved-capacity pricing), and how file format and file layout move bytes actually scanned. The
central, deliberately surprising result: partitioning a dataset by month cuts bytes scanned
dramatically for a query narrowed to one month, but *increases* bytes scanned for a query
spanning every month, on the exact same underlying rows — the right layout depends on the query
shape, not on a universal "more partitioning is better" rule. Three predicts (first at step 3,
within the first four), three takeaways, closing with a "Prove it" that asks which layout fits a
permanently narrow access pattern.

This topic hosts the §3.3 chapter lab (`CHAPTER.md`). The lab is real and executed, not
hypothetical: a synthetic orders dataset, generated fresh on every run, is stored as JSON, as a
single Parquet file, as a Hive-partitioned-by-month Parquet directory, and as an Iceberg table,
then a narrow query and a broad query are run against each with DuckDB's own profiler
(`io.total_bytes_read`) measuring actual bytes read — not estimated from file size. The Iceberg
table built here is unpartitioned, a disclosed limitation of this sandbox's DuckDB build (which
writes one data file per table regardless of a `PARTITION_BY` clause); the measured claim about it
is scoped to the unpartitioned case only.

## Sources

AWS S3 Pricing and Google Cloud's BigQuery pricing page. 7 quotes total, verified word for word
(`node scripts/sources.mjs check`, 0 problems). Both pages' exact current dollar rates render
client-side and are not reproducible as static quoted text; only the billing *structure* is
quoted, disclosed explicitly in SOURCES.md rather than inventing or guessing a plausible number.

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 8, 9, 11).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 29%). One fix needed: step 10's first draft echoed the
  description sentence almost verbatim; rewritten to frame the same question from a different
  angle (see Fixes below).
- No literal digits appear in `reel.tsx` at all. This topic's measured numbers are real runtime
  output from a profiler and genuinely vary slightly run to run, so every comparison is spelled
  as a relative word ("far more," "fewer," "more, not less") backed by a ratio assertion in
  `examples.py`, never presented as a fixed, memorized figure.

## Fixes made during this build

- The build's own narration-teaches check caught step 10's first draft reading the on-screen
  description almost word for word ("an iceberg table adds transactions and a catalog on top
  of..."); rewritten to ask the same question through a different framing instead of repeating
  the visual's text.
- No coverage, takeaway-count, or step-title-mismatch fixes were needed this time — `coverage.json`
  was written with 11 expert items and `at.step` values copied from the final `reel.tsx` titles
  from the start, and the syllabus clause for "storage classes and retrieval latency" was folded
  into step 2's body text up front rather than discovered missing by the build's coverage checker.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short 1–3-word Row label/value pattern from the start and passed clean on the first run.

## Checks run

- `node scripts/sources.mjs check` — 7/7 quotes verified word for word.
- `python3 examples.py` — pass, "object-storage-query-economics examples: all numbers check out"
  (the lab itself: generates the dataset, writes all four layouts, runs both queries against
  each via DuckDB, asserts the measured ratios described above).
- `node scripts/check-all.mjs --skip reels,links --topic object-storage-query-economics` — pass
  (locked, docs, sources, build, narration) after the one narration fix above.
- `node scripts/narration-teaches.mjs .../object-storage-query-economics` — pass, all 13 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic object-storage-query-economics` — pass,
  Playwright desktop and phone, clean on the first run.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
