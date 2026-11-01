Last verified: 1 November 2026. This topic has no lab of its own: every claim is quoted or
named directly from Flink CDC's own 3.7 documentation, since running a real Flink cluster
needs Flink itself, which this sandbox doesn't have. The lock-free, parallel, chunk-checkpointed
snapshot mechanism these docs describe is the same watermark idea topic 14 already measured
directly against this sandbox's own PostgreSQL cluster, generalised here to parallel readers.

- Flink CDC 3.7 docs, Welcome to Flink CDC: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/get-started/introduction/). JDK and Flink version requirements, and YAML submission via flink-cdc.sh.
- Flink CDC 3.7 docs, MySQL CDC Source: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/flink-sources/mysql-cdc/). Lock-free, parallel, chunk-checkpointed snapshot reading, and the server-id range.
- Flink CDC 3.7 docs, Postgres CDC Source: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/flink-sources/postgres-cdc/). Incremental snapshot reading marked experimental and off by default.
- Flink CDC 3.7 docs, Schema Evolution: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/core-concept/schema-evolution/). The five schema-change behaviors.
- Flink CDC 3.7 docs, Data Pipeline: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/core-concept/data-pipeline/). The full list of pipeline sinks, named only.
- Flink CDC 3.7 docs, Iceberg pipeline connector: [nightlies.apache.org](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/pipeline-connectors/iceberg/). Named only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=flink-cdc-pipelines:%20).
