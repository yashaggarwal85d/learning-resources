Fetched: 2026-10-22.

## PostgreSQL 18 documentation, §14.1 "Using EXPLAIN"
URL: https://www.postgresql.org/docs/18/using-explain.html
> EXPLAIN has a BUFFERS option which provides additional detail about I/O operations performed during the planning and execution of the given query.

> The ANALYZE option implicitly enables the BUFFERS option.

## Apache Spark 3.5.9 source, `InjectRuntimeFilter.scala` (Catalyst optimizer)
URL: https://raw.githubusercontent.com/apache/spark/v3.5.9/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/InjectRuntimeFilter.scala
> Insert a filter on one side of the join if the other side has a selective predicate.

## Trino documentation, "EXPLAIN ANALYZE"
URL: https://trino.io/docs/current/sql/explain-analyze.html
> In the example below, you can see the CPU time spent in each stage, as well as the relative cost of each plan node in the stage.

## Snowflake documentation, "Monitor query activity with Query History" (Query Profile reference)
URL: https://docs.snowflake.com/en/user-guide/ui-query-profile.html
> Pruning — information on the effects of table pruning:

> Partitions scanned — number of partitions scanned so far.

> Spilling — information about disk usage for operations where intermediate results do not fit in memory:

> Bytes spilled to local storage — volume of data spilled to local disk.

## Google Cloud documentation, "Get query performance insights" (BigQuery execution graph)
URL: https://cloud.google.com/bigquery/docs/query-insights
> The query execution graph provides a dynamic graphical interface for inspecting the query plan and query performance details.

> Numbers on the edges indicate the estimated number of rows exchanged between stages.

> If the shuffle quota is exceeded, shuffle memory can spill to disk and cause query performance to slow dramatically.

## Measured directly
URL: n/a — executed locally, not a web source.

**PostgreSQL 16.15 vs. 18.6, same sandbox.** PostgreSQL 16.15 is the existing instance this chapter has used since topic 23 (port 5432). PostgreSQL 18.6 was installed fresh for this topic (`sudo apt-get install postgresql-18`; `sudo pg_createcluster 18 main --port=5433`), running as a separate cluster alongside it, untouched. `EXPLAIN (ANALYZE) SELECT count(*) FROM pw_orders WHERE region = 2;` on PostgreSQL 16.15 shows no `Buffers:` line at all. The exact same command shape (`EXPLAIN (ANALYZE) SELECT count(*) FROM t WHERE k = 5;`, a fresh 200,000-row table) on PostgreSQL 18.6 shows `Buffers: shared hit=896` automatically, with no `BUFFERS` option asked for, plus a `Planning: Buffers:` line PostgreSQL 16 never prints.

**PostgreSQL 18.6, estimated vs. actual rows.** The same query above: the planner estimates `rows=1012` for the `Seq Scan on t ... Filter: (k = 5)` node; the actual run reports `rows=2000.00` (PostgreSQL 18 prints actual row counts with two decimal places when fractional, a further small but real difference from PostgreSQL 16's integer-only actual-rows column) — a real, roughly 2x underestimate, from `k`'s values not being perfectly uniform in this generated table.

**Spark 3.5.9 local mode, cost-plan estimate vs. UI-reported actual.** `df.explain(mode="cost")` on a `groupBy` over 1,000,000 rows shows `Range (0, 1000000, step=1, splits=Some(2)), Statistics(sizeInBytes=7.6 MiB, rowCount=1.00E+6)` in the Optimized Logical Plan — Spark's own "estimated" figure, printed in the plan text itself, not in a separate UI. The job's actual runtime behavior (shuffle bytes, memory/disk spilled) is not in that same text at all; it lives only in the Spark UI and its own REST API, queried directly here at `http://localhost:<port>/api/v1/applications/<id>/stages`.

**Spark 3.5.9 local mode, the UI/API's own spill fields, comfortable vs. constrained.** A `groupBy` over 5,000,000 small rows with ordinary settings: `shuffleWriteBytes=73464`, `memoryBytesSpilled=0`, `diskBytesSpilled=0` for its shuffle-write stage. The same kind of job (a `groupBy` over 3,000,000 rows of 256-bit hash strings), run instead with `spark.driver.memory=512m`, `local[2]`, and `spark.sql.shuffle.partitions=1` to force a single oversized partition: `memoryBytesSpilled` and `diskBytesSpilled` both real and nonzero (about 388 MB and 198 MB respectively, rounded) — queried from the exact same REST endpoint, not inferred.
