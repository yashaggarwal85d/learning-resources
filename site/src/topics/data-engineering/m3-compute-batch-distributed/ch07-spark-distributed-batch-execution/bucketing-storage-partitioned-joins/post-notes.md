<section data-section="outcomes">

## Outcomes

Predict and confirm whether a join between two tables, both split by the join key at write time,
skips its shuffle entirely — and that a mismatched bucket count on either side withdraws that
shortcut from both, not just the side that changed.

</section>

<section data-section="internals">

## Storage-partitioned join's own SQL configs, the sourced-only half

Beyond the basic mechanism this topic measures, Spark's own SQL configs extend storage-partitioned
join further: `pushPartValues` eliminates a shuffle even when one side is missing some partition
values the other has; `allowJoinKeysSubsetOfPartitionKeys` allows a join on fewer columns than the
table's own full partitioning; `allowCompatibleTransforms` tolerates partition transforms that are
compatible but not byte-identical; `partiallyClusteredDistribution` handles a skewed big table by
clustering its splits partially and replicating the smaller side's matching splits. This topic's
own `examples.py` measures classic Hive bucketing at every config's default; these extensions are
named and quoted from Spark's own documentation, not independently exercised here.

</section>

<section data-section="production">

## Production failures this topic warns about

**Letting a bucketed table's bucket count drift between the job that wrote it and the job that
reads it.** A rewrite with a different bucket count — even one that still buckets the data by the
same key — silently reintroduces a full shuffle. Nothing fails; a job's wall time just quietly
regresses, and this topic's own measurement shows the loss hits the side that never changed too.

**Treating "bucketed" as a boolean rather than a precise agreement.** The bucket count, the column,
and (for a sort-merge join) the sort order all have to match. A table bucketed correctly by the
wrong column, or by the right column with a different count, gets no credit for being "mostly"
bucketed — Spark's own planner falls all the way back to a real shuffle.

</section>

<section data-section="frontier">

## Frontier

Bucket pruning, adjacent to this chapter's own static-pruning topic, skips whole bucket files by a
hash of a filter value rather than a directory name — a related but distinct, finer-grained
mechanism from both this topic's own join-shuffle elimination and the earlier topic's own
directory-level pruning. Named here, not built as its own topic in this chapter.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Bucketing avoids a shuffle by agreement at write time. The next three topics are about the shuffle
when it does happen — the actual join strategies and how Spark picks one.

</section>
