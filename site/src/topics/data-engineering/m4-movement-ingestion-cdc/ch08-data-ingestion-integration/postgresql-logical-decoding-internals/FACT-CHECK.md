# Fact-check — de.postgresql-logical-decoding-internals

## Claims against sources

1. **"Logical decoding is the process of extracting all persistent changes to a database's
   tables into a coherent, easy to understand format."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 1). Direct match. This
   topic's own `decoding_turns_wal_into_row_changes` reads exactly this mechanism, against the
   sandbox's real PostgreSQL 16 cluster, not a simulation of it.

2. **"Slots persist independently of the connection using them and are crash-safe... the slot
   might return to an earlier LSN, which will then cause recent changes to be sent again when
   the server restarts."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 2). Direct match. This
   topic does not actually crash the server (there is no safe way to do that against a shared
   sandbox cluster other topics' examples also depend on); instead
   `peeking_is_repeatable_tolerating_repeats` measures the structurally identical fact a crash
   would produce — an unconfirmed read handed back twice, byte for byte — and FACT-CHECK says so
   plainly rather than claiming a real crash was reproduced.

3. **"Only one receiver may consume changes from a slot at any given time."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 3). Named in prose
   (pre-notes, reel), not independently re-measured: this fact governs the streaming replication
   protocol's long-lived `START_REPLICATION` connections, not the SQL-callable
   `pg_logical_slot_get_changes`/`peek_changes` functions this topic's own measurements use, and
   a two-session test with those functions (run during planning, not shipped in `examples.py`)
   confirmed they simply serialize rather than reproducing the protocol-level restriction, so it
   would have measured the wrong mechanism.

4. **`restart_lsn` and `confirmed_flush_lsn` definitions.**
   Source: PostgreSQL docs, `pg_replication_slots` (SOURCES.md quotes 4-5). Direct match.
   Measured directly: `confirming_advances_the_flush_point_but_not_the_restart_point` reads both
   columns before and after a real confirmed read and asserts `confirmed_flush_lsn` strictly
   increases while `restart_lsn` does not move.

5. **The four `REPLICA IDENTITY` settings and what each logs.**
   Source: PostgreSQL docs, `ALTER TABLE` (SOURCES.md quotes 6-9). Direct match. Measured
   directly: `before_image_depends_on_replica_identity` changes a row's own primary-key value
   under `DEFAULT`, `FULL` and `NOTHING` in turn and reads each before-image back from
   `test_decoding`'s own output — `DEFAULT` carries only the key column, `FULL` carries every
   column, `NOTHING` carries none.

6. **`decoderbufs` is Protobuf-based and Debezium-maintained; `pgoutput` is PostgreSQL's own
   standard plugin since version 10.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quotes 14-15). Direct match. Named in
   prose (pre-notes, post-notes): this topic's own measurements use `test_decoding`, PostgreSQL's
   built-in plugin for exactly this kind of inspection, not `pgoutput` or `decoderbufs`
   themselves, since reproducing Debezium's own protobuf or logical-streaming-protocol decoding
   is out of scope here (topic 19's subject).

7. **"For a table without a primary key, the connector emits only create events."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 16). Direct match. Named in
   prose only: this is a Debezium connector behaviour layered on top of what PostgreSQL itself
   decodes, not a PostgreSQL-level fact this topic's own `examples.py` could measure without
   running Debezium.

8. **PG16 added logical decoding on standbys; PG17 added failover-synchronised slots and
   `pg_upgrade` preservation of logical slots.**
   Source: PostgreSQL 16 and 17 release notes (SOURCES.md quotes 10-13). Direct match. Measured
   directly, in the negative: `failover_slot_is_not_available_on_this_server` confirms the
   sandbox's own `server_version` starts with `16.` and that `pg_replication_slots` has neither a
   `failover` nor a `synced` column — both PG17 additions — so the failover-slot leg of the lab
   is honestly sourced-only here, not claimed as measured.

9. **Decoding emits transactions in commit order, not start order.**
   Measured directly: `decoding_follows_commit_order_not_start_order` opens two transactions in
   one order, commits them in the reverse order, and confirms the decoded stream reports the
   insert that committed second before the insert that committed first.

## Predict questions red-teamed

- **Step 2** ("does reading the same unconfirmed slot twice return the same data twice"): the
  wrong option claims the slot remembers what it already handed over on a mere read. Checked
  against the PostgreSQL docs directly ("the current position of each slot is persisted only at
  checkpoint") and against `peeking_is_repeatable_tolerating_repeats`'s own measurement: a peek
  never confirms, so the slot's position does not move, and the second peek is identical to the
  first, not empty.

- **Step 10** ("what it takes to keep a consumer running through a real failover"): the wrong
  option claims a slot survives its own server's crash and needs nothing further for a
  failover. Checked against the PostgreSQL 16 and 17 release notes directly: a slot lives only
  on the server that created it; PG16's standby decoding needs `hot_standby_feedback` configured
  on the standby, and PG17's failover slots need the `failover` property, `sync_replication_slots`,
  a named physical slot, and `synchronized_standby_slots` on the primary — none of which exists
  by default, and none of which this PG16 sandbox can even express, confirmed by
  `failover_slot_is_not_available_on_this_server`.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic names seven clauses: WAL and logical decoding, logical
replication slots (including the client-must-tolerate-repeats fact), output plugins
(`pgoutput`/decoderbufs), publications, `REPLICA IDENTITY`, `restart_lsn` against
`confirmed_flush_lsn`, decoding on standbys (PG16), and failover-synchronised slots (PG17). Every
clause is covered — the first six by direct measurement or direct quotation, the last two
(standby decoding and failover slots) necessarily by documentation alone, since this sandbox
runs a single PostgreSQL 16 server and cannot produce a real standby or a real PG17 failover
slot. `CHAPTER.md`'s own "Leaves out" line anticipates exactly this limit ("a real two-node
promotion is sourced-only and disclosed"), and this topic discloses it explicitly rather than
asserting a measurement that didn't happen. No claim here depends on topic 11's other engines,
topic 12's slot-retention incident, or topic 13's snapshot-stream handoff, all named in "Leaves
out" and left untaught here.
