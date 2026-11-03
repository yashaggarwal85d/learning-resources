# OUTLINE: Heapsort

A refresher, about 5 minutes. Fourth topic of Chapter 15. Every count below is computed
and asserted directly in `examples.py`; the introsort-style depth-limit fallback (named in
libstdc++, the JDK and Rust) is named from primary sources (see `SOURCES.md`), not
reimplemented.

## Storyboard

1. **Hook.** Quicksort can be driven to quadratic time by a crafted input, and a service
   that sorts user-supplied data is exposed to it — yet every production quicksort
   promises n log n. The promise is kept by a second algorithm waiting in the wings, one
   nobody would choose to run on purpose.
2. **Predict.** On random keys, heapsort uses about how many times the minimum number of
   comparisons? (About two: 17,316 against 8,770 at 1,024 keys.)
3. **Build the max-heap.** Chapter 6's linear bottom-up build, run here again: sift every
   non-leaf down, from the last one to the root. Measured directly: 1,887 comparisons to
   build the heap of 1,024 keys.
4. **Swap, shrink, sift.** Pull the root (the maximum) to the end of the live range, shrink
   the heap by one, sift the new root down. Repeat until the heap is empty — the sorted
   suffix grows where the heap shrinks, no second array anywhere.
5. **The cost, on three shapes.** Measured directly on 1,024 keys: random 17,316
   comparisons, sorted 18,060, reversed 16,407 — all within a fifth of each other.
   *Takeaway:* "Heapsort is not adaptive: its cost barely moves between the easiest and
   hardest input shapes, unlike every other sort in this chapter."
6. **Against the bounds.** The information-theoretic minimum at 1,024 keys is 8,770
   comparisons; heapsort lands at about twice that on every shape measured, and above
   merge sort's own worst case of 9,217. The reason: at most 2 comparisons per level of a
   sift-down, and ⌈lg n⌉ levels — a real bound, just not a tight one.
7. **Poor locality.** A sift-down from the root of a heap of a million keys walks about 20
   nodes, each one farther from the last in memory than the one before (index i, then
   roughly 2i); measured directly, that path touches 17.9 distinct 64-byte cache lines on
   average, where a sequential scan of the same 20 keys would touch about 3.
   *Takeaway:* "The branchy, scattered access pattern is why heapsort loses to quicksort
   and merge sort on real machines, despite the better worst-case guarantee."
8. **Unstable, in place.** The tagged deck: three keys tied at 3, heapsort's root-to-end
   swaps reorder them (measured directly: input order a, c, f becomes c, a, f) — no
   stability promise survives a sift-down. In place: no second array, O(1) extra memory
   beyond the input.
9. **Its role as the fallback.** Quicksort's own worst case is still quadratic on an
   adversarial input (topic 50); the fix three real systems share is a depth counter on
   the recursion, and when it crosses a bound proportional to lg n, the current range is
   finished by heapsort instead. Read directly from source: libstdc++'s `__introsort_loop`
   falls back to `__partial_sort` (a heap sort) at `__depth_limit == 0`, with the limit set
   to `std::__lg(n) * 2`; the JDK's `DualPivotQuicksort` calls its own `heapSort` once a
   partitioning-round counter exceeds `MAX_RECURSION_DEPTH = 384`; Rust's unstable sort
   passes its own quicksort a `limit = 2 * floor(log2(len))`, falling back the same way
   (the Rust docs' own words for the result: the current implementation "combines the fast
   average case of quicksort with the fast worst case of heapsort").
   *Takeaway:* "A production sort's worst-case guarantee usually isn't a cleverer
   quicksort — it's a depth counter that hands the dangerous range to heapsort."
10. **Recap and handoff.** Heapsort completes the set of comparison sorts built from
    scratch: quicksort for speed, heapsort for the worst case, merge sort for stability and
    the guarantee. But every one of them starts from nothing, as if the input were random.
    Timsort, Powersort and driftsort, next.

## Why no compiled benchmark

Every count here — comparisons (build and sort), swaps, the cache-line path — is a small,
deterministic computation on a fixed-size array or heap, checked directly in Python;
nothing here claims a wall-clock number, so `CHAPTER.md`'s own compiled-helper requirement
(reserved for wall-clock figures) does not apply to this topic.

## Changes from the chapter plan

- `CHAPTER.md`'s planning values (random 17,327, build 1,910, sorted 18,060, reversed
  16,407) were computed with a different random seed than this topic's own `examples.py`
  uses; the sorted and reversed counts are deterministic and matched exactly (18,060 and
  16,407), and the random count and the build count landed close (17,316 and 1,887) —
  consistent with `CHAPTER.md`'s own framing that these are planning values, not fixed
  constants to reproduce bit for bit. The information-theoretic bound (8,770) and merge
  sort's worst case (9,217) matched exactly.
- The cache-line measurement (17.9 distinct lines on a 20-node path, 2,000 trials) matched
  `CHAPTER.md`'s planning value exactly on this topic's own random seed; it is recomputed
  in `examples.py`, not assumed, per the chapter's own instruction.
- CLRS, Williams (1964), Floyd (1964), Musser (1997) and Wegener (1993) are citation-only
  this session (CLRS and Musser paywalled; Williams and Floyd are pre-digital-archive CACM
  issues; Wegener is named only in post-notes per `CHAPTER.md`), per `CHAPTER.md`'s own
  "to verify" framing — the depth-limit mechanism itself is instead confirmed directly from
  the three real systems' own source (libstdc++, the JDK, Rust), which `CHAPTER.md`'s own
  scope clause treats as sufficient.
