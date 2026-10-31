<section data-section="outcomes">

## Outcomes

Per-message, ack-and-redelivery queues (RabbitMQ, SQS) are contrasted directly with offset-based,
replayable logs (Kafka), both named from their own documentation. A workload's real replay,
ordering and fan-out needs are used to choose between the two, reproduced for real in this
topic's own lab against a real on-disk database. Kafka's own share groups (KIP-932) are named as
a real, production-ready feature blurring that line, disclosed as sourced-only since this
sandbox can't run a real multi-broker Kafka cluster.

</section>

<section data-section="internals">

## Internals

A queue deletes a message the instant it's positively acknowledged; a negative acknowledgement
instead discards, dead-letters, or requeues the same delivery, in RabbitMQ's and SQS's own
documented terms — never both outcomes for one message. A log instead tracks a consumer's own
position as a single, rewindable integer per partition, and a message's own offset never
changes, which is what makes deliberately rewinding back to replay old data possible at all. A
log's partitions give real per-partition ordering and let many independent consumer groups each
read the whole stream at their own pace; a queue's own per-message delivery targets one logical
destination, not many independent readers. Kafka's own share groups, production-ready in the
engine's current release, layer per-record acknowledgement and delivery-attempt counting directly
onto a log, without handing a whole partition to just one consumer.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a queue's own redelivery is the same thing as replay.** A queue only redelivers a
message that was never acknowledged in the first place; once genuinely acknowledged, it's gone,
and no later process can get it back. Teams that need to reprocess already-handled data after
fixing a bug need a log's own replay, not a queue's redelivery.

**Reaching for a per-message queue when many independent consumers each need the full stream.**
A queue is built for one logical destination per message; fanning the same data out to several
independent, slower-moving teams is exactly the shape a log's partitions are built for instead.

</section>

<section data-section="frontier">

## Frontier

Kafka's own share groups reached production-readiness only after an early-access and a preview
release first; some real differences from a classic consumer group (no partition ownership, no
fencing on rebalance, server-side-only partition assignment) are named in the KIP's own design
but not built or measured in this topic's own sandbox, since doing so needs a real multi-broker
Kafka cluster this course doesn't stand up.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this chapter answered a question with an exact result. The next section
closes the chapter with the opposite idea entirely: structures that trade a small, bounded error
for a massive reduction in memory, starting with the simplest — Bloom, cuckoo and xor filters.

</section>
