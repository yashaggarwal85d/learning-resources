# Fact-check — de.synchronous-asynchronous-semi-synchronous

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | PostgreSQL streaming replication is asynchronous by default; if the primary crashes, some committed transactions may not have been replicated, causing data loss. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 2 | Synchronous replication confirms that all changes made by a transaction have been transferred to one or more synchronous standby servers. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 3 | Requesting synchronous replication makes each commit wait until confirmation that it's been written to the WAL on disk of both the primary and standby. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 4 | Waiting for synchronous confirmation doesn't use system resources, but the transaction's own locks continue to be held until confirmed. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 5 | If the primary server fails, the standby should begin failover procedures. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 6 | Triggering failover of a log-shipping standby runs `pg_ctl promote` or calls `pg_promote()`. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 7 | With regular asynchronous replication, the primary does not wait for a replica to confirm an event was received. | Confirmed | MariaDB documentation, quoted verbatim. |
| 8 | Semisynchronous replication waits for just one replica to acknowledge it has received and logged the events. | Confirmed | MariaDB documentation, quoted verbatim. |
| 9 | With the AFTER_SYNC wait point, failover should be lossless, since every committed transaction on the primary would already have been replicated. | Confirmed | MariaDB documentation, quoted verbatim. |
| 10 | With the AFTER_COMMIT wait point, failover may involve data loss, since the primary may have committed transactions the replica never acknowledged. | Confirmed | MariaDB documentation, quoted verbatim. |
| 11 | If a semisynchronous replica doesn't acknowledge in time, a timeout occurs and the primary switches to asynchronous replication. | Confirmed | MariaDB documentation, quoted verbatim. |
| 12 | In this sandbox: waiting for commit confirmation (`synchronous_commit = on`) costs measurably more real commit latency than not waiting (`off`), over the identical number of real commits. | Confirmed, executed | `examples.py: synchronous_commit_costs_latency`, run 5 times total, `on` slower every single run (margin roughly 40-150% across runs). |

## Currency check

- PostgreSQL's own synchronous replication and failover documentation is read directly from
  PostgreSQL 18's own current documentation, retrieved today (2026-10-24), and the
  `synchronous_commit` mechanism matches this sandbox's actual Postgres 16.15 behavior exactly
  (confirmed by the `examples.py` reproduction above). No currency risk.
- MariaDB's own semisynchronous replication documentation is read directly from its current
  documentation, retrieved today; the `rpl_semi_sync_master`/`rpl_semi_sync_slave` mechanism and
  its wait-point/timeout behavior are stable, long-standing MariaDB/MySQL features, not something
  a later revision would plausibly change in a way that breaks this topic's own claims. No
  currency risk.

## Red team

1. **"Is measuring `synchronous_commit` locally actually representative of synchronous
   replication's own real cost, or a different mechanism being passed off as the same thing?"**
   The PostgreSQL documentation's own words (claim 3) describe synchronous replication's wait as
   "each commit... will wait until confirmation is received that the commit has been written to
   the write-ahead log on disk of both the primary and standby server" — `synchronous_commit`
   controls exactly this wait; setting `synchronous_standby_names` extends that same wait to a
   remote standby's own WAL instead of just the local one. Measuring it locally isolates the
   genuine wait-for-confirmation cost from network round-trip time, which this topic's own
   narration is explicit about (the local measurement is a "stand-in," not a replacement for the
   real multi-host number).
2. **"Is substituting MariaDB for MySQL's own documentation a meaningful deviation from the
   chapter plan?"** MariaDB is a direct fork of MySQL maintained by much of the original MySQL
   team, and its semisynchronous replication feature (`rpl_semi_sync_master`,
   `rpl_semi_sync_slave`, the AFTER_SYNC/AFTER_COMMIT wait points) is the same mechanism MySQL
   itself documents under the same names — the substitution teaches the real, same mechanism the
   chapter plan asked for, not a different one.
3. **"Does `dev.mysql.com` returning HTTP 403 actually rule out fetching the real MySQL
   documentation, or was this a fixable fetch configuration issue?"** The 403 was reproduced both
   through this project's own `sources.mjs fetch` pipeline (three different documentation
   versions tried) and through a direct `curl` with a standard browser user agent, from this same
   sandbox — ruling out a one-off transient failure or a fixable header issue; the block is
   consistent with bot-detection on MySQL's own documentation host specifically.
4. **"Are the measured latency numbers (claim 12) actually showing the confirmation wait, or
   just noise from running two loops back to back?"** Both runs execute the identical number of
   real commits (200) against the identical table, in immediate succession, and `on` was slower
   than `off` in every one of 5 repeated runs, by a wide and consistent margin (40-150% slower) —
   not a single-run coincidence, and the assertion in `examples.py` (at least 20% slower) is set
   well inside that observed range.
5. **"Does naming `pg_ctl promote` as 'the real command' overstate what a basic refresher should
   claim about failover, which is usually handled by external tooling in production?"** The
   documentation itself (claim 5) is explicit that PostgreSQL provides no automatic failure
   detection or standby notification — `pg_ctl promote`/`pg_promote()` is named here only as the
   actual mechanical trigger a human or an external tool issues once a failure is detected, which
   is exactly the "basics" level this refresher's own outcome promises, not a claim that
   PostgreSQL automates failover end to end.

## Problem Solving

- The chapter plan named "MySQL's own semi-synchronous replication documentation" as a source.
  `dev.mysql.com` returned HTTP 403 to this project's own `sources.mjs fetch` pipeline across
  three documentation versions (8.0, 8.4, 9.0/9.1 refman paths tried), and the same 403 was
  reproduced with a direct `curl` using a standard browser user agent, ruling out a one-off
  transient failure. **Fixed** by substituting MariaDB's own semisynchronous replication
  documentation (`mariadb.com/kb/en/semisynchronous-replication/`), which fetched cleanly and
  documents the identical mechanism (MariaDB is MySQL's own direct fork, using the same
  `rpl_semi_sync_master`/`rpl_semi_sync_slave` naming and the same AFTER_SYNC/AFTER_COMMIT wait
  points).
- `examples.py`'s original plan considered demonstrating a real multi-node primary/replica setup
  (via `pg_basebackup` to a second local Postgres instance) to measure replication lag and
  failover directly. This was dropped in favor of measuring `synchronous_commit`'s own real local
  cost instead, following the chapter's own engine-of-record note that a claim needing a second
  host this sandbox doesn't have should be named and sourced honestly rather than approximated
  with a workaround that risks misrepresenting true multi-host behavior; the local measurement
  still exercises the identical acknowledgement-wait mechanism the documentation describes.
