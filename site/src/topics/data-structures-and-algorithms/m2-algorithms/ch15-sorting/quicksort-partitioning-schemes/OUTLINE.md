# OUTLINE: Quicksort and partitioning schemes

A full topic, about 15 minutes. Third topic of Chapter 15. Every count below is computed
and asserted directly in `examples.py`; dual-pivot quicksort and branchless block
partitioning are named from primary sources (see `SOURCES.md`), not reimplemented.

## Storyboard

1. **Hook.** Sorting 1,024 keys that are all equal should take almost no work — there is
   nothing to move. A textbook (Lomuto) quicksort makes 523,776 comparisons on it, about
   fifty times the n log n it is famous for. Change the partition and it makes 12,286.
   Change it again and it makes 1,024.
2. **Predict.** Lomuto partitioning on 1,024 equal keys: roughly how many comparisons?
   (523,776 — every key equals the pivot, so every key goes to the same side and the range
   shrinks by one each time.)
3. **The partition contract.** Rearrange a range around a pivot so nothing on the left is
   larger and nothing on the right is smaller, then return the split. Every quicksort is
   this contract plus a rule for picking the pivot.
4. **Lomuto.** One scan, a boundary index, the last element as pivot — simple, correct,
   about n comparisons, as many as n swaps.
5. **Hoare.** Two indices walking inward from both ends, swapping out-of-place pairs,
   stopping on equal keys. On random input, measured directly: far fewer swaps than
   Lomuto, and an all-equal range splits at the middle instead of shrinking by one.
6. **The stack bound.** Recurse on the smaller side, loop on the larger: measured directly
   on sorted input (Lomuto's own worst case for comparisons), the recursion depth stays at
   zero — the stack never grows past O(log n), whatever the pivot turns out to be.
   *Takeaway:* "Recurse on the smaller side and loop on the larger: the call stack stays
   O(log n) deep no matter how bad the pivot is."
7. **Randomized pivot.** A random pivot's expected cost, 2(n+1)H_n − 4n, measured directly
   by averaging many runs: the average lands within a tenth of a percent of the formula.
8. **Median-of-three.** The median of the first, middle and last keys defeats sorted and
   reversed input cheaply — measured directly, both stay far under a loose n log n
   ceiling.
9. **Predict.** Is there an input that defeats median-of-three the way sorted input
   defeats a last-element pivot? (Yes — but not a single sorted or reversed run; it takes
   two sorted runs concatenated, each individually ascending, to make the three sampled
   points miss the true median every time it matters.)
10. **The median-of-three killer.** Two ascending runs stitched together: measured cost
    grows as a constant fraction of n² across a 16× range of sizes (about a quarter of n²,
    not n log n) — a real quadratic blow-up, not merely a worse constant. This is why a
    production quicksort still carries a depth limit or randomness on top of any fixed
    pivot rule.
    *Takeaway:* "No fixed pivot rule is safe against every input; that's the whole reason
    a depth limit or randomness rides along with quicksort in practice."
11. **Three-way (Dutch national flag) partitioning.** Three indices, one pass, everything
    equal to the pivot already done. Measured on four distinct values: Lomuto, Hoare and
    three-way fall sharply in that order; on all-equal keys, three-way is linear. On random
    distinct keys with no duplicates to collapse, three-way does *more* swaps than Hoare —
    measured directly — which is why library sorts use it only when duplicates look likely,
    not unconditionally.
12. **Dual-pivot quicksort, named.** Two pivots split the range into three parts; the real
    system is the JDK's own `DualPivotQuicksort`, read directly: a depth limit
    (`MAX_RECURSION_DEPTH = 384`) falling back to heapsort, a pre-check for existing runs,
    counting sort for small primitive types. What it buys in theory (Wild and Nebel's own
    measured 1.9n ln n against classic quicksort's 2.0n ln n) and what a 3-pivot scheme
    buys further in practice (Kushagra et al.'s own measured 7-8% on top of that) are both
    stated only from what those papers themselves say.
13. **Branchless block partitioning, named.** A data-dependent branch on random input
    mispredicts about half the time; BlockQuicksort's own fix — compare a fixed block of
    128 elements into a buffer first, then replay the swaps with no conditional branch on
    the outcome — is named with its own proven bound (ε n log n + O(n) mispredictions) and
    its own measured number (80% faster than GCC's `std::sort` on random integers, with
    sorted input as the one case it can lose).
14. **Recap and handoff.** Quicksort is usually the fastest comparison sort, and every
    improvement to it — randomness, median-of-three, a depth counter — exists because an
    unlucky pivot makes it quadratic, and an adversary can arrange that. The next topic
    gives the n log n promise outright, in place, using the heap. Heapsort, next.

## Why no compiled benchmark

Every count here — comparisons, swaps, recursion depth, the quadratic ratio — is a small,
deterministic computation on a fixed-size array, checked directly in Python; dual-pivot
quicksort and branchless block partitioning are named only (their own papers' measured
numbers, not reproduced on this machine), per `CHAPTER.md`'s own scope for this topic.

## Changes from the chapter plan

- The planning values in `CHAPTER.md` (Lomuto/Hoare/three-way comparison counts on four
  distinct values, Hoare/three-way swap counts on random distinct keys) were computed with
  a different random seed than this topic's own `examples.py` uses; this topic's own
  measured numbers (close in magnitude, same ordering) are what is stated on screen, not
  the planning table's exact figures — consistent with CHAPTER.md's own framing that these
  are "planning values," not fixed constants to reproduce bit for bit.
- McIlroy's "A Killer Adversary for Quicksort" could not be fetched this session (SSL
  error, then HTTP 503). Per `CHAPTER.md`'s own fallback instruction, this topic builds its
  own small adversary against its own fixed median-of-three rule instead of reproducing
  McIlroy's construction — the two concatenated ascending runs in step 10, verified
  directly to be quadratic (not assumed), rather than a citation of his result.
- Hoare's original 1961/1962 papers and Bentley & McIlroy's 1993 paper are citation-only
  this session (paywalled, not attempted), per `CHAPTER.md`'s own "to verify" framing — the
  Lomuto/Hoare mechanics themselves are verified directly in `examples.py`, not taken from
  either paper's stated numbers.
