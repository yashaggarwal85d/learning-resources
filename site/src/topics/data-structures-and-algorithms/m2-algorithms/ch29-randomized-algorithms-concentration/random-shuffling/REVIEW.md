# Review — dsa.random-shuffling

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 26/26 pass, after fixing three quotes that crossed an
  inline footnote marker (`[2]`, `[4]`) or a trailing punctuation mismatch, and one quote that
  was paraphrased instead of copied from the actual arXiv abstract text.
- Every claim in `FACT-CHECK.md` confirmed against a fetched primary source, a Crossref
  citation lookup, or direct computation in `examples.py`.
- `examples.py` runs clean: the exact 27-choice enumeration on three cards, the sixty-thousand
  -run chi-squared comparison, the nⁿ-mod-n! divisibility table, Sattolo's cycle/fixed-point
  check against Fisher–Yates' own rate, the 2,080/2,081 factorial crossing, and the exact
  (enumerated, not simulated) buffered-shuffle emission matrices — all `assert` statements
  passing.
- The buffered-shuffle planning numbers in `CHAPTER.md` ("emitted earlier by at most about
  b − 1 places... emitted later by any amount with falling probability... first item almost
  always emitted early") were checked against the actual exact enumeration rather than assumed:
  the "earlier by at most b − 1" bound holds exactly (asserted per-row in `examples.py`); the
  "almost always early" claim was refined to the measured fractions (75% in the first two slots
  at buffer two, about seventy percent in the first three at buffer three) rather than asserting
  an unverified "90%+" figure the plan did not itself commit to a number for.
- `coverage.json`'s three syllabus clauses are literal substrings of the real syllabus scope
  line (`syllabus/data-structures-and-algorithms.md` line 477), including the straight
  apostrophe in "Sattolo's." Eleven `expert.items` entries.
- No content deviation from the chapter plan: every claim stated on screen traces to a quoted
  source or an asserted computation, and the one figure the plan itself only approximated (the
  buffered-shuffle early-emission percentage) is stated at the value `examples.py` actually
  computes.

## Looks review

Pending: reel smoke test (`tests/reels.mjs`) to be run after this review, same as the ship
sequence for every other topic in this chapter.

## Changes from the chapter plan

None recorded in `OUTLINE.md` beyond the one buffered-shuffle precision note above (not a
content deviation, a precision refinement of an approximate figure into an exact computed one).
