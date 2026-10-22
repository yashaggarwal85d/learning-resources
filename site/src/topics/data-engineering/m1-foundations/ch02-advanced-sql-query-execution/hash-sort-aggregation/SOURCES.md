# Sources

Quotes are copied word for word from the fetched text in `sources/` (`node scripts/sources.mjs fetch <url> <path>`), checked with `node scripts/sources.mjs check`.

## PostgreSQL 18 docs, §19.7.1 "Planner Method Configuration" (`runtime-config-query.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE
Version: PostgreSQL 18 (current stable)

> Enables or disables the query planner's use of hashed aggregation plan types. The default is on.

## PostgreSQL 18 docs, §19.4.1 "Memory" (`runtime-config-resource.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM
Version: PostgreSQL 18 (current stable)

> Sets the base maximum amount of memory to be used by a query operation (such as a sort or hash table) before writing to temporary disk files. If this value is specified without units, it is taken as kilobytes. The default value is four megabytes (4MB).

> Sort operations are used for ORDER BY, DISTINCT, and merge joins. Hash tables are used in hash joins, hash-based aggregation, memoize nodes and hash-based processing of IN subqueries.

## PostgreSQL 18 docs, §15.3.3 "Parallel Aggregation" (`parallel-plans.txt`)

URL: https://www.postgresql.org/docs/current/parallel-plans.html#PARALLEL-AGGREGATION
Version: PostgreSQL 18 (current stable)

> PostgreSQL supports parallel aggregation by aggregating in two stages. First, each process participating in the parallel portion of the query performs an aggregation step, producing a partial result for each group of which that process is aware. This is reflected in the plan as a Partial Aggregate node. Second, the partial results are transferred to the leader via Gather or Gather Merge. Finally, the leader re-aggregates the results across all workers in order to produce the final result. This is reflected in the plan as a Finalize Aggregate node.

> Because the Finalize Aggregate node runs on the leader process, queries that produce a relatively large number of groups in comparison to the number of input rows will appear less favorable to the query planner.

> Parallel aggregation is not supported if any aggregate function call contains DISTINCT or ORDER BY clause and is also not supported for ordered set aggregates or when the query involves GROUPING SETS.

## PostgreSQL 18 docs, §14.1 "Using EXPLAIN" (`using-explain.txt`)

URL: https://www.postgresql.org/docs/current/using-explain.html
Version: PostgreSQL 18 (current stable)

> If the query requires joining, aggregation, sorting, or other operations on the raw rows, then there will be additional nodes above the scan nodes to perform these operations.

## Measured directly (this topic's own schema, real PostgreSQL 16 instance)

URL: n/a — executed locally, not a web source
Version: PostgreSQL 16.15 (the CI/sandbox build available to this session; PostgreSQL 18, the chapter's engine of record, documents the same `enable_hashagg`, `work_mem` and parallel-aggregation mechanics measured below. The syllabus's "eager aggregation pushed below joins" names a PostgreSQL 19 beta feature that does not exist on this PostgreSQL 16 instance and could not be measured — see FACT-CHECK.md.)

Notes (not quotes — this topic's own executed measurements; see `examples.py` for the exact numbers asserted). Schema `agg_demo` in the `shop` database used by topics 19–21: `sales` (2,000,000 rows, `low_card` — 100 distinct values, `high_card` — 1,500,000 distinct values, `amount`).

- **Low cardinality (100 groups), single worker (`max_parallel_workers_per_gather = 0`).** Default planner: `HashAggregate`, 1 batch, execution time **558.673 ms**. Forced sort-based (`enable_hashagg = off`): `GroupAggregate` over an explicit `Sort` that spilled to disk (`Sort Method: external merge  Disk: 41104kB`), execution time **1174.777 ms** — hash aggregation about 2.1× faster here.
- **High cardinality (1,500,000 groups out of 2,000,000 rows), single worker.** Default planner: `HashAggregate` still chosen, but spilling — `Planned Partitions: 64  Batches: 321  Disk Usage: 61408kB`, execution time **2479.537 ms**. Forced sort-based: `GroupAggregate` over a `Sort` that also spilled (`Disk: 41104kB`, the same sort cost as the low-cardinality case, since sorting cost depends on row count, not group count), execution time **1737.653 ms** — the crossover: sort-based aggregation about 1.43× faster once group count approaches row count, the opposite result from the low-cardinality case above.
- **Parallel aggregation, low cardinality, default worker count (2 workers).** `Finalize GroupAggregate` → `Gather Merge` → `Sort` → `Partial HashAggregate` (×2 workers, each `Batches: 1`) → `Parallel Seq Scan`. Execution time **260.757 ms** — faster than even the single-worker `HashAggregate` case above, each worker running its own partial hash aggregation before the leader merges the sorted partial results.
- **`COUNT(DISTINCT low_card)`, single worker.** Plan: `Aggregate` over an explicit `Sort` that spilled to disk (`Sort Method: external merge  Disk: 23528kB`), execution time **651.016 ms** — a `DISTINCT` aggregate here took a sort-based dedup path rather than a hash-based one, consistent with the documented rule that `DISTINCT` aggregates are excluded from the parallel hashed path described above.
