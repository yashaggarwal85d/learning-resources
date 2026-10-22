# Outline: Monotonic stacks and queues

Full topic, §2.2, ~12 min, 10 steps. Visual idea per CHAPTER.md: bars (a log's status codes)
with a monotonic stack drawn as a surviving-bar staircase, each eliminated bar swept by a short
`caramel` arrow the instant a taller one arrives, with a per-bar "entered / left" tick that never
exceeds one of each.

1. **Opening** — "A plain stack or queue, used once each." Bridge line, bars shown unsorted.
2. **The problem** — next-greater-element stated: for each bar, the next bar to its right that's
   taller. Naive approach: for each bar, scan right until a taller one — O(n^2) worst case (a
   strictly decreasing run).
3. **The invariant** — keep the stack monotonically decreasing (bottom to top). Scan left to
   right: before pushing the current bar, pop everything shorter than it — each pop just found
   its next-greater element (the one about to be pushed).
4. **Predict** — after processing bars [5, 3, 4, 2, 6], what does the stack hold right before 6
   is pushed, and which bars already got their answer?
5. **Why O(n)** — the invariant argument: every bar is pushed exactly once and popped at most
   once over the whole scan, so total push+pop work is O(n) regardless of how pops cluster — the
   aggregate method, same shape as Chapter 1's summation argument, applied to a structural
   invariant instead of a resize schedule.
6. **Sliding-window maximum, the problem** — now a window of fixed width k sliding over the bars;
   want the max in each window. Naive: rescan each window, O(n*k).
7. **The monotonic deque** — same decreasing invariant, now at both ends: popping the back for
   anything smaller than the bar just added (it can never be the window's max while the new one
   is still in range), and popping the front for any index that has aged out of the window. Front
   is always the current window's max.
8. **Predict** — window width 3 over [1, 3, -1, -3, 5]; what's in the deque, front to back, once
   the window first reaches [-1, -3, 5]?
9. **The two idioms compared** — Chapter 1 amortized over a resize schedule (doubling); this
   chapter amortizes over a structural invariant (decreasing order) that bounds how many times
   each element can be touched. Same aggregate-method machinery, different thing being bounded.
10. **Prove it** — examples.py: next-greater-element and sliding-window-maximum run against the
    brute-force O(n^2)/O(n*k) versions on the same random input, confirming identical results, plus
    an operation counter showing total pushes+pops stays linear in n across growing input sizes.

## Changes from the chapter plan

None.
