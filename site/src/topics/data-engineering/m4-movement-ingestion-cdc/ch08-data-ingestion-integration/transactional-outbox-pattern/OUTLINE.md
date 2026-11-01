# OUTLINE: Transactional outbox pattern (`de.transactional-outbox-pattern`)

## Learning outcomes
1. Reproduce the dual-write loss with a crash between commit and publish and fix it with an
   outbox written in the same transaction.
2. Configure the outbox router's routing, id and key.
3. Design an event payload and an aggregate key.
4. Clean the outbox without losing events.

## Engagement arc
- Hook: step 1 (an order service commits and crashes before publishing OrderPlaced, and the
  warehouse never hears about it).
- Predict: step 2, within the first four steps (is the lost publish recoverable anywhere, or
  simply gone); step 10 (is deleting outbox rows immediately after writing them still safe).
- Takeaways: step 4 (the application never wrote the event down, the database never lost it),
  step 6 (one table, read one way, already carries its own topic name and dedup key), step 7
  (interleaving never threatens order, only the shared key does), step 8 (cleanup isn't risky by
  nature, only risky before the slot catches up), step 9 (recap: one transaction, one outcome).

## Steps (storyboard)

### 1. Hook
- **fig:** an order service commits the order and crashes before publishing OrderPlaced; the
  warehouse never hears about the order, and it exists only in the database.
- **On screen:** the commit and publish ticks on a timeline, with the crash landing between
  them, then one box drawn around both.

### 2. Predict
- **fig:** the order was committed, and the separate publish step crashed before it ever ran.
  Is that event recoverable anywhere, or is it simply gone?
- **Options:** (a) recoverable, since the database still knows the publish is owed [wrong — the
  database never recorded that anything was owed]; (b) gone, since nothing anywhere ever
  recorded a publish was supposed to happen [correct].

### 3. Reveal — the outbox fix
- **fig:** an outbox writes the event in the exact same transaction as the state change, so
  both exist or neither does; CDC, not the application, does the publishing.
- **Moves:** a single transaction box containing two writes, with a CDC arrow leaving only on
  commit.

### 4. Reveal — the dual-write loss, measured
- **fig:** the real run: a crash after commit but before a separate publish leaves nothing
  decodable to recover; an outbox row written in the same transaction as the order is always
  there to decode.
- **takeaway:** "The database never lost the event — the application never wrote it down in the
  first place."

### 5. Reveal — the router routes and dedups
- **fig:** the router routes by aggregatetype to its own topic, and the outbox row's own id
  becomes the message's dedup key; a delete on the outbox table is filtered out automatically.
- **Narrator's line of thought:** she names what the router does to each row before the
  measured proof shows it happening.

### 6. Reveal — routing and dedup, measured
- **fig:** the real run: two real decoded outbox inserts of different aggregate types route to
  two different topics, each carrying its own row's own id as a dedup key.
- **takeaway:** "One table, read one way, already carries its own topic name and its own dedup
  key."

### 7. Reveal — ordering, measured
- **fig:** the real run: two aggregates' own events, written interleaved, still come apart
  cleanly by aggregateid into each one's own correctly ordered sequence.
- **takeaway:** "Interleaving on the wire never threatens order — only the shared key you read
  it by does."

### 8. Reveal — cleanup safety, measured
- **fig:** the real run: the slot captures the insert first; the later delete on the outbox
  table produces no routed event at all, confirming cleanup is both invisible and already safe.
- **takeaway:** "Cleanup isn't risky by nature — it's only risky before the slot has caught up."

### 9. Recap
- **fig:** the outbox turns publish into commit; the router routes by aggregatetype and dedups
  by id; aggregateid keeps order; and cleanup is safe only once the slot has already moved past
  a row.
- **takeaway:** "Every piece of this pattern leans on the same fact: one transaction, one
  outcome."

### 10. Prove it
- **fig:** a team deletes old outbox rows the moment they're written, without ever checking
  whether the slot has actually captured them yet. Is that cleanup still safe?
- **predict options:** (a) yes, the router filters deletes either way [wrong — that protects
  against a different risk]; (b) no, a row deleted before capture is lost to every consumer
  [correct].

## Post-notes headings
- **Internals:** the dual-write loss, the outbox fix, the routing and dedup behavior, the
  ordering guarantee and the cleanup safety are all measured directly against this sandbox's
  own PostgreSQL cluster; Debezium's own Outbox Event Router implementation, the table-free
  `pg_logical_emit_message` variant, and the Quarkus outbox extension are named only.
- **Production:** publishing after commit instead of in the same transaction, and cleaning up
  the outbox before a slot has captured the rows being deleted, as the two concrete failure
  shapes this topic exists to prevent.
- **Frontier:** consumer-side deduplication using the outbox row's own id, and Kafka
  transactions as an alternative atomicity mechanism, named only, since they are Chapter 9's
  own subject.
- **Where this goes next:** everything so far assumed a Kafka cluster in the middle; reading the
  database's log straight into a stream processor without one is Flink CDC, the next topic.

## Concept ledger
- **Introduces:** `transactional-outbox`.
- **Uses:** `debezium-architecture-envelope`, `cdc-ordering-transaction-metadata`,
  `cdc-schema-evolution-resnapshot`, `slot-wal-retention-incident`,
  `exactly-once-effect-recipe` — all confirmed live via the registry-parsing script.
- **Declared:** the dual-write problem as a named hazard (no earlier topic teaches it).

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so Debezium's own Outbox Event Router SMT, the Quarkus outbox
extension, and the `pg_logical_emit_message` table-free variant cannot be run directly — all
three are named and quoted from their own documentation rather than reproduced, exactly as
CHAPTER.md's own "Lab" line describes. The dual-write loss, the outbox fix, the routing and
dedup behavior, the ordering guarantee and the cleanup safety are all measured directly against
this sandbox's real PostgreSQL 16 cluster, with a hand-built outbox table and a hand-built
router function standing in for Debezium's own implementation.

## Claims list (for fact-check)
1. The outbox table's default columns, and id used as a dedup key — SOURCES.md (Outbox Event
   Router); measured by construction in `examples.py`.
2. `aggregatetype`-based routing to `outbox.event.${routedByValue}` — SOURCES.md (Outbox Event
   Router); measured directly in `examples.py`.
3. The SMT filtering out DELETE operations on the outbox table — SOURCES.md (Outbox Event
   Router); measured directly in `examples.py`.
4. Logical decoding message events via `pg_logical_emit_message` — SOURCES.md (Debezium
   PostgreSQL connector, PostgreSQL 18 docs); named only.
5. The Quarkus outbox extension as a third way to write to an outbox — SOURCES.md (Outbox
   Quarkus Extension); named only.
