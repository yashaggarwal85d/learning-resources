# Fact-check: Monotonic stacks and queues

| # | Claim (OUTLINE.md step) | Status | Source / verification |
|---|---|---|---|
| 1 | Naive next-greater-element is O(n^2) worst case (e.g. strictly decreasing input) | Verified | Direct consequence of the algorithm: each of n elements scans up to n−1 to its right in the worst case; `examples.py` runs a strictly decreasing array and counts comparisons, confirming Θ(n^2). |
| 2 | Monotonic-stack next-greater-element: keep stack decreasing, pop before push, each pop found its answer | Verified | Standard construction, demonstrated directly by runnable code in `examples.py` (checked against the brute-force result on random arrays, including edge cases: empty array, strictly increasing, strictly decreasing, all-equal). |
| 3 | Each element pushed exactly once, popped at most once, so total work is O(n) | Verified | `examples.py` instruments the stack with push/pop counters across growing n and confirms the count is linear (≈2n), not quadratic. Framing reused from [[erickson-amortize]] (aggregate method / summation method, already verified in Chapter 1). |
| 4 | Sliding-window max via monotonic deque: pop smaller from back, pop out-of-window from front, front is max | Verified | TJHSST source (Sarah Zhang, 2020), quoted word-for-word in SOURCES.md; `examples.py` reproduces the source's own worked example `A = [1, 3, -1, -3, 5, 3, 6, 7], k = 3` and confirms output `[3, 3, 5, 5, 6, 7]` matches the source's stated output exactly. |
| 5 | Naive sliding-window max is O(n*k) | Verified | Quoted directly from the TJHSST source ("The time complexity for this method can be written as O(N ∗ k)."); also measured directly in `examples.py` via comparison counts. |
| 6 | "Each element is enqueued once and dequeued at most once" → O(n) total for the monotonic deque | Verified | Quoted word-for-word from the TJHSST source; `examples.py` push/pop counters confirm linear growth empirically too. |
| 7 | This chapter's amortization idiom ("enters/leaves once", a structural invariant) differs from Chapter 1's (a resize schedule) | Verified | This is an argument about which quantity is being bounded, not an external fact — both are aggregate-method applications (same framing, reused from Erickson, already verified in Chapter 1's own topic), applied to different invariants. No external source states this comparison explicitly; it is this topic's own synthesis, stated as such and not attributed to either source. |
| 8 | A monotonic stack/deque only ever holds at most n elements at once (bounding memory, not just time) | Verified | Direct consequence of the construction: nothing is ever pushed that wasn't one of the n input elements, and the stack/deque's contents are always a subsequence of the input — demonstrated by the same `examples.py` instrumentation (max size observed never exceeds n). |

## A claim this topic deliberately does NOT make

- No claim is made about who first invented or published the monotonic-stack / monotonic-deque
  technique, or when. A web search for an original citable source (a paper, or the technique's
  first textbook appearance) turned up only practice-site write-ups and lecture notes repeating the
  technique without attribution; this topic names the TJHSST lecture notes only as *a* citable
  current treatment, not as the technique's origin, and never says "invented by" or "first shown
  in" anywhere in narration, body text, or post-notes.
- No claim is made that monotonic stacks/deques are the only or best way to solve next-greater-element
  or sliding-window maximum in general (e.g. a balanced BST or a sparse table can also answer
  range-maximum queries); the topic states the monotonic-structure solution is linear and optimal
  *for this exact access pattern* (append-only window sliding one step at a time), not universally.
