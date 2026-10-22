Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§5.12.4, "Partition Pruning"](https://www.postgresql.org/docs/18/ddl-partitioning.html#DDL-PARTITION-PRUNING) — plan-time and run-time pruning, quoted verbatim.
- PostgreSQL 18 Documentation, [§5.12.2.2, "Partition Maintenance"](https://www.postgresql.org/docs/18/ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE-MAINTENANCE) — dropping and detaching partitions, quoted verbatim.
- BigQuery Documentation, ["Introduction to clustered tables"](https://cloud.google.com/bigquery/docs/clustered-tables) — storage-block clustering, quoted verbatim, not independently measured (no BigQuery account on this sandbox).
- Measured directly: PostgreSQL 16.15 (the existing instance from topics 23–29) for all four comparisons — plan-time pruning, run-time pruning via a forced generic plan, planning-time overhead of 60 partitions vs. an unpartitioned table, and DROP TABLE vs. DELETE for a 1,000,000-row retention case. See `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=table-partitioning-partition-pruning:%20).
