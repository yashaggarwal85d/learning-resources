---
id: dsa.binary-heaps-heapify
title: Binary heaps and heapify
---

<section data-section="outcomes">

## After this topic you can

- Trace a sift-up and a sift-down by hand and show each restores the heap property.
- State and justify the O(n) bottom-up build bound, and contrast it against the O(n log n) bound of n one-at-a-time insertions on the same input.
- Compute a node's parent and child indices directly from its own array position, with no pointers involved.

</section>

<section data-section="internals">

## Into the internals

### The full sum-of-heights argument, named rather than re-derived

The real reason bottom-up construction is linear rather than log-linear is that most nodes sit near the bottom of the tree, where a node's own height — and so the maximum number of swaps its own sift-down can ever cost — is small; summed across every node, that bound comes out linear in the number of elements, not log-linear. This topic names that argument and sources it, rather than re-deriving the exact closed-form series symbol by symbol on screen, and instead measures the real swap-count gap directly in `examples.py`.

### Why random input understates the gap, and what fixes it

A random permutation actually understates the one-at-a-time build's own cost: a random insertion's expected sift-up distance is close to constant, because most values land near the bottom and barely move, so the measured gap on random data stays small even though the worst-case bound is log-linear. `examples.py` instead builds from a decreasing-order input — the adversarial case for a min-heap, where every insertion is a brand-new global minimum and so swims the full root-ward path every time — which is what actually exposes the n log n vs. n gap in a real measurement.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a `BinaryHeap` class from a plain Python list, with `sift_up` and `sift_down` as its only two repair operations and no pointers anywhere. It inserts 4,000 elements one at a time (triggering a sift-up each time) and separately builds a heap from the identical elements via the bottom-up method, on a decreasing-order input chosen specifically because it is the adversarial case for sift-up. It counts every real swap in both builds, asserts the bottom-up build costs fewer swaps and stays within a small constant factor of n, and confirms both builds end at a fully valid heap by checking the heap property at every node, and by popping every element off one of them and checking the result comes out in fully sorted order.

</section>

<section data-section="production">

## In production

Heapsort's own first phase is exactly this topic's bottom-up build: sift-down every internal node from the last one up to the root, turning an arbitrary array into a valid heap in place, in linear time, before the sortdown phase repeatedly extracts the maximum. This topic covers only the build; the sortdown phase itself is named here only as where that build is actually used, not taught as its own mechanism.

</section>

<section data-section="frontier">

## The frontier

d-ary heaps (more than two children per node, trading shallower trees for more comparisons per sift-down) and monotone integer priority queues (specialized structures for priorities drawn from a bounded, increasing range) are named here only in passing — this chapter's own syllabus marks both as skipped.

</section>

<section data-section="questions">

## More questions

- If sift-up's worst case is bounded by the tree's height, and the tree has at most ⌈log₂(n+1)⌉ levels, what is the largest number of swaps a single insertion into an n-element heap can ever cost?
- The bottom-up build processes internal nodes from the last one up to the root. What would go wrong, or at least cost more, if it instead processed them in the opposite order, root to last?

</section>

<section data-section="next">

## Where this goes next

A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires. Tournament and loser trees, next: the structure built to hit the bound a k-way merge actually allows.

</section>
