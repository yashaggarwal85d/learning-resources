## Databricks: What is Auto Loader?

URL: https://docs.databricks.com/en/ingestion/cloud-object-storage/auto-loader/index.html
Version: fetched 2026-10-31

> Auto Loader incrementally and efficiently processes new data files as they arrive in cloud storage without any additional setup.

> As files are discovered, their metadata is persisted in a scalable key-value store (RocksDB) in the checkpoint location of your Auto Loader pipeline. This key-value store ensures that data is processed exactly once.

> In case of failures, Auto Loader can resume from where it left off by information stored in the checkpoint location and continue to provide exactly-once guarantees when writing data into Delta Lake.

> The cost of discovering files with Auto Loader scales with the number of files that are being ingested instead of the number of directories that the files may land in.

## Databricks: Compare Auto Loader file detection modes

URL: https://docs.databricks.com/en/ingestion/cloud-object-storage/auto-loader/file-detection-modes.html
Version: fetched 2026-10-31

> Auto Loader uses directory listing mode by default. In directory listing mode, Auto Loader identifies new files by listing the input directory.

> File notification mode leverages file notification and queue services in your cloud infrastructure account. Auto Loader can automatically set up a notification service and queue service that subscribe to file events from the input directory.

> File notification mode with file events is more performant and scalable than directory listing. Databricks recommends file notification mode using file events instead of directory listing mode for most workloads.

> Auto Loader does not guarantee the order in which files are discovered or processed, regardless of file detection mode.

## Databricks: Configure schema inference and evolution in Auto Loader

URL: https://docs.databricks.com/en/ingestion/cloud-object-storage/auto-loader/schema.html
Version: fetched 2026-10-31

> Auto Loader can also "rescue" data that was unexpected (for example, of differing data types) in a JSON blob column, which you can choose to view later using the semi-structured data access APIs.

> addNewColumns (default)Stream fails with an UnknownFieldException after Auto Loader adds the new columns to the schema. Restarting the stream resumes processing with the updated schema.

> rescueAuto Loader never evolves the schema and the stream does not fail due to schema changes. Auto Loader records all new columns in the rescued data column.

> failOnNewColumnsStream fails and does not restart unless you update the provided schema or remove the offending data file.

> When Auto Loader infers the schema, Auto Loader automatically adds a rescued data column to your schema as _rescued_data.

> The rescued data column ensures that Auto Loader rescues columns that don't match the schema instead of dropping them.

> The rescued data column contains a JSON blob with the rescued columns and the source file path of the record.

## Databricks: COPY INTO

URL: https://docs.databricks.com/en/sql/language-manual/delta-copy-into.html
Version: fetched 2026-10-31

> Loads data from a file location into a Delta table. This is a retryable and idempotent operation. Files in the source location that have already been loaded are skipped. This is true even if the files have been modified since they were loaded.

> force: boolean, default false. If set to true, idempotency is disabled and files are loaded regardless of whether they've been loaded before.
