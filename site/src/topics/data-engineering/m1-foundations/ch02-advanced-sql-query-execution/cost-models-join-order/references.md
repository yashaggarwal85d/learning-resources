Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§14.1, "Using EXPLAIN"](https://www.postgresql.org/docs/18/using-explain.html) — the Seq Scan cost formula and what the cost numbers mean, quoted verbatim.
- PostgreSQL 18 Documentation, [§19.7.2, "Planner Cost Constants"](https://www.postgresql.org/docs/18/runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS) — the five default cost constants, quoted verbatim.
- PostgreSQL 18 Documentation, [§19.7.4, "Other Planner Options"](https://www.postgresql.org/docs/18/runtime-config-query.html#RUNTIME-CONFIG-QUERY-OTHER) — `from_collapse_limit`, `join_collapse_limit`, `geqo_threshold` and their defaults, quoted verbatim.
- PostgreSQL 18 Documentation, [§14.3, "Controlling the Planner with Explicit JOIN Clauses"](https://www.postgresql.org/docs/18/explicit-joins.html) — why join-order search space explodes and how `join_collapse_limit = 1` pins an order, quoted verbatim.
- PostgreSQL 18 Documentation, [§61.1, "Query Handling as a Complex Optimization Problem"](https://www.postgresql.org/docs/18/geqo-intro.html) — the System R-style near-exhaustive search and why it's inappropriate for large joins, quoted verbatim.
- PostgreSQL 18 Documentation, [§61.3, "Genetic Query Optimization (GEQO) in PostgreSQL"](https://www.postgresql.org/docs/18/geqo-pg-intro.html) — the genetic algorithm's own mechanics, quoted verbatim.
- Measured directly on this topic's own PostgreSQL 16 instance (the `cost_demo` schema: `j1`..`j12`, each 100,000 rows, chained by id equality, one selective filter) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cost-models-join-order:%20).
