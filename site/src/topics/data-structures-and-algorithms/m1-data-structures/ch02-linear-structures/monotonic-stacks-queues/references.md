Last verified: 2026-10-22.

- Sarah Zhang, "Monotonic Queues and Monotonic Optimization in Dynamic Programming" (TJHSST, February 2020) — the monotonic-deque maintenance rule and the "enqueued once, dequeued at most once" complexity argument quoted directly. [source](https://activities.tjhsst.edu/sct/lectures/1920/2020_2_21_Monotonic_Queues.pdf)
- Jeff Erickson, *Algorithms*, Lecture 9: Amortized Analysis — the aggregate (summation) method this topic's own argument reuses, already verified in full by Chapter 1's "Aggregate and accounting methods". [source](https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf)

Canonical numbers (the worked example `[1, 3, -1, -3, 5, 3, 6, 7]`, window width 3, giving maxima `[3, 3, 5, 5, 6, 7]`; the push/pop totals staying under 2n from n = 100 to n = 100,000) are computed and asserted in this topic's `examples.py`.

Related tracks (see Prerequisites): this chapter's "Stacks, queues and deques" (the structures this topic constrains) and Chapter 1's "Aggregate and accounting methods" (the amortization framing reused here).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=monotonic-stacks-queues:%20).
