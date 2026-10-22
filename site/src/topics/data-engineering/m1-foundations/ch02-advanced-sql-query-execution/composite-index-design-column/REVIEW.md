# Content and looks review, 2026-10-22

## Content review

**Flow.** Hook (a real, locally measured 364x gap between two indexes on the same two columns) → predict (why would column order alone cost so much?) → equality-before-range reveal → selectivity reveal → a second predict pivoting to ORDER BY → the matched/mismatched sort reveal → LIMIT amplification → a third predict on skip scan's precondition → PG16's full-index-scan fallback → PG18's skip scan reveal (with the `Index Searches` field) → skip scan's own cardinality caveat → a fourth predict on write cost → the measured write/storage cost reveal → Recap → a closing "Prove it" check. Four predicts, three takeaways (steps 4, 6, 13), matching the engagement-arc convention from the prior three topics.

**Pre-notes accuracy.** All four pre-notes terms (cardinality estimation, EXPLAIN triage, B-tree, ORDER BY) are used as described in the reveals that follow.

**Gaps.** None open in `coverage.json`'s `gapReview`. All five claims in FACT-CHECK.md are confirmed, four of them by direct local measurement on this sandbox (reusing the PostgreSQL 16/18 side-by-side setup from topic 27) and the fifth (the "used sparingly, rarely past three columns" guidance) sourced directly to PostgreSQL's own documentation and disclosed as a stated guideline rather than a locally-measured number.

**Expert-reader depth.** `coverage.json`'s expert items (10) go beyond the syllabus line itself: forcing `enable_seqscan = off` to make the column-order comparison genuinely index-vs-index, the specific new `Index Searches` EXPLAIN field that makes skip scan's mechanism visible rather than just its speedup, the explicit distinction between an index being unusable versus merely inefficient (tested directly in the step 8/9 predict-reveal pair), and isolating index count as the only variable in the write-cost measurement.

**Engagement arc.** Verified: hook (step 1) is a real measured contrast; four predicts (2, 5, 8, 12); three takeaways (4, 6, 13) — deliberately kept off step 3, since this chapter's own Playwright swipe-test targets the first non-predict step after the opening predict (QUALITY.md #64), and step 3 here is a plain reveal with no takeaway; recap (14); one closing check (15).

**Does the narration teach?** All 15 steps pass well under the 50% description-overlap floor (0-18%, longest overlapping phrase at most 40 words out of much longer narration lines) — `narration-teaches.mjs` reported no verbatim-reads-the-screen issues after one fix: step 2's original question echoed the description's own wording ("why would reading the same data through them cost so differently") and was rewritten as a more direct professor's question ("what could possibly make one of them so much more expensive to read?").

## Looks review

Playwright (`check-all.mjs --only reels --topic composite-index-design-column`) failed on first run, three issues:
1. **Swipe-test / takeaway interaction (QUALITY.md #64).** Step 3 ("Reveal: equality constraints on leading columns narrow the scan") originally carried this reel's first takeaway, landing exactly on the test's own "from" step (the first non-predict step after step 2's opening predict) — reproducing the exact failure mode logged in topic 26. Fixed by moving the takeaway to step 4 ("Reveal: selectivity is why") instead, keeping three total takeaways.
2. **Phone overflow, step 12** (`ProveIndexFree`): Row label/value overlapped ("every index measured so far" / "made a query faster"). Fixed by shortening both ("every index so far" / "is adding one free?").
3. **Phone overflow, step 15** (`ProveOrderMatch`): Row label/value overlapped ("query filters" / "region = equality, date = range"). Fixed by splitting into two separate, shorter rows, one per column.

Re-ran clean after all three fixes: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Editor test also passed on the same run.
