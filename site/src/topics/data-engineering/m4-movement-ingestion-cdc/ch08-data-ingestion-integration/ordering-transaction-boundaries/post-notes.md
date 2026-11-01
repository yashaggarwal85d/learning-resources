<section data-section="outcomes">

## Outcomes

Show per-key order surviving and cross-table order breaking in the same transaction. Reassemble
a transaction downstream from its own BEGIN/END events and per-table counts. State what a CDC
consumer may and may not assume about ordering. Design a join that tolerates arrival skew.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL

Every claim here is measured directly against this sandbox's own real PostgreSQL 16 cluster,
reading a logical-decoding slot's own `lsn`, `xid` and `data` columns with `test_decoding`: an
uncommitted insert that a second connection's own read of the slot cannot see until the first
connection commits; three keys updated nine times in a deliberately out-of-key-order sequence,
split into one queue per key, each queue confirmed to list its own three values in exactly
commit order; one commit inserting an order and three items, split into two per-table queues
the way two Kafka topics would receive them, with a naive consumer draining the items queue
first finding all three items orphaned against an order it hasn't seen yet; and the same split
commit reassembled with zero orphans by a consumer that buffers every change by its own real
`xid`, builds its own `txID:LSN` id and per-table counts from the slot's own columns, and
releases the join only once the buffered count matches the transaction's own total. Debezium's
own transaction-metadata feature (the dedicated `transaction` topic, the `provide.transaction.metadata`
setting, and its deploy-time limitation that metadata exists only for transactions after the
connector started) is named from its own documentation rather than reproduced, since running
Debezium itself needs a JVM and Kafka this sandbox doesn't have. Kafka's own partition-ordering
guarantee is used by name, not re-taught, since Chapter 9 topic 7 owns it.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a transaction is one delivery because it was one commit.** The hook's own incident is
the production failure directly: a join written as though an order and its items always arrive
together will intermittently find an item with no order yet, because the two tables were split
into two topics the moment the transaction left the database, and nothing about the source
commit survives that split on its own.

**Trusting per-row order to also mean cross-row order.** A team that has seen Debezium's own
primary-key routing keep one row's own history perfectly ordered can wrongly assume the same
mechanism protects a transaction spanning several rows or tables. The two guarantees come from
entirely different places: one from how a key is routed, the other from nothing at all unless a
consumer rebuilds it.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL 14's own streaming-of-in-progress-transactions option lets a long transaction's
changes reach a subscriber before that transaction commits, named only from the release notes,
since exercising it needs an output plugin built against the `stream_*` callbacks that this
topic's own `test_decoding` plugin does not use by default.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Order and atomicity cover the rows a transaction touches. The columns themselves change too: a
deploy adds, drops or retypes one, and the stream has to carry the new shape without breaking
its readers. That is schema evolution in a change stream.

</section>
