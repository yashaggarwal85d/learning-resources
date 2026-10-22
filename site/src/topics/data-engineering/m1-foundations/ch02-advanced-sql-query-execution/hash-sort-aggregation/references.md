Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§19.7.1, "Planner Method Configuration"](https://www.postgresql.org/docs/18/runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE) (within §19.7, "Query Planning") — `enable_hashagg`, quoted verbatim.
- PostgreSQL 18 Documentation, [§19.4.1, "Memory"](https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-WORK-MEM) (within §19.4, "Resource Consumption") — `work_mem` and what sort operations are used for, quoted verbatim.
- PostgreSQL 18 Documentation, [§15.3.3, "Parallel Aggregation"](https://www.postgresql.org/docs/18/parallel-plans.html#PARALLEL-AGGREGATION) (within §15.3, "Parallel Plans") — the Partial Aggregate / Finalize Aggregate design and its exclusions, quoted verbatim.
- PostgreSQL 18 Documentation, [§14.1, "Using EXPLAIN"](https://www.postgresql.org/docs/18/using-explain.html) — plan nodes for aggregation, quoted verbatim.
- Measured directly on this topic's own PostgreSQL 16 instance (the `agg_demo` schema: `sales`, 2,000,000 rows, grouped by a 100-value and a 1,500,000-value column) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=hash-sort-aggregation:%20).
