Sources fetched and quoted for `de.idempotent-producer`.

## KIP-98: Exactly Once Delivery and Transactional Messaging (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging

> To implement idempotent producer semantics, we introduce the concepts of a producer id,
> henceforth called the PID, and sequence numbers for Kafka messages. Every new producer will be
> assigned a unique PID during initialization. The PID assignment is completely transparent to
> users and is never exposed by clients.

> For a given PID, sequence numbers will start from zero and be monotonically increasing, with one
> sequence number per topic partition produced to. The sequence number will be incremented by the
> producer on every message sent to the broker. The broker maintains in memory the sequence
> numbers it receives for each topic partition from every PID. The broker will reject a produce
> request if its sequence number is not exactly one greater than the last committed message from
> that PID/TopicPartition pair. Messages with a lower sequence number result in a duplicate error,
> which can be ignored by the producer.

> We introduce the notion of a producer epoch, which enables us to ensure that there is only one
> legitimate active instance of a producer with a given TransactionalId, and hence enables us to
> maintain transaction guarantees in the event of failures.

> Bumps up the epoch of the PID, so that the any previous zombie instance of the producer is
> fenced off and cannot move forward with its transaction.

## Apache Kafka 4.4 producer configuration reference

URL: https://kafka.apache.org/44/generated/producer_config.html

> When set to 'true', the producer will ensure that exactly one copy of each message is written in
> the stream. If 'false', producer retries due to broker failures, etc., may write duplicates of
> the retried message in the stream. Note that enabling idempotence requires
> max.in.flight.requests.per.connection to be less than or equal to 5 (with message ordering
> preserved for any allowable value), retries to be greater than 0, and acks must be 'all'.
> Idempotence is enabled by default if no conflicting configurations are set.

Notes on this topic's research: KIP-98's own design text is the primary source for the PID,
sequence number, and epoch mechanics — the original rationale CHAPTER.md asks for. The 4.4
producer config reference confirms idempotence is still enabled by default in the current release,
so no version-claim correction is needed (continuing the pattern from topics 5-9).
