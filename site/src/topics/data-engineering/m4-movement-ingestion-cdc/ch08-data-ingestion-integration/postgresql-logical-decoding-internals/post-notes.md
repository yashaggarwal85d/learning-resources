<section data-section="outcomes">

## Outcomes

Create a logical slot on the sandbox and read the decoded changes of an insert, an update and a
delete. Show how `REPLICA IDENTITY` changes the before-image. Read `restart_lsn` and
`confirmed_flush_lsn` and say what each protects. Explain why a consumer must tolerate repeats.
State what standby decoding and failover-synchronised slots each add and what must be
configured for either to work.

</section>

<section data-section="internals">

## Internals: what this topic measures, and what it leaves for later

This topic reads real decoded changes through `pg_logical_slot_get_changes` and
`pg_logical_slot_peek_changes`, the `test_decoding` plugin, and `pg_replication_slots`, which is
enough to measure the before-image, the repeat behaviour, and the two LSN positions directly.
`pgoutput` and `decoderbufs` are named from Debezium's own documentation, not independently
exercised, since reproducing either one's wire format is topic 19's own subject. What a
publication selects is named in prose; this topic creates none of its own, since Debezium's
`publication.autocreate.mode` behaviour belongs to that same later topic. The stalled-consumer
WAL incident and its safety valves are topic 12's own subject; the snapshot a slot takes on
creation is topic 13's; a real two-node promotion exercising standby decoding or a failover slot
is sourced only, since this sandbox runs a single PostgreSQL 16 server with no standby and no
PG17-only slot properties, confirmed directly in `examples.py`.

</section>

<section data-section="production">

## Production failures this topic warns about

**Enabling CDC on a table without checking its primary key.** The before-image measurement
shows `DEFAULT`'s before-image collapsing to nothing useful once a table has no primary key, and
Debezium's own documentation says a table in that state yields only create events downstream. A
team that turns on CDC for a key-less table and expects updates and deletes to show up
downstream has made a configuration mistake the decoded output would have shown them in minutes.

**Treating a slot's crash-safety as the end of the story.** The slot measured here survives its
own server's crash, but it does not survive that server disappearing entirely. A team that relies
on a single logical slot for disaster recovery, without a standby that has been told to track it
or a synchronised failover slot ready to take over, has a capture pipeline that stops the moment
the primary it was reading does.

</section>

<section data-section="frontier">

## Frontier

Failover-synchronised logical slots are recent enough that this topic's own PostgreSQL
17 source material treats them as a new addition, still absent from the PostgreSQL 16 server
this topic measures against directly. Everything else here — decoding, slots, `REPLICA
IDENTITY` — is long-stable, documented practice.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

PostgreSQL gives a consumer a slot that remembers its place for it. MySQL does it differently:
the consumer keeps its own position in a file-based log. The next topic is that log, and the
contrasting designs of Oracle and SQL Server.

</section>
