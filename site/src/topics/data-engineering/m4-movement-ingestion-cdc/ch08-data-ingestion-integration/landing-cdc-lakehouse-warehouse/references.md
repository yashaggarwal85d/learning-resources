Last verified: 1 November 2026. The real change stream, both landing strategies, the LSN-ordered
convergence proof, and the compaction-cost measurement (`examples.py`) are direct runs against
this sandbox's own real PostgreSQL 16 cluster and a real DuckDB database, with a real DuckDB
`MERGE INTO` statement standing in for a lakehouse's periodic MERGE since this sandbox has no
JVM and no real Iceberg or Paimon table format available. BigQuery's CDC ingestion and
Snowpipe Streaming's Named Channels are quoted from their own documentation rather than
reproduced, since neither warehouse is reachable from this sandbox.

- BigQuery docs, Change data capture: [docs.cloud.google.com](https://docs.cloud.google.com/bigquery/docs/change-data-capture). The _CHANGE_TYPE pseudocolumn, primary-key requirements, and max_staleness.
- Snowflake docs, Named Channels and exactly-once delivery: [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/snowpipe-streaming/snowpipe-streaming-channels). Offset tokens, ordered exactly-once ingestion, Kafka and CDC partitions.
- Snowflake docs, Snowpipe Streaming: [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/snowpipe-streaming/data-load-snowpipe-streaming-overview). The vendor's own ingest-to-queryable latency figure.
- Flink CDC docs, Iceberg pipeline connector: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/pipeline-connectors/iceberg/). Named only, re-used from topic 21.
- Debezium docs, JDBC sink connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/jdbc.html). Named only, re-used from topic 19.
- Airbyte docs, Incremental | Append + Deduped: [docs.airbyte.com](https://docs.airbyte.com/platform/using-airbyte/core-concepts/sync-modes/incremental-append-deduped). A vendor-managed contrast to this topic's own hand-built LSN tiebreak.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=landing-cdc-lakehouse-warehouse:%20).
