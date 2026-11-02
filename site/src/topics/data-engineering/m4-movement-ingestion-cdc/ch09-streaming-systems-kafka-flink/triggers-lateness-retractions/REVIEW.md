# Review — Triggers, allowed lateness and retractions

## Checks run

- `node scripts/sources.mjs check <folder>` — 11 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (early/on-time/late firings for one window, the
  exact allowed-lateness drop boundary, and all three accumulation modes measured against a
  downstream sum-of-sums).
- `npm run build` (from `site/`) — clean on the first attempt; checked the real syllabus line
  (`syllabus/data-engineering.md` line 560) for trailing boilerplate first (none this topic).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/triggers-lateness-retractions` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, prior-topic bridge quote, figure caption, and Row pairs all rendering
  clean.
- `phone-04` — the first predict step on phone, both answer options and the "It's simply
  dropped" correct option readable, no overlap.
- `phone-07` — the discarding-vs-accumulating reveal on phone, takeaway readable below the
  collapsed description, no squeeze on the Visual pane.
- `desktop-08` — the retraction reveal on desktop, takeaway directly below the body with no
  overlap.

No findings. No Row label/value pair exceeds three words; no literal digit anywhere in
`scenes.tsx` or `reel.tsx` (duration values are the only numbers, exempt); all three takeaways
(steps 5, 7, 8) are 20, 20, and 18 words respectively.

## Lab-generator note

This topic contributes no reel step of its own to the 9.2 chapter lab, per CHAPTER.md's own lab
note — the kill-mid-commit measurement's ground-truth aggregation baseline it references is
hosted properly in `consensus-inside-data-systems` (already shipped).
