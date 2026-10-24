# Outline — de.optimistic-vs-pessimistic-concurrency

**Kind:** full, §5.2. About 15 minutes.

## Scope (full syllabus line, three clauses)

"SELECT … FOR UPDATE vs version-column compare-and-set vs validate-at-commit OCC; how conflict
rate decides the winner; the same pattern reappearing in object-store table commits (§6.3) and
distributed SQL (§5.3)."

- Clause 1: "SELECT … FOR UPDATE vs version-column compare-and-set vs validate-at-commit OCC" —
  three real implementations of the same underlying choice: pessimistic locking (topic 14's own
  mechanism, reused), a lightweight single-row optimistic compare-and-set (built and measured
  here), and validate-at-commit OCC at the whole-read-set level (topic 13's own SSI, named and
  cross-referenced, not re-measured).
- Clause 2: "how conflict rate decides the winner" — the same workload, measured twice against
  this sandbox's own Postgres cluster, at a low and a high conflict rate, showing an actual
  measured reversal.
- Clause 3: "the same pattern reappearing in object-store table commits (§6.3) and distributed
  SQL (§5.3)" — named as a destination, not built (both are future topics' own content).

## Outcomes

Contrast `SELECT … FOR UPDATE` (pessimistic locking), a version-column compare-and-set, and
validate-at-commit OCC as three real implementations of the same underlying choice; measure,
directly against this sandbox's own Postgres cluster at two different conflict rates, which
approach actually wins and why; name object-store table commits and distributed SQL's own commit
protocols as the same pattern reappearing elsewhere in this course.

## Concept ledger

- **Introduces:** `occ-vs-pcc`.
- **Uses:** `locking-deadlock-detection` (topic 14), `snapshot-isolation` (topic 12).
- **Declared:** none beyond topic 14.

## Storyboard (11 steps)

1. **Hook.** Two customers' own checkouts both touch the same inventory row at once. One of them
   has to lose — the question is how the database finds that out, and what it costs to ask.
2. **Reveal: pessimistic, for real.** `SELECT ... FOR UPDATE` — lock the row before anyone even
   knows there's really a conflict. Topic 14's own mechanism, reused.
3. **Reveal: optimistic, a version-column compare-and-set.** Read the row with no lock at all;
   write only if its version hasn't moved since. If it has, the whole read is thrown away and
   retried.
4. **Predict** (within the first four steps): almost nobody collides most of the time. Is paying
   for a lock still worth it when conflicts are rare?
5. **Reveal: low conflict, measured.** The exact same workload (400 rows, 8 workers, 300
   increments each), run both ways against this sandbox's own cluster. Optimistic wins.
6. **Reveal: high conflict, measured.** The same 8 workers, now hammering 2 rows. The result
   reverses: pessimistic wins decisively, and the optimistic run burns over five thousand wasted
   retries doing it. Takeaway.
7. **Reveal: why the crossover happens.** A blocked pessimistic wait is never wasted work — it
   just queues. Every optimistic retry is a full round trip, read and write both, thrown away;
   more collisions means more of them. Takeaway.
8. **Reveal: a third flavor, validate-at-commit OCC.** Not just one row's own version — a whole
   transaction's whole read set, checked together at commit. Topic 13's own SSI, named here as
   exactly this: optimistic concurrency control at the database's own engine level.
9. **Reveal: the same pattern elsewhere.** An object-store table format's own commit is a
   compare-and-swap on one pointer; a distributed SQL engine's own commit protocol runs the same
   bet at a whole-cluster scale. Takeaway.
10. **Recap.** Pessimistic blocks before it knows; optimistic bets that it won't need to — and
    which one wins is a question conflict rate answers, not instinct.
11. **Prove it.** A feature flag lets you pick `FOR UPDATE` or a version-column compare-and-set
    for a single "claim this seat" endpoint. Traffic is light most of the day, but spikes hard for
    ninety seconds at on-sale time. Which one do you reach for, and does the answer change during
    the spike?

Engagement arc: hook (step 1, a concrete unresolved contradiction, no mechanism named yet); one
predict (step 4, within the first four steps); the mechanism built up through contrast (steps 2,
3, 5, 6, 7, 8); a surprising measured number (step 6, the same workload reversing which approach
wins, with a five-thousand-plus-retry cost named); three takeaways (steps 6, 7, 9, all at or after
the reel's own midpoint of step 6, per the step-dot/takeaway placement guard); recap (step 10);
Prove it (step 11).

## Examples to execute

`examples.py`, two real measured comparisons against this sandbox's real Postgres cluster, the
same 8-worker/300-op-per-worker workload run under each strategy at each conflict rate:

1. `low_conflict_optimistic_wins`: 400 rows, 8 workers, 300 increments each. The version-column
   compare-and-set finishes at least 5% faster than `SELECT ... FOR UPDATE` against the identical
   workload — confirmed stable across 7 repeated runs (real measured margin 8-15%).
2. `high_conflict_pessimistic_wins`: the same workload against 2 rows instead of 400.
   `SELECT ... FOR UPDATE` finishes at least 50% faster, and the optimistic run hits over 5,000
   wasted retries — confirmed stable across 7 repeated runs (real measured margin 78-105% faster,
   5,301-5,743 retries).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 14's handoff verbatim): "Locking is pessimistic by
  nature: it blocks before it knows there's really a conflict. This topic is the practical choice
  between that and the optimistic alternative — real `FOR UPDATE`, a version-column
  compare-and-set, and validate-at-commit OCC, measured against each other at two real conflict
  rates."
- **Handoff** (to topic 16, verbatim): "Every mechanism in this section so far assumed one engine
  making one decision. The next topic is what happens the moment a transaction has to span more
  than one: two-phase commit."

## Claims list

1. `SELECT ... FOR UPDATE` locks the retrieved rows as though for update, blocking other
   transactions' writes or locks on them until the current transaction ends. — PostgreSQL
   documentation.
2. Within `REPEATABLE READ`/`SERIALIZABLE`, `FOR UPDATE` throws an error on a row that already
   changed, rather than silently locking a stale one. — PostgreSQL documentation.
3. `FOR UPDATE` can itself cause a disk write, since Postgres marks the locked rows to record it.
   — PostgreSQL documentation.
4. Postgres's own documentation names `FOR UPDATE`/`FOR SHARE`/`LOCK TABLE` as the explicit,
   pessimistic route to protecting a row's current validity under non-serializable writes. —
   PostgreSQL documentation.
5. `FOR UPDATE` only temporarily blocks — a blocked transaction proceeds once the lock is
   released unless the row was actually written while held. — PostgreSQL documentation.
6. Kung & Robinson's own optimistic approach relies on transaction backup, "hoping" conflicts
   won't occur, rather than locking before the fact. — Kung & Robinson, 1981.
7. Kung & Robinson's own three phases: read (local copies only), validation (checked before
   anything becomes visible), write (made global only if validation passed). — Kung & Robinson,
   1981.
8. Kung & Robinson's own consequence of failed validation: the transaction is backed up and
   restarted as a new one. — Kung & Robinson, 1981.
9-10. The two `examples.py` measured comparisons, each confirmed and executed (see
   `FACT-CHECK.md`).

## Changes from the chapter plan

None. Both of the chapter plan's own named sources (Postgres's `FOR UPDATE` documentation, Kung &
Robinson's 1981 OCC paper) fetched cleanly on the first attempt through this project's own
`sources.mjs` pipeline — the paper's own scanned PDF extracts cleanly via `pdftotext`, already
wired into `sources.mjs fetch`, so no substitution or cache workaround was needed (see
`FACT-CHECK.md`'s Problem Solving section).
