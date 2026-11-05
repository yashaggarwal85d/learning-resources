---
id: dsa.interval-merging-scheduling
title: Interval merging and scheduling
---

<section data-section="outcomes">

## After this topic you can

- Merge a set of intervals and insert one into a merged set, stating the cost of each step and the invariant that makes the loop correct.
- Show by counter-example why earliest-start and shortest-first fail, and prove earliest-finish-first optimal by exchange.
- Compute the minimum number of rooms with a min-heap of end times and argue it equals the depth.
- Write the weighted-interval recurrence, compute p(j) by binary search, and say when greedy is enough and when DP is needed.

</section>

<section data-section="internals">

## Into the internals

### The exchange argument, spelled out

Let the greedy (earliest-finish-first) solution be `i1, i2, ..., ik` and suppose some optimal solution `j1, j2, ..., jm` agrees with greedy on the first `r` choices but not the `(r+1)`-th. Because `i(r+1)` was chosen by sorting on finish time among everything still compatible with `i1..ir`, and `j(r+1)` was also compatible with `j1..jr = i1..ir`, `i(r+1)` finishes no later than `j(r+1)`. Replacing `j(r+1)` with `i(r+1)` in the optimal solution cannot create a new overlap (every later job in the optimal solution was already compatible with the later-or-equal-finishing `j(r+1)`, so it stays compatible with the earlier-or-equal-finishing `i(r+1)`), and it does not shrink the solution. Repeating this swap at most `m` times turns any optimal solution into the greedy one without ever losing an interval, so greedy is itself optimal.

### Why binary search needs the finish-sorted order

`p(j)`, the predecessor of job `j`, is defined as the largest index `i < j` whose job ends no later than job `j` starts. That definition only turns into a binary search because the jobs are sorted by finish time first: the array of finish times is then non-decreasing, so "the largest finish time that is still `<=` job j's start" is exactly the kind of query binary search answers in O(log n). Without the finish-time sort, there is nothing monotonic to search over.

### The room algorithm's priority-queue accounting

Each of the `n` bookings causes exactly one priority-queue operation: either an `INSERT` (opening a room) or an `INCREASE-KEY`/replace (reusing one), and the initial `FIND-MIN` to decide which. That is `O(n)` heap operations at `O(log n)` each, plus the `O(n log n)` sort by start time — the sort and the heap operations are the same order, so neither dominates the other asymptotically.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the four greedy rules on the ten real bookings (5, 3 and 4 kept), the separate eight-booking trap for fewest-conflicts-first (3 against 4), the merge and insertion on a six-interval synthetic set, the min-heap and the +1/−1 sweep agreeing on 3 rooms for the ten bookings, and the weighted DP reaching 29 against the greedy set's own 28. Re-run it with a different seeded set of bookings (keep the half-open convention) and check that the heap's final size still equals the independently-computed depth — that equality is the one invariant this whole topic rests on, and it is worth seeing it hold on more than one data set.

</section>

<section data-section="production">

## In production

**Apache Flink's session windows** (Flink 2.3.0 documentation, "Windows") are exactly this topic's merge pass, running inside a stream processor: "Internally, a session window operator creates a new window for each arriving record and merges windows together if they are closer to each other than the defined gap." The windowing *semantics* around this (event time versus processing time, watermarks, late firings) belong to Data Engineering's own windowing topics; this topic only shows that the merge mechanism itself is the one from the first half of the reel.

**PostgreSQL's range types** (`int4range`, `int8range`, `daterange`) default to the same half-open convention this topic uses throughout: "The built-in range types int4range, int8range, and daterange all use a canonical form that includes the lower bound and excludes the upper bound; that is, [)." The tie rule this topic picks once and never mixes with a closed-interval convention is not an arbitrary classroom choice — it is the same default a production database ships.

</section>

<section data-section="frontier">

## The frontier

This topic's whole subject — every job needs exactly one interval — stays polynomial throughout. The moment a job needs a *set* of several disjoint time intervals instead of one, the picture changes: Kleinberg and Tardos's exercise on Multiple-Interval Job Scheduling is NP-complete, shown by a reduction from Independent Set (one job per graph vertex, one disjoint time interval per graph edge, so that accepting `k` jobs without any interval overlap is possible exactly when the graph has an independent set of size `k`). The three-candidate-greedy-rules trap this topic builds by hand generalizes into a much larger subject (approximation and inapproximability for scheduling variants), named here and left for later chapters.

Interval trees answer a different question from everything built in this topic: given a large, stored set of intervals, which of them overlap one new query interval, answered in `O(log n + r)` for `r` results, repeatedly, as the stored set stays fixed. Every algorithm in this topic answers a batch question over the *whole* set once. Interval trees are Chapter 4's subject (skipped in this curriculum) and are named here only.

</section>

<section data-section="next">

## Where this goes next

The next topic, Sweep-line algorithms, generalizes the `+1/−1` walk from this topic's own room-scheduling bridge into a full method: an event queue, an active set, and a tie rule, applied to skylines, rectangle union area and segment intersection. Chapter 21 teaches exchange arguments and matroids in general, of which this topic's own proof is one instance; Chapter 22 teaches DP state design in general, of which `OPT(j)` is one instance. Data Engineering's own interval and range join algorithms (`de.point-in-time-as-of-joins` is live; the join-algorithms chapter is §2.3) pick up the database side of the half-open convention this topic shares with PostgreSQL.

</section>
