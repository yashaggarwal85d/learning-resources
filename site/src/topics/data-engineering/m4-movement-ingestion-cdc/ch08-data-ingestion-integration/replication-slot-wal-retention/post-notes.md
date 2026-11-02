<section data-section="outcomes">

## Outcomes

Reproduce WAL growth behind a stalled slot and read it off `pg_replication_slots`. Name the two
ways a healthy connector still fails to advance a slot and fix each with a heartbeat. Set
`max_slot_wal_keep_size` and say precisely what it saves and what it destroys. Write the lag
query and the alert it should feed.

</section>

<section data-section="internals">

## Internals: measured directly, except where this sandbox has one database

The stalled-slot mechanism, the confirmation-based fix, and the safety valve are all measured
directly against this sandbox's own PostgreSQL cluster: a slot with no reader, a hand-written
confirming consumer standing in for a heartbeat, and a real `max_slot_wal_keep_size` driving a
real slot from `reserved` to `lost`. The two Debezium-named variants (a low-traffic captured
table inside a busier database; a quiet database sharing WAL with a busy one) and the AWS RDS
case need a second database or a real RDS instance, neither of which this sandbox has, so they
are named from Debezium's own documentation rather than reproduced. The slot and LSN model
itself is topic 10's own subject, used here, not re-taught; how to actually re-snapshot after a
lost slot is topics 13-14's; the general practice of monitoring and alerting is Chapter 13's;
vacuum and the xmin horizon, which the same slot-pinning mechanism also touches, are Chapter 5
topic 7's.

</section>

<section data-section="production">

## Production failures this topic warns about

**Watching connector status instead of the slot's own retained-WAL gap.** The hook's own
incident is the production failure directly: a connector that reports healthy the entire time a
disk fills up, because connector status and slot progress are two different facts that happen to
usually move together — except exactly when they don't.

**Setting `max_slot_wal_keep_size` without a plan for the slot it eventually loses.** Step 7's
own measurement shows the valve doing exactly what it's configured to do: saving the disk by
sacrificing the stream. A team that sets this limit purely to stop a disk alert, without also
planning for the re-snapshot a `lost` slot then requires, has traded one incident for a second,
larger one.

</section>

<section data-section="frontier">

## Frontier

`idle_replication_slot_timeout`, added in PostgreSQL 18, invalidates a slot that has simply sat
inactive too long, independent of how much WAL it has pinned — named from the release notes,
not exercised, since this sandbox runs PostgreSQL 16.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A slot protects a position in the log. But a new consumer has no position yet and needs the
table as it stands now, then every change after exactly that moment, with no gap and no overlap.
How that handover works is the next topic.

</section>
