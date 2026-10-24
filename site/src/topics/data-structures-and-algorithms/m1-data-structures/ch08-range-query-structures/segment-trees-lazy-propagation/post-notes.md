---
id: dsa.segment-trees-lazy-propagation
title: Segment trees and lazy propagation
---

<section data-section="outcomes">

## After this topic you can

- Build a segment tree both recursively and as a bottom-up array layout, and confirm both answer the identical range query.
- Build the identical tree shape with a different associative combine function (not just sum) and show the same O(log n) bound holds.
- Explain lazy propagation's own deferred-update mechanic, and work through a real example where two pending tags compose into one versus a case where they can't.

</section>

<section data-section="internals">

## Into the internals

### The three-way split every descent runs on

Every query and every update runs the identical three-way split at each node: if the node's own range sits fully inside the target range, use it directly and stop; if it sits fully outside, skip it and stop; otherwise it partially overlaps, so recurse into both children. This split, repeated at every level, is the entire mechanism behind the O(log n) bound — there is no separate optimization layered on top of it. A push-down of any pending lazy tag must happen before recursing into a partially-overlapping node's own children, never after: recursing first would read stale values at the children, since the tag's own correction hasn't reached them yet.

### Recursive-with-pointers versus bottom-up-in-one-array

Both layouts compute identically — this topic's own `examples.py` confirms it directly, not by argument. The recursive layout (cp-algorithms' own default) is the more extensible of the two: lazy propagation, a different combine function per node, and other variations plug in naturally. The bottom-up array layout (GeeksforGeeks) is shorter and has a better constant factor, but is harder to extend — adding lazy propagation to it needs a second, separate array layered underneath the leaves, which this topic's own lazy implementation builds recursively instead, for exactly that reason.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a recursive segment tree over the chapter's own 15-slot per-minute event-count array (the identical array topic 33 used), verifies every range sum and every range minimum against a direct scan, for every possible range, then confirms a point update keeps every range correct. It builds the identical tree shape as a bottom-up, flat-array, non-recursive layout and confirms it answers every query identically to the recursive version. It builds a lazy sum segment tree and verifies all four cases of the lazy-tag composition rule directly: two pending adds combine into one; an add is discarded by a later assign on the same node; an add folds into a pending assign; a second assign replaces a first outright. Finally it runs a fixed workload of 10 range-add updates over the identical array, each measured from a tree with no pending tags of its own (to isolate the lazy mechanism's own per-call cost from the separate cost a *sequence* of overlapping updates can add on top of it), and measures the real contrast: a segment tree with no lazy tags at all costs 85 leaf-touches across the ten updates; the same updates run through lazy tags cost 24 node-touches.

</section>

<section data-section="production">

## In production

A segment tree (or its bottom-up array form) is the standard choice once the aggregate isn't a running sum, or a range-wide update needs to cost what a point update costs — a range minimum or maximum over a sliding window, or a bulk correction applied to a whole stretch of values at once. A Fenwick tree (topic 33) stays the simpler, faster choice when the operator is sum and no range-wide update is needed; reaching for a segment tree when a Fenwick tree already answers the question is unnecessary complexity, not a safer default.

</section>

<section data-section="frontier">

## The frontier

Persistent segment trees, which keep every past version of the structure reachable after an update, and dynamic segment trees, which use pointers instead of a fixed array to cover a sparse range cheaply, are both named by cp-algorithms as further variants. Neither is taught here; this topic's own scope stops at lazy propagation over a fixed-size array.

</section>

<section data-section="questions">

## More questions

- This topic's own workload measured each range-add update from a tree with no pending tags of its own. Work out, by hand or in code, what happens to the lazy-tag cost if the same ten updates are instead applied one after another to a single, shared tree, so later updates sometimes have to push down tags earlier updates left behind.
- The lazy-tag composition rule folds an add into a pending assign, but discards an add when a later assign arrives. What is it about what "assign" and "add" each mean that makes these two directions behave differently, rather than symmetrically?

</section>

<section data-section="next">

## Where this goes next

Fenwick trees and segment trees both answer aggregate questions over a changing array in O(log n), whichever one fits the operator and the update pattern. The next chapter asks a different question about dimension instead: not where a value sits along one array, but how to order points scattered across two or three dimensions so that nearby points end up nearby in a single linear ordering. Space-filling curves, next.

</section>
