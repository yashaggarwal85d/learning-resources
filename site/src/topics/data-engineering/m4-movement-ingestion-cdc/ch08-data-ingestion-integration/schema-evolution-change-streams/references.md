Last verified: 1 November 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster and a real DuckDB sink reached from the same process: a
real `ALTER TABLE` decoded directly, a column added and dropped, a column widened and a column
narrowed, each applied by hand to the sink. Debezium's own MySQL schema history, JDBC sink
schema evolution, Flink CDC's configurable schema-change behaviors, and dlt's variant-column
strategy are quoted, not reproduced, since running any of them needs a JVM and Kafka (or, for
MySQL, a server) this sandbox doesn't have.

- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). Logical decoding carries no DDL event; the incremental-snapshot schema-change limitation.
- Debezium docs, MySQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/mysql.html). The schema history topic, named for contrast.
- Debezium docs, JDBC sink connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/jdbc.html). schema.evolution: basic, and dialect rejections.
- Flink CDC docs, Schema Evolution: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/core-concept/schema-evolution/). The configurable schema-change behaviors, named only.
- dlt docs, Schema evolution: [dlthub.com](https://dlthub.com/docs/general-usage/schema-evolution). The variant-column strategy for a retyped field, named only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=schema-evolution-change-streams:%20).
