Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§14.1, "Using EXPLAIN"](https://www.postgresql.org/docs/18/using-explain.html) — the nested-loop, hash-join and merge-join plan shapes and their worked examples, quoted verbatim.
- PostgreSQL 18 Documentation, [§19.7.1, "Planner Method Configuration"](https://www.postgresql.org/docs/18/runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE) (within §19.7, "Query Planning") — `enable_hashjoin`, `enable_mergejoin`, `enable_nestloop` and the "impossible to suppress... entirely" wording, quoted verbatim.
- PostgreSQL 18 Documentation, [§19.4.1, "Memory"](https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-WORK-MEM) (within §19.4, "Resource Consumption") — `work_mem` and `hash_mem_multiplier`, quoted verbatim.
- Measured directly on this topic's own PostgreSQL 16 instance (the `join_demo` schema: `customers` 100,000 rows, `orders2` 2,000,000 rows, `customer_id` indexed) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=join-algorithms-nested-loop:%20).
