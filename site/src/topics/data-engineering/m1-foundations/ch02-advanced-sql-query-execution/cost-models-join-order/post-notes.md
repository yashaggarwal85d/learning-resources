---
id: de.cost-models-join-order
title: Cost models and join-order search
---

<section data-section="outcomes">

## After this topic you can

- Compute a Seq Scan's estimated cost by hand from `pg_class` and the five planner cost constants.
- Explain why join-order search space grows the way it does, with a real computed count, not a hand-waved "it's big."
- Predict when a small `join_collapse_limit`/`from_collapse_limit` will stop the planner from fixing a badly-ordered query, and use `join_collapse_limit = 1` deliberately to pin a join order.
- State what `geqo_threshold` controls and what trade-off GEQO makes.

</section>

<section data-section="internals">

## Into the internals

### What "near-exhaustive" actually enumerates

PostgreSQL's planner is "first introduced in IBM's System R database" (PostgreSQL 18 docs, §61.1) and fills in costs bottom-up: every single table's cheapest access paths first, then every pair that has a join condition, then every triple built from a cheaper pair plus one more table, and so on, keeping (at each size) only the cheapest plan for each distinct set of tables reached so far — not every distinct *order*, which is what makes dynamic programming over subsets tractable at all even though the number of raw orders (this topic's own computed counts: 17.3 million at 8 tables, 28.2 trillion at 12) is not. The reel's join-order-tree count measures the raw search space a naive enumeration would face; the DP table is smaller than that by reusing the best plan for each subset instead of redoing the work for every order that reaches it, but the DP table itself still grows large enough, and takes long enough to fill, that PostgreSQL's own docs call the result "an enormous amount of time and memory space" for a large join (§61.1) — which this topic observed directly at 16 tables.

### Bushy vs. left-deep, and why this topic didn't need the distinction

The reel's join-order-tree count (verified by brute-force enumeration, `(2n-2)!/(n-1)!`) counts every binary tree shape, including "bushy" trees where two multi-table sub-joins meet in the middle, not just "left-deep" chains where each join adds one more table to a growing left side. PostgreSQL's planner considers both shapes. This topic's own `cost_demo` queries are simple equality chains where a left-deep plan is already optimal, so the distinction never showed up in a measured number here — it's a real part of the search space the planner explores, just not one this topic's schema was built to demonstrate.

### `from_collapse_limit` and `join_collapse_limit` are structural, not just a planning-time dial

Both default to 8 and "do almost the same thing: one controls when the planner will 'flatten out' subqueries, and the other controls when it will flatten out explicit joins" (PostgreSQL 18 docs, §14.3). Flattening is what turns a nested tree of explicit `JOIN`s into a single flat `FROM` list the planner is free to reorder; below the limit, the whole list collapses and every order is open; above it, PostgreSQL keeps part of the written structure as a boundary the search can't cross. This topic's measured 9-table example (§14.3's own docs give a 5-tables-out-of-a-factor worked example; this topic's is a full before/after cost) shows the two-sided nature of the knob: a too-small limit can lock in a bad order (23,837.70), but the same small default did no harm when the written order was already close to optimal (1,700.90 vs. the unconstrained 1,697.40).

### GEQO's own doubt about its approach

PostgreSQL's docs for GEQO include a passage this topic didn't quote in the reel but is worth reading directly: the implementation frames join ordering as the travelling salesman problem, but "it is not clear that solving query optimization with a GA algorithm designed for TSP is appropriate. In the TSP case, the cost associated with any substring (partial tour) is independent of the rest of the tour, but this is certainly not true for query optimization" (§61.3). PostgreSQL ships GEQO as the practical answer to an otherwise-infeasible search, while documenting its own reservation about the fit — a rare instance of a system's own docs flagging a known weakness in its own heuristic rather than presenting it as a clean solution.

### A pointer, not a claim: Volcano and Cascades

The syllabus also names a different optimizer lineage — Graefe and McKenna's Volcano, later generalized as the Cascades framework — which searches top-down with rule-based transformations and memoization, rather than PostgreSQL's bottom-up dynamic programming. This topic could not find a primary source it could fetch and quote verbatim in this session, so no claim about Volcano/Cascades internals appears in the reel or above; if you want to go further, search for Graefe's own papers on the Volcano optimizer generator and the Cascades framework for query optimization.

</section>

<section data-section="production">

## In production

- A query that takes longer to *plan* than to run is a `join_collapse_limit`/`geqo_threshold` question, not an execution-time question — check `EXPLAIN`'s own planning time (via `EXPLAIN (ANALYZE)`'s "Planning Time" line) before assuming the slowness is in the executor.
- If a hand-written query joins many tables and you already know a good order, `SET join_collapse_limit = 1` and write that order explicitly — don't fight the planner's default reordering by restructuring the SQL instead.
- Raising `geqo_threshold` past a query's own FROM-item count forces exhaustive search even above 12 tables; useful to confirm whether GEQO is actually costing you plan quality on a specific slow query, at the price of a much longer planning time — this topic's own 14-table measurement (36.1 seconds) is a caution against doing this casually in production.
- `random_page_cost` is the first constant worth checking on unfamiliar hardware: its default (4.0) assumes most random reads hit cache; an all-SSD, fully-cached system is often better served lowering it toward `seq_page_cost`, exactly as the docs themselves suggest.

</section>

<section data-section="next">

## Next

The order of the joins is decided. Next: what actually happens inside each one — nested loop, hash, or sort-merge — and how cardinality, existing sort order, memory and equality vs. inequality predicates decide which.

</section>
