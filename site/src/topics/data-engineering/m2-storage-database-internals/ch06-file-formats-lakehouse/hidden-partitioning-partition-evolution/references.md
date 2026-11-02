Last verified: 2 November 2026. Every structural and pruning claim demonstrated on screen is
executed and asserted directly against a real Apache Iceberg table built in this sandbox with
the real `pyiceberg` library, whose partition spec is evolved mid-life with the real
`update_spec()` API (`remove_field`, `add_field`) — not a simulation of partition evolution.

- Apache Iceberg, "Partitioning": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/partitioning/). Fetched 2026-11-02. Hidden partitioning's design goal.
- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. Partition transforms and partition evolution.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=hidden-partitioning-partition-evolution:%20).
