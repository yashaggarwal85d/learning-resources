"""de.shuffle-joins-sort-merge-hash — measured against real PySpark 4.0.1, local[4], Java 21.

Two claims, both read straight from a real physical plan's own text:
1. Two large tables, equi-joined with no hint, plan as a SortMergeJoin — and each side's own
   plan branch has a real Sort step directly above its shuffle Exchange.
2. The identical join, with a SHUFFLE_HASH hint on one side, plans as a ShuffledHashJoin instead
   — and NEITHER side has a Sort step anywhere in the plan, confirming the "no sort" half of the
   claim directly, not just the node's name.

Run: PYSPARK_PYTHON=/tmp/pyspark-venv/bin/python PYSPARK_DRIVER_PYTHON=/tmp/pyspark-venv/bin/python \
     /tmp/pyspark-venv/bin/python examples.py
"""

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.shuffle-joins-sort-merge-hash")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "4")
    .config("spark.sql.autoBroadcastJoinThreshold", "-1")  # force a real shuffle join, never a broadcast
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")

big = spark.range(0, 200000).withColumnRenamed("id", "k").selectExpr("k", "k * 2 as v")
big2 = spark.range(0, 200000).withColumnRenamed("id", "k").selectExpr("k", "k * 3 as w")

# --- Claim 1: the unhinted default for two large equi-joined tables is a sort-merge join -------
default_plan = big.join(big2, "k")._jdf.queryExecution().executedPlan().toString()

assert "SortMergeJoin" in default_plan, f"expected the planner's own default to be SortMergeJoin:\n{default_plan}"
assert "ShuffledHashJoin" not in default_plan, f"expected no ShuffledHashJoin without a hint:\n{default_plan}"
assert default_plan.count("Sort [") == 2, f"expected exactly 2 Sort nodes, one per side:\n{default_plan}"
print("Unhinted, two large tables: SortMergeJoin, with a real Sort step on each side.")

# --- Claim 2: a SHUFFLE_HASH hint on one side switches the strategy, and removes BOTH sorts ----
hinted_plan = big.hint("SHUFFLE_HASH").join(big2, "k")._jdf.queryExecution().executedPlan().toString()

assert "ShuffledHashJoin" in hinted_plan, f"expected the hint to switch the strategy to ShuffledHashJoin:\n{hinted_plan}"
assert "SortMergeJoin" not in hinted_plan, f"expected no SortMergeJoin once hinted:\n{hinted_plan}"
assert "Sort [" not in hinted_plan, f"expected zero Sort nodes anywhere, not just on the hinted side:\n{hinted_plan}"
print("SHUFFLE_HASH hint: ShuffledHashJoin, with zero Sort nodes anywhere in the plan.")

spark.stop()
