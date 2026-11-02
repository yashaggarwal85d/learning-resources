# Review — de.inference-logging-log-wait

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): logging the exact feature vector and
  model version at serving time (Hook, Reveal: the logging mechanism), joining to delayed labels
  for a skew-free-by-construction training set (Reveal: log-and-wait, the join), shadow/canary
  capture (Reveal: shadow vs. canary, placed), and storage cost plus PII in logged payloads
  (Predict/Reveal: storage cost, Reveal: PII and retention).
- All claims in FACT-CHECK.md are grounded either in a fetched, quote-checked primary source
  (Google's Rules of ML Rule #29, AWS Prescriptive Guidance's canary/shadow deployment
  definitions, Tecton's own feature-logging docs) or in this topic's own `examples.py`, run for
  real against this sandbox's Postgres cluster: a log-and-wait join with zero mismatches across
  2000 requests (re-reading the logged row a second way and asserting an exact match), a
  storage-cost estimate of ~696.2 GiB/year at the stated request rate/vector width/retention, and
  a re-identification check where 100% of 2000 rows stayed unique across non-customer-id fields
  after redacting only the customer id.
- The originally planned Google Cloud shadow/canary source was found to be retired (redirects to
  a generic landing page, confirmed via `curl -sIL`); substituted AWS Prescriptive Guidance's own
  MLOps checklist, which gives both definitions directly. Documented in FACT-CHECK.md's Problem
  Solving section.
- The reel's engagement arc holds: two predicts (steps 2 and 6), no takeaway on step 3 (the reel
  test's reference step), five takeaways (steps 4, 5, 7, 8, plus the prove-it close), a surprising
  number revealed through measurement rather than stated upfront.
- Narration (verified via `narration-teaches.mjs`): zero digits/symbols, every line under the
  50-word floor (longest 48 words), highest description-overlap 4%. A step-count mismatch
  (narration.json had 11 steps vs. reel.tsx's 10, from two narration entries written for one
  combined PII/retention reveal step) was found and fixed by merging the two narration steps'
  `lines` arrays into one.
- Bridge answers topic 2's handoff verbatim per CHAPTER.md; handoff leads into topic 4
  (training-set versioning and lineage) exactly as planned.

## Looks review (self-review, 2026-10-30)

Checked all 10 steps at desktop and phone sizes from
`site/test-results/{desktop,phone}-inference-logging-log-wait-*.png`.

- Step 7 (`RevealStorageMeasured`) failed the automated reel test twice, both instances of the
  same underlying bug class (light-on-light / dark-on-dark text contrast) first found on topics 1
  and 2, but each time with a new wrinkle:
  1. The "measured total" label sat on top of the bar's light (`C.focus`) fill using an
     equally-light `C.crema` text color — 1.67:1 contrast, caught by the automated check.
     Changing the text to a dark `C.cocoa` fixed the measured contrast, but the label was
     positioned past the bar's right edge (`x=555` vs. the bar's `x=25..545`), so the overhanging
     tail of the text sat on the dark page background with the now-dark text color and
     effectively vanished there — not caught by the automated contrast check (which only sampled
     text-on-fill, not the overhang), only found by eye in the screenshot.
  2. Fixed properly by moving the label entirely off the bar, onto its own line below it, in the
     neutral `C.taupe` used for other figure captions in this reel — no longer dependent on being
     "on" or "off" any fill. First attempt (same line as the "logged bytes..." label, right-
     aligned) passed on desktop but collided with that label on phone width, caught by the
     automated test ("text ... runs into ..."); moved to its own line beneath the bar instead,
     which passed cleanly on both sizes.
- Everything else — the Hook timeline, the predict/reveal row pairs, the log-point diagram, the
  log-and-wait join figure, the shadow/canary lane figure, the redaction grid, recap, and prove-it
  — reads correctly at both sizes with no other contrast, overlap, or clipping issues.

Final `node scripts/check-all.mjs --only reels --topic inference-logging-log-wait` run: `test:reels`
passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with "a save did
not open a new GitHub issue" — the same known, pre-existing, topic-independent Playwright/Chromium
sandbox limitation documented on topics 1 and 2's REVIEW.md, not caused by this topic and not a
shipping blocker.
