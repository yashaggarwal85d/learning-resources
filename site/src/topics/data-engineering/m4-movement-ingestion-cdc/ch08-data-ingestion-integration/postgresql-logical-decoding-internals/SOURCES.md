# Sources — de.postgresql-logical-decoding-internals

`CHAPTER.md` names: PostgreSQL 18 logical decoding concepts, `pg_replication_slots`,
`ALTER TABLE ... REPLICA IDENTITY`, `CREATE PUBLICATION`, the logical streaming replication
protocol and message formats pages, the PostgreSQL 16 and 17 release notes, and Debezium's
PostgreSQL connector page. All are quoted below except the message-formats page, which this
topic does not cite directly since its own measurements read decoded output through
`test_decoding`, not the wire protocol's binary message layout.

## PostgreSQL docs: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/current/logicaldecoding-explanation.html
Fetched: 2026-10-31.

Quotes:
> Logical decoding is the process of extracting all persistent changes to a database's tables into a coherent, easy to understand format which can be interpreted without detailed knowledge of the database's internal state.

> Slots persist independently of the connection using them and are crash-safe. A logical slot will emit each change just once in normal operation. The current position of each slot is persisted only at checkpoint, so in the case of a crash the slot might return to an earlier LSN, which will then cause recent changes to be sent again when the server restarts.

> Only one receiver may consume changes from a slot at any given time.

Items: the mechanism this topic measures directly (`pg_create_logical_replication_slot`,
`pg_logical_slot_get_changes`, `pg_logical_slot_peek_changes`); the crash-and-repeats fact is
the chapter's central at-least-once claim, modelled in `examples.py` by two repeatable peeks of
the identical unconfirmed data; the one-receiver fact is named here, not independently
re-measured, since it governs the streaming replication protocol's long-lived connections, not
the SQL-callable functions this topic's own measurements use.

## PostgreSQL docs: `pg_replication_slots`

URL: https://www.postgresql.org/docs/current/view-pg-replication-slots.html
Fetched: 2026-10-31.

Quotes:
> The address (LSN) of oldest WAL which still might be required by the consumer of this slot and thus won't be automatically removed during checkpoints unless this LSN gets behind more than max_slot_wal_keep_size from the current LSN.

> The address (LSN) up to which the logical slot's consumer has confirmed receiving data. Data corresponding to the transactions committed before this LSN is not available anymore.

Items: `restart_lsn` and `confirmed_flush_lsn`, read live from this view in `examples.py` before
and after a real confirmed read, showing the flush point move and the restart point lag behind
it — the gap the server retains on the slot's behalf.

## PostgreSQL docs: `ALTER TABLE` (`REPLICA IDENTITY`)

URL: https://www.postgresql.org/docs/current/sql-altertable.html
Fetched: 2026-10-31.

Quotes:
> This form changes the information which is written to the write-ahead log to identify rows which are updated or deleted.

> Records the old values of the columns of the primary key. This is the default for non-system tables. When there is no primary key, the behavior is the same as NOTHING.

> Records the old values of all columns in the row.

> Records no information about the old row.

Items: the four `REPLICA IDENTITY` settings, measured directly in `examples.py` by updating a
test row's own primary-key value under `DEFAULT`, `FULL` and `NOTHING` and reading each
before-image back from the decoded `test_decoding` output.

## PostgreSQL docs: `CREATE PUBLICATION`

URL: https://www.postgresql.org/docs/current/sql-createpublication.html
Fetched: 2026-10-31.

Quotes:
> CREATE PUBLICATION adds a new publication into the current database.

> A publication is essentially a group of tables whose data changes are intended to be replicated through logical replication.

Items: what a publication is, named in prose in `pre-notes.md` and the reel; this topic does not
create one of its own, since Debezium's own `publication.autocreate.mode` behaviour (named by
`CHAPTER.md`) belongs to topic 19's connector, not this topic's own measurements.

## PostgreSQL 16 release notes

URL: https://www.postgresql.org/docs/16/release-16.html
Fetched: 2026-10-31.

Quotes:
> Allow logical decoding on standbys

Items: confirms the PG16 feature this topic names but cannot exercise (the sandbox has one
server, not a primary-and-standby pair); `examples.py`'s own `server_version` check confirms the
sandbox runs 16.x, which is what makes this feature nameable at all but the failover feature
(PG17) unavailable.

## PostgreSQL 17 release notes

URL: https://www.postgresql.org/docs/17/release-17.html
Fetched: 2026-10-31.

Quotes:
> Enable the failover of logical slots

> Have pg_upgrade migrate valid logical slots and subscriptions

Items: confirms both the PG17 failover-slot feature and the PG17 `pg_upgrade` improvement
`CHAPTER.md` names; `examples.py` confirms directly that this sandbox's `pg_replication_slots`
view has neither a `failover` nor a `synced` column, since both were added in PG17 and this
sandbox runs 16 — the failover-slot leg of the lab is sourced from this page, not measured, as
`CHAPTER.md` itself allows ("as far as one machine allows").

## Debezium docs: PostgreSQL connector

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-10-31.

Quotes:
> decoderbufs Decoding plug-in that is based on Protobuf and maintained by the Debezium community.

> For a table without a primary key, the connector emits only create events.

Items: the two output plugins and the Debezium-specific consequence of a missing primary key
under `REPLICA IDENTITY DEFAULT`, both named in prose since they describe Debezium's own
connector behaviour (topic 19's subject), not PostgreSQL's own decoded output, which
`examples.py` measures directly instead.
