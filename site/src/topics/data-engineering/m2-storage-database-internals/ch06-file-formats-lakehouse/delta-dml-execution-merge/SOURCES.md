## Delta Lake, Transaction Log Protocol

URL: https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
Version: latest (fetched 2026-11-02)

> Row Tracking is a feature that allows the tracking of rows across multiple versions of a Delta
> table. It enables this by exposing two metadata columns: Row IDs, which uniquely identify a row
> across multiple versions of a table, and Row Commit Versions, which make it possible to check
> whether two rows with the same ID in two different versions of the table represent the same
> version of the row.

> A **fresh** or unstable **Row ID**. This ID uniquely identifies the row within one version of
> the table. The fresh ID of a row may change every time the table is updated, even for rows that
> are not modified.

> A **stable Row ID**. This ID uniquely identifies the row across versions of the table and across
> updates. When a row is inserted, it is assigned a new stable Row ID that is equal to the fresh
> Row ID. When a row is updated or copied, the stable Row ID for this row is preserved.

> The default generated Row IDs for data files are calculated by adding
> the `baseRowId` of the file in which a row is contained to the (physical) position (index) of
> the row within the file. Default generated Row IDs require little storage overhead but are
> reassigned every time a row is updated or moved to a different file

> Materialized Row IDs provide a mechanism for writers to preserve stable Row IDs for rows that
> are updated or copied.

## Delta Lake, Concurrency control

URL: https://docs.delta.io/latest/concurrency-control.html
Version: latest (fetched 2026-11-02)

> The following table describes which pairs of write operations can conflict. Compaction refers
> to file compaction operation written with the option dataChange set to false.

> This exception occurs when a concurrent operation deleted a file that your operation read.
> Common causes are a DELETE, UPDATE, or MERGE operation that rewrites files.

> Before committing the changes, checks whether the proposed changes conflict with any other
> changes that may have been concurrently committed since the snapshot that was read. If there are
> no conflicts, all the staged changes are committed as a new versioned snapshot, and the write
> operation succeeds. However, if there are conflicts, the write operation fails with a concurrent
> modification exception rather than corrupting the table as would happen with the write operation
> on a Parquet table.

## Databricks, Low shuffle merge on Databricks

URL: https://docs.databricks.com/aws/en/optimizations/low-shuffle-merge
Version: latest (fetched 2026-11-02)

> Delta Lake updates a table by rewriting whole data files. When a MERGE command updates or
> deletes a few rows in a file, it must also rewrite every unmodified row in that file. Without
> low shuffle merge, those unmodified rows pass through the same shuffle stages as the modified
> rows. This makes MERGE slower and scrambles the existing data layout, so later queries also slow
> down.

> Low shuffle merge is the optimized Databricks implementation of MERGE. It processes unmodified
> rows separately from modified rows, without shuffles or other expensive calculations. As a
> result, MERGE shuffles much less data and runs faster.

> Low shuffle merge tries to preserve the existing layout of unmodified rows, including liquid
> clustering layout. As a result, performance degrades more slowly after one or more MERGE
> commands, and you need to run OPTIMIZE less often.

### Red team

- No `deltalake`/`delta-rs` library is used anywhere in `examples.py`, matching this chapter's
  established convention: plain CSV data files, a real versioned commit log on local disk (the
  same put-if-absent primitive topics 13 and 28 used, without a real S3 server since this topic's
  focus is DML, not the commit mechanism itself), and a deletion vector reusing the exact
  array-container shape `de.deletion-vectors-across-formats` already built.
- Low-shuffle merge is named and sourced but not reproduced in code: it is a physical-execution
  optimization inside a real distributed query engine's shuffle planner, and this sandbox has no
  such engine to measure it against. Disclosed in FACT-CHECK.md.
- Change Data Feed is named, not rebuilt: `de.incremental-reads-change-feeds` (topic 20) already
  built it for real, and CHAPTER.md's own scope line treats this as a cross-reference, not new
  content.
- Demo 1's "deletion vector mode" bytes-written figure (the DV plus a small new-rows file) is
  compared against the same demo's full-rewrite bytes-written figure on the same matched-row set
  and the same original file, so the ratio is a real, directly comparable measurement — not two
  different workloads compared against each other.
- Demo 2's conflict check (read-set intersects a concurrent commit's remove-set) is a direct
  reproduction of the specific conflict pair Delta's own docs name (MERGE INTO vs. COMPACTION,
  "can conflict") and the specific exception described (ConcurrentDeleteReadException) — it is not
  Delta's full conflict-detection surface, which also covers ConcurrentAppendException,
  MetadataChangedException, and others not exercised by this topic's two-writer scenario.
