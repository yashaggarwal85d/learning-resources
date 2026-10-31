Last verified: 31 October 2026. The genuine spill, its memory-vs-disk contrast, the
per-task isolation to exactly the skewed task, and the weak effect of quadrupling memory are
all measured directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark)
session. External merge sort's own algorithmic mechanics are sourced and named only, per the
syllabus clause's own explicit cross-reference to *Data Structures & Algorithms* Chapter 6.

- Apache Spark source (GitHub), `UnsafeExternalSorter.java`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/java/org/apache/spark/util/collection/unsafe/sort/UnsafeExternalSorter.java) (tag v4.0.0).
- Apache Spark documentation, "Tuning Spark": [spark.apache.org](https://spark.apache.org/docs/4.0.0/tuning.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=spill-shuffle-memory-pressure:%20).
