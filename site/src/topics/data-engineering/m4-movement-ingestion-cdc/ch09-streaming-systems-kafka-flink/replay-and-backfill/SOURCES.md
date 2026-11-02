Sources fetched and quoted for `de.replay-and-backfill`.

## KafkaConsumer (Apache Kafka 4.4.0 API, Javadoc)

URL: https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html

> Look up the offsets for the given partitions by timestamp. The returned offset for each
> partition is the earliest offset whose timestamp is greater than or equal to the given
> timestamp in the corresponding partition.

> If the message format version in a partition is before 0.10.0, i.e. the messages do not have
> timestamps, null will be returned for that partition.

> Overrides the fetch offsets that the consumer will use on the next poll(timeout). If this API
> is invoked for the same partition more than once, the latest offset will be used on the next
> poll(). Note that you may lose data if this API is arbitrarily used in the middle of
> consumption, to reset the fetch offsets.

## Idempotent requests (Stripe API Reference)

URL: https://docs.stripe.com/api/idempotent_requests

> The API supports idempotency for safely retrying requests without accidentally performing the
> same operation twice.

Notes on this topic's research: per CHAPTER.md, this topic's "making replays safe" clause draws
on general replay-safety design guidance from the same event-driven-architecture sources used in
topic 13 (`de.deduplication-idempotent-consumers`), disclosed as secondary where not a vendor's
own docs on the specific mechanism being taught. The Stripe quote above is used in that secondary
role: Stripe's own idempotency-key mechanism is not Kafka's replay machinery, but it is the same
underlying idea this topic teaches — a safe-to-repeat operation guarded so a second run has no
new effect — applied here to a stream replay's idempotent sink. Kafka's own `offsetsForTimes` and
`seek` are this topic's primary, directly-cited mechanism for resetting a consumer's position by
timestamp. The backfill-from-tiered-storage-or-lakehouse clause and the idempotent-sink/versioned-
output/suppressed-side-effect safety clause otherwise rely on topics 8, 12, and 13's own already-
sourced machinery (named here, not re-cited), per CHAPTER.md's own "Leaves out" note.
