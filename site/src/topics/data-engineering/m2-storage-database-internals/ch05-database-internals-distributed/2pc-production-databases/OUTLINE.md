# Outline — de.2pc-production-databases

**Kind:** full, §5.2. About 15 minutes.

## Scope (full syllabus line, three clauses)

"prepare/commit as databases run it, coordinator failure leaving participants in doubt (theory in
Ch.14), XA in practice, and how distributed SQL systems hide 2PC behind consensus-replicated
participants (Spanner, Ch.14 and the M6 case study)."

- Clause 1: "prepare/commit as databases run it" — a real prepare phase and a real commit phase,
  built and measured directly against this sandbox's own Postgres cluster using `PREPARE
  TRANSACTION`/`COMMIT PREPARED`, plus the XA specification's own phase-by-phase mechanics named
  alongside it as the vendor-neutral standard those two commands implement.
- Clause 2: "coordinator failure leaving participants in doubt (theory in Ch.14)" — the in-doubt
  state named concretely from what a prepared transaction actually does (keeps holding its locks,
  stays unresolved) and measured directly here; the "(theory in Ch.14)" parenthetical is a
  cross-reference to Chapter 14's own formal model, not re-taught here.
- Clause 3: "XA in practice, and how distributed SQL systems hide 2PC behind consensus-replicated
  participants (Spanner, Ch.14 and the M6 case study)" — XA's own presumed-rollback rule and
  prepare guarantee, named from the specification itself; Spanner's own participant-leader/
  coordinator-leader roles, each backed by a Paxos group, named from the paper itself as the
  destination this topic points to, not re-built.

## Outcomes

Trace a real prepare/commit exchange as a database actually runs it, against this sandbox's own
Postgres cluster; explain exactly what a coordinator failure leaves participants in — an in-doubt
transaction that keeps its locks and resolves only when some other session tells it to — named but
not formally modeled here (Chapter 14's job); name XA as the real cross-vendor standard those
commands implement and what its own presumed-rollback rule guarantees; explain, at a naming level,
how a distributed SQL system hides this same exchange behind consensus-replicated participants.

## Concept ledger

- **Introduces:** `two-phase-commit`.
- **Uses:** `wal-lsn-fsync` (topic 3).
- **Declared:** none beyond topic 15.

## Storyboard (11 steps)

1. **Hook.** One order has to touch two engines at once — the inventory database and the payments
   database — and both must agree to commit, or neither should. Shaking hands over a network isn't
   simple.
2. **Reveal: Phase 1, prepare.** The coordinator asks every participant to prepare: can you
   guarantee you could commit this, if asked? Each one answers, having already stably recorded
   what it would need to follow through.
3. **Reveal: Phase 2, commit.** Only after every participant says yes does the coordinator record
   its own decision stably, then tell everyone to actually commit.
4. **Predict** (within the first four steps): the coordinator is the one giving every order here.
   What happens to the participants if the coordinator itself goes silent between the two phases?
5. **Reveal: prepared, for real.** This sandbox's own Postgres, `PREPARE TRANSACTION`, measured
   directly: the change is invisible to every other session until a separate session — never the
   one that prepared it — commits it.
6. **Reveal: still holding its locks, measured.** The same prepared transaction, still unresolved,
   makes a second, concurrent writer wait — measured directly, for exactly as long as it stays
   unresolved. Takeaway.
7. **Reveal: the in-doubt state, named.** This is exactly what a coordinator failure leaves behind:
   locks held, nothing resolved, for as long as nobody steps in. Postgres's own documentation warns
   against ever leaving it long. Takeaway.
8. **Reveal: XA in practice.** The vendor-neutral standard those two commands implement: any one
   negative reply vetoes the whole transaction (presumed rollback), and a participant's own
   affirmative prepare reply is a guarantee it can still follow through later, even after its own
   failure. Takeaway.
9. **Reveal: distributed SQL hides this behind consensus.** Spanner's own participant leader and
   coordinator leader are each backed by their own Paxos group — so the fragile single coordinator
   this topic just measured is itself made durable by consensus, not assumed away.
10. **Recap.** Prepare asks a guarantee; commit spends it. The in-doubt gap between them is real,
    measured, and exactly what every production 2PC implementation exists to shrink.
11. **Prove it.** A payment and an inventory decrement must commit together or not at all, across
    two separate databases. The coordinator process crashes one second after telling both to
    prepare, before either is told to commit. What state are both databases in right now, and what
    must happen before either one can move?

Engagement arc: hook (step 1, a concrete unresolved contradiction, no mechanism named yet); one
predict (step 4, within the first four steps); the mechanism built up through contrast (steps 2,
3, 5, 6, 8, 9); a real measured number (step 6, a concurrent writer's own measured wait, tied
directly to the prepared transaction's own unresolved state); three takeaways (steps 6, 7, 8, all
at or after the reel's own midpoint of step 6, per the step-dot/takeaway placement guard); recap
(step 10); Prove it (step 11).

## Examples to execute

`examples.py`, two real experiments against this sandbox's own Postgres cluster, using `PREPARE
TRANSACTION` — Postgres's own XA-style two-phase commit primitive:

1. `prepared_transaction_commits_from_a_separate_session`: prepares a real transaction, confirms
   from a second session that its change is invisible and the transaction is listed in
   `pg_prepared_xacts`, then commits it from a third session — never the one that prepared it —
   and confirms the change is now visible everywhere.
2. `prepared_transaction_holds_its_locks`: prepares a transaction that updated a row, then measures
   how long a concurrent writer actually blocks on that same row until the prepared transaction is
   resolved (rolled back) from a separate session — real measured wait, roughly the prepared
   transaction's own hold time.

The crash-durability claim itself ("even if a database crash occurs before the commit is
requested") is sourced directly from the PostgreSQL documentation rather than reproduced by
restarting this sandbox's own shared Postgres server (see FACT-CHECK.md's Problem Solving section).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 15's handoff verbatim): "Every mechanism in this
  section so far assumed one engine making one decision. This topic is what happens the moment a
  transaction has to span more than one: prepare, commit, and the real in-doubt state a coordinator
  failure leaves participants in."
- **Handoff** (to topic 17, verbatim): "A single engine's own transactions are done. The next
  section spreads that single engine across machines entirely — starting with the replication
  vocabulary every later topic in it assumes."

## Claims list

1. `PREPARE TRANSACTION` stores a transaction's state fully on disk, with a very high probability
   it can still be committed even if a database crash occurs before the commit is requested. —
   PostgreSQL documentation.
2. From the issuing session's own point of view, `PREPARE TRANSACTION` behaves like a `ROLLBACK`:
   no active current transaction remains, and the prepared transaction's own effects aren't
   visible. — PostgreSQL documentation.
3. `PREPARE TRANSACTION`'s purpose is letting an external transaction manager run atomic global
   transactions across multiple databases or other transactional resources. — PostgreSQL
   documentation.
4. `COMMIT PREPARED`/`ROLLBACK PREPARED` can be issued from any session, not only the one that
   executed the original transaction. — PostgreSQL documentation.
5. Leaving a transaction prepared for a long time is unwise: it interferes with `VACUUM`'s ability
   to reclaim storage, and in extreme cases can force a shutdown to prevent transaction ID
   wraparound. — PostgreSQL documentation.
6. A prepared transaction continues to hold whatever locks it held when prepared. — PostgreSQL
   documentation.
7. TMs and RMs use two-phase commit with presumed rollback. — the XA specification.
8. In Phase 1, the TM asks every RM to prepare, asking whether each RM can guarantee its own
   ability to commit. — the XA specification.
9. An RM that can commit records that fact stably before replying affirmatively; a negative reply
   reports failure for any reason. — the XA specification.
10. In Phase 2 the TM issues an actual commit or rollback request to every RM, having already
    stably recorded its own decision to commit and the list of every involved RM. — the XA
    specification.
11. Any single negative reply in Phase 1 vetoes the whole global transaction. — the XA
    specification.
12. An affirmative reply from `xa_prepare()` guarantees a later `xa_commit()`/`xa_rollback()`
    succeeds, even after the RM itself fails in between. — the XA specification.
13. Spanner's own transaction manager implements a participant leader, with the group's other
    replicas as participant slaves. — Corbett et al., Spanner (OSDI 2012).
14. One participant group is chosen as the coordinator; its own leader is the coordinator leader,
    its slaves the coordinator slaves, and every transaction manager's own state is stored in its
    underlying Paxos group. — Corbett et al., Spanner (OSDI 2012).
15. Running two-phase commit over Paxos mitigates the availability problems a single, unreplicated
    coordinator would otherwise have. — Corbett et al., Spanner (OSDI 2012).
16-17. The two `examples.py` measured experiments, each confirmed and executed (see
    `FACT-CHECK.md`).

## Changes from the chapter plan

None in scope. One procedural change: `examples.py`'s first draft included a third experiment that
killed and restarted this sandbox's own shared Postgres server to reproduce the crash-durability
claim live; the harness's own auto-mode permission classifier denied that call as a
shared-resource-modifying action. Rather than restart the shared service, the experiment was
redesigned to two real, measured experiments that don't touch the server process at all, and the
crash-durability claim is sourced directly from the PostgreSQL documentation instead of reproduced
live (see `FACT-CHECK.md`'s Problem Solving section).
