Last verified: 1 November 2026. Both measured claims -- VARIANT extraction running measurably
faster than repeated JSON-string extraction, and a struct cast silently nulling a value whose
type doesn't match its declared schema where VARIANT preserves it -- are measured directly
against real local DataFrames on Apache Spark 4.0.1 (PySpark). Shredding's own read/write
trade-off, GA only as of Spark 4.1, is sourced, not measured, since this chapter's examples are
pinned to 4.0.1.

- Apache Spark, "Spark Release 4.1.0": [spark.apache.org](https://spark.apache.org/releases/spark-release-4.1.0.html).
- Apache Spark documentation, "Spark SQL, Built-in Functions" (4.1.0): [spark.apache.org](https://spark.apache.org/docs/4.1.0/api/sql/index.html).
- Apache Spark source, `VariantUtil.java` (v4.1.0 tag): [github.com](https://github.com/apache/spark/blob/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/VariantUtil.java).
- Apache Spark source, `VariantShreddingWriter.java` (v4.1.0 tag): [github.com](https://github.com/apache/spark/blob/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/VariantShreddingWriter.java).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=variant-type-semi-structured:%20).
