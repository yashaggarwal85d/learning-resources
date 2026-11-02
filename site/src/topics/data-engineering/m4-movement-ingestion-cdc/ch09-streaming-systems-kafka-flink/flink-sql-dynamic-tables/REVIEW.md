# Review — Flink SQL and dynamic tables

## Sources
`node scripts/sources.mjs check` on the topic folder: 29/29 quotes found word for word, 0
problems. Seven documents fetched: the Dynamic Tables, Joins, Configuration (delta-join option),
Materialized Table Overview, Process Table Functions, Changelog Conversion, and Model Inference
pages, all found at the Flink 2.3 release docs path after one redirect each, plus the Flink 2.2.0
release announcement blog for the ML_PREDICT-since-2.1 and delta-join-introduced-in-2.1 currency
facts (neither docs page itself states a version number).

## examples.py
`python3 -I examples.py` passed on the first run. Final verified numbers: append/upsert/retract
modes all agree on the final table `{'order-1': 120, 'order-3': 75}` from the same 5-event input;
upsert needs 5 messages, retract needs 6 (2 retracts, 4 adds); after 30 ticks a regular join's
state size reaches 60 while an interval join's (5-tick window) plateaus at 12; a 2-minute
freshness target chooses continuous refresh, a 60-minute target chooses full refresh.

## Build
`npm run build` from `site/` passed clean on the first attempt — syllabus line 568 (the "Flink SQL
and dynamic tables" bullet) checked for trailing boilerplate before writing `coverage.json`'s
clauses; `registry.ts`'s `title`/`syllabusTitle` match the syllabus wording exactly.

## Reel check
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/flink-sql-dynamic-tables`
reported `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The run's overall
exit code was 1 solely because of the known, pre-existing, sandbox-only `test:editor` failure
("a save did not open a new GitHub issue") — unrelated to this topic, confirmed against project
memory (`learning-resources-editor-test-sandbox-limitation.md`). No takeaway-placement or
word-count issues, since both predict/takeaway positions were planned in OUTLINE.md before writing
scenes.tsx or reel.tsx.

## Looks review
Reviewed 4 screenshots: `desktop-05` (upsert-vs-retract reveal with its takeaway, step 5, renders
cleanly under the body text with no overlap with the Row figures), `phone-03` (the first predict
step, both options render full-width with no text clipping), `desktop-09` (the lookup/delta-join
reveal with its takeaway, step 9 — correctly NOT the step right after a predict step, renders
clean), `phone-11` (Prove It step with its takeaway, renders clean with "MORE" expand affordance
visible, no overlap). All four clean on both desktop and phone.

## Checks run
- `node scripts/sources.mjs check <folder>` — pass (29/29)
- `python3 -I examples.py` — pass on first run
- `npm run build` — pass
- `node scripts/check-all.mjs --only reels --topic <slug>` — reel smoke test pass (editor
  sub-check fails for the known sandbox-only reason, disclosed above)

Shipped as `status: 'held'`.
