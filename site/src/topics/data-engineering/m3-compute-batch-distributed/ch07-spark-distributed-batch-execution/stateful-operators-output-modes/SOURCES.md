## Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets"

URL: https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 'Structured Streaming Programming Guide' (stream
time and late data, watermarking section)" was already split as of Spark 4.0.0 for prior topics;
this topic's own named sections (stream-stream joins, output modes) live on the same sub-page,
the same substitution already used for the previous two topics.

> Stream
Stream
Inner
Supported, optionally specify watermark on both sides +
time constraints for state cleanup

> As of Spark 2.4, you can use joins only when the query is in Append output mode. Other output
modes are not yet supported.

> Append mode (default) - This is the default mode, where only the
new rows added to the Result Table since the last trigger will be
outputted to the sink.

> Complete mode - The whole Result Table will be outputted to the sink after every trigger.
This is supported for aggregation queries.

> Update mode - (Available since Spark 2.1.1) Only the rows in the Result Table that were
updated since the last trigger will be outputted to the sink.

> Queries with joins
Append
Update and Complete mode not supported yet. See the

> Other aggregations
Complete, Update
Since no watermark is defined (only defined in other category),
old aggregation state is not dropped.
Append mode is not supported as aggregates can update thus violating the semantics of
this mode.

> you can deduplicate records in data streams using a unique identifier in the events, within
the time range of watermark.
For example, if you set the delay threshold of watermark as "1 hour", duplicated events which
occurred within 1 hour can be correctly deduplicated.

> This feature requires watermark with delay threshold to be set in streaming DataFrame/Dataset.

## Apache Spark source (GitHub), `StreamingSymmetricHashJoinExec.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/StreamingSymmetricHashJoinExec.scala
Version: tag v4.0.0

> Each join side buffers past input rows as streaming state so that the past input can be joined
with future input on the other side. This buffer state is effectively a multi-map:
equi-join key -> list of past input rows received with the join key

> If a timestamp column with event time watermark is present in the join keys or in the input
data, then it uses the watermark to figure out which rows in the buffer will not join with
the new data, and therefore can be discarded.

> @param eventTimeWatermarkForLateEvents Watermark for filtering late events, same for both sides
@param eventTimeWatermarkForEviction Watermark for state eviction
