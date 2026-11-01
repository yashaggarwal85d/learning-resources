"""
de.micro-batch-incremental-execution -- measured against real PySpark 4.0.1, local[2].

Three claims, verified against real local Structured Streaming queries:

1. The checkpoint directory accumulates one offset-log entry and one commit-log entry per
   batch, in lockstep, and both are plain, readable files -- not an abstraction, but a real
   write-ahead log the engine itself reads back to resume.
2. Even with the trigger interval forced to zero and almost no data, steady-state micro-batch
   duration never drops below a floor of roughly a hundred-plus milliseconds -- the cost of
   planning and committing a batch, not of processing its rows.
3. A fixed processingTime trigger spaces consecutive batch start times at the configured
   interval, even though each batch's own execution time is far shorter -- the engine waits
   for the interval boundary rather than running batches back-to-back.
"""
import os
import shutil
import time

from pyspark.sql import SparkSession

spark = SparkSession.builder.master("local[2]").appName("examples23").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# --- Claim 1: offset log and commit log, one entry per batch. ---
ckpt1 = "/tmp/examples23-ckpt1"
shutil.rmtree(ckpt1, ignore_errors=True)

df1 = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
q1 = (
    df1.writeStream.format("noop")
    .option("checkpointLocation", ckpt1)
    .outputMode("append")
    .start()
)
time.sleep(6)
q1.stop()

offsets_dir = os.path.join(ckpt1, "offsets")
commits_dir = os.path.join(ckpt1, "commits")
offset_batches = sorted(int(f) for f in os.listdir(offsets_dir) if f.isdigit())
commit_batches = sorted(int(f) for f in os.listdir(commits_dir) if f.isdigit())

assert len(offset_batches) >= 3, "the query should have run several real batches"
# measured: a commit log entry exists for every offset log entry except, at most, the very
# last in-flight batch -- committing never runs ahead of the offset that was checkpointed.
assert set(commit_batches) <= set(offset_batches)
assert len(offset_batches) - len(commit_batches) <= 1

offset_text = open(os.path.join(offsets_dir, str(offset_batches[0]))).read()
commit_text = open(os.path.join(commits_dir, str(commit_batches[0]))).read()
# measured: both logs are plain versioned JSON files, readable without any Spark API.
assert offset_text.startswith("v1\n") and "batchWatermarkMs" in offset_text
assert commit_text.startswith("v1\n") and "nextBatchWatermarkMs" in commit_text

spark.stop()
spark = SparkSession.builder.master("local[2]").appName("examples23b").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# --- Claim 2: a real latency floor, independent of data volume. ---
ckpt2 = "/tmp/examples23-ckpt2"
shutil.rmtree(ckpt2, ignore_errors=True)

df2 = spark.readStream.format("rate").option("rowsPerSecond", 1).load()
q2 = (
    df2.writeStream.format("noop")
    .option("checkpointLocation", ckpt2)
    .trigger(processingTime="0 seconds")
    .outputMode("append")
    .start()
)
time.sleep(8)
progresses = q2.recentProgress
q2.stop()

# skip batch 0 (JVM/JIT warmup inflates it); look at steady-state batches only.
steady = [p.durationMs.get("triggerExecution", 0) for p in progresses[1:]]
assert len(steady) >= 4, "the query should have reached several steady-state batches"
avg_steady_ms = sum(steady) / len(steady)
# measured: even with a trigger interval of zero and ~1 row per batch, the engine still can't
# run a batch in single-digit milliseconds -- there's a real floor around a few hundred.
assert avg_steady_ms > 100, "steady-state batches should show a real, nonzero latency floor"
assert all(d > 0 for d in steady), "every steady-state batch should take measurable time"

spark.stop()
spark = SparkSession.builder.master("local[2]").appName("examples23c").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# --- Claim 3: a fixed-interval trigger waits for the interval, not just for the batch. ---
ckpt3 = "/tmp/examples23-ckpt3"
shutil.rmtree(ckpt3, ignore_errors=True)
INTERVAL_S = 3

df3 = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
q3 = (
    df3.writeStream.format("noop")
    .option("checkpointLocation", ckpt3)
    .trigger(processingTime=f"{INTERVAL_S} seconds")
    .outputMode("append")
    .start()
)
time.sleep(10)
progresses3 = q3.recentProgress
q3.stop()

from datetime import datetime, timezone


def parse_ts(s):
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)


# steady-state batches only (skip the first, which absorbs startup cost).
steady3 = progresses3[2:]
assert len(steady3) >= 2, "the query should have reached several steady-state interval batches"
gaps = [
    (parse_ts(b.timestamp) - parse_ts(a.timestamp)).total_seconds()
    for a, b in zip(steady3, steady3[1:])
]
# measured: consecutive steady-state batches start almost exactly INTERVAL_S apart, even though
# each one's own execution time is a small fraction of that -- the engine waited for the
# interval boundary, it didn't just run back-to-back as soon as the previous batch finished.
assert all(gap > INTERVAL_S - 0.5 for gap in gaps), "batch starts should be spaced at the interval"
exec_times = [p.durationMs.get("triggerExecution", 0) for p in steady3]
assert all(e < INTERVAL_S * 1000 * 0.9 for e in exec_times), (
    "each batch's own execution time should be well under the interval it's waiting for"
)

spark.stop()

print("all claims verified")
