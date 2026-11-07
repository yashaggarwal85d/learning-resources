<section data-section="outcomes">

## What this topic leaves you able to do

State the merge law for HyperLogLog, a quantile sketch and a Bloom filter, and say which of those
three merges exactly and which only within a stated error; explain why summing per-partition
distinct-count estimates and averaging per-partition medians are both wrong, even when every
partition's own number is exact; name where, in a map-combine-shuffle-merge aggregate, a sketch
travels, and what it costs in bytes per partition.

</section>

<section data-section="internals">

## Into the internals

### Why HyperLogLog's merge is exact and a quantile sketch's is not

A HyperLogLog register holds the longest run of leading zeros any hashed value has produced at that
register's index. Merging two partitions' registers by taking the maximum at each index gives
exactly the registers a single pass over the union of both partitions would have produced, because
"the longest run seen anywhere in the union" is the same number whichever order the two partitions
are combined in or whether they are combined at all. A quantile sketch keeps a bounded sample or
summary, not every value, so its merge can only approximate what a full sort would answer within
the sketch's own stated error bound; `examples.py` measures both properties directly rather than
asserting them from a citation.

### The sketch as a value, not just an algorithm

BigQuery's `HLL_COUNT.INIT`, `.MERGE`, `.MERGE_PARTIAL` and `.EXTRACT` functions treat a sketch as
an ordinary `BYTES` column: it can be stored, rolled up, unioned later, and only turned into a
number at the end, which is why a rollup table can keep the sketch itself rather than a single
precomputed count.

</section>

<section data-section="lab">

## The lab

`examples.py`'s eight-partition stream is the thing to change by hand: a different partition-size
skew, a different number of registers for the HyperLogLog sketch, or a different reservoir sample
size changes how close the merged estimate lands to the exact answer, and by how much the naive
shortcuts (summing distinct-count estimates, averaging medians) miss.

</section>

<section data-section="production">

## In production

Spark's `RangePartitioner` uses the same reservoir-sampling-and-weighting machinery this topic
measures for an ordinary aggregate, but for a different purpose: choosing partition boundaries
before a sort or a range-partitioned join, so that the output partitions come out roughly balanced
without ever sorting the whole dataset first.

</section>

<section data-section="frontier">

## At the frontier

No source read at planning or research time states which real product uses t-digest or DDSketch
internally for approximate quantiles; this topic makes no such claim. A reader who wants that
specific answer should read a named product's own documentation or source directly.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes the chapter's eight crossings: a hash table that spills, a sort that spills, a heap
that merges, a queue that schedules, a union–find that clusters, a tree that indexes, a ring that
places, a sketch that merges. Each was a textbook structure with one constraint added. Reading them
is half of the skill; the other half is writing one that is right and fast. The next chapter turns
from reading to practice: building each structure once, proving it correct, testing it, and
explaining it under a clock. Implement once from scratch, next.

</section>
