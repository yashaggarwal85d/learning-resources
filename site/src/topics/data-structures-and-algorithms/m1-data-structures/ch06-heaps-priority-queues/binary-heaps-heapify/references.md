Last verified: 2026-10-23. Expert sign-off: pending.

- "Binary heap" (Wikipedia) — the sift-up and sift-down procedures, the implicit zero-indexed array formula, and Williams' one-at-a-time versus Floyd's bottom-up build methods. [source](https://en.wikipedia.org/wiki/Binary_heap)
- Sedgewick, Wayne, "Priority Queues" (Algorithms, 4th ed. booksite) — a second, independent confirmation of the index arithmetic (1-indexed) and the named proposition that sink-based (bottom-up) heap construction is linear time. [source](https://algs4.cs.princeton.edu/24pq/)

Canonical numbers (swap counts for a one-at-a-time insertion build versus a bottom-up sift-down
build, on the identical 4,000-element decreasing-order input — the adversarial case for sift-up)
are computed and asserted directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.lsm-compaction-amplification` (previous chapter) for where
a heap's own question — which one is smallest, right now — already showed up inside a compaction
merge step; tournament and loser trees (next) for the structure that tightens a heap's own
sift-down bound for a k-way merge specifically.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=binary-heaps-heapify:%20).
