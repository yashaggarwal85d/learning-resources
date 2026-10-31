# Review — Dead-letter and retry topics

## Checks run

- `node scripts/sources.mjs check <folder>` — 8 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (`BlockingPartition`, `NonBlockingRetryFlow`,
  `build_dlq_record`).
- `npm run build` (from `site/`) — clean after fixing `coverage.json`'s `errors.tolerance` clause
  to drop the backticks (clause text must match the syllabus line after `clean()` strips them).
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/dead-letter-retry-topics` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic — see project memory).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` / `phone-04` — hook and the partition-unblocked reveal; prior-topic bridge quote,
  figure caption, and Row pairs all render clean.
- `desktop-07` / `phone-07` — the DLQ reveal, with its takeaway directly below the body text;
  no overlap or clipping on phone.
- `desktop-03` / `phone-03` — the first predict step, options and explain text readable at both
  sizes.
- `desktop-06` / `phone-06` — the second predict step (tiered retry exhaustion).

No findings. No Row label/value pair exceeds three words; no literal digit outside the exempted
`duration` values; all three takeaways read clean at both sizes, including the one on the step
immediately after this topic's first predict step (same pattern already confirmed safe on an
earlier-shipped topic in this chapter).

## Gotcha confirmed this topic

`coverage.json` clause text must have backticks already stripped — `` "Kafka Connect `errors.tolerance`" `` failed the build's coverage check ("clause is not in the syllabus line") until rewritten as `"Kafka Connect errors.tolerance"`, matching the syllabus line after `clean()` strips the Markdown backticks.
