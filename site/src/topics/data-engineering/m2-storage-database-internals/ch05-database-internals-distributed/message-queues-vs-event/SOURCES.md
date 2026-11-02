## RabbitMQ docs — "Consumer Acknowledgements and Publisher Confirms"

URL: https://www.rabbitmq.com/docs/confirms
Version: RabbitMQ documentation, fetched 2026-10-31

> Consumer acknowledgements are not aware of publishers: their goal is to confirm to a RabbitMQ node that a given delivery was successfully received and processed successfully, so the delivered message can be marked for future deletion.

> The methods are generally used to negatively acknowledge a delivery. Such deliveries can be discarded or dead-lettered or requeued by the broker. This behaviour is controlled by the requeue field.

Used for: a per-message queue's own acknowledge-and-delete model, and its own redeliver-or-discard
behavior on a negative acknowledgement — once acknowledged, a message is marked for deletion, not
kept around for a later replay.

## AWS docs — "Amazon SQS visibility timeout"

URL: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html
Version: AWS documentation, fetched 2026-10-31

> The visibility timeout starts as soon as a message is delivered to you. During this period, you're expected to process and delete the message. If you don't delete it before the timeout expires, the message becomes visible again in the queue and can be retrieved by another consumer.

Used for: SQS's own redelivery mechanism (a message reappears for another consumer only if it was
never explicitly deleted, not because a reader asked to see it again).

## Apache Kafka docs — "Design"

URL: https://kafka.apache.org/44/design/design/
Version: Apache Kafka documentation, fetched 2026-10-31

> This means that the position of a consumer in each partition is just a single integer, the offset of the next message to consume. This makes the state about what has been consumed very small, just one number for each partition.

> A consumer can deliberately rewind back to an old offset and re-consume data. This violates the common contract of a queue, but turns out to be an essential feature for many consumers.

> The offset for a message never changes. It is the permanent identifier for a position in the log.

Used for: Kafka's own offset-based model — a consumer's position is a single, rewindable integer,
and a message's own offset is permanent, which is what makes replay possible at all.

## Apache Kafka docs — "Upgrading" (4.2)

URL: https://kafka.apache.org/42/getting-started/upgrade/
Version: Apache Kafka documentation, fetched 2026-10-31

> Queues for Kafka (KIP-932) is production-ready in Apache Kafka 4.2. This feature introduces a new kind of group called share groups, as an alternative to consumer groups. Consumers in a share group cooperatively consume records from topics, without assigning each partition to just one consumer. Share groups also introduce per-record acknowledgement and counting of delivery attempts. Use share groups in cases where records are processed one at a time, rather than as part of an ordered stream.

Used for: Kafka 4.2's own confirmation that share groups (KIP-932) are production-ready, and the
engine's own description of what they add (per-record acknowledgement, delivery-attempt counting,
cooperative per-partition consumption) — the real feature blurring the queue/log line this topic
names.

## KIP-932 — "Queues for Kafka" (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-932%3A+Queues+for+Kafka
Version: Apache Kafka KIP wiki, fetched 2026-10-31

> This KIP introduces the concept of a share group as a way of enabling cooperative consumption using Kafka topics. It does not add the concept of a "queue" to Kafka per se, but rather that introduces cooperative consumption to accommodate these queuing use-cases using regular Kafka topics.

Used for: the proposal's own framing — share groups add queue-like per-record cooperative
consumption on top of Kafka's existing log, rather than replacing the log model.
