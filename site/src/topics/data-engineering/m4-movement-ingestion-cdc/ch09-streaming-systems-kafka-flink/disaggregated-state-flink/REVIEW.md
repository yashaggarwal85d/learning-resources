# Review — Disaggregated state in Flink 2.x

## Sources
`node scripts/sources.mjs check` on the topic folder: 14/14 quotes found word for word, 0
problems. Three sources fetched clean on the first attempt (Mei et al. 2025 VLDB paper, Flink
2.0 State Backends docs, Flink 2.0 Working with State V2 docs).

## examples.py
`python3 -I examples.py` passed after one fix: the initial `AsyncStateAccess` demo used uniform
per-key latencies (key-a always faster than key-b), so the two keys' completions never actually
interleaved — the assertion correctly caught this. Fixed by staggering each key's per-request
latency so completion times interleave across keys while staying monotonic within a key. Final
run: checkpoint cost flat at 2 for both small and large state on a remote-primary backend vs. 50
and 50000 on a local-primary one; same-key accesses stayed ordered for both keys while
cross-key completions interleaved; asynchronous access finished 8.0x faster than synchronous over
24 requests; cold-cache effective latency (18.10 units) measurably exceeded warm-cache (1.95
units).

## Build
`npm run build` from `site/` passed clean on the first attempt — syllabus line 566
(`### 9.3 Stream processing engines...` section, the `Disaggregated state in Flink 2.x` bullet)
checked for trailing boilerplate before writing `coverage.json`'s clauses; `registry.ts`'s
`title`/`syllabusTitle` match the syllabus wording exactly.

## Reel check
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/disaggregated-state-flink`
reported `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The run's overall
exit code was 1 solely because of the known, pre-existing, sandbox-only `test:editor` failure
("a save did not open a new GitHub issue") — unrelated to this topic, confirmed against project
memory (`learning-resources-editor-test-sandbox-limitation.md`). No takeaway-placement or
word-count issues this time, since both predict/takeaway positions were planned in OUTLINE.md
before writing scenes.tsx or reel.tsx.

## Looks review
Reviewed 4 screenshots: `desktop-05` (checkpoint-near-free reveal, step 5, carries its own
takeaway — confirmed it renders cleanly under the body text with no overlap with the Row figures),
`phone-03` (the first predict step, both options render full-width with no text clipping),
`desktop-09` (the per-key-ordering reveal with its takeaway, step 9 — correctly NOT the step right
after a predict step, renders clean), `phone-11` (Prove It step with its takeaway, renders clean
with "MORE" expand affordance visible, no overlap). All four clean on both desktop and phone.

## Checks run
- `node scripts/sources.mjs check <folder>` — pass (14/14)
- `python3 -I examples.py` — pass (after one fix)
- `npm run build` — pass
- `node scripts/check-all.mjs --only reels --topic <slug>` — reel smoke test pass (editor
  sub-check fails for the known sandbox-only reason, disclosed above)

Shipped as `status: 'held'`.
