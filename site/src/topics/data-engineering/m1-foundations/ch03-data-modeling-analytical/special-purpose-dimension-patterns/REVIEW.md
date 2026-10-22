# Review — de.special-purpose-dimension-patterns

## Content

- Sourced entirely to Kimball Group's own four pages (Degenerate Dimensions, Role-Playing
  Dimensions, Junk Dimensions, Outrigger Dimensions): 13 quotes, verified word for word by
  `node scripts/sources.mjs check`, including the ligature characters ("deﬁned", "proﬁle",
  "ﬂags", "ﬂag") and the curly apostrophe in "attributes'" copied exactly from the fetched HTML.
- All four patterns are demonstrated on real, disclosed throwaway tables built for this topic on
  the shared sandbox, not described hypotheticals:
  - A degenerate order number with no dimension table, grouped correctly (2 lines under one
    number, 1 under another).
  - A single real `dim_date` table joined twice from the same order row, returning two genuinely
    distinct dates.
  - A real junk dimension of three shipping flags storing exactly the 3 combinations that occur,
    against a full Cartesian product of 8.
  - A real account-dimension outrigger referencing a date-opened dimension, measured to touch 3
    tables in a query where a flattened design would touch 2.
- All throwaway tables (and the scratch schema) were dropped immediately after the measurements
  were captured.
- Two predict steps (degenerate grouping, outrigger cost), each red-teamed against the plausible
  wrong answer, per `coverage.json`'s expert list (10 items).

## Build/engagement rules

- First predict step is step 3 (within the first four steps).
- Three `takeaway:` fields (degenerate groups fine but no attributes; role-playing needs named
  roles; outrigger costs a real join).
- Zero stray digits in `reel.tsx` — every on-screen number traces to `examples.py`; everything
  else is spelled in words.

## Fixes made this build

- `coverage.json` initially referenced a predict step title using the OUTLINE.md phrasing instead
  of the actual `reel.tsx` title; corrected to match exactly.
- The Prove-it narration step initially spoke the on-screen description verbatim; rewritten to a
  genuine teaching framing of the same question.
- One narration line in the Recap step was 54 words (limit 50); split into two lines.
- Three Playwright phone overlaps fixed by shortening Row labels in `RevealJunkQuote`,
  `PredictOutriggerCost`, and `Recap`.

## Checks run

`check-all.mjs --skip reels,links --topic special-purpose-dimension-patterns` (locked, docs,
sources, build, narration) — pass. `narration-teaches.mjs` — pass, all steps under the
description-overlap ceiling. `check-links.mjs` — pass, no broken links introduced. `check-all.mjs
--only reels --topic special-purpose-dimension-patterns` — pass, desktop and phone.
