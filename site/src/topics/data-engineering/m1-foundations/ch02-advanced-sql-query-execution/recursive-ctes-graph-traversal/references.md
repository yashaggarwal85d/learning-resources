Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§7.8.2, "Recursive Queries"](https://www.postgresql.org/docs/current/queries-with.html) — the exact working-table fixpoint algorithm, the bill-of-materials example, `SEARCH DEPTH FIRST`/`BREADTH FIRST`, the `CYCLE` clause, and the `LIMIT` debugging trick with its stated caveats.
- PostgreSQL 14 Release Notes, [§E.25.1](https://www.postgresql.org/docs/14/release-14.html) — "The SQL-standard SEARCH and CYCLE options for common table expressions have been implemented," dated to the 2021-09-30 release.
- DuckDB Documentation, ["Recursive CTEs"](https://duckdb.org/docs/current/sql/query_syntax/with.html) — the same fixpoint model, the tree-traversal and graph-traversal (LDBC Graphalytics) worked examples, and the hand-written `list_position`-based cycle guard used in place of `SEARCH`/`CYCLE`.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=recursive-ctes-graph-traversal:%20).
