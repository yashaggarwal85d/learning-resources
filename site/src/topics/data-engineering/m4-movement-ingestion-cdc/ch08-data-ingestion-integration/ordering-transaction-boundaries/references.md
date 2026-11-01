Last verified: 1 November 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster, reading a logical-decoding slot's own `lsn`, `xid` and
`data` columns directly, never parsing a transaction id out of decoded text. Debezium's own
transaction-metadata feature (its dedicated topic, its deploy-time limitation, and the
stream-of-in-progress-transaction callbacks) is quoted, not reproduced, since running Debezium
itself needs a JVM and Kafka this sandbox doesn't have.

- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). Transaction metadata (BEGIN/END, txID:LSN, event_count, data_collections) and the change-event key.
- PostgreSQL docs, Logical Decoding Concepts: [postgresql.org](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). A logical slot emits each change just once, only after commit.
- PostgreSQL docs, Logical Decoding Output Plugin Callbacks: [postgresql.org](https://www.postgresql.org/docs/18/logicaldecoding-output-plugin.html). The stream_* callbacks for streaming a large in-progress transaction, named only.
- PostgreSQL 14 Release Notes: [postgresql.org](https://www.postgresql.org/docs/release/14.0/). The addition that lets a long transaction stream to a subscriber before it commits.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=ordering-transaction-boundaries:%20).
