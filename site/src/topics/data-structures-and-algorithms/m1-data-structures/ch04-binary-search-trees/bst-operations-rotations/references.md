Last verified: 2026-10-23. Expert sign-off: pending.

- Robert Sedgewick and Kevin Wayne, "Binary Search Trees" (Algorithms, 4th Edition, companion site) — the BST property, recursive search and insert, delete by in-order successor swap, and in-order traversal. [source](https://algs4.cs.princeton.edu/32bst/)
- MIT 6.006, Spring 2020, "Lecture 7: Binary Trees, Part 2: AVL" — a rotation as an O(1)-pointer relink that preserves traversal order, taken here as the bare primitive with no balancing invariant attached. [source](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec7/)

Canonical numbers (height of an identical 200-key set under random versus sorted insertion order,
and a rotation's in-order sequence before and after) are computed and asserted directly in this
topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): topic 22 (Merkle trees) for the chapter this topic follows;
topic 24 (Red-black trees) for the invariant that keeps a tree's height small, which this topic
deliberately leaves unsolved.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=bst-operations-rotations:%20).
