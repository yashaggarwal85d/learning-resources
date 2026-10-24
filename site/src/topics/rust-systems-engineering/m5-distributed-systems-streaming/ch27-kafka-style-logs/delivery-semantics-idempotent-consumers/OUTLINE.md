# Outline: Delivery semantics and idempotent consumers (`rust.delivery-semantics-idempotent-consumers`)

Chapter 27, topic 71 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build directly on topic 70's own partitioned log: a real consumer that applies a side effect and commits its own offset as two separate steps, with a real injected crash between them.
2. Measure the exact, real duplicate a naive at-least-once consumer produces when it crashes between applying a side effect and committing its own offset.
3. Measure that a real idempotency key (producer ID plus sequence number) genuinely removes that duplicate's own visible effect.
4. Measure that the redelivery itself still genuinely happens; only the duplicate's own effect is removed, not the redelivery.
5. State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy consumer and ledger; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"A consumer applies a real side effect, then commits its own offset, as two separate steps. The process genuinely crashes between them. Does the next real poll genuinely redeliver that same message?"** (predict, hook) — `fig`: a side effect, a crash, an offset commit that never ran. Options: yes, genuinely, from the same uncommitted offset (correct) / no, Kafka itself remembers it was already handled / only if the consumer explicitly asks for it.
2. **"Measured: the crash genuinely left the offset uncommitted, and the next real poll genuinely redelivered the identical message"** — `fig`: the real, measured redelivery. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"That redelivered message now hits the side effect a second time. Does a naive consumer genuinely apply it twice?"** (predict) — `fig`: the same side effect, a second time. Options: no, Kafka genuinely dedupes it for you / yes, genuinely, the side effect itself has no memory of its own (correct) / only if the amount happens to be the same.
4. **"Measured: a naive consumer genuinely applied the real side effect twice, and the real ledger balance is genuinely wrong because of it"** — `fig`: the real, measured overcount. Takeaway naming exactly what redelivery costs a consumer with no memory of its own.
5. **"Now the consumer checks a real idempotency key, the producer's own ID plus its sequence number, before applying anything. Does that genuinely remove the duplicate effect?"** (predict) — `fig`: the same crash, the same redelivery, a real idempotency key this time. Options: yes, genuinely, the duplicate effect is genuinely gone (correct) / no, the key only helps the producer, never the consumer / only if the consumer also uses transactions.
6. **"Measured: the real idempotency key genuinely removed the duplicate's own visible effect; the real ledger balance is genuinely exact"** — `fig`: the real, measured, exact balance. Takeaway naming what the idempotency key actually buys a consumer.
7. **"The redelivery itself is still genuinely happening, every time. Does only the effect disappear, or does the redelivery disappear too?"** (predict) — `fig`: the redelivery count, the applied-effect count. Options: both genuinely disappear together / only the effect disappears; the redelivery itself genuinely still happens (correct) / Kafka genuinely stops redelivering once a key repeats.
8. **"Measured: the redelivery itself genuinely still happened; only the duplicate's own effect was genuinely removed"** — `fig`: the real, measured redelivery count, next to the real, measured effect count. Takeaway naming exactly what an idempotency key does and does not change.
9. **"Confluent's own documentation and the Kafka project's own design document both state this exact mechanism directly: the broker assigns each producer a real ID, and deduplicates by a real sequence number sent with every message. Does this topic's own code measure exactly that rule?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
10. **Recap** — at-least-once delivery genuinely redelivers a message whose own effect may have already run; a real idempotency key removes that duplicate's own effect without ever stopping the redelivery itself.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7, within this topic's own first eight steps.
- Step 9 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (a naive consumer's own side effect has genuinely no memory of itself) and step 8 (an idempotency key removes the effect, not the redelivery itself).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| if a producer fails to receive a commit response, it resends; this provides at-least-once delivery, since the message may be written to the log again if the original request had succeeded | Confluent Documentation (quoted) |
| the idempotent delivery option guarantees that resending will not result in duplicate entries; the broker assigns each producer an ID and deduplicates by a sequence number sent with every message | Confluent Documentation (quoted) |
| a consumer that saves its position after processing may process some messages a second time on crash; assigning messages a primary key makes updates idempotent | Confluent Documentation (quoted) |
| since 0.11.0.0, the Kafka producer supports an idempotent delivery option; the broker assigns each producer an ID and deduplicates messages using a sequence number sent along with every message | Apache Kafka design document (quoted) |
| many messages have a primary key, so updates are idempotent; receiving the same message twice just overwrites a record with another copy of itself | Apache Kafka design document (quoted) |
| a naive at-least-once consumer genuinely produces a duplicate side effect when it crashes between applying one and committing its own offset | `examples/runtime-demo/src/idempotent_consumer_removes_duplicate_effect.rs` (executed, measured) |
| a real idempotency key genuinely removes that duplicate's own visible effect | `examples/runtime-demo/src/idempotent_consumer_removes_duplicate_effect.rs` (executed, measured) |
| the redelivery itself still genuinely happens; only the duplicate's own effect is removed, not the redelivery | `examples/runtime-demo/src/idempotent_consumer_removes_duplicate_effect.rs` (executed, measured) |

## Concept ledger

- `introduces`: `idempotent-consumer-removes-duplicate-effect` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `key-partitioning-order-tradeoff` (topic 70's own concept, this topic builds directly on its partitioned log)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Per-key ordering decides what a single partition promises about the order writes land in; it says nothing yet about what a consumer that crashes mid-way through handling one of those writes is allowed to do about it."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "An idempotent consumer decides what happens when the identical write is genuinely delivered twice; it says nothing yet about how long any write, duplicated or not, is even still there to be read at all."
