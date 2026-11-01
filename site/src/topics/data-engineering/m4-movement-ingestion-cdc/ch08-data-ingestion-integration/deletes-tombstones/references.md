Last verified: 1 November 2026. The before-image and cursor-visibility measurements
(`examples.py`) are direct runs against this sandbox's own real PostgreSQL 16 cluster, including
a real `MERGE` statement against a real landing table. The retention-window race needs a real
Kafka broker this sandbox doesn't have, so it is measured against a hand-built model that
implements Kafka's own documented compaction and retention rule exactly, disclosed as a model
rather than a real broker run. Debezium's own event-flattening SMT and JDBC sink's
`delete.enabled` are quoted, not reproduced, for the same reason.

- Debezium docs, event flattening (New Record State Extraction): [debezium.io](https://debezium.io/documentation/reference/stable/transformations/event-flattening.html). The two-record delete, and the drop/tombstone/rewrite handling modes.
- Confluent docs, log compaction (standing in for an unreadable Apache Kafka 4.4 page, disclosed in SOURCES.md): [docs.confluent.io](https://docs.confluent.io/kafka/design/log_compaction.html). The tombstone definition, the retention default, and the lagging-consumer race.
- Debezium docs, JDBC sink connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/jdbc.html). delete.enabled, named only.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The before field's own tie to REPLICA IDENTITY, and tombstones.on.delete.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=deletes-tombstones:%20).
