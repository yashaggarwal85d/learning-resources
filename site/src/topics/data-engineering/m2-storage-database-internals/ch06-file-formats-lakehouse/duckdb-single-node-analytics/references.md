Last verified: 2 November 2026. No Docker daemon or server process runs anywhere in this
sandbox; `examples.py` runs real DuckDB 2.0.0 in-process throughout, plus real local Iceberg
(pyiceberg) and Delta (delta-rs) tables it builds itself. Every architectural claim is a
word-for-word quote from DuckDB's or MotherDuck's own current documentation; every number is
this sandbox's own real, executed output. CHAPTER.md's own syllabus line calls DuckDB 2.0's
client-server mode "previewed" -- DuckDB 2.0.0 LTS shipped as a full release on 2026-10-21,
before this topic was built, so the reveal states the now-released status instead.

- DuckDB, "Why DuckDB": [duckdb.org](https://duckdb.org/why_duckdb). Fetched 2026-11-02.
- DuckDB, "Tuning Workloads": [duckdb.org](https://duckdb.org/docs/2.0/guides/performance/how_to_tune_workloads.html). Fetched 2026-11-02.
- DuckDB, "Python API": [duckdb.org](https://duckdb.org/docs/2.0/clients/python/overview.html). Fetched 2026-11-02.
- DuckDB, "SQL on Pandas": [duckdb.org](https://duckdb.org/docs/2.0/guides/python/sql_on_pandas.html). Fetched 2026-11-02.
- DuckDB, "Iceberg Extension": [duckdb.org](https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html). Fetched 2026-11-02.
- DuckDB, "Delta Extension": [duckdb.org](https://duckdb.org/docs/2.0/core_extensions/delta.html). Fetched 2026-11-02.
- DuckDB, "DuckLake": [duckdb.org](https://duckdb.org/docs/2.0/core_extensions/ducklake.html). Fetched 2026-11-02.
- DuckDB, "Announcing DuckDB 1.4.0 LTS": [duckdb.org](https://duckdb.org/2025/09/16/announcing-duckdb-140.html). Fetched 2026-11-02.
- DuckDB, "Announcing DuckDB 2.0.0 LTS 'Cinnamon Teal'": [duckdb.org](https://duckdb.org/2026/10/21/announcing-duckdb-200.html). Fetched 2026-11-02.
- MotherDuck, "Running Dual Execution (or hybrid) queries": [motherduck.com](https://motherduck.com/docs/key-tasks/running-hybrid-queries.md). Fetched 2026-11-02.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=duckdb-single-node-analytics:%20).
