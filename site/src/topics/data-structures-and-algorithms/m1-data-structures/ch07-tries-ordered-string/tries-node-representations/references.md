Last verified: 2026-10-23. Expert sign-off: pending.

- Sedgewick & Wayne, "5.2 Tries" (Princeton COS 226) — the abstract trie, the O(L) search-hit bound, the array representation's own memory cost, and the ternary-search-tree node's own five fields, with a direct null-link comparison against a 26-way trie. [source](https://www.cs.princeton.edu/courses/archive/spring23/cos226/lectures/52Tries.pdf)
- "Lec 23: Tries" (UW CSE 373) — array, hash-table, BST, and ternary-search-tree children, side by side under one "dealing with sparsity" heading, with the array's own measured null-link count (R=128, 127 null). [source](https://courses.cs.washington.edu/courses/cse373/20su/lectures/23.pdf)
- "Ternary search tree" (Wikipedia) — a third, independent statement of the ternary-search-tree node's own shape (lo/equal/hi children) and its space-for-speed trade-off against a standard prefix tree. [source](https://en.wikipedia.org/wiki/Ternary_search_tree)

Canonical numbers (real bytes per representation, lookup steps per key, and the array
representation's own null-slot fraction, on the identical 21-word dictionary) are computed and
asserted directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.separate-chaining` (Chapter 3) for the hash table the
hash-children representation reuses directly; `dsa.bst-operations-rotations` (Chapter 4) for the
comparison shape the ternary-search-tree representation's own lo/hi children reuse; Fenwick trees
(next) for Chapter 8.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=tries-node-representations:%20).
