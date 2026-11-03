# REVIEW: Timsort, Powersort and driftsort

## Pass 1 — content

- Every exact claim (run detection on the worked example, the old minrun scheme at n = 2,112,
  the n − 1 comparison count on sorted/reversed/equal shapes at n = 32,768, the galloping
  crossover at i = 6 and `MIN_GALLOP = 7`, the 2015 invariant-break reproduction on
  120/80/25/20/30, Powersort's node-power values, the Pochmann scheme on n = 315, and
  driftsort's own allocation formula) is computed or asserted directly in `examples.py`, with
  literal `assert` statements pinning the exact figures shown on screen, not inequalities.
  All assertions pass (`python3 examples.py`). No correction to `examples.py`'s own logic was
  needed this session — every assertion passed on the first run.
- `sources.mjs check` passes: 26/26 quotes verified, across CPython's `listsort.txt` at three
  points in its history (`v3.11.0`, `v3.10.0`, `main`), CPython's own changelog entry, the CAV
  2015 paper (opened via its CWI institutional-repository PDF after three wrong URL guesses —
  see `FACT-CHECK.md`), the Munro & Wild ESA 2018 abstract, Rust 1.81.0's own source and
  release announcement, the current Rust slice documentation, and the `sort-research-rs`
  driftsort introduction writeup. Five of the initial 23 quotes failed on the first pass, each
  for a distinct, real reason (a PDF rendering artifact with no clean second occurrence to
  substitute, an attempted "..." skip over reStructuredText metadata lines, and three missed
  literal Markdown link/blockquote syntax in the driftsort writeup's own prose); all five
  fixed by restructuring the quotes rather than loosening the check, and reconfirmed.
- `sources.mjs fetch` mangled CPython's `listsort.txt` at both the `v3.11.0` and `v3.10.0`
  tags, dropping roughly half the real file (389 of 802 lines) — a more severe case of this
  project's previously logged HTML-stripping bug than any seen before. Caught by noticing the
  expected word "Powersort" was entirely absent from the fetched `v3.11.0` text; fixed by
  curling the raw file directly and rebuilding the cache entry at `sources.mjs`'s own computed
  path. The same fix was needed for Rust's `slice/sort/stable/mod.rs`.
- CLRS, Sedgewick & Wayne, Bentley & Yao's unnamed earlier paper, and McIlroy's 1993 SODA paper
  stay citation-only, per `CHAPTER.md`'s own "named, probably dates back to" framing; no claim
  in `FACT-CHECK.md`'s claims table rests on any of them.

## Pass 2 — looks and mechanics

- `reel.tsx`: fourteen steps, two predict steps (each with an `answer`/explanation), three
  takeaways (galloping, the bug-scale step, and the Powersort step — none immediately after a
  predict step, per this project's own logged gotcha). The bridge is word for word topic 51's
  own shipped handoff text; the hook and predict match `CHAPTER.md`'s own designated opening
  (the 2015 bug and its run-length example), caught and corrected mid-storyboard after a direct
  re-grep of `CHAPTER.md` showed the first draft's hook didn't match the plan.
- The build's own number-literalness check caught three bare numbers (3.11, 1.81, 67 — real
  cited version numbers and a paper's own figure, not computed values) with no literal match in
  `examples.py`. Fixed by citing all three as named constants in `examples.py`, the same pattern
  used for the JDK's `MAX_RECURSION_DEPTH` in topic 51. The build's own takeaway-count check
  caught that this topic shipped with only two takeaways against the required minimum of three;
  fixed by adding a third, on the Powersort step.
- `narration.json`: fourteen steps, written to teach the mechanism rather than read the screen,
  every number spelled out in words, with `answer` present on both predict steps. Two narration
  lines (step 7's answer at 52 words, step 13 at 58 words) were caught proactively by a self-run
  word-count script, before any build check, and fixed by splitting into shorter lines.
- `coverage.json`: all four syllabus clauses are literal substrings of the syllabus scope; five
  primary-source citations mapped with items; a ten-item independent expert list; no open
  gap-review items.
- `prerequisites.mdx`: all linked titles (Elementary sorts and sorting networks, Merge sort,
  Quicksort and partitioning schemes, Heapsort) verified against `registry.ts` by exact grep
  before use.
- `scenes.tsx`: a real phone-viewport overlap was caught by the reel smoke test — the
  `RunDetection` visual's caption ("reversed, then extended") sat close enough to three of the
  run-length bar labels (values 3, 4, 5) to overlap on a phone-width render, the same bug class
  this project has hit before. Fixed by moving the caption's y-position to match the
  y-position this topic's other scenes already use for an equivalent caption, not by shortening
  already-short text.
- `node scripts/check-all.mjs --skip reels,links --topic .../timsort-powersort-driftsort`:
  locked, docs, sources, build and narration all pass outright on the second run (the first
  run's two real build failures — the three un-asserted numbers and the two-takeaway count —
  are listed above, fixed, and reconfirmed). `node scripts/check-all.mjs --only reels --topic
  .../timsort-powersort-driftsort`: `test:reels` failed on the first run with the phone overlap
  above, fixed, and passes outright on the second run ("Reel smoke test passed: 1 live reel(s)
  at desktop and phone sizes"); the unrelated `test:editor` sub-check still fails with its own
  documented, sandbox-only limitation (confirmed by multiple prior threads on a clean,
  unmodified `main`), which is why the combined check reports FAIL despite the actual reel test
  passing.
