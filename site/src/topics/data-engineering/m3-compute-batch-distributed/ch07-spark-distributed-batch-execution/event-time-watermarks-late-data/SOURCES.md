## Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets"

URL: https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 'Structured Streaming Programming Guide' (event
time and late data, watermarking section)". As of Spark 4.0.0, that single guide was split into
smaller pages; the event-time/watermarking section lives on this sub-page instead, substituted
here (the same substitution already used for the previous topic's trigger section).

> In this example, we are defining the watermark of the query on the value of the column "timestamp",
and also defining "10 minutes" as the threshold of how late is the data allowed to be.

> As shown in the illustration, the maximum event time tracked by the engine is the
blue dashed line, and the watermark set as (max event time - '10 mins')
at the beginning of every trigger is the red line.

> when the watermark is updated to 12:11, the intermediate
state for window (12:00 - 12:10) is cleared, and all subsequent data (e.g. (12:04, donkey))
is considered "too late" and therefore ignored.

> While executing the query, Structured Streaming individually tracks the maximum
event time seen in each input stream, calculates watermarks based on the corresponding delay,
and chooses a single global watermark with them to be used for stateful operations. By default,
the minimum is chosen as the global watermark

> Since Spark 2.4, you can set the multiple watermark policy to choose
the maximum value as the global watermark by setting the SQL configuration
spark.sql.streaming.multipleWatermarkPolicy to max (default is min).

## Apache Spark source (GitHub), `EventTimeWatermarkExec.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/EventTimeWatermarkExec.scala
Version: tag v4.0.0

> Based on the maximum observed time and a user specified delay, we can calculate the
`watermark` after which we assume we will no longer see late records for a particular time
period.

> If the child node emits rows which are older than global
watermark, the node will throw an query execution error and fail the user
query.
