# Sources — de.flink-cdc-pipelines

This topic has no lab of its own: CHAPTER.md's own "Lab" line names it as sourced-only without
a running Flink cluster, with the lock-free chunked read already reproduced by topic 14's own
implementation. Every claim below is quoted or named from Flink CDC's own 3.7 documentation.

## Flink CDC docs: Welcome to Flink CDC (introduction)

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/get-started/introduction/
Fetched: 2026-11-01.

Quotes:
> JDK : JDK 11 or later (Flink CDC is built on JDK 11 since 3.6.0)

> Apache Flink : Flink 1.20.x or Flink 2.2.x

> By submitting the YAML file with flink-cdc.sh , a Flink job will be compiled

Items: the Java and Flink version requirements this topic states directly, and the YAML
submission mechanism this topic's own visual idea depicts.

## Flink CDC docs: MySQL CDC Source

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/flink-sources/mysql-cdc/
Fetched: 2026-11-01.

Quotes:
> (1) source can be parallel during snapshot reading, (2) source can perform checkpoints in the chunk granularity during snapshot reading, (3) source doesn't need to acquire global read lock (FLUSH TABLES WITH READ LOCK) before snapshot reading.

> If you would like the source run in parallel, each parallel reader should have an unique server id, so the 'server-id' must be a range like '5400-6400', and the range must be larger than the parallelism.

Items: the three lock-free, parallel, chunk-checkpointed properties this topic's own Reveal
states directly, and the per-reader `server-id` range requirement for MySQL.

## Flink CDC docs: Postgres CDC Source

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/flink-sources/postgres-cdc/
Fetched: 2026-11-01.

Quotes:
> Incremental Snapshot Reading (Experimental)

> -- experimental feature: incremental snapshot (default off) 'scan.incremental.snapshot.enabled' = 'true'

Items: confirms, as CHAPTER.md's own plan records, that incremental snapshot reading is marked
experimental and off by default for PostgreSQL specifically, unlike MySQL.

## Flink CDC docs: Schema Evolution

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/core-concept/schema-evolution/
Fetched: 2026-11-01.

Quotes:
> schema.change.behavior is of enum type, and could be set to exception , evolve , try_evolve , lenient or ignore .

> In this mode, all schema change behaviors are forbidden. An exception will be thrown from SchemaOperator once it was captured.

Items: the five schema-change behaviors (Exception, Evolve, TryEvolve, Lenient, Ignore) this
topic names directly against topic 16's manual handling.

## Flink CDC docs: Data Pipeline (core concept)

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/core-concept/data-pipeline/
Fetched: 2026-11-01.

Items: named only — confirms the full list of pipeline sinks (Paimon, Fluss, Kafka, Doris,
StarRocks, Elasticsearch, MaxCompute, OceanBase, Iceberg, Hudi) the page's own navigation
lists, matching CHAPTER.md's own sink list for this topic.

## Flink CDC docs: Iceberg pipeline connector

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/pipeline-connectors/iceberg/
Fetched: 2026-11-01.

Items: named only — the Iceberg sink CHAPTER.md's own Sources line names among the pipeline
connector pages read during planning.
