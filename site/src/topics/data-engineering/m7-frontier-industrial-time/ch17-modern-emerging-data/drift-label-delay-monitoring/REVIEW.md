# Review — de.drift-label-delay-monitoring

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): data drift vs. concept drift (Hook, Reveal:
  data drift vs. concept drift), PSI/KS/Jensen-Shannon tests per feature (Reveal: PSI, KS and
  Jensen-Shannon agree; Reveal: a case where they disagree), schema and null-rate drift (Reveal:
  null-rate creep), and proxy metrics during label delay (Reveal: proxy metrics; Reveal: what a
  proxy does not prove).
- All claims in FACT-CHECK.md are grounded either in a fetched, quote-checked primary source
  (Evidently AI's own documented default thresholds for PSI/KS/Jensen-Shannon, Wikipedia's
  Jensen-Shannon divergence and Kolmogorov-Smirnov test pages) or in this topic's own
  `examples.py`, implemented directly in NumPy (no scipy in this sandbox) and run for real: an
  obvious mean shift all three tests agree on (PSI 1.631, KS 0.499, JS 0.512), a concept-drift case
  where PSI on the feature stays at 0.007 while a fixed rule's precision collapses from 1.00 to
  0.00, a null-rate creep of 11.8% hidden under PSI 0.091 (just under Evidently's own 0.1
  threshold) by mean-imputation, and an engineered disagreement case (PSI 0.012 vs. KS 0.022) on
  identical data.
- One coverage.json clause initially failed the build's exact-match check (PROJECT_PLAN.md Rule
  #6): "Jensen-Shannon" used a plain hyphen where the syllabus file itself uses an en dash
  ("Jensen–Shannon"). Fixed by copying the clause character-for-character from
  `syllabus/data-engineering.md` line 937.
- The reel's engagement arc holds: two predicts (step 2 and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step), five takeaways (steps 4, 5, 6, 7, 8).
- Narration (verified via `narration-teaches.mjs`): zero digits/symbols, every line under the
  50-word floor, highest description-overlap 2% (well under the 50% flag threshold).
- All five takeaways were checked against the 20-word limit before the build ran (two were
  initially 21 words and trimmed to 19-20) — this time caught in the pre-check rather than the
  build run.
- Bridge answers topic 4's handoff verbatim per CHAPTER.md; handoff leads into topic 6 (embedding
  pipelines at scale) exactly as planned. This closes §17.1.

## Looks review (self-review, 2026-10-30)

Checked all 10 steps at desktop and phone sizes from
`site/test-results/{desktop,phone}-drift-label-delay-monitoring-*.png`.

- The topic-scoped reel smoke test passed cleanly on the first run (no contrast, overflow, overlap,
  or swipe-test failures) — every fix learned across topics 1-4 (cherry/cherryText pairing for bad
  outcomes, no takeaway on the test's reference step, short stacked label/value blocks instead of
  long same-line `Row` pairs or long single-line captions) was applied from the start on this
  topic's `Recap` scene and every caption line.
- No cosmetic issues found by eye either: the hook's two-line trend figure, the predict/reveal row
  pairs, the twin-histogram data-vs-concept-drift comparison, the three-test agreement figure, the
  PSI/KS disagreement figure, the two-bar null-rate figure, the proxy list, and recap/prove-it all
  read correctly at both sizes.

Final `node scripts/check-all.mjs --only reels --topic drift-label-delay-monitoring` run:
`test:reels` passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with
"a save did not open a new GitHub issue" — the same known, pre-existing, topic-independent
Playwright/Chromium sandbox limitation documented on topics 1-4's REVIEW.md, not caused by this
topic and not a shipping blocker.
