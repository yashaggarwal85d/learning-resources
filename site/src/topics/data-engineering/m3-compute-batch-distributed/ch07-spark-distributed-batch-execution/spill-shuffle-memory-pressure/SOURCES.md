# Sources: de.spill-shuffle-memory-pressure

## Spark source, `UnsafeExternalSorter` (in `UnsafeExternalSorter.java`)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/java/org/apache/spark/util/collection/unsafe/sort/UnsafeExternalSorter.java
Version: GitHub tag v4.0.0

Note: CHAPTER.md names this source as `UnsafeExternalSorter.scala`. The real file at this tag
is Java, not Scala — `UnsafeExternalSorter.java`, same class, correct path substituted.

> Sort and spill the current records in response to memory pressure.

> Note that this is more-or-less going to be a multiple of the page size, so wasted space in

> pages will currently be counted as memory spilled even though that space isn't actually

> written to disk. This also counts the space needed to store the sorter's pointer array.

> taskContext.taskMetrics().incMemoryBytesSpilled(spillSize);

> taskContext.taskMetrics().incDiskBytesSpilled(writeMetrics.bytesWritten());

### Contents (item by item):

1. The method's own one-line purpose: sorting and spilling happens specifically "in response
   to memory pressure" — the exact trigger this topic's own measured sort-spill demonstrates.
2. The source's own direct explanation for why spill (memory) and spill (disk) are different
   numbers for the same spill event: the memory figure includes page-size rounding and pointer-
   array overhead never written to disk at all, not just compression — the mechanical reason
   behind this topic's own measured memory-vs-disk contrast.
3. The exact two counters this topic's own `examples.py` reads directly from the Spark UI's
   REST API (`memoryBytesSpilled`, `diskBytesSpilled`), traced to the literal call sites that
   increment them on a real spill.

## Spark "Tuning Spark" docs

URL: https://spark.apache.org/docs/4.0.0/tuning.html
Version: Spark 4.0.0 documentation

> Execution memory refers to that used for computation in shuffles, joins, sorts and
> aggregations, while storage memory refers to that used for caching and propagating internal
> data across the cluster.

> applications that do not use caching
> can use the entire space for execution, obviating unnecessary disk spills.

### Contents (item by item):

4. The docs' own definition of execution memory, naming exactly the operations this topic's
   syllabus clause covers (sorts and aggregations) as the two things that consume it and can
   therefore force a spill.
5. The direct link between available execution memory and avoided spill — matching this
   topic's own measured contrast between a task with room to spare (never spills) and one
   without (spills regardless of how much the overall pool grows).
