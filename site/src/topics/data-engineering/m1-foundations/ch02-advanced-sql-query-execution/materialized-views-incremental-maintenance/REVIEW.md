# Review, 2026-10-22

## Content review

- All four local measurements (full-refresh cost before/after a small change, trigger-based incremental maintenance, and plain vs. CONCURRENTLY refresh blocking) reproduced directly on the existing PostgreSQL 16.15 sandbox, using a genuinely separate trigger-maintained table as an honest stand-in for incremental view maintenance (PostgreSQL has no native IVM feature). The floating-point-aggregate and staleness-bound claims are sourced from Databricks's and Snowflake's own documentation and explicitly disclosed as not independently measured, since neither feature exists on this sandbox.
- Four predict/reveal pairs (steps 2/3-4, 5/6, 7/8, 10/11) each set up a genuine prediction with a plausible wrong answer, red-teamed in `FACT-CHECK.md`.
- Recap (step 14) keeps full-refresh cost, incremental cost, the CONCURRENTLY tradeoff, and the staleness-bound distinction as four separate ideas rather than one vague "materialized views are good" takeaway.
- Closing check (step 15) requires reasoning about CONCURRENTLY's blocking behavior directly, rather than re-testing the exact measured millisecond figures from the reveals.

## Looks review and fixes

- **Coverage check:** the first syllabus clause was copied with the syllabus's own backtick code formatting around `REFRESH … CONCURRENTLY`, which the coverage checker doesn't strip, so it didn't match; the syllabus text itself has no backticks once that markdown is removed. Fixed by dropping the backticks from the copied clause.
- **Numbers-on-screen check:** `reel.tsx`'s fig text displays rounded millisecond figures ("~994 ms," "~6 ms," "~974 ms," "~861 ms," "~5 ms") that weren't present as literal text in `examples.py` (only the precise measured values were). Added five `*_DISPLAY_MS` constants, with assertions rounding the precise values to each.
- **Takeaway word count:** step 4's takeaway was 21 words, one over the limit. Shortened by removing "because it reruns everything either way" in favor of "it reruns everything regardless."
- No apostrophe-syntax bugs and no Playwright phone-overflow issues this time — all predict-option and takeaway single-quoted strings, and all scene Row labels/values, were checked for length and contractions before running any check, and the reel passed Playwright on the first attempt.
- First takeaway lands on step 4, not step 3, so the swipe-from-caption Playwright sub-test (QUALITY.md #64) was never at risk — confirmed once Playwright actually ran.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic materialized-views-incremental-maintenance` — pass (locked, docs, sources, build, narration), after the coverage, numbers-on-screen, and takeaway-length fixes above.
- `node scripts/narration-teaches.mjs .../materialized-views-incremental-maintenance` — all 15 steps well under the description-overlap threshold.
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic materialized-views-incremental-maintenance` — pass (desktop and phone) on the first run; editor test pass.

## Chapter note

This is the last full topic in Chapter 2 (Advanced SQL and Query Execution) — the remaining syllabus entry, "Mixed-workload interference," is marked `*(skipped)*`. `node scripts/next-topic.mjs de` should be re-checked once this topic is live, to confirm what starts Chapter 3's modeling work.
