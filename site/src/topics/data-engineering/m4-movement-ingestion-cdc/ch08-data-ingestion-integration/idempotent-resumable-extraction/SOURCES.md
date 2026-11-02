# Sources — de.idempotent-resumable-extraction

`CHAPTER.md` names Kafka Connect's own documentation on source offsets and the KIP-618 text
(used here only to show the same recipe at framework level, not quoted), the Spark Structured
Streaming guide's `foreachBatch` `batchId` idempotency note, and PostgreSQL's
`INSERT ... ON CONFLICT` documentation. This topic quotes two independent primary sources.

## Apache Spark docs: Structured Streaming Programming Guide (foreachBatch)

URL: https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html
Fetched: 2026-10-31.

Quotes:
> By default, foreachBatch provides only at-least-once write guarantees. However, you can use the batchId provided to the function as way to deduplicate the output and get an exactly-once guarantee.

Items: the exact recipe this topic's own `examples.py` reproduces directly — at-least-once
delivery (a redelivered or re-run batch) plus a write keyed on a deterministic batch id is what
turns at-least-once into an exactly-once *effect*.

## PostgreSQL docs: INSERT

URL: https://www.postgresql.org/docs/current/sql-insert.html
Fetched: 2026-10-31.

Quotes:
> ON CONFLICT can be used to specify an alternative action to raising a unique constraint or exclusion constraint violation error.

Items: the exact mechanism this topic's own idempotent, keyed write stands in for — a write that
can be re-applied to the same key without producing a second, duplicate row.
