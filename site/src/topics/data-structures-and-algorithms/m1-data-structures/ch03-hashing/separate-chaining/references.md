Last verified: 2026-10-23. Expert sign-off: pending.

- MIT 6.046J/18.410J Introduction to Algorithms, Fall 2005, Lecture 7 (Demaine & Leiserson) — chaining's mechanism, the load factor's definition (α = n/m), the simple-uniform-hashing assumption, and the cited Θ(1 + α) expected-search-time result (unsuccessful search derived, successful search's harder proof cited not re-derived). [source](https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/ce6ea57dd298c8e64609802daf2eaaec_lec7.pdf)
- OpenJDK `java.util.HashMap` source — a real, current, chaining-based standard-library hash table ("a binned (bucketed) hash table"), its default load factor (0.75) and rehashing threshold, and the honest refinement beyond pure chaining: an overgrown bin becomes a balanced tree bin. [source](https://raw.githubusercontent.com/openjdk/jdk/master/src/java.base/share/classes/java/util/HashMap.java)

Canonical numbers (the measured average and longest chain length at α ≈ 0.5, 0.75, 1.5, and the
worst-case construction's longest-chain-over-average ratio) are computed and asserted directly in
this topic's `examples.py`, on this machine, in one run — see `FACT-CHECK.md` for the counting-tautology
mistake caught in an early draft (the average chain length equals α exactly, for any hash whatsoever,
by simple counting — not evidence of a well-spread hash) and the fix (measuring the longest chain's
share of n instead).

Related tracks (see Prerequisites): topic 16 (practical hash functions and HashDoS) for the hash
function this topic builds on; Chapter 2's singly-linked list for the chain itself.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=separate-chaining:%20).
