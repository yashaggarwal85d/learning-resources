Fetched: 2026-10-22.

## PostgreSQL 18 documentation, §5.12 "Table Partitioning"
URL: https://www.postgresql.org/docs/18/ddl-partitioning.html
> With partition pruning enabled, the planner will examine the definition of each partition and prove that the partition need not be scanned because it could not contain any rows meeting the query's WHERE clause. When the planner can prove this, it excludes (prunes) the partition from the query plan.

> Partition pruning can be performed not only during the planning of a given query, but also during its execution.

> It is possible to determine the number of partitions which were removed during this phase by observing the "Subplans Removed" property in the EXPLAIN output.

> Dropping an individual partition using DROP TABLE, or doing ALTER TABLE DETACH PARTITION, is far faster than a bulk operation. These commands also entirely avoid the VACUUM overhead caused by a bulk DELETE.

> Too many partitions can mean longer query planning times and higher memory consumption during both query planning and execution, as further described below.

> The query planner is generally able to handle partition hierarchies with up to a few thousand partitions fairly well, provided that typical queries allow the query planner to prune all but a small number of partitions.

## BigQuery documentation, "Introduction to clustered tables"
URL: https://cloud.google.com/bigquery/docs/clustered-tables
> Clustered tables in BigQuery sort data in storage blocks based on the values in user-defined clustered columns. Clustering can improve query performance and reduce costs, because queries that filter or aggregate by clustered columns scan only the relevant blocks, not the entire table or partition.

> Colocation occurs at the level of the storage blocks, and not at the level of individual rows; for more information on colocation in this context, see Clustering.

## Measured directly
URL: n/a — executed locally, not a web source.

**Plan-time partition pruning, PostgreSQL 16.15.** A range-partitioned table (`part_demo_monthly`, 60 monthly partitions, 2021-2025, 43,801 rows) and `SELECT count(*) FROM part_demo_monthly WHERE logdate >= '2025-12-01'` (a literal, known at planning time). With `enable_partition_pruning = off`: all 60 partitions scanned, `Buffers: shared hit=300`, `Execution Time: 3.633 ms`. With `enable_partition_pruning = on`: only the one matching partition scanned, `Buffers: shared hit=5`, `Execution Time: 0.146 ms` — 60 times fewer buffers, about 25 times faster, for the identical query and data.

**Run-time (execution-time) partition pruning, PostgreSQL 16.15, same table.** `SET plan_cache_mode = force_generic_plan`, then `PREPARE part_query(date) AS SELECT count(*) FROM part_demo_monthly WHERE logdate >= $1; EXECUTE part_query('2025-12-01')` — the parameter is a genuine unknown at plan time, not a literal. `EXPLAIN (ANALYZE, BUFFERS)` reports `Subplans Removed: 59` directly, with only one partition actually scanned (`Buffers: shared hit=5`, `Execution Time: 0.224 ms`) — pruning performed with the real parameter value only available once execution began, not when the plan was built.

**Overhead of many partitions, PostgreSQL 16.15.** `SELECT count(*) FROM part_demo_monthly` (no filter, so all 60 partitions are genuinely needed): `Planning Time: 3.875 ms`, `Planning: Buffers: shared hit=791`. The identical data loaded into an unpartitioned table (`part_demo_flat`, same 43,801 rows) and the same query: `Planning Time: 0.107 ms`, `Planning: Buffers: shared hit=4` — about 36 times longer planning time and about 198 times more planning-time buffer access, from partition count alone, with the data itself unchanged.

**Retention via DROP TABLE vs. DELETE, PostgreSQL 16.15.** A range-partitioned table (`big_partitioned`) with two 1,000,000-row partitions, one per year. `DROP TABLE big_partitioned_old` (removing one full partition): `15.440 ms`. The identical 1,000,000 rows, loaded into an unpartitioned table (`big_flat`) instead, removed with `DELETE FROM big_flat WHERE logdate = '2020-06-01'`: `584.947 ms` — about 38 times slower, and this doesn't include the follow-up `VACUUM` overhead that a bulk `DELETE` leaves behind and `DROP TABLE` avoids entirely, per the documentation quoted above.
