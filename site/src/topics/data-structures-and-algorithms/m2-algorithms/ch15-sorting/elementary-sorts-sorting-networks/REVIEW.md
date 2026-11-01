# REVIEW: Elementary sorts and sorting networks

## Pass 1 — content

- Every exact claim (inversion/comparison/move counts, the instability demonstration, the
  four-input network's correctness, the small-sort cutoffs) is checked or asserted directly in
  `examples.py`, not stated from memory of the planning values. All assertions pass
  (`python3 examples.py`); two bugs were caught and fixed while writing it: the deck's planned
  ascending stretch was off by one index (fixed by re-laying out the deck), and the zero-one
  network check compared a list against a tuple and always failed regardless of correctness
  (fixed by comparing list-to-list consistently).
- `sources.mjs check` passes: 14/14 quotes verified. One new fetch-pipeline gotcha found and
  fixed this topic: Rust's `///` doc-comment markers, like the javadoc `*` markers found in a
  previous chapter, are literal characters `norm()` doesn't strip, so a quote spanning a
  multi-line `///` comment needs the markers stripped from the seeded cache file first.
- One quote (the Rust small-sort cutoff) had its exact text partly eaten by the same
  angle-bracket-mangling bug documented in the Chapter 14 topics (an earlier, unrelated generic
  type in the same file left an unclosed `<`); fixed by starting the quote from the next intact
  span rather than the literal condition CHAPTER.md originally expected to quote, and this is
  documented explicitly in both SOURCES.md and FACT-CHECK.md rather than silently adjusted.
- This topic's own four-input sorting network is deliberately not the literal network
  Dobbelaere's page draws (both are valid 5-CE, 3-layer networks on four inputs) — documented
  explicitly rather than treated as a discrepancy to paper over.

## Pass 2 — looks and mechanics

- `reel.tsx`: all twelve steps use only spelled-out numbers; the one stray digit found (in the
  file-header comment, "Chapter 14" / "Milestone 2") was reworded to "the previous chapter's"
  and "the second milestone" before the digit-check could flag it.
- `narration.json`: passes `narration-teaches.mjs` cleanly on the first attempt — all twelve
  steps under the fifty-word longest-line limit and under fifty percent description overlap, no
  VERBATIM flags.
- `coverage.json`: all four syllabus clauses are literal substrings of the syllabus scope; two
  primary sources (plus a third) mapped with items; a twelve-item independent expert list; no
  open gap-review items.
- `prerequisites.mdx`: all three linked titles (Lower bounds and adversary arguments, Asymptotic
  notation and case analysis, The word-RAM model and its assumptions) verified against
  `registry.ts` by exact grep before use.
- `scenes.tsx`: kept every label font size at thirteen units or above where it carries real
  content (a few small index/axis labels at eleven, following the house style for secondary
  labels, consistent with other shipped topics' scenes). Takeaways placed on steps five, eight
  and ten — not on the first non-predict step after hook+predict — following the lesson learned
  shipping the Chapter 14 topics.
