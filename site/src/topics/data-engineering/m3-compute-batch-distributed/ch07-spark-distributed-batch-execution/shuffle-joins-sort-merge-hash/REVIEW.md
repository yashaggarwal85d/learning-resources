# REVIEW: de.shuffle-joins-sort-merge-hash

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's broadcast vocabulary and the chapter's own
   shuffle-mechanics terms, used but not re-taught. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines equi-join, build side, shuffle Exchange and external sort — all
   assumed, none taught by the reel itself (the reel teaches the default-strategy choice and the
   hint-driven switch, not these supporting terms). Severity: none found.
3. **Gap hunt.** Both syllabus clauses mapped in `coverage.json`; the hint-priority order, the
   `preferSortMergeJoin` config route, both-sides-hinted tie-breaks, broadcast nested-loop and
   cartesian product as further fallbacks, and AQE's own runtime conversion are all named in the
   expert list but not independently measured — disclosed explicitly rather than silently assumed
   covered. Severity: none found.
4. **Expert reader.** The shared upstream hash-partitioning shuffle both strategies depend on,
   and the connection to the chapter's own spill topic for sort-merge's graceful degradation,
   could read as omissions if left unstated; fixed by naming both directly in `coverage.json`'s
   expert list. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about which of two valid strategies the planner
   picks by default; two predicts (full topic requires ≥2), the first at step index 2 (within the
   first four, required); each predict's wrong answer is a real, tempting intuition ("a hash join
   still needs sorted input," "both strategies fail the same way under pressure"), not a
   strawman; three takeaways plus the recap's restatement of both mechanisms and their contrast.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing rather than restating
   the body — continuing the practice learned from topics 9-11's own first-draft mistakes on this
   exact check. Also grepped `syllabus/data-engineering.md` directly for the exact clause wording
   before writing `coverage.json`, per the gotcha found on topic 10, and pre-counted the expert
   list to 10 items before the first build-check run, per the recurring gap found on topics 7-11.
   Ran `node scripts/check-all.mjs --topic shuffle-joins-sort-merge-hash --only build`, which
   passed clean on the first attempt. Code identifiers spoken aloud rather than written literally
   ("SortMergeJoin" → "sorting approach"; "ShuffledHashJoin" → "hashing approach"), per
   QUALITY.md #35/#50/#54/#59.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-11 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most two rows per step except the three-row recap, built at `h={280}` with the same spacing
that fixed topic 10's own recap overlaps. Both predict steps (3, 5) use their own dedicated visual
rather than reusing a reveal's numbers ahead of the matching prediction.

Playwright reel test (`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`):
three phone-width overlaps on the first run (step 3's own row, and both of step 6's rows) —
shortened each flagged label/value pair; re-ran clean at desktop and phone sizes on the second
attempt.

The build check's first run also caught a `coverage.json` reel-step reference
("Reveal: the planner's own comment names the real risk directly") that was missing the second
half of `reel.tsx`'s actual step title ("; sort-merge has no equivalent") — fixed to match
exactly before the check passed.
