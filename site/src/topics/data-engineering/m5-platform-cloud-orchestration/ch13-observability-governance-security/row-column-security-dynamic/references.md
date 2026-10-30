Last verified: 30 October 2026. Expert sign-off: pending. Six synthetic experiments run in
`examples.py` (plain list filtering, never a real Postgres/Snowflake/Databricks/BigQuery/Lake
Formation/Trino instance): a masked-and-filtered query, an admin query, a direct file read, a
stale materialized view, an old export, and a rows-examined comparison between a pushed-down and
a non-pushed-down row policy — all asserts pass.

- PostgreSQL, "Row Security Policies": [postgresql.org](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). Per-user row policies, their bypass rules, and the leakproof exception.
- Snowflake, "Understanding column-level security": [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro). Masking policies as schema-level objects, applied at query runtime.
- Snowflake, "Understanding row access policies": [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/security-row-intro). Row access policies and query-output filtering.
- Google Cloud, "Introduction to BigQuery row-level security": [docs.cloud.google.com](https://docs.cloud.google.com/bigquery/docs/row-level-security-intro). Row-level security filters that behave like a WHERE clause.
- AWS, "Data filtering and cell-level security in Lake Formation": [docs.aws.amazon.com](https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html). Column, row and cell-level security, scoped to read operations.
- Databricks, "Create and manage row filter and column mask policies": [docs.databricks.com](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies). UDF-backed row filters and column masks in Unity Catalog.
- Trino, "Open Policy Agent access control": [trino.io](https://trino.io/docs/current/security/opa-access-control.html). Row filters and column masks retrieved from OPA at query time.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=row-column-security-dynamic:%20).
