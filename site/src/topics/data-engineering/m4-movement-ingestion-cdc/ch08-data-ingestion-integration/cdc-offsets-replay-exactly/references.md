Last verified: 1 November 2026. The crash-and-replay, committed-in-time, naive-dedup and
purged-slot measurements (`examples.py`) are direct runs against this sandbox's own real
PostgreSQL 16 cluster, using `pg_logical_slot_peek_changes` and `pg_replication_slot_advance` to
model the separate produce and commit steps Kafka Connect itself performs. Kafka Connect's own
exactly-once transaction behavior and its configuration are quoted from KIP-618 and Confluent's
documentation, not reproduced, since running a real Connect cluster needs a JVM and a broker
this sandbox doesn't have.

- KIP-618, Exactly-Once Support for Source Connectors: [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-618%3A+Exactly-Once+Support+for+Source+Connectors). The atomic write-plus-fencing design, and the exactly.once.source.support property.
- Debezium docs, Exactly-once delivery (EOS): [debezium.io](https://debezium.io/documentation/reference/stable/configuration/eos.html). No internal dedup layer, the documented doubt, the Jepsen reports, the supported connectors.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The at-least-once-by-default behavior when recovering from a fault.
- Confluent docs, Kafka Connect configuration reference (standing in for an unreadable Apache Kafka page, disclosed in SOURCES.md): [docs.confluent.io](https://docs.confluent.io/platform/current/installation/configuration/connect/). The two-rolling-upgrade enablement path.
- Confluent docs, Kafka sink connector configuration reference: [docs.confluent.io](https://docs.confluent.io/platform/current/installation/configuration/connect/sink-connect-configs.html). errors.tolerance, named only.
- PostgreSQL 18 docs, Logical Decoding Concepts: [postgresql.org](https://www.postgresql.org/docs/18/logicaldecoding-explanation.html). The repeated-delivery guarantee a crash leaves behind.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cdc-offsets-replay-exactly:%20).
