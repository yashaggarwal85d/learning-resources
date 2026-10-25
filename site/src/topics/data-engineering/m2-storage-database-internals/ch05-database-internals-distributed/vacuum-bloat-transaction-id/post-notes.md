<section data-section="outcomes">

## Outcomes

Explain a dead tuple and a HOT update as MVCC's own by-products, measured directly on this
sandbox's own cluster: deleting half of 300 rows leaves exactly that many dead tuples in
Postgres's own statistics, reclaimed to zero only by `VACUUM`; the identical 300 updates leave a
table's own index untouched when they skip every indexed column, and double it the moment they
don't. Explain the visibility map (which pages `VACUUM` can skip, and which an index-only scan
can skip the heap for) and the real formula autovacuum tunes against — a base threshold plus a
scale factor times the table's own row count, not a fixed schedule. State precisely why a
long-running transaction, a stale prepared transaction, or an abandoned replication slot each pin
the same xmin horizon the identical way, demonstrated directly: holding one transaction open
through 600 concurrent updates leaves a `VACUUM` run during that window able to reclaim none of
them, and all of them the moment the transaction is released. Explain 32-bit XID freezing — the
circular, modulo arithmetic that makes an old transaction ID safe forever once frozen — and why a
wraparound shutdown is self-inflicted rather than a bug: Postgres warns, then refuses new write
transactions entirely, exactly as it did to Sentry's own production cluster in July 2015.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs four real measurements directly against this sandbox's own
Postgres cluster. First, deleting half of 300 rows and reading `pg_stat_user_tables.n_dead_tup`
shows the dead-tuple count rise by exactly that many, then drop to zero after `VACUUM` — reading
that view needed a short retry loop, since Postgres's stats collector flushes asynchronously and
a read taken immediately after the `DELETE` can still show zero for up to a couple of seconds.
Second, 300 updates to an unindexed column leave `pg_relation_size` of the table's own index
completely unchanged, while the identical 300 updates to the indexed column double it — a
measurement chosen specifically because it doesn't depend on exactly when Postgres's own
opportunistic HOT pruning happens to run, unlike an earlier version of this experiment that tried
to count dead tuples directly and got inconsistent results for that reason. Third, a fresh
table's own `age(relfrozenxid)` drops the moment `VACUUM FREEZE` runs. Fourth, and the chapter's
own lab measurement: one `REPEATABLE READ` transaction opened and held, a second, independent
connection running 600 updates against the same table, and a `VACUUM` run while the first
transaction is still open reclaiming nothing at all — only once that transaction commits does a
second `VACUUM` reclaim every one of the 600 dead tuples it left behind.

</section>

<section data-section="production">

## Production failures this topic warns about

**Disabling autovacuum, or just turning it down, under write load.** Sentry's own 2015 postmortem
names this directly as common internet advice, and the exact opposite of the fix: autovacuum
exists specifically to stay ahead of exactly the growth that "it's causing load" blames it for.

**Three real, separate things that silently pin the xmin horizon**, each found through its own
system view: a long-running transaction (`pg_stat_activity`, `backend_xmin`/`backend_xid`), a
stale prepared transaction left over from a crashed two-phase commit (`pg_prepared_xacts`), and a
replication slot whose standby is gone but was never dropped (`pg_replication_slots`,
`xmin`/`catalog_xmin`). None of them time out on their own.

**The real wraparound thresholds and the recovery order.** Postgres warns once a database's
oldest XIDs are forty million transactions from wraparound, then refuses to assign any new
write-transaction XID once fewer than three million remain — read-only transactions still start,
but every write fails outright. Postgres's own documented recovery, in order: resolve old
prepared transactions, end long-running transactions, drop stale replication slots, then run
`VACUUM` on the target database — never `VACUUM FULL` in that state, since it itself needs a
fresh XID and will fail (or, running as superuser, make the exposure worse). Sentry's own actual
recovery, once stuck, didn't even follow that order cleanly: they had to wait for autovacuums
already in flight to finish, then truncate the one large, non-critical table whose own autovacuum
had stalled, before writes came back — five minutes after that one decision.

</section>

<section data-section="frontier">

## Frontier

Multixact IDs give row-level locks held by more than one transaction at once the identical
freeze/wraparound shape as ordinary XIDs, with their own separate counter and thresholds — named
here from Postgres's own documentation, not taught, since this topic's own scope is the ordinary
XID mechanism. PostgreSQL 18 also adds "eager scanning" (`vacuum_max_eager_freeze_failure_rate`),
letting a normal `VACUUM` opportunistically freeze more all-visible pages to shrink the work a
later aggressive vacuum has to do — this sandbox's own 16.15 cluster doesn't have that knob, and
it isn't measured here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays later. The next
topic is the other family entirely — a structure built from the start around never updating in
place: the LSM tree.

</section>
