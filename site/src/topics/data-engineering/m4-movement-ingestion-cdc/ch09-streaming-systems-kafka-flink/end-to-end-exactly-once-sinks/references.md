Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy two-phase-commit sink, idempotent-upsert sink, and timeout-mismatch model,
no real Flink job available): a crash-and-recover run with zero loss and zero duplicates, a
retried upsert collapsing into one row, and a mismatched timeout losing every checkpoint's write
while a correctly configured one survives. The pre-commit/commit mechanics, the Cassandra
idempotent-exactly-once pattern, and the transaction-timeout failure mode are disclosed,
sourced-only claims from Flink's own current documentation, since no real Flink job runs in this
sandbox.

- `TwoPhaseCommitSinkFunction` (Apache Flink 1.20 API docs):
  [nightlies.apache.org/flink/flink-docs-release-1.20/.../TwoPhaseCommitSinkFunction.html](https://nightlies.apache.org/flink/flink-docs-release-1.20/api/java/org/apache/flink/streaming/api/functions/sink/TwoPhaseCommitSinkFunction.html).
  The pre-commit/commit split and recovery contract this topic's reveals cite.
- Fault Tolerance Guarantees (Apache Flink 1.20 connector docs):
  [nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/guarantees/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/guarantees/).
  Confirms end-to-end exactly-once requires the sink's participation, and names idempotent
  updates as a real alternate path to exactly-once (Cassandra).
- Kafka Connector (Apache Flink 1.20 docs):
  [nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/kafka/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/kafka/).
  The exactly-once Kafka sink's checkpoint-coupled commit, and the transaction-timeout-versus-
  checkpoint-interval failure mode, straight from Flink's own troubleshooting section.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=end-to-end-exactly-once-sinks:%20).
