# Outline: Acknowledgement points define durability (`rust.acknowledgement-points-define-durability`)

Chapter 25, topic 66 (first of two, opens Milestone 5). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real toy leader-plus-replicas log with three distinct acknowledgement policies (accepted by a subset, durably recorded by the leader alone, persisted by a real quorum).
2. Measure that a write acknowledged by a subset smaller than a quorum genuinely gets lost once the leader is destroyed.
3. Measure that a write durably recorded by the leader alone genuinely also gets lost on the identical leader destruction, since it never reached any other node.
4. Measure that a write persisted by a real quorum genuinely survives the identical leader destruction, and that the quorum's own threshold matches the real majority arithmetic exactly.
5. State, from Kafka's own documentation on `acks` and `min.insync.replicas`, the real trade-off between these acknowledgement points.

## Changes from the chapter plan

None. All claims are measured directly against a real toy cluster of in-memory Rust logs, with a real node-destruction function wiping one node's own state; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"A write is acknowledged once a subset smaller than a quorum has it: the leader alone. The leader is then destroyed. Does the write genuinely survive?"** (predict, hook) — `fig`: the leader alone holding the write, then destroyed. Options: yes, the acknowledgement itself guarantees it survives / no, it genuinely gets lost (correct) / only if the leader had also written it to disk.
2. **"Measured: genuinely lost, once the leader that alone held the acknowledged write was destroyed"** — `fig`: the real, measured loss. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — an acknowledgement smaller than a quorum promises nothing once the one node holding it is gone — is stated directly in the step's own body instead).
3. **"Now the leader durably records the write to its own disk before acknowledging, still with no replica involved. The leader is destroyed the same way. Does durably recording it on the leader alone protect the write this time?"** (predict) — `fig`: the leader's own durable record, then destroyed. Options: yes, durability on the leader alone is enough / no, it genuinely gets lost too (correct) / only if the leader's disk happens to survive separately from the leader itself.
4. **"Measured: genuinely lost again, even though the write was durably recorded, because it never reached any node beyond the one that was destroyed"** — `fig`: the real, measured loss, despite durability. Takeaway: "Durability on one node is not durability at all, once that single node is the one that gets destroyed."
5. **"Now the write is persisted by a real quorum instead: the leader and enough replicas that any two quorums are guaranteed to overlap. The identical leader destruction happens. Does the write survive this time?"** (predict) — `fig`: a quorum of nodes, the leader destroyed. Options: no, the identical destruction still loses it / yes, genuinely, it survives (correct) / only if the surviving replica happens to be the one that's asked.
6. **"Measured: genuinely survives, on the identical leader destruction, because a real quorum already held a durable copy beyond just the leader"** — `fig`: the real, measured survival. Takeaway: "A quorum's own real promise is that destroying any single node, even the leader, can never take every copy with it."
7. **"Kafka's own documentation states the weakest of these policies directly, in its own words. Does it name a leader failing right after an acks=1 acknowledgement, before any follower replicates it, as something that genuinely loses the record?"** (predict) — `fig`: Kafka's own words on acks=1, shown directly. Options: no, acks=1 is named as fully durable on its own / yes, genuinely; it names that exact loss directly (correct) / only when the producer also sets a retry count of zero.
8. **"Measured, in Kafka's own words: should the leader fail immediately after acknowledging the record but before the followers have replicated it, then the record will be lost"** — `fig`: Kafka's own words, shown directly. Takeaway: "A real production system states this exact loss in its own documentation; it isn't a hypothetical edge case this topic invented."
9. **"Kafka's own documentation also names the real setting that turns a quorum requirement into an enforced guarantee: does it state that min.insync.replicas causes the producer to raise an exception when the in-sync set falls below it?"** — `fig`: Kafka's own words on `min.insync.replicas`, shown directly. NO new predict (continues directly from step seven's own question, to the real system's own name for enforcing the quorum this topic measured). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — which single point in a replication pipeline counts as "acknowledged" genuinely decides whether a write survives the node that accepted it being destroyed: a subset smaller than a quorum, even a durably recorded one, can lose it outright, while a real quorum cannot.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (Kafka's own stated acks=1 loss; step 9 continues from it directly, with no new predict, to Kafka's own name for enforcing the quorum via `min.insync.replicas`).
- Surprising fact: step 9 (the real system's own documentation naming the enforcement mechanism this topic's own quorum threshold measures).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| acks=0: the producer will not wait for any acknowledgment from the server at all, and no guarantee can be made that the server has received the record | Confluent Docs: Kafka Producer Configuration Reference (quoted) |
| acks=1: the leader writes the record to its local log but responds without awaiting full acknowledgement; should the leader fail immediately after acknowledging but before followers replicate it, the record will be lost | Confluent Docs: Kafka Producer Configuration Reference (quoted) |
| acks=all: the leader waits for the full set of in-sync replicas to acknowledge the record, guaranteeing the record will not be lost as long as at least one in-sync replica remains alive | Confluent Docs: Kafka Producer Configuration Reference (quoted) |
| min.insync.replicas specifies the minimum number of in-sync replicas (including the leader) required for a write to succeed | Confluent Docs: Kafka Topic Configuration Reference (quoted) |
| if acks=all and the current ISR set contains fewer than min.insync.replicas members, the producer will raise an exception | Confluent Docs: Kafka Topic Configuration Reference (quoted) |
| regardless of the acks setting, messages are not visible to consumers until replicated to all in-sync replicas and the min.insync.replicas condition is met | Confluent Docs: Kafka Topic Configuration Reference (quoted) |
| a write acknowledged by a subset smaller than a quorum genuinely gets lost once the leader is destroyed | `examples/runtime-demo/src/acknowledgement_point_durability_tradeoff.rs` (executed, measured) |
| a write durably recorded by the leader alone also genuinely gets lost on the identical leader destruction | `examples/runtime-demo/src/acknowledgement_point_durability_tradeoff.rs` (executed, measured) |
| a write persisted by a real quorum genuinely survives the identical leader destruction, and the quorum's own threshold matches the real majority arithmetic exactly | `examples/runtime-demo/src/acknowledgement_point_durability_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `acknowledgement-point-durability-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: []
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused (itself Chapter 24's own closing handoff): "This chapter measured what a single machine's own layout and execution choices cost, in real, measured bytes touched and real, measured throughput; the next milestone turns to what happens once that single machine's own data is replicated across several machines that can fail independently, and what an acknowledgement from one of them is actually allowed to promise."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Choosing an acknowledgement point decides what a single write survives; it says nothing yet about whether an entire recorded history of many concurrent reads and writes, gathered while real failures are happening, is even consistent with any honest order at all."
