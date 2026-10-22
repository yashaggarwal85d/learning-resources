## After this topic you can

- Explain why `HashAggregate` wins at low group cardinality and why sort-based `GroupAggregate` can win once group count approaches row count — a real measured crossover, not a rule of thumb.
- Read a parallel aggregate plan's `Partial Aggregate`/`Finalize Aggregate` (or `Finalize GroupAggregate`) split and explain what each stage computes.
- Recognize a hash aggregation spilling to disk from `EXPLAIN (ANALYZE)`'s own batch/partition count, the same signal topic 21 used for a spilling hash join.
- State why a `DISTINCT` aggregate and parallel aggregation don't mix, and why a `DISTINCT` aggregate here is measured taking a sort-based path.

## Into the internals

### Why the crossover happens where it happens

This topic's own measurements found hash aggregation about 2.1× faster at 100 groups and sort-based aggregation about 1.43× faster at 1,500,000 groups, on the exact same 2,000,000-row table. The reason isn't a coincidence of this schema: a sort's cost is dominated by the number of rows it has to order, which never changed between the two measurements (both `GroupAggregate` plans reported the identical `41104kB` of external-merge disk spill). A hash table's cost, once it stops fitting in `work_mem` × `hash_mem_multiplier`, is dominated by how many distinct groups it has to track — and 1,500,000 groups is a much bigger table than 100 groups, however many rows feed either one. The crossover point itself (somewhere between "fits easily" and "barely fits in a table this big") isn't a fixed number of groups; it depends on `work_mem`, row width, and how much memory is actually available, which is exactly why PostgreSQL's planner has to estimate it per query rather than hard-coding a threshold.

### The finalize step is a `GroupAggregate`, not a second `HashAggregate`

This topic's own measured parallel plan read `Finalize GroupAggregate`, not `Finalize HashAggregate`, sitting above a `Gather Merge` and a `Sort`. Each worker's `Partial HashAggregate` produces one partial result per group *it* saw, but different workers can see the same group, so the leader still has to combine matching partial results across workers. PostgreSQL does that combination by sorting the partial results on the group key (hence the `Sort` feeding into `Gather Merge`) and walking them the same way an ordinary `GroupAggregate` would — streaming aggregation reappears here as the finalize mechanism, even though hash aggregation was what each worker used to build its own partial results in the first place.

### `GROUPING SETS` and why two-phase aggregation has limits

PostgreSQL's own documentation (quoted in `SOURCES.md`) excludes `GROUPING SETS` queries, along with `DISTINCT` and `ORDER BY` aggregates, from parallel aggregation entirely. `GROUPING SETS` (and its `ROLLUP`/`CUBE` shorthand, covered in an earlier topic in this chapter) computes several different groupings in one pass over the same rows; combining partial results across workers for several groupings at once is a harder problem than combining them for one, which is presumably why PostgreSQL's planner doesn't attempt it in parallel at all rather than attempting a partial version. This topic didn't measure a `GROUPING SETS` query directly — the point is covered by the documented exclusion, not a separate measurement, since the aggregate-cardinality mechanics this topic does measure (hash vs. sort, partial vs. finalize) are unaffected by which specific aggregates are being computed.

### Eager aggregation pushed below joins (a forward pointer, not a claim)

The syllabus names "eager aggregation pushed below joins" as a PostgreSQL 19 beta feature — rewriting a query so that an aggregate runs on one side of a join before the join happens, rather than after, when that's provably equivalent and cheaper. This session's PostgreSQL instance is version 16.15, where the feature doesn't exist in any form `EXPLAIN` could show, so nothing about its mechanics or performance is claimed here. If you want to go further once PostgreSQL 19 is generally available, its release notes are the place to check what shape this optimization actually takes and what `EXPLAIN` shows for it.

## In production

- A `HashAggregate`'s batch or partition count in `EXPLAIN (ANALYZE)` is the direct signal that it spilled, exactly like a spilling hash join's batch count (topic 21): more than one means it didn't fit in memory.
- If a `GROUP BY` is known to produce close to as many groups as rows, `SET enable_hashagg = off` on just that query is worth trying before assuming the planner's default hash-based plan is the fastest option — this topic's own high-cardinality measurement found the opposite of that assumption.
- A query with `COUNT(DISTINCT ...)` or any other `DISTINCT` aggregate will not benefit from adding parallel workers to it; if that query is slow, look at the sort it's paying for instead.
- Parallel aggregation is unlikely to help a query whose groups are a large fraction of its rows (the docs' own reasoning: the leader's `Finalize Aggregate` step then has almost as much work as a single-worker plan would), so adding workers isn't a universal fix for a slow aggregate.

## Next

Every mechanism so far has assumed a plan, once chosen, runs as written. Next: what happens when the query itself is rewritten before the planner ever sees the shape the SQL text described.
