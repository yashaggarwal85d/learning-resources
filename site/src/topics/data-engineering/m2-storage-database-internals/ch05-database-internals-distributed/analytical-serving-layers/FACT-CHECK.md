# Fact-check — de.analytical-serving-layers

## Claim 1: materialized views shift aggregation cost from query time to insert time; a refreshable view's results age until the next refresh
Source: ClickHouse docs, "Materialized views" (SOURCES.md #1).
> "Allow users to shift the cost of computation from query time to insert time, resulting in
> faster SELECT queries."
> "Conceptually similar to incremental materialized views but require the periodic execution of
> the query over the full dataset - the results of which are stored in a target table for
> querying."
Verdict: Confirmed. The first quote names pre-aggregation's own core mechanism (moving work from
read time to write time); the second names the freshness gap a periodically refreshed view
carries by design — results are only as current as the last time the full query ran.

## Claim 2: rollup is ingestion-time pre-aggregation, at the real cost of losing per-event queries
Source: Apache Druid docs, "Data rollup" (SOURCES.md #2).
> "Druid can roll up data at ingestion time to reduce the amount of raw data to store on disk.
> Rollup is a form of summarization or pre-aggregation. Rolling up data can dramatically reduce
> the size of data to be stored and reduce row counts by potentially orders of magnitude. As a
> trade-off for the efficiency of rollup, you lose the ability to query individual events."
Verdict: Confirmed. A real-time OLAP store's own pre-aggregation happens at ingestion rather than
at query time (unlike a periodically refreshed materialized view) or at read time (unlike a raw
warehouse scan), and the engine's own documentation names the real cost directly: individual
events are no longer queryable once rolled up.

## Claim 3 (this course): a precomputed materialized table answers the same query far faster than scanning the raw table
Source: `examples.py`, run directly against a real, in-process DuckDB engine.
Measured: the same aggregate query against a forty-million-row raw table versus a precomputed
eight-row materialized table, confirmed to return the identical answer, measured a speedup in the
tens of times across repeated runs (consistently above the script's own twenty-times assertion
threshold).
Verdict: Confirmed by direct measurement, not asserted from a source.

## Claim 4 (this course): a write to the raw table is invisible in the materialized table until it is refreshed
Source: `examples.py`, run directly.
Measured: a real insert into the raw table is immediately visible in a fresh query against the
raw table itself, but is measurably absent from the materialized table's own total until the
materialized table is explicitly rebuilt — at which point it appears.
Verdict: Confirmed by direct measurement, not asserted from a source.

## Problem Solving
- Both ClickHouse quotes came from a single index page listing each materialized-view type by
  name with a one-line description; both lines fetched cleanly as complete single-line
  descriptions, with no footnote-marker or ellipsis issues.
- The Druid rollup page's own trade-off paragraph is a single continuous block with no interrupting
  markup; quoted in full with no truncation needed.
- No gated-host substitution was needed for either source; both fetched on the first attempt.
- The initial raw-table size (2,000,000 rows) produced only an 8x measured speedup against the
  materialized table — real, but too thin to assert confidently as "orders of magnitude" given
  run-to-run variance on this sandbox's hardware. Increased to 40,000,000 rows, which consistently
  measures a 47-64x speedup across repeated runs; the assertion threshold (20x) was set well below
  the observed range rather than against the headline number, so the check doesn't flake on a
  slower run.
