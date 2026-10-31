# Review — Replay and backfill

## Checks run

- `node scripts/sources.mjs check <folder>` — 4 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (`OffsetTimeIndex`, `ScopedReplay`,
  `BackfillSourceChooser`, `OverwriteSink`/`VersionedSink`, `SideEffectGatedConsumer`).
- `npm run build` (from `site/`) — clean on the first attempt.
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/replay-and-backfill` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, with the prior-topic bridge quote, figure caption, and Row pairs all
  rendering clean.
- `desktop-03` / `phone-03` — the first predict step; options, the wrong-answer dim state, and
  the explain text all readable at both sizes.
- `desktop-05` — the backfill-source reveal, takeaway directly below the body with no overlap.
- `phone-08` — the versioned-output reveal and its takeaway on phone, no clipping or overlap.

No findings. No Row label/value pair exceeds three words; no literal digit outside the exempted
`duration` values; all three takeaways (steps 5, 8, 10) read clean at both sizes, and none sits
on the step immediately after a predict step.

## Coverage gotcha confirmed again

The real syllabus line (`syllabus/data-engineering.md`) carries a trailing
"(Lambda vs Kappa in Ch.3.3)." that CHAPTER.md's own scope paraphrase dropped — same pattern as
topics 9 and 13. Added as its own `coverage.json` clause mapped to Frontier before the build, so
this topic hit no coverage-check failure (unlike topics 9, 12, and 13's first attempts).
