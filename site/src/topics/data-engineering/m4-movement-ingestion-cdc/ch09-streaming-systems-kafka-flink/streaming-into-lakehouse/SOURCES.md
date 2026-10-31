Sources fetched and quoted for `de.streaming-into-lakehouse`.

## Tableflow in Confluent Cloud (Confluent, current docs)

URL: https://docs.confluent.io/cloud/current/topics/tableflow/overview.html

> Tableflow is a Confluent Cloud feature that materializes Apache Kafka® topics as
> Apache Iceberg™ or Delta Lake tables. It eliminates custom data pipelines
> by automatically handling schematization, type conversions, schema
> evolution, CDC stream materialization, and catalog publishing.

> Tableflow seamlessly transforms incoming Kafka data, in Avro, JSON Schema, and
> Protobuf formats, into structured Parquet files, which are then materialized as
> Iceberg or Delta Lake tables.

> Tableflow leverages Confluent Cloud Schema Registry as the source of truth for defining
> table schemas, ensuring structured and consistent data representation in
> Iceberg and Delta Lake tables.

## About Iceberg Topics (Redpanda Streaming, current docs)

URL: https://docs.redpanda.com/current/manage/iceberg/about-iceberg-topics

> When you enable the Iceberg integration for a Redpanda topic, Redpanda brokers store streaming
> data in the Iceberg-compatible format in Parquet files in object storage, in addition to the
> log segments uploaded using Tiered Storage.

> To create an Iceberg table for a Redpanda topic, you must set the cluster configuration
> property iceberg_enabled to true, and also configure the topic property
> redpanda.iceberg.mode.

## Flink Writes (Apache Iceberg, latest docs)

URL: https://iceberg.apache.org/docs/latest/flink-writes/

> The Flink Iceberg sink guarantees exactly-once semantics.

> Iceberg supports UPSERT based on the primary key when writing data into v2 table format.

> If the checkpoint interval (and expected Iceberg commit interval) is 5 minutes, set up alert
> with rule like elapsedSecondsSinceLastSuccessfulCommit > 60 minutes to detect failed or
> missing Iceberg commits in the past hour.

## Primary-Key Table (Apache Paimon, master docs)

URL: https://paimon.apache.org/docs/master/primary-key-table/

> A primary-key table maintains one logical row per key. Incoming records can insert, update, or
> remove that row according to the table's merge engine.

> Paimon stores primary-key data in an LSM tree (log-structured merge-tree). Writers buffer
> records, sort them, and flush new files. Compaction merges files to reduce the work needed by
> future reads.

## Introduction (Apache Fluss, docs, version 1.0)

URL: https://fluss.apache.org/docs/

> Apache Fluss (German for "river," pronounced /flus/) is an open-source, lakehouse-native
> streaming storage system for real-time analytics and AI.

> Fluss integrates with Apache Flink and Apache Spark and supports streaming reads and writes
> with sub-second latency.
