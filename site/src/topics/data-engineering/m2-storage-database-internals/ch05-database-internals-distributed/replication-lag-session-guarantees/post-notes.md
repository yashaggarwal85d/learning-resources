<section data-section="outcomes">

## Outcomes

Define read-your-writes, monotonic reads and consistent-prefix reads precisely; measure real
replication lag against this sandbox's own Postgres cluster and deliberately break read-your-writes
by reading from a lagging replica; fix it with a real LSN token and confirm the guarantee holds
again; explain what lag does to a dashboard or a downstream pipeline reading from a replica.

</section>

<section data-section="internals">

## Internals

Consistent-prefix reads forbid seeing an effect without its cause, in the order writes actually
committed. A single standby replaying one WAL stream can never violate either monotonic reads or
consistent-prefix reads, for the same underlying reason: replay only ever moves a replica's own
visible state forward through one ordered stream, so a second read on the same connection can never
see less than the first, and an effect can never appear before the cause that preceded it in that
same stream. A real violation of either guarantee needs a session that moves between two replicas
whose lag varies independently — a second replica this sandbox doesn't have, named and sourced
rather than built, per the chapter's own honest-gap pattern. Sticky routing (always sending one
session's reads to the same node) and primary fallback (reading from the primary when a guarantee
must hold and no replica is known to be caught up) are the two real alternatives to an LSN token:
an LSN token is the most general fix (it works regardless of which replica answers), while sticky
routing is the cheapest when only read-your-writes matters, and primary fallback is the simplest
when the read volume needing the guarantee is small enough for the primary to absorb directly.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reading a replica with no fix for read-your-writes, and no sticky routing either.** This topic's
own first measurement shows exactly what that looks like: a customer's own write, simply absent from
their own next read, with nothing in the request itself revealing why. The failure is silent — no
error, no retry trigger — which is what makes it dangerous in production.

**Applying the LSN-token fix indiscriminately.** The token wait is not free: it makes a read wait
for a replica to catch up to a specific position, which can be the entire replication lag under
load. Applying it to a dashboard or a report that never needed read-your-writes in the first place
(nobody's own write is being checked) makes that read as slow as reading from the primary directly,
for no consistency benefit — exactly the "Prove it" scenario this topic ends on.

</section>

<section data-section="frontier">

## Frontier

GTID-based tokens (MySQL/MariaDB's global transaction identifiers) implement the identical
LSN-token idea on a different replication mechanism, named here but not built, since this sandbox's
real cluster is Postgres. Formal consistency models — linearizability, sequential consistency, and
where session guarantees sit relative to them — are explicitly out of scope for this topic and are
covered precisely in Chapter 14.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Lag is what a network partition costs you in the normal case. The next topic names precisely what
it costs you in the worst case: CAP and PACELC.

</section>
