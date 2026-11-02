Last verified: 31 October 2026. Plan-text and generated-code facts (fused stage markers, UnsafeRow
writes, the columnar reader exception, forced fallback) are measured directly (`examples.py`)
against a real local Apache Spark 4.0.1 (PySpark) session, reached through the JVM gateway since
PySpark has no public wrapper for Scala's `debug.codegen()`. Codegen's purpose and the Volcano
model it replaced are sourced and quoted.

- Apache Spark source (GitHub), `WholeStageCodegenExec.scala`: [github.com](https://github.com/apache/spark/blob/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/WholeStageCodegenExec.scala) (tag v4.0.0).
- Databricks Engineering Blog, "Apache Spark as a Compiler: Joining a Billion Rows per Second on a Laptop": [databricks.com](https://www.databricks.com/blog/2016/05/23/apache-spark-as-a-compiler-joining-a-billion-rows-per-second-on-a-laptop.html) (fetched 2026-10-31).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=tungsten-whole-stage-codegen:%20).
