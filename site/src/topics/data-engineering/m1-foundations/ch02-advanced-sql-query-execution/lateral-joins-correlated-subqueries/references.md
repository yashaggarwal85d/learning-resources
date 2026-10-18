Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§7.2.1.5, "LATERAL Subqueries"](https://www.postgresql.org/docs/current/queries-table-expressions.html) — the per-row evaluation model and the `LEFT JOIN LATERAL ... ON true` pattern, quoted verbatim.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/prep/prepjointree.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/prep/prepjointree.c), function `is_simple_subquery` — the exact conditions (grouping, aggregation, set-returning functions, sorting, limiting, `WITH`) that block pulling a subquery up into a plain join.
- Microsoft Learn, [T-SQL "FROM clause plus JOIN, APPLY, PIVOT"](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql) — `CROSS APPLY`/`OUTER APPLY` semantics, for the cross-dialect mapping.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lateral-joins-correlated-subqueries:%20).
