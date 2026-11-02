# Fact-check — de.duckdb-single-node-analytics

| # | Claim | Checked against |
|---|---|---|
| 1 | DuckDB uses a columnar-vectorized execution engine, processing a batch of values per operation | Yes, quoted verbatim, DuckDB docs "Why DuckDB" |
| 2 | The vectorized engine is inspired by MonetDB/X100 | Yes, quoted verbatim, same source |
| 3 | DuckDB uses morsel-driven parallelism, inspired by Leis et al.'s paper | Yes, quoted verbatim, same source |
| 4 | A real measured multi-thread speedup over a single thread, on an identical aggregation | Yes, executed via duckdb (PRAGMA threads, wall-clock timed) |
| 5 | DuckDB supports larger-than-memory (out-of-core) workloads via spilling to disk | Yes, quoted verbatim, DuckDB docs "Tuning Workloads" |
| 6 | A sort under a configured memory limit spills real files to a configured temp directory and still completes correctly | Yes, executed via duckdb (SET memory_limit, SET temp_directory, real file listing) |
| 7 | DuckDB can directly query Pandas, Polars and Arrow objects via replacement scans | Yes, quoted verbatim, DuckDB docs "Python API" / "SQL on Pandas" |
| 8 | A real Pandas and a real Polars DataFrame queried directly, correct sums | Yes, executed via duckdb |
| 9 | The iceberg extension reads an Iceberg table directly from storage with `iceberg_scan`, no catalog required | Yes, quoted verbatim, DuckDB docs "Iceberg Extension" |
| 10 | A real local Iceberg table (pyiceberg SQL catalog) queried directly from DuckDB, correct total and filtered counts | Yes, executed via duckdb + pyiceberg |
| 11 | DuckDB's own `EXPLAIN ANALYZE` on that query shows the filter pushed into the Parquet scan, with a real bytes-read figure | Yes, executed via duckdb (raw EXPLAIN ANALYZE text) |
| 12 | The delta extension is built on the Delta Kernel and reads/writes Delta tables, local and remote | Yes, quoted verbatim, DuckDB docs "Delta Extension" |
| 13 | A real local Delta table (delta-rs) queried directly from DuckDB, correct total and filtered counts | Yes, executed via duckdb + deltalake |
| 14 | DuckLake is a DuckDB extension that attaches to databases in the DuckLake format, with a catalog stored as SQL tables | Yes, quoted verbatim, DuckDB docs "DuckLake" |
| 15 | Two real writes to a real local DuckLake-attached table produce real, independently queryable versioned snapshots | Yes, executed via duckdb |
| 16 | DuckDB 1.4.0 "Andium" shipped as the first LTS release, with Iceberg writes among its new features | Yes, quoted verbatim, DuckDB's own 1.4.0 announcement |
| 17 | DuckDB 2.0.0 "Cinnamon Teal" shipped a polished Quack client-server protocol, first introduced in 1.5.3 | Yes, quoted verbatim, DuckDB's own 2.0.0 announcement |
| 18 | DuckDB 2.0 has LTS support until at least October 2027; 1.4 is supported until November 2026 | Yes, quoted verbatim, same source |
| 19 | MotherDuck's Dual Execution lets a single query mix local and remote (MotherDuck) data, planned by its optimizer | Yes, quoted verbatim, MotherDuck's own docs; sourced-only, not run in this sandbox |

### Red team

Every number shown on screen in the Iceberg/Delta/out-of-core/parallelism/DuckLake reveals is
this script's own real, executed output against DuckDB 2.0.0 -- not narrated, not copied from a
vendor benchmark. The morsel-driven-parallelism speedup is wall-clock timing and varies run to
run (observed 2.9x-5.6x across repeated runs in this sandbox); `examples.py` only asserts it is
comfortably above 1x, and the reel states the finding qualitatively rather than committing to one
exact multiplier.

No real Trino cluster runs anywhere in this sandbox (no Docker daemon, confirmed the same way as
topic 34). CHAPTER.md's own outcome calls for comparing DuckDB's real plan and bytes read
"against topic 34's Trino run on the identical query" -- topic 34 itself never built a literal
Iceberg table (no cluster to run one against), so there is no real Trino bytes-read figure to
compare against here. This topic instead gives DuckDB's own real, measured plan and bytes-read
figure on a real Iceberg table it builds itself, and states the comparison to Trino conceptually
(no server process at all, versus a coordinator/worker cluster) rather than as a literal
side-by-side number. Disclosed in SOURCES.md's Red team section and `coverage.json`.

CHAPTER.md's own syllabus line calls DuckDB 2.0's client-server mode "previewed." DuckDB 2.0.0
LTS shipped as a full release on 2026-10-21, before this topic was built (2026-11-02) -- the
syllabus clause is quoted as written, and the reveal states the current, released status instead
of "previewed," sourced from DuckDB's own 2.0.0 announcement.

MotherDuck's hybrid Dual Execution claims are sourced-only from MotherDuck's own documentation;
this sandbox has no MotherDuck account and the claims are not independently run here.

### Scope boundary

In scope and demonstrated: in-process vectorized execution, morsel-driven parallelism (measured),
out-of-core spilling (measured), direct Pandas/Polars DataFrame queries, real Iceberg and Delta
table reads through DuckDB's own extensions, DuckLake's catalog-as-SQL-tables model, the 1.4/2.0
LTS release lines and the (now-shipped) Quack client-server protocol.

Sourced but not independently demonstrated: MotherDuck's hybrid/Dual Execution (no MotherDuck
account reachable from this sandbox); the "most analytical data fits on one large node" argument
and where it stops holding is stated from DuckDB's and MotherDuck's own public material, not
measured against a real concurrency/scale boundary in this sandbox.
