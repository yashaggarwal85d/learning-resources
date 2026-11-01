"""
de.stateful-operators-output-modes -- measured against real PySpark 4.0.1, local[2].

Three claims, verified against real local Structured Streaming queries:

1. Complete output mode is rejected on a stream-stream join at query-start time, with a real
   AnalysisException naming the output mode and the join -- not a runtime failure later on.
2. A stream-stream join with no watermark on either side is accepted and runs, but its buffered
   join state grows without bound, batch after batch (measured via stateOperators.numRowsTotal).
3. The identical join, given a watermark on both sides plus a time-range join condition, has its
   buffered state plateau instead of growing once the steady state is reached.
"""
import os
import shutil
import time

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, expr
from pyspark.sql.utils import AnalysisException

CKPT_A = "/tmp/examples25-ckpt-a"
CKPT_B = "/tmp/examples25-ckpt-b"
CKPT_C = "/tmp/examples25-ckpt-c"
for d in (CKPT_A, CKPT_B, CKPT_C):
    shutil.rmtree(d, ignore_errors=True)

spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples25")
    .config("spark.sql.shuffle.partitions", "2")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")


def make_join(watermark=False, time_range=False):
    left = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
    right = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
    left = left.selectExpr("timestamp as leftTime", "value % 20 as key")
    right = right.selectExpr("timestamp as rightTime", "value % 20 as key")
    if watermark:
        left = left.withWatermark("leftTime", "5 seconds")
        right = right.withWatermark("rightTime", "5 seconds")
    if time_range:
        cond = (
            "key = key2 AND leftTime >= rightTime - interval 5 seconds "
            "AND leftTime <= rightTime + interval 5 seconds"
        )
        right2 = right.withColumnRenamed("key", "key2")
        return left.join(right2, expr(cond), "inner")
    else:
        return left.join(right, "key", "inner")


# --- Claim 1: complete mode is rejected on a stream-stream join, at query start. ---
joined_for_complete = make_join(watermark=False, time_range=False)
rejected = False
rejection_message = ""
try:
    q = (
        joined_for_complete.writeStream.format("memory")
        .queryName("rejectedcomplete")
        .outputMode("complete")
        .option("checkpointLocation", CKPT_A)
        .start()
    )
    q.stop()
except AnalysisException as e:
    rejected = True
    rejection_message = str(e)

assert rejected, "complete output mode on a stream-stream join should be rejected at query start"
assert "complete" in rejection_message.lower() or "Complete" in rejection_message, (
    f"the rejection message should name the unsupported mode: {rejection_message}"
)

# --- Claim 2: no watermark -> join state grows without bound. ---
joined_unbounded = make_join(watermark=False, time_range=False)
query_unbounded = (
    joined_unbounded.writeStream.format("noop")
    .outputMode("append")
    .option("checkpointLocation", CKPT_B)
    .trigger(processingTime="1 second")
    .start()
)
time.sleep(12)
progresses_unbounded = query_unbounded.recentProgress
query_unbounded.stop()

row_counts_unbounded = [
    p.stateOperators[0].numRowsTotal
    for p in progresses_unbounded
    if p.stateOperators
]
assert len(row_counts_unbounded) >= 4, "need several batches with state-operator progress"
# measured: total buffered rows keeps climbing, batch after batch, with no watermark to evict it.
assert row_counts_unbounded[-1] > row_counts_unbounded[len(row_counts_unbounded) // 2], (
    "unbounded join state should still be climbing well into the run, "
    f"got {row_counts_unbounded}"
)
assert row_counts_unbounded[-1] > row_counts_unbounded[0], (
    f"state should have grown since the first measured batch: {row_counts_unbounded}"
)

# --- Claim 3: watermark + time-range condition -> join state plateaus. ---
joined_bounded = make_join(watermark=True, time_range=True)
query_bounded = (
    joined_bounded.writeStream.format("noop")
    .outputMode("append")
    .option("checkpointLocation", CKPT_C)
    .trigger(processingTime="1 second")
    .start()
)
time.sleep(18)
progresses_bounded = query_bounded.recentProgress
query_bounded.stop()

row_counts_bounded = [
    p.stateOperators[0].numRowsTotal
    for p in progresses_bounded
    if p.stateOperators
]
assert len(row_counts_bounded) >= 6, "need several batches with state-operator progress"
# measured: once steady state is reached (second half of the run), the buffered row count
# stops climbing -- it stays within a small band rather than growing with every batch.
first_half_max = max(row_counts_bounded[: len(row_counts_bounded) // 2])
second_half = row_counts_bounded[len(row_counts_bounded) // 2 :]
second_half_max = max(second_half)
second_half_min = min(second_half)
assert second_half_max - second_half_min <= max(first_half_max, 1) * 0.5, (
    "bounded join state should plateau (stay within a narrow band) in the run's second half, "
    f"got {row_counts_bounded}"
)

spark.stop()

print("all claims verified")
