# Fact-check — de.locking-deadlocks-lock-escalation

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | PostgreSQL's own table-level lock modes are all genuinely table-level, even the ones named "row" (the names are historical); the only real difference between modes is which other modes they conflict with. | Confirmed | `www_postgresql_org...txt` (explicit-locking), quoted verbatim. |
| 2 | ACCESS EXCLUSIVE, the mode `DROP TABLE`, `TRUNCATE`, `REINDEX` and many `ALTER TABLE`/`ALTER INDEX` forms acquire, conflicts with every other mode and is the only mode that blocks a plain `SELECT`. | Confirmed | `www_postgresql_org...txt` (explicit-locking), both quotes verbatim. |
| 3 | PostgreSQL automatically detects deadlocks and resolves them by aborting one of the transactions involved; the best defense is acquiring locks on multiple objects in a consistent order. | Confirmed | `www_postgresql_org...txt` (explicit-locking), both quotes verbatim. |
| 4 | Postgres's own `deadlock_timeout` is the amount of time waited on a lock before the (relatively expensive) deadlock check runs at all — a detection mechanism gated by a timer, not a prevention algorithm. | Confirmed | `www_postgresql_org...txt` (runtime-config-locks), quoted verbatim. |
| 5 | SQL Server's own intent locks (IS, IX, SIX) are acquired before a lower-level lock specifically to signal intent, so the engine can check only the table-level intent lock instead of every row or page lock to determine if a table-level lock is safe to grant. | Confirmed | `learn_microsoft_com...transaction-locking...txt`, both quotes verbatim. |
| 6 | SQL Server's own lock escalation converts many fine-grained locks into fewer coarse-grained locks to reduce overhead, at the cost of increased contention; escalation triggers once a single statement has acquired at least five thousand locks on one table reference, rechecked every one thousand two hundred fifty newly acquired locks. | Confirmed | `learn_microsoft_com...transaction-locking...txt`, both quotes verbatim. |
| 7 | When SQL Server's own lock escalation succeeds, every row- and page-level lock the transaction holds on that object is released and replaced by one full table lock. | Confirmed | `learn_microsoft_com...transaction-locking...txt`, quoted verbatim. |
| 8 | SQL Server's own deadlock monitor periodically scans for a cyclic dependency among waiting tasks and, if found, picks one task as a victim and terminates its transaction — functionally a wait-for-graph cycle search, recursively following each waiting thread to the owner of the resource it wants until a cycle closes. | Confirmed | `learn_microsoft_com...deadlocks-guide...txt`, all three quotes verbatim. |
| 9 | SQL Server's own deadlock-search interval adapts: it drops from five seconds to as low as one hundred milliseconds once deadlocks start being found, so a real cluster of deadlocks gets caught faster than an isolated one. | Confirmed | `learn_microsoft_com...deadlocks-guide...txt`, quoted verbatim. |
| 10 | Db2's own `maxlocks` parameter defines the percentage of the shared lock list one application can hold before the database manager escalates that application's own locks; escalation also fires if the lock list itself runs out of space. | Confirmed | `www_ibm_com...maxlocks...txt`, both quotes verbatim (the real, current text of that live page). |
| 11 | Deadlock prevention (as opposed to detection) assigns each transaction a priority and aborts one transaction outright, before a wait ever becomes a cycle: wait-die aborts the lower-priority waiter when it would wait on a higher-priority holder, wound-wait aborts the lower-priority holder when a higher-priority transaction wants what it holds. | Confirmed | `en_wikipedia_org...deadlock_prevention...txt`, both quotes verbatim. |
| 12 | In this sandbox: a real, forced two-row cyclic wait (T1 holds row 1 and wants row 2; T2 holds row 2 and wants row 1) produces a genuine `psycopg2.errors.DeadlockDetected` for exactly one of the two transactions, caught at roughly one second — matching `deadlock_timeout`'s own documented default. | Confirmed, executed | `examples.py: deadlock_detected_and_aborted`, run three times, identical outcome (one commit, one deadlock, ~1.00s) every run. |
| 13 | In this sandbox: the exact same two-row contention, with both transactions acquiring their locks in the same order instead of opposite orders, produces zero deadlocks across five repeated rounds — Postgres's own documented "best defense," measured rather than only asserted. | Confirmed, executed | `examples.py: consistent_lock_order_avoids_deadlock`, run three times (15 total rounds across this fact-check), zero deadlocks every round. |
| 14 | In this sandbox: a real `ACCESS EXCLUSIVE` lock (the level most migration-shaped DDL acquires), held for roughly three tenths of a second, genuinely blocks a concurrent plain `SELECT` on the same table for approximately that same duration. | Confirmed, executed | `examples.py: access_exclusive_blocks_even_reads`, run three times, identical result (~0.29s block) every run. |

## Currency check

- PostgreSQL's own table lock modes, deadlock detection and `deadlock_timeout` are read directly
  from PostgreSQL 18's own current documentation, retrieved today (2026-10-24), and match this
  sandbox's actual Postgres 16.15 behavior exactly (confirmed by the `examples.py` reproductions
  above). No currency risk.
- SQL Server's own intent-lock and lock-escalation mechanism (including the five-thousand-lock
  and one-thousand-two-hundred-fifty-lock thresholds) is read directly from Microsoft's own
  current Learn documentation, retrieved today. These are stated as the engine's own current
  behavior, not a historical figure, so no currency risk, though this sandbox cannot run SQL
  Server itself to verify the thresholds directly — disclosed as sourced-only in `OUTLINE.md`.
- Db2's own `maxlocks` parameter is read directly from IBM's own current documentation page,
  retrieved today, for the same reason (sourced-only, no SQL Server/Db2 instance in this
  sandbox).
- Wait-die and wound-wait are standing, decades-old deadlock-prevention algorithms (Rosenkrantz,
  Stearns & Lewis, 1978); their own definitions are unrevised. No currency risk.

## Red team

1. **"Is Postgres's `deadlock_timeout` actually an example of the syllabus's own 'deadlock
   prevention (timeouts...)' clause, or is it detection, mislabeled?"** It is detection, and
   `FACT-CHECK.md`'s own claim 4 states this distinction directly rather than blurring it:
   `deadlock_timeout` only decides *when* the (expensive) cycle check runs, after a wait has
   already begun — it never aborts a transaction purely for waiting too long, the way a true
   prevention timeout would. The reel's own narration and `OUTLINE.md` keep Postgres's mechanism
   under "detection" and wait-die/wound-wait under "prevention," matching the syllabus's own
   explicit split rather than collapsing the two.
2. **"Is reproducing a deadlock with `SELECT ... FOR UPDATE` on two rows actually representative,
   given most production deadlocks come from implicit locks inside ordinary `UPDATE`
   statements?"** The mechanism is identical either way — Postgres's own docs (claim 3, quoted
   directly) give exactly this shape ("transaction 1 acquires an exclusive lock... transaction 2
   has already exclusive-locked...") as its own canonical deadlock example, and state directly
   that row-level locks can deadlock "even if explicit locking is not used." `FOR UPDATE` is used
   here only to make the row-level exclusive lock explicit and controllable for a forced,
   reproducible interleaving; the underlying conflict is the same one an ordinary two-statement
   `UPDATE` sequence would hit.
3. **"Is `access_exclusive_blocks_even_reads` actually a DDL statement, or is `LOCK TABLE ...
   ACCESS EXCLUSIVE` a different thing dressed up to look like one?"** `LOCK TABLE` with an
   explicit mode is used here specifically because it reproduces the *exact lock level* real DDL
   acquires (claim 2's own quote: "Many forms of ALTER INDEX and ALTER TABLE also acquire a lock
   at this level") without needing a real schema change in the sandbox's own shared database —
   the measured blocking behavior (a plain `SELECT` genuinely waiting) is identical to what a
   real `ALTER TABLE` would cause, which is the actual claim this topic makes, not a claim about
   DDL syntax specifically.
4. **"Is quoting Db2's own `maxlocks` page fair, given the direct fetch got an HTTP 403?"** Yes,
   for the same reason established in prior topics: the 403 is a bot-protection response (also
   confirmed on IBM's documentation index page, a different URL on the same host), not a sign the
   page is unreachable or the content invented — the quotes are the real, current text of that
   live page, retrieved through this session's own browsing tool and cached for the automated
   quote check exactly as fetched, documented directly in `SOURCES.md`'s own header note.
5. **"SQL Server's intent-lock and escalation thresholds, and Db2's `maxlocks`, are all named but
   none of them can be measured in this sandbox (no SQL Server or Db2 instance) — is that a real
   gap?"** No: the syllabus's own outcome line asks to "name real lock modes and intention locks"
   and "explain lock escalation as SQL Server/Db2 implement it," which is satisfied by precise,
   sourced, directly-quoted claims rather than a reproduction neither database offers in this
   sandbox; the topic's own real reproduction (per `CHAPTER.md`'s own "Lab: none of its own," and
   its "Visual idea" naming a real deadlock against this sandbox's Postgres cluster) is the
   deadlock and the migration-hazard lock, both of which are executed for real.

## Problem Solving

- **Db2's own `maxlocks` configuration-parameter documentation page returned HTTP 403 to this
  sandbox's direct fetch tooling**, confirmed on a second IBM Docs URL as well (the topic index
  page, also 403) — a bot-protection response rather than the page being genuinely offline.
  **Fixed**, without substituting a different source, by retrieving the same live page's real
  text through this session's own browsing tool (which reaches it successfully) and caching that
  real text for the automated word-for-word quote check, documented directly in `SOURCES.md`'s
  own header note, matching the precedent already set for a MySQL documentation page in topic 12.
