Last verified: 2026-10-14.

- V. Leis, K. Kundhikanjana, A. Kemper, T. Neumann, ["Efficient Processing of Window Functions in Analytical SQL Queries"](http://www.vldb.org/pvldb/vol8/p1058-leis.pdf), PVLDB 8(10), 2015 — the self-join/correlated-subquery complexity argument, the four aggregation algorithms (naive, cumulative, removable cumulative, segment tree), and inter-/intra-partition parallelism with skew resistance, quoted and paraphrased directly.
- Y. Cao, C.-Y. Chan, J. Li, K.-L. Tan, "Optimization of Analytic Window Functions," PVLDB 5(11), 2012 (cited by Leis et al. as the originating work on shared partitioning/ordering optimization across multiple window expressions).
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/plan/planner.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/plan/planner.c), function `select_active_windows` — the exact sort-reuse-ordering comment and mechanism, quoted verbatim.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=window-function-execution-internals:%20).
