# Review — Kafka Streams and the KStream/KTable duality

## Sources
`node scripts/sources.mjs check` on the topic folder: 17/17 quotes found word for word, 0
problems. Six documents fetched: Architecture, Core Concepts, Streams Rebalance Protocol, and
Configuring a Streams Application (all Apache Kafka Streams 4.4 docs), the Confluent Community
License FAQ, and ksqlDB's own `CONTRIBUTING.md` (fetched raw from the `confluentinc/ksql`
repository on GitHub). Two problems found and fixed on the first check: an ellipsis joining two
non-adjacent sentences in one quote (split into two separate `>` blocks, since the checker
requires a continuous exact substring) and a capitalization mismatch ("Warmup" vs. the source's
lowercase mid-sentence "warmup") in the rebalance-protocol quote (fixed by lowercasing it).

## examples.py
`python3 -I examples.py` passed on the first run. Final verified numbers: 5 partitions across 3
instances assigns every task with none idle; 5 partitions across 8 instances caps parallelism at
5 and leaves 3 instances idle; a stream of keyed events folds into a table
(`{'user-a': 3, 'user-b': 2, 'user-c': 1}`) and reading that table's own entries back out
reproduces the same set, sorted; recovery without a standby takes 200.0 ticks of full replay vs.
0.4 ticks with a caught-up standby (500x faster).

## Build
`npm run build` from `site/` passed clean on the first attempt — syllabus line 569 (the "Kafka
Streams" bullet covering the library-not-a-cluster model, stream-table duality, the rebalance
protocol, and ksqlDB) checked for trailing boilerplate before writing `coverage.json`'s clauses;
`registry.ts`'s `title`/`syllabusTitle` match the syllabus wording exactly.

## Reel check
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/kafka-streams-ktable-duality`
reported `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The run's overall
exit code was 1 solely because of the known, pre-existing, sandbox-only `test:editor` failure
("a save did not open a new GitHub issue") — unrelated to this topic, confirmed against project
memory (`learning-resources-editor-test-sandbox-limitation.md`). Predict/takeaway positions
(predicts at steps 3 and 7, takeaways at steps 5, 9, 11) were planned in OUTLINE.md before writing
scenes.tsx or reel.tsx, so no takeaway landed immediately after a predict step. One digit-rule
gotcha caught and fixed this topic: "v2" appeared as a literal digit in reel.tsx's title and body
text for the exactly-once step and was spelled out as "v two" in both places (scenes.tsx's fig
label had already used "v two" correctly from the start).

## Looks review
Reviewed 4 screenshots: `desktop-05` (excess-idle-instances reveal with its takeaway, renders
cleanly with no overlap with the Row figures), `phone-03` (the first predict step, both options
render full-width with no text clipping), `desktop-09` (the stream-table duality reveal with its
takeaway — the topic's center of gravity — renders clean), `phone-11` (Prove It step with its
takeaway, renders clean with "MORE" expand affordance visible, no overlap). All four clean on
both desktop and phone.

## Checks run
- `node scripts/sources.mjs check <folder>` — pass (17/17, after 2 fixes)
- `python3 -I examples.py` — pass on first run
- `npm run build` — pass
- `node scripts/check-all.mjs --only reels --topic <slug>` — reel smoke test pass (editor
  sub-check fails for the known sandbox-only reason, disclosed above)

Shipped as `status: 'held'`.
