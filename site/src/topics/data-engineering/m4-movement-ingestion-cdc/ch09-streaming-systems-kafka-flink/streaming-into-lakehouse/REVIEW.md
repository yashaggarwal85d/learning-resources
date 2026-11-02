# Review — Streaming into the lakehouse

## Sources
`node scripts/sources.mjs check` on the topic folder: 12/12 quotes found word for word, 0
problems, clean on the first attempt. Five documents fetched: Confluent's Tableflow overview,
Redpanda's About Iceberg Topics, Apache Iceberg's Flink Writes page, Apache Paimon's
Primary-Key Table concepts page, and Apache Fluss's docs Introduction page. Two paths needed
correction before fetching (Paimon's and Fluss's docs sites had moved from the paths found in
initial web search results to `/docs/master/primary-key-table/` and `/docs/`, confirmed via
WebFetch before retrying).

## examples.py
`python3 -I examples.py` passed on the first run. Final verified numbers: committing every 1000
events on 10,000 total events produces 10 files at 500 events average staleness; committing
every 500 events produces 20 files (exactly double) at 250 events average staleness (exactly
half); the same 500-event cadence, run through an LSM-style compaction buffer merging in groups
of 5, lands 4 files instead of 20 (a fifth).

## Build
`npm run build` from `site/` passed clean on the first attempt — syllabus line 573 (the
"Streaming into the lakehouse" bullet) checked for trailing boilerplate before writing
`coverage.json`'s clauses; `registry.ts`'s `title`/`syllabusTitle` match the syllabus wording
exactly.

## Reel check
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/streaming-into-lakehouse`
reported `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The run's overall
exit code was 1 solely because of the known, pre-existing, sandbox-only `test:editor` failure
("a save did not open a new GitHub issue") — unrelated to this topic, confirmed against project
memory (`learning-resources-editor-test-sandbox-limitation.md`). Predict/takeaway positions
(predicts at steps 3 and 7, takeaways at steps 5, 9, 11) were planned in OUTLINE.md before
writing scenes.tsx or reel.tsx, so no takeaway landed immediately after a predict step. All
Row label/value strings passed the 1-3 word check on the first draft, and no literal digits
appeared outside `duration:` fields or component coordinate props.

## Looks review
Reviewed 4 screenshots: `desktop-05` (automated-vs-hand-built reveal with its takeaway, renders
cleanly under the body text with no overlap), `phone-03` (the first predict step, both options
render full-width with no clipping), `desktop-09` (streaming-first-storage reveal with its
takeaway, renders clean), `phone-11` (Prove It step with its takeaway, "MORE" expand affordance
visible, no overlap). All four clean on both desktop and phone.

## Checks run
- `node scripts/sources.mjs check <folder>` — pass (12/12)
- `python3 -I examples.py` — pass on first run
- `npm run build` — pass
- `node scripts/check-all.mjs --only reels --topic <slug>` — reel smoke test pass (editor
  sub-check fails for the known sandbox-only reason, disclosed above)

Shipped as `status: 'held'`.
