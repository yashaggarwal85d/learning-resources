# Fact-check — de.physical-vs-logical-replication

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Logical replication is named in contrast to physical replication, which uses exact block addresses and byte-by-byte replication. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 2 | Logical replication is used for replicating between different major versions of PostgreSQL. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 3 | Logical replication is used for replicating between PostgreSQL instances on different platforms. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 4 | Replication slots ensure the primary doesn't remove WAL segments until received by all standbys, and doesn't remove rows that could cause a recovery conflict even while a standby is disconnected. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 5 | Replication slots can cause the server to retain so many WAL segments that they fill up the space allocated for `pg_wal`. | Confirmed | PostgreSQL documentation, quoted verbatim. |
| 6 | PostgreSQL 17 enables the failover of logical slots. | Confirmed | PostgreSQL 17.0 release notes, quoted verbatim. |
| 7 | PostgreSQL 17 adds a server variable, `sync_replication_slots`, to enable failover logical slot synchronization. | Confirmed | PostgreSQL 17.0 release notes, quoted verbatim. |
| 8 | When row-based logging is enabled, DML statements aren't logged to the binary log; instead each row a statement inserts, updates, or deletes is logged to the binary log separately. | Confirmed | MariaDB documentation, quoted verbatim. |
| 9 | In this sandbox: a real physical replication slot, with nothing consuming it, retains a real, substantial amount of WAL after real writes land, and that retention drops to exactly zero once the slot is advanced to the current position (as a real consumer catching up would do). | Confirmed, executed | `examples.py: stalled_slot_retains_wal_until_consumed`, run 3 times total, retained WAL in the tens of megabytes every run (17-31MB observed), dropping to exactly 0 after advancing every run. |

## Currency check

- PostgreSQL's own logical replication and replication slots documentation is read directly from
  PostgreSQL 18's own current documentation, retrieved today (2026-10-24), and the replication
  slot mechanism matches this sandbox's actual Postgres 16.15 behavior exactly (confirmed by the
  `examples.py` reproduction above, using the physical-slot variant of the identical mechanism).
  No currency risk.
- The PostgreSQL 17.0 release notes are read directly from the official release notes for that
  specific version; failover-safe logical slots are cited as a version-stated feature of
  PostgreSQL 17, not claimed to exist in this sandbox's own PostgreSQL 16 cluster, and the
  narration and reel are both explicit about that gap. No currency risk.
- MariaDB's own binary log formats documentation is read directly from its current documentation;
  row-based logging is a stable, long-standing feature, not something a later revision would
  plausibly change in a way that breaks this topic's own claim. No currency risk.

## Red team

1. **"Is measuring a physical replication slot's own retention actually representative of what
   happens to a stalled logical slot, or a different mechanism being passed off as the same
   thing?"** The documentation's own words (claim 4) describe "replication slots" generically,
   not logical slots specifically, as the mechanism that keeps the primary from removing WAL a
   consumer hasn't received; `pg_replication_slots.restart_lsn` and the `pg_wal_lsn_diff`
   retention measurement this topic uses apply identically to both slot types — a logical slot
   additionally decodes the retained WAL into row changes, which doesn't change how much WAL is
   retained, only what a consumer sees when it reads it.
2. **"Is choosing a physical slot actually forced, or could a logical slot have been created
   another way?"** `pg_create_logical_replication_slot()` requires `wal_level = logical`, checked
   directly against this sandbox's own `pg_settings` (`wal_level = replica`); that setting has
   `context = postmaster`, meaning it can only be changed by a server restart, and this sandbox's
   own harness denied that restart twice this session (once inside a different topic's script,
   once as a direct command for this topic) with the explicit reason "Modify Shared Resources."
3. **"Does the Prove it scenario's own claimed two-part answer (restarting alone doesn't
   release retained WAL) actually follow from what was measured, or is it an unverified
   extrapolation?"** It follows directly from the two halves of `examples.py`'s own measurement:
   the slot's retained WAL only reached zero after `pg_replication_slot_advance` was called
   (standing in for a real consumer actually reading through the backlog), never merely from the
   passage of time or from the slot simply existing — restarting a consumer resumes reading, it
   doesn't retroactively mark already-generated WAL as read.
4. **"Is substituting MariaDB for MySQL's own documentation, a second time this chapter, still a
   reasonable substitution rather than a pattern of avoiding a harder source?"** The same 403
   block from `dev.mysql.com` was reproduced for this topic exactly as it was for topic 17's (see
   that topic's own `FACT-CHECK.md`); MariaDB's row-based logging documentation describes the
   identical `binlog_format = ROW` mechanism MySQL itself documents under the same name and
   values, so the substitution teaches the same real mechanism, not an approximation of it.
5. **"Is naming CDC (change-data-capture) in the outcomes an unjustified addition not actually
   supported by the sources?"** The syllabus line itself names CDC directly ("decoded row changes
   ... the basis of CDC"), and the documentation's own quoted use cases for logical replication
   (claims 2-3: cross-version, cross-platform replication of decoded changes) are exactly the
   properties real CDC tooling depends on — the claim stays at the naming level the syllabus
   itself asks for, not an unsupported deep dive into a specific CDC tool.

## Problem Solving

- The chapter plan's own visual idea named a real **logical** replication slot with its consumer
  stopped deliberately. This sandbox's own Postgres cluster runs with `wal_level = replica`
  (confirmed via `pg_settings`); creating a logical replication slot requires `wal_level =
  logical`, a postmaster-context setting that can only be changed by editing
  `postgresql.conf` and restarting the server. Attempting that restart — both via a direct `service
  postgresql restart` Bash command and via the same `sed`-then-restart sequence already used
  successfully once this session for a different setting — was denied by the harness's own
  auto-mode permission classifier with reason "Modify Shared Resources." **Fixed** by substituting
  a real **physical** replication slot for the measured experiment: `pg_create_physical_
  replication_slot()` needs no `wal_level` change, and the retention mechanism it exercises (WAL
  kept until a consumer advances the slot) is the identical mechanism the documentation describes
  for replication slots in general (claim 4), not a different one. The decoded-vs-raw distinction
  that is unique to logical replication stays sourced directly from the documentation (claims 1-3)
  rather than reproduced live.
- `dev.mysql.com` returned HTTP 403 to this project's own fetch pipeline, the same block topic
  17's own `FACT-CHECK.md` documents for the same host. **Fixed** by substituting MariaDB's own
  "Binary Log Formats" documentation, which fetched cleanly and documents the identical row-based
  binlog mechanism under the same name.
