<section data-section="outcomes">

## Outcomes

This topic runs real ClickHouse MergeTree mechanics via chdb (an embedded real ClickHouse
engine, no Docker daemon or server process needed): two separate INSERTs creating two real
immutable parts, a real `OPTIMIZE TABLE` merge collapsing them, a real `EXPLAIN indexes=1`
trace showing the sparse primary index pruning granules, a real minmax data-skipping index
pruning granules on a non-sorted column, a real materialized view firing as an insert
trigger, ReplacingMergeTree's real before/after-merge row counts, and a real lightweight
`DELETE` mutation.

</section>

<section data-section="deep-dive">

## Deep-dive

The sparse primary index and the minmax skip index solve the same problem -- avoid reading
granules that can't match -- from two different angles: the primary index is free (it's
just the sort order) but only helps the columns the table is sorted by; a skip index costs
disk space and write time but can cover any column at all. This chapter's own topic 7
(Parquet's page-level statistics) is the same idea again, in a completely different file
format, which is exactly why topic 7 is a listed prerequisite here.

</section>

<section data-section="production">

## Production

ReplacingMergeTree's own docs are explicit that deduplication is eventual, not guaranteed:
"it does not guarantee the absence of duplicates." Production systems that need a correct
answer, not just an eventually-correct one, pair it with the `FINAL` operator at query
time -- the docs call this out directly, and this topic's own ReplacingMergeTree demo shows
exactly the gap `FINAL` exists to close (two visible versions before a merge ever runs).

</section>

<section data-section="frontier">

## Frontier

This topic's own real materialized view trigger and AggregatingMergeTree target are the
same mechanism ClickHouse Cloud's managed services lean on for real-time rollups at scale --
nothing about the mechanism itself changes between this sandbox's chdb session and a
production cluster; what changes is the data volume and the replication layer underneath.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A dedicated server process, however fast, is still a second system to run and operate. The
next engine shows the opposite extreme: no server process at all. DuckDB, next.

</section>
