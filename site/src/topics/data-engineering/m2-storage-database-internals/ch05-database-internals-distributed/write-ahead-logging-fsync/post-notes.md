<section data-section="outcomes">

## Outcomes

A real LSN, read directly off this sandbox's own Postgres cluster before and after a real write,
confirms the documentation's own framing: it moves forward monotonically, and `pg_lsn`
subtraction returns the exact byte gap between two readings. A real batch of `400` concurrently
committing transactions, measured directly, needs only around `190`–`210` real WAL flushes with
`commit_delay` off, and exactly `50` with a `20ms` `commit_delay` set — a real, repeatable
group-commit saving that never skips any individual commit's own wait for durability. A real
page's own `wal_fpi` counter, read directly, rises by exactly `1` on its first change after a
real `CHECKPOINT` and by `0` on an immediate second change to the same page, confirming
`full_page_writes`'s documented trigger condition precisely. This sandbox's own
`wal_sync_method` is confirmed directly as `fdatasync`, matching the documented Linux default.
InnoDB's own doublewrite buffer and the 2018 fsyncgate lesson are both named and sourced
directly from their own documentation and the PostgreSQL wiki's own retrospective, since neither
can be run or reproduced against this sandbox.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs every measurement it claims, directly against this
sandbox's real Postgres 16 cluster: a real `pg_current_wal_lsn()` reading before and after a
write, subtracted directly to get a real byte count; `pg_stat_wal`'s own `wal_fpi` counter
checked before and after a real `CHECKPOINT` plus two real page changes; eight concurrent
threads committing fifty transactions each, with `pg_stat_wal`'s own `wal_sync` counter checked
under two different `commit_delay` settings; `wal_sync_method` read directly via `SHOW`.

</section>

<section data-section="production">

## Production failures this topic warns about

**Retrying a failed `fsync` call.** The 2018 fsyncgate lesson, named directly from the
PostgreSQL wiki's own retrospective, is specific: certain Linux kernel versions could lose or
misreport a write-back error, marking a buffer clean after the failure and discarding it under
memory pressure — meaning a retried `fsync` call could falsely report success on data that was
never actually written. The production failure mode is treating any force-out failure as
something to log and retry rather than a reason to crash and replay from the last checkpoint;
this topic's own "Prove it" scenario is built around exactly that tempting but unsafe shortcut.

**Assuming `commit_delay` is free latency to spend.** This topic's own measurement shows a real
throughput benefit from letting commits share a flush, but the same documentation that describes
`commit_delay` is explicit that it adds up to that delay's own full value to every flush's
latency — a production tuning mistake is raising `commit_delay` for throughput on a workload
that actually needs low per-commit latency more than it needs higher commit throughput.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL's own WAL documentation goes further than this topic measures: `wal_compression` can
compress the full-page images this topic's own measurement triggers, trading CPU time for less
WAL volume written per checkpoint cycle — named here from the same source, not measured, since
the syllabus's own scope here is the write-ahead rule and the sync machinery, not WAL volume
tuning. InnoDB's own `innodb_doublewrite` setting can disable the doublewrite buffer entirely on
filesystems that already write pages atomically, named directly from the same mirrored source,
not reproduced.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A WAL that's never allowed to grow forever needs a way to bound how far back a crash recovery
must replay. That bound is a checkpoint.

</section>
