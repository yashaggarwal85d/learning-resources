# OUTLINE: Debezium architecture and event model (`de.debezium-architecture-event-model`)

## Learning outcomes
1. Choose between Connect, Debezium Server and the embedded engine for a given platform.
2. Read every field of a change event and say what the sink needs from it.
3. Apply the unwrap SMT and state what it removes.
4. Configure a JDBC sink that is idempotent and applies deletes.

## Engagement arc
- Hook: step 1 (a team unwraps a Debezium topic, loses the op field, and can no longer tell a
  re-snapshot read apart from a real insert).
- Predict: step 2, within the first four steps (can a consumer still tell a read apart from an
  insert once a record is unwrapped); step 10 (is a sink still safe to replay without upsert
  mode).
- Takeaways: step 4 (every field in the card is already there before any transform touches it),
  step 6 (unwrapping never destroys a delete, it just renames what disappearing looks like),
  step 8 (a replay only stays harmless because the write refuses to duplicate anything), step 9
  (recap: every shortcut trades one field or guarantee for something simpler).

## Steps (storyboard)

### 1. Hook
- **fig:** a team unwraps a Debezium topic to simplify it for a sink; the op field goes with
  it, and a re-snapshot read event now looks exactly like a real insert.
- **On screen:** the full change card collapsing to one row, with three fields left dark.

### 2. Predict
- **fig:** unwrapping a change event keeps only its column values. Can a consumer still tell a
  re-snapshot read apart from a genuine insert once that happens?
- **Options:** (a) yes, the column values alone are enough [wrong — nothing about a plain row
  says how it arrived]; (b) no, both now look identical, with no op field left to tell them
  apart [correct].

### 3. Reveal — three deployment shapes
- **fig:** Debezium deploys three ways: a Kafka Connect connector, the standalone Debezium
  Server streaming straight to a messaging system, or the Debezium Engine embedded as a
  library.
- **Moves:** three small boxes, each labelled with its own deployment shape and what it trades.

### 4. Reveal — the envelope card, measured
- **fig:** the real run: a real insert and a real update, each rebuilt by hand into the full
  envelope; the insert's own before is empty, the update carries both before and after.
- **takeaway:** "Every field in the card is already there before any transform ever touches
  it."

### 5. Reveal — what unwrap actually drops
- **fig:** the unwrap transform extracts only the after field from an envelope and replaces the
  whole record with it; before, op and source are gone unless a variant adds them back.
- **Narrator's line of thought:** she names exactly what the simplifying step throws away, to
  set up the measured contrast.

### 6. Reveal — unwrap, measured
- **fig:** the real run: unwrapping a real envelope keeps only its column values; a real
  delete, unwrapped, carries its last-known columns plus a deleted marker instead of
  vanishing.
- **takeaway:** "Unwrapping never destroys a delete — it just renames what disappearing looks
  like."

### 7. Reveal — why upsert is the safe mode
- **fig:** a JDBC sink configured for upsert mode makes writes idempotent: replaying an event
  always produces the same final row state, because an upsert updates an existing key instead
  of duplicating it.
- **Moves:** one arrow looping back onto the same row, labelled "same key, same place."

### 8. Reveal — the idempotent sink, measured
- **fig:** the real run: applying the identical unwrapped record twice, by a real upsert,
  leaves the row in the exact same state both times, and never inserts a second row.
- **takeaway:** "A replay only stays harmless because the write itself refuses to duplicate
  anything."

### 9. Recap
- **fig:** three deployment shapes, one envelope card, an unwrap transform that trades fields
  for simplicity, and a sink that only stays safe to replay if it upserts.
- **takeaway:** "Every shortcut here trades one field or one guarantee for something simpler."

### 10. Prove it
- **fig:** a team configures a JDBC sink without ever setting insert mode to upsert. Is
  replaying one already-applied event still guaranteed to leave the table in the same state?
- **predict options:** (a) yes, regardless of insert mode [wrong — idempotence was never
  automatic]; (b) no, without upsert mode a replayed event can insert a duplicate row [correct].

## Post-notes headings
- **Internals:** the envelope rebuild, the unwrap transform and the idempotent-upsert claim are
  all measured directly against this sandbox's own PostgreSQL cluster; the three deployment
  shapes, their sink targets, and the JDBC sink's `schema.evolution` and `delete.enabled`
  settings are named only.
- **Production:** unwrapping a stream and then needing the field it just threw away, and
  assuming any write to a sink is safe to retry, as the two concrete failure shapes this topic
  exists to prevent.
- **Frontier:** topic routing and content-based routing, named only, since they need a real
  broker and are Chapter 9's own subject.
- **Where this goes next:** Debezium turns database changes into events; publishing a domain
  event without the dual-write bug is the next topic's subject, the transactional outbox
  pattern.

## Concept ledger
- **Introduces:** `debezium-architecture-envelope`.
- **Uses:** `logical-decoding-slot`, `cdc-delete-tombstone`, `cdc-source-offset-vs-kafka-offset`,
  `snapshot-modes`, `cdc-ordering-transaction-metadata`, `cdc-schema-evolution-resnapshot` — all
  confirmed live via the registry-parsing script.
- **Declared:** basic Kafka, a topic and a producer (Chapter 9 teaches the internals).

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so no real Debezium deployment, Kafka Connect cluster or JDBC
sink connector can be run directly — the three deployment shapes, their sink targets, and the
JDBC sink's own configuration are named and quoted from their own documentation rather than
reproduced, exactly as CHAPTER.md's own "Lab" line describes. CHAPTER.md names Kafka's own
Connect user guide for one supporting detail, but that page serves only a client-rendered
redirect shell to a plain fetch, confirmed directly before substituting Confluent's own
configuration reference, disclosed in `SOURCES.md`. The envelope rebuild, unwrap and
idempotent-upsert claims are all measured directly against this sandbox's real PostgreSQL 16
cluster's own logical-decoding primitives, with a hand-built envelope and unwrap function
standing in for Debezium's own implementation.

## Claims list (for fact-check)
1. The Java-version split across deployment shapes and the latest stable release — SOURCES.md
   (Debezium Release Series 3.7); named only.
2. The three deployment shapes (Kafka Connect, Debezium Server, embedded engine) — SOURCES.md
   (Debezium Architecture); named only, sets up every measured step's own framing.
3. Debezium Server's own sink targets, including Redis Stream — SOURCES.md (Architecture,
   Store Debezium state); named only.
4. The unwrap transform's own mechanism (extracts only after, replaces the record) — SOURCES.md
   (New Record State Extraction); measured by construction in `examples.py`.
5. The idempotent-upsert claim (replaying an event always produces the same final row state) —
   SOURCES.md (JDBC sink connector); measured directly in `examples.py`.
6. `delete.enabled` and `schema.evolution = basic` — SOURCES.md (JDBC sink connector); named
   only.
7. The offset-storage topic, tying the Connect deployment shape back to topic 18 — SOURCES.md
   (Confluent Kafka Connect configuration reference); named only.
