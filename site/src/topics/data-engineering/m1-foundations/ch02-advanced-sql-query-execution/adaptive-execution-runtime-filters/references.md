Last verified: 2026-10-22.

- Apache Spark 3.5.9 Documentation, ["Performance Tuning"](https://spark.apache.org/docs/3.5.9/sql-performance-tuning.html) — Adaptive Query Execution's three features, quoted verbatim.
- Apache Spark 3.5.9 source, [`InjectRuntimeFilter.scala`](https://raw.githubusercontent.com/apache/spark/v3.5.9/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/InjectRuntimeFilter.scala) — the runtime (Bloom) filter optimizer rule, quoted verbatim from its own doc comment.
- Trino Documentation, ["Dynamic filtering"](https://trino.io/docs/current/admin/dynamic-filtering.html) — min/max-style runtime filters and dynamic partition pruning, quoted verbatim.
- PostgreSQL 18 Documentation, [§5.12.4, "Partition Pruning"](https://www.postgresql.org/docs/18/ddl-partitioning.html) — execution-time partition pruning and the "Subplans Removed" property, quoted verbatim.
- Measured directly: Apache Spark 3.5.9 in `local[4]` mode (Python 3.11 venv) for the three AQE experiments, and PostgreSQL 16.15's own `pw_orders` table (from topic 25) for execution-time partition pruning — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=adaptive-execution-runtime-filters:%20).
