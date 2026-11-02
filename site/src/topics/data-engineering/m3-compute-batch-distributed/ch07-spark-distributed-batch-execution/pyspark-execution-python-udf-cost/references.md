Last verified: 31 October 2026. The three-way timing gap (built-in expression, Arrow pandas UDF,
pickled Python UDF) is measured directly (`examples.py`) against a real local Apache Spark 4.0.1
(PySpark) session, median of three repeated runs each. The pickled path's own per-row pickling
mechanism and the Arrow path's own batch-at-a-time transfer are sourced and quoted from Spark's
own source.

- Apache Spark source (GitHub), `BatchEvalPythonExec.scala`: [github.com](https://github.com/apache/spark/blob/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/python/BatchEvalPythonExec.scala) (tag v4.0.0).
- Apache Spark source (GitHub), `pandas/functions.py` (`pandas_udf` docstring): [github.com](https://github.com/apache/spark/blob/v4.0.0/python/pyspark/sql/pandas/functions.py) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=pyspark-execution-python-udf-cost:%20).
