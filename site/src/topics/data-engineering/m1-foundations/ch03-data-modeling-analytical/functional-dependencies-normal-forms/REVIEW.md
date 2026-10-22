# Review, 2026-10-22

## Content review

- This chapter's first full topic. No `customers` table exists on this sandbox, so the running example (order_id,
  customer_id, customer_email, amount) was built fresh and disclosed as such, rather than silently invented
  against a table that doesn't exist.
- The attribute-closure computation and candidate-key search are run by a real algorithm in `examples.py`
  (`closure()`, fixed-point iteration over the FD set), not merely hand-asserted — this topic's own measured
  truth, even with no database system behind it.
- The update-anomaly claim is a real, reproduced demonstration on a throwaway PostgreSQL schema built and dropped
  for this topic: 5 row updates on the denormalized table vs. 1 on the normalized table, and a genuine
  inconsistency (two different emails on file for one customer) from the realistic missed-row mistake.
- Three predict/reveal pairs (steps 2/—, 6/7, 16) each set up a genuine prediction with a plausible wrong answer,
  red-teamed in FACT-CHECK.md; step 2's answer is honestly "it depends," matching how topic 2 of this chapter
  already established that the cost of a join depends on query shape.
- FACT-CHECK.md explicitly separates quoted claims (8 of them, across four sources) from two groups of reasoned
  claims (1NF/2NF/3NF's per-form definitions; the dependency-preservation trade-off) where this topic's fetched
  sources did not yield clean, quotable text, rather than presenting all claims with equal sourcing weight.

## Looks review and fixes

- **Coverage check:** passed on the first draft (four sources, ten expert items, four syllabus clauses matching
  CHAPTER.md's own multi-bullet scope) — no fix needed.
- **Numbers-on-screen check:** passed on the first draft — every normal-form name (first, second, third,
  Boyce-Codd, fourth) and every measured count (several rows, one row, two emails) is spelled out in words in
  `reel.tsx`, so there was nothing for `examples.py` to need asserting beyond the closure algorithm itself.
- **Playwright phone overflow (three scenes, six rows total):** the opening predict (step 2), the
  why-not-a-candidate-key reveal (step 7), the Boyce-Codd reveal (step 9), and the recap (step 15) each had one
  or two rows overflow on phone. Fixed by shortening the specific Row labels and values in each.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic functional-dependencies-normal-forms` — pass (locked,
  docs, sources, build — coverage and numbers-on-screen included, narration) on the first run.
- `node scripts/narration-teaches.mjs .../functional-dependencies-normal-forms` — all 16 steps well under the
  description-overlap threshold (0%–22%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic functional-dependencies-normal-forms` — pass (desktop and
  phone) after the Playwright fixes above; editor test pass.

## Chapter note

Fourth topic of Chapter 3, and its first full (non-refresher) topic. `node scripts/next-topic.mjs de` names the
next topic once this one is live: `de.key-design-natural-surrogate-durable-hash`.
