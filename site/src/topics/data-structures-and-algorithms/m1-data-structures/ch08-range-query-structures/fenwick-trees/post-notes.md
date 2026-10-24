---
id: dsa.fenwick-trees
title: Fenwick trees
---

<section data-section="outcomes">

## After this topic you can

- Compute a Fenwick tree's own point-update and prefix-sum-query index sequences by hand, using lowest-set-bit arithmetic, and explain why each is O(log n).
- Derive a range-sum query from two prefix sums, and extend a single Fenwick tree to a range-update/range-query pair using two trees.
- State what a 2D Fenwick tree computes and why its own indexing is the 1D case applied along two dimensions at once.

</section>

<section data-section="internals">

## Into the internals

### One-based indexing, the identity that makes the arithmetic clean

A one-based Fenwick tree stores, at index i, the sum of the range `(g(i), i]` where `g(i) = i - (i & -i)` — i's own lowest set bit subtracted off. Finding the next index to touch on an update reverses that: `h(i) = i + (i & -i)`. These two operations are exact inverses of the same bit, which is why the update loop (`idx += idx & -idx`) and the query loop (`idx -= idx & -idx`) look like mirror images of each other — they are walking the same implicit tree in opposite directions. A zero-based Fenwick tree uses a slightly different pair (`i & (i+1)` and `i | (i+1)`) and costs exactly the same O(log n); the two layouts are equivalent, not alternatives with different bounds.

### Why a 2D Fenwick tree is O(log² n), not O(log n)

Nesting the 1D update/query loop along a second dimension (`for i: for j:`) means every outer-loop jump along the row axis runs a full inner-loop walk along the column axis. Each axis's own walk is independently O(log n), so a 2D point update or prefix-sum query costs O(log n) × O(log n) = O(log² n) overall, not O(log n). This topic's own reel shows the mechanism (the same arithmetic, nested) without asserting the 2D operation is as cheap as the 1D one — it isn't, by one factor of log n.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a Fenwick tree over the chapter's own 15-slot per-minute event-count array, verifies every prefix sum against a direct scan, and records the real index-jump sequence for a point update (minute 5: three jumps, 5 → 6 → 8) and a prefix-sum query (minute 11: three jumps, 11 → 10 → 8) — two different indices that happen to need the same jump count here, not a general rule. It builds the range-update/range-query two-Fenwick-tree extension and a small 4-by-4 2D Fenwick tree, both checked against brute-force references at every index. Finally it runs a fixed workload of 10 point updates and 10 prefix-sum queries over the identical array and measures the real cost of each approach: a naive cached running total, which must re-sum every prefix at and after an updated index, costs 97 slot-touches in total; the Fenwick tree's own index jumps cost 47.

</section>

<section data-section="production">

## In production

A Fenwick tree is the standard choice behind a counter that updates often and is queried often — a running total of events, bytes, or requests bucketed by time or by key, where both operations need to stay fast as the counter keeps changing. A plain cached prefix-sum array is cheaper to query (one lookup) but expensive to keep current after an update; a Fenwick tree gives up that one-lookup query in exchange for a bounded, logarithmic cost on both sides.

</section>

<section data-section="frontier">

## The frontier

Segment trees, this chapter's own next topic, generalize past everything a Fenwick tree can't do: any associative combine function (not just sum), a range minimum or maximum, and a range-wide update that doesn't need the two-tree extension this topic builds. Named here only as what comes next, not taught.

</section>

<section data-section="questions">

## More questions

- This topic's update and query example (minutes 5 and 11) both needed exactly three index jumps. Pick two other indices in the same 15-slot array and work out by hand whether their own jump counts match or differ, and why.
- The two-Fenwick-tree range-update/range-query extension needs two trees, not one. What specifically about a single Fenwick tree's own index-jump arithmetic makes one tree insufficient for both operations at once?

</section>

<section data-section="next">

## Where this goes next

A Fenwick tree answers one specific aggregate — a running sum — in O(log n) for both a point update and a prefix-sum query, using nothing but one array and lowest-set-bit arithmetic. It can't answer a range minimum, and it can't apply one update to an entire range without extending it. Segment trees, next: the fully general structure, built to answer any associative aggregate over any range, with a range-wide update costing no more than a single point update does here.

</section>
