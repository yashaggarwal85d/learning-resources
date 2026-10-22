# Review, 2026-10-22

## Content review

- Fifth topic of Chapter 3, and the first in this chapter to measure every one of its scope's four
  bullets directly against live PostgreSQL, with no part left as an unquantified caveat.
- The natural-key-breaks and surrogate-key-absorbs reveals are a real, reproduced pair of sessions
  against a freshly built, disclosed FK-constrained table pair — the actual constraint-violation
  error and the actual successful update are both captured verbatim in `examples.py`'s comments.
- The generation-cost and index-locality numbers are measured on this sandbox's PostgreSQL 18
  cluster (the only one here with `uuidv7()`), using a pre-built index so the comparison reflects
  ongoing-insert behavior rather than a one-time sorted bulk load. `pgstatindex()` reproduces RFC
  9562's own claim about UUIDv4's poor index locality directly, not by citation alone.
- The hash-collision numbers are computed by the standard birthday-bound formula in `examples.py`,
  anchored to the exact bit widths this topic's own sources name (UUIDv4's 122 random bits, RFC
  9562; the narrower widths a truncated hash key is sometimes given).
- Four predict/reveal pairs (steps 2, 6, 12, 16) each set up a genuine prediction with a plausible
  wrong answer, red-teamed in FACT-CHECK.md.
- The durable-key reveal (step 11) is explicitly scoped as a preview of SCD2 (topic 13), per
  CHAPTER.md's own forward reference, rather than an attempt to teach SCD2 itself out of order.

## Looks review and fixes

- **Coverage check:** passed on the first draft (three sources, ten expert items, four syllabus
  clauses matching CHAPTER.md's own multi-bullet scope) — no fix needed.
- **Numbers-on-screen check:** passed on the first draft after spelling every measured quantity in
  `reel.tsx` as words (generation-cost ordering, leaf-density contrast, birthday-bound figures) —
  bit widths (thirty-two, sixty-four, one hundred twenty-two, one hundred twenty-eight) are the
  only digit-bearing values, and each is a literal argument in `examples.py`'s own computation.
- **Playwright phone overflow (two scenes, three rows total):** the recap (step 14, two rows) and
  the closing predict (step 15, one row) overflowed on phone. Fixed by shortening the specific Row
  labels and values in each.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic key-design-natural-surrogate-durable-hash`
  — pass (locked, docs, sources, build — coverage and numbers-on-screen included, narration) on the
  first run.
- `node scripts/narration-teaches.mjs .../key-design-natural-surrogate-durable-hash` — all 15 steps
  well under the description-overlap threshold (0%–9%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic key-design-natural-surrogate-durable-hash` —
  pass (desktop and phone) after the Playwright fixes above; editor test pass.

## Chapter note

Fifth topic of Chapter 3. `node scripts/next-topic.mjs de` names the next topic once this one is
live: `de.inmon-vs-kimball-warehouse-philosophies`.
