Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy tiered-storage models, no real Kafka broker or object store available): a
segment-placement simulation, a local-vs-remote read-cost comparison, and a compacted-topic
rejection check. The remote-log-manager mechanics, retention semantics, and compacted-topic
limitation are disclosed, sourced-only claims from Kafka's own current documentation and the
original KIP, since no real tiered-storage deployment runs in this sandbox.

- KIP-405: Kafka Tiered Storage (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-405](https://cwiki.apache.org/confluence/display/KAFKA/KIP-405%3A+Kafka+Tiered+Storage).
  Production-ready since Kafka 3.9, the `RemoteLogManager`/`RemoteStorageManager` design, and the
  compacted-topics non-goal this topic's reveals cite.
- Apache Kafka 4.4 operations documentation, "Tiered Storage":
  [kafka.apache.org/44/operations/tiered-storage/](https://kafka.apache.org/44/operations/tiered-storage/).
  The two-tier model, `RemoteStorageManager`'s role, local-vs-total retention configuration, and
  the stated "No support for compacted topics" limitation.
- Apache Kafka 4.4 configuration reference, "Tiered Storage Configs":
  [kafka.apache.org/44/configuration/tiered-storage-configs/](https://kafka.apache.org/44/configuration/tiered-storage-configs/).
  `log.local.retention.ms`'s exact definition and its relationship to `log.retention.ms`.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=kafka-tiered-storage:%20).
