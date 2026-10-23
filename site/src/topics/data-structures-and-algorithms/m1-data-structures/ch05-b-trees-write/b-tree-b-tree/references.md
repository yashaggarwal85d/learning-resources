Last verified: 2026-10-23. Expert sign-off: pending.

- Carnegie Mellon 15-445/645 Database Systems (Spring 2024), "Lecture 8: Tree Indexes" — the B+Tree's self-balancing/fanout definition, the M-way fill-factor properties, the 1972-B-tree-vs-B+Tree distinction, the insert/split and delete/merge algorithms, and the leaf-sibling range-scan pattern. [source](https://15445.courses.cs.cmu.edu/spring2024/slides/08-trees.pdf)
- Stanford CS145, Module 3B, "B+Tree Indexes" — the explicit sibling-linked range-scan mechanism, a worked point-lookup I/O count, and the fanout/height formula with a trillion-key worked table. [source](https://cs145.stanford.edu/Module3B-Indexing/btree-indexes.html)
- PostgreSQL `nbtree` README (`master` branch) — a real, current production B+Tree naming its own right-link-to-sibling mechanism, corroborating the sibling-link claim in a shipped system. [source](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README)

Canonical numbers (this topic's illustrative B+Tree's height against topic 24's measured
red-black-tree height on the identical two hundred keys; the split, borrow and merge counts while
building and modifying it; the range scan's I/O count against a re-descending alternative; and the
fanout/height formula checked against a billion keys on three realistic page sizes) are computed
and asserted directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.external-memory-i-o` (Chapter 1) for the I/O model this
topic's bound is a concrete instance of; `dsa.order-statistic-trees` (Chapter 4) for the
pointer-based tree this topic's I/O count is contrasted against; B-tree node engineering (next)
for what it takes to make a real page's fanout large.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=b-tree-b-tree:%20).
