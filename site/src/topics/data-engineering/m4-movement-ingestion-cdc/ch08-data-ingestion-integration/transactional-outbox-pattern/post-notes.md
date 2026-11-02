<section data-section="outcomes">

## Outcomes

Reproduce the dual-write loss with a crash between commit and publish and fix it with an outbox
written in the same transaction. Configure the outbox router's routing, id and key. Design an
event payload and an aggregate key. Clean the outbox without losing events.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL, against a real decoded stream

The dual-write loss, the outbox fix, the routing and dedup behavior, the ordering guarantee and
the cleanup safety are all measured directly against this sandbox's own real PostgreSQL 16
cluster. Committing an order row and then "crashing" before a separate publish step leaves
nothing in a real decoded stream to recover; writing the event into an outbox row inside the
exact same transaction as the order means a real decoded read always finds it, because the two
writes either both exist or neither does. A hand-built router, run against two real decoded
outbox inserts of different aggregate types, routes each to its own `outbox.event.<type>` topic
and confirms the outbox row's own id is available as a dedup key. Four interleaved events for
two different aggregates, decoded in one stream, still come apart cleanly by `aggregateid` into
each aggregate's own correctly ordered sequence. A real `DELETE` on the outbox table is captured
by decoding only after the insert it removes has already been captured by the same slot, and
the router's own filtering logic produces no event at all for that delete — confirming cleanup
is both invisible to consumers and safe only once the row is already gone from the slot's own
pending work. Debezium's own Outbox Event Router implementation, the table-free
`pg_logical_emit_message` variant, and the Quarkus outbox extension are named and quoted from
their own documentation rather than reproduced, since running any real connector needs a JVM
and Kafka this sandbox doesn't have.

</section>

<section data-section="production">

## Production failures this topic warns about

**Publishing after commit instead of in the same transaction.** The hook's own incident is the
production failure directly: a service commits an order and crashes before a separate publish
step runs, and the event is gone forever — not delayed, not retried, simply never written
anywhere a consumer could ever find it.

**Cleaning up the outbox table before a slot has actually captured the rows being deleted.**
Measured directly here: the delete itself is invisible to the router by design, so the only
thing standing between a safe cleanup and a silently lost event is whether the slot's own
position has already moved past the row before it is removed.

</section>

<section data-section="frontier">

## Frontier

Consumer-side deduplication using the outbox row's own id, and Kafka transactions as an
alternative atomicity mechanism, are each named only here, since they are Chapter 9's own
subject once a real broker is in play.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything so far assumed a Kafka cluster in the middle. Some pipelines do not want one: they
want the database's log read straight into a stream processor and out to a lakehouse. That path
is Flink CDC.

</section>
