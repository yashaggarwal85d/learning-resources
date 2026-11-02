# Review — Keyed state, key groups and rescaling

## Checks run

- `node scripts/sources.mjs check <folder>` — 18 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (the four-to-six-instance rescale with no key
  group ever split and every key checksummed unchanged, recovery time identical across operator
  counts and driven only by state held, and the heap-vs-RocksDB access-cost/capacity comparison).
- `npm run build` (from `site/`) — clean on the first attempt; checked the real syllabus line
  (`syllabus/data-engineering.md` line 566) for trailing boilerplate first (none this topic).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/keyed-state-key-groups-rescaling` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, prior-topic bridge quote, figure caption, and Row pairs all rendering
  clean.
- `phone-03` — the first predict step on phone, both answer options readable, correct option
  highlighted, no overlap.
- `phone-05` — the rescale-blocks reveal on phone, takeaway readable below the collapsed
  description, no squeeze on the Visual pane.
- `desktop-09` — the TTL/schema reveal on desktop, takeaway directly below the body with no
  overlap.

No findings. No Row label/value pair exceeds three words; no literal digit anywhere in
`scenes.tsx` or `reel.tsx` (duration values are the only numbers, exempt); all three takeaways
(steps 5, 9, 10) are 19, 20, and 20 words respectively; no takeaway sits on the step immediately
after a predict step (steps 4 and 8 have none).

## Lab-generator note

This topic hosts the kill-TaskManager/measure-recovery-time and rescale-from-savepoint legs of
the 9.3 chapter lab, on this topic's own toy keyed-checkpoint-and-restore model (disclosed in
FACT-CHECK.md and references.md as a stand-in for a real Flink cluster, unavailable in this
sandbox).
