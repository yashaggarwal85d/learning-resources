<section data-section="outcomes">

## Reading `PartitionFilters` and `Subqueries` as the check itself

A scan operator's own `PartitionFilters` line names `dynamicpruningexpression(...)` directly when
pruning is active; its absence, with everything else about the query unchanged, means one of the
two preconditions isn't met. The plan's own `===== Subqueries =====` section, present only when a
dynamic pruning filter exists, names the hosting operator and shows that filter's own scan,
independent of the join's main operator tree — reading both sections together is the entire
check, with no need to run the query and compare row counts by hand.

</section>

<section data-section="When DPP falls back to a subquery duplicate">

## When DPP falls back to a subquery duplicate

Broadcast reuse is the cheaper of the rule's two paths, but it isn't the only one.
`PlanDynamicPruningFilters.scala`'s own doc comment states both outcomes directly: when the join
itself is not planned as a broadcast hash join, the rule keeps "the fallback mechanism with
subquery duplicate" instead of reuse — the dimension-side filter still gets planned as a pruning
predicate, but it runs as a genuinely separate query rather than sharing any computation with the
join. This topic's own measured example only demonstrates the cheaper, broadcast-reuse case; the
plain fallback is sourced, not independently re-measured, since the mechanism it falls back to
(a duplicate scan, run once) is the literal baseline the broadcast-reuse path improves on.

</section>

<section data-section="production failures">

## When this doesn't save you

A fact table bucketed, but not partitioned, by the join column gets no pruning at all — the
pruning filter only ever targets partition metadata, never a bucket id, so bucketing and
partitioning are not interchangeable for this purpose. And the rule's own `onlyInBroadcast`
bailout can decide the dimension-side subquery costs more to run than the pruning could ever
save, falling back to a plain `true` literal (no pruning, no subquery) rather than running it
anyway — a dimension-side filter that itself requires a large, expensive scan can make pruning
not worth attempting at all, even when both the usual preconditions otherwise hold.

</section>

<section data-section="frontier">

## Where this goes next

Every topic in this section so far changed what gets read, shuffled, or joined on the way in.
The last topic of this section turns to the opposite end of the job entirely: what Spark
actually writes out once it's done, and why the same small-files problem that shows up on read
usually starts at write time.

</section>
