# Outline: Partitioned logs and per-key ordering (`rust.partitioned-logs-per-key`)

Chapter 27, topic 70 (first of this chapter). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real toy multi-partition log: several partitions, each a real, ordered, append-only vector, and a real key-based partitioning function routing each write by `hash(key) % N`.
2. Measure that per-key order is genuinely preserved while the partition count stays fixed: every write to a given key lands in the identical partition, in the identical relative order it was written.
3. Measure that changing the partition count genuinely reroutes at least one existing key to a different partition.
4. Measure that a rerouted key genuinely loses its single-partition order guarantee: its own history splits across the old and the new partition.
5. State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy multi-partition log; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"A topic's writes, for many different keys, go through one real partitioning function, `hash(key) % N`. Does every write to the same key genuinely always land in the same partition?"** (predict, hook) — `fig`: several keys, several partitions, a routing arrow. Options: yes, genuinely, as long as `N` stays fixed (correct) / only if the writes arrive close together in time / no, only a human-assigned key ever stays put.
2. **"Measured: every one of twenty writes to the same key genuinely landed in the identical partition, in the identical order it was written"** — `fig`: the real, measured routing. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now the operator grows the topic from four partitions to six. Does every existing key's own routing genuinely stay put?"** (predict) — `fig`: the same keys, four partitions becoming six. Options: yes, the function keeps working / no, at least one key's own routing genuinely changes (correct) / only the newest key changes.
4. **"Measured: changing the partition count genuinely rerouted at least one existing key to a different partition"** — `fig`: the real, measured reroute. Takeaway about why resizing a partitioned log is never free for existing keys.
5. **"That rerouted key keeps writing after the resize. Does its own history now genuinely live in one partition, or does it genuinely split?"** (predict) — `fig`: the rerouted key's old entries, its new entries. Options: it all catches up into the new partition eventually / it genuinely splits across the old and the new partition, forever (correct) / Kafka genuinely merges the two partitions for that key.
6. **"Measured: the rerouted key's own history genuinely split across the old and the new partition; the order guarantee it had is genuinely gone"** — `fig`: the real, measured split. Takeaway naming exactly what a partition count change costs an existing key.
7. **"Confluent's own documentation states this exact mechanism directly: events with the same key are written to the same partition, and a consumer of a given partition always reads it in exactly the order it was written. Does this topic's own code measure exactly that rule?"** — `fig`: the documentation's own words, shown directly. NO new predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
8. **"The Kafka project's own design document describes the message log itself as just a directory of real files on disk, recopied in whole segments whenever the log cleaner compacts it. Does this topic's own partition-per-vector model mirror that same real, append-only shape?"** — `fig`: the design document's own words, shown directly. NO predict, NO takeaway (a second connecting step, naming a real production design choice this topic's own code mirrors by keeping each partition a separate, append-only sequence rather than one shared structure).
9. **"Measured: fixed-partition-count order, partition-count-change rerouting, and the resulting split history are all genuinely one coherent set of outcomes, from one real routing function"** — `fig`: all three real, measured results, side by side. Takeaway tying per-key ordering and the resize hazard together.
10. **Recap** — a key's own write order is only genuinely guaranteed within one partition; key-based routing holds that order only as long as the partition count itself never changes.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Steps 7–8 deliberately connect rather than re-predict, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (growing a topic's own partition count is never free for an existing key) and step 8 (a real production log is itself just a directory of append-only files, mirroring this topic's own partition-per-vector model).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; steps 7 and 8 deliberately have none too, both connecting steps).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| topics are broken up into partitions, meaning a single topic log is broken into multiple logs | Confluent Documentation (quoted) |
| events with the same event key are written to the same partition, and a consumer of a given partition always reads it in exactly the order it was written | Confluent Documentation (quoted) |
| events with the same key are written to the same partition; both producers can write to the same partition if appropriate | Confluent Documentation (quoted) |
| the message log maintained by the broker is itself just a directory of files, each populated by a sequence of message sets | Apache Kafka design document (quoted) |
| log compaction recopies log segment files, removing records whose key appears in the head of the log | Apache Kafka design document (quoted) |
| per-key order is genuinely preserved while the partition count stays fixed: every write to a given key lands in the identical partition, in the identical relative order | `examples/runtime-demo/src/key_partitioning_order_tradeoff.rs` (executed, measured) |
| changing the partition count genuinely reroutes at least one existing key to a different partition | `examples/runtime-demo/src/key_partitioning_order_tradeoff.rs` (executed, measured) |
| a rerouted key's own history genuinely splits across the old and the new partition, losing its single-partition order guarantee | `examples/runtime-demo/src/key_partitioning_order_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `key-partitioning-order-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: [] (this topic changes subject to a partitioned, product-facing log; it needs no earlier chapter's own introduced concept directly)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "bridges from Chapter 26's own real handoff: what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Per-key ordering decides what a single partition promises about the order writes land in; it says nothing yet about what a consumer that crashes mid-way through handling one of those writes is allowed to do about it."
