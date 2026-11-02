Last verified: 2 November 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real
row-lineage model implementing Iceberg's v3 spec rules, a real copy-on-write update, a real
copy-on-write compaction, and a real plain incremental scan, each measured by a real naive
file-diff scan against a real row-identity-aware scan.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. The table specification's own row lineage section.
- Apache Iceberg, "Queries": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/spark-queries/). Fetched 2026-11-02. Incremental read semantics.
- Apache Iceberg, "Procedures": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/spark-procedures/). Fetched 2026-11-02. create_changelog_view and carry-over rows.
- Databricks, "Use change data feed on Databricks": [docs.databricks.com](https://docs.databricks.com/aws/delta/delta-change-data-feed). Fetched 2026-11-02. Delta's Change Data Feed.
- Apache Hudi, "SQL Queries": [hudi.apache.org](https://hudi.apache.org/docs/sql_queries). Fetched 2026-11-02. hudi_table_changes modes.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=incremental-reads-change-feeds:%20).
