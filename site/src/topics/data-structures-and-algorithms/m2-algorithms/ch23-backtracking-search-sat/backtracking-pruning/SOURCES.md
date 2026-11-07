## Peter Norvig — "Solving Every Sudoku Puzzle"

URL: https://norvig.com/sudoku.html
Version: fetched 2026-11-05, the original 2006 essay (the page's own banner notes an updated Python 3 notebook exists; the propagation rules, MRV and the heavy-tail figures quoted below are unchanged content, not code)

> Every square has exactly 3 units and 20 peers.

> (1) If a square has only one possible value, then eliminate that value from the square's peers.

> (2) If a unit has only one possible place for a value, then put the value there.

> This process is called constraint propagation.

> we are still a long way from solving the puzzle--61 squares remain uncertain.

> we get 4.62838344192 × 1038 possibilities for the whole puzzle.

> it turns out that to solve this particular puzzle we need to look at only 25 possibilities and we only have to explicitly search through 9 of the 61 unfilled squares; constraint propagation does the rest.

> we will use a common heuristic called minimum remaining values, which means that we choose the (or one of the) square with the minimum number of possible values.

> Thus we choose the square with the fewest possibilities and the best chance of guessing right.

> in 27 out of 30 trials the puzzle took less than 0.02 seconds, while each of the other 3 trials took just about 190 seconds (about 10,000 times longer).

> This is a heavy-tailed distribution, not a normal one.

> The average time to solve a random puzzle is 0.01 seconds, and more than 99.95% took less than 0.1 seconds, but a few took much longer:

### Contents (item by item, this topic's scope)

- The grid itself (`4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......`), units and peers counts, quoted directly and reproduced exactly in `examples.py`.
- The two propagation rules, quoted directly and implemented as `eliminate`/`assign` in `examples.py`, reproducing the essay's own naming.
- The 61-uncertain-squares and 4.628×10³⁸-possibilities figures after propagation, and the 25-possibilities/9-squares search statistic, reproduced exactly by `examples.py`'s own run on the identical grid; the fetched page's own HTML extraction drops the superscript on the exponent (the quote above reads "1038" where the essay prints "10³⁸"), the identical dropped-extraction artifact already confirmed on PDF sources for topics 67–70, so the real figure (4.62838344192 × 10³⁸) is stated in this topic's own prose and in `examples.py`, not copied character-for-character from this quote.
- The minimum remaining values heuristic, quoted directly for its name and its justification, and used for this topic's own variable-ordering clause.
- The 27-out-of-30/190-seconds heavy-tail experiment and the "not a normal" framing, quoted directly for the reel's own heavy-tail claim; this topic's own seeded run (`examples.py`) is reported separately and honestly as a smaller, 30-trial spread on the same grid, not presented as a reproduction of this specific number.
- The million-random-puzzle tail statistic ("more than 99.95% took less than 0.1 seconds"), quoted directly as independent, larger-scale evidence for the same heavy-tail claim.

## Wikipedia — "Eight queens puzzle"

URL: https://en.wikipedia.org/wiki/Eight_queens_puzzle
Version: fetched 2026-11-05, permanent revision oldid=1364646763

> There are 92 solutions.

> The eight queens puzzle has 92 distinct solutions. If solutions that differ only by the symmetry operations of rotation and reflection of the board are counted as one, the puzzle has 12 solutions.

> Thus, the total number of distinct solutions is 11×8 + 1×4 = 92.

> there are 4,426,165,368 possible arrangements of eight queens on an 8×8 board

> but only 92 solutions.

> by applying a simple rule that chooses one queen from each column, it is possible to reduce the number of possibilities to 16,777,216 (that is, 88) possible combinations.

> Generating permutations further reduces the possibilities to just 40,320 (that is, 8!), which can then be checked for diagonal attacks.

> 20! = 2.433 × 1018.

> As an alternative to backtracking, solutions can be counted by recursively enumerating valid partial solutions, one row at a time. Rather than constructing entire board positions, blocked diagonals and columns are tracked with bitwise operations.

### Contents (item by item, this topic's scope)

- The 4,426,165,368 → 16,777,216 → 40,320 progression (C(64,8), one-queen-per-column, permutations), quoted directly and reproduced exactly in `examples.py`, used for the reel's opening hook and the N-queens scope clause.
- The 92-solutions/12-fundamental-solutions figures and the 11×8+1×4 breakdown, quoted directly and reproduced exactly.
- The 20! ≈ 2.433×10¹⁸ figure and the 8⁸ = 16,777,216 figure, used for the enumeration-sizes-at-n=20 and one-queen-per-column clauses, reproduced exactly in `examples.py`.
- The bitwise/bitmask-tracking sentence, quoted directly and named only in post-notes, pointing at Chapter 25, not built here.

### Dropped-extraction note

This page's HTML extraction drops superscripts, turning "8⁸" into the bare digit run "88" and "10¹⁸" into "1018" (quoted above exactly as extracted), the same artifact class already confirmed on PDF sources for topics 67–70, here on HTML instead. The real exponents are stated in this topic's own prose and reproduced in `examples.py` (`8 ** 8`, `20! = 2_432_902_008_176_640_000`), not copied character-for-character from the degraded quote. The extraction also splices a footnote's inline HTML (a bare "C" with subscripts) into the middle of the 4,426,165,368 sentence, which is why that sentence is quoted in two pieces split around the footnote rather than as one continuous quote.

## OEIS A000170 — "Number of ways of placing n nonattacking queens on an n X n board"

URL: https://oeis.org/A000170
Version: fetched 2026-11-05

> Number of ways of placing n nonattacking queens on an n X n board.

Data (n=1..27): 1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680, 14200, 73712, 365596, 2279184, 14772512, 95815104, 666090624, 4968057848, 39029188884, 314666222712, 2691008701644, 24233937684440, 227514171973736, 2207893435808352, 22317699616364044, 234907967154122528

### Contents (item by item, this topic's scope)

- The sequence name and the n=4/6/8/10/12 values, used to cross-check every solution count `examples.py`'s own pruned N-queens search produces, independent of Wikipedia's own restatement of the same counts.

### Red team

1. **Golomb and Baumert, "Backtrack Programming," *Journal of the ACM* 12(4), 1965, pp. 516–524 (DOI 10.1145/321296.321300), is cited bibliographically only** — confirmed as the classic statement of the technique per `CHAPTER.md`'s own framing, not independently opened or quoted; this topic's own description of backtracking comes from `CHAPTER.md`'s own framing and from the two primary sources above, not from this paper.
2. **Knuth, *The Art of Computer Programming* vol. 4B, §7.2.2 "Backtrack programming," is cited bibliographically only**, not opened (not freely available this session); named once in post-notes as the reference treatment.
3. **Bitner and Reingold, "Backtrack programming techniques," *Communications of the ACM* 18, 1975, pp. 651–656, is cited bibliographically only**, not opened; named once in post-notes.
4. **Haralick and Elliott, "Increasing tree search efficiency for constraint satisfaction problems," *Artificial Intelligence* 14(3), 1980, pp. 263–313 (DOI 10.1016/0004-3702(80)90051-X), is confirmed via Crossref but not opened this session.** Per `CHAPTER.md`'s own instruction, this topic does not use the name "fail first" for minimum remaining values because the paper itself was not read to confirm it; the topic uses only the name "minimum remaining values," which Norvig's essay uses directly (quoted above).
5. **Mackworth, "Consistency in networks of relations," *Artificial Intelligence* 8(1), 1977, pp. 99–118 (DOI 10.1016/0004-3702(77)90007-8), is cited bibliographically only**, confirmed via Crossref, not opened; named once in post-notes as the general treatment of constraint propagation that Norvig's two Sudoku-specific rules are an instance of.
6. **Gomes, Selman, Crato and Kautz, "Heavy-Tailed Phenomena in Satisfiability and Constraint Satisfaction Problems," *Journal of Automated Reasoning* 24, 2000, pp. 67–100 (DOI 10.1023/A:1006314320276), is cited bibliographically only.** The paper is paywalled at its publisher (Springer) and no open-access copy could be retrieved this session (Semantic Scholar's own metadata record has no stored abstract; an open-access repository link led only to a bot-check page). This topic does not quote the paper directly and makes no claim about its own specific findings beyond the fact that it is the standard citation for heavy-tailed runtime in constraint satisfaction, named once in post-notes alongside randomised restarts as the standard remedy, attributed to this citation without a quoted sentence.
7. **OEIS A002562 (fundamental solutions) is named only, via Wikipedia's own citation of it**, not independently opened; this topic uses only the A000170 (all solutions) data, fetched directly above.
