Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§19.7, "Query Planning"](https://www.postgresql.org/docs/18/runtime-config-query.html) — `enable_partitionwise_join`, quoted verbatim.
- Trino Documentation, ["EXPLAIN"](https://trino.io/docs/current/sql/explain.html) — exchange fragment types (`HASH`, `BROADCAST`) and `RemoteExchange` plan nodes, quoted verbatim.
- Apache Spark 3.5.9 Documentation, ["Performance Tuning"](https://spark.apache.org/docs/3.5.9/sql-performance-tuning.html) — `spark.sql.autoBroadcastJoinThreshold` and adaptive query execution's join-strategy conversion, quoted verbatim.
- Measured directly on this topic's own PostgreSQL 16.15 instance (`pw_orders`, 8,000,000 rows; `pw_customers`, 2,000,000 rows, both partitioned identically) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=parallel-distributed-query-plans:%20).
