# Sources — Delivery semantics and idempotent consumers

## Confluent Documentation — Kafka Message Delivery Guarantees
URL: https://docs.confluent.io/kafka/design/delivery-semantics.html
Fetched: 2026-10-24, cached at `sources/confluent-delivery-semantics.txt`.
> if a producer expects but fails to receive a response indicating that a message was committed,
> it will resend the message. This provides at-least-once delivery semantics since the
> message may be written to the log again during resending if the original request had succeeded.

> The idempotent delivery option guarantees that resending a message will not result in
> duplicate entries in the log, and that log order is maintained. To achieve this, the broker assigns each producer an ID and
> deduplicates messages using a sequence number that is sent by the producer with every message.

> This means a consumer reads a set of messages, processes the messages, and
> then saves its position. In this case, if the consumer process crashes after processing messages, but before saving its
> position, the new process that takes over may process some messages a second time.
> Note that in this case, you can assign messages a primary key, so that updates are idempotent,
> meaning that if the message is received twice, it just overwrites the existing record
> with the same message data.

## Apache Kafka — Design (GitHub)
URL: https://raw.githubusercontent.com/apache/kafka/trunk/docs/design/design.md
Fetched: 2026-10-24, cached at `sources/kafka-design-md.txt`.
> Since 0.11.0.0, the Kafka producer also supports an idempotent delivery option which guarantees that resending will not result in duplicate entries in the log. To achieve this, the broker assigns each producer an ID and deduplicates messages using a sequence number that is sent by the producer along with every message.

> In many cases messages have a primary key and so the updates are idempotent (receiving the same message twice just overwrites a record with another copy of itself).
