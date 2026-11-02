Sources fetched and quoted for `de.dead-letter-retry-topics`.

## User Guide (Apache Kafka Connect, 4.4 docs)

URL: https://kafka.apache.org/44/kafka-connect/user-guide/

> Kafka Connect provides error reporting to handle errors encountered along various stages of
> processing. By default, any error encountered during conversion or within transformations will
> cause the connector to fail. Each connector configuration can also enable tolerating such
> errors by skipping them, optionally writing each error and the details of the failed operation
> and problematic record (with various levels of detail) to the Connect application log. These
> mechanisms also capture errors when a sink connector is processing the messages consumed from
> its Kafka topics, and all of the errors can be written to a configurable "dead letter queue"
> (DLQ) Kafka topic.

> By default connectors exhibit "fail fast" behavior immediately upon an error or exception.

> Tolerate all errors.
> errors.tolerance=all

## KIP-1034: Dead letter queue in Kafka Streams (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-1034%3A+Dead+letter+queue+in+Kafka+Streams

> Most applications tend to rely on the Dead Letter Queue (DLQ) pattern: in case of an issue, the
> faulty message that can not be processed is stored in a separate topic.

> A new configuration will be added: errors.dead.letter.queue.topic.name. When set, this
> configuration indicates the default exception handler implementation to build a Dead letter
> queue record during the error handling.

## Apache Kafka 4.2.0 Release Notes

URL: https://archive.apache.org/dist/kafka/4.2.0/RELEASE_NOTES.html

> [KAFKA-16505] - KIP-1034: Dead letter queue in Kafka Streams

## Error Handling Patterns in Kafka (Confluent blog)

URL: https://www.confluent.io/blog/error-handling-patterns-in-kafka/

> Adding a retry topic provides the ability to process most events right away while delaying the
> processing of other events until the required conditions are met.

> Events are not guaranteed to be processed in the same sequence received in the source topic.
> This is because the retry path is "longer" and usually slower than the normal execution path,
> as there are fewer retry instances and retries are delayed.

Notes on this topic's research: per CHAPTER.md, a secondary engineering-team write-up on tiered-
retry-topic design was to be read and disclosed. Uber's own "Building Reliable Reprocessing and
Dead Letter Queues with Apache Kafka" post (the design CHAPTER.md names) returned HTTP 406 from
this sandbox on every URL variant tried (both `eng.uber.com` and several `uber.com/.../blog/`
locale mirrors), consistent with this session's recurring domain-wide fetch-blocking pattern on
certain hosts. Confluent's own "Error Handling Patterns in Kafka" blog post, fetched cleanly
above, covers the identical pattern (retry topic, delayed re-execution, and the explicit ordering
trade-off) and is used here as the disclosed secondary source in Uber's place, substituted for
the same reason and in the same spirit as this session's earlier TLS-blocked `.edu` substitutions.
The specific `retry-5s`/`retry-1m`/`retry-1h` tiered-topic naming convention named in CHAPTER.md's
scope line is a widely used convention in this pattern's community write-ups (including Uber's)
but is not independently confirmed as a literal naming string by any source fetched in this
sandbox; the reel teaches the tiering concept and its trade-off as directly confirmed, and uses
the `retry-5s`/`retry-1m`/`retry-1h` labels only as illustrative, not as a claimed universal
Kafka-side standard.
