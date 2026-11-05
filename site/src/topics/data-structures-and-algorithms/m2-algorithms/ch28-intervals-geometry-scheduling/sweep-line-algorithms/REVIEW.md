# Content review — dsa.sweep-line-algorithms

**Flow.** Hook (28 pairs, 2 crossings) → predict (which pairs a sweep tests) → the sweep
skeleton → tie-breaking → skyline setup/walk → predict (union-area structure) → union-area
reveal, with Klee/Bentley attribution → Bentley–Ottmann setup → correctness invariant →
predict (crossover point) → scaling curve → the one geometric primitive → a real system
(DuckDB IEJoin) → recap naming the skeleton and handing off to Chapter 29. Three predicts
(steps 2, 7, 11), all within the required spacing; four takeaways (steps 4, 6, 10, 14), none
on the step immediately after a predict's reveal.

**Pre-notes coverage.** All eight pre-notes terms (segment, axis-parallel rectangle,
intersection point, cross product sign, balanced search tree, priority queue, general
position, output-sensitive) are used in the reel steps that need them.

**Gap-hunt.** Re-read `FACT-CHECK.md`'s red-team section: tie-breaking direction, the
lazy-deletion heap's correctness (not just its cost), the union-area number verified by an
independent pairwise-overlap check (5 units double-counted, not a coincidence), the 8-segment
anecdote reproduced exactly from CHAPTER.md's own seed, and predict-distractor plausibility
for all three predicts. No new gap found on a second read.

**Expert-reader pass.** The correctness invariant (step 10) is stated as a real argument — two
segments can only cross after becoming neighbors, so testing only newly-adjacent pairs is the
complete set of ways a crossing can occur, not a heuristic shortcut. The output-sensitive
bound's crossover point (steps 11-12) is shown with real computed numbers, not just asserted
asymptotically.

**The element-distinctness claim was dropped, not softened.** CHAPTER.md flagged the
reduction from Chapter 1's element distinctness to Bentley–Ottmann's lower bound as needing
verification before being stated. The fetched Wikipedia source states the lower bound only in
terms of algebraic decision-tree models, citing Clarkson/Mulmuley/Chazelle & Edelsbrunner/
Balaban, with no mention of element distinctness. Since no source confirms the connection, it
is absent from the reel, post-notes, and references.md — recorded as a deliberate scope change
in `OUTLINE.md`'s "Changes from the chapter plan."

**Engagement.** The three predicts sit at genuine decision points (before any algorithm is
shown, before the union-area structure is revealed, before the scaling data is shown).

**Narration teaches, not reads.** Checked every step's `narration.json` against its `body`
caption for verbatim overlap (confirmed separately by `check-all.mjs`'s narration check, which
passed); narration lines explain why the skeleton works the way it does, not what is drawn.

**Looks review (Playwright screenshots, desktop + phone).** Fixed two real bugs found by the
reel smoke test: step 8's two side-by-side labels ("sum of the three areas: thirty-four" and
"union: twenty-nine") overlapped on phone width — stacked them vertically instead. Step 13's
caption ran outside the drawing on phone — split it into two short lines instead of one long
one. Re-ran the reels check after both fixes: passes at both sizes (`test:editor`'s failure is
the known pre-existing sandbox limitation, unrelated to this topic). Spot-checked steps 1, 8,
9, and 13 on both desktop and phone directly: no remaining clipped or overlapping text, kit
colours and fonts throughout, predict and takeaway UI render correctly.

**Verdict:** ready to ship as `status: 'held'`.
