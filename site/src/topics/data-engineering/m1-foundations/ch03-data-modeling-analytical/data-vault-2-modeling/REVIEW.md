# Review, 2026-10-22

## Content review

- Seventh topic of Chapter 3, and the first to host this section's full lab: the same
  customer/order/product domain modeled four ways (3NF, star, raw Data Vault, Data Vault plus a
  point-in-time table), with the same "what was this customer's address on this order's date"
  query run and verified correct against all four.
- No `customers`/`products` table exists in this sandbox's own public schema (a `customers` table
  does exist, but only inside an unrelated `join_demo` schema) — the lab domain was built fresh and
  disclosed, following the pattern established in topics 4 and 5.
- The hash-key determinism claim (two independent loaders deriving the identical key with no
  coordination) is verified by a real Python computation, not merely asserted from the sourced text.
- The join-count comparison is the literal JOIN count in each query's own SQL text, measured by
  writing and running all four queries, not estimated: one join each for 3NF and the star schema,
  four joins plus a correlated subquery for raw Data Vault, three joins and no correlated subquery
  once a point-in-time table pre-resolves the as-of lookup.
- No live, quotable page from Dan Linstedt's own sites could be confirmed reachable during research;
  every Linstedt-attributed claim traces through Wikipedia's or PuppyGraph's own citations of his
  published work rather than a direct fetch of his site, disclosed in coverage.json's expert items.
- Fixed during the build: the first predict step needs to land within the first four steps
  (QUALITY.md #35), and a reel needs at least three takeaways (DESIGN.md). Added an early predict
  ("does a hub hold descriptive data too?") ahead of the hub/link/satellite reveals, and a third
  takeaway on the PIT/bridge-table reveal — both additions are genuine content, not filler.

## Looks review and fixes

- **Coverage check:** passed after the predict-position and takeaway-count fixes above (three
  sources, ten expert items, four syllabus clauses matching CHAPTER.md's own multi-bullet scope).
- **Numbers-on-screen check:** passed on the first draft — every join count and the hash-key
  determinism result is spelled in words in `reel.tsx` ("one join", "four joins", "three joins"),
  with the sole exception of "3NF" labels, whose digit matches a literal constant in `examples.py`.
- **Playwright phone overflow (three scenes, one row each):** the why-expensive reveal, the recap,
  and the closing predict each had one row overflow on phone. Fixed by shortening the specific Row
  labels and values in each.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic data-vault-2-modeling` — pass (locked,
  docs, sources, build — coverage and numbers-on-screen included, narration) after the structural
  fixes above.
- `node scripts/narration-teaches.mjs .../data-vault-2-modeling` — all 15 steps well under the
  description-overlap threshold (0%–15%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic's own sources.
- `node scripts/check-all.mjs --only reels --topic data-vault-2-modeling` — pass (desktop and
  phone) after the Playwright fixes above; editor test pass.

## Chapter note

Seventh topic of Chapter 3, and the §3.1 chapter lab's host. `node scripts/next-topic.mjs de` names
the next topic once this one is live: `de.grain-first-dimensional-design` (§3.2).
