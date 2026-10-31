# REVIEW: de.adaptive-query-execution-aqe

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous two topics' sort-merge/broadcast/shuffled-hash
   vocabulary, used but not re-taught. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines shuffle exchange, SortMergeJoin, BroadcastHashJoin, shuffle partitions,
   query stage, and cost-based statistics — all assumed, none taught by the reel itself (the reel
   teaches the reoptimization mechanism, not these supporting terms). Severity: none found.
3. **Gap hunt.** The one syllabus clause is mapped in `coverage.json` across all three measured/
   sourced claims. Shuffled-hash conversion, skew-join splitting, the two separately-tracked
   broadcast thresholds, and the cost-gated adoption of a reoptimized plan are all named in the
   expert list but not independently measured — disclosed explicitly rather than silently assumed
   covered. Severity: none found.
4. **Expert reader.** The shared `localShuffleReader` mechanism and whole-stage codegen
   regeneration after a reoptimization could read as omissions if left unstated; fixed by naming
   both directly in `coverage.json`'s expert list. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about what a planner can commit to before a
   shuffle has even run; two predicts (full topic requires ≥2), the first at step index 2 (within
   the first four, required); each predict's wrong answer is a real, tempting intuition ("the
   strategy was already decided," "the configured count is fixed"), not a strawman; three
   takeaways plus the recap's own restatement of both mechanisms and the hard edge they share.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing rather than restating
   the body. One first-draft miss: step 5 (now the second predict) echoed the description's
   "the actual data turns out to need far fewer" verbatim — caught by
   `node scripts/check-all.mjs --topic adaptive-query-execution-aqe --only build` on the first
   run, fixed by reframing as the professor's own explanation ("nobody sized that number to the
   data; it's just a session-wide default"), and the check passed clean on the second run. Code
   identifiers spoken aloud rather than written literally. Grepped `syllabus/data-engineering.md`
   directly for the exact clause wording before writing `coverage.json`, and pre-counted the
   expert list to 11 items before the first build-check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics (consistent sizing, consistent
two-column layout). Every step's final frame states its point in words in the value column,
colour (`C.focus`) marking the contrasting fact. Every `Row` fades in on a staggered
`seg`/`easeOut` timed opacity. At most two rows per step except the three-row recap, built at
`h={280}`.

Playwright reel test (`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`):
the first run found four phone-only failures — three text overlaps (step 2's row, step 6's row,
and the recap's third row) fixed by shortening the flagged label/value pairs, and one
`swipe from the caption on step 2 went to 2` that survived three separate fix attempts
(shortening the step-2 title from 11 words to 7; shortening its body and fig text) with zero
change in outcome. Traced to a known class of bug (`tests/reels.mjs`'s swipe test targets a
specific "from" step — the first non-predict step at dot index ≥1 — and a `takeaway` field on
that step, or on any step immediately after a predict, breaks the phone touch-swipe gesture
regardless of text length or wording; see team memory
`learning-resources-takeaway-position-gotcha`). Original 7-step reel had its first reveal
(index 1) as both the "from" step and a required takeaway's home, with no safe position left
except the recap for the remaining two takeaways. Fixed by restructuring to 9 steps: inserted an
"elaborate" beat directly after each predict's own reveal (step 5 and step 8), moved two of the
three takeaways there, and removed the takeaway from the "from" step entirely — no measured claim
changed. Re-ran clean (`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`) on
the next attempt. `npm run test:editor`, bundled unconditionally into the same `reels` check
category, fails in this cloud sandbox on a clean, untouched `main` too (confirmed independently
on `de.shuffle-joins-sort-merge-hash`'s own unmodified files) — a known environment limitation,
not caused by this topic.
