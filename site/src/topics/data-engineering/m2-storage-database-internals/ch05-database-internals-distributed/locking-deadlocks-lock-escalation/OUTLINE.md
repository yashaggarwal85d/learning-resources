# Outline — de.locking-deadlocks-lock-escalation

**Kind:** full, §5.2. About 15 minutes.

## Scope (full syllabus line, four clauses)

"Lock modes and intention locks, row vs page vs table granularity, deadlock detection (wait-for
graphs) vs prevention (timeouts, wait-die/wound-wait), lock escalation in SQL Server/Db2, and
long DDL locks as a migration hazard."

- Clause 1: "lock modes and intention locks, row vs page vs table granularity" — real lock modes (Postgres), real intent locks (SQL Server), and the granularity trade-off.
- Clause 2: "deadlock detection (wait-for graphs) vs prevention (timeouts, wait-die/wound-wait)" — a real reproduced deadlock, caught by detection; prevention named and contrasted.
- Clause 3: "lock escalation in SQL Server/Db2" — both vendors' own real mechanisms and thresholds, sourced-only (neither engine runs in this sandbox).
- Clause 4: "and long DDL locks as a migration hazard" — a real ACCESS EXCLUSIVE lock, measured blocking a concurrent read.

## Outcomes

Name real lock modes and intention locks and explain row/page/table granularity's own trade-off.
Contrast deadlock detection (a wait-for graph) against deadlock prevention (timeouts,
wait-die/wound-wait). Explain lock escalation as SQL Server/Db2 implement it. Explain why a
long-running DDL statement's lock is a real migration hazard, reproduced as a real blocked
session against this sandbox's own Postgres cluster.

## Concept ledger

- **Introduces:** `locking-deadlock-detection`.
- **Uses:** `serializability-2pl-ssi` (topic 13).
- **Declared:** none beyond topic 13.

## Storyboard (11 steps)

1. **Hook.** Two sessions, two tables, two locks already held. Each one now wants the other's
   table. Neither can proceed, and neither errors — yet.
2. **Reveal: real lock modes.** Postgres's own table-level modes, from a lock that only blocks a
   conflicting write up through one that blocks everything, even a plain read.
3. **Reveal: intention locks.** Before a database locks one row, it marks its own intent at the
   table level first — so checking one table-level flag replaces scanning every row lock in it.
4. **Predict** (within the first four steps): row-level locks protect the most data at the
   finest granularity. Is finer always better?
5. **Reveal: the deadlock, for real.** The hook's own two sessions, reproduced against this
   sandbox's cluster: a genuine cyclic wait, caught by Postgres's own deadlock monitor and ended
   with a real error. Takeaway.
6. **Reveal: detection vs prevention.** Postgres waits, then checks for a cycle — detection.
   Wait-die and wound-wait decide from a transaction's own priority, before any cycle forms —
   prevention. Two different philosophies, the same goal.
7. **Reveal: the exact same contention, ordered.** Same two locks, same two sessions — this time
   acquired in the same order. Zero deadlocks, measured across repeated rounds. Takeaway.
8. **Reveal: lock escalation.** SQL Server and Db2 both convert thousands of fine-grained locks
   into one coarse one, named with the real vendor thresholds that trigger it.
9. **Reveal: the migration hazard, measured.** The exact lock level most `ALTER TABLE` statements
   acquire, held for a fraction of a second, blocking a plain read that whole time. Takeaway.
10. **Recap.** Real lock modes, a real deadlock caught and a real one avoided, two philosophies
    for catching a cycle, and one lock level that can stall an entire table's own reads.
11. **Prove it.** A migration runs `ALTER TABLE ADD COLUMN ... DEFAULT (expensive)` on a busy
    production table. What's actually at risk, and for how long?

Engagement arc: hook (step 1, a concrete unresolved contradiction, no mechanism named yet); one
predict (step 4, within the first four steps); the mechanism built up through contrast (steps 2,
3, 5, 6, 7, 8, 9); a surprising number (step 9, a real lock measured blocking ordinary reads for a
fraction of a second — the production-relevant surprise); three takeaways (steps 5, 7, 9, all at
or after the reel's own midpoint of step 6, per the step-dot/takeaway placement guard); recap
(step 10); Prove it (step 11).

## Examples to execute

`examples.py`, three real experiments against this sandbox's real Postgres cluster, each forced
into its exact interleaving with `threading.Barrier`/`threading.Event` and asserted:

1. `deadlock_detected_and_aborted`: T1 locks row 1 then wants row 2; T2 locks row 2 then wants
   row 1 — a real cyclic wait. Exactly one transaction gets a genuine `DeadlockDetected` error,
   caught at roughly one second, matching `deadlock_timeout`'s own default.
2. `consistent_lock_order_avoids_deadlock`: the exact same contention, both sessions acquiring
   row 1 before row 2. Zero deadlocks across five repeated rounds.
3. `access_exclusive_blocks_even_reads`: a real `ACCESS EXCLUSIVE` lock (the level most
   migration-shaped DDL acquires), held for roughly three tenths of a second, measurably blocks a
   concurrent plain `SELECT` for about the same duration.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 13's handoff verbatim): "SSI aborts on a dangerous
  structure instead of blocking; strict 2PL blocks instead of aborting. This topic opens the
  blocking mechanism itself — real lock modes and granularity, and what happens when two
  sessions' locks form a cycle: a deadlock."
- **Handoff** (to topic 15, verbatim): "Locking is pessimistic by nature: it blocks before it
  knows there's really a conflict. The next topic is the practical choice between that and the
  optimistic alternative topics 12–13 already showed working."

## Claims list

1. Postgres's own table lock modes, all genuinely table-level, differing only in conflict set. — PostgreSQL documentation.
2. ACCESS EXCLUSIVE's own conflict set and the DDL commands that acquire it; only it blocks a plain SELECT. — PostgreSQL documentation.
3. Postgres's own deadlock example and its documented best defense (consistent lock order). — PostgreSQL documentation.
4. `deadlock_timeout`'s own role: gates when the (expensive) cycle check runs, a detection mechanism. — PostgreSQL documentation.
5. SQL Server's own intent locks (IS/IX/SIX) and why they exist. — Microsoft Learn.
6. SQL Server's own lock-escalation mechanism and real thresholds (5,000 / 1,250 locks). — Microsoft Learn.
7. SQL Server's own deadlock monitor: a cyclic-dependency search, functionally a wait-for graph, with an adaptive interval (5s → 100ms). — Microsoft Learn.
8. Db2's own `maxlocks` parameter and escalation trigger. — Db2 documentation.
9. Wait-die and wound-wait's own precise priority-based abort rules. — Wikipedia.
10–12. The three `examples.py` reproductions, each confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

Db2's own `maxlocks` documentation page returned an HTTP 403 to this sandbox's direct fetch
tooling (a bot-protection response, confirmed on a second IBM Docs URL as well); its quotes are
the real text of that live page, retrieved through this session's own browsing tool rather than
substituted with a different source — documented in full in `SOURCES.md`'s own header note and
`FACT-CHECK.md`'s Problem Solving section, matching the precedent already set for a MySQL
documentation page in topic 12. A fourth source beyond the chapter plan's own two named vendors
(Wikipedia's "Deadlock prevention algorithms") was added because wait-die and wound-wait,
explicitly named in the syllabus scope, appear in neither the Postgres nor the SQL Server/Db2
sources named in the chapter plan.
