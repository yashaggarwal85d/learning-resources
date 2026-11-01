# OUTLINE: Ordering and transaction boundaries (`de.ordering-transaction-boundaries`)

## Learning outcomes
1. Show per-key order surviving and cross-table order breaking in the same transaction.
2. Reassemble a transaction downstream from its own BEGIN/END events and per-table counts.
3. State what a CDC consumer may and may not assume about ordering.
4. Design a join that tolerates arrival skew.

## Engagement arc
- Hook: step 1 (one commit inserts an order and its three items; the consumer reads the items
  first and the join drops all three).
- Predict: step 2, within the first four steps (does order break the same way for a single
  row's own changes as for a transaction spanning two tables, or differently).
- Takeaways: step 4 (per-key order survives scrambled input), step 6 (the source transaction
  was never torn apart, only the queues built from it), step 8 (the same split commit now joins
  clean, just by waiting for its own count).
- Recap: step 9. Prove it: step 10 (whose job it is to make a multi-topic transaction atomic
  again).

## Steps (storyboard)

### 1. Hook
- **fig:** one commit inserts an order and its items; the consumer reads the items topic first,
  and a join drops all three items as orphans.
- **On screen:** one commit fanning into two topic lanes; the consumer's join finding no order
  yet for any of the three items.

### 2. Predict
- **fig:** does order break the same way for one row's own changes as it does for a transaction
  spanning two tables, or differently?
- **Options:** (a) the same way, since a transaction spanning two tables can lose its order and
  so can a single row [wrong — a single row's own changes are keyed, a split transaction isn't];
  (b) differently, because a row's own changes stay in order from what keys them, which a
  cross-table commit doesn't get [correct].

### 3. Reveal — per-key order
- **fig:** every change event is keyed by its own row's primary key, and a stream ordered
  within one key keeps every change to that single row in order.
- **Moves:** one key's own changes staying lined up on a single lane while other keys' changes
  pass alongside it.

### 4. Reveal — per-key order, measured
- **fig:** the real run: three keys updated three times each, deliberately interleaved; each
  key's own queue lists its values in exactly commit order.
- **takeaway:** "Scramble the keys going in — each key's own queue still comes out in exactly the order it was written."

### 5. Reveal — cross-table order breaks
- **fig:** each table goes to its own topic, so one commit across two tables becomes two
  separate deliveries a consumer can read in either order.
- **Narrator's line of thought:** she names exactly why nothing ties the two deliveries back
  together once they're split, to set up the measured proof.

### 6. Reveal — cross-table order, measured
- **fig:** the real run: the identical commit, split into two queues; draining the items queue
  before the orders queue finds every item an orphan.
- **takeaway:** "The source transaction was never torn apart — only the two queues built from it orphaned every item."

### 7. Reveal — transaction metadata
- **fig:** a begin and end event frame every commit; the end carries a total count and a count
  per table, built from the slot's own real position.
- **Narrator's line of thought:** she names what the end event actually carries, so the next
  step's reassembly is checkable against a specific count, not a vague "it works out."

### 8. Reveal — reassembly, measured
- **fig:** the real run: a consumer buffers by transaction and waits for the end's own count
  before joining; the same split commit now joins with zero orphans.
- **takeaway:** "The same split commit that orphaned every item now joins clean, just by waiting for its own count."

### 9. Recap
- **fig:** a key's own order survives on its own; a commit across tables does not, until a
  consumer buffers by transaction and waits for its own end count.

### 10. Prove it
- **fig:** a transaction spans several separate topics, and nothing in Kafka itself guarantees
  anything across them. Whose job is it, exactly, to make that transaction atomic again?
- **predict options:** (a) Kafka's own job, since it already orders every individual topic
  correctly on its own [wrong — that ordering never crosses topics]; (b) the consumer's own job,
  rebuilt from the transaction metadata's begin, end and counts [correct].

## Post-notes headings
- **Internals:** the uncommitted-insert, per-key, cross-table-break and reassembly proofs are
  all measured directly on this sandbox's own PostgreSQL cluster; Debezium's own
  transaction-metadata feature and deploy-time limitation are named only.
- **Production:** assuming a transaction is one delivery because it was one commit, and
  trusting per-row order to also mean cross-row order, as the two concrete failure shapes this
  topic exists to prevent.
- **Frontier:** PostgreSQL 14's own streaming-of-in-progress-transactions option, named only,
  since it needs an output plugin this sandbox's own `test_decoding` doesn't use.
- **Where this goes next:** order and atomicity cover the rows a transaction touches; the
  columns themselves change too, setting up the next topic's subject: schema evolution in a
  change stream.

## Concept ledger
- **Introduces:** `cdc-ordering-transaction-metadata`.
- **Uses:** `logical-decoding-slot`, `snapshot-stream-handoff`, `query-vs-log-cdc`,
  `isolation-anomalies` — all confirmed live via the registry-parsing script.
- **Declared:** the partition-as-unit-of-order idea of Kafka (named in Chapter 5 topic 29;
  Chapter 9 teaches it).

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so Debezium's own transaction-metadata implementation (its
dedicated `transaction` topic, the `provide.transaction.metadata` setting, and the deploy-time
limitation) cannot be run directly — named from Debezium's own documentation rather than
reproduced, disclosed in `SOURCES.md` and `FACT-CHECK.md`. The four measured claims (uncommitted
changes never emitted, per-key order surviving interleaved writes, cross-table order breaking
into orphans, and reassembly by transaction id and count) are all measured directly against this
sandbox's real PostgreSQL 16 cluster with a hand-written implementation that builds Debezium's
own `txID:LSN` identity straight from the slot's own `lsn` and `xid` columns, exactly as
CHAPTER.md's own "Lab" line describes.

## Claims list (for fact-check)
1. "...the format is txID:LSN." — SOURCES.md (Debezium docs); measured directly in
   `examples.py`.
2. "event_count... data_collections..." — SOURCES.md (Debezium docs); measured directly in
   `examples.py`.
3. The deploy-time metadata limitation — SOURCES.md (Debezium docs); named only.
4. The primary-key-based change-event key — SOURCES.md (Debezium docs); measured directly in
   `examples.py`.
5. "A logical slot will emit each change just once..." — SOURCES.md (PostgreSQL docs); named
   alongside the stronger measured commit-only-emission proof.
6. The `stream_*` output-plugin callbacks — SOURCES.md (PostgreSQL docs); named only.
7. PostgreSQL 14's streaming-of-in-progress-transactions addition — SOURCES.md (PostgreSQL
   release notes); named only.
