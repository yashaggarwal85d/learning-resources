## Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets"

URL: https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 'Structured Streaming Programming Guide' (fault
tolerance semantics, foreachBatch)" -- the same sub-page already substituted for the three
prior topics in this section (4.0.0 split the guide apart) covers both named sections directly.

> In case of a failure or intentional shutdown, you can recover the previous progress and state
of a previous query, and continue where it left off. This is done using checkpointing and
write-ahead logs.

> There are limitations on what changes in a streaming query are allowed between restarts from
the same checkpoint location.

> Changes in the number or type (i.e. different source) of input sources: This is not allowed.

> Changes in the type of output sink: Changes between a few specific combinations of sinks
are allowed. This needs to be verified on a case-by-case basis.

> any changes (that is, additions, deletions, or schema modifications) to the stateful
operations of a streaming query are not allowed between restarts.

> By default, foreachBatch provides only at-least-once write guarantees. However, you can use the
batchId provided to the function as way to deduplicate the output and get an exactly-once
guarantee.

> File Sink
Append
Yes (exactly-once)

> Kafka Sink
Append, Update, Complete
Yes (at-least-once)

> Foreach Sink
Append, Update, Complete
None
Yes (at-least-once)

## Apache Spark release notes, "Spark Release 4.2.0"

URL: https://spark.apache.org/releases/spark-release-4-2-0.html
Version: 4.2.0

> [SPARK-54909] Enabling addition, removal and reordering of streaming sources:
DataStreamReader.name() and IDENTIFIED BY syntax to give streaming sources stable identifying
names, so sources can be added, removed, and reordered without breaking checkpoints

> [SPARK-56719] Add .name() to enable streaming sink naming, with a V3 commit log that persists
the sink name
