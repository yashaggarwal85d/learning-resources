# Fact-check — de.replication-slot-wal-retention

## Claims against sources

1. **"Replication slots persist across crashes and know nothing about the state of their
   consumer(s)... This consumes storage because neither required WAL nor required rows from
   the system catalogs can be removed by VACUUM."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 1). Direct match.
   Measured directly: `a_stalled_slot_pins_growing_wal` creates a slot with no reader, applies a
   real write load, and reads the retained-WAL gap from `pg_replication_slots` strictly larger
   afterward, against this sandbox's own PostgreSQL cluster, not an estimate.

2. **`max_slot_wal_keep_size`'s own definition and default of -1 (unlimited).**
   Source: PostgreSQL docs, Replication configuration (SOURCES.md quote 2). Direct match.
   Measured directly: `max_slot_wal_keep_size_trades_disk_for_a_lost_stream` confirms the
   sandbox's own default is `-1` before changing anything, sets a real `1MB` value via `ALTER
   SYSTEM` and `pg_reload_conf()`, drives a real slot from `reserved` to `lost` through genuine
   write volume and checkpoints, and confirms PostgreSQL's own invalidation error on the next
   read attempt — then resets the setting and confirms the reset took effect, leaving the
   cluster as every other topic in this chapter needs it.

3. **`restart_lsn`'s own definition.**
   Source: PostgreSQL docs, `pg_replication_slots` (SOURCES.md quote 3). Direct match. Read live
   in `the_lag_query_reads_two_separate_gaps`, alongside `pg_current_wal_lsn()` and
   `pg_wal_lsn_diff`, confirming the restart gap is never smaller than the confirmed-flush gap.

4. **The two Debezium-named cases where a healthy connector's slot does not advance (a
   low-traffic captured table inside a busier database; a quiet database sharing WAL with a
   busy one), and the AWS RDS five-minute-invisibility case.**
   Source: Debezium docs, PostgreSQL connector, "WAL disk space consumption" (SOURCES.md
   quotes 4-6). Direct match. Named in prose only (pre-notes, post-notes, reel): reproducing
   either variant needs a second database or a real AWS RDS instance, neither of which this
   sandbox has, so these are disclosed as sourced rather than measured, consistent with
   `CHAPTER.md`'s own framing of the stalled-consumer leg as the one the sandbox actually hosts.

5. **The heartbeat mechanism's effect on a stalled slot.**
   `CHAPTER.md`: "Demonstrated with a hand-written consumer that mimics the connector's confirm
   behaviour." Modelled directly, per this exact instruction: in
   `a_consumer_that_periodically_confirms_bounds_the_gap`, the identical total write volume is
   split into five pieces; one slot's consumer never confirms between pieces, the other's
   confirms (and checkpoints) after every piece. The confirming slot's final retained-WAL gap is
   measured strictly smaller — the real mechanism a heartbeat buys a connector, demonstrated
   without running Debezium itself.

## Predict questions red-teamed

- **Step 2** ("can a connector that looks completely healthy still be the reason WAL keeps
  growing"): the wrong option claims a healthy, connected connector is by definition confirming
  its own progress. Checked against the Debezium quote and the measured fact directly: a slot
  advances only when its consumer confirms a new position, and nothing requires a connector to
  have anything to confirm just because it is alive and connected — the hook's own quiet
  database is exactly this case.

- **Step 10** ("what should actually trigger the alarm"): the wrong option claims connector
  status is the right signal, since that's what every dashboard already shows. Checked against
  the hook's own premise directly: the connector reported healthy the entire weekend the disk
  was filling, so connector status provably cannot be the signal that would have caught this
  incident before it reached the disk.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic names four clauses: a stalled or slow consumer pinning
WAL, the idle-captured-table and multi-database variants, heartbeats and
`heartbeat.action.query`, `max_slot_wal_keep_size` as a safety valve, and monitoring slot lag.
All five are covered — the first, third (as a heartbeat-equivalent), fourth and fifth by direct
measurement against this sandbox's own PostgreSQL cluster, the second by direct quotation of
Debezium's own documented cases, since this sandbox has no second database or AWS RDS instance
to reproduce them against. No claim here depends on topic 10's own slot and LSN model (used, not
re-taught), topics 13-14's re-snapshot procedure after a lost slot, Chapter 13's general
monitoring and alerting practice, or Chapter 5 topic 7's vacuum and xmin-horizon mechanics, all
named in "Leaves out."
