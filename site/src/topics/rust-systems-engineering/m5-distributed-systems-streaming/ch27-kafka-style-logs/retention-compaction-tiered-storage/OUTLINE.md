# Outline: Retention, compaction, and tiered storage (`rust.retention-compaction-tiered-storage`)

Chapter 27, topic 72 (third and last). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build directly on topic 70's own partitioned log: a real time/size retention function and a real compaction function running over the identical toy log.
2. Measure that time/size retention genuinely deletes an entry past its own age threshold, regardless of whether it is a key's own latest entry.
3. Measure that compaction genuinely keeps the latest value for each distinct key forever, even on the identical log retention would have pruned.
4. Measure that a real tombstone genuinely removes a key entirely once compaction runs past it, without touching any other key.
5. State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy log, a real retention function, and a real compaction function; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"One key's own only entry is already old; another key has several recent updates. Time-based retention runs over the whole log. Does it genuinely delete the old entry, even though it is that key's own latest?"** (predict, hook) — `fig`: an old entry, a recent entry, a retention cutoff. Options: no, a key's own latest entry is always kept / yes, genuinely, retention never checks whether an entry is a key's own latest (correct) / only if the key has no other entries at all.
2. **"Measured: retention genuinely deleted the old entry, even though it was that key's own only, latest value"** — `fig`: the real, measured deletion. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now run compaction over the identical log instead. Does the old entry survive this time, just because it is still that key's own latest value?"** (predict) — `fig`: the identical log, compaction instead of retention. Options: no, compaction deletes by age too / yes, genuinely, compaction keeps a key's own latest value forever (correct) / only if the entry is newer than some fixed age.
4. **"Measured: compaction genuinely kept the old entry, because it is still that key's own latest value, with no age check at all"** — `fig`: the real, measured survival. Takeaway naming exactly what makes compaction different from retention.
5. **"A real tombstone, a message with the same key and no value, is appended after all the others. Compaction runs past it. Does the key genuinely disappear entirely?"** (predict) — `fig`: a tombstone, the same key. Options: no, the key's last real value is kept instead / yes, genuinely, the key is genuinely removed entirely (correct) / only after a human confirms the delete.
6. **"Measured: the tombstone genuinely removed the key entirely, once compaction ran past it, with every other key genuinely untouched"** — `fig`: the real, measured removal. Takeaway naming exactly what a tombstone does inside compaction.
7. **"Confluent's own documentation and the Kafka project's own design document both state this exact mechanism directly: compaction keeps at least the last state for each key, and a null-payload message is treated as a real delete. Does this topic's own code measure exactly that rule?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
8. **"Measured: time/size retention, keep-the-latest compaction, and the tombstone's own removal are all genuinely one coherent set of outcomes, from the identical log"** — `fig`: all three real, measured results, side by side. Takeaway tying the chapter's own retention and compaction rules together.
9. **"This chapter measured a partitioned, product-facing log's own order, delivery, and retention rules, end to end. Does a real tombstone's own removal close the loop on everything this chapter set out to measure?"** — `fig`: the chapter's own three topics, named directly. NO predict, NO takeaway (a connecting step naming the chapter's own arc, before the recap).
10. **Recap** — time/size retention deletes by age alone; compaction keeps the latest value per key forever instead, until a real tombstone genuinely removes that key for good.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Steps 7 and 9 deliberately connect rather than re-predict, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (compaction has no age check at all) and step 6 (a tombstone removes a key entirely, not just its value).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; steps 7 and 9 deliberately have none too, both connecting steps).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| topic compaction retains the latest value for each message key, discarding older values, guaranteeing the latest value is always retained | Confluent Documentation (quoted) |
| log compaction provides finer-grained per-record retention than time-based retention, selectively removing records with a more recent update under the same key, guaranteeing at least the last state for each key | Confluent Documentation (quoted) |
| a message with a key and a null payload is treated as a delete from the log; these null-payload messages are called tombstones, and they are cleaned out of the log after a period of time | Confluent Documentation (quoted) |
| log compaction gives finer-grained per-record retention than time-based retention, selectively removing records with a more recent update under the same primary key | Apache Kafka design document (quoted) |
| a message with a key and a null payload is treated as a delete from the log, sometimes called a tombstone; the delete marker removes any prior message with that key, and is itself cleaned out after a period of time | Apache Kafka design document (quoted) |
| time/size retention genuinely deletes an entry past its own age threshold, regardless of whether it is a key's own latest entry | `examples/runtime-demo/src/compaction_keeps_latest_value_per_key.rs` (executed, measured) |
| compaction genuinely keeps the latest value for each distinct key forever, even on the identical log retention would have pruned | `examples/runtime-demo/src/compaction_keeps_latest_value_per_key.rs` (executed, measured) |
| a real tombstone genuinely removes a key entirely once compaction runs past it, without touching any other key | `examples/runtime-demo/src/compaction_keeps_latest_value_per_key.rs` (executed, measured) |

## Concept ledger

- `introduces`: `compaction-keeps-latest-value-per-key` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `key-partitioning-order-tradeoff` (topic 70's own concept, this topic builds directly on its partitioned log)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "An idempotent consumer decides what happens when the identical write is genuinely delivered twice; it says nothing yet about how long any write, duplicated or not, is even still there to be read at all."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured what a partitioned, product-facing log promises about order, delivery, and how long its own data sticks around; the next chapter turns to state that does not need any of this chapter's own coordination at all, because it is built to merge safely no matter which order its own updates arrive in."
