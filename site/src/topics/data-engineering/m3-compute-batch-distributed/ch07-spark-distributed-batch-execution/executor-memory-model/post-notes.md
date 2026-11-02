<section data-section="outcomes">

## Drawing the memory bar from a config alone

Three numbers are all it takes: the heap size, `spark.memory.fraction`, and
`spark.memory.storageFraction`. Subtract the fixed 300MB reserved region from the heap first,
multiply by `memory.fraction` for the unified pool's own size, then split that pool by
`storageFraction` to find the protected storage floor — everything above that floor, on either
side, is fair game for the other side to borrow, and everything below the storage floor is
safe from eviction no matter how much execution pressure arrives.

</section>

<section data-section="The sourced-only half: user memory, reserved memory, and off-heap">

## User memory, reserved memory, and off-heap

The unified pool isn't the whole heap. Above it sits user memory — Spark-internal metadata
and any large objects a UDF or driver-side code allocates directly, entirely outside the
unified manager's own accounting. Below the pool sits the fixed 300MB reserved region, carved
out specifically so small heaps aren't starved. And the whole picture can move off the JVM
heap altogether with `spark.memory.offHeap.enabled`, sizing the pool from
`spark.memory.offHeap.size` instead of the executor's heap at all. All three are named and
sourced here, not independently measured, since this topic's own worked examples operate
entirely inside the default on-heap unified pool.

</section>

<section data-section="production failures">

## When this doesn't save you

Raising `spark.executor.memory` to fix a heap `OutOfMemoryError` can make a container-level
kill worse, not better, if `memoryOverhead` isn't raised to match — the container's real
ceiling is the sum of both, and a bigger heap with the same overhead budget just means less
room left for everything the heap doesn't track (off-heap buffers, Python workers, native
libraries). And a Python UDF that leaks memory produces a container-level symptom, never a
JVM heap OOM at all, since that memory never touches the heap the unified manager watches.

</section>

<section data-section="frontier">

## Where this goes next

The model says where memory lives and who can borrow from whom. The next topic is the first
thing that actually happens the instant execution memory runs out and can't borrow enough:
spill, writing sorted runs to disk mid-task rather than failing outright.

</section>
