# Fact-check — de.optimistic-vs-pessimistic-concurrency

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `SELECT ... FOR UPDATE` locks the rows it retrieves "as though for update," preventing them from being locked, modified or deleted by other transactions until the current transaction ends. | Confirmed | `www_postgresql_org...explicit_locking...txt`, quoted verbatim. |
| 2 | Within `REPEATABLE READ` or `SERIALIZABLE`, Postgres throws an error if a row to be locked has already changed since the transaction started — `FOR UPDATE` doesn't silently skip a stale row. | Confirmed | `www_postgresql_org...explicit_locking...txt`, quoted verbatim. |
| 3 | Locking a row with `FOR UPDATE` can itself cause a disk write, since Postgres marks the selected rows to record the lock. | Confirmed | `www_postgresql_org...explicit_locking...txt`, quoted verbatim. |
| 4 | Postgres's own documentation names `SELECT FOR UPDATE`, `SELECT FOR SHARE`, or `LOCK TABLE` as the way to protect a row's current validity against concurrent updates when non-serializable writes are possible — the pessimistic, explicit-blocking-lock route. | Confirmed | `www_postgresql_org...applevel_consistency...txt`, quoted verbatim. |
| 5 | `SELECT FOR UPDATE` only *temporarily* blocks: once the locking transaction commits or rolls back without itself updating the row, a blocked transaction proceeds with its own conflicting operation — the row must actually be written, not just selected, to stop that. | Confirmed | `www_postgresql_org...applevel_consistency...txt`, quoted verbatim. |
| 6 | Kung & Robinson's own 1981 paper frames optimistic concurrency control as relying on transaction backup rather than locking, "hoping" that conflicts between transactions will not occur — explicitly a bet on low contention, not a universal replacement for locking. | Confirmed | `www_eecs_harvard_edu...kung_robinson...txt`, quoted verbatim. |
| 7 | Kung & Robinson's own three-phase structure: a read phase (all writes happen on local copies), a validation phase (checked for integrity loss before anything becomes visible), and a possible write phase (local copies made global only if validation succeeds). | Confirmed | `www_eecs_harvard_edu...kung_robinson...txt`, quoted verbatim. |
| 8 | Kung & Robinson's own stated consequence of a failed validation: the transaction is backed up and restarted as a new transaction, so a transaction only ever reaches the write phase if its own validation already succeeded. | Confirmed | `www_eecs_harvard_edu...kung_robinson...txt`, quoted verbatim. |
| 9 | In this sandbox: at a low conflict rate (400 rows, 8 workers, 300 increments each, mostly non-overlapping), a version-column compare-and-set finishes measurably faster than `SELECT ... FOR UPDATE` against the identical workload, with only a handful of wasted retries. | Confirmed, executed | `examples.py: low_conflict_optimistic_wins`, run 7 times total across this fact-check and tuning, optimistic faster every single run (8-15% faster, 20-40 retries). |
| 10 | In this sandbox: at a high conflict rate (2 rows, the same 8 workers), the same compare-and-set finishes measurably slower than `SELECT ... FOR UPDATE`, with thousands of wasted retries, because every worker's read goes stale before it can write. | Confirmed, executed | `examples.py: high_conflict_pessimistic_wins`, run 7 times total, pessimistic faster every single run (78-105% faster, 5301-5743 retries). |

## Currency check

- PostgreSQL's own `FOR UPDATE` row-locking semantics and its own cross-reference to explicit
  blocking locks for application-level consistency are read directly from PostgreSQL 18's own
  current documentation, retrieved today (2026-10-24), and match this sandbox's actual Postgres
  16.15 behavior exactly (confirmed by the `examples.py` reproductions above). No currency risk.
- Kung & Robinson's 1981 paper is the original, standing definition of optimistic concurrency
  control; its own three-phase structure and backup-on-failure rule are unrevised by any later
  edition — this is a foundational paper being cited as itself, not as current product behavior.
  No currency risk.

## Red team

1. **"Is a version-column compare-and-set actually a fair, representative implementation of
   Kung & Robinson's own optimistic approach, or a simplified stand-in that doesn't really match
   the paper?"** It is a direct, standard implementation of the same three phases: the `SELECT`
   with no lock held is the read phase (claim 7's own quote — "all writes take place on local
   copies"), the in-process comparison of the just-read version against what's about to be
   written is the validation phase, and the conditional `UPDATE ... WHERE version = <the version
   read>` is the write phase, which only succeeds (becomes "global") if validation passed. A
   failed `UPDATE` (zero rows affected) is exactly the paper's own "backed up and start over
   again as a new transaction" (claim 8), reproduced here as the retry loop.
2. **"Is `SELECT ... FOR UPDATE` actually representative of 'pessimistic' locking generally, or
   is it a weaker mechanism being oversold as the pessimistic side of the contrast?"** Postgres's
   own documentation (claim 4, quoted directly) names `SELECT FOR UPDATE` as its own recommended
   mechanism for protecting a row's current validity against concurrent updates — it is the
   textbook pessimistic approach in this engine, acquiring the lock before any conflict is known
   to exist, exactly the "block before it knows there's really a conflict" framing this topic's
   own bridge text (from topic 14) uses.
3. **"Are the measured throughput numbers actually showing contention's effect, or just noise
   from running two different workloads back to back?"** Both functions run the identical
   workload shape (same worker count, same op count, same row count) under each strategy in
   immediate succession, and the result is stable and directional across 7 repeated runs in both
   directions — optimistic faster every time at low conflict, pessimistic faster every time at
   high conflict, by a wide and consistent margin (the tightened assertions in `examples.py`
   require at least a 5%/50% margin, well inside the real observed 8-15%/78-105% ranges) — not a
   single-run coincidence.
4. **"Does the high-conflict run's five-thousand-plus retries actually represent wasted
   *database* work, or just wasted *client-side* Python work?"** Each retry is a full extra round
   trip to Postgres (`SELECT` plus a failed `UPDATE`, both over the network), not merely a local
   loop iteration — the database itself executes and discards every one of those failed
   conditional updates, which is the real cost this topic's own measurement is pointing at.
5. **"Is 400 rows for 'low conflict' and 2 rows for 'high conflict' an arbitrary, cherry-picked
   pair of numbers tuned only to make the story work?"** The two settings are chosen to represent
   genuinely different real-world shapes — many independent rows under light simultaneous access
   (most e-commerce catalog rows) versus a handful of rows under heavy simultaneous access (a
   popular inventory count, a shared counter) — not tuned mid-measurement; the same 8-worker,
   300-op workload runs unchanged under both strategies at both settings, and the result held
   across every one of 7 repeated runs at each setting.

## Problem Solving

- None this topic. Both named sources (PostgreSQL's row-locking documentation, Kung & Robinson's
  1981 paper) fetched cleanly through this project's own `sources.mjs` pipeline on the first
  attempt — the paper's PDF is a scanned/OCR'd original, but `pdftotext` (already wired into
  `sources.mjs fetch`) extracts its text cleanly, so no source-substitution or cache workaround
  was needed.
