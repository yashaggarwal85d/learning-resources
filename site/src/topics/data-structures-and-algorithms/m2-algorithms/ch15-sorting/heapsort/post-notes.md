---
id: dsa.heapsort
title: Heapsort
---

<section data-section="outcomes">

## After this topic you can

- Run heapsort on an array: build the max-heap, then repeatedly swap, shrink and sift, with exact comparison counts, and say why it is in place, unstable and not adaptive.
- Explain why heapsort is slower than quicksort in practice despite the better worst case, using the heap's index-jump access pattern.
- Say what an introsort depth limit does, and name two real sorts that use it.

</section>

<section data-section="internals">

## Into the internals

### Why heapsort's cost barely moves across input shapes

Every sift-down walks a path from some node toward a leaf, and it only stops early when a child is already smaller than its parent — a comparison the data decides. But the number of children examined per level (two, for a binary max-heap) and the number of levels (⌈lg n⌉) don't depend on the data at all; they're fixed by the heap's shape, not its contents. Sorted and reversed input only change *how far down* each sift-down travels before the data stops it early, not the shape of the heap it's travelling through — which is why the three measured counts (17,316, 18,060, 16,407) land within a fifth of each other instead of spanning the orders-of-magnitude range insertion sort or quicksort show on the same three shapes.

### Why the index pattern is bad for the cache

An array scan touches index i, then i+1: adjacent memory, one cache line serving many steps. A sift-down from index i touches i, then 2i+1 or 2i+2 next: the gap between consecutive indices on the path roughly doubles every step. Two indices on the same 64-byte cache line (8 keys) are close together absolutely, but a heap's parent-child gap grows with the index itself, so only the first couple of levels near the root ever share a line with their children — every level below that is very likely a new line. That's the mechanism behind the 17.9-of-20 measured number: it isn't heapsort being "unlucky," it's a direct consequence of where the implicit tree puts a node's children.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds the max-heap with Chapter 6's linear bottom-up sift-down, then sorts by repeatedly swapping the root with the last live element, shrinking the heap, and sifting the new root down — instrumented to count comparisons and swaps separately for the build and the sort. It measures all three on 1,024-key random, sorted and reversed inputs, checks the result against Python's own `sorted()`, and confirms the "not adaptive" claim directly (the three counts land within a fifth of each other, where topic 48's insertion sort spans orders of magnitude on the same shapes). It computes both bounds heapsort is read against — the information-theoretic minimum ⌈lg n!⌉ and merge sort's own exact worst case — and confirms heapsort lands at roughly twice the first and above the second on every shape. The cache-line claim is a direct simulation: 2,000 random root-to-leaf paths through a heap of 2²⁰ keys, each path's distinct 64-byte lines counted, averaging to 17.9 of about 20 nodes. The instability claim uses a small tagged deck: three keys tied at the same value go in in one order and come out in a different one.

</section>

<section data-section="production">

## In production

Three real systems carry the same shape of fallback, each read directly from source at a fixed version: libstdc++'s `std::sort` runs `__introsort_loop` with a depth limit of `std::__lg(n) * 2`, and once that limit reaches zero it finishes the remaining range with `__partial_sort` — a heap sort — rather than continuing to partition (`stl_algo.h` on GCC's `master` branch). The JDK's `DualPivotQuicksort` keeps its own counter (`bits`, incremented by `DELTA = 6` each partitioning round) and once it exceeds `MAX_RECURSION_DEPTH = 384` calls its own `heapSort` on the remaining range (`jdk-21-ga`). Rust's unstable sort (`sort_unstable`, backed by ipnsort) computes `limit = 2 * floor(log2(len))` once and passes it into its own quicksort, which falls back the same way (`1.81.0` tag); the standard library's own current documentation says of the result that it "combines the fast average case of quicksort with the fast worst case of heapsort." Go rewrote its `sort` package in Go 1.19 to a related idea, pattern-defeating quicksort (pdqsort), per that release's own notes, named here only — this topic does not open pdqsort's internals. Rust 1.81's own unstable sort is ipnsort by the same two authors (Lukas Bergdoll and Orson Peters) as pdqsort; both are named only from their own release notes, not built, per `CHAPTER.md`'s scope for this refresher.

</section>

<section data-section="frontier">

## The frontier

Floyd's bottom-up variant of heapsort — sifting a candidate all the way to a leaf and then back up, rather than comparing both children at every level on the way down — is reported (Wegener, 1993, **to verify**: this topic did not open the paper) to come close to n lg n comparisons rather than heapsort's roughly 2n lg n, at the cost of more swaps on average. Nothing about its exact bound or its tradeoff is asserted here beyond naming it, since the only source for the claim is unopened this session.

</section>

<section data-section="questions">

## More questions

- The measured cache-line count (17.9 of about 20 nodes) assumes 8 keys fit in a 64-byte line. How would that number change for a heap of larger records — say, 32-byte keys, 2 per line — and at what record size does a sift-down's locality become *worse* than a linear scan's, rather than merely bad?
- Three real systems each pick their own depth-limit constant (`2 * lg n`, `384` as a round-count bound, `2 * lg n` again). Is there a principled reason two of the three converge on the same multiplier, or is it a coincidence of how each team tuned its own threshold?

</section>

<section data-section="next">

## Where this goes next

Heapsort completes the set of comparison sorts built from scratch: quicksort for speed, heapsort for the worst case, merge sort for stability and the guarantee. But every one of them starts from nothing, as if the input were random. Real data rarely is: it arrives with stretches already in order, and a sort that notices them can finish in a fraction of the work. One family of sorts is built around exactly that observation, and two real libraries had to repair the same bug in it. Timsort, Powersort and driftsort, next.

</section>
