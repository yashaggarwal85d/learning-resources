# Fact-check — Streaming into the lakehouse

| Claim | Source | Status |
|---|---|---|
| Tableflow materializes Apache Kafka topics as Apache Iceberg or Delta Lake tables, automating schematization, type conversions, schema evolution, CDC stream materialization, and catalog publishing | Confluent, current docs | Confirmed, quoted verbatim |
| Tableflow transforms incoming Kafka data in Avro, JSON Schema, and Protobuf formats into structured Parquet files, which are then materialized as Iceberg or Delta Lake tables | Confluent, current docs | Confirmed, quoted verbatim |
| Tableflow leverages Confluent Cloud Schema Registry as the source of truth for defining table schemas | Confluent, current docs | Confirmed, quoted verbatim |
| Enabling the Iceberg integration for a Redpanda topic makes Redpanda brokers store streaming data in Iceberg-compatible Parquet files in object storage, in addition to Tiered Storage log segments | Redpanda Streaming, current docs | Confirmed, quoted verbatim |
| Creating an Iceberg table for a Redpanda topic requires setting the cluster property iceberg_enabled and the topic property redpanda.iceberg.mode | Redpanda Streaming, current docs | Confirmed, quoted verbatim |
| The Flink Iceberg sink guarantees exactly-once semantics | Apache Iceberg, latest docs | Confirmed, quoted verbatim |
| Iceberg supports UPSERT based on the primary key when writing data into v2 table format | Apache Iceberg, latest docs | Confirmed, quoted verbatim |
| The Iceberg commit interval is expected to equal the stream processor's checkpoint interval (e.g. a 5-minute checkpoint interval implies a 5-minute expected commit interval) | Apache Iceberg, latest docs | Confirmed, quoted verbatim |
| A Paimon primary-key table maintains one logical row per key, with inserts/updates/removes resolved by its merge engine | Apache Paimon, master docs | Confirmed, quoted verbatim |
| Paimon stores primary-key data in an LSM tree: writers buffer records, sort them, flush new files, and compaction merges files to reduce future read work | Apache Paimon, master docs | Confirmed, quoted verbatim |
| Apache Fluss is an open-source, lakehouse-native streaming storage system for real-time analytics and AI | Apache Fluss docs, version 1.0 | Confirmed, quoted verbatim |
| Fluss integrates with Apache Flink and Apache Spark, supporting streaming reads and writes with sub-second latency | Apache Fluss docs, version 1.0 | Confirmed, quoted verbatim |
| Halving a toy writer's commit interval, on fixed total volume, doubles its file count and halves its average staleness | Modeled and measured directly in `examples.py` (`commit_cadence_file_count`) | Confirmed by the toy model's own real run |
| Running the identical commit cadence through an LSM-style compaction buffer lands a fraction of the files an uncompacted writer would leave | Modeled and measured directly in `examples.py` (`lsm_buffered_file_count`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the Flink/Delta sink claim overstated, given the open-source delta-io/connectors
  repository is marked deprecated?** This topic names Flink/Spark sinks to "Iceberg/Delta/Paimon"
  as a group per CHAPTER.md's own scope, with Iceberg's own Flink sink (actively maintained,
  exactly-once) as the primary, best-sourced example quoted directly; Delta's Flink connector
  status is disclosed in this fact-check rather than asserted as equally current, and the reel
  itself names Iceberg/Delta/Paimon together without claiming parity of maturity.
- **Does "commit frequency vs small files vs freshness" actually reduce to one source quote, or
  is it this topic's own inference?** The Iceberg docs directly tie checkpoint interval to commit
  interval (quoted above); the file-count and staleness relationship itself is a direct,
  measured consequence demonstrated in `examples.py`, not asserted from a source that states the
  trade-off in the abstract — disclosed as the toy model's own real run, consistent with how prior
  chapter-9 topics handle a toy-measured claim.
- **Is Fluss's currency properly flagged, given it's one of the newest projects named in this
  chapter?** Yes — post-notes.md's Frontier section explicitly flags Fluss's maturity and
  Flink-integration breadth as a currency fact to reconfirm, per CHAPTER.md's own instruction to
  flag it.
- **Does the LSM-buffering toy model trivially assume its own conclusion?** It implements the
  sourced mechanism directly (buffer small files, merge a fixed batch of them on compaction) and
  measures only the property claimed: fewer files at the same commit cadence. Disclosed as a
  deliberately simplified toy model, not a port of Paimon's actual compaction scheduler.
- **Does naming both Confluent Tableflow and Redpanda's Iceberg topics as "automated" overstate
  how hands-off they are?** No — both sources confirm the topic-to-table conversion itself is
  automatic (schema handling, file writing, catalog publishing); this topic does not claim they
  require zero configuration, and the Redpanda quote shows real required setup (`iceberg_enabled`,
  `redpanda.iceberg.mode`).
