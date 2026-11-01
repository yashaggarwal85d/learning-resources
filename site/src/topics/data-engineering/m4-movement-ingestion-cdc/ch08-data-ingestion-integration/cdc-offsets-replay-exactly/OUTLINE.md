# OUTLINE: CDC offsets, replay and exactly-once (`de.cdc-offsets-replay-exactly`)

## Learning outcomes
1. Name the two positions in a CDC pipeline and where each is stored.
2. Say exactly which crash replays records, and why.
3. Enable Kafka Connect's exactly-once source support and state its preconditions.
4. Explain what Debezium does and does not promise about duplicates, with the documented
   caveat.
5. Recover from a purged source position.

## Engagement arc
- Hook: step 1 (a connector pod is killed between producing five thousand change events and
  committing their offsets; it emits them again on restart, and a downstream counter is five
  thousand orders too high).
- Predict: step 2, within the first four steps (does the restart skip the already-produced batch
  or emit it again); step 10 (does enabling exactly-once source support alone protect a
  downstream consumer from double-counting).
- Takeaways: step 4 (the batch is correct twice, which is exactly the problem), step 6 (a
  consumer's own dedup is something it builds, never something handed to it), step 8 (a purged
  position only restarts clean, it never resumes), step 9 (recap: none of the four facts rescues
  you from the other three).

## Steps (storyboard)

### 1. Hook
- **fig:** a connector pod is killed between producing five thousand change events and
  committing their offsets; on restart it emits them again, and a downstream counter that sums
  amount is now five thousand orders too high.
- **On screen:** a produce tick and a commit tick on a timeline, with the crash landing between
  them.

### 2. Predict
- **fig:** the offset was never committed before the crash. Does the restart skip the batch it
  already produced, or emit the identical batch again?
- **Options:** (a) skip it, since Kafka Connect already remembers what it sent [wrong — nothing
  records that anywhere]; (b) emit it again, since nothing ever told the source position it had
  moved [correct].

### 3. Reveal — two positions, two stores
- **fig:** a connector tracks a source position and a Kafka offset, stored in different places;
  Kafka Connect commits the source position to its own topic periodically, not per record.
- **Moves:** the source log's own position marker and the output topic's own offset marker
  drawn as two separate strips, joined by a periodic commit arrow.

### 4. Reveal — the crash and replay, measured
- **fig:** the real run: peeking the decoded batch twice without ever advancing the slot returns
  the identical batch both times; advancing right after producing leaves nothing for the next
  peek to find.
- **takeaway:** "Nothing about the batch is wrong or corrupted — it's correct twice, which is
  exactly the problem."

### 5. Reveal — no dedup layer of its own
- **fig:** Debezium does not implement an internal deduplication layer of its own, and provides
  at-least-once delivery by default; recovering from a fault can emit some duplicate change
  events.
- **Narrator's line of thought:** she names the documented boundary of what the capture tool
  promises, to set up the measured contrast.

### 6. Reveal — naive against dedup, measured
- **fig:** the real run: a reader that only sums what it sees comes out double the true total;
  one that dedupes by each change's own log position matches the true total exactly.
- **takeaway:** "A consumer's own dedup is something it builds — never something handed to it."

### 7. Reveal — exactly-once, by transaction
- **fig:** Kafka Connect's own exactly-once source support writes records and offsets
  atomically in one transaction, and fences out old task generations; an existing cluster
  enables it across two rolling upgrades, preparing then enabled.
- **Moves:** one box drawn around "records plus offsets" so the crash from step 4 cannot fall
  between them.

### 8. Reveal — a purged position, measured
- **fig:** the real run: dropping a slot and then reading from its own name raises an error
  immediately; only creating a brand-new slot lets the pipeline run again.
- **takeaway:** "A purged position doesn't resume from where it was — it can only restart from
  scratch."

### 9. Recap
- **fig:** two positions, two stores, committed on different schedules; a crash before the
  commit replays; Debezium offers no dedup of its own; a transaction can close that gap; a
  purged position closes the account entirely.
- **takeaway:** "None of these four facts rescues you from the other three — each one needs its
  own fix."

### 10. Prove it
- **fig:** a source connector just enabled exactly-once source support successfully. Does that
  alone guarantee the consumer reading its topic can never double-count a record?
- **predict options:** (a) yes, it covers the whole pipeline end to end [wrong — it only covers
  the connector's own write]; (b) no, it only protects the connector's own write of records and
  offsets; what a consumer does downstream is still its own responsibility [correct].

## Post-notes headings
- **Internals:** the crash-and-replay, committed-in-time, naive-versus-dedup and purged-position
  measurements are all run directly against this sandbox's own PostgreSQL cluster, using
  `pg_logical_slot_peek_changes` and `pg_replication_slot_advance` to model Kafka Connect's own
  separate produce and commit steps; KIP-618's transactional exactly-once source support is
  named only.
- **Production:** a downstream counter with no dedup logic of its own, and trusting Debezium's
  delivery guarantee to be stronger than it documents, as the two concrete failure shapes this
  topic exists to prevent.
- **Frontier:** Kafka's own transactions, the idempotent producer and `read_committed`
  consumption, named only, since they are Chapter 9's own subject.
- **Where this goes next:** the pieces are all here — a slot, a snapshot, events, offsets — and
  one project assembles them behind a configuration file, which is Debezium's own architecture,
  the next topic's subject.

## Concept ledger
- **Introduces:** `cdc-source-offset-vs-kafka-offset`, `cdc-exactly-once-caveats`.
- **Uses:** `exactly-once-effect-recipe`, `logical-decoding-slot`, `snapshot-modes`,
  `slot-safety-valves`, `mysql-binlog-gtid-schema-history` — all confirmed live via the
  registry-parsing script.
- **Declared:** a Kafka transaction as an atomic write of several records (Chapter 9 topic 11
  teaches it).

## Changes from the chapter plan
This sandbox has no JVM, broker or Kafka Connect cluster, so KIP-618's own transactional
exactly-once source support cannot be run directly — quoted and sourced only, exactly as
CHAPTER.md's own "Lab" line describes. CHAPTER.md names Kafka's own Connect user guide as a
source, but that page serves only a client-rendered redirect shell to a plain fetch, confirmed
directly before substituting Confluent's own Kafka Connect configuration reference, disclosed
explicitly in `SOURCES.md` rather than silently passed off as the Apache page. The crash-replay,
committed-in-time, naive-versus-dedup and purged-position claims are all measured directly
against this sandbox's real PostgreSQL 16 cluster's own logical-decoding primitives, which model
Kafka Connect's separate produce-and-commit steps precisely.

## Claims list (for fact-check)
1. The atomic write-plus-fencing design — SOURCES.md (KIP-618); named only, sets up step 7's
   measured-by-model contrast with step 4's crash.
2. The `exactly.once.source.support` property and its default — SOURCES.md (KIP-618); named
   only.
3. No internal deduplication layer — SOURCES.md (Debezium EOS docs); measured by construction
   in `examples.py`.
4. The documented doubt, Jepsen reports, and open Kafka issues — SOURCES.md (Debezium EOS
   docs); named only.
5. The supported connector list — SOURCES.md (Debezium EOS docs); named only.
6. The at-least-once-by-default behavior recovering from a fault — SOURCES.md (Debezium
   PostgreSQL docs); measured directly in `examples.py`.
7. The two-rolling-upgrade enablement path (preparing, then enabled) — SOURCES.md (Confluent
   Kafka Connect configuration reference); named only.
8. `errors.tolerance` — SOURCES.md (Confluent sink connector configuration reference); named
   only.
9. The repeated-delivery guarantee a crash leaves behind — SOURCES.md (PostgreSQL 18 Logical
   Decoding Concepts); measured directly in `examples.py`.
