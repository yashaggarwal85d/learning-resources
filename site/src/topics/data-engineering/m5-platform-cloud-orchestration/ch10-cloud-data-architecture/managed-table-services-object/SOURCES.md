## AWS News Blog: New – Amazon S3 Tables – Storage Optimized for Analytics Workloads

URL: https://aws.amazon.com/blogs/aws/new-amazon-s3-tables-storage-optimized-for-analytics-workloads/
Version: by Jeff Barr, 03 DEC 2024

> S3 Tables integration with AWS Glue Data Catalog is in preview, allowing you to query and visualize data using AWS Analytics services such as Amazon Athena, Amazon Redshift, Amazon EMR, and Amazon QuickSight.

> Compaction – This process combines multiple small table objects into a larger object to improve query performance, in pursuit of a target file size that can be configured to be between 64 MiB and 512 MiB.

> Snapshot Management – This process expires and ultimately removes table snapshots, with configuration options for the minimum number of snapshots to retain and the maximum age of a snapshot to retain.

> Unreferenced File Removal – This process removes and deletes objects that are not referenced by any table snapshots.

> When compared to self-managed table storage, you can expect up to 3x faster query performance and up to 10x more transactions per second, along with the operational efficiency that is part-and-parcel when you use a fully managed service.

Contents: the launch date (December 3, 2024) and the three automatic maintenance operations named exactly — compaction, snapshot management and unreferenced-file removal — the core "maintenance as a service" claim this topic teaches first; the performance comparison against self-managed tables.

## AWS: Working with Amazon S3 Tables and table buckets

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables.html
Version: fetched 2026-10-31

> The data in S3 Tables is stored in a new bucket type: a table bucket, which stores tables as subresources. Table buckets support storing tables in the Apache Iceberg format.

> To optimize your tables for querying, S3 continuously performs automatic maintenance operations, such as compaction, snapshot management, and unreferenced file removal. These operations increase table performance by compacting smaller objects into fewer, larger files. Maintenance operations also reduce your storage costs by cleaning up unused objects.

Contents: the table bucket as a storage type purpose-built for Iceberg tables, distinct from a general-purpose S3 bucket; the current, standing documentation confirming the same three maintenance operations named at launch are still the current feature set.

## AWS: Working with Apache Iceberg V3

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/working-with-apache-iceberg-v3.html
Version: fetched 2026-10-31

> V3 is a one-way upgrade. Once a table is upgraded from V2 to V3, it cannot be downgraded back to V2 through standard operations.

> Before you upgrade, verify that every engine that reads or writes the table supports V3. Amazon Athena can't read V3 tables.

> Engine versions - Ensure all engines accessing the table support V3

Contents: the engine-skew risk named directly and concretely — upgrading a table's own spec version is irreversible, and AWS's own documentation states that one of its own query engines, Amazon Athena, cannot read the newer format at all, which is this topic's own worked example of a managed writer outrunning a reader.

## Google Cloud: BigQuery tables for Apache Iceberg

URL: https://docs.cloud.google.com/bigquery/docs/iceberg-tables
Version: fetched 2026-10-31

> Iceberg managed tables bring the convenience of BigQuery resource management to tables that reside in your own cloud buckets.

> Automatic compaction and clustering are performed on the data files in the bucket.

> After the expiration of the time travel window, data files are garbage collected.

Contents: BigQuery's own managed-Iceberg product named directly, with its own specific automation set (compaction, clustering, and garbage collection after the time-travel window) rather than an assumed-identical copy of AWS's three operations — the exact comparison this topic's outcome requires.

## Databricks: Unity Catalog managed tables

URL: https://docs.databricks.com/aws/tables/managed
Version: fetched 2026-10-31

> Unity Catalog manages all read, write, storage, and optimization responsibilities.

> Iceberg REST Catalog (IRC): Read, write, and create access for Apache Iceberg clients to managed tables using Apache Iceberg and read-only access to Delta Lake tables with Apache Iceberg reads enabled.

Contents: Unity Catalog's own managed-Iceberg-table product named directly, with a stronger external-access claim than AWS's own (read, write and create access for outside Iceberg clients, not read-only) — a real difference between vendors' "maintenance as a service" products, not a detail to flatten away.

## Snowflake: Manage Apache Iceberg tables

URL: https://docs.snowflake.com/user-guide/tables-iceberg-manage
Version: fetched 2026-10-31

> Table optimization automatically performs maintenance to improve the performance and reduce the storage costs of your Snowflake-managed Iceberg tables.

> Data compaction combines small files into larger, more efficient files to manage storage, maintain an optimal file size, and improve query

> Snowflake doesn't perform maintenance operations on externally managed Iceberg tables.

> You must use your own external Iceberg engine to perform maintenance operations such as:

Contents: Snowflake's own managed-vs-externally-managed distinction, stated directly — the same "maintenance as a service vs running your own jobs" trade-off this topic teaches, drawn as an explicit line inside one vendor's own product rather than only across vendors.

## AWS: Amazon S3 pricing

URL: https://aws.amazon.com/s3/pricing/
Version: fetched 2026-10-31

> With S3 Tables, you pay for storage, requests, and an object monitoring fee per object stored in table buckets.

> When compaction is enabled, you are charged for the number of objects and the bytes processed during compaction.

Contents: the per-request premium named exactly as its own billing line — an object monitoring fee and a compaction processing fee, both charged on top of ordinary storage and request pricing, distinct from topic 6's base four-dimension cost model.
