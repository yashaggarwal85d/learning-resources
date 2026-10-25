<section data-section="outcomes">

## Outcomes

Contrast physical replication (exact WAL-byte shipping, same major version only) with logical
replication (decoded row changes, cross-version, selective, the basis of CDC); set up and inspect
a real Postgres replication slot against this sandbox's own cluster, and explain the real
WAL-retention outage that occurs when its consumer stalls; name failover-safe logical slots (PG17+)
and MySQL's row-based binlog as the same idea elsewhere.

</section>

<section data-section="internals">

## Internals

Logical replication is used for replicating between different major versions of PostgreSQL, and
between PostgreSQL instances on different platforms — both uses physical replication's own
byte-for-byte mechanism structurally cannot support, since it assumes an identical on-disk format
on both ends. Change-data-capture tooling (Debezium and similar) exists specifically because
logical replication's own decoded row changes are exactly the input CDC needs — this topic's own
syllabus clause naming CDC isn't a tangent, it's naming logical replication's real use beyond
replica databases. This topic's own measured experiment uses a physical slot, not a logical one,
because creating a logical slot needs `wal_level = logical`, a postmaster-context setting this
sandbox's server doesn't run with and can't be restarted to change (see FACT-CHECK.md). The
retained-WAL mechanism measured is identical either way: "advancing" a slot the way this topic's
own experiment does, deliberately, to demonstrate the mechanism, is not what a real consumer does —
a real subscriber only advances its own slot as a side effect of actually reading and applying the
changes, so forcing it without consuming would silently discard data for a real replica.

</section>

<section data-section="production">

## Production failures this topic warns about

**A crashed or disconnected logical replication consumer, left unnoticed.** This topic's own
measured experiment shows directly what a stalled slot does: it keeps retaining real WAL,
unconditionally, for as long as nothing advances it. The documentation's own warning is blunt —
replication slots can retain so many WAL segments that they fill the space allocated for `pg_wal`,
which can force the whole primary database offline, not just the one lagging consumer.

**Assuming restarting a stalled consumer is itself the fix.** This topic's own second measurement
shows the fix has two parts: restarting the consumer stops further growth, but the WAL already
retained is only released once the consumer actually reads through it. A long enough outage can
leave a real amount of catch-up work even after the immediate problem is resolved.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL 17's own failover-safe logical slots (synchronized to a standby, so a promoted replica
doesn't lose a logical subscriber's own progress) are named here from the release notes only; this
sandbox's cluster runs PostgreSQL 16, so the feature itself is not reproduced live. MySQL's own
row-based binary log — logging every row a statement actually changed rather than the statement
itself — is named here as the same underlying idea in a different engine, not built or measured.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A replica that's falling behind isn't just a retention risk — it's a real, measurable lag with
real consequences for anything reading from it. The next topic is exactly that lag, and what an
application can do about it.

</section>
