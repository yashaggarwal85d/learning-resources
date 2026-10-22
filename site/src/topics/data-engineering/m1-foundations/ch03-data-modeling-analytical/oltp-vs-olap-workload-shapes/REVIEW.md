# Review, 2026-10-22

## Content review

- Both access patterns are measured directly on the existing 2.4-million-row `orders` table (this session's
  PostgreSQL 16.15 sandbox), isolating the query shape as the only variable: a point lookup through the existing
  index touched 7 buffers in 0.635 ms, and a `SUM(amount)` forced onto a sequential scan touched 46,484 buffers
  in 479.426 ms.
- One predict/reveal pair (steps 4/5) sets up the plausible wrong answer that a row-oriented engine reads only
  the bytes a query needs; red-teamed in FACT-CHECK.md against both the measurement and Amazon Redshift's
  documentation, which states the structural reason this is false (a row's columns sit interleaved in one block).
- The row-width evidence (`amount` is 6 of 48 average bytes, per `pg_stats`) is this topic's own measurement, used
  to make the "reads whole rows anyway" claim concrete rather than abstract.
- Recap ("In one breath") keeps three distinct claims — point reads want rows, scans want columns, one schema
  rarely serves both — and hands off to the next refresher (ER modeling and cardinality) by the exact words
  CHAPTER.md's own bridge for that topic expects.

## Looks review and fixes

- **Numbers-on-screen check:** `reel.tsx`'s fig text and leading comment carried digit values (2.4, 7, 0.6, 46,
  479, 16.15) that `examples.py`'s first draft didn't assert as exact display constants. Added
  `*_DISPLAY`/`*_DISPLAY_MS` constants and rounding assertions tying each on-screen number back to the measured
  value.
- **Coverage check:** passed on the first draft (two sources, ten expert items) — no fix needed, unlike the prior
  topic.
- **Playwright phone overflow (one scene):** the normalization-pressure reveal's two rows overflowed on phone.
  Fixed by shortening both labels and values.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic oltp-vs-olap-workload-shapes` — pass (locked, docs,
  sources, build — coverage and numbers-on-screen included, narration), after the numbers-on-screen fix above.
- `node scripts/narration-teaches.mjs .../oltp-vs-olap-workload-shapes` — all 8 steps well under the
  description-overlap threshold (0%–7%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic oltp-vs-olap-workload-shapes` — pass (desktop and phone) after
  the Playwright fix above; editor test pass.

## Chapter note

Second topic of Chapter 3. `node scripts/next-topic.mjs de` names the next topic once this one is live:
`de.er-modeling-relationship-cardinality`, the chapter's third refresher.
