Last verified: 2 November 2026. All of this topic's executed claims are real: a real tag and a
real branch created from the same snapshot through pyiceberg (0.12.0)'s own public
`manage_snapshots()` API; a real branch-scoped write via `append(branch=...)`, checked directly
against `main`'s own snapshot id before and after; a real validation check for a duplicate id; a
real fast-forward publish via `set_current_snapshot`; and a real second attempt that fails the
same check and is discarded without ever touching `main` — not a simulation of any of it.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. Snapshot references: branches and tags.
- Apache Iceberg, "Spark Procedures": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/spark-procedures/). Fetched 2026-11-02. fast_forward, publish_changes, and the wap_id table property.
- Apache Iceberg, "View Spec": [iceberg.apache.org](https://iceberg.apache.org/view-spec/). Fetched 2026-11-02. What a view is as a catalog object, distinct from a table.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=branches-tags-write-audit:%20).
