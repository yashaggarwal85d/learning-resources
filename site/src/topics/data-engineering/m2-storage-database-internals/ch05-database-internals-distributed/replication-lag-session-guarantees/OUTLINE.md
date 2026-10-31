# Outline — de.replication-lag-session-guarantees

**Kind:** full, §5.3. About 15 minutes. Hosts the §5.3 chapter lab's directly runnable portion.

## Scope (full syllabus line, three clauses)

"read-your-writes, monotonic reads and consistent-prefix reads; implementing them with LSN/GTID
tokens, sticky routing or primary fallback; what lag does to dashboards and downstream pipelines
(formal consistency models live in Ch.14)."

- Clause 1: "read-your-writes, monotonic reads and consistent-prefix reads" — all three session
  guarantees defined precisely (Jepsen's restatements of Terry et al.'s own terms) and demonstrated
  against this sandbox's own real primary/standby Postgres pair: read-your-writes broken and fixed,
  monotonic reads and consistent-prefix reads shown holding (the violations each needs require a
  second, independently-lagging replica this single-standby sandbox doesn't have — disclosed
  honestly, per the chapter's own gap pattern, rather than faked).
- Clause 2: "implementing them with LSN/GTID tokens, sticky routing or primary fallback" — the
  LSN-token fix built and measured directly (`pg_current_wal_lsn()` captured at commit,
  `pg_last_wal_replay_lsn()` polled on the standby); sticky routing and primary fallback named as
  the two real alternatives, each with its own trade-off, sourced rather than built since they are
  deployment choices, not a mechanism this topic's single-pair cluster can distinguish from the
  LSN-token fix experimentally.
- Clause 3: "what lag does to dashboards and downstream pipelines (formal consistency models live
  in Ch.14)" — the real `write_lag`/`flush_lag`/`replay_lag` numbers measured under load and what a
  dashboard or pipeline reading from a lagging replica actually sees; formal consistency models
  (linearizability, sequential consistency, etc.) are explicitly out of scope here and live in
  Chapter 14.

## Outcomes

Define read-your-writes, monotonic reads and consistent-prefix reads precisely; measure real
replication lag against this sandbox's own Postgres cluster and deliberately break read-your-writes
by reading from a lagging replica; fix it with a real LSN token and confirm the guarantee holds
again; explain what lag does to a dashboard or a downstream pipeline reading from a replica.

## Concept ledger

- **Introduces:** `session-consistency-guarantees`.
- **Uses:** `physical-vs-logical-replication` (topic 18) — confirmed via `registry.ts`, line 4541
  (`introduces: ['physical-vs-logical-replication', ...]`).
- **Declared:** none beyond topic 18, per `CHAPTER.md`.

## Storyboard (11 steps)

1. **Hook.** A client writes an order, then reads it right back — on the same database it just
   wrote to, that's never in question. What happens when the read lands on a different node?
2. **Predict** (within the first four steps): the standby has the write, but hasn't applied it yet.
   Does the client's very next read see its own order?
3. **Reveal: read-your-writes, defined.** The guarantee, stated precisely: a process's own write
   must be visible to that same process's own later read.
4. **Reveal: broken, measured.** A real paused standby, a real committed write, a real read: the
   row the client itself just wrote is missing. Read-your-writes, broken, as an actual query
   result. Takeaway.
5. **Reveal: the LSN token, built.** The primary's own commit position, captured as a token; the
   standby polled until it has replayed past that exact position — not a sleep guessed to be long
   enough.
6. **Reveal: fixed, measured.** The identical write, the identical read, now correct: the row is
   visible the moment the standby's replay position passes the token. Takeaway.
7. **Predict.** This single standby's reads never go backward in these experiments — what would it
   actually take to make one go backward?
8. **Reveal: the other two guarantees.** Monotonic reads (a session's reads never move backward)
   and consistent-prefix reads (an effect is never seen before its cause) — both measured holding on
   this single standby; a real *violation* of either needs a second, independently-lagging replica,
   named and sourced, not built here. Takeaway.
9. **Reveal: lag under load, measured.** 2,000 real writes, then Postgres's own
   `write_lag`/`flush_lag`/`replay_lag` — the real interval the server itself computed, not a guess.
   Takeaway.
10. **Recap.** Three guarantees, one real fix: a token that names the exact position a read must
    wait for.
11. **Prove it.** A dashboard reads order counts from a replica that's 30 seconds behind during a
    flash sale. A customer who just placed an order calls support asking where it is. What does the
    LSN-token fix cost if applied to every dashboard read, and where would sticky routing be the
    better trade instead?

Engagement arc: hook (step 1); predict (step 2, within the first four steps, satisfying the
minimum-2-predict rule's first requirement); mechanism built through break-then-fix (steps 3-6); a
second, independent `predict` block (step 7, satisfying the chapter-14-discovered minimum-2-predict
rule) asking the reader to guess what a monotonic-reads violation actually requires before step 8's
reveal answers it; three takeaways (steps 4, 6, 8/9, at or after the reel's own midpoint of step 6);
recap (step 10); Prove it (step 11).

## Examples to execute

`examples.py`, five real experiments against this sandbox's own primary (5432) and standby (5434)
Postgres pair:

1. `read_your_writes_breaks_on_a_paused_replica`: pause standby replay, write+commit on primary,
   read the paused standby, assert the row is invisible.
2. `lsn_token_fixes_read_your_writes`: repeat the write while paused, capture
   `pg_current_wal_lsn()` as a token, resume replay, poll `pg_last_wal_replay_lsn() >= token` with a
   10s deadline, then read and assert the row is visible.
3. `measure_real_replication_lag_under_write_load`: 2,000 writes, then
   `write_lag`/`flush_lag`/`replay_lag` from `pg_stat_replication`.
4. `single_replica_session_cannot_violate_monotonic_reads`: two reads on the same standby
   connection, pausing replay between them; assert the second read's count never drops below the
   first's.
5. `consistent_prefix_reads_hold_through_a_single_replicas_replay`: two causally dependent writes
   (`placed` then `shipped`) while paused, resume, and poll 20 times while replay catches up;
   assert `shipped` is never visible without `placed` also being visible.

All five verified via `python3 examples.py` against the real two-node cluster this topic's own
setup built (primary on 5432, standby on 5434, after working around a port-5433 convention
collision with an earlier topic's PostgreSQL 18 cluster — see `FACT-CHECK.md`).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 18's handoff verbatim): "A replica that's falling
  behind isn't just a retention risk — it's a real, measurable lag with real consequences for
  anything reading from it. This topic measures that lag directly, breaks read-your-writes with it,
  and fixes the break with a real LSN token."
- **Handoff** (to topic 20, verbatim): "Lag is what a network partition costs you in the normal
  case. The next topic names precisely what it costs you in the worst case: CAP and PACELC."

## Claims list

1. Read your writes requires that if a process performs a write, and that same process performs a
   subsequent read, the read must observe the write's effects. — Jepsen.
2. Read your writes does not apply to operations performed by different processes. — Jepsen.
3. Monotonic reads ensures that if a process performs read r1, then r2, r2 cannot observe a state
   prior to the writes reflected in r1 — reads cannot go backwards. — Jepsen.
4. Monotonic reads does not apply to operations performed by different processes, only reads by the
   same process. — Jepsen.
5. The primary and standby operate loosely coupled: the primary archives continuously while the
   standby recovers continuously, reading WAL from the primary. — PostgreSQL documentation.
6. A standby configuration with fast recovery is called warm standby; used for read-only queries, it
   is called hot standby. — PostgreSQL documentation.
7. A server enters standby mode if a `standby.signal` file exists in the data directory at startup.
   — PostgreSQL documentation.
8. A large difference between `pg_last_wal_replay_lsn` and `pg_stat_wal_receiver`'s `flushed_lsn`
   indicates WAL is being received faster than it can be replayed. — PostgreSQL documentation.
9. `pg_stat_replication` holds one row per WAL sender process, with statistics about replication to
   that sender's connected standby. — PostgreSQL documentation.
10. The lag times in `pg_stat_replication` measure the time taken for recent WAL to be written,
    flushed and replayed, and for the sender to know about it. — PostgreSQL documentation.
11. Reported lag times are not predictions of catch-up time; a fully caught-up standby shows the
    time to write/flush/replay the most recent WAL location, not zero. — PostgreSQL documentation.
12. The `examples.py` measured experiments, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

None. The chapter's own fallback for true multi-node leader-kill failover timing (disclosed as
sourced-only, since this sandbox can't run a genuine second host for that specific lab item) applies
unchanged; this topic's own visual idea and lab scope (lag measurement, read-your-writes
break-and-fix) were built exactly as specified, on a real standby built for this topic.
