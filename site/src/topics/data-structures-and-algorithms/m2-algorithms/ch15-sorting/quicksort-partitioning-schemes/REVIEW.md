# REVIEW: Quicksort and partitioning schemes

## Pass 1 — content

- Every exact claim (Lomuto/Hoare/three-way comparison and swap counts on all-equal, sorted
  and four-distinct-value input, the stack-depth bound, the random-pivot formula against a
  measured average, median-of-three on sorted/reversed input, and the median-of-three killer's
  own quadratic growth) is checked or asserted directly in `examples.py`, not stated from
  memory of the planning values. All assertions pass (`python3 examples.py`). Two real bugs
  were caught and fixed while writing it: `three_way_partition`'s first comparison model
  double- and triple-charged comparisons on the all-equal case (inflating 1,024 to roughly
  3,072); and `build_mo3_killer`'s first construction attempt was self-defeating — simulating
  the real partition during construction necessarily produces the sorted array as output,
  since a correct partition run to completion sorts by definition. Both are logged in
  `FACT-CHECK.md`'s own Corrections section.
- `sources.mjs check` passes: 17/17 quotes verified, across the OpenJDK `DualPivotQuicksort.java`
  source, Wild & Nebel's and Edelkamp & Weiß's arXiv abstracts, Kushagra et al.'s University of
  Waterloo preprint, and Wikipedia's Quicksort page. Four distinct source-pipeline mangling
  bugs were hit and fixed this topic (beyond the already-documented HTML-tag-stripping one):
  javadoc `*` line-wrap markers breaking a cross-line match, arXiv abstracts rendering inline
  math as literal LaTeX rather than Unicode, `pdftotext`'s column-interleaving on a two-column
  PDF, and stray wikitext/JSON markup embedded in a rendered Wikipedia page — all four are
  documented in `FACT-CHECK.md`'s own Red team, with the exact fix for each.
- McIlroy's own killer-adversary paper could not be fetched (SSL error, then HTTP 503); per
  CHAPTER.md's own fallback instruction, this topic builds and verifies its own median-of-three
  adversary (two ascending runs concatenated, confirmed genuinely Θ(n²) by measuring cost / n²
  flat across a 16× size range) rather than citing or reproducing his. Hoare's original papers,
  Bentley & McIlroy 1993, CLRS and Sedgewick & Wayne stay citation-only, per CHAPTER.md's own
  "to verify"/"not opened" instruction; every claim that would otherwise rest on them is
  verified computationally instead.

## Pass 2 — looks and mechanics

- `reel.tsx`: fourteen steps, two predict steps (both with an `answer`/explanation), three
  takeaways (Hoare, the stack-bound step, and three-way partitioning — none on the "from" step
  the phone caption-swipe test uses and none immediately after a predict step, per this
  project's own logged gotcha; an earlier placement on the step right after the second predict
  was caught and moved before shipping). The bridge is word for word topic 49's own shipped
  handoff text, grepped against `registry.ts` before use.
- `narration.json`: fourteen steps, written to teach the mechanism rather than read the
  screen, every number spelled out in words (no bare digits), with `answer` present on both
  predict steps.
- `coverage.json`: all five syllabus clauses are literal substrings of the syllabus scope;
  four primary sources mapped with items; a ten-item independent expert list; no open
  gap-review items.
- `prerequisites.mdx`: all five linked titles (Elementary sorts and sorting networks, Merge
  sort, The word-RAM model and its assumptions, Recurrences: Master theorem and Akra–Bazzi,
  Lower bounds and adversary arguments) verified against `registry.ts` by exact grep before
  use; no "Goes deeper later" section, since topics 51–54 and Chapter 16's Quickselect topic
  are not yet built (matching merge-sort's own prerequisites.mdx, which omitted the identical
  section for the identical reason).
- `scenes.tsx`: every label font size at twelve units or above; built from the `Svg`/`T`/`C`
  kit and a `Bar` helper in the same style as the chapter's own `KeyBar`; the median-of-three
  killer's own visual (step 10) reuses the real two-ascending-runs array the topic actually
  measures, not an illustrative stand-in. First Playwright pass flagged real overflow/overlap
  on both desktop and phone across several steps (the partition-contract bands, the
  stack-depth bars, and most of the longer named-source captions); fixed by shortening every
  flagged caption to a few words and re-spacing the stack-depth labels, confirmed by a second
  passing run rather than assumed fixed.
- `check-all.mjs --only reels --topic data-structures-and-algorithms/m2-algorithms/ch15-sorting/quicksort-partitioning-schemes`:
  `test:reels` itself passes outright ("Reel smoke test passed: 1 live reel(s) at desktop and
  phone sizes"); the unrelated `test:editor` sub-check still fails with its own documented,
  sandbox-only limitation (a popup-handling issue reproduced on a clean, untouched `main`),
  which is why the combined check reports FAIL despite the actual reel test passing.
