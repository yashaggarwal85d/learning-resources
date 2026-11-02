Last verified: 2 November 2026. Both delete files demonstrated on screen are real, written
against a real Apache Iceberg table built in this sandbox with the real `pyiceberg` library's
own low-level `DataFile`/`ManifestEntry` primitives — not a simulation. The position delete is
read back through pyiceberg's own public `table.scan()`. The equality delete hits a disclosed,
verified limitation in pyiceberg 0.12.0's own scan path (it refuses to read any table carrying
one, citing a real open upstream issue), so its merge is demonstrated by reading both files
directly, the way a conformant v2 reader performs it.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. Row-level delete formats: position and equality deletes.
- Apache Flink, "Flink Writes": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/flink-writes/). Fetched 2026-11-02. UPSERT mode and equality-delete production.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=position-equality-deletes:%20).
