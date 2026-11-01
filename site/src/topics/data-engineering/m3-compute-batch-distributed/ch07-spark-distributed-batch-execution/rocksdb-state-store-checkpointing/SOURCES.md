## Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets"

URL: https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 'Structured Streaming Programming Guide' (state
store, RocksDB state store configuration)" -- the same sub-page already substituted for every
prior topic in this section covers both named sections directly.

> The HDFS backend state store provider is the default implementation of [[StateStoreProvider]]
and [[StateStore]] in which all the data is stored in memory map in the first stage, and then
backed by files in an HDFS-compatible file system.

> If you have stateful operations in your streaming query (for example, streaming aggregation,
streaming dropDuplicates, stream-stream joins, mapGroupsWithState, or flatMapGroupsWithState)
and you want to maintain millions of keys in the state, then you may face issues related to
large JVM garbage collection (GC) pauses causing high variations in the micro-batch processing
times.

> Rather than keeping the state in the JVM memory, this solution
uses RocksDB to efficiently manage the state in the native memory and the local disk.

> Instead of uploading data files of RocksDB instances, changelog checkpointing uploads changes
made to the state since the last checkpoint for durability.

> Changelog checkpointing avoids cost of capturing and uploading snapshots of RocksDB instances
and significantly reduce streaming query latency.

> Changing the location of a state store provider requires the extra overhead of loading
checkpointed states.

## Apache Spark JIRA, "SPARK-49374: RocksDB State Store Checkpoint Structure V2"

URL: https://issues.apache.org/jira/browse/SPARK-49374
Version: fetched 2026-11-01, status Open/Unresolved, Affects Version/s 4.0.0

Note on source naming: CHAPTER.md names "Databricks engineering blog on RocksDB state store at
scale" as the second source; no such blog post describing "checkpoint structure v2" by that name
could be found. The Apache Spark JIRA epic that actually defines checkpoint structure v2 is
substituted here instead, documented in this note. This scope item is sourced-only: the epic is
still Open and Unresolved with no fix version, so it is not present to measure against in the
pinned Spark 4.0.1 used for every measured claim in this chapter.

> We expect the new checkpoint structure would be beneficial by establishing characteristics of
linear dependency between batch versions.

> The proposed checkpoint structure will ensure a linear dependency

> When a new state store checkpoint is generated, the checkpoint path name includes a globally
unique ID, so that it can never be updated.

> Furthermore, the complex checkpoint version lineage makes it hard to reduce overhead for old
version cleanup. Even a long running state store has to read metadata for all previous versions
and list all files to do any cleanup safely, which is expensive.
