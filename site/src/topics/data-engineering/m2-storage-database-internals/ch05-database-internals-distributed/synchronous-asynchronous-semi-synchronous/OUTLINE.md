# Outline — de.synchronous-asynchronous-semi-synchronous

**Kind:** refresher, §5.3. About 5 minutes.

## Scope (full syllabus line, three clauses)

"primary/replica topologies, what each acknowledgement mode risks on failover (lost commits vs
stalled writes), and failover/promotion basics."

- Clause 1: "primary/replica topologies" — the basic shape every later topic in this section
  assumes: one primary accepting writes, one or more replicas receiving them.
- Clause 2: "what each acknowledgement mode risks on failover (lost commits vs stalled writes)" —
  asynchronous (fire and forget, risks a lost commit on a primary crash), synchronous (waits for
  confirmation, risks a stalled write), and semi-synchronous (one replica's own acknowledgement,
  with a timeout fallback to asynchronous) — contrasted directly, with the synchronous wait's own
  real cost measured against this sandbox's own Postgres cluster.
- Clause 3: "failover/promotion basics" — named from the documentation directly: what failover is,
  and the real command (`pg_ctl promote`) that triggers it.

## Outcomes

Describe a primary/replica topology; contrast asynchronous, synchronous and semi-synchronous
acknowledgement and state precisely what each risks on failover — a lost commit vs. a stalled
write; describe failover and promotion at a basic level.

## Concept ledger

- **Introduces:** `replication-ack-modes`.
- **Uses:** `wal-lsn-fsync` (topic 3).
- **Declared:** none beyond §5.2.

## Storyboard (8 steps)

1. **Hook.** A primary just told a client its write committed. Is that write anywhere else yet —
   and does the answer even matter, until something fails?
2. **Reveal: asynchronous.** Fire and forget. The primary commits, tells the client, and ships the
   change to the replica whenever it gets to it — no wait at all.
3. **Predict** (within the first four steps): if synchronous replication removes asynchronous's own
   risk of losing an already-acknowledged commit, what does it cost instead?
4. **Reveal: synchronous, measured.** The commit waits for confirmation before it returns. This
   sandbox has no second host, so the same wait is measured locally — `synchronous_commit`, the
   identical acknowledgement mechanism, against this sandbox's own write-ahead log.
5. **Reveal: what synchronous risks.** Every commit pays that wait, and the transaction's own locks
   are held for the whole of it. Takeaway.
6. **Reveal: semi-synchronous.** The middle ground: wait for just one replica's own acknowledgement,
   with a timeout that falls back to asynchronous if it goes quiet. Takeaway.
7. **Reveal: failover and promotion, basics.** When the primary is gone, a replica is promoted to
   take its place — the real command, named directly from the documentation. Takeaway.
8. **Recap.** Three modes, three honest trade-offs: lose a commit, stall a write, or bet on one
   replica with a timeout underneath it.

Engagement arc: hook (step 1, a concrete unresolved question, no mechanism named yet); one predict
(step 3, within the first four steps); the mechanism built up through contrast (steps 2, 4, 5, 6,
7); a real measured number (step 4, the local `synchronous_commit` wait, a genuine stand-in for the
same acknowledgement wait a real synchronous replica would add); three takeaways (steps 5, 6, 7, all
at or after the reel's own midpoint of step 4, per the step-dot/takeaway placement guard); recap
(step 8). No "Prove it" step — a refresher, following topic 10's own established shape.

## Examples to execute

`examples.py`, one real measured experiment against this sandbox's own Postgres cluster:

1. `synchronous_commit_costs_latency`: 200 real commits run each way, under `synchronous_commit =
   off` and `synchronous_commit = on`. Waiting for confirmation (`on`) costs at least 20% more real
   commit latency than not waiting (`off`) — confirmed stable across 5 repeated runs (real observed
   margin roughly 40-150% slower).

The multi-host failure/lost-commit and failover/promotion claims are sourced directly from the
PostgreSQL and MariaDB documentation rather than reproduced live, since this sandbox has no second
host to run a real primary/replica pair on (see `FACT-CHECK.md`'s Problem Solving section, and the
chapter's own engine-of-record note on claims needing a second machine).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 16's handoff verbatim): "A single engine's own
  transactions are done. This refresher opens the vocabulary every later topic in this section
  assumes: a primary and its replicas, and exactly what each acknowledgement mode risks the moment
  the primary fails."
- **Handoff** (to topic 18, verbatim): "This refresher treated replication as one undifferentiated
  thing. The next topic is the two genuinely different mechanisms hiding behind that word: shipping
  WAL bytes versus shipping decoded row changes."

## Claims list

1. PostgreSQL streaming replication is asynchronous by default; if the primary crashes, some
   committed transactions may not have been replicated, causing data loss. — PostgreSQL
   documentation.
2. Synchronous replication confirms that all changes made by a transaction have been transferred to
   one or more synchronous standby servers. — PostgreSQL documentation.
3. Requesting synchronous replication makes each commit wait until confirmation that it's been
   written to the WAL on disk of both the primary and standby. — PostgreSQL documentation.
4. Waiting for synchronous confirmation doesn't use system resources, but the transaction's own
   locks continue to be held until the transfer is confirmed. — PostgreSQL documentation.
5. If the primary server fails, the standby should begin failover procedures. — PostgreSQL
   documentation.
6. Triggering failover of a log-shipping standby runs `pg_ctl promote` or calls `pg_promote()`. —
   PostgreSQL documentation.
7. With regular asynchronous replication, the primary does not wait for a replica to confirm an
   event was received. — MariaDB documentation.
8. Semisynchronous replication waits for just one replica to acknowledge it has received and
   logged the events. — MariaDB documentation.
9. With the AFTER_SYNC wait point, failover should be lossless, since every committed transaction
   on the primary would already have been replicated. — MariaDB documentation.
10. With the AFTER_COMMIT wait point, failover may involve data loss, since the primary may have
    committed transactions the replica never acknowledged. — MariaDB documentation.
11. If a semisynchronous replica doesn't acknowledge in time, a timeout occurs and the primary
    switches to asynchronous replication. — MariaDB documentation.
12. The `examples.py` measured experiment, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

One substitution: the chapter plan named "MySQL's own semi-synchronous replication documentation."
`dev.mysql.com` returned HTTP 403 to this project's own fetch pipeline (and to a direct `curl` with
a browser user agent) on every version tried. Substituted MariaDB's own semisynchronous replication
documentation — MariaDB is MySQL's own direct fork, implementing the identical
`rpl_semi_sync_master`/`rpl_semi_sync_slave` mechanism under the same name, so the substitution
teaches the same real mechanism the chapter plan asked for (see `FACT-CHECK.md`'s Problem Solving
section).
