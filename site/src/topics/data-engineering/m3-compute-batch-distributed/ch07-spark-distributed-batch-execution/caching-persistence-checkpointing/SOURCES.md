# Sources: de.caching-persistence-checkpointing

## Spark "RDD Programming Guide" (persistence section)

URL: https://spark.apache.org/docs/4.0.0/rdd-programming-guide.html
Version: Spark 4.0.0 documentation

> By default, each transformed RDD may be recomputed each time you run an action on it.
> However, you may also persist an RDD in memory using the persist (or cache) method, in
> which case Spark will keep the elements around on the cluster for much faster access the
> next time you query it.

> You can mark an RDD to be persisted using the persist() or cache() methods on it.

> In addition, each persisted RDD can be stored using a different storage level, allowing
> you, for example, to persist the dataset on disk, persist it in memory but as serialized
> Java objects (to save space),

> replicate it across nodes.

> The cache() method is a shorthand for using the default storage level,

> which is StorageLevel.MEMORY_ONLY (store deserialized objects in memory). The full set of

> MEMORY_ONLY

> Store RDD as deserialized Java objects in the JVM. If the RDD does not fit in memory, some partitions will

> not be cached and will be recomputed on the fly each time they're needed. This is the default level.

> MEMORY_AND_DISK

> Store RDD as deserialized Java objects in the JVM. If the RDD does not fit in memory, store the

> partitions that don't fit on disk, and read them from there when they're needed.

### Contents (item by item):

1. The default behavior without any persistence: every action on a transformed RDD may
   recompute it from scratch, and `persist`/`cache` exist specifically to keep elements around
   so the next action is faster — the exact contrast this topic's own claim 1 measures.
2. Storage levels as a deliberate, chosen trade-off (disk vs. memory, serialized vs. not,
   replicated or not), confirming `cache()` is one specific default choice among several.
3. `cache()`'s own default level, `MEMORY_ONLY` — the level used for claim 1 and the first half
   of claim 2.
4. `MEMORY_ONLY`'s own documented eviction behavior: partitions that don't fit are **not**
   cached and are **recomputed on the fly** the next time they're needed — the exact mechanism
   this topic's own claim 2 (MEMORY_ONLY branch) measures directly.
5. `MEMORY_AND_DISK`'s own documented eviction behavior: partitions that don't fit are written
   to disk and **read from there** instead of being recomputed — the exact contrast this
   topic's own claim 2 (MEMORY_AND_DISK branch) measures directly.

## Apache Spark source, `StorageLevel.scala` (GitHub, tag `v4.0.0`)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/common/utils/src/main/scala/org/apache/spark/storage/StorageLevel.scala
Version: GitHub tag v4.0.0

Note: this file moved out of the `core` module as of this tag — the obvious
`core/src/main/scala/...` path 404s; the real path is under `common/utils/src/main/scala/...`.

> class StorageLevel private(

> private var _useMemory: Boolean,

> private var _deserialized: Boolean,

> private var _replication: Int = 1)

### Contents (item by item):

6. The storage level's own representation confirms the RDD guide's description directly: a
   storage level is nothing but a bundle of independent flags (use memory, use disk,
   deserialized-or-not, replication count) — the documented levels (`MEMORY_ONLY`,
   `MEMORY_AND_DISK`, etc.) are just named combinations of these same four choices, not
   separate unrelated mechanisms.

## Apache Spark source, `ReliableCheckpointRDD.scala` (GitHub, tag `v4.0.0`)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/rdd/ReliableCheckpointRDD.scala
Version: GitHub tag v4.0.0

> An RDD that reads from checkpoint files previously written to reliable storage.

> Since the original RDD may belong to a prior application, there is no way to know a

### Contents (item by item):

7. A reliable checkpoint's own RDD carries no reference back to the RDD it was checkpointed
   from — it reads its partitions purely from files on reliable storage (confirmed directly by
   its own `getPartitions`, which lists the checkpoint directory rather than consulting any
   parent RDD's dependency list). This is the sourced basis for "checkpoint truncates lineage":
   the resulting RDD's own lineage *is* this file reader, not a chain back through the
   original computation — unlike `cache()`, which keeps the original computation's lineage
   intact underneath the cached data.
