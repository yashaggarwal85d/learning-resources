"""
de.checkpoints-exactly-once-boundaries -- measured against real PySpark 4.0.1, local[2].

Three claims, verified against real local Structured Streaming queries that are stopped and
restarted from the same checkpoint, with a commit-log entry removed by hand to simulate a crash
between a batch finishing its work and Spark marking that batch committed:

1. A plain, non-idempotent sink (foreachBatch appending unconditionally) produces a real
   duplicate on exactly the batch whose commit was lost -- Spark's own checkpoint alone is not
   enough for exactly-once once the sink itself can be re-run.
2. The identical setup, but with the sink deduplicating by the batchId foreachBatch provides,
   produces zero duplicates across the same simulated crash and restart.
3. Changing a streaming aggregation's own grouping keys and restarting from the same checkpoint
   fails with a real exception, before any row of the restarted query is processed.
"""
import json
import os
import shutil
import time

from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.sql.types import IntegerType, StringType, StructField, StructType
from pyspark.sql.utils import StreamingQueryException

INPUT_DIR = "/tmp/examples26-input"
CKPT = "/tmp/examples26-ckpt"
NAIVE_LOG = "/tmp/examples26-naive.log"
DEDUP_LOG = "/tmp/examples26-dedup.log"
DEDUP_MARKERS = "/tmp/examples26-dedup-markers"

for p in (INPUT_DIR, CKPT, NAIVE_LOG, DEDUP_LOG, DEDUP_MARKERS):
    if os.path.isdir(p):
        shutil.rmtree(p)
    elif os.path.exists(p):
        os.remove(p)
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(DEDUP_MARKERS, exist_ok=True)

spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples26")
    .config("spark.sql.shuffle.partitions", "2")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

schema = StructType([StructField("word", StringType()), StructField("n", IntegerType())])


def write_file(name, word, n):
    with open(os.path.join(INPUT_DIR, name), "w") as f:
        f.write(json.dumps({"word": word, "n": n}) + "\n")


def naive_sink(batch_df, batch_id):
    rows = batch_df.collect()
    with open(NAIVE_LOG, "a") as f:
        for r in rows:
            f.write(f"{batch_id},{r.word},{r.n}\n")


def dedup_sink(batch_df, batch_id):
    marker = os.path.join(DEDUP_MARKERS, str(batch_id))
    if os.path.exists(marker):
        return  # already processed this exact batch -- skip, as any idempotent sink should.
    rows = batch_df.collect()
    with open(DEDUP_LOG, "a") as f:
        for r in rows:
            f.write(f"{batch_id},{r.word},{r.n}\n")
    open(marker, "w").close()


def run_pass(stream):
    q = (
        stream.writeStream.foreachBatch(lambda df, bid: (naive_sink(df, bid), dedup_sink(df, bid)))
        .option("checkpointLocation", CKPT)
        .trigger(availableNow=True)
        .start()
    )
    q.awaitTermination()


write_file("f0.json", "dog", 1)
write_file("f1.json", "cat", 2)
write_file("f2.json", "zebra", 3)

base = spark.readStream.schema(schema).option("maxFilesPerTrigger", 1).json(INPUT_DIR)
run_pass(base)
time.sleep(2)

# --- Simulate a crash: the last batch finished its work (both sinks already ran and wrote
# their output/marker above), but the commit-log entry recording that it finished is lost. ---
commits_dir = os.path.join(CKPT, "commits")
commit_files = sorted(
    (f for f in os.listdir(commits_dir) if not f.endswith(".crc")),
    key=lambda f: int(f),
)
last_batch_id = int(commit_files[-1])
os.remove(os.path.join(commits_dir, commit_files[-1]))
crc_sidecar = os.path.join(commits_dir, f".{commit_files[-1]}.crc")
if os.path.exists(crc_sidecar):
    os.remove(crc_sidecar)

# --- Restart from the same checkpoint. Spark should redo exactly the uncommitted last batch. ---
base2 = spark.readStream.schema(schema).option("maxFilesPerTrigger", 1).json(INPUT_DIR)
run_pass(base2)

with open(NAIVE_LOG) as f:
    naive_lines = [ln.strip() for ln in f if ln.strip()]
with open(DEDUP_LOG) as f:
    dedup_lines = [ln.strip() for ln in f if ln.strip()]

naive_for_last_batch = [ln for ln in naive_lines if ln.startswith(f"{last_batch_id},")]
dedup_for_last_batch = [ln for ln in dedup_lines if ln.startswith(f"{last_batch_id},")]

# --- Claim 1: the naive sink duplicates exactly the batch whose commit was lost. ---
assert len(naive_for_last_batch) == 2, (
    f"the non-idempotent sink should have written the lost-commit batch twice, "
    f"got {naive_for_last_batch}"
)
assert len(naive_lines) == 4, f"3 original batches + 1 replayed duplicate, got {naive_lines}"

# --- Claim 2: the batchId-deduplicating sink has zero duplicates across the same crash. ---
assert len(dedup_for_last_batch) == 1, (
    f"the batchId-deduplicating sink should see the replayed batch only once, "
    f"got {dedup_for_last_batch}"
)
assert len(dedup_lines) == 3, f"exactly 3 rows, no duplicate, got {dedup_lines}"

spark.stop()
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples26b")
    .config("spark.sql.shuffle.partitions", "2")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

# --- Claim 3: changing a streaming aggregation's grouping keys breaks checkpoint compatibility. ---
INPUT_DIR_C = "/tmp/examples26-input-c"
CKPT_C = "/tmp/examples26-ckpt-c"
for p in (INPUT_DIR_C, CKPT_C):
    shutil.rmtree(p, ignore_errors=True)
os.makedirs(INPUT_DIR_C, exist_ok=True)

schema_c = StructType(
    [StructField("word", StringType()), StructField("category", StringType()), StructField("n", IntegerType())]
)
with open(os.path.join(INPUT_DIR_C, "f0.json"), "w") as f:
    f.write(json.dumps({"word": "dog", "category": "animal", "n": 1}) + "\n")

original = spark.readStream.schema(schema_c).json(INPUT_DIR_C).groupBy("word").count()
q = (
    original.writeStream.format("noop")
    .outputMode("update")
    .option("checkpointLocation", CKPT_C)
    .trigger(availableNow=True)
    .start()
)
q.awaitTermination()

with open(os.path.join(INPUT_DIR_C, "f1.json"), "w") as f:
    f.write(json.dumps({"word": "cat", "category": "animal", "n": 1}) + "\n")

changed = spark.readStream.schema(schema_c).json(INPUT_DIR_C).groupBy("word", "category").count()
restart_failed = False
try:
    q2 = (
        changed.writeStream.format("noop")
        .outputMode("update")
        .option("checkpointLocation", CKPT_C)
        .trigger(availableNow=True)
        .start()
    )
    q2.awaitTermination()
except StreamingQueryException:
    restart_failed = True

assert restart_failed, "restarting with changed grouping keys on the same checkpoint should fail"

spark.stop()

print("all claims verified")
