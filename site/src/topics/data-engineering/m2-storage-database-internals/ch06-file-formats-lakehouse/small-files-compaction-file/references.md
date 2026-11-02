Last verified: 2 November 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real streaming
pattern of 200 small files, real measured manifest-byte and open-cost overhead, a real bin-pack
compaction verified byte for byte, and a real measured compression difference.

- Apache Iceberg, "Maintenance": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/maintenance/). Fetched 2026-11-02. Why small files cost real metadata and open overhead, and what `rewriteDataFiles` does about it.
- Delta Lake, "Optimizations": [docs.delta.io](https://docs.delta.io/latest/optimizations-oss.html). Fetched 2026-11-02. Bin-packing, its idempotence, and auto compaction's own target-file-size defaults.
- AWS, "How Amazon S3 Tables use compaction to improve query performance by up to 3 times": [aws.amazon.com](https://aws.amazon.com/blogs/storage/how-amazon-s3-tables-use-compaction-to-improve-query-performance-by-up-to-3-times/). Fetched 2026-11-02. The real request-overhead cost of small files, and S3 Tables' automatic, no-manual-intervention compaction.
- Databricks, "Predictive optimization for Unity Catalog managed tables": [docs.databricks.com](https://docs.databricks.com/en/optimizations/predictive-optimization.html). Fetched 2026-11-02. Automatically running `OPTIMIZE` so nobody has to schedule it themselves.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=small-files-compaction-file:%20).
