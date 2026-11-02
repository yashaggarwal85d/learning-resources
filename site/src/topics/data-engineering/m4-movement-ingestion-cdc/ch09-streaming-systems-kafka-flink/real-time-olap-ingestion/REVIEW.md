# Review — Real-time OLAP ingestion

## Sources
`node scripts/sources.mjs check` on the topic folder: 11/11 quotes found word for word, 0
problems, clean on the first attempt. Three documents fetched: Apache Druid's Storage overview
(segment lifecycle, handoff, exactly-once offset commits), Apache Pinot's release-1.4.0 Stream
ingestion with Upsert page, and ClickHouse's current Kafka table engine docs (which also
recommend ClickPipes for Cloud users).

## examples.py
`python3 -I examples.py` passed on the first run. Final verified numbers: four partitions each
build their own independent sequence of three segments; an atomic offset-and-segment commit,
forced to fail, leaves state completely untouched (`{'offset': 0, 'segment_count': 0}`), and a
retry succeeds cleanly to `{'offset': 5, 'segment_count': 1}`; a naive non-atomic commit under
the identical forced failure leaves the offset at 5 with the segment count still at 0, a real
mismatch; an upsert query answers `'delivered'` from the overlay while the sealed segment's own
row for that key stays `'pending'`, unchanged.

## Build
`npm run build` from `site/` initially failed coverage checking (PROJECT_PLAN.md Rule #6): the
syllabus line's trailing clause "serving trade-offs in §5.5 and engine internals in §6.4" wasn't
mapped to any `coverage.json` clause. Fixed by adding that clause, mapped to the Setup step where
this topic's scope is bounded to ingestion only. Rebuilt clean. Syllabus line 574 checked for the
full bullet text; `registry.ts`'s `title`/`syllabusTitle` match the syllabus wording exactly.

## Reel check
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/real-time-olap-ingestion`
reported `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The run's overall
exit code was 1 solely because of the known, pre-existing, sandbox-only `test:editor` failure
("a save did not open a new GitHub issue") — unrelated to this topic, confirmed against project
memory (`learning-resources-editor-test-sandbox-limitation.md`). Predict/takeaway positions
(predicts at steps 3 and 7, takeaways at steps 5, 9, 11) were planned in OUTLINE.md before
writing scenes.tsx or reel.tsx. One digit-rule gotcha caught and fixed: a "Chapter 8" reference in
reel.tsx body prose was reworded to "the chapter on CDC and landing strategies" to avoid the
literal digit.

## Looks review
Reviewed 4 screenshots: `desktop-05` (atomic offset-and-segment commit reveal with its takeaway,
renders cleanly), `phone-03` (the first predict step, both options render full-width with no
clipping), `desktop-09` (ClickHouse Kafka engine vs. ClickPipes reveal with its takeaway, renders
clean), `phone-11` (Prove It step with its takeaway, "MORE" expand affordance visible, no
overlap). All four clean on both desktop and phone.

## Checks run
- `node scripts/sources.mjs check <folder>` — pass (11/11)
- `python3 -I examples.py` — pass on first run
- `npm run build` — pass (after the coverage-clause fix above)
- `node scripts/check-all.mjs --only reels --topic <slug>` — reel smoke test pass (editor
  sub-check fails for the known sandbox-only reason, disclosed above)

Shipped as `status: 'held'`. This is chapter 9's 27th and final topic — the chapter is now fully
built (all topics shipped `held`, awaiting the owner's release of held topics to `live`).
