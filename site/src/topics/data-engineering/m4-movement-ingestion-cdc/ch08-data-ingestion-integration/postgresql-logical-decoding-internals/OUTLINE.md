# OUTLINE: PostgreSQL logical decoding internals (`de.postgresql-logical-decoding-internals`)

## Learning outcomes
1. Decode a real `INSERT`, `UPDATE` and `DELETE` from a logical replication slot and read the
   output.
2. Show how `REPLICA IDENTITY` changes what before-image a decoded `UPDATE` carries.
3. Read `restart_lsn` and `confirmed_flush_lsn` from `pg_replication_slots` and say what each
   one protects.
4. Explain why a consumer of a logical slot must tolerate repeats, and what PG16 standby
   decoding and PG17 failover slots each add, and what each needs configured.

## Engagement arc
- Hook: step 1 (the identical `UPDATE orders SET status = 'shipped'` decoded three times under
  three `REPLICA IDENTITY` settings; the before-image fills in, shrinks to one column, or stays
  empty).
- Predict: step 2, within the first four steps (whether reading the same unconfirmed slot twice
  returns the same data twice).
- Takeaways: step 4 (the before-image is exactly what `REPLICA IDENTITY` allows, nothing a
  plugin adds on its own), step 6 (a slot's position is persisted only at checkpoint, so a
  consumer that hasn't confirmed can be handed the same change again), step 8
  (`confirmed_flush_lsn` moves on confirmation; `restart_lsn` doesn't move with it, and the gap
  between them is exactly what the server is still keeping around for this slot).
- Recap: step 9. Prove it: step 10 (what PG16 and PG17 each add on top of a single slot on a
  single server, and what each needs configured to work).

## Steps (storyboard)

### 1. Hook
- **fig:** the same `UPDATE orders SET status = 'shipped'` statement, run three times with three
  different `REPLICA IDENTITY` settings in effect, decoded each time; the change card's `before`
  row fills in completely, shrinks to the primary key alone, or stays empty.
- **On screen:** one change card, its `before` row redrawn three times under three identity
  labels.

### 2. Predict
- **fig:** the same slot, read twice by `pg_logical_slot_peek_changes` without ever confirming
  the first read. Does the second read show the same change again, or does the slot remember
  what it already handed over?
- **Options:** (a) the slot remembers, so the second read comes back empty [wrong — a slot's own
  position only moves forward when a read explicitly confirms it; peeking never confirms]; (b)
  the second read returns the identical change, because nothing has told the slot it was ever
  delivered [correct].

### 3. Reveal — decoding is WAL, turned into row changes
- **fig:** the WAL's own storage-level records on one side, the same instant decoded into a
  readable `INSERT`/`UPDATE`/`DELETE` on the other, in the order each transaction committed, not
  the order each one started.
- **Moves:** two transactions open out of order on the left; on the right, the decoded stream
  reorders them into the order they actually committed.

### 4. Reveal — the before-image, measured
- **fig:** the real run: one row's primary key changed three times, once under each `REPLICA
  IDENTITY` setting, decoded by `test_decoding` on this sandbox's own PostgreSQL.
- **takeaway:** "The before-image a decoded update carries is exactly what REPLICA IDENTITY allows — the key alone, every column, or nothing."

### 5. Reveal — a slot's position is a promise, not a guarantee
- **fig:** a slot's own position is written to disk only at a checkpoint; between checkpoints,
  the slot's idea of "what's been delivered" lives only in memory, so a crash can hand a
  consumer changes it already saw.
- **Narrator's line of thought:** she treats this as the reason "at least once" is the honest
  description of a slot, not a flaw to be designed around — the consumer, not the slot, has to
  be the one that's safe to repeat.

### 6. Reveal — repeats, measured
- **fig:** the real run: the identical unconfirmed slot peeked twice, byte for byte the same
  decoded output both times.
- **takeaway:** "A slot only forgets what it's delivered once a consumer confirms it — until then, the same change can be handed over again."

### 7. Reveal — two positions, two different jobs
- **fig:** `restart_lsn`, the oldest WAL the server still can't throw away for this slot, and
  `confirmed_flush_lsn`, the point the consumer has actually acknowledged; the gap between them
  is retained WAL with nowhere to go yet.
- **Narrator's line of thought:** she separates what each number protects — one protects the
  consumer's ability to replay from its last confirmed point, the other is simply how far that
  confirmation has reached.

### 8. Reveal — the two positions, measured
- **fig:** the real run: `restart_lsn` and `confirmed_flush_lsn` read from `pg_replication_slots`
  before and after a confirmed read of this sandbox's own slot.
- **takeaway:** "Confirming a read moves confirmed_flush_lsn forward; restart_lsn doesn't follow — the gap between them is what the server is still holding for this slot."

### 9. Recap
- **fig:** the change card's before-image set by `REPLICA IDENTITY`, the slot's own tolerance for
  repeats, and its two positions, side by side.

### 10. Prove it
- **fig:** a single slot on a single server is what's been shown. What does it take to keep a
  consumer running through a real failover?
- **predict options:** (a) nothing beyond the slot itself — a slot already survives a crash of
  its own server [wrong — a slot lives only on the server that created it; it does not exist on
  a standby unless something keeps it there]; (b) a standby has to be told to track the slot
  (PG16's standby decoding, needing `hot_standby_feedback`) or the primary has to synchronise it
  there in advance (PG17's `failover` property and `synchronized_standby_slots`), or a promotion
  leaves the new primary with no memory of where the consumer was [correct].

## Post-notes headings
- **Internals:** WAL turned into decoded row changes, two output plugins (`pgoutput`,
  decoderbufs), what a publication selects, the four `REPLICA IDENTITY` settings and the
  before-image each allows, `restart_lsn` against `confirmed_flush_lsn`, PG16 standby decoding
  and PG17 failover-synchronised slots — all named at the level this topic's own sources and
  measurements support; a real two-node promotion is sourced-only, and this sandbox's own
  PostgreSQL 16 server has neither the `failover` slot argument nor the `failover`/`synced`
  columns PG17 added, confirmed directly in `examples.py`.
- **Lab:** hosts the failover-slot leg of the 8.2 lab only as far as this one PG16 machine
  allows: `examples.py` confirms the server version and the absence of the PG17-only columns
  directly, rather than claiming a slot or a promotion this server cannot actually produce.
- **Production:** the hook's own three-way before-image comparison as the concrete decision a
  table owner makes before enabling CDC on it — a table without a primary key under `DEFAULT`
  needs `FULL` or a usable index, or a downstream consumer gets create events only.
- **Frontier:** PG17's failover-synchronised slots are recent enough (2024) that CHAPTER.md
  itself treats them as the newest addition in this topic's scope; everything else here
  (decoding, slots, `REPLICA IDENTITY`) is long-stable.
- **Where this goes next:** PostgreSQL gives a consumer a slot that remembers its place for it.
  MySQL does it differently — the consumer keeps its own position in a file-based log. The next
  topic is that log, and the contrasting designs of Oracle and SQL Server.

## Concept ledger
- **Introduces:** `logical-decoding-slot`, `replica-identity-before-image`, `failover-slot-sync`.
- **Uses:** `wal-lsn-fsync`, `checkpoint-recovery-redo-undo` (Chapter 5 topics 3-4),
  `physical-vs-logical-replication` (Chapter 5 topic 18), `query-vs-log-cdc` (topic 9) — all
  confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 9.

## Changes from the chapter plan
None in scope. One environment constraint: this sandbox runs PostgreSQL 16, which has neither
the PG17 `failover` slot argument nor the `failover`/`synced` columns on `pg_replication_slots`.
The failover-slot leg of the lab is therefore sourced from the PG17 release notes and Debezium's
own `slot.failover` documentation rather than measured against a real failover slot, exactly as
`CHAPTER.md`'s own "Leaves out" line allows ("a real two-node promotion is sourced-only and
disclosed").

## Claims list (for fact-check)
1. "Logical decoding is the process of extracting all persistent changes to a database's tables
   into a coherent, easy to understand format." — SOURCES.md (PostgreSQL docs).
2. "Slots persist independently of the connection using them and are crash-safe... the slot
   might return to an earlier LSN, which will then cause recent changes to be sent again when
   the server restarts." — SOURCES.md (PostgreSQL docs); modelled directly in `examples.py` by
   two identical unconfirmed peeks.
3. `restart_lsn` and `confirmed_flush_lsn` definitions — SOURCES.md (PostgreSQL docs); both read
   live, before and after a confirmed read, in `examples.py`.
4. The four `REPLICA IDENTITY` settings and what each logs — SOURCES.md (PostgreSQL docs);
   measured directly in `examples.py` under `DEFAULT`, `FULL` and `NOTHING`.
5. `decoderbufs` and `pgoutput` as PostgreSQL's two output plugins — SOURCES.md (Debezium docs).
6. PG16 added standby decoding; PG17 added failover-synchronised slots and `pg_upgrade`
   preservation of logical slots — SOURCES.md (PostgreSQL 16 and 17 release notes); this
   sandbox's own PG16 server confirmed to lack the PG17-only slot properties, in `examples.py`.
7. Decoding emits changes in commit order, not transaction-start order — measured directly in
   `examples.py` with two transactions committed in the reverse of the order they started.
