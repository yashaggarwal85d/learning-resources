# OUTLINE: Deletes and tombstones (`de.deletes-tombstones`)

## Learning outcomes
1. Name the two records of a Debezium delete and what each one is for.
2. Choose between a soft and a hard delete for a table and say what each costs a downstream
   cursor extract.
3. Apply a delete to a lakehouse table by `MERGE`.
4. Show the retention-window race and size a sink's maximum lag against it.

## Engagement arc
- Hook: step 1 (a new sink bootstrapped from a compacted topic resurrects a customer whose
  delete marker was already cleaned up).
- Predict: step 2, within the first four steps (does compaction keep both of a delete's two
  records, or only the newer one); step 10 (the one number a sink's own lag has to stay under).
- Takeaways: step 4 (the before-image obeys REPLICA IDENTITY, nothing special), step 6 (a
  cursor catches a soft delete and has nothing to catch for a hard one), step 7 (one MERGE
  carries every kind of change at once), step 8 (a consumer only has to be late, not wrong, to
  resurrect a row), step 9 (recap: four separate windows, only one of them closes on you).

## Steps (storyboard)

### 1. Hook
- **fig:** a new sink is bootstrapped from a compacted topic days after a customer was deleted;
  the delete's own marker was already cleaned up, and the customer comes back.
- **On screen:** a key's own tombstone fading out on a compacted log strip before a consumer
  arrives to read it.

### 2. Predict
- **fig:** a delete produces two records sharing one key, one after the other. Does compaction's
  keep-the-latest rule keep both, or only the newest of the two?
- **Options:** (a) both, since one explains what was deleted and the other proves it can be
  cleaned up [wrong — compaction never reads what a record means]; (b) only the newer one,
  since compaction keeps one record per key regardless of content [correct].

### 3. Reveal — the before-image follows the identity
- **fig:** a delete's before field answers to the same REPLICA IDENTITY setting an update's
  before field does: DEFAULT carries only the key, FULL carries the whole row.
- **Moves:** one delete record's own before field shown filling in differently depending on the
  table's own identity setting.

### 4. Reveal — the before-image, measured
- **fig:** the real run: the identical delete against a table at its default identity, then
  against one set to full; the first before-image carried only the key, the second the whole
  row.
- **takeaway:** "A delete's own before field is not special — it obeys whatever REPLICA IDENTITY the table was already set to."

### 5. Reveal — soft against hard
- **fig:** a soft delete is just another update, so a cursor query polling for recent changes
  sees it like any other row; a hard delete leaves the log as its only trace.
- **Narrator's line of thought:** she names exactly why the two costs diverge, to set up the
  measured contrast.

### 6. Reveal — soft against hard, measured
- **fig:** the real run: a cursor query sees the soft-deleted row show up like any update; the
  same cursor query never finds the hard-deleted row, with no trace at all.
- **takeaway:** "The exact same cursor query that catches a soft delete has nothing to catch once it's hard."

### 7. Reveal — carried by MERGE, measured
- **fig:** the real run: one MERGE statement applied to a real landing table removes exactly the
  deleted row's own key, leaving every other row untouched.
- **takeaway:** "One statement carries every kind of change at once — insert, update and delete all land in one MERGE."

### 8. Reveal — the retention race, measured
- **fig:** the real run: a consumer resuming before the retention window closes still finds the
  tombstone and applies the delete; one resuming after finds nothing at all and stays stale.
- **takeaway:** "A consumer doesn't have to be wrong about anything to resurrect a row — it only has to be late."

### 9. Recap
- **fig:** a delete's before-image follows REPLICA IDENTITY; soft deletes stay visible to a
  cursor and hard ones don't; a MERGE carries one into a table; and a tombstone outlives a
  delete only for so long.
- **takeaway:** "None of this is one rule — four separate windows, and only one of them ever closes on you."

### 10. Prove it
- **fig:** nothing stops a team from avoiding this race entirely. What's the one number a sink's
  own maximum lag has to stay under?
- **predict options:** (a) however long the source's own log keeps changes around for [wrong —
  that governs a different question]; (b) the topic's own delete.retention.ms, the window a
  tombstone is actually guaranteed to still be there [correct].

## Post-notes headings
- **Internals:** the before-image, cursor-visibility and MERGE measurements are all run directly
  against this sandbox's own PostgreSQL cluster; the retention-window race is measured against a
  hand-built model that implements Kafka's own documented rule exactly; Debezium's own
  event-flattening SMT and JDBC sink's delete.enabled are named only.
- **Production:** bootstrapping a new consumer from a compacted topic without checking its age,
  and assuming a cursor-based extract sees every kind of delete, as the two concrete failure
  shapes this topic exists to prevent.
- **Frontier:** a merge-on-read table format's own delete files and deletion vectors, named only,
  since the delete-file formats themselves are Chapter 6's own subject.
- **Where this goes next:** every record in this chapter has carried a position; a Kafka offset
  is a second one, setting up the next topic's subject: which position a restart actually
  trusts.

## Concept ledger
- **Introduces:** `cdc-delete-tombstone`, `delete-retention-race`.
- **Uses:** `replica-identity-before-image`, `cdc-schema-evolution-resnapshot`,
  `cursor-miss-modes`, `merge-statement` — all confirmed live via the registry-parsing script.
- **Declared:** the compacted topic as "latest value per key" (Chapter 9 topic 6 teaches it).

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so Debezium's own event-flattening SMT and JDBC sink connector
cannot be run directly — named from their own documentation rather than reproduced, disclosed in
`SOURCES.md` and `FACT-CHECK.md`. CHAPTER.md names the Apache Kafka 4.4 "Design" page as this
clause's own source, but that page serves only a client-rendered redirect shell to a plain
fetch, confirmed directly before substituting Confluent's own log-compaction documentation,
disclosed explicitly in `SOURCES.md` rather than silently passed off as the Apache page. The
retention-window race itself needs a real Kafka broker, so it is measured against a hand-built
model that implements Kafka's own documented compaction and retention rule exactly, not a
simplified stand-in for it. The before-image, soft/hard-delete and MERGE claims are all measured
directly against this sandbox's real PostgreSQL 16 cluster, exactly as CHAPTER.md's own "Lab"
line describes.

## Claims list (for fact-check)
1. The two-record delete and the tombstone-as-marker description — SOURCES.md (Debezium event
   flattening docs); measured by construction in `examples.py`.
2. The drop/tombstone/rewrite handling modes and `__deleted` — SOURCES.md (Debezium event
   flattening docs); named only.
3. "A message with a key and a null payload will be treated as a delete..." — SOURCES.md
   (Confluent log compaction docs); reproduced by construction.
4. The `delete.retention.ms` default of 24 hours — SOURCES.md (Confluent log compaction docs);
   measured directly in `examples.py`.
5. The lagging-consumer-misses-delete-markers caveat — SOURCES.md (Confluent log compaction
   docs); measured directly in `examples.py`.
6. `delete.enabled` — SOURCES.md (Debezium JDBC sink docs); named only.
7. The `REPLICA IDENTITY` tie-back for a delete's before field — SOURCES.md (Debezium PostgreSQL
   docs); measured directly in `examples.py`.
8. `tombstones.on.delete` — SOURCES.md (Debezium PostgreSQL docs); named only.
