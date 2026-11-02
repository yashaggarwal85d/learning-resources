<section data-section="outcomes">

## Outcomes

An incremental load needs a source of changed rows, and the cleanest source is the order
database's own change log — the moment you read it, you inherit its hazards. This topic designs
CDC from the shop's Postgres orders into an Iceberg table: a pipeline strip from write-ahead log
through a replication slot, a connector, a topic, and a merge whose correctness boundary sits at
that merge itself, ordered by log position rather than arrival time. A replication slot's own
guarantee — retain every unconfirmed byte, outage or not — is exactly what fills the source's
disk once a connector stops; a cap bounds that growth at the cost of a forced re-snapshot, and a
heartbeat keeps a slot on a quiet table from drifting toward the same cap unnoticed. A new
consumer needs the table's state and then every change after it without a gap or an overlap,
choosable as a plain snapshot-then-stream or a lock-free, interleaved watermark design. Deletes
and schema change are each applied on purpose, never guessed at. And a stalled compaction job
stalls the merge, which stalls slot consumption, which grows the source's own log — the
interaction this design itself creates.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Logical decoding, replication slots and the write-ahead log
(Chapter 5), the Debezium and Kafka Connect mechanics (Chapter 8 §8.2), and table-format
merge-on-read internals (Chapter 6) are each named only as a choice pointing to its home
chapter — this topic doesn't re-derive their mechanics. The exactly-once argument itself belongs
to Chapter 14.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The replication-slot WAL-growth simulation, with
and without a cap and a heartbeat, and the merge-throughput estimate, are this topic's
executable evidence. `examples.py`'s own lab: `retained_wal()` and `hours_until_cap()` compute
the growth and the time remaining; `slot_invalidated()` checks the cap; `heartbeat_closes_quiet_gap()`
shows the quiet-table fix; `merge_throughput_cost()` sizes the merge; `compaction_backlog()` and
`slot_growth_with_stalled_compaction()` show the new interaction a stalled compaction creates.

</section>

<section data-section="production">

## Production failures this topic warns about

**An unbounded slot behind a stopped connector.** A connector paused for maintenance and never
restarted lets its replication slot retain log indefinitely; without a cap, the source database's
own disk is what eventually pays for it.

**A stalled compaction job quietly growing the source's log.** Small files pile up on a
merge-on-read table until compaction can't keep up, the merge job itself slows, and the
replication slot it depends on grows right along with it — an interaction this design creates
that none of its individual pieces would predict alone.

</section>

<section data-section="frontier">

## Frontier

None claimed. Log-based CDC and watermark-based incremental snapshots are established practice —
Debezium ships both — not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Several writers now touch the same lakehouse table: the CDC merge, a backfill, a compaction job,
a schema migration. The table format's optimistic commits will serialise them, and sometimes
reject them. The next design is a lakehouse with concurrent writers and time travel.

</section>
