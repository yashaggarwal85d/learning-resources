# Content review, self-review, 2026-10-22

Read topic 18's reel and Deep dive cold first (cte-inlining-vs-materialization), then this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- Hook (step 1) sets up a real tension — two numbers that should agree and mostly don't — before naming either mechanism. Matches the house hook pattern.
- The two predict/reveal pairs (independence, staleness) each ask the learner to commit to a number before the mechanism is named, then show the real measured numbers against the guess. Both predictions are plausible wrong turns a learner would actually make, not throwaway distractors.
- Step 4 (pg_class vs pg_statistic) is placed after the independence reveal, not before — on reflection this is the right order: the learner has just seen an estimate be wrong, and only then is shown where estimates come from at all. Placing it first would have been drier.
- The chain histogram → MCV → off-MCV → extended statistics walks from "the common case that works" to "the fix for when it doesn't," which mirrors the chapter's own CREATE STATISTICS documentation structure (see FACT-CHECK.md).
- Compounding (step 11) earns its place: it's the one claim in the topic that isn't itself a PostgreSQL-documented number (2.04× × 1.6× ≈ 3.3×, this topic's own arithmetic on its own two measurements) and OUTLINE.md and the step body both say so plainly, rather than dressing it up as a documented constant.
- Recap (step 13) names three questions rather than re-summarizing the mechanism, and step 14/15's two independent "Prove it" questions check the two formulas (MCV read, independence multiply) a learner needs to walk away actually able to apply, not just recognize.

## Pre-notes accuracy
Checked each of the 7 pre-notes.md terms (Predicate, Selectivity, Estimated vs. actual rows, Statistical independence, Skew, Random sampling, Bulk load) against where it's actually used in reel.tsx — "Where you meet it" for each one points at a step that genuinely needs that term, not a generic reference. No term is defined but unused; no term used in the reel is missing from pre-notes.

## Gaps
- The topic never shows the planner choosing between competing plans on the basis of a bad estimate — only the estimate itself. That's deliberate and stated in the handoff ("only useful once it's compared against the alternatives... next"): cost formulas and plan search are topic 20's job, not this one's. Checked this isn't a missing link, since the handoff text makes the boundary explicit.
- `n_distinct` estimation itself (how PostgreSQL guesses the number of distinct values from a sample, including the negative-n_distinct convention for values that scale with table size) is used in step 7's formula but never explained on its own. This is a real simplification: the reel treats `n_distinct` as a given input to off-MCV selectivity rather than its own estimation problem. Judged acceptable for a 15-step reel — flagged in post-notes' "Into the internals" rather than left completely silent (see post-notes.md, which states n_distinct's role in the off-MCV formula but does not re-derive how PostgreSQL arrives at it from a sample). A deeper topic on sampling-based estimation would be a legitimate future addition to the syllabus, not a hole in this one.

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: the planner's actual dispatch order between histogram and MCV logic, a full worked combination example using both lists together, `ALTER TABLE ... SET STATISTICS` for per-column target overrides, why sampling (not a full scan) is used for ANALYZE, and eqjoinsel's other case (both sides have MCVs). An expert reader who already knows "cardinality estimation uses histograms and MCVs" gets new, checkable material, not a restatement of the reel.

## Engagement arc
Two predict/reveal pairs plus two closing "Prove it" questions means 4 of 15 steps ask the learner to commit before telling them the answer — in line with the chapter's established density. The arc doesn't flag until step 9 onward (mechanism steps 4–8 are necessarily denser, same as the chapter's other mechanism-heavy topics), which was checked against topic 18's own step 4–8 density and found comparable.

## Does the narration teach?
Re-read narration.json's 15 entries against their matching reel.tsx `body` text. `node scripts/narration-teaches.mjs` independently confirms 0% four-word-phrase overlap with `body` on every step (description-overlap figures 0–6%, well under the 50% ceiling) — the narration restates each claim in different words and in the professor's own framing ("the planner is about to be handed...", "watch what happens when...") rather than reading the caption. Spot-checked step 6 (MCV) and step 10 (stale statistics) narration by ear-reading them aloud: both explain *why* the number is what it is, not just *that* it is that number.

---

# Looks review, self-review, 2026-10-22

Examined the rendered screenshots in `site/test-results/` (from the Playwright reel test, both desktop and phone sizes, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes (all from the first reels-test run, all now fixed and re-verified)
1. Step 6 (MCV bars): four percentage labels sat directly on colored bar fill at 2.36:1 contrast (desktop and phone), below the 3:1 floor. **Fixed**: moved labels outside the bar track, colored to match the row label instead of the fill.
2. Step 11 (compounding): the long PostgreSQL-docs-style closing line ran outside the drawing's right edge at both sizes. **Fixed**: split into two shorter lines.
3. Step 12 (frontier citation) and step 15 (ProveCorrelation reveal): same overflow pattern on phone, where `--svg-text-scale` renders text larger than desktop. **Fixed**: split each into two lines, and increased step 15's `Svg` height from 220 to 240 to keep the extra line inside bounds.
4. Steps 1, 3, 8, 10 (TwoNumbers, RevealIndependence, CreateStatistics, RevealStale): labels and values that fit at desktop overlapped on phone's larger text. **Fixed**: restructured each from side-by-side columns into stacked label-left/value-right rows with wider vertical gaps, independent of font-scale.

## Re-verification
Re-ran `node scripts/check-all.mjs --only reels --topic data-engineering/m1-foundations/ch02-advanced-sql-query-execution/cardinality-estimation-statistics` after all fixes: **pass** — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes," 264.1s. No remaining contrast, overlap, or overflow findings at either size.

## Against DESIGN.md's house style
- Black/white carries every step; color appears only where it means something: `C.cherryText` (red) marks a reveal/wrongness moment (predict reveals, the compounding warning, the correlation undershoot), consistent with "red = failure" (DESIGN.md, owner decision 2026-10-20). No color is used decoratively.
- Every scene is built from kit primitives (`Svg`, `T`, `Decode`, `Plot`, `Reticle`) plus two small local helpers (`Count`, `Panel`) that themselves only compose kit primitives — no raw SVG escapes the kit's conventions.
- Motion: all steps that show a before/after or reveal moment gate the after-state behind `answer !== null` / `t` progress, matching the kit's reveal convention used elsewhere in the chapter.

## Caveat
Both reviews above are self-reviews by the same agent that wrote the content — there is no independent reviewer. Expert sign-off is recorded as pending in references.md, matching the chapter's established convention for every other topic.
