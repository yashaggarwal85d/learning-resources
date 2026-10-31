# Review — de.columnar-encodings-dictionary-rle

## Content review

- Every claim in the narration/reel traces to a quote in SOURCES.md (dictionary + fallback,
  RLE/bit-packing's scope, DELTA_BINARY_PACKED's two-step algorithm, DELTA_BYTE_ARRAY,
  BYTE_STREAM_SPLIT, ALP, FSST) — see FACT-CHECK.md's claims table.
- `examples.py` ran correctly on the first execution: all five encoders, including the three
  self-checks against the Parquet specification's own published worked examples
  (DELTA_BINARY_PACKED's "Example 2", DELTA_BYTE_ARRAY's `axis/axle/babble/babyhood` example,
  BYTE_STREAM_SPLIT's three-float example), passed before being run on this topic's own 200-row
  dataset. No bugs found or fixed — a clean build on the first pass, unlike topics 3 and 4.
- Red-team items (FACT-CHECK.md): the dictionary fallback is exercised on a genuinely distinct
  200-value column, not a hardcoded answer; the three delta/split encoders are checked against
  external ground truth (the spec's own worked examples), not just round-tripped; the "96%
  smaller" shipment-id number is explicitly scoped to a near-sorted construction, not presented as
  universal; ALP and FSST are named only at the conceptual level the outcomes commit to, not
  hand-implemented.
- Coverage check (PROJECT_PLAN.md Rule #6) initially failed: my first `coverage.json` clauses
  didn't match the syllabus line word for word (missing "cascading encodings", wrong splitting).
  Fixed by copying the three semicolon-delimited segments from `syllabus/data-engineering.md`
  line 305 verbatim (backticks stripped, matching topic 4's own convention), and added a line to
  post-notes.md's Frontier section covering cascading encodings so the `deep` reference is honest,
  not just a coverage-check patch.
- `numbersIn()` check initially failed: `reel.tsx` showed 400, 113, 1600, 60, 96%, 800, 307, 234,
  24% — all computed at runtime in `examples.py` but not present as literal digits in its source
  text. Fixed by adding hard-pinned `assert x == <literal>` statements for every one of those
  values (plus `len(WAREHOUSE_ZONES) == 6`), mirroring topic 4's same fix.
- Takeaway count initially failed (2, need ≥3). Added a third takeaway to step 9 (encode-first,
  compress-second), not step 7 (which immediately follows the predict step 6 and would have
  reproduced the known phone "swipe from caption" bug).

## Looks review

- First `--only reels` run failed with 8 desktop + 15 phone overlap/runs-into errors, all caused
  by `Row` (side-by-side label+value) components with text too long for the 550px drawing width at
  this topic's own wording. Fixed by converting every scene to `TallRow` (stacked label above
  value) and shortening every label/value to short, 1-4-word phrases.
- Second `--only reels` run passed cleanly ("Reel smoke test passed: 1 live reel(s) at desktop and
  phone sizes"), but manual screenshot review caught one more issue the Playwright test doesn't
  check for: the `Strip` chart's "60 bytes" segment, sized proportionally to the real 60-vs-1540
  byte split, was too narrow to hold its own label and clipped to just "by" on phone. Fixed by
  switching both `Strip` scenes (`RevealDictionaryRLE`, `RevealDeltaBinaryPacked`) from literal
  byte-count widths to small illustrative ratios (`w: 1` / `w: 1.5`), matching topic 4's own
  `Strip` convention, which keeps every segment wide enough to hold its text at any screen size.
- Manually reviewed all 20 screenshots (10 desktop, 10 phone) after the second reel-test pass:
  clean composition, no overflow, no contrast issues, Strip labels fully legible, predict-answer
  cards readable, no swipe-from-caption risk (takeaways on steps 4, 8, 9 — none immediately after
  the predict steps at 2 and 6).

## Checks

- `node scripts/sources.mjs check columnar-encodings-dictionary-rle` — 19 quote(s) found word for
  word, 0 problems.
- `python3 examples.py` — all assertions passed, including three spec-worked-example self-checks.
- `node scripts/check-all.mjs --skip reels,links --topic columnar-encodings-dictionary-rle` — pass
  (after the coverage and numbersIn fixes above).
- `node scripts/check-links.mjs .../prerequisites.mdx` — 2 link(s), 2 ok, 0 broken.
- `node scripts/check-all.mjs --only reels --topic columnar-encodings-dictionary-rle` — reel smoke
  test passed at desktop and phone (the separate `test:editor` failure is the known, pre-existing,
  sandbox-only popup-handling limitation unrelated to this topic).
