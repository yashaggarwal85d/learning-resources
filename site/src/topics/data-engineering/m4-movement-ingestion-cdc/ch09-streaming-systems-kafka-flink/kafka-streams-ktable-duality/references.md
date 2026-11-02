Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy task-assignment and stream-table model, no real Kafka Streams application
available): a task-to-partition assignment showing capped parallelism and idle excess instances; a
stream aggregated into a table and reconstructed back out as a stream; and a standby-replica
recovery-time comparison. Kafka Streams' own architecture, the rebalance protocol's current scope,
and ksqlDB's licence/contribution status are disclosed, sourced-only claims from Apache Kafka's
own documentation and Confluent's own repository and licensing pages.

- Architecture (Apache Kafka Streams, 4.4 docs):
  [kafka.apache.org/44/streams/architecture/](https://kafka.apache.org/44/streams/architecture/).
  The task-per-partition model, local state stores, and standby replica definitions this topic cites.
- Core Concepts (Apache Kafka Streams, 4.4 docs):
  [kafka.apache.org/44/streams/core-concepts/](https://kafka.apache.org/44/streams/core-concepts/).
  The stream-table duality and exactly-once v2 definitions this topic cites.
- Streams Rebalance Protocol (Apache Kafka Streams, 4.4 docs):
  [kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/](https://kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/).
  The rebalance protocol's current scope and gaps this topic cites.
- Configuring a Streams Application (Apache Kafka Streams, 4.4 docs):
  [kafka.apache.org/44/streams/developer-guide/config-streams/](https://kafka.apache.org/44/streams/developer-guide/config-streams/).
  The RocksDB-as-default-storage-engine fact this topic cites.
- Confluent Community License FAQ (Confluent):
  [confluent.io/confluent-community-license-faq/](https://www.confluent.io/confluent-community-license-faq/).
  The licence scope and ksqlDB coverage this topic cites.
- CONTRIBUTING.md (confluentinc/ksql repository, GitHub):
  [github.com/confluentinc/ksql/blob/master/CONTRIBUTING.md](https://github.com/confluentinc/ksql/blob/master/CONTRIBUTING.md).
  The current "no longer accepting contributions from the community" fact this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=kafka-streams-ktable-duality:%20).
