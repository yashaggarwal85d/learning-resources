Fetched: 2026-10-22.

## Trino documentation, "EXPLAIN"

URL: https://trino.io/docs/current/sql/explain.html

> Fragments separation represent the data exchange between Trino nodes.

> HASH

> Fragment is executed on a fixed number of nodes with the input data distributed using a hash function.

> BROADCAST

> Fragment is executed on a fixed number of nodes with the input data broadcasted to all nodes.

## Apache Spark 3.5.9 documentation, "Performance Tuning"

URL: https://spark.apache.org/docs/3.5.9/sql-performance-tuning.html

> Configures the maximum size in bytes for a table that will be broadcast to all worker nodes when performing a join. By setting this value to -1, broadcasting can be disabled.

> Configures the number of partitions to use when shuffling data for joins or aggregations.

> AQE converts sort-merge join to broadcast hash join when the runtime statistics of any join side is smaller than the adaptive broadcast hash join threshold.

## PostgreSQL 18 documentation, "19.7. Query Planning"

URL: https://www.postgresql.org/docs/18/runtime-config-query.html

> Enables or disables the query planner's use of partitionwise join, which allows a join between partitioned tables to be performed by joining the matching partitions.

> With this setting enabled, the number of nodes whose memory usage is restricted by work_mem appearing in the final plan can increase linearly according to the number of partitions being scanned.

## Measured directly

URL: n/a — executed locally, not a web source.

Two tables, `pw_orders` (8,000,000 rows) and `pw_customers` (2,000,000 rows), both range-partitioned into 4 partitions on the same `region` column (0–24, 25–49, 50–74, 75–99), with every order's `customer_id` constructed so it lands in the same region partition as its customer — so a join on `region AND customer_id` can, in principle, be done entirely partition-by-partition with no cross-partition matching needed (confirmed: the join returns exactly 8,000,000 matched rows under both settings below, the same answer either way).

- `EXPLAIN` with `enable_partitionwise_join = off`: one `Hash Join` sits above an `Append` of all 4 order partitions, with a single `Hash` node built from an `Append` of all 4 customer partitions (one combined hash table over all 2,000,000 customer rows).
- `EXPLAIN` with `enable_partitionwise_join = on`: an `Append` of 4 separate `Hash Join` nodes, each joining one order partition against its own matching customer partition directly — 4 smaller hash tables (500,000 rows each) instead of 1 large one (2,000,000 rows).
- At `work_mem = 16MB`, `max_parallel_workers_per_gather = 0`: with partition-wise join off, the single combined hash table doesn't fit and spills (`EXPLAIN (ANALYZE, BUFFERS)` reports `Batches: 4, Memory Usage: 31633kB, temp written=6589kB` on the Hash node) — three repeated runs of the full query: 4619.117 ms / 4621.824 ms / 4363.915 ms. With partition-wise join on, each of the 4 smaller hash tables fits in the same `work_mem` without spilling (`Batches: 1, Memory Usage: 27534kB` on each of the 4 Hash nodes) — three repeated runs: 3684.680 ms / 3497.753 ms / 3699.608 ms.
- With PostgreSQL's own default settings (parallel workers on, ample `work_mem`), the two plans' wall-clock times converge (partition-wise off: 1387.614 ms / 1421.772 ms; partition-wise on: 1556.110 ms / 1407.918 ms) — the structural difference (plan shape, per-partition hash table size) is real and directly observable either way, but it only translates into a clear wall-clock win here once memory pressure actually forces a spill on the non-partition-wise plan.
