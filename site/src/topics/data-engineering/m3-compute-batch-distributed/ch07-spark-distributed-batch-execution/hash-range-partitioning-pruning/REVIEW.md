# REVIEW: de.hash-range-partitioning-pruning

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's partition-count and Exchange vocabulary,
   used but not re-taught. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines Exchange, required distribution, global sort, and predicate — all
   assumed, none taught by the reel itself (the reel teaches the two partitioners, exchange
   elimination, and static pruning, not these supporting terms). Severity: none found.
3. **Gap hunt.** All three syllabus clauses mapped in `coverage.json`; sampled range
   partitioning's own boundary-sampling step and DSv2 partition-stats filtering are both named in
   the syllabus but not independently measured — disclosed explicitly in the expert list rather
   than silently assumed covered. Severity: none found.
4. **Expert reader.** Dynamic partition pruning (DPP) and `ReusedExchange` subplan deduplication
   could read as omissions, or worse, as confused with this topic's own static-pruning and
   requirement-based elimination measurements if left unstated; fixed by naming both directly in
   `coverage.json`'s expert list and in `FACT-CHECK.md`'s red team as distinct mechanisms.
   Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about whether grouping and sorting shuffle
   identically; three predicts (full topic requires ≥2), the first at step index 2 (within the
   first four, required); each predict's wrong answer is a real, tempting intuition ("each step
   pays its own way," "the planner reuses regardless of key," "the engine reads everything then
   filters"), not a strawman; three takeaways plus the recap's three-mechanism restatement.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/check-all.mjs --only build`, which on the first pass caught step 1's narration
   echoing the bridge text ("Sizing decided how many pieces...") verbatim — rewritten as the
   professor's own framing of the question, then the same check passed clean. Code identifiers
   spoken aloud rather than written literally (`hashpartitioning` → "hash partitioning";
   `rangepartitioning` → "range partitioning"; `PartitionFilters` → "the directory filter"), per
   QUALITY.md #35/#50/#54/#59.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-8 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most two rows per step except the four-row recap. All three predict steps (3, 5, 7) use their
own dedicated visual rather than reusing a reveal's numbers ahead of the matching prediction.

Playwright reel test (`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`):
one phone-width overlap on first run, step 7's row ("filter on the directory key" running into
"skips directories?") — shortened both the label and value; re-ran clean at desktop and phone
sizes.
