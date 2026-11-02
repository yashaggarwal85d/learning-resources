Last verified: 1 November 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL 16 cluster: a hand-written implementation of DBLog's own
watermark-based chunk-selection algorithm, run under genuine concurrent updates, deletes and
inserts fired between every chunk, diffed against the source table's live contents at the end.
Debezium's own buffered-window implementation, chunk size, signal channels and read-only
watermark variants are quoted, not reproduced, since running Debezium itself needs a JVM and
Kafka this sandbox doesn't have.

- Andreakis & Papapanagiotou, "DBLog: A Watermark Based Change-Data-Capture Framework" (Netflix): [arxiv.org](https://arxiv.org/pdf/2010.12597). The watermark algorithm this topic's own examples.py implements by hand.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). Chunk size, buffered collision resolution, signals, and the read-only variant.
- Debezium docs, MySQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/mysql.html). The GTID-based read-only variant, named for contrast only.
- Flink CDC docs, PostgreSQL CDC Source: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-stable/docs/connectors/flink-sources/postgres-cdc/). The parallel chunked-reader analogue, named only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=incremental-snapshots-watermark-windows:%20).
