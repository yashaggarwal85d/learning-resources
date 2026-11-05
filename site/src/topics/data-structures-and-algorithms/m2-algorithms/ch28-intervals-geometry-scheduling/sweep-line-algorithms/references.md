Last verified: 2026-11-05.

- Wikipedia, "Bentley–Ottmann algorithm" — the sweep skeleton, the sweep-line-status tree and
  event-queue data structures, and the O((n+k) log n) output-sensitive bound with its
  algebraic-decision-tree lower bound. [source](https://en.wikipedia.org/wiki/Bentley%E2%80%93Ottmann_algorithm)
- Wikipedia, "Klee's measure problem" — Klee's 1977 one-dimensional interval-union problem,
  Bentley's 1977 two-dimensional sweep extension, and the d-dimensional O(n^(d-1) log n)
  running time. [source](https://en.wikipedia.org/wiki/Klee%27s_measure_problem)
- Wikipedia, "Sweep line algorithm" — the paradigm itself and the Shamos–Hoey (1976) algorithm
  that Bentley–Ottmann extends. [source](https://en.wikipedia.org/wiki/Sweep_line_algorithm)
- DuckDB, "Range Joins in DuckDB" — the IEJoin operator, sorting on two inequality predicates,
  the real system named in this topic's recap. [source](https://duckdb.org/2022/05/27/iejoin.html)

Named for attribution only, not read directly (per the chapter plan): Bentley and Ottmann
(1979), "Algorithms for reporting and counting geometric intersections," *IEEE Transactions on
Computers* C-28(9), pp. 643–647; Shamos and Hoey (1976), "Geometric intersection problems,"
*FOCS 1976*, pp. 208–215 (confirmed via the Sweep line algorithm article above); de Berg,
Cheong, van Kreveld and Overmars, *Computational Geometry: Algorithms and Applications*;
Shewchuk (1997), "Adaptive precision floating-point arithmetic and fast robust geometric
predicates," *Discrete & Computational Geometry* 18(3) — named once in post-notes for the
skipped orientation-tests topic, nothing of its content is attributed.

The Bentley–Ottmann article's stated lower bound ("algebraic decision tree models of
computation") does not connect it to Chapter 1's element distinctness problem; this topic does
not state that connection, since the chapter plan flagged it as needing verification and no
fetched source confirms it (see `FACT-CHECK.md`, claim 7).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=sweep-line-algorithms:%20).
