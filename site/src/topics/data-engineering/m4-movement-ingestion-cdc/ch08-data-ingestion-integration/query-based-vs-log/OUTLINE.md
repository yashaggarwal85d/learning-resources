# OUTLINE: Query-based vs log-based CDC (`de.query-based-vs-log`)

## Learning outcomes
1. Measure what polling and triggers miss and cost on a changing table.
2. State what log-based capture gives (complete, ordered, low overhead) and what it couples
   you to.
3. Choose between them for a given source by delete handling, intermediate-state need, source
   privileges and operational tolerance.

## Engagement arc
- Hook: step 1 (order 1042 goes new, paid, shipped, refunded within four seconds; a poll
  samples once and sees only "refunded"; the warehouse never knows it was ever paid).
- Predict: step 2, within the first four steps (whether a trigger-based shadow table sees the
  intermediate states a plain poll misses).
- Takeaways: step 4 (a poll sees only the state at the moment it runs, never the states in
  between), step 6 (a poll cannot tell "never existed" from "deleted"; the log always can),
  step 8 (a trigger writes every change twice, transactionally, and the log reads the identical
  changes for free, from WAL the server already wrote).
- Recap: step 9. Prove it: step 10 (the trade the rest of 8.2 manages: a slot pins storage and
  is broken by a failover that loses its position).

## Steps (storyboard)

### 1. Hook
- **fig:** order 1042 goes new, paid, shipped, refunded within four seconds; a poll samples the
  row once and sees "refunded"; the warehouse's own history of this order never includes "paid"
  or "shipped" at all.
- **On screen:** one row's four stamped states on a timeline, a single poll tick landing on the
  last one.

### 2. Predict
- **fig:** the identical four-second sequence, but this time a trigger copies every change to a
  shadow table the instant it happens, in the same transaction as the real write. Does the
  shadow table see the states the poll missed?
- **Options:** (a) no — a trigger only fires on the final committed state of a transaction, the
  same as a poll [wrong — a trigger fires once per statement, inside the same transaction as
  each individual update, not once per transaction as a whole]; (b) yes — a trigger fires on
  every individual statement, so it captures every intermediate state a poll would skip right
  over [correct].

### 3. Reveal — a poll's one sample
- **fig:** a poll is a single query, run on a schedule; between two runs, a row can pass through
  any number of states, and the poll only ever reports the one state it happened to catch.
- **Moves:** a comb of thin ticks sweeping across a row's timeline, most of its teeth landing on
  empty space between states.

### 4. Reveal — the intermediate states, measured
- **fig:** the real run: order 1042's own four updates against this sandbox's real PostgreSQL,
  a poll's single query against a logical replication slot reading every change.
- **takeaway:** "A poll reports the state it happens to catch — a log reports every state a row passed through, in order."

### 5. Reveal — a poll can't see what's gone
- **fig:** a row is inserted and deleted inside the same short window; a poll that asks "what
  changed since the watermark" finds nothing, because there is nothing left to find.
- **Narrator's line of thought:** she treats this as a different failure from the intermediate-
  state miss — it isn't that the poll samples too rarely, it's that the row it would need to
  see has stopped existing by the time it looks.

### 6. Reveal — the delete, measured
- **fig:** the real run: an inserted-then-deleted test row, a poll's own query finding zero
  matching rows, the log showing the exact delete event.
- **takeaway:** "A poll can't tell a row that never existed from one that existed and was deleted — the log always can, because it recorded the delete itself."

### 7. Reveal — a trigger's real cost
- **fig:** a trigger that copies a change into a shadow table runs inside the identical
  transaction as the write it's capturing, so every write to the real table becomes two writes:
  one to the table, one to the shadow.
- **Narrator's line of thought:** she names this cost plainly — it isn't a bug in the trigger
  approach, it's the mechanism working exactly as designed, at twice the price.

### 8. Reveal — write amplification and log cost, both measured
- **fig:** the real run: four writes to `orders` producing four shadow-table rows through the
  trigger, against the identical four changes read for free from a replication slot that reads
  only WAL the server had already written for its own recovery.
- **takeaway:** "A trigger doubles every write it captures — the log captures the identical changes for free, from WAL the server already wrote."

### 9. Recap
- **fig:** a poll's one sample, a trigger's doubled write, and a log's complete, ordered, low-
  overhead read, side by side.

### 10. Prove it
- **fig:** reading the log is complete and cheap. What does it cost operationally that polling
  and triggers don't?
- **predict options:** (a) nothing extra — reading WAL is free since the server already wrote it
  [wrong — the position a consumer holds in that log (a slot) has its own cost: it pins storage
  on the source and depends on privileges, log retention and the log format]; (b) the capture
  holds a position on the source that pins storage, depends on retention and privileges, and is
  broken by a failover that loses that position [correct].

## Post-notes headings
- **Internals:** none claimed beyond what's measured directly — PostgreSQL's own logical
  decoding mechanism is read at the level `pg_logical_slot_get_changes` and `test_decoding`
  expose it; the engine-specific internals (WAL, slots, output plugins, `REPLICA IDENTITY`) are
  topic 10's own subject, not re-derived here. Debezium, Airbyte and Meltano's own log-based
  replication methods are named in prose from their own documentation, not independently
  re-measured.
- **Lab:** none of its own, per `CHAPTER.md` — the poll-versus-trigger-versus-log comparison on
  `orders` is this topic's own measured example and feeds the 8.2 chapter lab.
- **Production:** the hook's own scenario (a four-second state sequence a poll samples once) as
  the concrete shape of what a cursor-based pipeline silently cannot see, motivating log-based
  capture for sources where intermediate states or deletes matter.
- **Frontier:** none claimed — polling, trigger-based capture and logical decoding are each
  established, long-documented practice.
- **Where this goes next:** reading the database's own log is complete and cheap, and it is a
  bargain with the source. What exactly the log contains, and how a consumer holds a place in
  it, depends on the engine. The first to open is PostgreSQL's.

## Concept ledger
- **Introduces:** `query-vs-log-cdc`.
- **Uses:** `cursor-miss-modes`, `high-watermark-cursor` (topic 3), `wal-lsn-fsync` (Chapter 5
  topic 3), `physical-vs-logical-replication` (Chapter 5 topic 18) — all confirmed live via the
  registry-parsing script.
- **Declared:** none beyond topic 8.

## Changes from the chapter plan
None. All four named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. "Logical decoding is the process of extracting all persistent changes to a database's tables
   into a coherent, easy to understand format." — SOURCES.md (PostgreSQL docs).
2. "PostgreSQL normally purges write-ahead log (WAL) segments after some period of time. This
   means that the connector does not have the complete history of all changes." — SOURCES.md
   (Debezium docs).
3. A poll samples a row's state once per run and reports only the state it happens to catch,
   never the states a row passed through between two runs. — measured directly in
   `examples.py` against the real `orders` table.
4. A poll that looks for rows changed since a watermark finds nothing for a row that was
   inserted and deleted inside the same interval; a logical replication slot reading the
   identical window shows the exact delete event. — measured directly in `examples.py`.
5. A trigger-based shadow table doubles every write it captures, one write to the source table
   and one to the shadow, inside the identical transaction. — measured directly in
   `examples.py`.
6. Reading a logical replication slot's changes costs proportionally to the number of changes
   made, not to the size of the table being watched. — measured directly in `examples.py`.
