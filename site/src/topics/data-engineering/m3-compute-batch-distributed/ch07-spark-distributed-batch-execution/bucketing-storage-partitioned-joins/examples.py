"""de.bucketing-storage-partitioned-joins — measured against real PySpark 4.0.1, local[4], Java 21.

Two claims, both read straight from a real physical plan's own text:
1. Two tables written bucketed by the same key, with the SAME bucket count, join with zero
   Exchange — the scan itself is tagged as a bucketed read.
2. The identical join against a table bucketed with a DIFFERENT bucket count pays for a real
   Exchange — and the scan on the matching-bucket-count side is *also* tagged bucketing disabled,
   not merely "not applicable this time."

Run: PYSPARK_PYTHON=/tmp/pyspark-venv/bin/python PYSPARK_DRIVER_PYTHON=/tmp/pyspark-venv/bin/python \
     /tmp/pyspark-venv/bin/python examples.py
"""

import shutil

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.bucketing-storage-partitioned-joins")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "4")
    .config("spark.sql.autoBroadcastJoinThreshold", "-1")  # force a real join strategy, never a broadcast
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")

warehouse = "/tmp/de-bucketing-storage-partitioned-joins-warehouse"
shutil.rmtree(warehouse, ignore_errors=True)

left = spark.range(0, 2000).withColumnRenamed("id", "k").selectExpr("k", "k * 2 as v")
right = spark.range(0, 2000).withColumnRenamed("id", "k").selectExpr("k", "k * 3 as w")

# Both tables written bucketed by the join key, 4 buckets each.
(left.write.format("parquet").mode("overwrite").bucketBy(4, "k").sortBy("k").saveAsTable("left4", path=f"{warehouse}/left4"))
(right.write.format("parquet").mode("overwrite").bucketBy(4, "k").sortBy("k").saveAsTable("right4", path=f"{warehouse}/right4"))
# The same right-hand data, written again with a DIFFERENT bucket count.
(right.write.format("parquet").mode("overwrite").bucketBy(6, "k").sortBy("k").saveAsTable("right6", path=f"{warehouse}/right6"))

left4 = spark.table("left4")
right4 = spark.table("right4")
right6 = spark.table("right6")

# --- Claim 1: matching bucket counts join with zero Exchange ---------------------------------
matched_plan = left4.join(right4, "k")._jdf.queryExecution().executedPlan().toString()

assert matched_plan.count("Exchange") == 0, f"expected 0 Exchange with matching buckets, got plan:\n{matched_plan}"
assert matched_plan.count("Bucketed: true") == 2, f"expected both sides tagged Bucketed: true:\n{matched_plan}"
print("Matched buckets (4 vs 4): 0 Exchange, both scans tagged Bucketed: true.")

# --- Claim 2: a mismatched bucket count on the OTHER table forces a real shuffle, and disables
#     bucketed reading on the side that still matches on its own ----------------------------
mismatched_plan = left4.join(right6, "k")._jdf.queryExecution().executedPlan().toString()

assert mismatched_plan.count("Exchange") == 1, f"expected exactly 1 Exchange with mismatched buckets, got plan:\n{mismatched_plan}"
assert "Bucketed: false (disabled by query planner)" in mismatched_plan, f"expected left4's own scan to show bucketing disabled:\n{mismatched_plan}"
print("Mismatched buckets (4 vs 6): 1 real Exchange, and left4's own scan — still 4 buckets on its own — shows bucketing disabled by the planner.")

spark.stop()
