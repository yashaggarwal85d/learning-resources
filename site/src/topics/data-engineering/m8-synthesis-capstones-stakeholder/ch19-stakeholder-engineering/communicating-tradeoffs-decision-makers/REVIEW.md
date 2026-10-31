# Review — de.communicating-tradeoffs-decision-makers

## Content review

- All 4 scope clauses mapped in coverage.json; 2 sources (Amazon's 2017 shareholder letter,
  Dan McKinley's "Choose Boring Technology") with 4 items; 10 expert items; no open gaps.
- `examples.py` reuses topic 1's own cost model (not re-derived), computes the dominant-lever
  share mechanically, and checks the one-pager and the deep dive recommend the identical tier.
- FACT-CHECK.md: 5 claims verified, 5 red-team questions answered, one problem-solving note
  (the SEC filing's own HTTP 403 in this sandbox, substituted with Amazon's own company-news
  republication of the identical letter).

## Looks review

- Reel smoke test: 1 live reel at desktop and phone sizes, passed on the second run.
- First run found a genuine contrast failure in `RevealBluf` (step 6): the "one page, bottom
  line first" label sat inside its own semi-transparent fill (1.67:1 contrast, minimum 3:1,
  the same class of bug fixed earlier in topic 1's `RevealPricingTiers`). Fixed by moving both
  labels below their own rects with a clear gap, matching the tier-ladder convention.
- Takeaways (4 total, steps 4/5/6/7) manually word-counted, all ≤20 words counting the em dash
  as its own word.
- `test:editor`'s own failure ("a save did not open a new GitHub issue") is the known,
  topic-independent cloud-sandbox Playwright limitation (documented in team memory); not a
  shipping blocker.

## Checks run

`sources.mjs check` (5/5 quotes), `examples.py` (deterministic, ran twice, identical output),
`narration-teaches.mjs` (all 9 steps pass after rewriting step 1's narration to stop reading the
screen), `check-all.mjs --skip reels,links,narration` (pass), `check-all.mjs --only links,narration`
(pass), `check-all.mjs --only reels` (reel smoke test passed; overall FAIL only from the known
editor-test sandbox limitation).
