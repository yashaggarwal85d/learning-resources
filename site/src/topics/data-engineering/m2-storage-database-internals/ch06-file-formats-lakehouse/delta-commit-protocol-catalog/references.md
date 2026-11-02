Last verified: 2 November 2026. All of this topic's executed claims are real: a real put-if-absent
commit of the next Delta log version, against a real local S3 server, reusing topic 10's exact
conditional-write primitive; a real rejected write with a real HTTP 412 for the losing writer; a
real retry that wins the next version; and a real reproduction of Delta's documented
WriteSerializable/Serializable decision rule against real committed log entries, including the
case where the two levels actually disagree — not a simulation of any of it.

- Delta Lake, "Transaction Log Protocol": [raw.githubusercontent.com/delta-io/delta](https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md). Fetched 2026-11-02. Catalog-managed tables and the put-if-absent commit protocol.
- Databricks, "Isolation levels (WriteSerializable and Serializable)": [docs.databricks.com](https://docs.databricks.com/aws/en/optimizations/isolation/isolation-levels). Fetched 2026-11-02. The default isolation level and its worked concurrent delete-and-insert example.
- Delta Lake, "Delta Lake 4.0": [delta.io/blog](https://delta.io/blog/2025-09-25-delta-lake-40/). Fetched 2026-11-02. The catalog-managed-tables preview announcement.
- Delta Lake, "Strengthening Catalog-Managed Delta Tables with the Unity Catalog Delta APIs": [delta.io/blog](https://delta.io/blog/2026-06-22-delta-4-3-release). Fetched 2026-11-02. The 4.2-to-4.3 rollout of catalog-routed table operations.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=delta-commit-protocol-catalog:%20).
