Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§14.1, "Using EXPLAIN"](https://www.postgresql.org/docs/18/using-explain.html) — the BUFFERS option and ANALYZE implicitly enabling it, quoted verbatim.
- Apache Spark 3.5.9 source, [`InjectRuntimeFilter.scala`](https://raw.githubusercontent.com/apache/spark/v3.5.9/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/InjectRuntimeFilter.scala) — reused from topic 26, quoted verbatim.
- Trino Documentation, ["EXPLAIN ANALYZE"](https://trino.io/docs/current/sql/explain-analyze.html) — CPU time and relative cost per plan node, quoted verbatim.
- Snowflake Documentation, ["Monitor query activity with Query History"](https://docs.snowflake.com/en/user-guide/ui-query-profile.html) — Query Profile's Pruning and Spilling panes, quoted verbatim.
- Google Cloud Documentation, ["Get query performance insights"](https://cloud.google.com/bigquery/docs/query-insights) — BigQuery's execution graph, quoted verbatim.
- Measured directly: PostgreSQL 16.15 vs. a freshly installed PostgreSQL 18.6 (same sandbox, separate clusters) for the Buffers-default comparison and the estimated-vs-actual rows measurement; Apache Spark 3.5.9 in `local` mode (Python 3.11 venv) queried through its own REST API for the plan-text-vs-UI/API split and a genuine forced spill — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=reading-explain-across-engines:%20).
