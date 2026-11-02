## BatchEvalPythonExec.scala (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/python/BatchEvalPythonExec.scala
Version: v4.0.0 tag

> Input iterator to Python: input rows are grouped so we send them in batches to Python.

> For each row, add it to the queue.

Contents (item by item):
1. States directly what this topic's bridge text claims: a pickled Python UDF's rows are pickled and queued individually, row by row, even though they travel to the Python worker in network batches — the per-row cost this topic's own timing measures.

## pandas/functions.py — pandas_udf docstring (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/python/pyspark/sql/pandas/functions.py
Version: v4.0.0 tag

> Pandas UDFs are user defined functions that are executed by Spark using Arrow to transfer

> data and Pandas to work with the data, which allows vectorized operations.

Contents (item by item):
1. Names the Arrow-based fix directly: data crosses the JVM/Python boundary via Arrow, in whole vectorised batches, which is what lets a pandas UDF avoid the pickled path's one-row-at-a-time cost — the middle point of this topic's own three-way measurement.
