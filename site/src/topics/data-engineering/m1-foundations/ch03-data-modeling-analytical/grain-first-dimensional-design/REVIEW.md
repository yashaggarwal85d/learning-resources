# Review — de.grain-first-dimensional-design

## Content

- Sourced entirely to Kimball Group's own three pages on dimensional design (four-step process,
  grain, additive/semi-additive/non-additive facts): 14 quotes, verified word for word by
  `node scripts/sources.mjs check`.
- Grain and additivity claims are demonstrated on real, disclosed throwaway tables built for this
  topic on the shared sandbox, not described hypotheticals:
  - An order-line table (atomic grain) vs. an order-header table (coarser grain): summing line
    totals, grouped by region or rolled straight to the order, reproduces the order total exactly
    (`examples.py`); the order-header table has no product/quantity column at all, which is the
    concrete cost of the coarser grain.
  - A four-quarter balance series: summed naively, the total is meaningless (460.00); the correct
    year-end balance is simply the fourth quarter's own value (150.00).
  - A two-region revenue/cost pair: a naive average margin (0.4250) disagrees with the margin
    recomputed from summed revenue and cost (0.3667) — the exact gap Kimball's own fix closes.
- All tables were dropped immediately after the measurements were captured.
- Three predict steps (grain choice, balance-across-time, shipping-cost ratio), each red-teamed
  against the plausible wrong answer, per `coverage.json`'s expert list (10 items).

## Build/engagement rules

- First predict step is step 4 (within the first four steps).
- Three `takeaway:` fields (atomic grain measured; semi-additive measured; the fix quoted).
- Zero stray digits in `reel.tsx` — every on-screen number traces to `examples.py`; everything
  else is spelled in words.

## Fixes made this build

- `coverage.json`'s expert list initially had 7 items; added 3 more to satisfy the ≥10 minimum.
- One expert item's `at.step` pointed to prose instead of the actual reel step title ("Prove it");
  corrected.
- Two Playwright phone/desktop overlaps: `RevealAtomicGrain`'s "lines, rolled to order" label
  shortened to "lines, rolled up"; `Recap`'s "additive, semi-additive" / "sums anywhere, or not
  over time" row shortened to "additive / semi" / "anywhere, or not over time".

## Checks run

`check-all.mjs --skip reels,links --topic grain-first-dimensional-design` (locked, docs, sources,
build, narration) — pass. `narration-teaches.mjs` — pass, all steps well under the description-
overlap ceiling. `check-links.mjs` — pass, no broken links introduced. `check-all.mjs --only reels
--topic grain-first-dimensional-design` — pass, desktop and phone.
