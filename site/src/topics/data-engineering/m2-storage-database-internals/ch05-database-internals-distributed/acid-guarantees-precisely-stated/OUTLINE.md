# Outline — de.acid-guarantees-precisely-stated

**Kind:** refresher, §5.2. About 5 minutes.

## Scope (full syllabus line, both clauses)

"What atomicity, consistency, isolation and durability each actually promise, and which layer
(engine vs application) owns 'consistency'."

- Clause 1: "what atomicity, consistency, isolation and durability each actually promise" — each
  of the four letters, stated precisely and distinctly from each other.
- Clause 2: "which layer (engine vs application) owns 'consistency'" — the one letter the engine
  alone can't guarantee, and why.

## Outcomes

State what each of atomicity, consistency, isolation and durability actually promises, distinctly
from each other. Say precisely which layer (the engine or the application) owns "consistency" and
why that's the one letter of ACID the engine alone can't guarantee.

## Concept ledger

- **Introduces:** `acid-guarantees`.
- **Uses:** `wal-lsn-fsync` (durability's own mechanism, built in §5.1's write-ahead-logging
  topic), `mvcc-versioning` (isolation's own mechanism, built in §5.1's MVCC topic).
- **Declared:** none beyond §5.1.

## Storyboard (8 steps)

1. **Hook.** A transfer crashes mid-transaction: $10 left account A, never reached account B.
   Which of the four letters was actually supposed to prevent that, and what do the other three
   even promise?
2. **Reveal: Atomicity.** All-or-nothing, stated precisely; the real bank-transfer example from
   the source, reproduced in `examples.py` (a CHECK-constrained row, a transaction that fails
   partway, the row unchanged after rollback: (40, 60)).
3. **Predict** (within the first four steps, the refresher's one required predict): which layer
   owns "Consistency" — the engine, because it's the one that actually checks the rules, or the
   application, because the engine only knows the rules it was told about?
4. **Reveal: Consistency, the split answer.** The engine enforces only its own declared
   constraints (measured: a declared CHECK blocks a bad update outright); an undeclared business
   rule (measured: `reserved` exceeds `on_hand`, 53 > 10) is invisible to the engine and commits
   without complaint. The application owns that part, not the engine.
5. **Reveal: Isolation.** Concurrent transactions behave as if run one at a time; measured
   directly as a real difference between two isolation levels (Read Committed: 100 then 110;
   Repeatable Read: 100 then 100, same interleaving). Ties back to MVCC from §5.1. Takeaway.
6. **Reveal: Durability.** Once committed, a transaction stays committed; measured as a proxy (the
   WAL position advances on commit, a fresh connection reads the committed value), with the real
   crash-survival mechanism already taught in §5.1's own WAL topic. Takeaway.
7. **Reveal: the ten-year gap.** IBM's IMS already had these guarantees in 1973; the acronym
   itself wasn't coined until 1983 — ten years of production use before the vocabulary existed.
   Takeaway.
8. **Recap.** The four letters, the one split between two layers, the two mechanisms (MVCC,
   WAL) already built in §5.1 that make isolation and durability real.

Engagement arc: hook (step 1, concrete crash scenario, no definition); one predict (step 3, within
the first four steps); the mechanism built up one letter at a time (steps 2, 4, 5, 6); a surprising
number (step 7, the 1973-to-1983 gap); three takeaways (steps 5, 6, 7, all at or after the reel's
own midpoint of 4, per the step-dot/takeaway placement guard learned in §5.1's own two topics);
recap (step 8).

## Examples to execute

`examples.py`, four real experiments against this sandbox's real Postgres cluster, all asserted
and stable across repeated runs:

1. `atomicity_all_or_nothing`: the CHECK (a + b = 100) bank-transfer example from the ACID wiki
   itself, reproduced directly — a transaction that fails partway through leaves the row at its
   original (40, 60), not a half-applied (30, 60).
2. `consistency_engine_vs_application`: a declared CHECK (on_hand >= 0) blocks a bad update; an
   undeclared rule (reserved must never exceed on_hand) is silently broken (53 > 10).
3. `isolation_snapshot_vs_repeatable`: the identical read-modify-reread interleaving under Read
   Committed (100 then 110) and Repeatable Read (100 then 100).
4. `durability_committed_is_logged_and_visible`: a commit advances the real WAL position, and a
   brand new connection reads the committed value — a measured proxy, not a crash test (scoped
   honestly in `FACT-CHECK.md` claim 13).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 9's handoff verbatim): "Every mechanism in §5.1
  lived inside one engine, on one machine. This refresher is the precise vocabulary the rest of
  this section needs before naming what happens when two transactions run at the same time: ACID,
  each letter stated exactly, and which one the engine can't own alone."
- **Handoff** (to topic 11, verbatim): "Isolation is the one letter with the most room to be
  violated quietly. The next topic names exactly how, with the real anomalies ANSI's own
  definitions leave ambiguous."

## Claims list

1. Reuter and Härder coined ACID in 1983, building on Jim Gray's earlier atomicity/consistency/durability naming. — ACID (Wikipedia).
2. IBM's IMS already supported ACID transactions in 1973, a decade before the acronym. — ACID (Wikipedia).
3. Atomicity: all-or-nothing, in every situation including crashes. — ACID (Wikipedia).
4. Consistency (engine side): only valid-per-declared-rules state transitions. — ACID (Wikipedia).
5. Consistency (the split): the engine doesn't guarantee application-intended correctness, only that declared constraints aren't violated. — Consistency (database systems) (Wikipedia).
6. Isolation: concurrent transactions behave as if sequential. — ACID (Wikipedia).
7. Durability: a commit survives a crash, usually via non-volatile recording. — ACID (Wikipedia).
8. Serializable's own precise SQL-standard definition. — PostgreSQL Transaction Isolation docs.
9. MVCC as Postgres's own isolation mechanism (snapshots). — PostgreSQL Concurrency Control Introduction docs.
10–13. The four `examples.py` experiments, each confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

None. Sources substituted per the skill's own rule (the original 1983 paper is paywalled, no free
mirror reachable); documented above and in `FACT-CHECK.md` → Problem Solving.
