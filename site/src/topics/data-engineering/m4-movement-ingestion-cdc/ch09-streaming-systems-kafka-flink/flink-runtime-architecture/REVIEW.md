# Review — Flink runtime architecture

## Checks run

- `node scripts/sources.mjs check <folder>` — 9 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (slot-bounded max parallelism, chained-vs-
  unchained cost comparison, the backpressure chain draining backward one hop at a time, and
  adaptive batch scheduling sizing two different data volumes).
- `npm run build` (from `site/`) — clean on the first attempt; checked the real syllabus line
  (`syllabus/data-engineering.md` line 564) for trailing boilerplate first (none this topic).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/flink-runtime-architecture` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, prior-topic bridge quote, figure caption, and Row pairs all rendering
  clean.
- `phone-03` — the first predict step on phone, both answer options and the "It's a hard
  ceiling" correct option readable, no overlap.
- `phone-05` — the operator-chaining reveal on phone, takeaway readable below the collapsed
  description, no squeeze on the Visual pane.
- `desktop-09` — the batch/stream reveal on desktop, takeaway directly below the body with no
  overlap.

No findings. No Row label/value pair exceeds three words; no literal digit anywhere in
`scenes.tsx` or `reel.tsx` (duration values are the only numbers, exempt); all three takeaways
(steps 5, 6, 9) are 19, 21... rechecked at 19, 20, and 19 words respectively, all within the
limit.

## Lab-generator note

This topic hosts no reel step of its own in the 9.3 chapter lab, per CHAPTER.md's own lab note —
it sets up the state/checkpoint/rescale legs the lab hosts properly in the next three topics
(async barrier snapshots and beyond).
