<section data-section="outcomes">

## Outcomes

Choose between Connect, Debezium Server and the embedded engine for a given platform. Read
every field of a change event and say what the sink needs from it. Apply the unwrap SMT and
state what it removes. Configure a JDBC sink that is idempotent and applies deletes.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL, against a real decoded stream

The envelope rebuild, the unwrap transform and the idempotent-upsert claim are all measured
directly against this sandbox's own real PostgreSQL 16 cluster: a real decoded insert and a
real decoded update are rebuilt by hand into Debezium's own envelope shape, with the insert's
own `before` empty and the update's own `before` and `after` both carrying real column values.
Unwrapping that same envelope keeps only its column values and drops `before`, `op` and
`source` entirely unless a metadata-preserving variant explicitly folds the table name and `op`
back in. A real decoded delete, unwrapped, carries its last-known columns plus a `__deleted`
marker rather than vanishing, tying directly back to topic 17's own tombstone handling. Applying
the same unwrapped record twice, by a real upsert, to a real sink table leaves the row in the
identical final state both times, with no second row ever inserted — the exact idempotence
Debezium's own JDBC sink documentation promises. The three deployment shapes (Kafka Connect,
Debezium Server, the embedded engine), their own sink targets, and the JDBC sink's
`schema.evolution` and `delete.enabled` settings are named from their own documentation rather
than reproduced, since running any real Debezium deployment needs a JVM and Kafka this sandbox
doesn't have.

</section>

<section data-section="production">

## Production failures this topic warns about

**Unwrapping a stream and then needing the field it just threw away.** The hook's own incident
is the production failure directly: a team unwraps a change event to simplify it for a sink,
loses the `op` field in the process, and can no longer tell a re-snapshot `READ` from a real
insert — exactly the cost this topic's own measured unwrap function makes concrete.

**Assuming any write to a sink is safe to retry.** A sink connector configured without upsert
mode has no idempotence guarantee at all; retrying or replaying a write can double-insert a row
rather than leaving it in the same final state, which is the specific property this topic's own
measured upsert proof confirms Debezium's JDBC sink actually delivers only when configured for
it.

</section>

<section data-section="frontier">

## Frontier

Debezium's own topic-routing and content-based routing SMTs, named only here, can send many
tables to one topic or filter records before they ever reach a sink — Chapter 9's own subject
once a real broker is in play.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Debezium turns database changes into events. There is a second thing teams want from the same
machinery: to publish a domain event whenever they change their own data, without the dual-write
bug. The outbox pattern uses the very same log for that.

</section>
