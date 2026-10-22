# Outline — Hash vs sort aggregation (`de.hash-sort-aggregation`)

## Learning outcomes (from CHAPTER.md entry 22)
- Explain why `HashAggregate` wins at low group cardinality and why sort-based `GroupAggregate` can win once group count approaches row count — a real measured crossover, not a rule of thumb.
- Read a parallel aggregate plan's `Partial Aggregate`/`Finalize Aggregate` (or `Finalize GroupAggregate`) split and explain what each stage computes.
- Recognize a hash aggregation spilling to disk from `EXPLAIN (ANALYZE)`'s own batch/partition count, the same signal topic 21 used for a spilling hash join.
- State why a `DISTINCT` aggregate and parallel aggregation don't mix, and why a `DISTINCT` aggregate here is measured taking a sort-based path.

## Bridge / handoff
- **Bridge** (from topic 21): "A join is decided. The same build/probe vs. sorted-input choice happens one level up, for GROUP BY — next."
- **Handoff** (to topic 23): "Every mechanism so far has assumed a plan, once chosen, runs as written. Next: what happens when the query itself is rewritten before the planner ever sees the shape the SQL text described."

## Running example
`agg_demo` schema in the `shop` database (same database topics 19–21 measured in): `sales`, 2,000,000 rows, with two group columns on the same table — `low_card` (100 distinct values) and `high_card` (1,500,000 distinct values, close to the row count) — letting one table demonstrate both ends of the group-cardinality spectrum, the same structural choice topic 21's `join_demo` schema made for join selectivity.

## Engagement arc
Three predict/reveal pairs (the low-cardinality winner; the high-cardinality crossover; the DISTINCT aggregate's path) plus two closing "Prove it" questions — comparable density to topic 21.

## Storyboard

1. **Hook.** Same table, same `GROUP BY` shape, two different group columns. One runs in well under a second with a hash table. The other, with far more groups, runs slower — and the faster plan for it isn't the hash table at all.
2. **Predict: 100 groups.** `GROUP BY low_card`, 100 distinct values out of 2,000,000 rows. Hash aggregation builds one entry per group in memory; sort-based aggregation sorts every row first, then walks the sorted stream grouping as it goes. Which wins at 100 groups?
3. **Reveal.** `HashAggregate`: 558.673 ms, one small hash table, no spill. Forced `GroupAggregate` (sort first): 1174.777 ms — the sort alone spills over 40MB to disk before grouping can even start. Hash wins by about 2.1×.
4. **Mechanism: hash aggregation.** One hash table entry per distinct group value, built while scanning once; a row's group is looked up, not searched for, so cost scales with the number of *groups*, not the number of *rows* sorted.
5. **Mechanism: sort-based (streaming) aggregation.** Sort the rows on the group key first — by an index, or an explicit sort — then walk the sorted stream, closing out one group's running total exactly when the key changes; needs no hash table at all, but pays for the sort up front regardless of how many groups there turn out to be.
6. **Predict: 1,500,000 groups.** Same table, same row count, but now grouping on a column with almost as many distinct values as there are rows. Does hash aggregation still win?
7. **Reveal.** `HashAggregate` is still the planner's default choice, but it spills: 64 partitions, 321 batches, over 60MB to disk, 2479.537 ms. Forced `GroupAggregate`: 1737.653 ms — the sort's own disk cost didn't change from step 3 (same row count), but now it's *cheaper* than a hash table that's outgrown its memory this badly. The crossover, measured directly.
8. **Mechanism: the crossover.** Sort-based aggregation's cost tracks the number of rows; hash aggregation's cost (once it starts spilling) tracks the number of groups relative to available memory. As group count climbs toward row count, hash aggregation keeps paying more while sort-based aggregation's bill stays the same.
9. **Mechanism: parallel aggregation.** Each worker aggregates its own slice into partial results (`Partial Aggregate`); the leader merges those partial results into the final answer (`Finalize Aggregate`). Measured: with 2 workers, the whole low-cardinality query finishes in 260.757 ms — faster than even the single-worker hash case in step 3.
10. **Predict: DISTINCT and parallelism.** `COUNT(DISTINCT low_card)` on the same table. The docs say parallel aggregation isn't supported when an aggregate contains `DISTINCT`. What path does the planner take instead?
11. **Reveal.** A plain `Aggregate` over an explicit `Sort` (which itself spills over 23MB to disk) — no hash table, no parallel workers, just a sort to deduplicate before counting. 651.016 ms.
12. **Mechanism: why DISTINCT breaks the pattern.** A `DISTINCT` aggregate needs every row deduplicated before the aggregate function ever runs, which `work_mem`'s own documented list of what sort operations are for (`ORDER BY`, `DISTINCT`, merge joins) already hints at — sorting, not hashing, is the path PostgreSQL reaches for here.
13. **Recap.** Three questions before trusting an aggregate's plan: how many groups relative to how many rows, is the query running in parallel, and does any aggregate carry a `DISTINCT`.
14. **Prove it · 1 of 2.** Given a GROUP BY with very few distinct groups relative to row count, predict which aggregation strategy wins.
15. **Prove it · 2 of 2.** Given an `EXPLAIN` plan showing a `HashAggregate` reporting more than one batch, explain what that means.

## Claims list (source for each)

| # | Claim | Source |
|---|---|---|
| 1 | `enable_hashagg` default on | runtime-config-query.txt |
| 2 | `work_mem` budgets both sorts and hash tables; sort operations used for ORDER BY, DISTINCT and merge joins | runtime-config-resource.txt |
| 3 | Parallel aggregation's two-stage design: Partial Aggregate per worker, Finalize Aggregate on the leader | parallel-plans.txt |
| 4 | Parallel aggregation unfavorable when groups are many relative to input rows | parallel-plans.txt |
| 5 | Parallel aggregation not supported when an aggregate contains DISTINCT or ORDER BY | parallel-plans.txt |
| 6 | Plans add nodes above scans for aggregation, joining, sorting | using-explain.txt |
| 7 | Hash wins at low cardinality (558.673ms vs 1174.777ms forced sort) | examples.py, this topic's SOURCES.md |
| 8 | Sort wins at high cardinality — the crossover (2479.537ms hash vs 1737.653ms forced sort) | examples.py, SOURCES.md |
| 9 | Parallel partial/finalize aggregation measured faster than single-worker hash (260.757ms) | examples.py, SOURCES.md |
| 10 | COUNT(DISTINCT) measured taking a sort-based path, not hash | examples.py, SOURCES.md |

## Post-notes headings (planned)
Outcomes; Into the internals (why sort cost tracks rows and hash cost tracks groups-under-memory-pressure; the `GroupAggregate`-as-finalize detail in the parallel plan; `GROUPING SETS` and two-phase aggregation's own limits); In production (reading a spilling HashAggregate; when to force `enable_hashagg=off`; the PostgreSQL 19 eager-aggregation-below-joins pointer); Next (handoff to topic 23).

## Concept ledger
Introduces: `hash-aggregation`, `sort-aggregation`, `partial-aggregation`. Uses: `hash-join`, `merge-join`, `work-mem-spill`. Declared: `sql-select`, `group-by`.

## Changes from the chapter plan
None — followed CHAPTER.md entry 22 as written (which this session also wrote, immediately before starting research, per section 1 of the skill: entry 22 did not exist yet since topic 21 was the chapter's last entry).
