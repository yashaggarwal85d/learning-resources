Last verified: 2 November 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real snapshot
chain time-traveled by id and by timestamp, rolled back, expired, vacuumed with the reclaimed
bytes measured, and a real reader corrupted by too short a retention window.

- Apache Iceberg, "Maintenance": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/maintenance/). Fetched 2026-10-31. Expiring snapshots, removing orphan files, and the retention-interval danger note this topic reproduces.
- Delta Lake, "Table utility commands": [docs.delta.io](https://docs.delta.io/latest/delta-utility.html). Fetched 2026-10-31. VACUUM, RESTORE, and the concurrent-reader/writer safety warning this topic reproduces.
- Databricks, "Prepare your data for GDPR compliance": [docs.databricks.com](https://docs.databricks.com/aws/en/security/privacy/gdpr-delta). Fetched 2026-10-31. The conflict between Delta's default history retention and a hard, permanent delete.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=snapshot-lifecycle-time-travel:%20).
