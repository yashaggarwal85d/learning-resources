# Fact-check — de.initial-snapshot-stream-handoff

## Claims against sources

1. **A slot created through the replication protocol exports a snapshot showing "exactly the
   state of the database after which all changes will be included in the change stream," usable
   via `SET TRANSACTION SNAPSHOT`.**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 1-3). Direct match.
   Measured directly: `exported_snapshot_shows_exactly_the_state_at_slot_creation` creates a slot
   with `CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT` over the replication protocol, writes a row
   through a second connection, and confirms a third session that imports the snapshot via `SET
   TRANSACTION SNAPSHOT` sees the pre-write count and not the concurrent row.

2. **`pg_export_snapshot()` exports a session's own snapshot, valid only until that session's
   transaction ends; other transactions importing it see exactly the same view.**
   Source: PostgreSQL docs, Server Programming Interface (SOURCES.md quote 4-5). Direct match.
   Named for contrast only — `examples.py` uses the replication-protocol path (a slot's own
   export), not this plain-SQL function, for every measurement, and the distinction is disclosed
   explicitly in `post-notes.md`'s Production section.

3. **The snapshot name returned by `CREATE_REPLICATION_SLOT` is valid only until a new command
   is executed on that connection or the connection is closed.**
   Source: PostgreSQL docs, Streaming Replication Protocol (SOURCES.md quote 6-7). Direct match.
   Confirmed by direct experiment before any topic content was written: a first attempt that
   issued a further command on the replication connection before importing its snapshot produced
   `invalid snapshot identifier`; `_create_exported_snapshot_slot`'s own docstring records this.

4. **"If the connector fails, is rebalanced, or stops after Step 1 begins but before Step 5
   completes, upon restart the connector begins a new snapshot."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 8). Direct match. Reproduced by
   construction, not merely quoted: `a_killed_snapshot_discards_partial_work_and_restarts_from_zero`
   kills a hand-written snapshot loop partway through with a genuinely raised exception, confirms
   the target is partially filled with no completion row recorded, and confirms a restart
   discards that partial state and begins again at row one.

5. **`initial_only`, `no_data` and `when_needed` snapshot modes.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 9-10). Direct match. Named in
   the reel's own final predict question and explain text, contrasting `no_data` (skips the
   snapshot, streams from the slot's own creation point) against `initial_only` (still performs
   a full snapshot before stopping) — not independently reproduced, since building a real
   Debezium connector to exercise each mode is out of this sandbox's reach (no JVM/Kafka).

6. **`serializable` (default, blocks concurrent DDL and index creation) versus `repeatable_read`
   (tolerates a row appearing twice, "tolerable for database mirroring").**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 11). Direct match. Named only,
   in the Recap step and `post-notes.md`, as the documented source of a tolerable overlap,
   contrasted with this topic's own measured no-overlap guarantee.

7. **Hosted options such as RDS and Aurora do not permit global read locks, so the connector
   uses table-level locks instead.**
   Source: Debezium docs, MySQL connector (SOURCES.md quote 13). Direct match. Named only, since
   this sandbox has no MySQL server (confirmed absent in topic 11).

## Predict questions red-teamed

- **Step 2** ("does the restart resume or begin again"): the wrong option claims a mostly
  complete snapshot resumes close to where it stopped. Checked against both the quoted Debezium
  workflow and the measured kill-and-restart lab directly: nothing is recorded as done before
  the very last step, so a restart has no partial state it could resume from even in principle.

- **Step 10** ("which mode fits a connector that only needs fresh rows"): the wrong option
  claims `initial_only` fits, since it also stops after one snapshot. Checked against its own
  documented behaviour: `initial_only` still performs a full snapshot before stopping, which
  `no_data` skips outright — the two modes differ in exactly the dimension the question asks
  about.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic splits at its own semicolon into two clauses: exporting a
consistent snapshot at a known log position so there is no gap and no overlap, and snapshot
modes with restart behaviour. Both are covered — the first by direct measurement against this
sandbox's own PostgreSQL cluster (the exported snapshot, the absence/presence proof, and the
kill-mid-snapshot lab), the second by a combination of direct measurement (the restart-from-zero
rule) and documented naming (the specific mode list, since exercising each mode needs a running
Debezium connector this sandbox cannot host).
No claim here depends on topic 14's incremental-snapshot algorithm, topic 18's offset storage,
topic 21's Flink CDC parallel snapshot, or the full MySQL lock sequence, all named in "Leaves
out."
