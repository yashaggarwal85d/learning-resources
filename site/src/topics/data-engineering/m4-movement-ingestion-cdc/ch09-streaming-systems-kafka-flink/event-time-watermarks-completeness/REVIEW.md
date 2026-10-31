# Review — Event time, watermarks and completeness

## Checks run

- `node scripts/sources.mjs check <folder>` — 9 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (synthetic stream generator, bounded-out-of-
  orderness watermark, idle-source stall/fix, watermark alignment, latency/completeness
  trade-off measurement).
- `npm run build` (from `site/`) — clean on the first attempt; checked the real syllabus line for
  trailing boilerplate first (none this topic).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/event-time-watermarks-completeness` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, with the prior-topic bridge quote, figure caption, and Row pairs all
  rendering clean.
- `phone-03` — the first predict step on phone, options and the "Not quite" explain block
  readable, no overlap.
- `phone-07` / `desktop-08` — the alignment reveal on phone and the trade-off reveal on desktop,
  takeaways directly below the body with no overlap or clipping.

No findings. No Row label/value pair exceeds three words; no literal digit outside the exempted
`duration` values; all three takeaways (steps 4, 7, 8) read clean at both sizes, and none sits on
the step immediately after a predict step.

## Lab-generator note

This topic's `examples.py` generates the 9.2 chapter lab's synthetic late/duplicate event stream
(seeded, deterministic — `generate_stream(seed=7)`). Topics 11 and 18 reuse this same shape of
measurement for their own legs of the lab; this topic's own run already shows the raw
watermark-vs-arrival picture CHAPTER.md's lab line calls for.
