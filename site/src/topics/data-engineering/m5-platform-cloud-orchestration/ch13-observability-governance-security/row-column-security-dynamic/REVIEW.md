# Review — de.row-column-security-dynamic

## Content review, self-review, 2026-11-01

1. **AWS Lake Formation's data-filtering page is JavaScript-rendered at the exact URL
   `dg/data-filters.html`** named by habit from the previous chapter's source list -- it
   returned 0 characters of text. Found the correct, fetchable page
   (`dg/data-filtering.html`, "Data filtering and cell-level security in Lake Formation") via
   search and fetched it cleanly.
2. **The EXPLAIN measurement initially showed a `Filter` node before any policy existed too**,
   because the first draft queried `WHERE id > 0`, which is itself a filter condition
   independent of row security. Fixed by querying with no `WHERE` clause at all, so any
   `Filter` node that appears can only come from the policy itself.
3. **Row security needs a real role to test against, and `psql -U analyst_role` failed with
   peer-authentication errors** (no matching OS account). Fixed by connecting as the `postgres`
   superuser and using `SET ROLE analyst_role` within the same session -- exactly how
   PostgreSQL's own documentation describes row security evaluating "the user running the
   query," and avoids needing an OS-level account per role.
4. **Gap hunt against the syllabus line:** the single clause (engine vs application
   enforcement, the five named engines, pruning/caching cost, bypass paths) is mapped across
   all 10 reel steps in `coverage.json`; no part of the clause left unmapped. The five named
   engines (Snowflake, Unity Catalog, BigQuery, Lake Formation, Trino) are each sourced and
   named in the reel's text, with PostgreSQL as this topic's own runnable local example per
   CHAPTER.md's explicit instruction.
5. **`declared: []`** matches CHAPTER.md's own "Declared: none" for this topic.
6. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
7. **Engagement:** hook at step 1; predicts at steps 3 and 6; three takeaways at steps 5, 8 and
   10 (Recap), each trimmed to 18-20 words after initial drafts ran 21-27 words across three
   takeaways.
8. **Narration teaches, not reads:** rewrote every line as the professor's own framing rather
   than restating `reel.tsx`'s body sentences. No raw digits anywhere; row counts are spelled
   out as words ("three thousand," "one thousand") matching the reel's own prose style.
9. **Numbers checked against `examples.py`:** 3,000 rows before any policy, 1,000 after a
   one-region policy, a `Filter` node appearing only after the policy, and a superuser seeing
   all 3,000 regardless -- every number in `reel.tsx` prose traces to an asserted value from a
   real local PostgreSQL 16 run, not a simulated or hypothetical count.

### Checks run

- `node scripts/sources.mjs check`: 9 quotes found word for word, 0 problems (after the Lake
  Formation URL and quote fixes above).
- `python3 examples.py`: all four claims verified against a real local PostgreSQL 16 instance
  (row counts, `EXPLAIN` plan comparison, superuser bypass).
- `node scripts/check-all.mjs --topic .../row-column-security-dynamic --only build`: 1 fix
  during the build (the coverage expert-item count below 10); clean on rebuild, 238 pages built.
- `node scripts/check-all.mjs --topic .../row-column-security-dynamic --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` and `PREVIEW_HELD=1 node tests/reels.mjs
  http://localhost:4321/learning-resources/ row-column-security-dynamic`: reel smoke test
  passed at desktop and phone sizes.

## Looks review, self-review, 2026-11-01

Learned from the previous topic's phone-overlap failure: kept every `scenes.tsx` Row value to
short words even where four words were used (e.g. "superuser bypass" / "all 3,000, measured").
Reel smoke test covered both desktop and phone sizes across all 10 steps, including both
predict panels (steps 3 and 6) and the three-row Recap scene, with no overflow or
swipe-caption failures.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
