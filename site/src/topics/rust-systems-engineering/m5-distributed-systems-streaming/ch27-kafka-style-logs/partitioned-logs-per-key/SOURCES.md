# Sources — Partitioned logs and per-key ordering

## Confluent Documentation — Kafka Introduction
URL: https://docs.confluent.io/kafka/introduction.html
Fetched: 2026-10-24, cached at `sources/confluent-introduction.txt`.
> Topics are broken up into partitions, meaning a single topic log is broken into multiple logs located on
> different Kafka brokers.

> When a new event is published to a topic, it is
> actually appended to one of the topic's partitions. Events with the same event key
> such as the same customer identifier or vehicle ID are written to the same partition, and Kafka guarantees that
> any consumer of a given topic partition will always read that partition's events in exactly
> the same order as they were written.

> Events with the same key, which are shown with different colors in the image, are written to the
> same partition. Note that both producers can write to the same partition if appropriate.

## Apache Kafka — Design (GitHub)
URL: https://raw.githubusercontent.com/apache/kafka/trunk/docs/design/design.md
Fetched: 2026-10-24, cached at `sources/kafka-design-md.txt`.
> The message log maintained by the broker is itself just a directory of files, each populated by a sequence of message sets that have been written to disk in the same format used by the producer and consumer.

> Log compaction is handled by the log cleaner, a pool of background threads that recopy log segment files, removing records whose key appears in the head of the log.
