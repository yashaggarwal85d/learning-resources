<section data-section="outcomes">

## Outcomes

Size a shuffle-partition count for a given data volume and target task size. Predict, before
running it, whether a `repartition`/`coalesce` call introduces a shuffle, and what it does to
upstream parallelism if it doesn't.

</section>

<section data-section="internals">

## Input splits and target task size, the sourced-only half

`spark.sql.files.maxPartitionBytes` (128 MB by default) caps how many bytes of file data get
packed into one input partition; `spark.sql.files.openCostInBytes` (4 MB by default) pads each
file's own effective size upward, so a partition made of many small files isn't treated as free
just because the files themselves are small. `FilePartition.scala`'s own packing function takes
both as direct inputs to the identical decision. The syllabus's own ~100-200 MB per-task target
is a tuning guideline stated in the same docs, not a number this topic's own `examples.py`
independently measures a real task hitting — disclosed here as sourced, not measured.

</section>

<section data-section="production">

## Production failures this topic warns about

**Calling `coalesce(1)` to "just reduce the output files," and quietly serializing the whole job.**
This topic's own measurement shows a coalesce to one partition pulling the entire upstream read
into that same single task — a job that ran on eight parallel tasks now runs on one, often far
slower overall despite producing fewer output files.

**Assuming `repartition` and `coalesce` are interchangeable because both "reduce partitions."**
`coalesce` can shrink for free; `repartition` guarantees even sizes but always pays for a shuffle.
Reaching for `repartition` when `coalesce` would do costs an unnecessary shuffle; reaching for
`coalesce` when even sizes actually matter ships skewed partitions instead.

</section>

<section data-section="frontier">

## Frontier

AQE's own `coalescePartitions` feature automatically merges small shuffle partitions at runtime
toward a target size, entirely separate from calling `.coalesce()` by hand — disabled throughout
this topic's own `examples.py` specifically so the partition counts measured are Catalyst's own
up-front numbers, not ones AQE adjusted afterward.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Sizing says how many partitions, and how big. It says nothing about which partitioner decided
which row lands in which one — the next topic's own question.

</section>
