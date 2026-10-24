<section data-section="outcomes">

## Outcomes

Describe a primary/replica topology; contrast asynchronous, synchronous and semi-synchronous
acknowledgement and state precisely what each risks on failover — a lost commit vs. a stalled
write; describe failover and promotion at a basic level.

</section>

<section data-section="internals">

## Internals

This topic's own local measurement of `synchronous_commit`'s cost is a genuine stand-in for the
same acknowledgement wait a real synchronous replica adds, but it is not a replacement for the
multi-host failover and lost-commit claims themselves, which stay sourced directly from the
documentation: this sandbox has no second host to run a real primary/replica pair on. PostgreSQL's
own `synchronous_standby_names` can be set per user, per database, or dynamically per transaction —
exactly how a real system applies synchronous replication's own cost only to the writes that are
worth paying it for. With MariaDB's own `AFTER_SYNC` wait point, failover is lossless because every
committed transaction was already replicated before the client was told so; with `AFTER_COMMIT`,
the primary is told success before the replica acknowledges, which is faster but can lose that gap
on a crash.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "synchronous replication" as automatically lossless.** Even with synchronous
replication configured, a semisynchronous replica's own timeout can quietly fall it back to
asynchronous the moment it goes slow — the guarantee this topic names is conditional on the
replica actually keeping up, not a permanent property of the configuration.

**Assuming a promoted replica's old primary can just rejoin as primary again.** Promotion is a
one-way door in the basic picture this refresher covers: the old primary, once a replica has been
promoted in its place, has to be reintroduced as a new replica rather than resuming its old role,
or conflicting writes can happen on both at once.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This refresher treated replication as one undifferentiated thing. The next topic is the two
genuinely different mechanisms hiding behind that word: shipping WAL bytes versus shipping decoded
row changes.

</section>
