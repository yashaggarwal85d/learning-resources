Last verified: 2 November 2026. All of this topic's executed claims are real: a real Delta table
written and appended with delta-rs; its real raw commit log read straight off disk; a real
time-travel read of an older version by number; and two real protocol table features (deletion
vectors, row tracking, then the Variant type) enabled with delta-rs's own API, with the table's
protocol numbers and feature lists changing for real as a result.

- Delta Lake, "Delta Lake 4.4.0": [github.com/delta-io/delta](https://github.com/delta-io/delta/releases/tag/v4.4.0). Fetched 2026-11-02. Spark compatibility, identity columns, generated columns.
- Delta Lake, "Delta Lake 4.2.0": [github.com/delta-io/delta](https://github.com/delta-io/delta/releases/tag/v4.2.0). Fetched 2026-11-02. Collations and the Geospatial table feature.
- Delta Lake, "Delta Lake 4.3.0 Release Notes": [github.com/delta-io/delta](https://github.com/delta-io/delta/issues/7034). Fetched 2026-11-02. Variant shredding's still-preview status.
- Delta Kernel, "Introduction": [docs.delta.io](https://docs.delta.io/kernel/rust/introduction). Fetched 2026-11-02. What Delta Kernel is and how it's built.
- Delta Lake, "Delta type widening": [docs.delta.io](https://docs.delta.io/delta-type-widening/). Fetched 2026-11-02. Type widening's own version history.
- delta-rs, "README": [raw.githubusercontent.com/delta-io/delta-rs](https://raw.githubusercontent.com/delta-io/delta-rs/main/README.md). Fetched 2026-11-02. delta-rs's own description of itself.
- DuckDB, "Native Delta Lake Support in DuckDB": [duckdb.org](https://duckdb.org/2024/06/10/delta). Fetched 2026-11-02. Why DuckDB chose Delta Kernel over delta-rs.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=delta-lake-4-x:%20).
