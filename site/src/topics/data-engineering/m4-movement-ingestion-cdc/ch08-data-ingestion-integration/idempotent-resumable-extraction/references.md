Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
topic's own in-process mock warehouse: three crash orderings around a checkpoint and an output
write, a deterministic-versus-non-deterministic batch id each re-run twice against the identical
input, and a crash-injected batch re-run and diffed byte for byte against one clean run.

- Apache Spark docs, "Structured Streaming Programming Guide: foreachBatch": [spark.apache.org](https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html). The at-least-once-plus-batchId recipe this topic's own recipe generalizes.
- PostgreSQL docs, "INSERT": [www.postgresql.org](https://www.postgresql.org/docs/current/sql-insert.html). The ON CONFLICT mechanism this topic's own keyed, idempotent write stands in for.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=idempotent-resumable-extraction:%20).
