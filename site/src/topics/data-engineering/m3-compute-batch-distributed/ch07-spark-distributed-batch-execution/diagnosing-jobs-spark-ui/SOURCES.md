## Apache Spark documentation, "Web UI"

URL: https://spark.apache.org/docs/4.0.0/web-ui.html
Version: 4.0.0

> GC time is the total JVM garbage collection time.

> Scheduler delay is the time the task waits to be scheduled for execution.

> Shuffle spill (memory) is the size of the deserialized form of the shuffled data in memory.

> Shuffle spill (disk) is the size of the serialized form of the data on disk.

> If the application executes Spark SQL queries, the SQL tab displays information, such as the duration,
jobs, and physical and logical plans for the queries.

> The query details page displays information about the query execution time, its duration,
the list of associated jobs, and the query execution DAG.

> The first block 'WholeStageCodegen (1)' compiles multiple operators ('LocalTableScan' and 'HashAggregate') together into a single Java
function to improve performance, and metrics like number of rows and spill size are listed in the block.

> The metrics of SQL operators are shown in the block of physical operators. The SQL metrics can be useful
when we want to dive into the execution details of each operator.

## Apache Spark documentation, "Monitoring and Instrumentation"

URL: https://spark.apache.org/docs/4.0.0/monitoring.html
Version: 4.0.0

> Note that this information is only available for the duration of the application by default.
To view the web UI after the fact, set spark.eventLog.enabled to true before starting the
application. This configures Spark to log Spark events that encode the information displayed
in the UI to persisted storage.

> It is still possible to construct the UI of an application through Spark's history server,
provided that the application's event logs exist.
