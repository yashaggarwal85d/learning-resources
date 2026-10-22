# Review — de.conformed-dimensions-drill-across

## Content

- Sourced entirely to Kimball Group's own three pages (Conformed Dimensions, Drilling Across,
  Enterprise Data Warehouse Bus Architecture): 9 quotes, verified word for word by
  `node scripts/sources.mjs check`, including the curly apostrophes ("business’s",
  "organization’s", "It’s") and the ligature in "deﬁned" copied exactly from the fetched HTML.
- The fan-out and the fix are demonstrated on a real, disclosed throwaway pair of fact tables built
  for this topic on the shared sandbox, not a described hypothetical: an orders fact (2 rows) and a
  support-tickets fact (3 rows) sharing one conformed date. Joined directly and summed, the query
  returns 6 rows and an order total nearly triple the true figure (435.00 vs. 145.00); aggregating
  each fact table to the shared date first, then joining those summaries, reproduces the true
  totals exactly, independently confirmed by summing each fact table alone with no join at all.
- The throwaway tables were dropped immediately after the measurements were captured.
- Three predict steps (direct-join safety, which total is correct, a third fact table), each
  red-teamed against the plausible wrong answer, per `coverage.json`'s expert list (10 items).

## Build/engagement rules

- First predict step is step 3 (within the first four steps).
- Three `takeaway:` fields (fan-out happens even on a conformed dimension; aggregate before
  joining; the fan-out is independently detectable).
- Zero stray digits in `reel.tsx` — every on-screen number traces to `examples.py`; everything
  else is spelled in words.

## Fixes made this build

- `coverage.json` initially referenced a step title ("Predict: can two fact tables of different
  grains be joined directly and then summed safely?") that didn't exactly match the reel.tsx step
  title ("Predict: is a direct join on a conformed date safe to sum?"); corrected both references.
- `pre-notes.md` initially had only 3 term bullets (needs 4–14); added a fourth term ("Fan-out").

## Checks run

`check-all.mjs --skip reels,links --topic conformed-dimensions-drill-across` (locked, docs,
sources, build, narration) — pass. `narration-teaches.mjs` — pass, all steps well under the
description-overlap ceiling. `check-links.mjs` — pass, no broken links introduced. `check-all.mjs
--only reels --topic conformed-dimensions-drill-across` — pass, desktop and phone, first attempt.
