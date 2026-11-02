# REVIEW: de.task-scheduling-locality-parallelism

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on topic 3's shuffle-mechanics vocabulary (map task, shuffle output),
   used but not re-taught. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines executor, core, shuffle (cross-referenced to topics 1-3), RDD partition —
   all assumed, none taught by the reel itself (the reel teaches the two parallelism settings and
   the locality/delay-scheduling limitation, not these supporting terms). Severity: none found.
3. **Gap hunt.** All four syllabus clauses mapped in `coverage.json`; two (dynamic allocation,
   FIFO/FAIR pools) are covered only via Deep dive, not the reel itself — acceptable per the
   coverage rules, flagged here for visibility since this topic's local-mode methodology genuinely
   cannot demonstrate either. Severity: minor, no fix required (coverage rule satisfied, honestly
   disclosed in FACT-CHECK.md).
4. **Expert reader.** The AQE-coalescing interaction with `spark.sql.shuffle.partitions` could read
   as an inconsistency if left unstated (why would a configured 200 ever not appear?); fixed by
   naming it explicitly in `examples.py`'s own comment, `OUTLINE.md`, `FACT-CHECK.md`, and
   `coverage.json`'s expert list, rather than silently disabling AQE with no explanation.
   Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity; three predicts (full topic requires ≥2), the
   first at step index 2 (within the first four, required); each predict's wrong answer is a real,
   tempting intuition ("a fixed small number," "the shuffle just keeps the same 4," "they share one
   dial"), not a strawman; three takeaways plus the recap's restated two-knob rule. Severity: none
   found.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/narration-teaches.mjs` after drafting, no VERBATIM flags on any step. Code
   identifiers spoken aloud rather than written literally (`spark.sql.shuffle.partitions` → "spark
   dot sql dot shuffle dot partitions"; `groupBy` → "group by"), per the build's own QUALITY.md
   #35/#50/#54/#59 check, caught and fixed in both `narration.json` and `reel.tsx`'s predict option
   text during drafting.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-3 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`) marking
the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity. At most two
rows per step except the four-row recap. Every predict step (3, 5, 7) uses its own dedicated visual
rather than reusing a reveal's numbers ahead of the matching prediction. The Playwright reel test
(section 9, below) found seven phone/desktop text-overlap cases on the first run (steps 1, 5, 6, 7,
8, 9 twice) — all from label/value strings that read fine on desktop but ran into each other at
phone width; fixed by shortening each flagged string (e.g. "a task, and its data's location" →
"a task, its data's location"; dropping "same session" from step 8's label) and re-running until
both sizes passed clean.
