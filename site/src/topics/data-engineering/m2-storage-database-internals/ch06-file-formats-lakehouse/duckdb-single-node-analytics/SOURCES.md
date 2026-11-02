## DuckDB docs, Why DuckDB

URL: https://duckdb.org/why_duckdb
Version: fetched 2026-11-02

> DuckDB uses a columnar-vectorized query execution engine, where queries are still interpreted, but a large batch of values (a "vector") are processed in one operation.

> This greatly reduces overhead present in traditional systems such as PostgreSQL, MySQL, or SQLite which process each row sequentially.

> Execution engine: The vectorized execution engine is inspired by the paper MonetDB/X100: Hyper-Pipelining Query Execution by Peter Boncz, Marcin Zukowski, and Niels Nes.

> Parallelism: DuckDB uses Morsel-driven parallelism, inspired by the paper Morsel-Driven Parallelism by Viktor Leis, Peter Boncz, Alfons Kemper, and Thomas Neumann.

## DuckDB docs, Tuning Workloads

URL: https://duckdb.org/docs/2.0/guides/performance/how_to_tune_workloads.html
Version: fetched 2026-11-02

> A key strength of DuckDB is support for larger-than-memory workloads, i.e., it is able to process datasets that are larger than the available system memory (also known as out-of-core processing).

> It can also run queries where the intermediate results cannot fit into memory.

> Larger-than-memory workloads are supported by spilling to disk.

## DuckDB docs, Python API

URL: https://duckdb.org/docs/2.0/clients/python/overview.html
Version: fetched 2026-11-02

> DuckDB can directly query Pandas DataFrames, Polars DataFrames, and Arrow tables.

> Note that these are read-only, i.e., editing these tables via INSERT or UPDATE statements is not possible.

## DuckDB docs, SQL on Pandas

URL: https://duckdb.org/docs/2.0/guides/python/sql_on_pandas.html
Version: fetched 2026-11-02

> The seamless integration of Pandas DataFrames into DuckDB SQL queries is allowed by replacement scans, which replace instances of accessing the my_df table (which does not exist in DuckDB) with a table function that reads the my_df dataframe.

## DuckDB docs, Iceberg Extension

URL: https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html
Version: fetched 2026-11-02

> The iceberg extension is installed and loaded automatically on first use.

> Individual Iceberg tables can be read directly from storage with the iceberg_scan function, without attaching to a catalog.

> Catalog-managed tables are accessed by attaching an Iceberg REST catalog. This unlocks the full feature set, including writing.

## DuckDB docs, Delta Extension

URL: https://duckdb.org/docs/2.0/core_extensions/delta.html
Version: fetched 2026-11-02

> The delta extension adds support for the Delta Lake open-source storage format. It is built using the Delta Kernel. The extension reads Delta tables, local and remote, and writes them: it can create tables and append to them.

> Time travel by timestamp was introduced in DuckDB 2.0.

> A table attached at a version or timestamp is read-only.

## DuckDB docs, DuckLake

URL: https://duckdb.org/docs/2.0/core_extensions/ducklake.html
Version: fetched 2026-11-02

> DuckLake 1.1 was released together with DuckDB 2.0.

> The ducklake extension adds support for attaching to databases stored in the DuckLake format.

> The ducklake extension will be transparently autoloaded on first use in an ATTACH clause.

## DuckDB, Announcing DuckDB 1.4.0 LTS

URL: https://duckdb.org/2025/09/16/announcing-duckdb-140.html
Version: fetched 2026-11-02

> We're releasing DuckDB version 1.4.0, codenamed "Andium". This is an LTS release with one year of community support, and it packs several new features including database encryption, the MERGE statement, and Iceberg writes.

> Starting with this release, every other DuckDB version is going to be a Long-Term Support (LTS) edition.

## DuckDB, Announcing DuckDB 2.0.0 LTS "Cinnamon Teal"

URL: https://duckdb.org/2026/10/21/announcing-duckdb-200.html
Version: fetched 2026-11-02

> The DuckDB team is happy to announce that today we're releasing DuckDB version 2.0.0 LTS, codenamed "Cinnamon Teal" (Spatula cyanoptera). This is our biggest feature release so far, and it ships a polished version of the Quack protocol, asynchronous I/O, a first-class VARIANT type, agent mode, triggers, an extensible SQL parser, and much more, built from close to 20,000 commits since DuckDB 1.5.

> DuckDB has been an in-process database since day one.

> In DuckDB 1.5.3, released in May, we introduced the Quack protocol that lets you run DuckDB in a traditional client-server setup, along with the quack extension, which implements DuckDB's native protocol, so any DuckDB process can serve its databases.

> With this release, there are currently three DuckDB lines available. DuckDB 2.0 is a long-term support (LTS) release with support until at least October 2027. The previous LTS release, version 1.4, is still supported until November 17, 2026.

## MotherDuck docs, Running Dual Execution (or hybrid) queries

URL: https://motherduck.com/docs/key-tasks/running-hybrid-queries.md
Version: fetched 2026-11-02

> MotherDuck can use local data and remote data in the same query.

> "Local" data in these examples comes from an inline `VALUES` clause, which DuckDB evaluates in the browser; the sales table

### Red team

Every number shown on screen (bytes read, wall time, row counts, plan comparisons) is this
sandbox's own real, executed output from DuckDB 2.0.0 and a real local Trino-equivalent run,
not copied from any vendor benchmark. The real `trino` engine itself still cannot run in this
sandbox (no Docker daemon, confirmed again for this topic the same way as topic 34); the
comparison is between DuckDB's own real `EXPLAIN ANALYZE` output and this chapter's own
executed re-run of topic 34's dynamic-filtering/cost-based-join model translated into an
equivalent DuckDB query against the same synthetic dataset shape, not a literal rerun of
Trino's binary. This is disclosed directly in `examples.py` and `coverage.json`.

The "previewed 2.0 client-server mode" language in this chapter's own syllabus is now stale:
DuckDB 2.0.0 LTS shipped on 2026-10-21, before this topic was built on 2026-11-02, so the
Quack client-server protocol is documented here as released, not previewed -- the syllabus
clause is quoted as written, and the reveal corrects it against DuckDB's own current release
announcement.

MotherDuck's own account and cloud environment cannot be reached from this sandbox; the hybrid
dual-execution claims are sourced-only from MotherDuck's own documentation, not independently
run here.

Out-of-core processing is demonstrated by the mechanism (`temp_directory`, spilling) and
DuckDB's own documentation of the mechanism, not by actually exceeding this sandbox's memory
limit with a real multi-hundred-GB dataset.
