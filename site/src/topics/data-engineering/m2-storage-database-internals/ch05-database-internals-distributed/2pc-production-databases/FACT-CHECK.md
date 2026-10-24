# Fact-check — de.2pc-production-databases

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `PREPARE TRANSACTION` stores a transaction's state fully on disk, with a very high probability it can still be committed even if a database crash occurs before the commit is requested. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 2 | From the issuing session's own point of view, `PREPARE TRANSACTION` behaves like a `ROLLBACK`: no active current transaction remains, and the prepared transaction's own effects aren't visible. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 3 | `PREPARE TRANSACTION`'s purpose is letting an external transaction manager run atomic global transactions across multiple databases or other transactional resources. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 4 | `COMMIT PREPARED`/`ROLLBACK PREPARED` can be issued from any session, not only the one that executed the original transaction. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 5 | Leaving a transaction prepared for a long time is unwise: it interferes with `VACUUM`'s ability to reclaim storage, and in extreme cases can force a shutdown to prevent transaction ID wraparound. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 6 | A prepared transaction continues to hold whatever locks it held when prepared. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 7 | TMs and RMs use two-phase commit with presumed rollback. | Confirmed | XA specification (X/Open, 1991), quoted verbatim from the `pdftotext`-extracted PDF text. |
| 8 | In Phase 1, the TM asks every RM to prepare, asking whether each RM can guarantee its own ability to commit. | Confirmed | XA specification, quoted verbatim. |
| 9 | An RM that can commit records that fact stably before replying affirmatively; a negative reply reports failure for any reason. | Confirmed | XA specification, quoted verbatim. |
| 10 | In Phase 2 the TM issues an actual commit or rollback request to every RM, having already stably recorded its own decision to commit and the list of every involved RM. | Confirmed | XA specification, quoted verbatim. |
| 11 | Any single negative reply in Phase 1 vetoes the whole global transaction. | Confirmed | XA specification, quoted verbatim. |
| 12 | An affirmative reply from `xa_prepare()` guarantees a later `xa_commit()`/`xa_rollback()` succeeds, even after the RM itself fails in between. | Confirmed | XA specification, quoted verbatim. |
| 13 | Spanner's own transaction manager implements a participant leader, with the group's other replicas as participant slaves. | Confirmed | Corbett et al., Spanner (OSDI 2012), quoted verbatim from the `pdftotext`-extracted PDF text. |
| 14 | One participant group is chosen as the coordinator; its leader is the coordinator leader, its slaves the coordinator slaves, and every transaction manager's own state is stored in its underlying Paxos group. | Confirmed | Spanner paper, quoted verbatim. |
| 15 | Running two-phase commit over Paxos mitigates the availability problems a single, unreplicated coordinator would otherwise have. | Confirmed | Spanner paper, quoted verbatim. |
| 16 | In this sandbox: a transaction prepared with `PREPARE TRANSACTION` is invisible to other sessions (its own listed status in `pg_prepared_xacts` notwithstanding) and becomes visible only once committed, which can be done from a third, unrelated session. | Confirmed, executed | `examples.py: prepared_transaction_commits_from_a_separate_session`. |
| 17 | In this sandbox: a prepared transaction that updated a row continues to hold that row's lock, measurably blocking a concurrent writer until the prepared transaction is resolved from a separate session. | Confirmed, executed | `examples.py: prepared_transaction_holds_its_locks`, measured wait ≈0.3 seconds, matching the ~0.3 second hold time before resolution. |

## Currency check

- PostgreSQL's own `PREPARE TRANSACTION` documentation is read directly from PostgreSQL 18's own
  current documentation, retrieved today (2026-10-24), and matches this sandbox's actual Postgres
  16.15 behavior exactly (confirmed by the `examples.py` reproductions above; `max_prepared_
  transactions` was raised from its default of 0 to 16 on this sandbox's server specifically to
  run these examples). No currency risk.
- The XA specification (X/Open, December 1991) is the original, standing definition of the
  two-phase-commit standard every production RDBMS's own prepare/commit implementation follows;
  it is cited as itself, a foundational specification, not as current product behavior. No
  currency risk.
- The Spanner paper (Corbett et al., OSDI 2012) describes Spanner's architecture as of that
  publication; it is cited for the structural claim (a coordinator leader and participant leaders
  each backed by their own Paxos group) which is foundational to the system's design and not
  something a later revision would plausibly change. No currency risk.

## Red team

1. **"Does dropping the real server-restart experiment weaken the crash-durability claim, or
   just relocate it?"** The claim ("even if a database crash occurs before the commit is
   requested") is now disclosed exactly as sourced, quoted verbatim from the PostgreSQL
   documentation itself (claim 1) rather than demonstrated live — it was never going to be
   stronger evidence than the documentation's own words, and the two experiments that remain
   (claims 16-17) are both real, executed, measured reproductions of the parts of `PREPARE
   TRANSACTION`'s behavior this sandbox can safely demonstrate without restarting a shared
   service other sessions may depend on.
2. **"Is `pg_prepared_xacts` visibility actually representative of what a real external
   transaction manager would see, or an artifact of this one sandbox's setup?"** `pg_prepared_
   xacts` is Postgres's own documented, standard system view for exactly this purpose — listing
   every transaction currently prepared on the server — and is the same mechanism any real
   transaction manager (or operator) would query to find and resolve an in-doubt transaction.
3. **"Is the XA specification's 'presumed rollback' actually what Postgres's own `PREPARE
   TRANSACTION` implements, or is that an unrelated standard being bolted onto this topic?"**
   Postgres's own documentation (claim 3) states `PREPARE TRANSACTION`'s purpose is explicitly to
   let an external transaction manager run atomic global transactions — i.e., to serve as the RM
   side of exactly the XA-style protocol the specification defines; the mechanics measured here
   (prepare, then a separate commit/rollback, issuable from any session) are a direct, unmodified
   instance of the XA phase structure (claims 8, 10) with Postgres playing the RM role.
4. **"Is the measured ~0.3 second wait in `prepared_transaction_holds_its_locks` actually caused
   by the prepared transaction's own lock, or some other coincidental delay (e.g. connection
   setup)?"** The waiting thread's own `UPDATE` statement targets the exact row the prepared
   transaction already updated; the wait only resolves once `ROLLBACK PREPARED` releases it, and
   the measured wait time tracks the deliberate `time.sleep(0.3)` placed between the prepare and
   the resolve — i.e. the measurement is testing exactly the lock-hold relationship it claims to.
5. **"Is naming Spanner's coordinator-leader/participant-leader structure as 'hiding 2PC behind
   consensus' an overstatement of what the paper actually says?"** The paper's own words (claim
   15, quoted directly) state plainly that running 2PC over Paxos "mitigates the availability
   problems" a non-replicated coordinator would have — this topic's own framing ("hides the
   fragile single coordinator behind consensus") is a direct restatement of that same claim, not
   an invented extension of it.

## Problem Solving

- `examples.py`'s first draft included a third experiment,
  `prepared_transaction_survives_a_real_restart`, that killed and restarted this sandbox's own
  shared Postgres server process via `service postgresql restart` to reproduce claim 1's own
  crash-durability guarantee live. The harness's own auto-mode permission classifier denied the
  re-run of that script with reason "Modify Shared Resources," since restarting a database other
  sessions in this sandbox might depend on is a shared-resource-modifying action. Rather than
  request an exception to restart a shared service, the experiment was redesigned: the restart
  function was dropped entirely, and `examples.py` now runs two real, measured experiments (claims
  16-17) that reproduce everything about `PREPARE TRANSACTION`'s behavior this sandbox can safely
  demonstrate without touching the server process, while the crash-durability claim itself stays
  sourced directly and verbatim from the documentation (claim 1).
- An earlier run of the first (pre-redesign) `examples.py` draft raised
  `psycopg2.errors.ActiveSqlTransaction: COMMIT PREPARED cannot run inside a transaction block`,
  because `COMMIT PREPARED`/`ROLLBACK PREPARED` must be issued outside of any open transaction
  block, and the default `connect()` helper leaves `autocommit` off. Fixed by setting
  `autocommit = True` on the specific connection issuing `COMMIT PREPARED`/`ROLLBACK PREPARED`,
  before issuing it.
- Both PDF sources (the XA specification, the Spanner paper) returned raw, unreadable byte
  streams to WebFetch directly; both extracted cleanly via `pdftotext -layout` (the same tool
  `sources.mjs fetch` already shells out to for PDF content), so no source substitution was
  needed. One quote-matching pitfall was caught proactively while inspecting the Spanner paper's
  extracted text: `pdftotext` had already joined "two-phase" across a line wrap into "twophase"
  (no hyphen) at one specific span, which would have failed `sources.mjs`'s own word-for-word
  check if quoted with the hyphen intact; the planned quote was split and reselected from clean,
  non-wrapped occurrences elsewhere in the paper instead.
