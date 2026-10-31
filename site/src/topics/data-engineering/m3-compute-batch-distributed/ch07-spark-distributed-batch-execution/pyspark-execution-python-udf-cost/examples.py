"""de.pyspark-execution-python-udf-cost — the three-way timing gap the reel shows (built-in
expression vs. Arrow-based pandas UDF vs. pickled row-at-a-time Python UDF), measured against a
real local Apache Spark 4.0.1 (PySpark, local[4]) session doing the identical computation three
ways. Requires PYSPARK_PYTHON pointed at an interpreter with pandas and pyarrow installed, since
the Arrow UDF path crosses into a Python worker subprocess that needs them independently of the
driver.
"""
import statistics
import time

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, pandas_udf, udf
from pyspark.sql.types import LongType


def median_seconds(fn, repeats=3):
    times = []
    for _ in range(repeats):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    return statistics.median(times)


def main():
    spark = (
        SparkSession.builder.appName("de.pyspark-execution-python-udf-cost")
        .master("local[4]")
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )

    n = 3_000_000
    df = spark.range(0, n).withColumnRenamed("id", "a")

    # 1. Built-in expression: stays inside Catalyst/Tungsten end to end, no process boundary.
    t_builtin = median_seconds(
        lambda: df.select((col("a") * 2).alias("b")).agg({"b": "sum"}).collect()
    )

    # 2. Arrow-optimised path: a pandas UDF, operating on a whole batch of rows as a vector via
    # Arrow's columnar format, crossing the JVM/Python boundary once per batch, not once per row.
    @pandas_udf(LongType())
    def double_arrow(s):
        return s * 2

    t_arrow = median_seconds(
        lambda: df.select(double_arrow(col("a")).alias("b")).agg({"b": "sum"}).collect()
    )

    # 3. Pickled Python UDF: Catalyst cannot see inside it, so each row is pickled, sent across
    # the JVM/Python boundary one at a time, computed, and pickled back — the row-at-a-time cost
    # codegen's own fused loop never has to pay.
    @udf(LongType())
    def double_pickled(x):
        return x * 2

    t_pickled = median_seconds(
        lambda: df.select(double_pickled(col("a")).alias("b")).agg({"b": "sum"}).collect()
    )

    # Executed truth: the three-way ordering holds, and the gap from built-in to pickled is large
    # (several times slower), not a rounding difference. Thresholds are set well inside the margin
    # actually observed (builtin ~0.2s, arrow ~0.6-1.1s, pickled ~1.5-2.1s across repeated runs).
    assert t_builtin < t_arrow, (t_builtin, t_arrow)
    assert t_arrow < t_pickled, (t_arrow, t_pickled)
    assert t_arrow / t_builtin > 1.5, (t_arrow, t_builtin)
    assert t_pickled / t_arrow > 1.1, (t_pickled, t_arrow)
    assert t_pickled / t_builtin > 3, (t_pickled, t_builtin)

    print("built-in expression (s):", round(t_builtin, 3))
    print("Arrow pandas UDF (s):", round(t_arrow, 3))
    print("pickled Python UDF (s):", round(t_pickled, 3))
    print("pickled / built-in ratio:", round(t_pickled / t_builtin, 1))
    print("Arrow / built-in ratio:", round(t_arrow / t_builtin, 1))
    print("pickled / Arrow ratio:", round(t_pickled / t_arrow, 1))

    spark.stop()


if __name__ == "__main__":
    main()
