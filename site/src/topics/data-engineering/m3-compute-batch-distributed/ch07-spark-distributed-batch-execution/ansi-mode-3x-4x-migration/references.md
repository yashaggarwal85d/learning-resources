Last verified: 1 November 2026. Both measured claims -- integer overflow and a malformed cast
each raising under ANSI mode and returning a wrapped value or NULL with it off, and the
independent store-assignment policy raising on insert under ANSI versus silently converting
under LEGACY -- are measured directly against real SQL run through a local Apache Spark 4.0.1
(PySpark) session.

- Apache Spark documentation, "ANSI Compliance": [spark.apache.org](https://spark.apache.org/docs/4.0.0/sql-ref-ansi-compliance.html).
- Apache Spark documentation, "Migration Guide: SQL, Datasets and DataFrame": [spark.apache.org](https://spark.apache.org/docs/4.0.0/sql-migration-guide.html).
- Apache Spark, "Spark Release 4.0.0": [spark.apache.org](https://spark.apache.org/releases/spark-release-4-0-0.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=ansi-mode-3x-4x-migration:%20).
