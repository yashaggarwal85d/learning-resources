# Fact-check — de.replication-lag-session-guarantees

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Read your writes requires that if a process performs a write, and that same process performs a subsequent read, the read must observe the write's effects. | Confirmed | Jepsen, quoted verbatim. |
| 2 | Read your writes does not apply to operations performed by different processes. | Confirmed | Jepsen, quoted verbatim. |
| 3 | Monotonic reads ensures that if a process performs read r1, then r2, r2 cannot observe a state prior to the writes reflected in r1 — reads cannot go backwards. | Confirmed | Jepsen, quoted verbatim. |
| 4 | Monotonic reads does not apply to operations performed by different processes, only reads by the same process. | Confirmed | Jepsen, quoted verbatim. |
| 5 | The primary and standby operate loosely coupled: the primary archives continuously while the standby recovers continuously, reading WAL from the primary. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 6 | A standby configuration with fast recovery is called warm standby; used for read-only queries, it is called hot standby. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 7 | A server enters standby mode if a `standby.signal` file exists in the data directory at startup. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 8 | A large difference between `pg_last_wal_replay_lsn` and `pg_stat_wal_receiver`'s `flushed_lsn` indicates WAL is being received faster than it can be replayed. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 9 | `pg_stat_replication` holds one row per WAL sender process, with statistics about replication to that sender's connected standby. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 10 | The lag times in `pg_stat_replication` measure the time taken for recent WAL to be written, flushed and replayed, and for the sender to know about it. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 11 | Reported lag times are not predictions of catch-up time; a fully caught-up standby shows the time to write/flush/replay the most recent WAL location, not zero. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 12 | In this sandbox: a real paused standby makes a just-committed primary write invisible on that standby; capturing the primary's commit LSN as a token and polling the standby's replay LSN against it, then reading, makes the write visible again, exactly at the moment replay passes the token. | Confirmed, executed | `examples.py: read_your_writes_breaks_on_a_paused_replica`, `lsn_token_fixes_read_your_writes`. |
| 13 | In this sandbox: real replication lag measured under a 2,000-row write load via `pg_stat_replication` is on the order of sub-millisecond `write_lag`/`flush_lag`/`replay_lag`. | Confirmed, executed | `examples.py: measure_real_replication_lag_under_write_load`, actual run: write_lag≈64µs, flush_lag≈337µs, replay_lag≈397µs. |
| 14 | In this sandbox: a single standby's own reads, taken twice on the same connection with a pause between them, never show a smaller row count on the second read than the first. | Confirmed, executed | `examples.py: single_replica_session_cannot_violate_monotonic_reads`. |
| 15 | In this sandbox: two causally dependent writes (`placed`, then `shipped`) replayed through one standby are never observed with `shipped` visible while `placed` is not, across 20 repeated polls during replay catch-up. | Confirmed, executed | `examples.py: consistent_prefix_reads_hold_through_a_single_replicas_replay`. |

## Currency check

- Jepsen's own pages for read-your-writes and monotonic reads are stable, long-standing
  definitions restating Terry et al.'s 1995 session-guarantees terminology; no currency risk, and
  the original paper's own unreachability (see `SOURCES.md`) is a sandbox network limitation, not
  a currency issue.
- PostgreSQL's own warm-standby and monitoring-stats documentation is read directly from the
  current (PostgreSQL 18) documentation, retrieved 2026-10-30; the mechanisms described
  (`standby.signal`, `pg_wal_replay_pause`/`resume`, `pg_stat_replication`'s lag columns) match
  this sandbox's actual PostgreSQL 16.15 behavior exactly, confirmed by the `examples.py`
  reproduction above. No currency risk.

## Red team

1. **"Does a single standby's own measurements actually prove monotonic reads and
   consistent-prefix reads hold in general, or only that this one sandbox happened not to violate
   them this run?"** No — and `OUTLINE.md`, the reel's own step 7/8, and `post-notes.md`'s
   Internals section say this explicitly: the claim is structural (one WAL stream replayed in
   commit order *cannot* produce either anomaly, not merely "didn't this time"), and the topic is
   equally explicit that a real violation needs a second, independently-lagging replica this
   sandbox doesn't have.
2. **"Is the LSN-token fix actually general, or does it only work because this sandbox's own
   standby is unusually fast to catch up?"** The mechanism doesn't depend on speed: the poll loop
   waits up to a 10-second deadline regardless of how long replay actually takes, and the fix is
   defined by position reached, not by elapsed time — a slower standby would simply take longer to
   satisfy the same `pg_last_wal_replay_lsn() >= token` condition, not require a different fix.
3. **"Is naming GTID tokens and sticky routing/primary fallback in Internals an unsupported
   addition, since nothing in `examples.py` builds them?"** The syllabus clause itself names all
   three alternatives ("LSN/GTID tokens, sticky routing or primary fallback"); GTID tokens are
   MySQL/MariaDB's own named mechanism for the identical idea (not built here since this sandbox's
   real cluster is Postgres), and sticky routing/primary fallback are deployment choices, not
   something a single-pair cluster can distinguish experimentally from the LSN-token fix — all
   three are disclosed at the naming level the syllabus itself asks for.
4. **"Does the 'Prove it' scenario's claimed answer (don't apply the token wait to the dashboard)
   actually follow, or is it an unverified extrapolation?"** It follows directly from what
   read-your-writes is defined to protect (claim 1): a process's own write, visible to that same
   process's own later read. A dashboard reader never wrote the order it's displaying, so no
   read-your-writes guarantee is in play for that read, and forcing an LSN-token wait on it adds
   the full replication-lag cost (claim 13's own measured numbers, which rise under load) with no
   session guarantee to show for it.
5. **"Is the port-5434 standby a genuine second node, or a configuration that only looks separate
   while actually sharing state with the primary?"** Confirmed separate: distinct data directory
   (`chmod 0700`'d independently), distinct `postgresql.conf` copy with its own `port`/
   `data_directory`, a distinct postmaster process, and `pg_wal_replay_pause()`/`resume()` produce
   a real, independently observable stop/resume of that process's own replay — not a shared-state
   illusion.

## Problem Solving

- Three sequential standby-startup failures (log-directory write permission, Debian's split
  `postgresql.conf` location outside the data directory, data-directory permission mode) were each
  fixed by reading the exact error message and correcting that specific cause: logging inside the
  postgres-owned data directory instead of `/tmp`; copying `/etc/postgresql/16/main/` to a
  `standby`-named sibling and starting with an explicit `-c config_file=...`; `chmod 0700` on the
  standby's data directory.
- A port-5433 collision was discovered before it caused a failure: grepping sibling ch5 topics'
  `examples.py` files (e.g. `buffer-pool-page-replacement`) showed port 5433 is already a
  chapter-wide convention for a second, genuinely real PostgreSQL 18 cluster an earlier session
  installed — confirmed absent from this session's own container via `apt list --installed`
  (an environment/session-reset limitation, not something this topic broke). **Fixed** by building
  this topic's own standby on port 5434 instead, avoiding any future collision with that
  convention for later ch5 topics still to come.
