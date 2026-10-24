<section data-section="outcomes">

## Outcomes

A real buffer, read directly off this sandbox's own Postgres cluster through `pg_buffercache`,
confirms the clock-sweep mechanism the documentation describes: a usage counter raised by
pinning, read by a circularly moving hand. Six more scans of the same small table raise that
counter and it stops climbing at exactly `5`, the documented cap. A real table of `26,688` pages,
far bigger than the `128MB` buffer pool, is built with `CREATE TABLE AS SELECT` (itself using the
documented bulk-write ring) and measured leaving only `2,144` buffers resident after a full scan —
a small, bounded footprint, not most of the pool. A real `UPDATE`'s own dirty flag, read directly
off `pg_buffercache`, flips from `true` to `false` the moment a real `CHECKPOINT` runs. Double
caching and the `O_DIRECT` flag are sourced directly from the Linux manual page and PostgreSQL's
own `shared_buffers` documentation, since neither cluster here runs with `O_DIRECT`. This sandbox
also runs a genuine second PostgreSQL 18 cluster, where `io_method = worker` and `pg_stat_io`'s
own `bulkread` context are confirmed with a real, measured scan rather than only named from
PostgreSQL 18's release notes.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs every measurement it claims, directly against this sandbox's
real Postgres 16 cluster via `pg_buffercache` and `pg_statio_user_tables`: a buffer's usage count
checked before and after repeated scans; a bigger-than-the-pool table's own resident footprint
counted directly; a dirtied buffer's own flag checked before and after a real checkpoint; a warm
table's own `heap_blks_read`/`heap_blks_hit` counters checked for new hits with zero new reads. A
second function connects to this sandbox's real PostgreSQL 18 cluster on its own port and checks
`pg_stat_io`'s `bulkread` context for real reads and hits after a genuine scan.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a `pg_stat_*`/`pg_statio_*` read reflects a query that just ran, in the same session.**
This topic's own first attempt at measuring warm-cache hits read back unchanged counters right
after the very scan meant to move them — not because the scan did nothing, but because a backend
batches its own stats locally and only flushes them periodically, compounded by
`stats_fetch_consistency = cache` caching a stale read within one session. The real fix,
`pg_stat_force_next_flush()`, is the same fix any monitoring query, test, or dashboard that reads
its own backend's recent activity needs.

**Assuming a bigger `shared_buffers` always helps.** PostgreSQL's own documentation is explicit
that an allocation past roughly 40% of RAM rarely helps, because the OS page cache is doing real
work underneath it — a setting tuned by analogy to "more cache is always better" rather than to
this documented ceiling is a common production misconfiguration this topic's own double-caching
material exists to prevent.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL's own buffer-ring documentation goes further than this topic measures: a ring buffer
that gets dirtied has to flush WAL before its buffer can be reused, and for a plain sequential
scan that would dirty every page (a bulk `UPDATE` or `DELETE`), the ring strategy quietly
degrades back to the ordinary strategy — named here directly from the source, not reproduced,
since this topic's own measurement uses a read-only scan where that degradation doesn't trigger.
PostgreSQL 18's `io_uring` backend for `io_method`, an alternative to the default `worker`
backend measured here, is named from the same release's documentation but not run, since neither
cluster in this sandbox was built with `liburing` support.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A dirty page sitting in the buffer pool is lost the instant the process crashes, unless
something records the write durably before the page itself is ever flushed. The next topic is
that something: the write-ahead log.

</section>
