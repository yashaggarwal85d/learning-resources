# Review — de.duckdb-single-node-analytics

## Design: real DuckDB, in-process, no workaround needed

Unlike topics 34 (Trino, hand-built model) and 35 (ClickHouse, embedded via chdb), this topic
needed no workaround at all: DuckDB (`pip install duckdb`, real version 2.0.0 in this sandbox)
is itself an in-process, embeddable engine, so `examples.py` runs the literal real engine
throughout -- no Docker daemon, no server process, confirmed the same way as the prior two
topics.

Six real, executed demos: (1) a measured wall-clock speedup from morsel-driven parallelism
across threads on an identical aggregation; (2) a real out-of-core sort that spills to disk
under a 200MB memory limit and still completes correctly; (3) real direct queries over live
Pandas and Polars DataFrames via DuckDB's replacement scans, no export step; (4) a real local
Iceberg table (built with pyiceberg's SQL catalog) queried directly through DuckDB's iceberg
extension, with a real `EXPLAIN ANALYZE` plan showing the filter pushed into the Parquet scan
and a real bytes-read figure; (5) a real local Delta table (built with delta-rs) queried
directly through DuckDB's delta extension; (6) a real DuckLake-attached table whose catalog
lives in ordinary SQL tables, with two real writes producing two real versioned snapshots.

## Corrections against CHAPTER.md's own syllabus wording

- CHAPTER.md's syllabus line calls DuckDB 2.0's client-server mode "previewed." DuckDB 2.0.0 LTS
  actually shipped as a full release on 2026-10-21 (before this topic was built on 2026-11-02),
  with a polished Quack client-server protocol first introduced in 1.5.3. The syllabus clause is
  quoted verbatim in `coverage.json` (required for the coverage checker), and the reveal states
  the now-released status instead of "previewed," sourced from DuckDB's own 2.0.0 announcement.
  Disclosed in SOURCES.md's Red team section, FACT-CHECK.md, and `coverage.json`'s expert notes.
- CHAPTER.md's own outcome asks to compare DuckDB's real plan and bytes read "against topic 34's
  Trino run on the identical query." Topic 34 never built a literal Iceberg table (no Trino
  cluster can run in this sandbox), so there is no real Trino bytes-read figure to compare
  against. This topic gives DuckDB's own real, measured plan and bytes-read figure on a real
  Iceberg table it builds itself, and states the Trino comparison conceptually (no server process
  at all, versus a coordinator/worker cluster) rather than as a literal side-by-side number.
  Disclosed in the same places.

## Bugs fixed in examples.py

DuckDB 2.0's Python API removed `Relation.fetchone()` ("Relations no longer have fetchone(): a
relation keeps no result between calls, so every call runs it again"). Every call site was
rewritten to `.fetchall()[0][...]`. All deterministic output (row counts, sums, pushdown
confirmation, spill confirmation, snapshot counts) verified byte-identical across 3 full runs.
The morsel-parallelism speedup is wall-clock timing and varies run to run (observed 2.9x-5.6x
across repeated runs); `examples.py` only asserts it stays comfortably above 1x, and the reveal
states the finding qualitatively rather than committing to one exact multiplier.

## Checks run

- Stage 1 (`--skip reels,links,narration --topic
  data-engineering/m2-storage-database-internals/ch06-file-formats-lakehouse/duckdb-single-node-analytics`):
  initially failed the coverage checker because the syllabus clause in `coverage.json` used
  single quotes (`'...'`) instead of the syllabus file's actual straight double quotes
  (`"..."`) around "most analytical data fits on one large node" -- fixed to match
  `syllabus/data-engineering.md` line 370 exactly. Re-run passed clean: locked, docs, sources
  (27/27 quotes word-for-word), build.
- Stage 2 (`--only links,narration`): narration clean (0-3% overlap, well under the 50%
  threshold), 2199 links checked, 0 broken. (Pre-existing title-mismatch warnings on unrelated
  Rust topics are not from this work.)
- Stage 3 (`--only reels`): reel smoke test passed (1 live reel, desktop + phone). The bundled
  `test:editor` step failed with "a save did not open a new GitHub issue" -- the known,
  pre-existing cloud-sandbox-only failure documented from prior topics, not a regression.

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, desktop/phone 02-q and 05-q) reviewed
individually. All clean: text readable, no overlap, predict/reveal/takeaway layouts correct,
Recap step's four-line stat block renders without overflow on phone.

## Scope boundary

MotherDuck's hybrid Dual Execution claims are sourced-only (no MotherDuck account reachable
from this sandbox). The "most analytical data fits on one large node" argument and where it
stops holding is stated from DuckDB's and MotherDuck's own public material, not measured
against a real concurrency/scale boundary here.
