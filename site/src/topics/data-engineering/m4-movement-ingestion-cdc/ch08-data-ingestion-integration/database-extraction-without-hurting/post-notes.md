<section data-section="outcomes">

## Outcomes

Configure a parallel JDBC extract and predict, from the bounds and the key's own distribution,
how many partitions actually do the work. Export a multi-table snapshot that stays consistent
across workers despite a concurrent commit. Choose between the primary, a replica and `COPY` for
an extract, and say what each one costs the source. Show the vacuum side effect of a long
extract, measured directly, and say when it clears.

</section>

<section data-section="internals">

## Internals: MVCC, vacuum and snapshot isolation, composed

This topic introduces no new storage mechanism of its own — the dead-tuple measurement in step 8
is Chapter 5 topic 7's own vacuum-and-xid-wraparound machinery, exercised here as the side effect
of a different topic's own action (an extract), not re-taught. The consistent-snapshot export in
step 5 is Chapter 5 topic 12's own snapshot-isolation guarantee, used exactly as documented: a
`REPEATABLE READ` transaction's view is fixed at its own start, and `pg_export_snapshot()` simply
lets a second transaction share that same fixed view rather than starting its own. The pgjdbc
driver's own result-set-streaming behaviour under `fetchsize` and `autocommit` — not stated in
Spark's own JDBC docs — was measured directly rather than assumed, which is why this topic's own
`COPY`-vs-`SELECT` comparison in step 6 uses `psycopg`'s own defaults and discloses that choice
rather than citing a pgjdbc-specific number.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking a partition count without looking at the key's own distribution.** The hook's extract
is configured with sixteen partitions and left to run; nobody checked whether the id range was
actually spread evenly across the table. This topic's own measurement — the exact same sixteen-
partition configuration, against the real skewed key — shows nearly every row landing in one
partition, and that more partitions (step 10's sixty-four-way run) barely helps, because the
bounds set a stride across the range, never a filter on which rows exist.

**Treating "offload to a replica" as removing a cost instead of moving it.** `hot_standby_feedback`
stops a standby's own long query from being cancelled, which looks like a clean win — until the
primary's own cleanup is what pays for it, exactly the same mechanism this topic measures directly
for a long extract on the primary itself (step 8). A team that offloads to a replica without
reading that trade-off has traded one visible failure (a cancelled query) for a quieter one (table
bloat on the primary).

</section>

<section data-section="frontier">

## Frontier

None claimed. Parallel JDBC reads, snapshot export and import, and `COPY` as a bulk path are each
established PostgreSQL and Spark practice, not an emerging technique — this topic measures them
directly rather than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A full extract is safe but redoes all the work every run. The obvious saving is to read only what
changed since last time, and the cursor that promises that saving has a famous bug.

</section>
