Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster: a stalled slot's retained-WAL gap measured before and
after a real write load, a hand-written confirming consumer standing in for a heartbeat, and a
real `max_slot_wal_keep_size` set via `ALTER SYSTEM`, driving a real slot from `reserved` to
`lost` and reset afterward. The AWS RDS and multi-database variants Debezium names are quoted,
not reproduced, since this sandbox has one database and no RDS instance.

- PostgreSQL docs, "Logical Decoding Concepts": [www.postgresql.org](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). The stalled-slot caution this topic's own measurement reproduces.
- PostgreSQL docs, "Replication configuration": [www.postgresql.org](https://www.postgresql.org/docs/current/runtime-config-replication.html). `max_slot_wal_keep_size` and `idle_replication_slot_timeout`.
- PostgreSQL docs, `pg_replication_slots`: [www.postgresql.org](https://www.postgresql.org/docs/current/view-pg-replication-slots.html). `restart_lsn`, read live in the lag-monitoring measurement.
- Debezium docs, PostgreSQL connector ("WAL disk space consumption"): [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The idle-captured-table, multi-database and AWS RDS variants, named in prose.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=replication-slot-wal-retention:%20).
