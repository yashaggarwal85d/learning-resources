Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§9.1, "Logical Operators"](https://www.postgresql.org/docs/current/functions-logical.html) — the AND/OR/NOT three-valued truth tables, quoted verbatim.
- PostgreSQL 18 Documentation, [§9.2, "Comparison Functions and Operators"](https://www.postgresql.org/docs/current/functions-comparison.html) — `x = NULL` yielding null, `IS [NOT] DISTINCT FROM` semantics, `IS [NOT] NULL`, `IS [NOT] UNKNOWN`.
- PostgreSQL 18 Documentation, [§7.3.3, "DISTINCT"](https://www.postgresql.org/docs/current/queries-select-lists.html) — "Null values are considered equal in this comparison."
- PostgreSQL 18 Documentation, [§7.5, "Sorting Rows (ORDER BY)"](https://www.postgresql.org/docs/current/queries-order.html) — default `NULLS FIRST`/`NULLS LAST` behaviour.
- PostgreSQL 18 Documentation, [§9.21, "Aggregate Functions," Table 9.62](https://www.postgresql.org/docs/current/functions-aggregate.html) — `count(*)` vs `count(expression)`, `sum` over non-null values, and aggregates over zero rows returning null.
- PostgreSQL 18 Documentation, [`CREATE TABLE`](https://www.postgresql.org/docs/current/sql-createtable.html) — "For the purpose of a unique constraint, null values are not considered equal, unless `NULLS NOT DISTINCT` is specified."
- PostgreSQL 15 Release Notes, [§E.20, "Allow unique constraints and indexes to treat NULL values as not distinct"](https://www.postgresql.org/docs/15/release-15.html) — the version `NULLS NOT DISTINCT` was added.
- PostgreSQL 18 Documentation, [§9.24.2–9.24.3, "IN" / "NOT IN"](https://www.postgresql.org/docs/current/functions-subquery.html) — the exact NULL-propagation rule behind the vanishing-rows bug, quoted verbatim.
- [SQLGlot](https://github.com/tobymao/sqlglot) — "a no-dependency SQL parser, transpiler, optimizer, and engine" supporting more than thirty SQL dialects, used for the lab's cross-dialect diff.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=nulls-three-valued-logic:%20).
