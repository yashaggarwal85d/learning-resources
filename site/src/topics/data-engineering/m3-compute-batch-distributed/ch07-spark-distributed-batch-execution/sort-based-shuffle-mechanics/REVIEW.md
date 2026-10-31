# REVIEW: de.sort-based-shuffle-mechanics

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on topic 2's stage-boundary/Exchange vocabulary, used but not re-taught
   (pre-notes names it as assumed). Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines map task, reduce partition/bucket, spill, and the Exchange node — all
   assumed, none taught by the reel itself (the reel teaches the per-map-task write and the M times
   R block count, not these supporting terms). Severity: none found.
3. **Gap hunt.** All four syllabus clauses mapped in `coverage.json`; the "bounded in-flight
   requests" clause is covered in the reel step plus a Deep dive — acceptable per the coverage
   rules. Severity: none found.
4. **Expert reader.** The block-vs-file distinction (sort-based shuffle writes one file per map
   task, not one per M×R pair, even though block count is still M×R) could read as a contradiction
   if left implicit; fixed by naming it explicitly in `FACT-CHECK.md`'s red team and in
   `coverage.json`'s expert item on hash-based-vs-sort-based shuffle, and by the reel's own
   consistent use of "logical blocks" rather than "files" from step 6 onward. Severity: addressed
   during drafting.
5. **Engagement.** Hook poses genuine ambiguity (unknown file count); two predicts (full topic
   requires ≥2), the first at step index 2 (within the first four, required); each predict's wrong
   answer is a real, tempting intuition ("same data means same files," "blocks only depend on map
   tasks"), not a strawman; three takeaways plus the recap's restated full mechanism. Severity: none
   found.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: no line
   reads the description verbatim; ran `node scripts/narration-teaches.mjs` after drafting, no
   VERBATIM flags on any step.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the already-shipped topics 1 and 2 (consistent sizing, consistent
two-column layout). Every step's final frame states its point in words in the value column, colour
(`C.focus`) marking the contrasting fact, never used alone to carry meaning. Every `Row` fades in on
a staggered `seg`/`easeOut` timed opacity. At most two rows per step except the four-row recap (same
density as topics 1 and 2's recaps). The predict steps (3 and 6) use their own dedicated visuals
(`PredictEightPartitions`, `PredictReducePartitions`) rather than reusing a reveal's visual ahead of
time, since the file/block counts shown in a prior reveal shouldn't appear again before the matching
prediction is made. `tests/reels.mjs` (section 9, below) is the authoritative automated check for
clipping/overlap at both sizes; this review is a structural read of the SVG coordinates ahead of
that run.
