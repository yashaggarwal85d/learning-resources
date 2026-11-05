# Review — dsa.pseudo-polynomial-time-strong

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 13/13 pass on the first clean check — no footnote-marker
  or MathML-garbling issues hit this time, since all four new Wikipedia pages (Strong
  NP-completeness, Knapsack problem, 3-partition problem) and the reused Bin packing page
  rendered cleanly through `python3 -I` + `repr()` inspection before any quote was written.
- Garey and Johnson's 1978 J. ACM paper and 1979 book are not read directly, exactly as
  CHAPTER.md anticipated ("the paper **not read**"); the strong/weak NP-hardness distinction is
  confirmed instead through the Wikipedia "Strong NP-completeness" page, which cites and
  summarizes Garey and Johnson directly. Backurs and Indyk (STOC 2015) is named once in
  post-notes as a fine-grained-complexity pointer, not independently verified, per the chapter
  plan.
- Every claim in `FACT-CHECK.md` confirmed against a fetched source or direct computation in
  `examples.py`.
- `examples.py` runs clean: the knapsack O(n·W) dynamic program checked against brute force on
  twenty random instances; the cell counts at ten, twenty and forty bits of capacity computed
  fresh and asserted equal to the exact integers (102,400; 104,857,600; 109,951,162,777,600); a
  timed run across six increasing bit lengths showing the average time ratio between consecutive
  lengths (about 1.9–2.3 across runs) consistent with roughly-doubling growth; the unary-against-
  binary length gap for a concrete million-unit capacity; a three-partition backtracking solver
  whose call count climbs from three to thirty-eight as the triple count grows from two to six,
  with every individual number kept under thirty-one throughout; and the bin-packing K-fixed
  table size checked both as the formula `(capacity+1)^K` and against a real feasibility search
  (finds a packing with three bins, correctly reports infeasibility with one) — all `assert`
  statements passing.
- `coverage.json`'s two syllabus clauses are literal substrings of the real syllabus scope line
  (`syllabus/data-structures-and-algorithms.md` line 540). Four source blocks (the four Wikipedia
  pages), eleven `expert.items` entries. Every `step` reference verified by script to match a
  `reel.tsx` title exactly (`total titles 14`) — one mismatch caught and fixed on the first pass
  (a stray "same" in the coverage quote not present in the reel.tsx title) before the official
  build check ran.
- Topic 75 ("Knapsack and coin change," Chapter 22) confirmed not live in the registry before
  declaring `knapsack-dynamic-program` as this topic's own concept id, per CHAPTER.md's explicit
  fallback instruction for exactly this case.

## Looks review

Reel smoke test (`tests/reels.mjs`) run at both phone and desktop sizes: passed. First run
caught a phone-viewport text overflow in step 3 (`KnapsackNPCompleteAndDP`): "one column per
weight up to W" (inside the table box) ran into "yet this table solves it" (originally placed
beside the box at nearly the same height). Fixed by moving the two right-side labels below the
box instead of beside it and increasing the scene height from 220 to 240; the re-run passed
clean (`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes`). The build check's
`--only build` pass found no coverage or narration-length issues on the first run — all
narration lines were verified under fifty words by script before that check ran, and every
coverage clause and expert-item step reference was verified by script before the official
`--only build` check, so only the one step-reference typo (see above) needed fixing, caught by
the verification script rather than the official check.

## Changes from the chapter plan

Recorded in `OUTLINE.md`: Chapter 22 topic 75 is not live, so `knapsack-dynamic-program` is
declared fresh rather than copied from that topic's registry entry; the hook's rounded cell-count
figures (about a hundred thousand / a hundred million / over a hundred trillion) are recomputed
fresh in `examples.py` and match the chapter plan's own planning-time arithmetic exactly. Both of
the syllabus's clauses are built in full; nothing from the syllabus line is deferred.
