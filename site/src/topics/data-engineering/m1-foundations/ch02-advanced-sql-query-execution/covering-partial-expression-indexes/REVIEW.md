# Content and looks review, 2026-10-22

## Content review

**Flow.** Hook (a real, locally measured 24x buffer gap from one extra INCLUDE column) → predict (why would a non-filtered column matter?) → INCLUDE/index-only-scan reveal → visibility map reveal → a second predict pivoting to UPDATE's effect → the Heap Fetches jump reveal → VACUUM restoring it → a third predict on hot-subset indexing → partial index size reveal → partial index write-saving reveal → a fourth predict on expression equivalence → the exact-match reveal → the syntax-not-semantics reveal → Recap → a closing "Prove it" check. Four predicts, three takeaways (steps 4, 9, 13), matching the engagement-arc convention from the prior topics in this chapter.

**Pre-notes accuracy.** All four pre-notes terms (composite index column order, work_mem spill, VACUUM, UPDATE) are used as described in the reveals that follow.

**Gaps.** None open in `coverage.json`'s `gapReview`. All four claims in FACT-CHECK.md are confirmed by direct local measurement on this sandbox — this is the first topic in this chapter where every single claim was independently measured rather than relying on any sourced-but-unmeasured honest gap, since INCLUDE columns, partial indexes, and expression indexes are all ordinary single-machine PostgreSQL features with nothing cross-process or cross-machine about them. The one claim (exact-expression matching) not stated explicitly in the fetched PostgreSQL docs is disclosed plainly in FACT-CHECK.md as resting on this topic's own measurement instead.

**Expert-reader depth.** `coverage.json`'s expert items (10) go beyond the syllabus line itself: isolating INCLUDE's own effect with an identical query and filter column, closing the loop with VACUUM rather than leaving the visibility-map regression as a dead end, using a realistic (not artificially tiny) hot-subset ratio for the partial-index measurement, and proving the expression-match limitation is structural (via `enable_seqscan = off` still failing to force index use) rather than merely cost-based.

**Engagement arc.** Verified: hook (step 1) is a real measured contrast; four predicts (2, 5, 8, 11); three takeaways (4, 9, 13); recap (14); one closing check (15).

**Does the narration teach?** All 15 steps pass well under the 50% description-overlap floor (0-18%) with no verbatim-reads-the-screen issues flagged by `narration-teaches.mjs` on the first pass.

## Looks review

Playwright (`check-all.mjs --only reels --topic covering-partial-expression-indexes`) failed once on first run: phone layout, step 13 (`RevealSyntaxNotSemantics`) — Row label/value overlapped on both rows ("what the planner compares" / "the written expression" and "what it ignores" / "what the value turns out to be"). Fixed by shortening both labels ("planner compares", "planner ignores") and the second value ("the resulting value"). Re-ran clean: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Editor test also passed on the same run.

No swipe-test/takeaway interaction (QUALITY.md #64) risk: this reel's first takeaway lands on step 4, not step 3 (the test's own "from" step, since step 2 is this reel's first predict and step 3 is a plain reveal with no takeaway).
