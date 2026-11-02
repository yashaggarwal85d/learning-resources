# Sources — de.cdc-from-oltp-into

`CHAPTER.md` names several candidate sources for this topic (PostgreSQL's logical-decoding and
replication-configuration docs, Debezium's PostgreSQL connector and signalling docs, the DBLog
paper, Iceberg/Delta maintenance docs) and leaves the builder to select and verify at research
time. This topic quotes PostgreSQL's own replication-configuration documentation (the
`max_slot_wal_keep_size` setting this design's cap is built on) and Debezium's PostgreSQL
connector documentation (the WAL-retention guarantee that creates the hazard, and the heartbeat
fix), both fetched and verified directly — satisfying the ≥2-source rule. Chapter 5's
logical-replication topic, Chapter 8's CDC topics, Chapter 6's table-format topics, and Chapter
13's erasure topic are prior topics on this same site, referenced via `uses`, not external
sources.

## PostgreSQL Documentation, "19.6. Replication" (Server Configuration)

URL: https://www.postgresql.org/docs/current/runtime-config-replication.html
Fetched: 2026-10-30.

Quotes:
> Specify the maximum size of WAL files that replication slots are allowed to retain in the pg_wal directory at checkpoint time. If max_slot_wal_keep_size is -1 (the default), replication slots may retain an unlimited amount of WAL files. Otherwise, if restart_lsn of a replication slot falls behind the current LSN by more than the given size, the standby using the slot may no longer be able to continue replication due to removal of required WAL files.

Items: the single setting that bounds a slot's retention, stated exactly, along with its
exact cost — a slot that falls behind by more than the cap can no longer continue, which is the
trade-off this design's own ADR has to name explicitly rather than discover in production.

## Debezium Documentation, "Debezium connector for PostgreSQL"

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-10-30.

Quotes:
> Replication slots are guaranteed to retain all WAL entries that are required for Debezium even during Debezium outages.

> There are many updates in a database that is being tracked but only a tiny number of updates are related to the table(s) and schema(s) for which the connector is capturing changes. This situation can be easily solved with periodic heartbeat events. Set the heartbeat.interval.ms connector configuration property.

Items: (1) the guarantee that makes a stopped connector dangerous — the slot keeps every byte
of WAL the connector hasn't confirmed, outage or not, which is exactly why the hook's stopped
connector becomes a disk-filling hazard rather than a harmless pause; (2) the heartbeat fix for
a slot that would otherwise lag on a quiet table, stated as the connector's own documented
remedy, not an invented workaround.
