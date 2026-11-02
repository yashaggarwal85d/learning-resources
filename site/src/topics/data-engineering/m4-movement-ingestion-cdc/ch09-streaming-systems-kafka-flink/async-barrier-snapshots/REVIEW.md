# Review — Async barrier snapshots

## Checks run

- `node scripts/sources.mjs check <folder>` — 15 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (aligned-vs-unaligned checkpoint duration under
  no backlog and under a heavy backlog, the unaligned snapshot-size cost trade-off, and full vs
  incremental checkpoint cost over several rounds of growing state).
- `npm run build` (from `site/`) — clean on the first attempt; checked the real syllabus line
  (`syllabus/data-engineering.md` line 565) for trailing boilerplate first (none this topic).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/async-barrier-snapshots` —
  reel smoke test passed, 1 live reel at desktop and phone sizes (run twice: the first run caught
  a takeaway placed on the step right after a predict step, QUALITY.md #64's known phone
  caption-swipe failure — fixed by moving it one step later; the second run passed clean).
  `test:editor` failed with its usual sandbox-only "a save did not open a new GitHub issue"
  (known, pre-existing, unrelated to this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, prior-topic bridge quote, figure caption, and Row pairs all rendering
  clean.
- `phone-04` — the first predict step on phone, both answer options readable, correct option
  highlighted, no overlap.
- `phone-06` — the unaligned-checkpoint reveal on phone, takeaway readable below the collapsed
  description, no squeeze on the Visual pane.
- `desktop-12` — the recap on desktop, all three Row pairs and the body text rendering clean.

No findings. No Row label/value pair exceeds three words; no literal digit anywhere in
`scenes.tsx` or `reel.tsx` (duration values are the only numbers, exempt); all three takeaways
(steps 6, 7, 10) are exactly 20 words each; no takeaway sits on the step immediately after a
predict step (moved during this review, see Checks run above).

## Lab-generator note

This topic hosts the aligned-vs-unaligned checkpoint-duration-under-induced-backpressure leg of
the 9.3 chapter lab, on this topic's own toy barrier-sweep simulation (disclosed in FACT-CHECK.md
and references.md as a stand-in for a real Flink cluster, unavailable in this sandbox).
