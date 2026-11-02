Last verified: 1 November 2026. The envelope-rebuild, unwrap and idempotent-upsert measurements
(`examples.py`) are direct runs against this sandbox's own real PostgreSQL 16 cluster: real
decoded inserts, updates and deletes rebuilt by hand into Debezium's own envelope shape, run
through a hand-built unwrap transform, and applied to a real sink table by a real upsert. A real
Debezium deployment, Kafka Connect cluster and JDBC sink connector are quoted from their own
documentation rather than reproduced, since running any of them needs a JVM and Kafka this
sandbox doesn't have.

- Debezium docs, Release Series 3.7: [debezium.io](https://debezium.io/releases/3.7/). The Java-version split across deployment shapes, and the latest stable release.
- Debezium docs, Architecture: [debezium.io](https://debezium.io/documentation/reference/stable/architecture.html). The three deployment shapes: Kafka Connect, Debezium Server, the embedded engine.
- Debezium docs, Store Debezium state (Debezium Server): [debezium.io](https://debezium.io/documentation/reference/stable/operations/debezium-server.html). Redis Stream as a documented sink target.
- Debezium docs, New Record State Extraction (event flattening): [debezium.io](https://debezium.io/documentation/reference/stable/transformations/event-flattening.html). The unwrap transform's own mechanism and cost.
- Debezium docs, JDBC sink connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/jdbc.html). Idempotent upsert, delete.enabled, schema.evolution = basic.
- Confluent docs, Kafka Connect configuration reference (standing in for an unreadable Apache Kafka page, disclosed in SOURCES.md): [docs.confluent.io](https://docs.confluent.io/platform/current/installation/configuration/connect/). The offset-storage topic, named only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=debezium-architecture-event-model:%20).
