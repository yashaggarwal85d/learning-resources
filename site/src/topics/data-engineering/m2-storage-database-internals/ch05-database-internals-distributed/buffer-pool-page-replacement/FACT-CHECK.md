# Fact-check — de.buffer-pool-page-replacement

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A buffer's usage counter is incremented, up to a small cap, whenever it is pinned; a circularly moving clock hand decrements each buffer's counter until it finds one at zero. | Confirmed | `sources/pg-buffer-readme.txt`, quoted verbatim. |
| 2 | A big, once-only scan (a large sequential scan, VACUUM) uses a small ring of buffers instead of the normal clock sweep. | Confirmed | `sources/pg-buffer-readme.txt`, quoted verbatim. |
| 3 | The sequential-scan ring is sized at 256KB; bulk writes (COPY, CREATE TABLE AS SELECT) use a 16MB ring. | Confirmed | `sources/pg-buffer-readme.txt`, quoted verbatim. |
| 4 | `pg_buffercache`'s own usage-count column is literally named "Clock-sweep access count." | Confirmed | `sources/pg-buffercache.txt`, quoted verbatim. |
| 5 | `shared_buffers` relies on the OS's own page cache too, which is why allocating more than ~40% of RAM to it rarely helps. | Confirmed | `sources/pg-shared-buffers.txt`, quoted verbatim. |
| 6 | VACUUM's own ring size is a documented, tunable setting (`vacuum_buffer_usage_limit`, surfaced as the "Buffer Access Strategy"). | Confirmed | `sources/pg-shared-buffers.txt`, quoted verbatim. |
| 7 | `heap_blks_read`/`heap_blks_hit` are the real, queryable counters a warm table's buffer hits are measured with. | Confirmed | `sources/pg-statio.txt`, quoted verbatim; used directly in `examples.py`. |
| 8 | PostgreSQL 18's `io_method` defaults to `worker`, with `io_uring` as the alternative. | Confirmed | `sources/pg18-io-method.txt`, quoted verbatim. |
| 9 | PostgreSQL 18 added a real asynchronous I/O subsystem improving sequential scans, bitmap heap scans, vacuums and other operations. | Confirmed | `sources/pg18-release-notes.txt`, quoted verbatim. |
| 10 | `O_DIRECT` tries to minimize cache effects of I/O to and from a file, useful when an application does its own caching. | Confirmed | `sources/linux-open-odirect.txt`, quoted verbatim. |
| 11 | A real buffer's usage count, measured on this sandbox's own cluster, rises toward a cap and stops there rather than climbing indefinitely. | Confirmed, direct measurement | `examples.py`; `repeated_access_raises_usage_count_to_the_cap`, measured cap of 5. |
| 12 | A real table far bigger than the whole buffer pool leaves only a small, bounded number of buffers resident after a full scan, not most of the pool. | Confirmed, direct measurement | `examples.py`; `sequential_scan_ring_bounds_a_bigger_tables_footprint`, measured 2,144 of 26,688 pages resident. |
| 13 | A real buffer's dirty flag flips from true to false the moment a real checkpoint writes it out. | Confirmed, direct measurement | `examples.py`; `a_dirtied_buffer_is_cleaned_by_a_checkpoint`. |
| 14 | A warm table's repeated scan produces zero new disk reads and new buffer hits, measured directly. | Confirmed, direct measurement | `examples.py`; `buffer_hits_dominate_a_warm_tables_stats`. |
| 15 | This sandbox's own second cluster, running PostgreSQL 18, really runs `io_method = worker` and attributes real, measured reads and hits to the `bulkread` context for a genuine sequential scan — not merely a documented option. | Confirmed, direct measurement | `examples.py`; `io_method_worker_issues_real_bulkread_io_on_pg18`, run against the sandbox's PostgreSQL 18 cluster on port 5433. |

## Red team

- **Is the "ring-bounded footprint" measurement actually testing the ring, or just a coincidence
  of table size?** `big_scan` is built with `CREATE TABLE AS SELECT`, which itself uses the 16MB
  bulk-write ring during the load (confirmed separately: immediately after load, exactly 2,048
  buffers — precisely 16MB / 8kB — are resident, matching the ring size claim before the
  follow-up scan even runs). The subsequent full scan only grows that footprint to 2,144 of
  26,688 pages (8%), which is the actual claim under test: a once-only scan over a table many
  times the size of the whole 128MB buffer pool never comes close to occupying it.
- **Does the usage-count-reaches-a-cap measurement actually test the clock sweep's cap, or just
  that the counter went up?** The check asserts the counter stops exactly at 5 after six more
  scans, not merely that it increased — a counter that kept climbing past 5 would fail the
  assertion, so this is a direct test of the documented cap, not just of monotonic growth.
- **Is attributing `pg_stat_io` reads/hits to the `bulkread` context on PostgreSQL 18 actually
  evidence of `io_method` doing anything, or just normal buffer accounting with a new label?**
  The claim made is narrower and sourced precisely: PostgreSQL 18 added the AIO subsystem and
  `io_method` GUC: `pg_stat_io`'s own `context` column (itself new in the same PostgreSQL
  release line) separately bucketing `bulkread` I/O is the real, measurable surface this topic
  points at — not a claim about io_uring internals, which this sandbox's `io_method = worker`
  default doesn't exercise anyway.
- **A backend's own stats queries initially read back zero even right after running the scan
  they're supposed to measure.** Caught directly (both `pg_statio_user_tables` and `pg_stat_io`
  read back unchanged values across statements in the same session) rather than assumed to work;
  root cause is PostgreSQL's cumulative stats system batching a backend's own counts and
  flushing them periodically rather than per-statement, compounded by `stats_fetch_consistency =
  cache`'s default per-transaction caching. Fixed by calling `pg_stat_force_next_flush()`
  immediately after the measured query, before the next read.
- **Is the O_DIRECT claim fair, given PostgreSQL itself doesn't use it by default?** The claim
  made is only about the flag itself (what it does, sourced from the Linux manual page) as the
  general mechanism any engine can use to avoid double caching — not a claim that this sandbox's
  own Postgres clusters use it, which they don't (disclosed, not run).

## Problem Solving

The first attempt at the "ring-bounded footprint" measurement built `big_scan` with a plain
`INSERT ... SELECT` into a pre-created table. That path doesn't use any buffer-ring strategy
(only `COPY` and `CREATE TABLE AS SELECT` do), so the table's own pages simply filled the buffer
pool as they were written and stayed there — the subsequent scan found them all as ordinary
hits, giving a false "resident = pages" result that looked like the ring strategy had failed.
Caught directly by comparing the measured residency against the expected bound before trusting
it. Fixed by switching to `CREATE TABLE AS SELECT`, which genuinely exercises the bulk-write
ring during the load itself.

The warm-scan and PostgreSQL-18 measurements both initially read back unchanged (often zero)
counters immediately after the query that was supposed to move them, in every repeated run —
not a one-off flake. Diagnosed by confirming via `psql` in a separate session that the real,
non-zero values existed, which ruled out the query itself failing to generate the activity and
pointed at same-session stats-cache staleness instead. Fixed by adding `pg_stat_force_next_flush()`
calls at the exact points described in the red-team section above, now also recorded as a
general gotcha for any future topic in any domain that reads `pg_stat_*`/`pg_statio_*` views.

The PostgreSQL 18 measurement required discovering, rather than assuming, that this sandbox
actually runs a second, real PostgreSQL 18 cluster on port 5433 alongside the primary
PostgreSQL 16 cluster on port 5432 — confirmed directly with `SELECT version()` before relying
on it, rather than defaulting straight to the sourced-only disclosure the chapter plan allowed
for a PostgreSQL-16-only sandbox.
