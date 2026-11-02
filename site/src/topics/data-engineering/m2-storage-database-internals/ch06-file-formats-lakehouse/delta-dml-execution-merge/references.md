Last verified: 2 November 2026. All of this topic's executed claims are real: a real MERGE's
full-file-rewrite cost measured in real bytes written; the same MERGE's deletion-vector-mode cost
measured the same way, on the identical matched-row set; a real conflict between a MERGE and a
concurrent compaction, detected by a real read-set/remove-set intersection check and resolved by a
real successful retry; and a real demonstration that a row's materialized Row ID survives a
rewrite while its default generated Row ID does not — not a simulation of any of it.

- Delta Lake, "Transaction Log Protocol": [raw.githubusercontent.com/delta-io/delta](https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md). Fetched 2026-11-02. Row Tracking's fresh vs. stable Row ID definitions.
- Delta Lake, "Concurrency control": [docs.delta.io](https://docs.delta.io/latest/concurrency-control.html). Fetched 2026-11-02. The MERGE-vs-COMPACTION conflict pair and ConcurrentDeleteReadException.
- Databricks, "Low shuffle merge on Databricks": [docs.databricks.com](https://docs.databricks.com/aws/en/optimizations/low-shuffle-merge). Fetched 2026-11-02. Why MERGE needs an optimization for unmodified rows at all.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=delta-dml-execution-merge:%20).
