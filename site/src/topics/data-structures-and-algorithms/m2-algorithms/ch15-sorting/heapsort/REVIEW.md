# REVIEW: Heapsort

## Pass 1 — content

- Every exact claim (the build cost, the sort cost on random/sorted/reversed input, the
  information-theoretic and merge-sort bounds, the cache-line path simulation, the
  instability demonstration) is computed or asserted directly in `examples.py`, with literal
  assertions pinning the exact figures shown on screen, not just inequalities. All assertions
  pass (`python3 examples.py`). The sorted- and reversed-input counts (18,060 and 16,407) and
  the two bounds (8,770 and 9,217) matched `CHAPTER.md`'s own planning values exactly; the
  random-input and build counts (17,316 and 1,887) and the cache-line average (17.9) landed
  close to or exactly at the planning values on this topic's own random seed.
- `sources.mjs check` passes: 11/11 quotes verified, across libstdc++'s `stl_algo.h`, OpenJDK's
  `DualPivotQuicksort.java`, Rust 1.81.0's `unstable/mod.rs`, the Rust 1.81.0 release blog, the
  current Rust slice documentation, Go 1.19's release notes, and two reused (not re-verified)
  quotes from Chapter 6 topic 30's own shipped `SOURCES.md`. The `DualPivotQuicksort.java`
  excerpt needed a real fix mid-session: the first hand-built copy cut off before the depth-
  limit `if` block's closing brace, which `sources.mjs check`'s own whitespace normalization
  then spliced directly onto the next method, making the quote unmatchable; corrected by
  re-extracting the full block with its closing brace and re-verifying line by line against
  the raw file. Logged in `FACT-CHECK.md`'s own Red team.
- CLRS, Williams (1964), Floyd (1964), Musser (1997) and Wegener (1993) stay citation-only,
  per `CHAPTER.md`'s own "to verify"/"not opened" framing; the depth-limit mechanism they
  would otherwise support is instead verified directly from the three real systems' own
  source, which `CHAPTER.md`'s own scope clause treats as sufficient.

## Pass 2 — looks and mechanics

- `reel.tsx`: ten steps, one predict step (with an `answer`/explanation), two takeaways (the
  three-shapes step and the cache-locality step — neither immediately after the predict step,
  per this project's own logged gotcha). The bridge is word for word topic 50's own shipped
  handoff text. One number (384, the JDK's `MAX_RECURSION_DEPTH`) was removed from the step 9
  title during the build check below, since `examples.py` does not compute or assert it — the
  step now names the mechanism ("its own fixed bound") without the bare figure, consistent
  with this topic's own scope (the constant is cited in `SOURCES.md`/`FACT-CHECK.md`/
  `post-notes.md`, which are prose, not reel captions checked against `examples.py`).
- `narration.json`: ten steps, written to teach the mechanism rather than read the screen,
  every number spelled out in words, with `answer` present on the one predict step. The
  build check below caught a real violation (step 1's second line read the step's own `body`
  text verbatim) and a real 55-word line (step 9, over the 50-word limit); both fixed and
  reconfirmed by a second passing `check-all.mjs` run.
- `coverage.json`: all three syllabus clauses are literal substrings of the syllabus scope;
  five primary sources mapped with items (including the reused Chapter 6 citation); a
  ten-item independent expert list; no open gap-review items. Updated to match `reel.tsx`'s
  step 9 title after the 384-number fix, so every `step` reference is still an exact,
  character-for-character match.
- `prerequisites.mdx`: all linked titles (Binary heaps and heapify, Elementary sorts and
  sorting networks, Quicksort and partitioning schemes, Measuring the memory hierarchy,
  Timsort, Powersort and driftsort) verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: every on-screen caption kept to a few words from the first draft, following
  this project's own logged overflow gotcha, rather than writing full sentences and fixing
  them after a failed Playwright pass.
- `node scripts/check-all.mjs --skip reels,links --topic .../heapsort`: locked, docs, sources,
  build and narration all pass outright on the second run (the first run's three real build
  failures — the verbatim-narration violation, the 55-word line, and the un-asserted 384 — are
  listed above, fixed, and reconfirmed). `node scripts/check-all.mjs --only reels --topic
  .../heapsort`: `test:reels` itself passes outright ("Reel smoke test passed: 1 live reel(s)
  at desktop and phone sizes"); the unrelated `test:editor` sub-check still fails with its own
  documented, sandbox-only limitation (confirmed by multiple prior threads on a clean,
  unmodified `main`), which is why the combined check reports FAIL despite the actual reel
  test passing.
