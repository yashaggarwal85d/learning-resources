Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy in-place-retry partition, a toy non-blocking retry-topic flow, and a real
DLQ record, no real Kafka cluster available): an in-place retry blocked cold at a poison record,
a non-blocking flow that kept moving past it, and a DLQ record's real metadata fields. The
Kafka Connect `errors.tolerance` mechanism, the Kafka Streams DLQ handler (KIP-1034), and the
retry-topic ordering trade-off are disclosed, sourced-only claims from Apache Kafka's own
documentation and release notes and a substituted secondary engineering source.

- User Guide (Apache Kafka Connect, 4.4 docs):
  [kafka.apache.org/44/kafka-connect/user-guide/](https://kafka.apache.org/44/kafka-connect/user-guide/).
  The `errors.tolerance` setting and dead-letter-queue configuration this topic's reveal cites.
- KIP-1034: Dead letter queue in Kafka Streams (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-1034](https://cwiki.apache.org/confluence/display/KAFKA/KIP-1034%3A+Dead+letter+queue+in+Kafka+Streams).
  The `errors.dead.letter.queue.topic.name` mechanism for Kafka Streams.
- Apache Kafka 4.2.0 Release Notes:
  [archive.apache.org/dist/kafka/4.2.0/RELEASE_NOTES.html](https://archive.apache.org/dist/kafka/4.2.0/RELEASE_NOTES.html).
  Confirms KIP-1034 (KAFKA-16505) shipped in 4.2.0.
- Error Handling Patterns in Kafka (Confluent blog):
  [confluent.io/blog/error-handling-patterns-in-kafka/](https://www.confluent.io/blog/error-handling-patterns-in-kafka/).
  The retry-topic pattern and its explicit ordering trade-off, used here as the disclosed
  secondary source in place of Uber's own blocked-in-sandbox write-up on the same pattern.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=dead-letter-retry-topics:%20).
