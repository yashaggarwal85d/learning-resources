# Fact-check — de.write-ahead-logging-fsync

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | An LSN is a byte offset into the WAL, increasing monotonically with each new record, comparable to measure the volume of WAL data between two of them. | Confirmed | `sources/pg-wal-internals.txt`, quoted verbatim. |
| 2 | `wal_sync_method`'s real options include `fdatasync`, `fsync`, and an `open_datasync` option built on `O_DSYNC`. | Confirmed | `sources/pg-wal-config.txt`, quoted verbatim. |
| 3 | `commit_delay` can improve group commit throughput by letting more transactions share one WAL flush. | Confirmed | `sources/pg-wal-config.txt`, quoted verbatim. |
| 4 | Full-page writes log a page's entire content on its first modification after a checkpoint, because an interrupted page write can leave a mix of old and new data. | Confirmed | `sources/pg-wal-config.txt`, quoted verbatim. |
| 5 | A disk write happens in fixed-size sectors, and a crash partway through can leave some sectors written and others not. | Confirmed | `sources/pg-wal-reliability.txt`, quoted verbatim. |
| 6 | PostgreSQL periodically writes full page images to WAL before modifying the actual page, so a partially-written page can be restored during crash recovery. | Confirmed | `sources/pg-wal-reliability.txt`, quoted verbatim. |
| 7 | In 2018, multiple Linux kernel versions were found to lose or misreport `fsync` errors, so a buffer could be marked clean after a failed write and discarded under memory pressure. | Confirmed | `sources/fsyncgate-wiki.txt`, quoted verbatim. |
| 8 | PostgreSQL's real fix, backpatched across five release lines, is to PANIC on an `fsync` failure rather than retry it. | Confirmed | `sources/fsyncgate-wiki.txt`, quoted verbatim. |
| 9 | InnoDB writes a page to its own doublewrite buffer first and only writes it to its final destination once that buffer copy is safely flushed. | Confirmed, sourced-only (not reproduced — no InnoDB instance in this sandbox) | `sources/innodb-dw-w3cub.txt`, a mirrored reproduction of the MariaDB Knowledge Base's own content, quoted verbatim. |
| 10 | A real write's own log position measurably moves forward by a positive, exact byte count, never backward. | Confirmed, direct measurement | `examples.py`; `lsn_is_a_monotonic_byte_offset`, measured against this sandbox's own cluster. |
| 11 | This sandbox's own `wal_sync_method` is really `fdatasync`, matching the documented Linux default. | Confirmed, direct measurement | `examples.py`; `wal_sync_method_matches_the_documented_linux_default`. |
| 12 | A real page's first change after a real checkpoint measurably triggers exactly one full-page image; a second change to the same page triggers none. | Confirmed, direct measurement | `examples.py`; `full_page_write_triggers_on_first_modification_after_checkpoint`. |
| 13 | A real batch of concurrently committing transactions measurably needs far fewer real WAL flushes when `commit_delay` lets them share flushes than when it doesn't. | Confirmed, direct measurement | `examples.py`; `group_commit_reduces_wal_syncs_under_concurrent_load`, 400 commits needing roughly 190–210 flushes with no delay versus 50 with a 20ms `commit_delay`, run repeatedly. |

## Red team

- **Does the group-commit measurement actually test `commit_delay`, or just concurrency's own
  natural batching?** Both runs use the identical concurrency pattern (8 threads, 50 commits
  each); the only variable changed between them is `commit_delay` itself (`0` vs. `20000`
  microseconds). The with-delay run consistently needs about a quarter of the no-delay run's
  flush count across repeated executions, which isolates the delay's own effect rather than just
  concurrency's.
- **Is "triggers exactly once per checkpoint" actually testing full-page writes, or just that
  `wal_fpi` happened to increment once?** The measurement checks the delta is exactly `1` after
  the first change and exactly `0` after an immediate second change to the identical page — a
  looser check (merely `> 0` after the first change) wouldn't rule out the full-page write
  re-firing on the second change too, which is the actual wasteful behavior the claim says
  doesn't happen.
- **Predict question (step 4) wrong-answer trap.** The tempting wrong answer ("yes, a write
  either lands or it doesn't, as one unit") plays on treating a database page as the unit a disk
  actually writes, when the real unit is a much smaller sector — the reveal's own real
  `wal_fpi` measurement is indirect evidence of the defense this gap requires, not a direct
  demonstration of a torn page itself (which would require injecting a real mid-write crash,
  outside what this sandbox can safely do).
- **Is the InnoDB comparison fair, given it isn't run and comes from a mirror site?** The claim
  made (InnoDB writes to its own buffer first, writes to the final destination only after that
  buffer is flushed, and recovers by checking the buffer's own copy) is exactly what the
  original MariaDB Knowledge Base page says about itself; the mirror page states on its own face
  that it reproduces that content, and the claim doesn't depend on anything the mirror might have
  altered (no numbers, no version-specific behavior) — matching the disclosed, sourced-only
  pattern used for every un-run engine comparison in this chapter.
- **Is the fsyncgate claim overstated, given no live bug is reproduced here?** The claim is
  narrowly what the PostgreSQL wiki's own retrospective states: specific named kernel version
  ranges had specific named error-reporting defects, and PostgreSQL's own fix is a documented
  code change (PANIC on failure), not a general claim that `fsync` is unreliable everywhere or
  today.

## Problem Solving

The group-commit measurement's first design considered trying to make the "no delay" case show
roughly one flush per commit — but a real run of 8 concurrent threads already shares some
flushes naturally even with `commit_delay = 0`, since whichever backend's flush happens to be in
flight when others become ready to commit can satisfy more than one commit anyway. Rather than
force an artificially clean zero-sharing baseline, the claim was written around what's actually,
repeatably true: the delay still produces a measurably and consistently larger reduction (the
with-delay run holding steady at exactly `50` flushes across repeated runs, versus the no-delay
run varying but always well above it), which is the real, honest comparison rather than a
contrived one.

Finding a working source for InnoDB's doublewrite buffer took three attempts: `dev.mysql.com`
returned HTTP 403 (as in topic 84); `mariadb.com/kb/en/innodb-doublewrite-buffer/` returned only
a generic JavaScript-rendered landing page rather than the real article text, even though the
identical fetcher had retrieved real content from a different MariaDB KB URL for topic 84 — a
difference caught directly by checking the fetched byte count (3,069 bytes, matching the known
landing-page size) rather than assumed to have worked. Fixed by finding a working mirror,
`docs.w3cub.com`, which reproduces the same MariaDB KB content as static HTML and states its own
sourcing on its face.
