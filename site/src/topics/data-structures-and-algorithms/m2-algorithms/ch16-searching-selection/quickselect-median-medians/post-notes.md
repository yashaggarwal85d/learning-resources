---
id: dsa.quickselect-median-medians
title: Quickselect and median-of-medians
---

<section data-section="outcomes">

## After this topic you can

- Implement quickselect from Chapter 15's partition, state its expected Θ(n) cost, and say why an adversarial pivot still degrades it to Θ(n²).
- Implement median-of-medians' group-of-5 pivot selection, verify the 3/10–7/10 discard fraction on a constructed input, and state its worst-case Θ(n) recurrence.
- Say, with a measured number, why median-of-medians is a worst-case guarantee bought at a real constant-factor cost, and why production code uses randomised quickselect, introselect or Floyd–Rivest sampling instead; state `nth_element`'s contract and its one-line extension to an unordered top-k.

</section>

<section data-section="internals">

## Into the internals

### Why the recurrence stays linear with two recursive calls

Median-of-medians makes two recursive calls per round — one to find the median of the group-medians (on roughly n/5 elements), one to recurse into the surviving 7/10 of the array — where quickselect makes only one. The recurrence T(n) = T(n/5) + T(7n/10) + O(n) still solves to Θ(n) because the two recursive problem sizes sum to less than n (one fifth plus seven tenths is nine tenths), so each level of recursion does strictly less total work than the level above it, and the whole recursion tree sums to a constant times the root's own work — the same geometric-series argument that makes any divide-and-conquer recurrence with sub-problem sizes summing to less than the whole linear, not merely "small enough to ignore."

### Why the textbook and the shipped library diverge

Musser's own 1997 paper describes introselect as quickselect falling back to median-of-medians past a depth bound, and states this gives a strict Θ(n) worst case. A standard library implementer choosing a different fallback (a heap-based selection, giving Θ(n log n) worst case instead of Θ(n)) is trading a slightly weaker asymptotic guarantee for a fallback with less constant-factor overhead and simpler code — the C++ standard itself places no requirement on which worst-case bound `nth_element` must hit, only that it terminate correctly, which is exactly the freedom this topic's own reading of GCC 13's header shows being used.

</section>

<section data-section="lab">

## In the lab

`examples.py` implements quickselect from a local Lomuto partition and confirms it against Python's own `sorted()` for n = 1,000 and n = 1,000,000 random keys, measuring a comparison count a small constant times n against an n·log₂(n) full-sort estimate. An adversarial first-element pivot on already-sorted input is measured directly, confirming the textbook quadratic blow-up (over n²/4 comparisons for n = 200) against a random pivot's linear count on the identical input. Median-of-medians is built with real groups-of-five, and its guaranteed discard fraction is checked by direct counting on a constructed 1,000-element input, not assumed from the formula. A head-to-head measurement on a shared input shows median-of-medians losing to randomised quickselect, and a simplified Floyd–Rivest-style sampling routine (built to show the same shape of saving as the real algorithm, not to reproduce its exact comparison bound) is shown beating plain quickselect, averaged over several trials. Finally, this machine's own installed GCC 13 libstdc++ header is read directly to confirm both the real depth-limit formula `std::nth_element` uses and its real fallback routine.

</section>

<section data-section="production">

## In production

### nth_element's contract and the one-line extension to top-k

`std::nth_element(first, nth, last)` rearranges a range so that the element at `nth` holds the value that would be there after a full sort — with everything before it no larger and everything after it no smaller — but neither side is itself sorted. This weaker guarantee than a full sort is exactly what lets it run in linear time instead of n·log n: a caller who only needs one rank, or the k smallest elements unordered (call it once with `nth` at position k, then take the prefix `[first, nth)`), never pays for sorting the elements they don't care about the order of.

Quickselect itself (or a close variant) sits behind nearly every real "find the median" or "top-k" routine in a standard library — not because it is exotic, but because it is the direct, from-scratch version of exactly the contract `nth_element` promises.

</section>

<section data-section="frontier">

## The frontier

Hoare's own 1961 paper and the BFPRT 1973 paper are not opened directly in this topic — every claim attributed to either is sourced through Wikipedia's own quoted summary. A reader wanting the original proofs, or the exact constant in median-of-medians' worst-case running time, should start from those two papers directly. This topic's own Floyd–Rivest implementation is a simplified version built to show the shape of the real algorithm's saving, not a reproduction of its adaptive re-sampling or its exact `n + min(k, n−k) + O(√n·log n)` comparison bound.

</section>

<section data-section="questions">

## More questions

- Median-of-medians' group size of five is the smallest odd number for which the algorithm's own discard-fraction argument works. What would go wrong with groups of three?
- This topic's own libstdc++ reading is specific to one compiler version on one machine. If you checked a different C++ standard library (libc++, or an older GCC), would you expect the same fallback, or a different one?

</section>

<section data-section="next">

## Where this goes next

Every algorithm this chapter has built answers a question about a single value — one key, one boundary, one order statistic — in time that scales with the logarithm of n, or, for selection, with n itself. The next chapter's questions are a different shape entirely: not a value to find, but a structure to explore — which nodes can be reached from this one, in what order, and at what cost. Breadth-first search, next.

</section>
