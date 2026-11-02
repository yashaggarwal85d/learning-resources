# OUTLINE: Replication-slot WAL retention incidents (`de.replication-slot-wal-retention`)

## Learning outcomes
1. Reproduce WAL growth behind a stalled slot and read it off `pg_replication_slots`.
2. Name the two ways a healthy connector still fails to advance a slot and fix each with a
   heartbeat.
3. Set `max_slot_wal_keep_size` and say precisely what it saves and what it destroys.
4. Write the lag query and the alert it should feed.

## Engagement arc
- Hook: step 1 (a connector shows healthy Friday; by Monday the primary's disk is 96% full; the
  connector never stopped, the database it watches is quiet, and the slot sat still).
- Predict: step 2, within the first four steps (whether a healthy, running connector can still
  be the reason WAL keeps growing).
- Takeaways: step 4 (a slot with no reader pins WAL no matter how healthy the connector looks),
  step 6 (a periodic confirmation, not connector uptime, is what actually bounds the gap), step
  8 (the safety valve trades a filling disk for a `lost`, unusable slot).
- Recap: step 9. Prove it: step 10 (the lag query and what it's really protecting against, since
  none of the steps so far gave a number worth alerting on).

## Steps (storyboard)

### 1. Hook
- **fig:** a connector's own dashboard shows green all weekend; the primary's disk usage bar
  climbs steadily across the same weekend until it reaches 96%; the slot's own `restart_lsn`
  marker sits frozen the entire time while the WAL head keeps moving.
- **On screen:** a disk-usage bar climbing toward its own edge, a frozen position marker beside
  it.

### 2. Predict
- **fig:** the connector behind that slot never crashed, never disconnected, and reports healthy
  the entire weekend. Can a connector that looks completely healthy still be the reason WAL
  keeps growing?
- **Options:** (a) no — a healthy, connected connector is, by definition, confirming its own
  progress [wrong — a connector can be alive and connected while still never emitting anything
  that lets it confirm a new position, if nothing it's watching has changed]; (b) yes — a slot
  only advances when its consumer actually confirms a new position, and a quiet captured table
  gives it nothing to confirm, no matter how healthy the connector otherwise looks [correct].

### 3. Reveal — a slot doesn't know or care if anyone's listening
- **fig:** a replication slot persists across crashes and "knows nothing about the state of its
  consumer"; with no reader at all, the server has no basis for ever reclaiming the WAL that
  slot might still need.
- **Moves:** a slot icon sitting still while a WAL timeline keeps extending past it, unbothered.

### 4. Reveal — stalled growth, measured
- **fig:** the real run: a slot with no reader, a real write load against a scratch table, the
  retained-WAL gap read from `pg_replication_slots` before and after.
- **takeaway:** "A slot with no reader pins WAL exactly as hard as a slot whose consumer crashed — nothing about it can tell the difference."

### 5. Reveal — confirming, not merely running, is what moves the marker
- **fig:** the identical write volume, split into pieces; one slot's consumer never confirms
  between pieces, the other's confirms after every piece — mimicking a heartbeat.
- **Narrator's line of thought:** she separates "the connector is alive" from "the connector has
  confirmed a new position" as two genuinely different facts, since the hook's own failure
  depended on exactly this gap.

### 6. Reveal — confirmation, measured
- **fig:** the real run: the same total write volume, one slot's gap left after five
  unconfirmed batches, the other slot's gap left after five confirmed batches.
- **takeaway:** "What shrinks the gap is a confirmed read, not connector uptime — that's the entire reason a heartbeat exists."

### 7. Reveal — the safety valve trades a filling disk for a lost stream
- **fig:** `max_slot_wal_keep_size` set to a real bound; past that bound, the server is allowed
  to remove WAL the slot still needed, and `wal_status` moves from `reserved` toward `lost`.
- **Narrator's line of thought:** she names this precisely as a trade, not a fix — the disk is
  saved, but the one thing a slot exists to guarantee (a continuous stream) is gone the moment
  it happens.

### 8. Reveal — the lost slot, measured
- **fig:** the real run: `max_slot_wal_keep_size` set to a small real value, `wal_status` read
  before and after enough write volume to exceed it, and the exact error PostgreSQL raises when
  something then tries to read from the slot.
- **takeaway:** "Past the limit the slot turns lost, not merely behind — reading from it afterward is simply refused."

### 9. Recap
- **fig:** a stalled slot pinning WAL regardless of connector health, a confirmed read as the
  only thing that actually moves the marker, and the safety valve's own trade between disk and
  stream continuity.

### 10. Prove it
- **fig:** none of the steps so far produced a single number worth alerting on before the disk
  is already in trouble. What should actually trigger the alarm?
- **predict options:** (a) connector status, since that's what every monitoring dashboard
  already shows [wrong — the hook's own connector reported healthy the entire time the disk was
  filling, so connector status alone cannot be the signal]; (b) the retained-WAL gap itself,
  read directly from `pg_replication_slots` via `pg_wal_lsn_diff`, since that number is exactly
  what's actually filling the disk [correct].

## Post-notes headings
- **Internals:** the stalled-slot mechanism, the two Debezium-named variants (a low-traffic
  captured table; a quiet database sharing WAL with a busy one) and the AWS RDS case are named
  from Debezium's own documentation, not independently reproduced, since this sandbox has one
  database and no RDS instance to exercise those exact variants against; the slot-growth,
  heartbeat-equivalent, and safety-valve mechanisms are all measured directly on this sandbox's
  own PostgreSQL cluster.
- **Lab:** hosts the stalled-consumer leg of the 8.2 lab directly, on this sandbox's own
  PostgreSQL: a slot with no consumer, its measured growth, a hand-written confirming consumer
  standing in for a heartbeat, and `max_slot_wal_keep_size` producing a real `lost` slot whose
  stream genuinely cannot be resumed.
- **Production:** the hook's own scenario (a healthy-looking connector whose slot has quietly
  filled the disk over a weekend) as the concrete shape of the incident this topic exists to
  prevent.
- **Frontier:** `idle_replication_slot_timeout` (PostgreSQL 18) is named from the release notes
  as the newest addition in this topic's scope, not exercised, since this sandbox runs
  PostgreSQL 16.
- **Where this goes next:** a slot protects a position in the log. But a new consumer has no
  position yet and needs the table as it stands now, then every change after exactly that
  moment, with no gap and no overlap. How that handover works is the next topic.

## Concept ledger
- **Introduces:** `slot-wal-retention-incident`, `slot-safety-valves`.
- **Uses:** `logical-decoding-slot`, `wal-lsn-fsync`, `vacuum-xid-wraparound` — all confirmed
  live via the registry-parsing script.
- **Declared:** none beyond topic 11.

## Changes from the chapter plan
This sandbox has one PostgreSQL database and no AWS RDS instance, so the idle-captured-table and
multi-database variants, and the RDS five-minute-invisibility case, are named from Debezium's
own documentation rather than independently reproduced — disclosed in `SOURCES.md` and
`FACT-CHECK.md`. `idle_replication_slot_timeout` and the `inactive_since` column are PostgreSQL
18/17 additions; this sandbox runs PostgreSQL 16, confirmed directly in `examples.py`, so both
are named from the release notes and the replication-configuration page rather than exercised.

## Claims list (for fact-check)
1. "Replication slots persist across crashes and know nothing about the state of their
   consumer(s)... This consumes storage." — SOURCES.md (PostgreSQL docs); measured directly in
   `examples.py`.
2. `max_slot_wal_keep_size` and its default of -1 — SOURCES.md (PostgreSQL docs); measured
   directly by setting a real value and observing a real `lost` slot.
3. `restart_lsn`'s own definition — SOURCES.md (PostgreSQL docs); read live in the lag-query
   function.
4. The two Debezium-named healthy-but-stalled variants and the AWS RDS case — SOURCES.md
   (Debezium docs); named in prose, not independently reproduced.
5. The heartbeat mechanism's effect — modelled directly in `examples.py` by a hand-written
   confirming consumer, per `CHAPTER.md`'s own instruction.
