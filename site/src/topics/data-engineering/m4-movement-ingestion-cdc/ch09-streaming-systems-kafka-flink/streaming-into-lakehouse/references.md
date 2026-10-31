Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy commit-cadence and LSM-buffering model, no real Kafka/Flink/Iceberg cluster
available): a commit-interval-to-file-count-and-staleness relationship, and the same cadence run
through a compaction buffer. Tableflow, Redpanda's Iceberg topics, the Iceberg Flink sink, Paimon,
and Fluss's current capabilities and maturity are disclosed, sourced-only claims from each
project's own current documentation.

- Tableflow in Confluent Cloud (Confluent, current docs):
  [docs.confluent.io/cloud/current/topics/tableflow/overview.html](https://docs.confluent.io/cloud/current/topics/tableflow/overview.html).
  The automated topic-to-Iceberg/Delta materialisation, Parquet conversion, and Schema Registry
  facts this topic cites.
- About Iceberg Topics (Redpanda Streaming, current docs):
  [docs.redpanda.com/current/manage/iceberg/about-iceberg-topics](https://docs.redpanda.com/current/manage/iceberg/about-iceberg-topics).
  The broker-native Iceberg materialisation fact this topic cites.
- Flink Writes (Apache Iceberg, latest docs):
  [iceberg.apache.org/docs/latest/flink-writes/](https://iceberg.apache.org/docs/latest/flink-writes/).
  The exactly-once sink guarantee and the checkpoint-interval-is-the-commit-interval fact this
  topic cites.
- Primary-Key Table (Apache Paimon, master docs):
  [paimon.apache.org/docs/master/primary-key-table/](https://paimon.apache.org/docs/master/primary-key-table/).
  The LSM-tree storage definition this topic cites.
- Introduction (Apache Fluss, docs, version 1.0):
  [fluss.apache.org/docs/](https://fluss.apache.org/docs/).
  The streaming-storage-in-front-of-Flink definition this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=streaming-into-lakehouse:%20).
