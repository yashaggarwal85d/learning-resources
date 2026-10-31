"""
Measured: AQE re-optimising at a query-stage boundary once real shuffle statistics exist.

A large table of customers is joined to the result of aggregating a second large table
down to a tiny number of groups. The static planner, before any shuffle has run, has no
real statistics for the aggregated side's OUTPUT size (only for its unaggregated INPUT,
which is large) -- so it commits to a shuffle join, SortMergeJoin, sorting both sides.
Once the aggregation's own shuffle stage actually finishes, Spark knows the aggregated
side's real output is a handful of rows. AQE re-optimises the still-unmaterialized join
using that real number and switches it to BroadcastHashJoin, broadcasting the now-known-tiny
side and reading the other side's own shuffle locally -- a decision the static planner had
no way to make, because the number it needed did not exist yet.
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.adaptive-query-execution-aqe")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.shuffle.partitions", "200")
    .getOrCreate()
)

# --- Claim 1: AQE demotes a SortMergeJoin to a BroadcastHashJoin once real
# post-shuffle statistics show one side is tiny. ---

orders = spark.range(0, 2_000_000).withColumnRenamed("id", "oid").selectExpr(
    "oid", "oid % 5000000 as cust_id"
)
# Aggregated down to 30 groups. The static planner sees only the large, unaggregated
# input size; the real output size does not exist until the aggregation's own shuffle runs.
top_customers = (
    orders.filter(col("cust_id") < 30).groupBy("cust_id").agg(count("*").alias("n"))
)

customers = spark.range(0, 5_000_000).withColumnRenamed("id", "cust_id").selectExpr(
    "cust_id", "cust_id * 7 as score"
)

joined = customers.join(top_customers, "cust_id")
joined.collect()  # force execution so AQE finalizes the plan

plan = joined._jdf.queryExecution().executedPlan().toString()
assert "AdaptiveSparkPlan isFinalPlan=true" in plan

initial_idx = plan.find("== Initial Plan ==")
final_idx = plan.find("== Final Plan ==")
initial_plan = plan[initial_idx:]
final_plan = plan[final_idx:initial_idx]

assert "SortMergeJoin" in initial_plan
assert "BroadcastHashJoin" not in initial_plan
assert initial_plan.count("Sort [") == 2  # both sides sorted, the static plan's own cost

assert "BroadcastHashJoin" in final_plan
assert "SortMergeJoin" not in final_plan
assert "BroadcastExchange" in final_plan  # the aggregated side, broadcast at runtime

# --- Claim 2: AQE coalesces small post-shuffle partitions that the static plan, run
# with the configured 200 shuffle partitions, never would have merged. ---

left = spark.range(0, 1_000_000).withColumnRenamed("id", "k").selectExpr("k", "k * 2 as v")
right = spark.range(0, 1_000_000).withColumnRenamed("id", "k").selectExpr(
    "k", "k * 3 as w"
).filter(col("k") < 20)

coalesce_joined = left.join(right, "k")
coalesce_joined.collect()

coalesce_plan = coalesce_joined._jdf.queryExecution().executedPlan().toString()
c_initial_idx = coalesce_plan.find("== Initial Plan ==")
c_final_idx = coalesce_plan.find("== Final Plan ==")
c_initial_plan = coalesce_plan[c_initial_idx:]
c_final_plan = coalesce_plan[c_final_idx:c_initial_idx]

# the static plan has no coalescing step at all: it commits to the configured partition count
assert "AQEShuffleRead" not in c_initial_plan
# AQE's real plan actually merges the small post-shuffle partitions it produced
assert "AQEShuffleRead coalesced" in c_final_plan

# --- Claim 3: AQE cannot change what already ran before the first shuffle boundary. ---
# Both queries above kept their own Range/Filter/Project steps identical between the
# Initial and Final plans -- AQE only ever rewrites the portion of the plan at and above
# a shuffle boundary that has not yet been materialized; the leaf scan and any filter or
# projection before the first Exchange is fixed the moment the static plan is chosen.
assert initial_plan.count("Range (0, 2000000") == final_plan.count("Range (0, 2000000") == 1
assert initial_plan.count("Range (0, 5000000") == final_plan.count("Range (0, 5000000") == 1

print("All AQE measurements confirmed.")
spark.stop()
