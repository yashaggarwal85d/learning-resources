# Review — dsa.p-np-polynomial-reductions

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 20/20 pass, after splitting two quotes (one from
  Wikipedia's Cook–Levin page, one from the Karp's-21 page) at inline footnote markers that the
  fetcher preserves as literal `[1]`/`[2]` text, and dropping digits and a `Φ` character that
  Erickson's PDF's `pdftotext` rendering drops silently from clause/formula labels.
- Karp's 1972 paper and Cook's 1971 paper are not read directly, exactly as CHAPTER.md
  anticipated ("citations from memory, to be verified and read at research time"); both are
  confirmed instead through two independent Wikipedia pages (the Cook–Levin theorem page and the
  Karp's-21-problems page), each of which cites and summarizes the originals.
- The chapter plan's named PostgreSQL "Genetic Query Optimizer" page did not render its body
  text through the fetcher (only its table of contents did); the builder substitutes the
  "Controlling the Planner with Explicit JOIN Clauses" page, which states the same join-order
  blow-up fact in the documentation's own words, and records the substitution in `OUTLINE.md`.
- Every claim in `FACT-CHECK.md` confirmed against a fetched source or direct computation in
  `examples.py`.
- `examples.py` runs clean: bin packing's three forms with a verified packing, the
  independent-set candidate count and verify cost at sixty vertices and a target of thirty, the
  self-reduction's witness construction and call count on ten random graphs, the
  independent-set-to-vertex-cover reduction checked on every graph of six vertices or fewer and
  every target size (two hundred thirty-five thousand, eight hundred eighty pairs, zero
  mismatches), a vacuous reduction from two-colourability checked on twenty random graphs, and
  the lab's three-SAT-to-independent-set reduction checked against brute-force satisfiability on
  thirty random formulas — all `assert` statements passing.
- `coverage.json`'s three syllabus clauses are literal substrings of the real syllabus scope line
  (`syllabus/data-structures-and-algorithms.md` line 538); the broader "NP-hard problems hiding
  in data systems" content (bin packing, join ordering) is sourced via `sources[]`/`expert.items`
  rather than forced into a syllabus clause, since that content belongs to the *(skipped)* gadget
  topic's own syllabus line, not topic 107's. Every `step` reference verified by script to match
  a `reel.tsx` title exactly (`total titles 15`, no mismatches after one fix). Eleven
  `expert.items` entries.
- One content deviation recorded in `OUTLINE.md`: the PostgreSQL source substitution, and the
  Clay Mathematics Institute's prize amount omitted on screen since the PDF's own rendering of
  the figure dropped its digits and currency symbol entirely.

## Looks review

Reel smoke test (`tests/reels.mjs`) run at both phone and desktop sizes: passed. First run
caught a phone-viewport text overflow in step 12 (the "circuit satisfiability" box label running
into the "twenty-one more, by reduction" label beside it); fixed by moving the second label below
the box instead of beside it, and the re-run passed clean (`Reel smoke test passed: 1 live
reel(s) at desktop and phone sizes`). The build check also caught a `coverage.json` clause that
included the syllabus line's markdown emphasis asterisks (`*from*`) verbatim, which the coverage
checker's own markdown-stripping does not expect in the clause string; fixed by dropping the
asterisks. A narration line also ran over the fifty-word limit; fixed by splitting it in two.

## Changes from the chapter plan

Recorded in `OUTLINE.md`: the PostgreSQL GEQO-page-to-explicit-joins-page substitution, the
Clay Mathematics Institute prize amount omitted (a rendering artifact, not a sourcing gap), and
the syllabus's own Lab bullet's second half ("time exact solutions as instance size grows") not
built, since it depends on a SAT solver library and the chapter plan's own notes already flag it
as resting on the skipped gadget topic; the first half is built and checked in `examples.py`.
