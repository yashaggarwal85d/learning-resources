<section data-section="outcomes">

## Outcomes

Name the two positions in a CDC pipeline and where each is stored. Say exactly which crash
replays records, and why. Enable Kafka Connect's exactly-once source support and state its
preconditions. Explain what Debezium does and does not promise about duplicates, with the
documented caveat. Recover from a purged source position.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL, against a real decoded stream

The replay, the fix, the naive-consumer double-count and the purged-position failure are all
measured directly against this sandbox's own real PostgreSQL 16 cluster, using
`pg_logical_slot_peek_changes` and `pg_replication_slot_advance` to model Kafka Connect's own
separate steps: a batch of decoded changes is "produced" with `peek`, which never moves the
slot's own position, and only `pg_replication_slot_advance` commits that position as a distinct
step afterward. Peeking twice without ever advancing between the two reads returns the identical
batch both times, which is exactly what a crash between producing and committing looks like from
the source's own side; advancing right after producing leaves nothing for the next peek to find.
Feeding the duplicated batch to a reader that only sums what it sees doubles the true total,
while a reader that first dedupes by each change's own log position recovers the undoubled
total exactly, which is the dedup layer Debezium's own documentation says it does not provide.
Dropping a slot and then reading from its own name raises an error immediately, confirming a
purged position fails at startup rather than silently continuing, and only creating a fresh slot
lets the pipeline run again. Kafka Connect's own transactional exactly-once source support (KIP-
618) and its `exactly.once.source.support` enablement path are quoted from their own
documentation rather than reproduced, since running a real Connect cluster needs a JVM and a
broker this sandbox doesn't have.

</section>

<section data-section="production">

## Production failures this topic warns about

**A downstream counter that assumes every record it sees is new.** The hook's own incident is
the production failure directly: a connector pod killed between producing change events and
committing their offsets replays those events on restart, and a counter with no dedup logic of
its own counts every one of them twice, exactly as measured here.

**Trusting Debezium's own delivery guarantee to be stronger than it documents.** A team that
assumes "Debezium handles duplicates" is trusting a promise Debezium's own documentation
explicitly declines to make — it states plainly that it implements no internal deduplication
layer, and that even its own exactly-once participation in Kafka Connect still carries an open,
documented doubt about correctness under certain faults.

</section>

<section data-section="frontier">

## Frontier

Kafka's own transactions, the idempotent producer and `read_committed` consumption are the
mechanism KIP-618's exactly-once source support is built on, named only here since they are
Chapter 9's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The pieces are all here: a slot, a snapshot, events, offsets. One project assembles them behind
a configuration file. How Debezium is structured, and what its event envelope looks like, is the
next topic.

</section>
