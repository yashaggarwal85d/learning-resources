# REVIEW: de.partition-sizing-repartition-coalesce

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on this chapter's own shuffle-mechanics and shuffle-partitions-config
   vocabulary (topics 3 and earlier), used but not re-taught. Nothing here is used before it's
   taught. Severity: n/a.
2. **Pre-notes.** Defines shuffle, Exchange, partition, and narrow/wide dependency — all assumed,
   none taught by the reel itself (the reel teaches the config-vs-shuffle-vs-merge distinction and
   the coalesce(1) trap, not these supporting terms). Severity: none found.
3. **Gap hunt.** Both syllabus clauses mapped in `coverage.json`; the ~100-200 MB per-task target
   size is named in the syllabus but not independently measured against a real task's bytes —
   disclosed explicitly in the expert list rather than silently assumed covered. Severity: none
   found.
4. **Expert reader.** Column-based and range-based `repartition`, and AQE's own automatic
   `coalescePartitions`, could read as omissions if left unstated; fixed by naming all three
   directly in `coverage.json`'s expert list as the sibling mechanisms this topic's own
   count-based measurement doesn't cover. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about what decides the piece count; three
   predicts (full topic requires ≥2), the first at step index 2 (within the first four,
   required); each predict's wrong answer is a real, tempting intuition ("it's just a
   relabeling," "fewer pieces is fewer pieces, same cost," "the earlier work still runs in
   parallel"), not a strawman; three takeaways plus the recap's three-mechanism restatement.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/check-all.mjs --only build` after drafting, which passed clean on the first
   check — narration deliberately avoids naming `repartition`/`coalesce` by their literal call
   names in favour of "this call"/"a different call," since both are ordinary English words that
   would otherwise read as code syntax read aloud; the visible on-screen text and body already
   name them directly. Per QUALITY.md #35/#50/#54/#59.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-7 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most two rows per step except the four-row recap. All three predict steps (3, 5, 7) use their
own dedicated visual rather than reusing a reveal's numbers ahead of the matching prediction. The
Playwright reel test found three phone text-overlap cases on the first run (step 2's two config
rows, step 8's row count row); fixed by shortening each label/value pair ("shuffle partitions set
to 4" / "4 output partitions" → "config set to 4" / "4 partitions out"; "rows in that one
partition" / "all of them, every row" → "rows inside it" / "all of them"), re-run clean at both
desktop and phone sizes.
