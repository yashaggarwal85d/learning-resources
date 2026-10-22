Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§11.2, "Index Types"](https://www.postgresql.org/docs/18/indexes-types.html) — the BRIN overview and physical-correlation requirement, quoted verbatim.
- PostgreSQL 18 Documentation, [§65.5, "BRIN Indexes"](https://www.postgresql.org/docs/18/brin.html) — block ranges, summarization, lossiness, and the pages_per_range tradeoff, quoted verbatim.
- Snowflake Documentation, ["Micro-partitions & Data Clustering"](https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions) — micro-partition value-range metadata and pruning, quoted verbatim, not independently measured (no Snowflake account on this sandbox).
- Measured directly: PostgreSQL 16.15 (the existing instance from topics 23–30) for all three comparisons — BRIN vs. B-tree storage size, a correlated-column equality filter, and the identical kind of filter on an uncorrelated column. See `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=zone-maps-brin-indexes:%20).
