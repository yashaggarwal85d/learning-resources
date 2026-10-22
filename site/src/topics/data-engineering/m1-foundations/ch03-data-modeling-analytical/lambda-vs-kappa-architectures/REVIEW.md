# Review — de.lambda-vs-kappa-architectures

## Content summary

13 steps covering Lambda (batch and stream processing run in parallel, merged at serving) and
Kappa (one stream-only pipeline, reprocessing by replaying a fully-retained log), both quoted
directly from their own originators — Nathan Marz for Lambda, Jay Kreps for his own restatement
of Lambda and his own proposed Kappa. Names the real, specific costs each one pays: Lambda's
dual-logic maintenance burden (called "not fixable" by Kreps himself), Kappa's reprocessing-by-
replay cost when logic changes. Closes with the honest resolution — the industry's drift to
unified engines is about operating one framework, not raw speed — and the disclosed exception:
a batch correction layer still earns its cost when a retained log is too large to replay inside
the latency actually needed. Three predicts (first at step 3, within the first four), three
takeaways, a genuinely new "Prove it" scenario rather than a restatement of any reveal.

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a direct quote from each
architecture's own originator, fetched and quoted word for word.

## Sources

Nathan Marz's own "How to beat the CAP theorem" (the post that first described Lambda) plus Jay
Kreps's own "Questioning the Lambda Architecture" (which names Lambda's real cost and proposes
Kappa). 13 quotes total, verified word for word (`node scripts/sources.mjs check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 7, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 9%, longest line 43 words).
- No literal digits appear in `reel.tsx`'s rendered content; `examples.py` has no lab numbers to
  match against, and none were written.

## Fixes made during this build

- A narration rewrite of step 12 (the recap line) came out to 51 words, over the hard 50-word
  limit — split into two shorter lines (the cost comparison, then the real reason for the
  industry's preference) rather than compressing into one. No other narration, coverage, or
  takeaway-count fixes were needed — `coverage.json` was written with 10 expert items and
  `at.step` values copied from the final `reel.tsx` titles from the start.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short label/value row pattern from the start and passed clean on the first run.

## Checks run

- `node scripts/sources.mjs check` — 13/13 quotes verified word for word.
- `python3 examples.py` — pass, "lambda-vs-kappa-architectures examples: all numbers check out"
  (this topic has no lab; the two constants are this topic's own structural pipeline count for
  each named architecture, asserted as a fact about each architecture's own definition).
- `node scripts/check-all.mjs --skip reels,links --topic lambda-vs-kappa-architectures` — pass
  (locked, docs, sources, build, narration) after the 51-word narration-line fix above.
- `node scripts/narration-teaches.mjs .../lambda-vs-kappa-architectures` — pass, all 13 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic lambda-vs-kappa-architectures` — pass,
  Playwright desktop and phone, clean on the first run.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
