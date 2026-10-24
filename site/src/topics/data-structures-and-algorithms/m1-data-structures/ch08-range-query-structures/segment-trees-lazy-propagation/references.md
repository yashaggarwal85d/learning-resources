Last verified: 2026-10-24. Expert sign-off: pending.

- "Segment Tree" (cp-algorithms, Algorithms for Competitive Programming) — the recursive segment tree, generalization to other merge operations, and lazy propagation for range updates, all derived and coded on one page. [source](https://cp-algorithms.com/data_structures/segment_tree.html)
- "Iterative Segment Tree (Range Minimum Query)" (GeeksforGeeks) — the bottom-up, non-recursive array layout cp-algorithms' own page does not cover. [source](https://www.geeksforgeeks.org/dsa/iterative-segment-tree-range-minimum-query/)
- "Range Update Range Query" (USACO Guide, Platinum) — the specific rule for composing a pending range-add tag with a pending range-assign tag on the same node. [source](https://usaco.guide/plat/RURQ)

Canonical numbers (the real query-descent node counts, the point-update climb path, the
lazy-tag composition results, and the eager-vs-lazy workload comparison) are computed and
asserted directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.fenwick-trees` (topic 33) — the O(log n) range-query
bound this topic generalizes past, and the specific gap (range minimum, range-wide updates)
this topic exists to close. Space-filling curves and cell indexes (next) opens Chapter 9.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=segment-trees-lazy-propagation:%20).
