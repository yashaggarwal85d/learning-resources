# Outline: Kafka ordering guarantees (`de.kafka-ordering-guarantees`)

## Claims list (all sourced in SOURCES.md)

1. A topic is divided into totally ordered partitions — order is a per-partition property.
2. Kafka makes no ordering promise across partitions.
3. The default partitioner hashes a key to a partition.
4. Idempotence requires `max.in.flight.requests.per.connection` ≤ 5, with message ordering
   preserved for any allowable value up to that limit.
5. Without idempotence, more than one in-flight request risks reordering after a retried send.
6. With idempotence, ordering is preserved regardless of in-flight count (up to 5).
7. Increasing a topic's partition count changes the default partitioner's `hash(key) %
   number_of_partitions` mapping, so the same key can land on a different partition after the
   change — Kafka does not redistribute existing data.

## Storyboard (10 steps)

1. **Hook**: a team adds partitions to scale out, and a downstream consumer starts seeing a
   cancellation before its creation for orders placed after the change.
2. **Setup**: the partition strip, several lanes side by side, with no synchronizing line between
   them.
3. **Predict**: does Kafka guarantee any order between two records with different keys?
4. **Reveal**: no cross-partition order exists — two records in different partitions have no
   defined relative order at all.
5. **Predict**: does a retried batch risk landing out of order?
6. **Reveal**: a real toy run — without idempotence, a retried batch can land after a batch that
   succeeded on its first try; with idempotence, order is always preserved.
7. **Reveal**: the five-in-flight limit, as the documented ceiling for idempotent ordering to
   hold.
8. **Reveal**: a real toy repartition — the same key's assigned partition, measured before and
   after a partition-count change, for a key that moves and one that doesn't.
9. **Prove it**: every number from this reel read straight off a real run of `examples.py`.
10. **Recap**: order within one partition, none across partitions, idempotence as the ordering
    fix for retries, and key-to-partition stability as a promise that quietly breaks.

## Concept ledger

Introduces: `kafka-ordering-scope`, `key-partition-stability`.
Uses: `partition-segment-index` (topic 1), `producer-batching-linger` (topic 2),
`retention-vs-compaction` (topic 6).
