## Apache Iceberg, Maintenance

URL: https://iceberg.apache.org/docs/latest/maintenance/
Version: latest (fetched 2026-11-02)

> More data files leads to more metadata stored in manifest files, and small data files causes an unnecessary amount of metadata and less efficient queries from file open costs.

> Iceberg can compact data files in parallel using Spark with the rewriteDataFiles action. This will combine small files into larger files to reduce metadata overhead and runtime file open cost.

> The files metadata table is useful for inspecting data file sizes and determining when to compact partitions.

Contents: target-file-size-bytes is set via an option on the rewriteDataFiles action, shown in the
docs' own example as 500 MB (`500 * 1024 * 1024`), with no single recommended default given.

## Delta Lake, Optimizations

URL: https://docs.delta.io/latest/optimizations-oss.html
Version: latest (fetched 2026-11-02)

> Delta Lake can improve the speed of read queries from a table by coalescing small files into larger ones.

> Bin-packing optimization is idempotent, meaning that if it is run twice on the same dataset, the second run has no effect.

> Bin-packing aims to produce evenly-balanced data files with respect to their size on disk, but not necessarily number of tuples per file.

> Enable auto compaction. By default will use 128 MB as the target file size.

> Auto compaction is only triggered for partitions or tables that have at least a certain number of small files.

> You can control the output file size by setting the configuration spark.databricks.delta.autoCompact.maxFileSize.

## AWS, How Amazon S3 Tables use compaction to improve query performance by up to 3 times

URL: https://aws.amazon.com/blogs/storage/how-amazon-s3-tables-use-compaction-to-improve-query-performance-by-up-to-3-times/
Version: fetched 2026-11-02

> As the number of data files grows, it can adversely affect query performance for downstream applications reading these datasets. A dataset spread over multiple small Parquet files requires the query engine to make many small data reads per query, each with a fixed overhead.

> S3 Tables automatically perform compaction in addition to other maintenance tasks, such as snapshot management and unreferenced file removal.

> By default, each table is assigned a target file size of 512MB, but as workload requirements evolve, you can flexibly adjust this target size anywhere between 64MB and 512MB.

> the queries run against the 1MB Parquet objects of uncompacted tables required 8.5x more read requests compared to those run against the 512MB Parquet objects of tables in the table bucket.

> S3 Tables simplify this process by automatically performing compaction on tables stored in table buckets without any manual intervention.

## Databricks, Predictive optimization for Unity Catalog managed tables

URL: https://docs.databricks.com/en/optimizations/predictive-optimization.html
Version: fetched 2026-11-02

> Predictive optimization automatically runs OPTIMIZE, VACUUM, and ANALYZE on Unity Catalog managed tables (Delta Lake and Iceberg) on Databricks and refreshes their full-text search indexes, eliminating manual maintenance and time spent tracking performance issues.

> Predictive optimization is enabled by default for accounts created on or after November 11, 2024.

> Only Unity Catalog managed tables are supported.
