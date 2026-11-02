# OUTLINE: Landing CDC in lakehouse and warehouse (`de.landing-cdc-lakehouse-warehouse`)

## Learning outcomes
1. Land a change stream in a table by append-then-MERGE and by streaming upsert, and say what
   each costs in freshness, write and read amplification.
2. Make the landing order-independent by choosing the winner by source LSN.
3. Describe BigQuery's and Snowpipe's native CDC paths and pick a landing strategy for a given
   update rate and freshness SLO.

## Engagement arc
- Hook: step 1 (a replayed batch and a live event for the same order, in opposite order, and
  the lakehouse keeps the older value).
- Predict: step 2 (is append-then-MERGE naturally protected from this); step 10 (which cost
  grows without bound under a high update rate with no compaction).
- Takeaways: step 5 (the winner is decided by source position, never arrival), step 6 (a
  streaming upsert's own freshness is paid for later, in compaction), step 9 (recap: no strategy
  escapes the trade, only moves it).

## Steps (storyboard)

### 1. Hook
- **fig:** a replayed batch and a live event for the same order arrive in opposite order, and
  the lakehouse keeps the older value.

### 2. Predict
- **fig:** does append-then-MERGE protect against this on its own, or can the same bug still
  reach it?
- **Options:** (a) naturally safe, since it waits before merging [wrong]; (b) the same bug
  reaches any merge without an LSN comparison [correct].

### 3. Reveal — append-only change log, periodic MERGE
- **fig:** every change appended first; every few minutes, MERGE takes the latest per key.

### 4. Reveal — streaming upserts into a merge-on-read table
- **fig:** each change as a data file plus a marker; current within seconds, merged at read
  time until compaction.

### 5. Reveal — the winner is the greater source LSN
- **fig:** the MERGE compares LSN, not arrival order.
- **takeaway:** "The winner of two changes to the same row is decided by source position, never
  by arrival."

### 6. Reveal — compaction's own cost scales with update rate
- **fig:** a high-update table produces proportionally more files for compaction to rewrite.
- **takeaway:** "A streaming upsert's own freshness is paid for later, in exactly the files
  compaction has to rewrite."

### 7. Reveal — a warehouse that lands CDC natively
- **fig:** BigQuery's UPSERT/DELETE on a declared key; Snowpipe Streaming's Named Channels.

### 8. Reveal — turning a topic into a table without hand-writing the merge
- **fig:** a third way to the same table, the merge managed rather than hand-written.

### 9. Recap
- **fig:** both landing strategies, the LSN tiebreak, compaction's own cost, two warehouse
  paths.
- **takeaway:** "Freshness, write cost and read cost trade against each other; no strategy
  escapes the trade, only moves it."

### 10. Prove it
- **fig:** a high-update table, never compacted — which cost grows without bound?
- **predict options:** (a) the current-state table itself [wrong]; (b) the superseded rows
  piling up in the data files [correct].

## Post-notes headings
- **Internals:** measured directly against a real Postgres change stream landed into a real
  DuckDB database; no real lakehouse table format is available, disclosed.
- **Production:** merging by arrival order instead of LSN, and choosing streaming upserts for a
  high-update table without planning for compaction.
- **Frontier:** Flink's/Spark's own sink mechanics, table maintenance, the medallion layers, and
  SCD2 history from CDC, named only.
- **Where this goes next:** whether two systems' rows describe the same customer, and who owns
  the truth.

## Concept ledger
- **Introduces:** `cdc-landing-strategies`, `lsn-ordered-merge`.
- **Uses:** `cdc-delete-tombstone`, `cdc-source-offset-vs-kafka-offset`,
  `debezium-architecture-envelope`, `raw-layer-replay-metadata`, `lakehouse-merge-rewrite`,
  `merge-statement`, `scd-type-2`, `flink-cdc-kafkaless-pipeline` — all confirmed live.
- **Declared:** copy-on-write vs merge-on-read (Chapter 6 topic 14 teaches it).

## Changes from the chapter plan
No real Iceberg or Paimon table format is available in this sandbox (no JVM, no `pyiceberg`).
CHAPTER.md's own "Lab" line discloses exactly this fallback ("on Chapter 6's table-format
library if live, else on DuckDB, disclosed"); `examples.py` runs its lab on a real DuckDB
database instead, with a real `MERGE INTO` statement standing in for a lakehouse's periodic
MERGE.

## Claims list (for fact-check)
1. BigQuery's `_CHANGE_TYPE`, primary-key requirement and `max_staleness` — SOURCES.md; named
   directly in the reveal.
2. Snowpipe Streaming's Named Channels, offset tokens and latency figure — SOURCES.md; named
   directly in the reveal, latency disclosed as a vendor figure.
3. Append-then-MERGE and streaming-upsert landing, measured directly against a real decoded
   change stream — examples.py.
4. LSN-ordered convergence under reversed replay, measured directly — examples.py.
5. Compaction cost scaling with update rate, measured directly at two rates — examples.py.
