# REVIEW: de.broadcast-hash-join

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's Exchange vocabulary and the chapter's own
   Catalyst/shuffle terms, used but not re-taught. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines build side, driver, equi-join and table statistics — all assumed, none
   taught by the reel itself (the reel teaches the threshold's own hard-cutoff behaviour and the
   non-equi fallback, not these supporting terms). Severity: none found.
3. **Gap hunt.** All four syllabus clauses mapped in `coverage.json`; the 8 GB limit, the
   join-hint override, AQE's own runtime broadcast conversion, and the driver-OOM risk from stale
   statistics are all named in the sourced material or the expert list but not independently
   measured — disclosed explicitly rather than silently assumed covered. Severity: none found.
4. **Expert reader.** The hint priority order, build-side selection independent of call order, and
   outer-join build-side restrictions could read as omissions, or worse, as confused with this
   topic's own measured threshold behaviour if left unstated; fixed by naming each directly in
   `coverage.json`'s expert list. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about whether Spark copies the small table or
   shuffles both sides; two predicts (full topic requires ≥2), the first at step index 2 (within
   the first four, required); each predict's wrong answer is a real, tempting intuition ("the
   threshold bends for close calls," "a comparison just hashes a different way"), not a strawman;
   three takeaways plus the recap's restatement of all three outcomes.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing rather than restating
   the body — continuing the practice learned from topics 9 and 10's own first-draft mistakes on
   this exact check. Ran `node scripts/check-all.mjs --topic broadcast-hash-join --only build`,
   which passed clean on the first attempt. Code identifiers spoken aloud rather than written
   literally ("BroadcastHashJoin" → "the hash-join mechanism"; "Exchange" → "shuffle"), per
   QUALITY.md #35/#50/#54/#59. Also double-checked the syllabus clause for the third item against
   `syllabus/data-engineering.md` directly rather than trusting `CHAPTER.md`'s own paraphrase, per
   the gotcha found on topic 10.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-10 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most two rows per step except the three-row recap, built at `h={280}` with the same spacing
that fixed topic 10's own recap overlaps. Both predict steps (3, 5) use their own dedicated visual
rather than reusing a reveal's numbers ahead of the matching prediction.

Playwright reel test (`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`):
three phone-width overlaps on the first run (steps 1-3's own rows) — shortened each flagged
label/value pair; re-ran clean at desktop and phone sizes on the second attempt.

The build check's first run also caught a `coverage.json` `deep` reference that didn't match
`post-notes.md`'s own section heading text exactly, and an expert list still at 8 items (needs
≥10, the same recurring gap from topics 7-10) — fixed both before the check passed.
