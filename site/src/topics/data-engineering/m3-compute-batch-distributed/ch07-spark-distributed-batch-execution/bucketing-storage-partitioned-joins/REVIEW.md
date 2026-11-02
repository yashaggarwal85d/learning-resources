# REVIEW: de.bucketing-storage-partitioned-joins

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's Exchange/partitioning vocabulary, used but not
   re-taught. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines Exchange, persistent table, join key and DSv2 — all assumed, none taught
   by the reel itself (the reel teaches bucketing's shuffle-elimination effect, the bucket-count
   requirement, and SPJ, not these supporting terms). Severity: none found.
3. **Gap hunt.** All three syllabus clauses mapped in `coverage.json`; SPJ's own extension configs
   (partially-clustered skew handling, compatible-transform tolerance) are named in the sourced
   material but not independently measured — disclosed explicitly in the expert list rather than
   silently assumed covered. Severity: none found.
4. **Expert reader.** Bucket pruning and the shared `EnsureRequirements` planner rule (the same
   mechanism the previous topic's exchange-elimination measurement exercises) could read as
   omissions, or worse, as confused with this topic's own bucketing-specific measurement if left
   unstated; fixed by naming both directly in `coverage.json`'s expert list and in
   `FACT-CHECK.md`'s red team as distinct, related mechanisms. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about whether pre-splitting both tables actually
   pays off; two predicts (full topic requires ≥2), the first at step index 2 (within the first
   four, required); each predict's wrong answer is a real, tempting intuition ("bucketed is
   bucketed, counts don't matter," "Iceberg just calls bucketBy itself"), not a strawman; three
   takeaways plus the recap's restatement of both mechanisms.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check: paraphrased each step as the professor's own framing rather than restating
   the body, learning from topic 9's own first-draft mistake on this exact check. Code identifiers
   spoken aloud rather than written literally (`bucketBy` → "Spark's own splitting function";
   "Exchange" → "shuffle"), per QUALITY.md #35/#50/#54/#59. The build check's first run instead
   caught two unrelated things: the third syllabus clause copied from `CHAPTER.md`'s own
   paraphrase ("(e.g. Iceberg) reusing...") rather than the real syllabus line in
   `syllabus/data-engineering.md` ("such as Iceberg, which reuses...") — fixed in both
   `coverage.json` and `OUTLINE.md` to match the syllabus word for word — and a 21-word takeaway
   (the em dash counted as a word, the same recurring gotcha from topics 6-9).

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-9 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most two rows per step except the three-row recap. Both predict steps (3, 5) use their own
dedicated visual rather than reusing a reveal's numbers ahead of the matching prediction.

Playwright reel test (`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`): one
desktop and three phone-width overlaps on the first run (step 4's and step 5's rows, and three
spots in the step 7 recap) — shortened each flagged label/value pair across two more rounds; the
recap's own three rows needed both shorter text and a taller `Svg` (`h={260}` → `h={280}`) with
more vertical spacing between rows. Re-ran clean at desktop and phone sizes on the third attempt.
