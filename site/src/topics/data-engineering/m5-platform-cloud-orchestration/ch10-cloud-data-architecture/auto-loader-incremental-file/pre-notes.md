# Pre-notes: Auto Loader incremental file ingestion

- **Directory listing.** Auto Loader's default discovery mode: sweep the input directory each trigger to find new files.
- **Event notification.** A discovery mode that subscribes to cloud storage notification/queue services instead of listing, Databricks' own recommended default for most workloads.
- **Checkpoint.** A durable, RocksDB-backed set of already-ingested file keys that gives exactly-once processing and lets a stream resume safely after a failure.
- **Schema evolution.** How Auto Loader reacts when a new column appears mid-stream; the mode set (`addNewColumns`, `rescue`, `failOnNewColumns`, `none`) controls that reaction.
- **Rescued-data column.** A dedicated column (`_rescued_data`) that captures data not matching the expected schema as a JSON blob, instead of dropping it.
- **`COPY INTO`.** A retryable, idempotent batch-load command that skips already-loaded files at the file level.
