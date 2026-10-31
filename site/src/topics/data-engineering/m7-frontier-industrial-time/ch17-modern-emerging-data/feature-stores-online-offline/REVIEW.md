# Review — de.feature-stores-online-offline

## Content review (self-review, 2026-10-30)

- Every syllabus clause for §17.1's second topic maps to a step (coverage.json): the offline/
  online split (Hook, Reveal: one definition two stores), freshness SLAs (Predict + Reveal three),
  all three named skew causes (Predict: which skew cause, Reveal one/two/three), and the four named
  platforms (Reveal: the named platforms, placed).
- All claims in FACT-CHECK.md are grounded either in a fetched, quote-checked primary source
  (Feast's offline/online store docs, Hopsworks' feature-group docs, Databricks' own Tecton
  acquisition announcement) or in this topic's own `examples.py`, run for real against this
  sandbox's Postgres cluster: a 13.6% mismatch rate for the different-code-path cause (0% with
  identical code), a 23.1% mismatch rate for the different-join cause, and a 31.3% vs. 0% SLA
  violation rate under a 45-minute vs. 15-minute materialization interval.
- The reel's engagement arc holds: two predicts (steps 2 and 6), no takeaway on step 3 (the reel
  test's reference step — see Looks review), four takeaways (steps 4, 5, 7, 8), a surprising
  number revealed through measurement rather than stated upfront.
- Narration (verified via `narration-teaches.mjs`): zero digits/symbols, every line under the
  50-word floor (one line was originally 55 words and was split), highest description-overlap 6%.
- Bridge answers topic 1's handoff verbatim per CHAPTER.md; handoff leads into topic 3 (inference
  logging) exactly as planned.

## Looks review (self-review, 2026-10-30)

Checked all 10 steps at desktop and phone sizes from `site/test-results/{desktop,phone}-feature-stores-online-offline-*.png`.

- The topic-scoped reel smoke test passed cleanly on the first run (no contrast, overlap, or
  swipe-test failures) — the fixes made on topic 1 (cherry/cherryText pairing for bad-outcome
  fills, no takeaway on the test's reference step, short label/value pairs instead of long
  same-line text) were applied from the start here.
- One cosmetic issue found by eye, not by the automated test: step 8's four platform-name boxes
  used a fixed 90-unit width, and "cloud-native" (the longest label) rendered flush against its
  box border. Fixed by sizing each box's width from its label's character count instead of a
  fixed constant, with a floor so the three short labels (Feast, Tecton, Hopsworks) keep a
  comfortable margin. Confirmed clean on both the desktop and phone re-screenshot.
- Everything else — the two-parallel-pipes figure, the bar reveals, the Reticle-based join-skew
  figure, the materialization-pulse timeline, recap and prove-it — reads correctly at both sizes.

Final `node scripts/check-all.mjs --only reels --topic feature-stores-online-offline` run:
`test:reels` passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with
"a save did not open a new GitHub issue" — the same known, pre-existing, topic-independent
Playwright/Chromium sandbox limitation documented on topic 1's REVIEW.md, not caused by this
topic and not a shipping blocker.
