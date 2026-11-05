Last verified: 2026-11-05.

- Peter Norvig, "Solving Every Sudoku Puzzle" — the hard grid, the two propagation rules, minimum remaining values, and the heavy-tail run-time experiments. [source](https://norvig.com/sudoku.html)
- Wikipedia, "Eight queens puzzle" — the 4,426,165,368 → 16,777,216 → 40,320 progression, the 92/12 solution counts, and the 20! ≈ 2.433×10¹⁸ figure. [source](https://en.wikipedia.org/wiki/Eight_queens_puzzle)
- OEIS A000170, "Number of ways of placing n nonattacking queens on an n × n board" — cross-check for every solution count this topic's pruned search produces. [source](https://oeis.org/A000170)
- S. W. Golomb and L. D. Baumert, "Backtrack Programming," *Journal of the ACM* 12(4), 1965, pp. 516–524 (DOI 10.1145/321296.321300) — cited bibliographically as the classic statement of the technique, not opened.
- D. E. Knuth, *The Art of Computer Programming* vol. 4B, §7.2.2 "Backtrack programming" — named once in post-notes as the reference treatment, not opened.
- J. R. Bitner and E. M. Reingold, "Backtrack programming techniques," *Communications of the ACM* 18, 1975, pp. 651–656 — named once in post-notes, not opened.
- R. M. Haralick and G. L. Elliott, "Increasing tree search efficiency for constraint satisfaction problems," *Artificial Intelligence* 14(3), 1980, pp. 263–313 (DOI 10.1016/0004-3702(80)90051-X) — confirmed via Crossref, not opened; this topic uses only the name "minimum remaining values" (Norvig's own name), not "fail first", because the paper itself was not read to confirm that attribution.
- A. K. Mackworth, "Consistency in networks of relations," *Artificial Intelligence* 8(1), 1977, pp. 99–118 (DOI 10.1016/0004-3702(77)90007-8) — named once in post-notes as the general treatment of constraint propagation, not opened.
- C. P. Gomes, B. Selman, N. Crato and H. Kautz, "Heavy-Tailed Phenomena in Satisfiability and Constraint Satisfaction Problems," *Journal of Automated Reasoning* 24, 2000, pp. 67–100 (DOI 10.1023/A:1006314320276) — cited bibliographically only; paywalled, no open-access copy could be retrieved this session, so no sentence of it is quoted.

OEIS A002562 (fundamental solutions) is named only, via Wikipedia's own citation of it. Exact cover and Dancing Links, meet in the middle, branch and bound, DPLL/CDCL SAT solving, and this topic's own further frontier (NP-completeness, bit-parallel N-queens, the lexicographically-smallest/heap search variants) are all named only in post-notes, per `CHAPTER.md`'s own instruction, and built in no topic this chapter.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=backtracking-pruning:%20).
