# Outline — de.serializability-strict-2pl-versus

**Kind:** full, §5.2. About 15 minutes. Hosts the rest of the §5.2 chapter lab.

## Scope (full syllabus line, three clauses)

"Two routes to the same guarantee: two-phase locking with predicate/next-key locks (block on
conflict) vs Serializable Snapshot Isolation (track rw-antidependencies, abort on a dangerous
structure; Cahill 2008, Ports & Grittner 2012 for Postgres); throughput, false-positive aborts,
and why retries become mandatory application logic."

- Clause 1: "two routes to the same guarantee: two-phase locking... vs Serializable Snapshot Isolation..." — both mechanisms, contrasted directly.
- Clause 2: "throughput, false-positive aborts" — S2PL's own blocking cost vs. SSI's own false-positive cost, both named from the source.
- Clause 3: "and why retries become mandatory application logic" — a real retry loop, executed, succeeding.

## Outcomes

Contrast strict 2PL (predicate/next-key locks, blocking on conflict) with Serializable Snapshot
Isolation (tracking rw-antidependencies, aborting on a dangerous structure). Explain Cahill's SSI
algorithm and Ports & Grittner's Postgres implementation at a level that would satisfy an expert.
Rerun topic 12's write-skew scenario under Postgres `SERIALIZABLE` and observe the real
serialization failure it now produces. Measure real abort rate as contention rises and explain
why retries become mandatory application logic under SSI.

## Concept ledger

- **Introduces:** `serializability-2pl-ssi`.
- **Uses:** `snapshot-isolation` (topic 12), `isolation-anomalies` (topic 11).
- **Declared:** none beyond topic 12.

## Storyboard (11 steps)

1. **Hook.** The exact same two doctors, the exact same rule, the exact same disjoint writes
   that broke cleanly last topic — rerun under a stricter setting. This time, one of the two
   transactions doesn't survive.
2. **Reveal: strict two-phase locking.** Lock everything you touch, hold every lock until
   commit, block anyone else who wants in. Deadlocks get rolled back; everyone else stays correct
   by never overlapping at all.
3. **Reveal: SSI's own mechanism.** Run snapshot isolation exactly as before — nothing blocks —
   but watch the read-write conflicts between transactions for one specific pattern.
4. **Predict** (within the first four steps): both routes guarantee the exact same thing. Do
   they cost the same thing to get there?
5. **Reveal: the dangerous structure.** Two concurrent transactions each reading what the other
   is about to write, chained together — a pivot transaction in the middle of two rw-conflicts.
   Find that shape, and you've found exactly where write skew comes from.
6. **Reveal: SERIALIZABLE catches the doctors.** The exact rerun: one doctor's own commit
   succeeds, the other gets a real serialization failure — the same anomaly snapshot isolation
   let straight through, now caught. Takeaway.
7. **Reveal: a real retry, succeeding.** The caught doctor retries from scratch, on a fresh
   snapshot, and sees the truth: the other doctor already left. This time the check comes out
   differently, and the invariant holds.
8. **Reveal: throughput and false positives, the real cost on each side.** S2PL blocks and can
   deadlock under contention; SSI never blocks but sometimes aborts a transaction that would
   actually have been fine. Takeaway.
9. **Reveal: abort rate, measured as contention rises.** The same shape of contention, scaled
   from two transactions to six, all sharing one invariant: a real, measured jump in how often
   SSI has to abort something to stay correct. Takeaway.
10. **Recap.** Two routes, one guarantee, two different bills — one paid in blocking, one paid in
    retries.
11. **Prove it.** A workload with heavy write-write contention on a handful of hot rows. Which
    route would you reach for, and why?

Engagement arc: hook (step 1, the direct rerun of topic 12's own unresolved contradiction, now
different); one predict (step 4, within the first four steps — kept to one this topic, since the
"Prove it" closer already does double duty as the second judgment call); the mechanism built up
through contrast (steps 2, 3, 5, 6, 7, 8); a surprising number (step 9, contention rising from
fifty percent aborted to about eighty-three percent aborted, measured for real); three takeaways
(steps 6, 8, 9, all at or after the reel's own midpoint of step 6, per the step-dot/takeaway
placement guard); recap (step 10); Prove it (step 11).

## Examples to execute

`examples.py`, three real experiments against this sandbox's real Postgres cluster under
`SERIALIZABLE`, each forced into its exact interleaving with `threading.Barrier` and asserted:

1. `serializable_catches_write_skew_doctors`: topic 12's own doctors scenario, rerun unchanged
   under `SERIALIZABLE`. Exactly one commit, one real `SerializationFailure`.
2. `retry_until_success`: the caught doctor retries once, sees the real post-commit state, and
   correctly stays on call. Final on-call count: 1, the invariant held.
3. `abort_rate_rises_with_contention`: the same contention shape scaled from two concurrent
   transactions to six, all forced onto the same starting snapshot. Measured abort rate: one of
   two (fifty percent) at low contention, five of six (about eighty-three percent) at high
   contention — stable across seven repeated runs.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 12's handoff verbatim): "Write skew survives
  snapshot isolation. This topic is the two real routes that close that gap — strict 2PL's
  blocking locks, and Serializable Snapshot Isolation, the same snapshot mechanism from topic 12
  made genuinely serializable."
- **Handoff** (to topic 14, verbatim): "SSI aborts on a dangerous structure instead of blocking;
  strict 2PL blocks instead of aborting. Both routes still rest on one underlying mechanism
  neither topic has opened yet: locking itself, and what happens when it deadlocks."

## Claims list

1. Strict two-phase locking's own mechanism (lock and hold until commit, block on conflict, deadlock → rollback). — `README-SSI`.
2. S2PL's own throughput cost under contention. — `README-SSI`.
3. SSI's own mechanism (run SI, monitor rw-conflicts, roll back on a dangerous structure, some false positives, never a missed anomaly). — `README-SSI`.
4. The dangerous structure itself (Tin → Tpivot → Tout, two adjacent rw-conflicts), attributed to Cahill et al. — `README-SSI`.
5. Postgres's own `SERIALIZABLE` has implemented SSI since 9.1, built on Cahill et al.'s algorithm. — `README-SSI`.
6. SQLSTATE 40001 and Postgres's own retry-friendly victim-selection design. — `README-SSI`.
7. Applications must be prepared to retry under `SERIALIZABLE`; the retry mechanics themselves. — PostgreSQL documentation.
8. Only updating transactions can ever need a retry; read-only transactions never conflict. — PostgreSQL documentation.
9. Predicate locking never blocks and never causes a deadlock — the structural reason SSI avoids S2PL's own cost. — PostgreSQL documentation.
10–12. The three `examples.py` reproductions, each confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

Sources substituted per the skill's own rule: Cahill, Röhm & Fekete's own 2008 paper is
unreachable (a login wall on one mirror, the same genuine TLS failure already documented in
topic 12 on a second), replaced by PostgreSQL's own `README-SSI`, the project's own design
document for its SSI implementation, which states Cahill et al.'s algorithm directly and by name.
Because `README-SSI` *is* Ports & Grittner's own Postgres implementation, maintained in the same
source tree as the code it documents, it also directly serves the chapter plan's second named
source without a separate substitution.
