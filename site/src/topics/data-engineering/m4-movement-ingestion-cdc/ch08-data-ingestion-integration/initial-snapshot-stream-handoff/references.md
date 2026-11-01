Last verified: 1 November 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster: a real `CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT`
call over the replication protocol, a real `SET TRANSACTION SNAPSHOT` import in a second
session, and a hand-written snapshot-then-stream loop genuinely killed with a raised exception
partway through, then restarted and diffed row for row against its own source. The MySQL
global-read-lock alternative is quoted, not reproduced, since this sandbox has no MySQL server
(confirmed absent in topic 11).

- PostgreSQL docs, "Logical Decoding Concepts": [www.postgresql.org](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). The exported-snapshot mechanism this topic measures directly.
- PostgreSQL docs, "Server Programming Interface": [www.postgresql.org](https://www.postgresql.org/docs/current/functions-admin.html). `pg_export_snapshot`, named for contrast with a slot's own export.
- PostgreSQL docs, "Streaming Replication Protocol": [www.postgresql.org](https://www.postgresql.org/docs/current/protocol-replication.html). `CREATE_REPLICATION_SLOT` and the exported snapshot's own lifetime rule.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). Snapshot modes, isolation modes, and the restart-from-zero rule.
- Debezium docs, MySQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/mysql.html). The global-read-lock alternative, named for contrast only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=initial-snapshot-stream-handoff:%20).
