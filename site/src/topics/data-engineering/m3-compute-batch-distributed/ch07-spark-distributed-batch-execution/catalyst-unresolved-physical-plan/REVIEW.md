# REVIEW: de.catalyst-unresolved-physical-plan

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on Chapter 2's single-node query-optimizer vocabulary and topic 2's
   Exchange/stage-boundary vocabulary, used but not re-taught. Nothing here is used before it's
   taught. Severity: n/a.
2. **Pre-notes.** Defines logical plan, catalog, physical plan, and cross-references the Chapter
   2 optimizer prerequisite — all assumed, none taught by the reel itself (the reel teaches the
   four-stage pipeline and two concrete optimizer rules, not these supporting terms).
   Severity: none found.
3. **Gap hunt.** Both syllabus clauses mapped in `coverage.json`; the long first clause (parse
   through cost-based reordering) spans five reveal steps plus a Deep dive for the
   statistics-gated piece — acceptable per the coverage rules, flagged here for visibility since
   it's the widest single clause this chapter has mapped so far. Severity: none found.
4. **Expert reader.** Subquery rewrites and projection pushdown (named in the syllabus alongside
   the two rules this topic measures) could read as omissions if left unstated; fixed by naming
   both explicitly in `coverage.json`'s expert list as the sibling rules this topic didn't
   independently measure, rather than implying predicate pushdown and constant folding are the
   whole rule set. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity; three predicts (full topic requires ≥2), the
   first at step index 2 (within the first four, required); each predict's wrong answer is a real,
   tempting intuition ("the optimizer keeps the written order," "every wide op shuffles, so this
   one does too" — a deliberate trap against this chapter's own established pattern from topics 2
   and 3, "there's another trick since the data hasn't changed"), not a strawman; three takeaways
   plus the recap's restated four-stage pipeline. Severity: none found.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/check-all.mjs --only build` after drafting, which caught one line in step 6
   reading the description almost verbatim ("join a hundred thousand row table against a ten row
   one…") — fixed by rewriting it as a picture ("one side with six figures of rows, the other with
   barely a handful") rather than restating the numbers directly, re-checked clean. Code
   identifiers spoken aloud rather than written literally (`EXPLAIN FORMATTED` → "explain
   formatted"; `ANALYZE TABLE` → "analyze table"; `BroadcastHashJoin` → "broadcast hash join";
   `SortMergeJoin` → "sort merge join"), per QUALITY.md #35/#50/#54/#59, written correctly from the
   start this time based on topic 4's own gotcha.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-4 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`) marking
the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity. At most two
rows per step except the four-row recap. Every predict step (3, 6, 8) uses its own dedicated visual
rather than reusing a reveal's numbers ahead of the matching prediction. The Playwright reel test
(section 9, below) found eight phone text-overlap cases on the first run (steps 1, 3, 6, 8, 9
twice, 10 twice) from label/value strings too long for phone width; fixed by shortening each one
(e.g. dropping "underneath" from step 1's value, "BroadcastHashJoin"/"SortMergeJoin" names from
step 9's values since the recap already states them in words) across two passes until both sizes
passed clean.
