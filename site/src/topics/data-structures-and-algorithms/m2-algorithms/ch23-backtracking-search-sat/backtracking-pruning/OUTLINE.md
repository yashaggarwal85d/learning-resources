# OUTLINE: Backtracking with pruning

Thirteen steps, following `CHAPTER.md`'s own plan for topic 80.

1. **Hook.** Eight queens, 4,426,165,368 placements, 92 right. A program that tests every
   placement makes four billion checks. The program this topic builds makes two thousand and
   fifty-seven calls and finds every one.
2. **Enumeration: the template.** One recursive function — choose, explore, undo — drawn as a
   tree for subsets (in or out: sixteen leaves), permutations (any unused element next: twenty-four
   leaves) and combinations (increasing indices only: six leaves) of the same four-element set. The
   trees are full; nothing is pruned yet.
3. **The unpruned progression, and the first prune.** Eight queens: four billion placements, down
   to sixteen million seven hundred seventy-seven thousand two hundred sixteen with one queen per
   row, down to forty thousand three hundred twenty once no two share a column — then the first
   real prune, refusing a placement that shares a diagonal with an earlier queen.
4. **Predict: how many nodes does the pruned search visit for four queens?** Before the tree is
   drawn: seventeen, twenty-four, or two hundred fifty-six?
5. **The pruned tree, drawn.** Four queens: seventeen nodes, two solutions, drawn in full. Eight
   queens: two thousand fifty-seven calls, ninety-two solutions, the first one found after one
   hundred fourteen calls — against the four-billion-placement baseline on a shared log axis.
6. **Growing n, and an unsafe prune.** The node count is not smooth as n grows (the first solution
   comes after one hundred fourteen calls at n equals eight, but after only two hundred sixty-two
   calls at n equals twelve). A prune that is not sound — refusing a queen too near the board's
   edge — loses every one of the ninety-two solutions at n equals eight.
7. **Sudoku: why a placement check alone is not enough.** The eighty-one-square grid, twenty-seven
   units, twenty peers per square. A placed digit can rule out digits for many other squares at
   once; a bare legality check never looks.
8. **Constraint propagation.** Two rules — a decided square empties that digit from its peers; a
   unit with one place left for a digit gets it there — run to a fixed point. On the chapter's hard
   grid, propagation alone leaves sixty-one of sixty-four empty squares uncertain, with four point
   six two eight times ten to the thirty-eighth power candidate combinations remaining between them.
9. **Search on top of propagation.** Branching on a copy of the grid, trying each candidate,
   propagating, recursing: the same hard grid is solved after looking at only twenty-five
   possibilities, branching explicitly on just nine of the sixty-one uncertain squares.
10. **Predict: which branching order wins — first empty square, or fewest candidates first?**
    Before the measurement: does the order of squares matter at all, once propagation is already
    running?
11. **Minimum remaining values, measured.** The same grid, first-empty-square order: still
    unsolved after three million placements. Fewest-candidates-first: solved after four hundred
    eighty-one. The order decides everything; propagation alone is not enough.
12. **The heavy tail.** Even a good order has bad days: Norvig's own randomized-value-order runs on
    one hard puzzle split twenty-seven fast and three near two hundred seconds apiece — roughly ten
    thousand times longer — and his own million-puzzle run shows the same shape at scale. This
    topic's own thirty-seeded run on the chapter's grid shows the same shape, smaller: a real spread
    between its typical and its worst run, not a smooth one.
13. **Handoff.** The tree is the algorithm; what decides its size is where you prune and which
    variable you branch on, not the code that walks it. Backtracking never made the search
    polynomial — it only kept the tree as small as refusing doomed branches early allows. Two
    pointers, next.

## Changes from the chapter plan

- `CHAPTER.md`'s own "ordering, measured" clause asks for the comparison under "only a check of
  the placed digit against its peers" for both orders, not the full propagation search; `examples.py`
  implements this as a separate, propagation-free plain checker so the two orders are compared on
  identical terms, distinct from the Norvig-style propagation solver built for steps 7–9.
- Gomes, Selman, Crato and Kautz's own heavy-tailed-phenomena paper is paywalled and no
  open-access copy could be retrieved this session (see `SOURCES.md`'s own red team); it is named
  once in post-notes as the standard citation for the phenomenon and for randomised restarts as the
  remedy, with no sentence quoted from it.
- This topic's own thirty-seeded heavy-tail run measures a real but modest spread (about two times,
  not Norvig's roughly ten-thousand-times) on the chapter's own hard grid — honestly reported as a
  smaller-scale version of the same shape, not a reproduction of Norvig's own specific figures,
  which came from many more trials and, for the dramatic multiplier, a different, harder puzzle.
- The syllabus phrase "as the difference between seconds and years" is not reproduced as a claim:
  no source fetched at planning time reports a years-long Sudoku run, so the reel and post-notes
  state only measured or directly-quoted figures (placements, seconds, the heavy-tail ratio), never
  an invented "years" figure.
