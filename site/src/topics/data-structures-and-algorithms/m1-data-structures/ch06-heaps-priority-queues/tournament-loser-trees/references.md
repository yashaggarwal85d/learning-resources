Last verified: 2026-10-23. Expert sign-off: pending.

- "K-way merge algorithm" (Wikipedia) — the naive scan, heap-based merge, and tournament/loser tree costs per output, the balanced-tree construction, and the external-sorting connection. [source](https://en.wikipedia.org/wiki/K-way_merge_algorithm)
- Chakraborty, "Tournament Trees, Winner Trees and Loser Trees in Data Structure" (TutorialsPoint) — a second, independent statement of the loser tree's own leaf-to-root repair advantage. [source](https://www.tutorialspoint.com/article/tournament-trees-winner-trees-and-loser-trees-in-data-structure)

Canonical numbers (comparisons per output for a naive scan, a heap-based merge, and a loser
tree, on the identical k sorted runs, at k=8 and k=6) are computed and asserted directly in this
topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.binary-heaps-heapify` (previous topic) for the heap-based
merge baseline this topic contrasts against; `dsa.lsm-compaction-amplification` (Chapter 5) for the
real compaction mechanic this topic's own merge kernel is already running inside; tries (next) for
Chapter 7.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=tournament-loser-trees:%20).
