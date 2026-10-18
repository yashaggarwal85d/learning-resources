Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§7.8.3, "Common Table Expression Materialization"](https://www.postgresql.org/docs/current/queries-with.html) — the exact default rule and both worked examples (`big_table` single/multi-reference, `very_expensive_function`), quoted verbatim.
- PostgreSQL 12 Release Notes, [§E.20](https://www.postgresql.org/docs/12/release-12.html) — the CTE-inlining feature's introduction and the stated prior behavior ("CTEs were never inlined and were always evaluated before the rest of the query"), quoted verbatim.
- Microsoft Learn, ["WITH common_table_expression (Transact-SQL)"](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql) — SQL Server's always-re-execute behavior and the documented temporary-object workaround, quoted verbatim.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cte-inlining-vs-materialization:%20).
