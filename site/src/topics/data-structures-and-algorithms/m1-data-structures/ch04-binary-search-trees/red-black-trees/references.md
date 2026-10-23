Last verified: 2026-10-23. Expert sign-off: pending.

- "Red–black tree," Wikipedia (current article) — the five red-black invariants, the 2-3-4 tree correspondence, and the exact rotation bound for insert (at most two) and delete (at most three). [source](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree)
- "Red-black Trees (rbtree) in Linux," The Linux Kernel documentation (current) — the same rotation bound from a primary implementation, and the named kernel subsystems (I/O schedulers, high-resolution timers, ext3, virtual memory areas, epoll, cryptographic keys, the HTB scheduler) that use it. [source](https://www.kernel.org/doc/html/latest/core-api/rbtree.html)
- "TreeMap," Java SE 21 & JDK 21 API documentation — Java's own ordered map, described directly as a red-black tree implementation adapting Cormen, Leiserson, and Rivest's algorithms. [source](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html)
- "std::map," cppreference.com — C++'s own ordered map, usually implemented as a red-black tree. [source](https://en.cppreference.com/w/cpp/container/map)

Canonical numbers (the identical 200-key set's height as a red-black tree versus a plain BST
under the same worst-case sorted order, and the largest rotation count any single insert or
delete triggers across every operation run) are computed and asserted directly in this topic's
`examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): topic 23 (BST operations and rotations) for the rotation
primitive and the degenerate case this topic's invariant exists to prevent; topic 25
(Order-statistic trees) for the augmentation this topic's balanced tree makes worthwhile.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=red-black-trees:%20).
