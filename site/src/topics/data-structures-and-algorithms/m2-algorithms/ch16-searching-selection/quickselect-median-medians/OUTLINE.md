# OUTLINE: Quickselect and median-of-medians

A full topic, about 15 minutes. Fourth and last topic of Chapter 16. No compiled
benchmark needed — every number is a small, exact comparison count, computed and
asserted in `examples.py`.

## Storyboard

1. **Hook / bridge.** The handoff from topic 57: every search this chapter has built
   has assumed order already exists somewhere to exploit. The next question has none:
   finding the k-th smallest element of an unsorted collection, as fast as possible,
   without paying to sort the rest.
2. **Predict.** On a million random keys, does quickselect for the median make roughly
   n comparisons, n log n comparisons, or n² comparisons, in the typical case?
3. **Quickselect itself.** Partition around a pivot (Chapter 15's own partition step,
   reused, not rebuilt) and recurse into only the side that contains the target rank,
   discarding the other side entirely. The measured gap: finding the median of a
   million random keys costs a small constant times n comparisons, against n log n for
   a full sort.
   *Takeaway:* "Sorting answers a question nobody asked — the rank of every element —
   when only one rank was ever wanted."
4. **The worst case, honestly.** An adversarial or always-unlucky pivot (first element,
   on already-sorted input) degrades quickselect to the same Θ(n²) Chapter 15's
   unguarded quicksort suffered — the identical fact, seen before, not a new one.
5. **Median-of-medians, named.** Groups of five, each group's median taken, the median
   of those medians used as the pivot — a guaranteed fraction of the array (at least
   three in ten) provably smaller, and at least three in ten provably larger, so at
   most seven in ten survive to the next round, worst case, not merely expected.
   *Takeaway:* "Median-of-medians buys a worst-case guarantee quickselect never had —
   the same trade Chapter 15's heapsort made against quicksort."
6. **Why nobody uses it.** The constant hidden inside that Θ(n) is large enough (fives
   sorted, two recursive calls per round) that median-of-medians measurably loses to
   randomised quickselect on the same ordinary input — a worst-case guarantee bought at
   a real, measured price.
7. **Predict.** Does a real standard library's `nth_element`, which promises a
   worst-case bound, actually fall back to median-of-medians to get it?
8. **Introselect, and the honest correction.** Musser's own 1997 answer: run
   quickselect, and only fall back to median-of-medians past a recursion-depth bound
   proportional to log n. But most real C++ standard libraries — this machine's own
   installed one included, read directly from its header — use a different fallback
   (a heap-based selection), giving O(n log n) worst case, not O(n): the production
   answer and the textbook answer have quietly diverged.
   *Takeaway:* "The algorithm in the textbook and the algorithm in your standard
   library's header are not always the same algorithm."
9. **Recap and handoff.** Every algorithm this chapter built answers a question about
   a single value — one key, one boundary, one order statistic — in time that scales
   with log n or, for selection, with n. The next chapter's questions are a different
   shape: not a value to find, but a structure to explore. Breadth-first search, next.

## Why no compiled benchmark

Every outcome here — the quickselect/full-sort comparison gap, the adversarial
quadratic blow-up, the median-of-medians discard fraction, the quickselect-vs-BFPRT
comparison gap, the introselect depth limit — is a small, exact, deterministic
computation, checked directly in Python; no wall-clock timing claim is made anywhere in
this topic (the "why nobody uses it" step uses measured comparison counts, the project's
own convention for a claim that doesn't need wall-clock to support it).

## Changes from the chapter plan

The `nth_element`-style top-k contract is described in `post-notes.md` rather than
built as a separate `examples.py` routine, since it is a one-line extension of
quickselect already implemented (call it once, take the prefix) and the chapter's own
scope treats it as a named pointer, not a worked example requiring its own measured
number.
