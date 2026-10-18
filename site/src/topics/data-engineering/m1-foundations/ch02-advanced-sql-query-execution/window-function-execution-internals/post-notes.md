---
id: de.window-function-execution-internals
title: Window function execution internals
---

<section data-section="outcomes">

## After this topic you can

- Explain why a window query beats the equivalent correlated-subquery/self-join formulation, with the complexity argument the original window-operator paper itself makes.
- Name the four aggregation strategies a window executor can use over a frame — naive, cumulative, removable cumulative, segment tree — and say which frame shapes force the engine up to the next one.
- Explain how a planner avoids re-sorting the same data for two window definitions that share a partition/order clause.
- Describe, at a high level, how a window operator parallelizes across partitions and what a skewed partition does to that plan.

</section>

<section data-section="internals">

## Into the internals

Topic 10 defined what a window and a frame mean. This topic is about what the engine actually has to *do*, physically, to deliver a window function's answer for every row — and why that mechanism, done right, beats writing the same question as ordinary joins and subqueries by more than a small margin.

### Why a window beats the self-join / correlated-subquery version

The paper that first gave a detailed account of an efficient window operator opens with exactly this comparison. Its example — normalizing a measurement against the average and standard deviation of nearby readings at the same location — can be written with window functions, or, "without window function support," as two correlated subqueries re-running an aggregate per outer row:

```sql
-- window version: one pass, one frame per row
avg(value) OVER (PARTITION BY location ORDER BY time RANGE BETWEEN 5 PRECEDING AND 5 FOLLOWING)

-- correlated-subquery version: re-aggregates from scratch for every outer row
(SELECT avg(value) FROM measurement m2
 WHERE m2.time BETWEEN m.time - 5 AND m.time + 5 AND m.location = m2.location)
```

"In this formulation, correlated subqueries are used to compute the aggregates, which in most query processing engines results in very slow execution times due to **quadratic** complexity" (Leis, Kundhikanjana, Kemper, Neumann, "Efficient Processing of Window Functions in Analytical SQL Queries," PVLDB 8(10), 2015). Every output row's subquery re-scans and re-aggregates its neighborhood independently, with no memory of the work the previous row's subquery just did — the self-join equivalent has the identical problem, since a join of `measurement` to itself on a range condition re-finds and re-aggregates overlapping neighborhoods for every row. A single sorted pass that *reuses* work between adjacent rows (the algorithms below) turns that quadratic cost into something close to linear.

### Four ways to aggregate over a frame, from worst to best

Once rows are partitioned and sorted, a frame-sensitive aggregate (a running sum, a moving average) still has to decide, per row, how to combine the frame's values — and the obvious way is not the fast way (same source, §4.3):

1. **Naive.** Loop over every row in the frame and recompute from scratch, every time. "The inherent problem... is that it often performs redundant work, resulting in quadratic runtime" — a running sum over the whole history to date redoes the entire sum for every single row.
2. **Cumulative.** Keep the previous row's aggregate and previous frame bounds; as long as the frame only *grows* (or stays the same), add just the new rows to the running result instead of starting over. "This algorithm is used by PostgreSQL and works well for some frequently occurring queries, e.g., the default framing specification (`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`)" — precisely topic 10's default frame. It stops working the moment a frame can *shrink* too (a moving window like `ROWS BETWEEN 5 PRECEDING AND 5 FOLLOWING`), because when the window's trailing edge moves past rows that must now be dropped, the cached result cannot take them back out, so it has to be rebuilt from scratch.
3. **Removable cumulative.** Allow removing rows from the cached aggregate, not just adding them — for `sum`/`count`/`avg`, removal is just subtraction, so a sliding frame stays close to linear; for `min`/`max` it needs "an ordered search tree of all entries in the previous window," which is "significantly more expensive." This handles most moving-average-style queries well, but "queries with non-constant frame bounds... can be a problem: in the worst case, the frame bounds vary very strongly between neighboring tuples, such that the runtime becomes O(n²)" again.
4. **Segment tree.** A dedicated structure storing precomputed aggregates for sub-ranges of the whole partition, which "allows to evaluate an aggregate over an arbitrary frame in O(log n)" regardless of how wildly the frame's bounds move from row to row — the general-purpose fallback when the frame shape defeats the cheaper three.

The engineering lesson generalizes past this one paper: a frame that only grows is cheap by construction (cumulative); a frame that slides by a roughly fixed width is still cheap with a removable technique; a frame whose bounds move unpredictably needs a real data structure, not a running total, to stay out of quadratic territory.

### Reusing one sort for several windows

A query with two window functions that share the same `PARTITION BY`/`ORDER BY` (even under different names, or with different frames) only needs **one** sort of the data, not two. PostgreSQL's planner builds this in directly: it "sort[s] active windows by their partitioning/ordering clauses, ignoring any framing clauses, so that the windows that need the same sorting are adjacent in the list. When we come to generate paths, this will avoid inserting additional Sort nodes" — and further, "if the entire list of clauses of one window is a prefix of another, put first the window with stronger sorting requirements... and won't have to sort again for the weaker one" (`src/backend/optimizer/plan/planner.c`, `select_active_windows`). The underlying idea — detect and exploit shared partitioning/ordering across multiple window expressions in one query — was first studied in depth by Cao, Chan, Li and Tan, "Optimization of Analytic Window Functions," PVLDB 5(11), 2012, which the Leis et al. paper credits directly as "orthogonal" groundwork its own algorithm builds on top of. Since "partitioning and sorting usually dominate the overall query execution time, avoiding these phases can be very beneficial" (Leis et al.) — reusing a sort isn't a minor tidy-up, it's often removing the single most expensive phase of the whole operator, twice over.

### Parallelizing across partitions, and what skew does to it

Each partition's rows must stay together and in order for a window function to be correct, which makes the natural unit of parallel work a *whole partition*: "**inter-partition parallelism**... assign[s] different threads to different... partitions" (Leis et al., §3), This works well exactly as long as partitions are reasonably even in size. The failure mode is **skew**: one customer, one location, one key with far more rows than any other hands one worker a disproportionate share of the work while every other worker finishes early and sits idle. Leis et al.'s answer is **intra-partition parallelism**: splitting one oversized partition's own sorted range across several threads for the parts of the algorithm (sorting, segment-tree construction) that can tolerate it, so the operator is "resistant to skew" instead of assuming partitions arrive evenly sized. How far a given engine goes in splitting a single huge partition varies, so read its plan and its documentation rather than assuming it does.

</section>

<section data-section="lab">

## Build, break, measure

### Try it · Watch a shared sort disappear from the plan

1. **Confirm sort reuse.** Write a query with two window functions over the same `PARTITION BY customer_id ORDER BY event_time` (say, a running sum and a running count, as in topic 10's named-window example) and run `EXPLAIN`. Confirm there is exactly one `Sort` (or `WindowAgg` reading an already-sorted input) feeding both, not two. Then add a third window function with a genuinely different `PARTITION BY` and confirm a second `Sort` now appears specifically for it.
2. **Feel the quadratic alternative.** Rewrite one moving-average window query (`ROWS BETWEEN 5 PRECEDING AND 5 FOLLOWING`) as the equivalent correlated subquery over `orders`/`page_views`, and compare `EXPLAIN ANALYZE` wall-clock time at increasing table sizes (*measure in build* for the actual numbers, but expect the subquery version's time to grow much faster than linearly with row count while the window version stays close to linear).
3. **Reproduce partition skew.** Build a `page_views` sample where one `customer_id` has far more rows than any other (an extreme-skew customer), run a windowed aggregate `PARTITION BY customer_id`, and compare the per-partition work needed for that one customer against a typical one — note, from the discussion above, that this is exactly the situation inter-partition parallelism alone cannot balance.

</section>

<section data-section="production">

## In production — a review checklist

- **Prefer a window function over an equivalent correlated subquery or self-join** whenever the question is "compare this row to its neighbors" — the complexity gap is not usually marginal.
- **Give window functions that share a partition/order clause the same `PARTITION BY`/`ORDER BY` text (or a shared named window), so the planner's sort-reuse detection actually fires** — subtly different but logically-equivalent clauses can defeat it.
- **Watch for non-constant, wildly varying frame bounds** (a frame defined by a value in another column, rather than a fixed offset) — these are exactly the shape that defeats the cumulative and removable-cumulative algorithms and forces the engine toward a slower fallback.
- **Expect one oversized partition to bottleneck a parallel window query**, and consider pre-aggregating or splitting an extreme-skew key out of the main query if its partition dominates the runtime.

</section>
