<section data-section="outcomes">

## Choosing a storage level from a job's own numbers

A cheap, rarely-reused computation with a tight memory budget favors a plain memory-only
cache: eviction just means paying that small cost again, and the memory stays free for
everything else. An expensive, heavily-reused computation under the same tight budget favors
a disk-backed level instead: eviction becomes a disk read rather than redoing real work. This
topic's own `examples.py` measures exactly these two outcomes side by side, not just their
cost in the abstract.

</section>

<section data-section="checkpoint truncates lineage">

## Checkpoint truncates lineage

`cache()`/`persist()` keep an RDD's full lineage intact underneath the cached data — if a
cached partition is lost, Spark still knows how to rebuild it by replaying the original
computation. `checkpoint()` (reliable) and `localCheckpoint()` do the opposite: they replace
the RDD's own lineage outright with a read from storage, reliable or executor-local,
confirmed directly by `ReliableCheckpointRDD`'s own `getPartitions`, which lists files on
disk rather than consulting any parent RDD's dependencies at all. `localCheckpoint()` makes
the same trade faster, at the cost that losing the executor holding that local data loses the
checkpoint entirely — unlike a reliable checkpoint, which survives executor loss.

</section>

<section data-section="production failures">

## When this hurts instead of helping

Caching a DataFrame that's read exactly once steals real execution memory from the rest of
the job for a cache nothing ever reuses — the mirror image of this topic's own first claim,
where caching something genuinely reused many times is a clear win. Caching a plan built on a
non-deterministic UDF without realizing it can also silently freeze an unintended answer:
whichever values happened to come out on the first materialization become the permanent
answer for every later read, which is exactly the behavior this topic's own third claim
demonstrates directly.

</section>

<section data-section="frontier">

## Where this goes next

Caching and checkpointing are both about surviving across jobs: keeping data, or a shortcut
back to it, ready for later. The next topic is about surviving within one single job: the
JVM's own garbage collector, working underneath Spark's own memory accounting, and the pauses
it causes under the exact same kind of memory pressure this topic and the one before it both
measured.

</section>
