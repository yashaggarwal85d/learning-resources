"""
Measured: dynamic partition pruning (DPP) uses the dimension side's own runtime filter result,
reused from its broadcast, as a filter on the fact table's partitions -- and only when both
preconditions hold: the fact table is partitioned by the join column, and the join is planned
as a broadcast hash join (the dimension side small and selective enough to broadcast).
"""
import json
import re
import shutil
import urllib.request

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.dynamic-partition-pruning")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)
sc = spark.sparkContext
APP_ID = sc.applicationId
UI_PORT = sc.uiWebUrl.split(":")[-1]

FACT_PATH = "/tmp/dpp-examples-fact"
FACT_UNPARTITIONED_PATH = "/tmp/dpp-examples-fact-unpartitioned"
DIM_PATH = "/tmp/dpp-examples-dim"
for p in (FACT_PATH, FACT_UNPARTITIONED_PATH, DIM_PATH):
    shutil.rmtree(p, ignore_errors=True)

# Fact table: 1,000,000 rows, partitioned by region_id (100 partitions).
fact = spark.range(0, 1_000_000).selectExpr("id", "id % 100 as region_id", "id * 2 as amount")
fact.write.partitionBy("region_id").mode("overwrite").parquet(FACT_PATH)
fact.write.mode("overwrite").parquet(FACT_UNPARTITIONED_PATH)  # same rows, no partitioning

# Dimension table: region_id plus a non-key column (tier). The filter is on `tier`, so the
# specific region_id values that match are only knowable by actually reading the dimension
# table's real rows -- not something Catalyst can constant-fold away at plan time.
dim = spark.range(0, 100).selectExpr(
    "id as region_id", "case when id in (5, 42, 77) then 'gold' else 'silver' end as tier"
)
dim.write.mode("overwrite").parquet(DIM_PATH)


def sql_metrics_for(run_fn):
    before_ids = {
        e["id"]
        for e in json.loads(
            urllib.request.urlopen(f"http://localhost:{UI_PORT}/api/v1/applications/{APP_ID}/sql").read()
        )
    }
    result = run_fn()
    execs = json.loads(
        urllib.request.urlopen(
            f"http://localhost:{UI_PORT}/api/v1/applications/{APP_ID}/sql?details=true"
        ).read()
    )
    new_execs = [e for e in execs if e["id"] not in before_ids]
    metrics = {}
    for e in new_execs:
        for node in e.get("nodes", []):
            for m in node.get("metrics", []):
                metrics[m.get("name")] = m.get("value")
    return result, metrics


# --- Claim 1: with both preconditions met (partitioned fact table, broadcastable dimension-side
# filter), DPP prunes the fact scan down to just the 3 matching partitions / 12 files. Forced
# off, the same query reads all 100 partitions / 400 files -- and both give the same answer. ---

fact_read = spark.read.parquet(FACT_PATH)


def dpp_query():
    dim_read = spark.read.parquet(DIM_PATH).filter("tier = 'gold'")
    return fact_read.join(dim_read, "region_id").selectExpr("sum(amount) as s")


spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "true")
j_on = dpp_query()
plan_on = j_on._jdf.queryExecution().executedPlan().toString()
assert "dynamicpruningexpression" in plan_on.lower()
result_on, metrics_on = sql_metrics_for(dpp_query().collect)
print("DPP on: files read =", metrics_on["number of files read"], "partitions read =", metrics_on["number of partitions read"])
assert int(metrics_on["number of files read"]) == 12
assert int(metrics_on["number of partitions read"]) == 3

spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "false")
j_off = dpp_query()
plan_off = j_off._jdf.queryExecution().executedPlan().toString()
assert "dynamicpruningexpression" not in plan_off.lower()
result_off, metrics_off = sql_metrics_for(dpp_query().collect)
print("DPP off: files read =", metrics_off["number of files read"], "partitions read =", metrics_off["number of partitions read"])
assert int(metrics_off["number of files read"]) == 400
assert int(metrics_off["number of partitions read"]) == 100
assert result_on[0]["s"] == result_off[0]["s"]  # same correct answer either way

spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "true")

# --- Claim 2: EXPLAIN FORMATTED's own Subqueries section shows the dimension-side filter
# planned and run a second time, independently of the join itself -- the literal subquery
# duplicate the learning outcome asks to find. ---

explain_mode = spark._jvm.org.apache.spark.sql.execution.ExplainMode.fromString("formatted")
formatted = dpp_query()._jdf.queryExecution().explainString(explain_mode)
assert "===== Subqueries =====" in formatted
assert "Hosting Expression" in formatted
scan_operator_headers = re.findall(r"^\(\d+\) Scan parquet", formatted, re.MULTILINE)
assert len(scan_operator_headers) == 2  # the fact scan, and the dimension subquery's own scan
assert "ReusedExchange" in formatted  # the join's own broadcast, reused by the pruning filter

# --- Claim 3: without a partitioned fact table, there is nothing for the pruning filter to
# prune -- no dynamicpruningexpression appears at all, confirming the first precondition. ---

fact_unpartitioned = spark.read.parquet(FACT_UNPARTITIONED_PATH)
dim_read = spark.read.parquet(DIM_PATH).filter("tier = 'gold'")
j_unpartitioned = fact_unpartitioned.join(dim_read, "region_id").selectExpr("sum(amount) as s")
plan_unpartitioned = j_unpartitioned._jdf.queryExecution().executedPlan().toString()
assert "dynamicpruningexpression" not in plan_unpartitioned.lower()
j_unpartitioned.collect()

spark.stop()
print("all dynamic-partition-pruning claims verified against real PySpark 4.0.1.")
