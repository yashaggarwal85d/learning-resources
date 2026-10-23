Last verified: 2026-10-23. Expert sign-off: pending.

- MIT 6.046J/18.410J Introduction to Algorithms, Fall 2005, Lecture 7 (Demaine & Leiserson) — linear probing's mechanism and its named failure mode (primary clustering), double hashing's mechanism and its one caveat (h2(k) relatively prime to m), and a uniform-hashing-assumption bound on expected probes (at most 1/(1-α)). [source](https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/ce6ea57dd298c8e64609802daf2eaaec_lec7.pdf)
- Donald E. Knuth, "Linear Probing and Graphs" (Algorithmica 22, 1998) — Knuth's own expected-probe analysis: total displacement d of items from their hash addresses, and the average successful-search cost as 1 + d/n. [source](https://arxiv.org/pdf/cs/9801103)
- CSE 332: Data Structures & Parallelism, Lecture 10 "More Hashing" (University of Washington, Summer 2025) — the tombstone mechanism's own rationale, quadratic probing's real guarantee (prime table size, α < 0.5) and its remaining weakness (secondary clustering), and double hashing's own motivating idea. [source](https://courses.cs.washington.edu/courses/cse332/25su/lecture/10_Hashing_2.pdf)
- Robert Sedgewick, `LinearProbingHashST.java` (Princeton `algs4` library) — a real, documented, widely taught production implementation of cluster-rehash deletion: remove the entry, then rehash every later entry in the same cluster. [source](https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/LinearProbingHashST.java)

Canonical numbers (the measured average probe counts for linear probing vs. double hashing at
α ≈ 0.5, 0.75, 0.9, and the deletion-correctness checks for both tombstones and cluster-rehash
deletion) are computed and asserted directly in this topic's `examples.py`, on this machine, in one
run — see `FACT-CHECK.md` for why Knuth's own paper and the MIT lecture's uniform-hashing bound are
cited as two distinct, related results rather than one combined "Knuth's analysis" citation.

Related tracks (see Prerequisites): topic 17 (separate chaining) for the load factor and collision
concepts this topic restates; topic 16 (practical hash functions) for the hash function reused
unchanged.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=linear-probing-open-addressing:%20).
