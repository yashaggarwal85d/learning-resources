Last verified: 1 November 2026. Expert sign-off: pending. Four measurements run in `examples.py`
against a real local PostgreSQL 16 instance (row counts before/after a row-security policy, an
`EXPLAIN` plan comparison, and a superuser bypass) — all asserts pass.

- PostgreSQL, "5.9. Row Security Policies": [postgresql.org](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). The runnable local example.
- Snowflake, "Understanding Dynamic Data Masking": [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro). Masking at query time.
- Snowflake, "Understanding row access policies": [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/security-row-intro). Row access as a separate object.
- Databricks, "Row filters and column masks": [docs.databricks.com](https://docs.databricks.com/aws/en/data-governance/unity-catalog/row-and-column-filters). The engine's "secure choice" trade-off.
- Google Cloud, "Introduction to BigQuery row-level security": [cloud.google.com](https://cloud.google.com/bigquery/docs/row-level-security-intro). Row-level access policies.
- AWS, "Data filtering and cell-level security in Lake Formation": [docs.aws.amazon.com](https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html). Combined row and column filtering.
- Trino, "Open Policy Agent access control": [trino.io](https://trino.io/docs/current/security/opa-access-control.html). Row filtering and column masking as policy-engine decisions (quoted in the previous topic's own `SOURCES.md`).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=row-column-security-dynamic:%20).
