# OUTLINE: CDC from OLTP into a lakehouse (`de.cdc-from-oltp-into`)

## Learning outcomes
1. Design CDC from the shop's Postgres orders into an Iceberg table with an SLO, an estimate
   (change rate, WAL volume, merge cost), and three alternatives for the capture method.
2. Choose a snapshot-handover design with its cost, and state a delete and schema-change policy
   as a written ADR.
3. Show the replication-slot growth simulation, set a cap and an alert from it.
4. Size the compaction schedule and show how a stalled merge threatens the source.
5. State the next bottleneck at ten times.

## Engagement arc
- Hook: step 1 (the CDC connector is stopped for a weekend upgrade and nobody restarts it; by
  Wednesday the orders database, the one that takes payments, is at 94 percent disk, after being
  healthy for nine months).
- Predict: step 2, within the first four steps (the setting that bounds the slot, and whether
  the trade is availability for completeness).
- Takeaways: step 4 (the slot's own guarantee is what makes a stopped connector dangerous), step
  6 (a snapshot and a stream must hand over without a gap or an overlap), step 8 (a stalled
  compaction stalls the merge, which stalls slot consumption, which grows the source's WAL).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a CDC connector lane goes dark for a weekend upgrade; a source-disk gauge climbs
  through the week while nobody notices, reaching 94 percent by Wednesday after nine healthy
  months.
- **On screen:** the connector lane dark, the disk gauge climbing.

### 2. Predict
- **fig:** what did the design fail to say about the slot, what single setting bounds it, and
  what does the bound cost?
- **Options:** (a) the connector itself leaked disk space through a memory or log bug, unrelated
  to replication [wrong — the growth is the replication slot's own retained WAL, not a leak];
  (b) the slot retains every byte of WAL the stopped connector hasn't confirmed, and a setting
  caps that retention at the price of breaking replication if the slot falls too far behind
  [correct].

### 3. Reveal — the pipeline strip and its correctness boundary
- **fig:** the CDC pipeline strip: the write-ahead log, a logical replication slot, a connector
  reading it, a Kafka topic, an idempotent `MERGE` into the lakehouse table ordered by log
  position, not arrival time; a dashed correctness boundary drawn at the merge.
- **Moves:** the strip lays out left to right, the boundary dropping onto the merge stage.

### 4. Reveal — the slot's guarantee is the hazard
- **fig:** the replication slot drawn as a growing WAL column while the connector lane stays
  dark; the slot's own guarantee — it keeps every unconfirmed byte, outage or not — is what
  turns a paused connector into a disk-filling hazard.
- **takeaway:** "The guarantee that protects the pipeline from data loss is the same guarantee that fills the disk when the pipeline stops."

### 5. Reveal — the cap and its cost
- **fig:** a cap line crosses the growing WAL column; past it, the slot is invalidated and a
  full re-snapshot is forced, drawn in red; a heartbeat line keeps a slot on a quiet table from
  drifting toward that same cap.
- **Narrator's line of thought:** she treats the cap as a traded cost, not a free fix — it buys
  the source's availability by giving up the connector's ability to resume without a re-snapshot.

### 6. Reveal — snapshot and stream handover
- **fig:** a decision card: a consistent snapshot followed by the stream from the snapshot's own
  log position, against a watermark-based incremental snapshot that interleaves log events with
  directly selected rows, taking no lock on the source table.
- **takeaway:** "A new consumer needs the table's state and then every change after it, without a gap or an overlap between the two."

### 7. Reveal — deletes and schema change
- **fig:** a deleted source row arriving as a tombstone that the merge must apply as a delete;
  beside it, a column added at the source absorbed through a coordinated expand-then-contract
  rollout rather than a same-day rename.
- **Narrator's line of thought:** she treats a delete and a schema change as events the merge
  must be told how to apply, not events it can infer on its own.

### 8. Reveal — compaction and the new interaction
- **fig:** a merge-on-read table's small delete and data files piling up from the row-level
  merge stream; a stalled compaction job slowing the sink, the slot gauge rising in sympathy as
  consumption stalls behind it.
- **takeaway:** "A stalled compaction stalls the merge, which stalls the slot, which grows the source's log — the interaction this design itself creates."

### 9. Recap
- **fig:** the pipeline strip with its correctness boundary, the slot-and-cap trade, the
  snapshot-handover decision, the delete-and-schema policy, and the compaction-to-slot
  interaction, side by side.

### 10. Prove it
- **fig:** a second table's CDC connector, paused for an unrelated maintenance window, with its
  slot already past half the configured cap and climbing.
- **predict options:** (a) raise the cap further, since more headroom means more safety margin
  [wrong — raising the cap doesn't change the trade, it only delays the choice between the
  source's disk and a re-snapshot]; (b) compute the slot's own growth rate against the time left
  to the cap, and restart or re-snapshot before it's forced [correct].

## Post-notes headings
- **Internals:** none claimed independently — logical decoding, replication slots and the WAL
  (Chapter 5), the Debezium and Kafka Connect mechanics (Chapter 8 §8.2), and table-format MOR
  internals (Chapter 6) are each named only as a choice pointing to its home chapter; the
  exactly-once argument itself is Chapter 14's.
- **Lab:** none of its own; the replication-slot WAL-growth simulation (retained WAL over time,
  with and without a cap and a heartbeat) and the merge-throughput estimate are this topic's
  executable evidence.
- **Production:** the hook's own stopped-connector-fills-the-disk scenario as the concrete shape
  "the slot's guarantee is also its hazard" takes in practice.
- **Frontier:** none claimed — log-based CDC and watermark-based incremental snapshots are
  established practice (Debezium ships both), not an emerging technique.
- **Where this goes next:** several writers now touch the same lakehouse table: the CDC merge, a
  backfill, a compaction job, a schema migration. The table format's optimistic commits will
  serialise them, and sometimes reject them. The next design is a lakehouse with concurrent
  writers and time travel.

## Concept ledger
- **Introduces:** `cdc-lakehouse-design`, `slot-lag-vs-source-disk-tradeoff`,
  `merge-stall-to-slot-growth-interaction`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `physical-vs-logical-replication` and `wal-lsn-fsync`
  (Chapter 5), `replication-ack-modes`, `merge-statement`, `lakehouse-merge-rewrite`,
  `upsert-atomicity` (Chapter 2), `data-contract-specification` — all confirmed live via `grep`
  on `introduces` arrays across `registry.ts`.
- **Declared:** `at-least-once-plus-idempotence` and `table-commit-as-cas` (Chapter 14, not yet
  planned or built — `at-least-once-plus-idempotence` is the same placeholder id topics 10–13
  already introduced for that gap; `table-commit-as-cas` is the id `CHAPTER.md` itself names for
  Chapter 14 topic 11, reused here as-is since both this topic and topic 15 reference it by that
  exact name), `delete-files-until-compaction` and `erasure-vs-time-travel-snapshot-expiry`
  (Chapter 13, not yet planned or built), `multi-window-multi-burn-rate-alert` and
  `actionable-page-test` (Chapter 13, not yet planned or built), `cdc-log-based-capture`
  (Chapter 8 §8.2, same placeholder id topic 10 already introduced), `iceberg-delta-table-format-tradeoffs`
  (Chapter 6 §6.3, same placeholder id topic 12 already introduced).

## Changes from the chapter plan
`CHAPTER.md` names Chapter 5, 6, 8, 9, 11, 13 and 14 ids for `uses`/`declared`. Checked each via
`grep` on `introduces` arrays: Chapter 5's and Chapter 2's named ids, plus
`data-contract-specification`, are live; Chapter 9's compatibility-mode ids and Chapter 11's
expand-contract id are referenced by `CHAPTER.md` only as named concepts for the narration to
point at (not pulled into `uses`, since this topic's own scope line treats Chapter 9 and Chapter
11 as choices "absorbed... through" rather than mechanics this topic builds on directly) —
Chapters 9 and 11 are themselves confirmed unplanned in `registry.ts` for data-engineering, so no
new placeholder was introduced for them since no step's claim depends on a specific
Chapter-9/11-introduced id. Chapters 13 and 14 are confirmed entirely unplanned (zero topics in
`registry.ts`); their six named ids move to `declared`, reusing `CHAPTER.md`'s own literal names
as the placeholder convention established in topics 10, 12 and 13 already does for
`cdc-log-based-capture` and `iceberg-delta-table-format-tradeoffs`. No scope cut — this topic
still leaves out logical decoding/replication-slot/WAL internals, the Debezium/Kafka Connect
mechanics, table-format MOR internals, the exactly-once argument, and the expand-contract
rollout and contract enforcement, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. `max_slot_wal_keep_size` is the setting that bounds a replication slot's retained WAL; past
   the bound, a slot that has fallen behind by more than the cap can no longer continue
   replication because the WAL it needs has been removed. — SOURCES.md (PostgreSQL).
2. A replication slot retains all the WAL entries a connector like Debezium needs, even while
   that connector is stopped or down. — SOURCES.md (Debezium).
3. A heartbeat event, configured via a connector's heartbeat interval, is Debezium's own
   documented fix for a slot that would otherwise lag on a quiet table. — SOURCES.md (Debezium).
4. The pipeline strip, the snapshot-versus-watermark-incremental-snapshot handover decision, the
   delete-and-schema-change policy, and the compaction-to-slot interaction are this chapter's own
   established method and this topic's own derived design, not an independent citation beyond
   claims 1–3.
