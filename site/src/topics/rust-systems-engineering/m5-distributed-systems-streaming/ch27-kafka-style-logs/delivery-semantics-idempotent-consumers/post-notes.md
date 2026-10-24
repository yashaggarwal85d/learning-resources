---
title: "Delivery semantics and idempotent consumers"
---

## Outcomes

- Build directly on topic 70's own partitioned log: a real consumer that applies a side effect and commits its own offset as two separate steps, with a real injected crash between them.
- Measure the exact, real duplicate a naive at-least-once consumer produces when it crashes between applying a side effect and committing its own offset.
- Measure that a real idempotency key (producer id plus sequence number) genuinely removes that duplicate's own visible effect.
- Measure that the redelivery itself still genuinely happens; only the duplicate's own effect is removed, not the redelivery.
- State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Internals

Both the naive consumer and the idempotent consumer share the identical crash-and-redeliver mechanics: a real loop that applies a side effect, then either commits an offset or genuinely stops partway through, followed by a real second pass that starts from whatever offset was last committed. The only difference between them is a single real check, whether the message's own producer id and sequence number have already been recorded, gating the side effect itself; the offset-commit and redelivery logic underneath is deliberately left unchanged, isolating the real effect of that one check rather than comparing two consumers that also differ in how they handle offsets.

## In production

At-most-once, at-least-once, and exactly-once are not properties of the network; Confluent's own documentation defines them by exactly where publishing, consuming, and committing an offset can independently fail. Since version 0.11.0.0, the real Kafka producer supports an idempotent delivery option: the broker assigns each producer a real id and deduplicates messages using a real sequence number sent with every message, which the Apache Kafka project's own design document states in nearly identical words. A producer can also send messages across multiple partitions inside a real transaction, and a consumer reading with the `read_committed` isolation level only ever sees messages from transactions that actually committed. None of this removes the need for a consumer's own idempotent handling of its own downstream side effects: a producer's idempotency key and a broker's own transaction boundary both stop at the log itself, but a payment charged or an email sent is a real effect outside Kafka that neither one can undo, which is exactly why a consumer needs its own dedup, with or without transactional broker support underneath it.

## The frontier

Real production Kafka clusters also run a consumer-group protocol deciding which consumer in a group reads which partition; KIP-848 replaced the older, client-side rebalancing protocol with a broker-coordinated one, reaching general availability in Kafka 4.0, and KIP-932's own share groups add real queue-style semantics on top of a topic, reaching production readiness in Kafka 4.2. Neither protocol changes the idempotency question this topic measures directly: whichever consumer in a group ends up reading a given partition still needs its own real idempotency key check before applying a side effect, for exactly the reasons measured here. All of this topic's own measured claims run entirely on plain in-memory Rust values and functions, with no file, network, or root access needed.

## Where this goes next

An idempotent consumer decides what happens when the identical write is genuinely delivered twice; it says nothing yet about how long any write, duplicated or not, is even still there to be read at all.
