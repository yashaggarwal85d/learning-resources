## Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets"

URL: https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 'Structured Streaming Programming Guide' (basic
concepts, triggers)". As of Spark 4.0.0, that single guide was split into smaller pages; the
top-level URL now only redirects. The triggers content (and the surrounding basic concepts)
live on this sub-page instead, substituted here.

> If no trigger setting is explicitly specified, then by default, the query will be
executed in micro-batch mode, where micro-batches will be generated as soon as
the previous micro-batch has completed processing.

> The query will be executed with micro-batches mode, where micro-batches will be kicked off
at the user-specified intervals.

> Note that this trigger is deprecated and users are encouraged to migrate to Available-now micro-batch,
as it provides the better guarantee of processing, fine-grained scale of batches, and better gradual processing
of watermark advancement including no-data batch.

> This trigger provides a strong guarantee of processing: regardless of how many batches were
left over in previous run, it ensures all available data at the time of execution gets
processed before termination. All uncommitted batches will be processed first.

## Apache Spark source (GitHub), `MicroBatchExecution.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/MicroBatchExecution.scala
Version: tag v4.0.0

> Called at the start of the micro batch with given offsets. It takes care of offset
checkpointing to offset log and any microbatch startup tasks.

> Called after the microbatch has completed execution. It takes care of committing the offset
to commit log and other bookkeeping.

> Request unprocessed data from all sources.
