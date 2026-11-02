# Review — Schema Registry and compatibility modes

## Checks run

- `node scripts/sources.mjs check <folder>` — 19 quote(s) found word for word, 0 problem(s).
- `python3 -I examples.py` — all asserts passed (Avro-style compatibility checker, Protobuf
  field-number-reuse check, wire-format encode/decode round trip, subject-naming comparison).
- `npm run build` (from `site/`) — clean on the first attempt; the real syllabus line's trailing
  `(Ch.13)` boilerplate was checked and given its own Frontier clause before building
  `coverage.json`, avoiding the repeat-failure pattern earlier topics hit.
- `node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/schema-registry-compatibility` —
  reel smoke test passed, 1 live reel at desktop and phone sizes. `test:editor` failed with its
  usual sandbox-only "a save did not open a new GitHub issue" (known, pre-existing, unrelated to
  this topic).

## Looks review

Screenshots reviewed at desktop and phone sizes:

- `desktop-01` — the hook, with the prior-topic bridge quote, figure caption, and Row pairs all
  rendering clean.
- `phone-03` / `desktop-03` — the first predict step on phone, options and explain text readable,
  no overlap.
- `phone-06` — the second predict step on phone, long option labels wrap cleanly within their
  boxes.
- `desktop-08` — the naming-strategy/wire-format reveal, takeaway directly below the body with no
  overlap.

No findings. No Row label/value pair exceeds three words (two were trimmed during drafting);
no literal digit outside the exempted `duration` values; all three takeaways (steps 5, 7, 8) read
clean at both sizes, and none sits on the step immediately after a predict step.

## Sourcing note

Four primary sources used directly (Confluent's compatibility-modes and serdes-development docs,
the Avro 1.11.1 specification, and the Protobuf proto3 language guide), all fetched clean on the
first attempt — no substitutions needed this topic.
