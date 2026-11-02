Last verified: 2 November 2026. All of this topic's executed claims are real: a real pyiceberg
(0.12.0) manifest's truncated string bounds, read directly off `table.inspect.data_files()`; a
real Puffin file, byte-exact to the file format spec, holding a real from-scratch Theta sketch,
registered on the table through pyiceberg's own public `update_statistics()` API; and an
independent re-read of that file's raw bytes compared against the table's true distinct count —
not a simulation of any of it.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. Column-metrics truncation and table/partition statistics.
- Apache Iceberg, "Puffin Spec": [iceberg.apache.org](https://iceberg.apache.org/puffin-spec/). Fetched 2026-11-02. The file format's own structure and the Theta sketch blob type.
- Trino, "Iceberg connector": [trino.io](https://trino.io/docs/current/connector/iceberg.html). Fetched 2026-11-02. How the connector collects statistics.
- Trino, "Cost-based optimizations": [trino.io](https://trino.io/docs/current/optimizer/cost-based-optimizations.html). Fetched 2026-11-02. How a cost-based optimizer consumes table statistics.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=iceberg-statistics-puffin-files:%20).
