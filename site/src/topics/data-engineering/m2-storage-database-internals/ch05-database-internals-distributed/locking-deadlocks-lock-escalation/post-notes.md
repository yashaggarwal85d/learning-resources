<section data-section="outcomes">

## Outcomes

Name real lock modes (Postgres's own table-level modes, from one that only blocks a conflicting
write to `ACCESS EXCLUSIVE`, which blocks everything including a plain read) and intention locks
(SQL Server's own IS/IX/SIX, which let the engine check one table-level flag instead of scanning
every row lock). Explain row vs. page vs. table granularity's own trade-off. Contrast deadlock
detection (Postgres's own cyclic-wait monitor, SQL Server's own wait-for-graph-style cyclic
search) against deadlock prevention (wait-die and wound-wait's own priority-based abort rules,
which never let a cycle form at all). Explain lock escalation as SQL Server and Db2 each
implement it, with each vendor's own real thresholds. Explain why a long-running DDL statement's
lock is a real migration hazard — reproduced directly: a real `ACCESS EXCLUSIVE` lock measurably
blocking a concurrent plain read for its own hold time.

</section>

<section data-section="internals">

## Internals

SQL Server's own lock escalation (quoted directly in `SOURCES.md`) releases every row- and
page-level lock a transaction holds on an object the moment escalation succeeds, replacing them
all with one table lock — this is why escalation is a one-way door within a transaction, not a
gradual shift: the fine-grained locks are gone the instant the coarse one lands. Postgres's own
deadlock mechanism takes the opposite shape from wait-die/wound-wait: it never consults a
transaction's own priority at all, letting any two transactions wait on each other for up to
`deadlock_timeout` before spending the cost of a real cycle search — a trade between wasted
waiting time and wasted CPU on checks that usually find nothing.

</section>

<section data-section="production">

## Production failures this topic warns about

**Running a schema migration against a busy production table without checking its own lock
level.** This topic's own measured experiment (`access_exclusive_blocks_even_reads`) shows
directly that the exact lock level most `ALTER TABLE` statements acquire blocks every read on
that table for the statement's entire duration — not just its writes. A migration that looks fast
in a quiet staging environment can stall an entire table's own reads in production the moment it
runs against real, concurrent traffic.

**Treating a deadlock as a bug to eliminate rather than a cost to manage.** Postgres's own
documentation (quoted directly) states that the real defense is a consistent lock order, not
zero locking — this topic's own `consistent_lock_order_avoids_deadlock` experiment shows exactly
that fix, measured, turning the same contention from a guaranteed deadlock into zero across
repeated rounds.

</section>

<section data-section="frontier">

## Frontier

SQL Server's own intent-lock and lock-escalation thresholds (the exact lock counts that trigger
escalation) and Db2's own `maxlocks` percentage are disclosed here directly from each vendor's
own current documentation, since neither database runs in this sandbox to measure them directly
— the chapter's own shared-notation rule for a claim this sandbox can't run itself. Lock
partitioning and row versioning, both named in SQL Server's own locking guide, are out of scope
here; they address a different problem (reducing contention on hot rows, and avoiding read locks
entirely) than this topic's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Locking is pessimistic by nature: it blocks before it knows there's really a conflict. The next
topic is the practical choice between that and the optimistic alternative topics 12–13 already
showed working.

</section>
