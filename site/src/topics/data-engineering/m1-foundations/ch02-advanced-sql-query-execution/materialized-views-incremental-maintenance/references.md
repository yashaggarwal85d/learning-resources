Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, ["REFRESH MATERIALIZED VIEW"](https://www.postgresql.org/docs/18/sql-refreshmaterializedview.html) — full replacement semantics, CONCURRENTLY, and its UNIQUE-index requirement, quoted verbatim.
- Snowflake Documentation, ["Dynamic tables"](https://docs.snowflake.com/en/user-guide/dynamic-tables-about) — incremental vs. full refresh modes and target lag, quoted verbatim, not independently measured (no Snowflake account on this sandbox).
- Databricks Documentation, ["Incremental refresh for materialized views"](https://docs.databricks.com/en/optimizations/incremental-refresh.html) — which query shapes and aggregates maintain incrementally, including the floating-point case, quoted verbatim, not independently measured (this sandbox's PostgreSQL has no equivalent built-in incremental-refresh feature).
- Measured directly: PostgreSQL 16.15 (the existing instance from topics 23–31) for all four comparisons — full refresh cost before and after a small change, a trigger-maintained incremental equivalent, and a plain refresh vs. CONCURRENTLY's effect on a concurrent reader. See `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=materialized-views-incremental-maintenance:%20).
