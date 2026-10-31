"""de.broadcast-hash-join — measured against real PySpark 4.0.1, local[4], Java 21.

Three claims, all read straight from a real physical plan's own text:
1. A small table joined to a large one, under the default broadcast threshold, produces a
   BroadcastExchange and a BroadcastHashJoin — no shuffle Exchange on either side.
2. The identical join with the broadcast threshold forced off falls back completely to a
   SortMergeJoin with two real shuffle Exchanges, one per side.
3. The identical small table, joined on a non-equi condition instead of equality, still
   broadcasts (no shuffle), but the matching mechanism itself changes from a hash join to a
   nested-loop join.

Run: PYSPARK_PYTHON=/tmp/pyspark-venv/bin/python PYSPARK_DRIVER_PYTHON=/tmp/pyspark-venv/bin/python \
     /tmp/pyspark-venv/bin/python examples.py
"""

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.broadcast-hash-join")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "4")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")

big = spark.range(0, 200000).withColumnRenamed("id", "k").selectExpr("k", "k * 2 as v")
small = spark.range(0, 500).withColumnRenamed("id", "k").selectExpr("k", "k * 3 as w")

# --- Claim 1: under the default threshold, the small side broadcasts, no shuffle at all --------
under_threshold_plan = big.join(small, "k")._jdf.queryExecution().executedPlan().toString()

assert "BroadcastExchange" in under_threshold_plan, f"expected a BroadcastExchange node:\n{under_threshold_plan}"
assert "BroadcastHashJoin" in under_threshold_plan, f"expected a BroadcastHashJoin node:\n{under_threshold_plan}"
assert "Exchange" not in under_threshold_plan.replace("BroadcastExchange", ""), f"expected no shuffle Exchange:\n{under_threshold_plan}"
print("Under the default threshold: BroadcastExchange + BroadcastHashJoin, zero shuffle Exchanges.")

# --- Claim 2: forcing the threshold off falls back completely to a shuffle join -----------------
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
threshold_off_plan = big.join(small, "k")._jdf.queryExecution().executedPlan().toString()
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "10485760")  # restore the default (10 MB)

assert "BroadcastExchange" not in threshold_off_plan, f"expected no broadcast once the threshold is off:\n{threshold_off_plan}"
assert "SortMergeJoin" in threshold_off_plan, f"expected a SortMergeJoin fallback:\n{threshold_off_plan}"
assert threshold_off_plan.count("Exchange") == 2, f"expected exactly 2 shuffle Exchanges, one per side:\n{threshold_off_plan}"
print("Threshold forced off: no broadcast at all, a real SortMergeJoin with 2 shuffle Exchanges.")

# --- Claim 3: a non-equi condition on the same small side still broadcasts, but as a nested loop -
non_equi_plan = big.join(small, big.k < small.k)._jdf.queryExecution().executedPlan().toString()

assert "BroadcastNestedLoopJoin" in non_equi_plan, f"expected a BroadcastNestedLoopJoin node:\n{non_equi_plan}"
assert "BroadcastHashJoin" not in non_equi_plan, f"expected no hash join once there's no equality to hash on:\n{non_equi_plan}"
assert "BroadcastExchange" in non_equi_plan, f"expected the small side to still broadcast:\n{non_equi_plan}"
print("Non-equi condition: still broadcasts (BroadcastExchange), but as a BroadcastNestedLoopJoin, not a hash join.")

spark.stop()
