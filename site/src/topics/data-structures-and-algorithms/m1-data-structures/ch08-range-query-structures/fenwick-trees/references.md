Last verified: 2026-10-24. Expert sign-off: pending.

- "Fenwick Tree" (cp-algorithms, Algorithms for Competitive Programming) — the group-operation definition, lowest-set-bit indexing (g and h), point update/range query, range update/point query, range update/range query with two BITs, and the 2D extension, all derived and coded on one page. [source](https://cp-algorithms.com/data_structures/fenwick.html)
- "2D Range Queries" (USACO Guide, Platinum) — corroborates the 2D Fenwick tree as the 1D update/query loop nested along a second dimension, combined with inclusion-exclusion for sub-rectangle sums. [source](https://usaco.guide/plat/2DRQ?lang=cpp)
- "Range Update Range Query" (USACO Guide, Platinum) — corroborates the range-update/range-query capability independently, via a suffix-add/prefix-sum framing. [source](https://usaco.guide/plat/RURQ)
- "Fenwick tree" (Wikipedia) — the structure's own naming history: proposed by Boris Ryabko in 1989, commonly named after Peter Fenwick's 1994 paper. [source](https://en.wikipedia.org/wiki/Fenwick_tree)

Canonical numbers (the real index-jump sequences, range-sum and range-update results, the 2D
grid's own prefix sum, and the naive-vs-Fenwick workload comparison) are computed and asserted
directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): no earlier-chapter prerequisite — lowest-set-bit arithmetic
is introduced fresh in this topic. Segment trees and lazy propagation (next) for the rest of
Chapter 8.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=fenwick-trees:%20).
