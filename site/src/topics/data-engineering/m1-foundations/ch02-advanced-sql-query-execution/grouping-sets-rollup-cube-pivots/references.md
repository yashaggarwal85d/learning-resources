Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§7.2.4, "GROUPING SETS, CUBE, and ROLLUP"](https://www.postgresql.org/docs/current/queries-table-expressions.html) — the grouping-set expansion rules for `ROLLUP`/`CUBE`, the NULL-ambiguity note, and the `DISTINCT ROLLUP` duplicate-removal example, quoted verbatim.
- PostgreSQL 18 Documentation, [§9.21, Table 9.66, "Grouping Operations"](https://www.postgresql.org/docs/current/functions-aggregate.html) — the `GROUPING()` bitmask definition and worked example.
- PostgreSQL 18 Documentation, [§4.2.7, "Aggregate Expressions"](https://www.postgresql.org/docs/current/sql-expressions.html) — the `FILTER (WHERE …)` clause, quoted verbatim with its `count(*) FILTER` example.
- PostgreSQL 18 Documentation, [§F.43, "tablefunc"](https://www.postgresql.org/docs/current/tablefunc.html) — the `crosstab()` pivot-table function, for engines without native `PIVOT`.
- Snowflake SQL Reference, ["PIVOT"](https://docs.snowflake.com/en/sql-reference/constructs/pivot) — native `PIVOT` syntax, for the dialect-portability contrast.
- Google Cloud, [BigQuery "Query syntax" reference, "PIVOT operator"/"UNPIVOT operator"](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax) — a second engine's native `PIVOT`/`UNPIVOT`.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=grouping-sets-rollup-cube-pivots:%20).
