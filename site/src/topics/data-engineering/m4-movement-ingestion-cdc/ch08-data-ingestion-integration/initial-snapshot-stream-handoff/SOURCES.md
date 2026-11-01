# Sources — de.initial-snapshot-stream-handoff

## PostgreSQL docs: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/current/logicaldecoding-explanation.html
Fetched: 2026-10-31.

Quotes:
> When a new replication slot is created using the streaming replication interface (see CREATE_REPLICATION_SLOT), a snapshot is exported (see Section 9.28.5), which will show exactly the state of the database after which all changes will be included in the change stream.

> This can be used to create a new replica by using SET TRANSACTION SNAPSHOT to read the state of the database at the moment the slot was created. This transaction can then be used to dump the database's state at that point in time, which afterwards can be updated using the slot's contents without losing any changes.

> Applications that do not require snapshot export may suppress it with the SNAPSHOT 'nothing' option.

Items: the exact mechanism `examples.py`'s `exported_snapshot_pins_exactly_the_slots_start_position`
measures live on this sandbox — a slot creates a snapshot, a second session reads the table as
of that snapshot via `SET TRANSACTION SNAPSHOT`, and the slot's own stream begins exactly after it.

## PostgreSQL docs: Server Programming Interface (snapshot synchronization functions)

URL: https://www.postgresql.org/docs/current/functions-admin.html
Fetched: 2026-10-31.

Quotes:
> As long as the exporting transaction remains open, other transactions can import its snapshot, and thereby be guaranteed that they see exactly the same view of the database that the first transaction sees.

> pg_export_snapshot () → text Saves the transaction's current snapshot and returns a text string identifying the snapshot. This string must be passed (outside the database) to clients that want to import the snapshot. The snapshot is available for import only until the end of the transaction that exported it.

Items: `pg_export_snapshot`, the plain-SQL counterpart to the replication protocol's own
`EXPORT_SNAPSHOT` option, named for contrast with the slot-creation path `examples.py` actually
uses (a logical slot's own export, not a standalone `pg_export_snapshot` call).

## PostgreSQL docs: Streaming Replication Protocol (`CREATE_REPLICATION_SLOT`)

URL: https://www.postgresql.org/docs/current/protocol-replication.html
Fetched: 2026-10-31.

Quotes:
> snapshot_name (text) The identifier of the snapshot exported by the command. The snapshot is valid until a new command is executed on this connection or the replication connection is closed. Null if the created slot is physical.

> CREATE_REPLICATION_SLOT slot_name [ TEMPORARY ] { PHYSICAL [ RESERVE_WAL ] | LOGICAL output_plugin [ EXPORT_SNAPSHOT | NOEXPORT_SNAPSHOT | USE_SNAPSHOT | TWO_PHASE ] }

Items: the exact lifetime rule `examples.py` had to discover empirically before it could be
measured correctly — the exported snapshot name is usable only while the replication connection
that created it has issued no further command and stays open; this is why `examples.py` keeps
that connection idle until the import side is done with it.

## Debezium docs: PostgreSQL connector (snapshot workflow, modes, isolation, chunk-based snapshots)

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-10-31 (reused from this chapter's topic 9 fetch).

Quotes:
> If the connector fails, is rebalanced, or stops after Step 1 begins but before Step 5 completes, upon restart the connector begins a new snapshot.

> initial_only The connector performs a database snapshot and stops before streaming any change event records. If the connector had started but did not complete a snapshot before stopping, the connector restarts the snapshot process and stops when the snapshot completes.

> no_data The connector never performs snapshots. When a connector is configured this way, after it starts, it behaves as follows: If there is a previously stored LSN in the Kafka offsets topic, the connector continues streaming changes from that position. If no LSN is stored, the connector starts streaming changes from the point at which the PostgreSQL logical replication slot was created on the server. Use this snapshot mode only when you know that all data of interest is still reflected in the WAL.

> when_needed After the connector starts, it performs a snapshot only if it detects one of the following circumstances: It cannot detect any topic offsets. A previously recorded offset specifies a log position that is not available on the server.

> To ensure the data consistency of captured tables, a snapshot runs in a transaction that uses a repeatable read isolation level, blocking concurrent DDL changes on the tables, and locking the database to index creation.

> repeatable_read Prevents other transactions from updating table rows during the snapshot. New records captured by the snapshot can appear twice; first, as part of the initial snapshot, and then again in the streaming phase. However, this level of consistency is tolerable for database mirroring.

> Chunk-based parallel snapshotting accelerates initial snapshots by distributing smaller units of work across multiple threads, improving workload balance and snapshot resilience. Chunk-based parallel snapshotting is currently in an incubating state and is subject to change without notice in future releases.

Items: the restart-from-zero rule this topic's own hook and kill-mid-snapshot lab reproduce by
construction; the `initial_only`/`no_data`/`when_needed` mode descriptions (alongside `initial`
and `always`, already quoted in this chapter's own prior topics); the `serializable` vs
`repeatable_read` isolation contrast, named as the documented source of a tolerable overlap;
`snapshot.max.threads` chunk-based snapshotting, named only, since topic 14 (DBLog chunking) and
topic 21 (Flink CDC) are where a chunked snapshot is actually built.

## Debezium docs: MySQL connector (global read lock vs. table-level locks)

URL: https://debezium.io/documentation/reference/stable/connectors/mysql.html
Fetched: 2026-10-31 (reused from this chapter's topic 11 fetch).

Quotes:
> Because these hosted options do not permit the use of global read locks, the connector uses table-level locks when it creates a consistent snapshot.

Items: the brief-lock alternative to an exported snapshot, named for contrast — this sandbox has
no MySQL server (confirmed absent in topic 11), so this is quoted only, not measured.
