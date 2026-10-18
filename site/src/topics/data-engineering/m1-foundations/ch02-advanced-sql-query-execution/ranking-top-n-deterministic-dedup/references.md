Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§9.22, "Window Functions," Table 9.67](https://www.postgresql.org/docs/current/functions-window.html) — the exact `row_number`/`rank`/`dense_rank` definitions, quoted verbatim.
- Snowflake SQL Reference, ["QUALIFY"](https://docs.snowflake.com/en/sql-reference/constructs/qualify) — the HAVING-for-window-functions framing and the full clause evaluation order.
- Google Cloud, [BigQuery Standard SQL "Query syntax" reference, "QUALIFY clause"](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax) — a second engine's QUALIFY, with the same evaluation order and a matching top-N-per-group example.
- DuckDB Documentation, ["QUALIFY Clause"](https://duckdb.org/docs/current/sql/query_syntax/qualify.html) — a third engine's QUALIFY support, confirmed directly.
- Databricks SQL Language Reference, ["QUALIFY clause"](https://docs.databricks.com/en/sql/language-manual/sql-ref-syntax-qry-select-qualify.html) — a fourth engine's QUALIFY support, confirmed directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=ranking-top-n-deterministic-dedup:%20).
