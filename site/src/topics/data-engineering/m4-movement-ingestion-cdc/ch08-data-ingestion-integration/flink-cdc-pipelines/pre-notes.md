- **Flink job**: the running program a stream processor executes, built from a pipeline's
  source, transforms and sink, with its own checkpoints and failure recovery.
- **Checkpoint**: a periodic, consistent snapshot of a Flink job's own progress, including the
  source's log position, used to resume exactly where it left off after a failure.
- **Source operator**: the part of a Flink job that reads from outside the job — here, a
  database's own snapshot and log, read directly without Kafka in between.
- **YAML pipeline**: a Flink CDC job described declaratively, as `source`, `sink` and
  `pipeline` blocks in a YAML file, submitted to a cluster rather than coded by hand.
- **Schema evolution**: a sink's own policy for what to do when an upstream table's shape
  changes mid-stream, chosen from a small set of named modes.
- **Sink**: the destination a pipeline writes to — a lakehouse table, a warehouse, or another
  message system — configured as its own block in the same YAML file.
- **Parallelism**: how many parallel readers a source runs with at once, which for MySQL
  decides how wide the `server-id` range needs to be.
