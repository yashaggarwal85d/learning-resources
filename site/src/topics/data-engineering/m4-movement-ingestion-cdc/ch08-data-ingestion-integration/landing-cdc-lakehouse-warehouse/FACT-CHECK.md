# Fact-check — de.landing-cdc-lakehouse-warehouse

## Claims against sources

1. **"The pseudocolumn _CHANGE_TYPE only accepts the values UPSERT and DELETE."**
   Source: BigQuery docs, Change data capture (SOURCES.md quote 1). Direct match. Named directly
   in the reveal step "a warehouse that lands CDC natively."

2. **"You must declare primary keys for the destination table in BigQuery."** and **"Composite
   primary keys containing up to 16 columns are supported."**
   Source: BigQuery docs, Change data capture (SOURCES.md quotes 2-3). Direct match. Named
   directly in the same reveal step.

3. **"Applying these row modifications at query run time increases query latency and cost."**
   Source: BigQuery docs, Change data capture (SOURCES.md quote 4). Direct match. Named only, in
   `post-notes.md`'s Internals section — the reason `max_staleness` exists at all.

4. **"Named Channels provide ordered, exactly-once ingestion for applications that coordinate
   Snowflake commits with source offsets."**
   Source: Snowflake docs, Snowpipe Streaming Named Channels (SOURCES.md quote 5). Direct
   match. Named directly in the reveal step "a warehouse that lands CDC natively."

5. **"Use them for partitioned sources such as Kafka or Change Data Capture (CDC), where each
   source partition maps to a channel."**
   Source: Snowflake docs, Snowpipe Streaming Named Channels (SOURCES.md quote 6). Direct
   match. Named only, per `post-notes.md`'s Internals section — why Named Channels suit Kafka
   partitions and CDC specifically.

6. **"ingest-to-queryable latency as low as 5 seconds"**
   Source: Snowflake docs, Snowpipe Streaming overview (SOURCES.md quote 7). Direct match.
   Named directly in the same reveal step, disclosed in the reel's own language as a vendor
   figure rather than a measured one.

7. **Iceberg is a documented Flink CDC pipeline sink.**
   Source: Flink CDC docs, Iceberg pipeline connector (SOURCES.md, named only, re-used from
   topic 21). Direct match (confirmed live in topic 21's own `SOURCES.md`). Named directly in
   the reveal step "streaming upserts into a merge-on-read table," as one of the examples
   CHAPTER.md names for a streaming-upsert sink.

8. **Debezium's JDBC sink uses an idempotent-upsert mode.**
   Source: Debezium docs, JDBC sink connector (SOURCES.md, named only, re-used from topic 19).
   Direct match. Named only in `post-notes.md`'s Internals section, as the single-target
   precedent this topic generalizes to a lakehouse current-state table.

9. **"this sync mode will combine the two rows in the destination and use the most recent
   data"**
   Source: Airbyte docs, Incremental | Append + Deduped (SOURCES.md quote 8). Direct match.
   Named only in `post-notes.md`'s Internals section, as a vendor-managed contrast to this
   topic's own hand-built LSN tiebreak.

## Measured claims (examples.py, against a real Postgres change stream landed into a real DuckDB database)

- **Append-then-periodic-MERGE lands the real change stream correctly.** Measured directly:
  `append_then_periodic_merge_lands_the_real_change_stream_in_a_current_state_table` decodes a
  real insert, insert, update and delete from a real PostgreSQL logical replication slot,
  appends all four into a DuckDB raw log, and confirms a real `MERGE INTO` statement — choosing
  per key the row with the greatest LSN — lands exactly the same final state the source table
  itself ended at.

- **Streaming upserts are current immediately, with the superseded row still physically
  present until compaction.** Measured directly: a read-time merge after each write sees the
  correct current value with zero wait, while the raw data-file table still holds three rows
  for two live keys until a real compaction step rewrites it down to two.

- **The MERGE converges on the same answer regardless of arrival order, because it compares
  LSN, not arrival order.** Measured directly: the same three real decoded events, fed to a
  fresh LSN-ordered MERGE in true order and in reversed order, land on the identical final
  value both times; a naive arrival-order merge with no LSN comparison lands the wrong, older
  value when fed the reversed order, confirmed to diverge from the LSN-ordered result.

- **Compaction cost scales with update rate, not with key count.** Measured directly: twenty
  keys updated once each produce twenty superseded rows; the same twenty keys updated five times
  each produce exactly one hundred — a five-times increase matching the five-times increase in
  update count — while both landings' own current-state table stays at exactly twenty rows.

## Predict questions red-teamed

- **Step 2** ("is append-then-MERGE naturally protected"): the wrong option claims
  append-then-MERGE is safe simply because it waits before merging. Checked against the
  measured mechanism directly: the naive-arrival-order-merge function in `examples.py` is
  itself a periodic-style merge (one event applied at a time, no streaming-upsert read-time
  component) and it still lands the wrong value under reversed arrival — proving that waiting
  to merge, by itself, does nothing without an explicit LSN comparison.

- **Step 10** ("Prove it"): the wrong option claims the current-state table's own row count
  grows with update rate. Checked against the measured compaction function directly: raising
  the update count per key from one to five left the current-state table at exactly twenty rows
  both times, while the superseded-row count rose from twenty to one hundred — the table that
  actually grows without bound is the one accumulating superseded rows, not the one holding
  distinct keys.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own four semicolons into five clauses:
append-only change log plus periodic MERGE versus streaming upserts into MOR tables; ordering by
source LSN, not arrival time; compaction cost of high-update tables; warehouse-native CDC
ingestion; and topic-to-table materialisation. All five are covered — the first two reveal steps
for the landing strategies, the predict/reveal pair for LSN ordering, the compaction-cost reveal,
the warehouse-native reveal, and the topic-to-table reveal. No claim here depends on Flink's or
Spark's own streaming sink mechanics, commit frequency and small files, table maintenance as a
scheduled job, the medallion layers, or SCD2 history built from CDC, all named in CHAPTER.md's
own "Leaves out" line. This topic's own disclosed scope decision — no Iceberg or Paimon table
format is available in this sandbox, so `examples.py` runs its lab on a real DuckDB database
instead, per CHAPTER.md's own disclosed fallback ("on Chapter 6's table-format library if live,
else on DuckDB, disclosed") — is recorded in `SOURCES.md` and `REVIEW.md` rather than left
unexplained.
