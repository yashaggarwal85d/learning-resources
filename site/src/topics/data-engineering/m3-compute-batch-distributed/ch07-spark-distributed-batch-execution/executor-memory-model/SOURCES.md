# Sources: de.executor-memory-model

## Spark source, `UnifiedMemoryManager.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/memory/UnifiedMemoryManager.scala
Version: GitHub tag v4.0.0

> A [[MemoryManager]] that enforces a soft boundary between execution and storage such that

> either side can borrow memory from the other.

> The region shared between execution and storage is a fraction of (the total heap space - 300MB)

> configurable through `spark.memory.fraction` (default 0.6). The position of the boundary

> within this space is further determined by `spark.memory.storageFraction` (default 0.5).

> Storage can borrow as much execution memory as is free until execution reclaims its space.

> When this happens, cached blocks will be evicted from memory until sufficient borrowed

> memory is released to satisfy the execution memory request.

> Similarly, execution can borrow as much storage memory as is free. However, execution

> memory is *never* evicted by storage due to the complexities involved in implementing this.

> Set aside a fixed amount of memory for non-storage, non-execution purposes.

> This serves a function similar to `spark.memory.fraction`, but guarantees that we reserve

> sufficient memory for the system even for small heaps. E.g. if we have a 1GB JVM, then

> the memory used for execution and storage will be (1024 - 300) * 0.6 = 434MB by default.

### Contents (item by item):

1. The manager's own doc comment naming the central mechanism this topic measures: a soft
   boundary where either side can borrow from the other, with the unified pool's own size
   formula (`(heap - 300MB) * memory.fraction`) and the storage region's position within it
   (`storageFraction`).
2. The directional asymmetry this topic's two measured cases rely on: storage borrowing from
   execution can be evicted back; execution borrowing from storage never gets evicted by
   storage — only one direction of eviction exists at all.
3. The reserved-system-memory carve-out and its own worked example (1GB heap → 434MB usable
   pool), the exact arithmetic this topic's own measured pool size (`maxMemory` from the
   executors REST endpoint) is checked against.

## Spark configuration docs

URL: https://spark.apache.org/docs/4.0.0/configuration.html
Version: Spark 4.0.0 documentation

> Amount of non-heap memory to be allocated per driver process in cluster mode, in MiB unless
> otherwise specified. This is memory that accounts for things like VM overheads, interned strings,
> other native overheads, etc.

> Non-heap memory includes off-heap memory
> (when spark.memory.offHeap.enabled=true) and memory used by other driver processes
> (e.g. python process that goes with a PySpark driver) and memory used by other non-driver
> processes running in the same container. The maximum memory size of container to running
> driver is determined by the sum of spark.driver.memoryOverhead
> and spark.driver.memory.

### Contents (item by item):

4. `memoryOverhead`'s own scope — VM overhead, interned strings, native overheads, off-heap
   memory, and other co-located processes (a PySpark driver's own Python process) — none of
   which the JVM's own heap ever tracks.
5. The config doc's own statement of why a JVM heap OOM and a container OOM-kill need
   different fixes: a container's real memory ceiling is `memory + memoryOverhead` together,
   so a container kill can happen from overhead growth alone, with the JVM's own heap nowhere
   near its `-Xmx` limit — exactly what this topic's own measured container-kill case shows.
