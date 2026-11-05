<section data-section="outcomes">

## What this topic leaves you able to do

Read a hash join's build, probe and spill behavior on a budget-limited instance and count rows
written to and read back from temporary files; explain why one hash value splits into
independent bucket and batch bits and why batch growth stops in exactly one case; compute a
runtime Bloom filter's false-positive rate from an engine's own default bits-per-item.

</section>

<section data-section="internals">

## Into the internals

### One hash value, two unrelated questions

`ExecHashGetBucketAndBatch` answers "which slot in this batch's table" and "which batch" from
the same 32-bit hash, using disjoint bit ranges: the low `log2(nbuckets)` bits for the bucket,
and a different window (reached by rotating the whole value right before masking) for the
batch. That only works because the hash function spreads bits uniformly across all 32 positions
— the avalanche property Chapter 3 named — otherwise the low bits and the rotated-and-masked
bits would be correlated and batches would come out uneven in a way this topic's own simulation
would have shown as skewed batch sizes even for a non-skewed key distribution.

### Partitioning is also a cache and TLB decision

Batching exists for memory, but the same split pays off one level down. A bucket array larger
than the cache, and larger than the reach of the translation lookaside buffer Chapter 1
measured, pays a miss on nearly every probe once the array no longer fits either. Cutting the
build side into batches small enough to sit in memory also, as a side effect, keeps each
batch's own bucket array small enough to spend most of its probes inside the cache rather than
walking out to main memory for each one — the identical idea as the batch split, one level
closer to the processor. Multi-pass radix partitioning that is explicitly sized to the cache and
the translation lookaside buffer's reach, rather than to a work-memory budget, is Chapter 31's
own topic and is not built again here.

### Why growth stops, not just slows

Doubling the batch count only helps when a batch splits roughly in half. If one key is common
enough that its tuples are the whole batch, splitting the batch again sends every one of them
to the same half again, forever. PostgreSQL's executor watches for exactly this (a batch that
"retained all or none of its tuples") and disables further batch growth globally rather than
spin on a split that cannot work — the skew table is the separate answer to that same problem,
giving the single worst keys a resident home that batching was never going to fix.

</section>

<section data-section="lab">

## The lab

`examples.py`'s own measurements are the lab: with the budget fixed at one twentieth of the
build side, the executor's doubling rule lands on 32 batches; about ninety-two percent of order
rows for this topic's skewed stream must be written to a temporary file; a four-row skew table
(two percent of the budget) still keeps roughly a sixth of all orders off disk, because the
busiest handful of customers really are that busy. None of these are properties of hash joins
in general — they are what this one instance, at this one budget, measured.

</section>

<section data-section="production">

## In production

Real executors complicate every piece of this: PostgreSQL also tracks actual used space, not
just row counts, and can choose to grow the in-memory table instead of doubling batches when
that costs less memory overall (`ExecHashIncreaseBatchSize`, read but not simulated here); Spark
chooses between a chained and an open-addressed probe-side structure depending on the key type;
and a runtime filter is only injected when the optimizer's own cost thresholds say it is worth
the shuffle it saves. This topic's row-count model leaves all of that cost accounting to the
real systems and keeps only the two structural facts that do not depend on it: the bucket/batch
split and the filter's size-versus-rate arithmetic.

</section>

<section data-section="frontier">

## At the frontier

Partitioned and hybrid hash joins (Grace, hybrid hash join) generalize what this topic's batch
splitting already does by hand: recursive partitioning until each piece fits, with one partition
kept resident throughout. That algorithm is Chapter 31's own topic, not yet live at the time
this topic was built; this topic names it as the general case its production executor is one
instance of, without building it again.

</section>

<section data-section="questions">

## Questions worth sitting with

If the hash function were not avalanching — say, its low bits were far less random than its
high bits — would the bucket/batch split in this topic still divide work independently, or
would some batches systematically get more of the small buckets than others? What would you
measure to find out?

</section>

<section data-section="next">

## Next

A hash join whose build side does not fit in memory is cut by hash into partitions, written to
temporary files, and joined one partition at a time. That is the hash path out of memory. The
other path is a sort: sorted runs written to disk and merged back, inside sorts, sort-merge
joins and aggregations alike. External merge sort inside spilling operators, next.

</section>
