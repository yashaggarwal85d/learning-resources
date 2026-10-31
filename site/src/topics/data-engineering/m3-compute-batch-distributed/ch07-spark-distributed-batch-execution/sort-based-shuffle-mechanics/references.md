Last verified: 31 October 2026. Every file count and byte measurement is measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session.

- Apache Spark documentation, "RDD Programming Guide — Shuffle operations": [spark.apache.org](https://spark.apache.org/docs/latest/rdd-programming-guide.html#shuffle-operations). Map-side buffering/sorting into one file; reduce-side reads of sorted blocks (fetched at docs version 4.3.0; the mechanism is unchanged since 4.0).
- Apache Spark project, `IndexShuffleBlockResolver.scala` (GitHub, tag v4.0.0): [raw.githubusercontent.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/shuffle/IndexShuffleBlockResolver.scala). The one-data-file, one-index-file-per-map-task convention, quoted directly from source.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=sort-based-shuffle-mechanics:%20).
