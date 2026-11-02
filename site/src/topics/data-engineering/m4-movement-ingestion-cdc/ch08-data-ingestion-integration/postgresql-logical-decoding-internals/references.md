Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster: a real logical replication slot decoded with
`test_decoding`, a row's own primary-key value changed under three `REPLICA IDENTITY` settings,
two transactions committed in the reverse of the order they started, an unconfirmed slot peeked
twice, and `restart_lsn`/`confirmed_flush_lsn` read live from `pg_replication_slots` before and
after a confirmed read. The absence of PostgreSQL 17's `failover` slot argument and
`failover`/`synced` columns on this PostgreSQL 16 server is confirmed directly, not assumed.

- PostgreSQL docs, "Logical Decoding Concepts": [www.postgresql.org](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). The slot, crash-safety and repeat-tolerance mechanics this topic's own measurements read directly.
- PostgreSQL docs, `pg_replication_slots`: [www.postgresql.org](https://www.postgresql.org/docs/current/view-pg-replication-slots.html). `restart_lsn` and `confirmed_flush_lsn`, read live in this topic's own measurements.
- PostgreSQL docs, `ALTER TABLE` (`REPLICA IDENTITY`): [www.postgresql.org](https://www.postgresql.org/docs/current/sql-altertable.html). The four settings exercised directly in the before-image measurement.
- PostgreSQL docs, `CREATE PUBLICATION`: [www.postgresql.org](https://www.postgresql.org/docs/current/sql-createpublication.html). What a publication selects, named in prose.
- PostgreSQL 16 release notes: [www.postgresql.org](https://www.postgresql.org/docs/16/release-16.html). The standby-decoding addition this sandbox's own server can run.
- PostgreSQL 17 release notes: [www.postgresql.org](https://www.postgresql.org/docs/17/release-17.html). The failover-slot addition this sandbox's own server confirms it cannot run.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The two output plugins and the no-primary-key consequence, named in prose.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=postgresql-logical-decoding-internals:%20).
