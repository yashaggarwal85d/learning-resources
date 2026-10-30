# Review — de.point-time-correct-training

## Content review (self-review, 2026-10-30)

- Every syllabus clause for §17.1 maps to a step, a deep-notes heading, or an explicit `out` with
  reason (coverage.json). The one clause mapped to `{deep: "Internals"}` (batch vs. streaming
  feature computation) is actually covered in post-notes' Internals section.
- All eight claims in FACT-CHECK.md are grounded in the topic's own `examples.py` run against a
  real Postgres cluster (naive AUC 0.997 vs. as-of AUC 0.743; post-outcome field present for every
  churned customer and zero as-of matches; both TTL edge cases join to null), not assumed numbers.
- The reel's engagement arc holds: two predicts (steps 2 and 6), takeaways on steps 4, 5, 7, 8
  (not on step 3, the reel test's "from" step — see Looks review), a surprising number (the AUC
  gap) revealed rather than stated upfront.
- Narration (verified via `narration-teaches.mjs`): zero digits/symbols, highest
  description-overlap 22% (step 9), well under the 50% floor; teaches rather than reads the
  screen.
- Bridge/handoff prose and `uses`/`introduces` ids in the registry entry match CHAPTER.md's plan
  (simplified to drop `window-vs-self-join-cost`, which this topic doesn't actually use).

## Looks review (self-review, 2026-10-30)

Checked all 10 steps at desktop and phone sizes from `site/test-results/{desktop,phone}-point-time-correct-training-*.png`.

- Fixed: step 4's "inflated" label had zero contrast against its own bar fill (`C.badText` text on
  a `C.badText` bar) — switched the bar to `C.cherry` (the kit's dark bad-outcome fill) with
  `C.cherryText` on top, matching the kit's documented pairing.
  (QUALITY.md's own contrast floor, enforced by `tests/reels.mjs`.)
- Fixed: step 5's per-cell "churned"/"stayed" labels collided into each other at 55px cell
  spacing — replaced with a single legend (one swatch + label for each) below the row of cells.
- Fixed: step 10's two `Row`-style label/value pairs overlapped (`Row`'s `w` prop is font-weight,
  not a text-wrap width, so two long strings on the same baseline can run into each other) —
  rebuilt as two stacked two-line blocks (label above, value below) instead of inline rows.
- Fixed: a phone-only caption-swipe failure on step 3, reproducing on every run. Root cause
  matches QUALITY.md #64/#59: step 3 is the reel test's "from" step (the first non-predict step
  after the opening predict, true for almost every topic in this hook-then-predict pattern), and
  it carried the reel's first `takeaway`. Moved the teaching point into the step's own body text
  and removed the `takeaway` from step 3; the swipe test now passes cleanly.
- Everything else — timeline/plot/reticle framing, the predict steps' option layout, the recap and
  prove-it steps — reads correctly at both sizes with no further overlap, clipping, or contrast
  issues.

Final `node scripts/check-all.mjs --only reels --topic point-time-correct-training` run:
`test:reels` passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with
"a save did not open a new GitHub issue" — this is the known, pre-existing, topic-independent
Playwright/Chromium popup-handling limitation in this cloud sandbox (confirmed against unmodified
`main` with zero topic changes), not caused by this topic. Not a shipping blocker per that
investigation; flagged to the owner separately.
