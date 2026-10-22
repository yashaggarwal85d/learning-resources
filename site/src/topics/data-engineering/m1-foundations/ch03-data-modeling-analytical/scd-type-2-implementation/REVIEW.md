# Review — de.scd-type-2-implementation

## Content summary

13 steps covering SCD Type 2: the problem (overwriting a changed attribute
destroys history), the Kimball-sourced reveal of the pattern (new row, new
surrogate key, effective/expiry timestamps, current flag), a single-MERGE
atomic load (quoting PostgreSQL's MERGE documentation), idempotency on a
second identical run, hash-diff change detection, and correctness when a
real change feed arrives out of order with a duplicate. Three predicts
(single-MERGE atomicity, idempotent re-run, out-of-order/duplicate
convergence), each red-teamed against the plausible wrong answer. Three
takeaways (atomic MERGE load, proven idempotency, order/duplicate
independence). All MERGE-load, idempotency, and replay numbers are measured
directly on a throwaway schema (`reel_demo` on the sandbox's PG18 cluster,
port 5433 — PG16 on port 5432 does not support `WHEN NOT MATCHED BY SOURCE`,
so this lab could not run against `shop`), not asserted.

## Sources

- Kimball Group, "Type 2: Add New Row" — 3 quotes, verified word for word.
- PostgreSQL Documentation, "MERGE" — 2 quotes, verified word for word.
- Plus 5 "measured directly on this sandbox" facts, each traced to a literal
  constant in `examples.py`.

8 quotes total, `node scripts/sources.mjs check` confirms 0 problems.

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present.
- No narration line reads the on-screen description verbatim.
- All on-screen numbers trace to `examples.py` constants; every other
  quantity in `reel.tsx` is spelled in words.

## Fixes made during this build

- `coverage.json`'s expert item for the third predict had the OUTLINE.md
  phrasing instead of the actual `reel.tsx` step title ("Predict: does an
  out-of-order, duplicated feed still converge correctly?") — corrected via
  sed, the same recurring step-title-must-match-verbatim class of bug hit on
  several other topics this chapter.
- Discovered the `shop` database's cluster (PostgreSQL 16, port 5432) does
  not support the `WHEN NOT MATCHED BY SOURCE` MERGE clause used by this
  topic's single-statement expire-and-insert demonstration. Built the whole
  lab (customer dimension and change feed) fresh in a new `reel_demo` schema
  on the PostgreSQL 18 cluster (port 5433) instead, since `shop` itself does
  not exist there. Both schemas were dropped after the measurements were
  captured.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic scd-type-2-implementation` — pass (locked, docs, sources, build, narration).
- `node scripts/narration-teaches.mjs .../scd-type-2-implementation` — pass, all 13 steps under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links.
- `node scripts/check-all.mjs --only reels --topic scd-type-2-implementation` — pass, Playwright desktop and phone, no overflow fixes needed.
- `python3 examples.py` — pass, "scd-type-2-implementation examples: all numbers check out".
