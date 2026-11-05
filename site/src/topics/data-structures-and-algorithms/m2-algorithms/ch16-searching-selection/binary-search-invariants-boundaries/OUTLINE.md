# OUTLINE: Binary search invariants and boundaries

A full topic, about 14 minutes. First topic of Chapter 16. No compiled benchmark needed —
every number is a small, exact count, computed and asserted in `examples.py`, including the
overflow itself, reproduced on an 8-bit signed integer rather than claimed from memory.

## Storyboard

1. **Hook / bridge.** The handoff from topic 54: a sorted file is worth the cost of sorting
   it because of what it makes cheap — finding one key in a million in about twenty steps
   instead of a million. Binary search is one of the shortest algorithms in the course and
   one of the easiest to get wrong.
2. **Predict.** On an array of 1,000,000 keys, present or absent, how many comparisons does
   binary search need in the worst case?
3. **The half-open invariant.** Every range in this topic is written `[lo, hi)`: `lo` is
   always a candidate, `hi` is always one past the last candidate. The invariant stated at
   the top of every iteration: "the answer, if it exists, lies in `[lo, hi)`." A closed
   `[lo, hi]` version is shown once, briefly, to say why its empty-range and termination
   checks are fiddlier (`lo > hi` instead of `lo == hi`), not built further.
4. **Four questions, one loop.** `lower_bound` (first index with `a[i] >= x`) and
   `upper_bound` (first index with `a[i] > x`) are the same loop with one comparison
   flipped. First and last occurrence of a key, and the count of a key, all reduce to one
   or both of these — shown on the array's three `3`s.
   *Takeaway:* "lower_bound and upper_bound are the same loop with one comparison
   flipped; everything else in this topic is built from them."
5. **Predict.** A key that is absent entirely: what do `lower_bound` and `upper_bound`
   return, and how do they relate to each other?
6. **The bug that waited nine years.** The naive midpoint, `(low + high) / 2`, shipped in
   Bentley's *Programming Pearls* and in the JDK's own `Arrays.binarySearch` — written by
   the same engineer who later found the bug in his own code. `low + high` overflows a
   fixed-width signed integer once the array is large enough (around a billion elements
   for a 32-bit int), and the sum wraps negative.
7. **Reproduced, not asserted.** The same overflow, shown on an 8-bit signed integer so the
   wraparound happens at indices small enough to read off directly: two in-range indices
   whose sum exceeds 127 produce a negative "midpoint" from the naive line, and a correct
   one from the safe line, `low + ((high - low) / 2)`.
   *Takeaway:* "The safe midpoint never sums two large values; the naive one always does."
8. **Proving it ends.** Every iteration either returns or strictly shrinks `hi - lo`,
   since `lo <= mid < hi` whenever `lo < hi`. The loop terminates in at most
   `ceil(lg(n + 1))` iterations — the worst-case path, instrumented directly, not
   counted by hand, and checked against the formula up to a million keys: twenty steps.
9. **Recap and handoff.** Binary search as built here answers one kind of question: is
   the candidate at this index too small, too big, or the boundary itself. The next topic
   asks the same loop a very different-looking question — not an array lookup, but any
   yes/no test that flips exactly once as a parameter grows. Binary search on the answer,
   next.

## Why no compiled benchmark

Every outcome here — the bound counts, the overflow, the iteration counts — is a small,
exact, deterministic computation, checked directly in Python; no timing claim is made
anywhere in this topic.

## Changes from the chapter plan

None: the topic keeps to its `CHAPTER.md` entry. The overflow is demonstrated on an 8-bit
simulated integer rather than a real billion-element array (infeasible to build and run in
this environment); `CHAPTER.md` already calls for "a toy fixed-width integer type that
overflows at a small bound, so the failure is actually observed, not merely asserted,"
which this satisfies.
