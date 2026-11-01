# Sources — de.replication-slot-wal-retention

## PostgreSQL docs: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/current/logicaldecoding-explanation.html
Fetched: 2026-10-31.

Quotes:
> Replication slots persist across crashes and know nothing about the state of their consumer(s). They will prevent removal of required resources even when there is no connection using them. This consumes storage because neither required WAL nor required rows from the system catalogs can be removed by VACUUM as long as they are required by a replication slot.

Items: the stalled-slot caution this topic's own `a_stalled_slot_pins_growing_wal` measures
directly, on this sandbox's own PostgreSQL cluster.

## PostgreSQL docs: Replication configuration

URL: https://www.postgresql.org/docs/current/runtime-config-replication.html
Fetched: 2026-10-31.

Quotes:
> Specify the maximum size of WAL files that replication slots are allowed to retain in the pg_wal directory at checkpoint time. If max_slot_wal_keep_size is -1 (the default), replication slots may retain an unlimited amount of WAL files.

> Invalidate replication slots that have remained inactive (not used by a replication connection) for longer than this duration.

Items: `max_slot_wal_keep_size` and `idle_replication_slot_timeout`, the two safety valves named
directly, the first exercised live against a real `lost` slot in `examples.py`.

## PostgreSQL docs: `pg_replication_slots`

URL: https://www.postgresql.org/docs/current/view-pg-replication-slots.html
Fetched: 2026-10-31.

Quotes:
> The address (LSN) of oldest WAL which still might be required by the consumer of this slot and thus won't be automatically removed during checkpoints unless this LSN gets behind more than max_slot_wal_keep_size from the current LSN.

Items: `restart_lsn`, the column `examples.py`'s lag-monitoring function reads directly, before
and after a real confirmed read, alongside `pg_current_wal_lsn()` and `pg_wal_lsn_diff`.

## Debezium docs: PostgreSQL connector ("WAL disk space consumption")

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-10-31 (reused from this chapter's topic 9 fetch).

Quotes:
> There are many updates in a database that is being tracked but only a tiny number of updates are related to the table(s) and schema(s) for which the connector is capturing changes. This situation can be easily solved with periodic heartbeat events.

> Debezium then cannot confirm the LSN as replication slots work per-database and Debezium is not invoked. As WAL is shared by all databases, the amount used tends to grow until an event is emitted by the database for which Debezium is capturing changes.

> For users on AWS RDS with PostgreSQL, a situation similar to the high traffic/low traffic scenario can occur in an idle environment. AWS RDS causes writes to its own system tables to be invisible to clients on a frequent basis (5 minutes).

Items: the two named variants where a healthy connector's slot still does not advance (a
low-traffic captured table; a quiet database sharing WAL with a busy one) and the AWS RDS case —
all three named in prose, since reproducing a second database or an actual RDS instance is out
of this sandbox's reach; the heartbeat mechanism itself is modelled directly in `examples.py`'s
own hand-written confirming consumer, per `CHAPTER.md`'s own instruction ("Demonstrated with a
hand-written consumer that mimics the connector's confirm behaviour").
