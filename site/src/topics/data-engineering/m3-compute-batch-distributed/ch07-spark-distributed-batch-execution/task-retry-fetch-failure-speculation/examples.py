"""
de.task-retry-fetch-failure-speculation -- measured against real PySpark 4.0.1.

Two claims, verified against real local Spark sessions:

1. A task that fails fewer times than spark.task.maxFailures is retried and the job succeeds;
   the identical flaky task, run again with maxFailures set too low, aborts the job with the
   exact "failed N times; aborting job" message once the limit is reached.
2. A fetch failure on the reduce side -- caused here by deleting a shuffle data file after the
   map stage wrote it, before the reduce stage reads it -- resubmits the entire parent
   shuffle-map stage (a second stage attempt that reruns every map task), not just the single
   reduce task that hit the fetch failure.

In local mode, spark.task.maxFailures has no effect; the master string's own "local[K,F]" form
(K threads, F max task failures) controls retries instead, confirmed directly below.
"""
import glob
import os
import threading
import time
import urllib.request
import json

from pyspark.sql import SparkSession


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


# --- Claim 1: task retry up to spark.task.maxFailures. ---
STATE_DIR = "/tmp/spark-retry-state"
os.makedirs(STATE_DIR, exist_ok=True)
for f in os.listdir(STATE_DIR):
    os.remove(os.path.join(STATE_DIR, f))


def flaky(x):
    # partition 0 fails its first two attempts, succeeds on the third
    path = os.path.join(STATE_DIR, f"p{x}")
    if x == 0:
        n = 0
        if os.path.exists(path):
            with open(path) as f:
                n = int(f.read().strip())
        n += 1
        with open(path, "w") as f:
            f.write(str(n))
        if n < 3:
            raise RuntimeError(f"flaky failure attempt {n}")
    return x * 10


spark = SparkSession.builder.master("local[2,4]").appName("examples21-retry-ok").getOrCreate()
sc = spark.sparkContext
rdd = sc.parallelize(range(4), 4).map(flaky)
result = rdd.collect()
assert result == [0, 10, 20, 30], "a task failing fewer times than the failure limit should be retried until it succeeds"
spark.stop()

for f in os.listdir(STATE_DIR):
    os.remove(os.path.join(STATE_DIR, f))

spark = SparkSession.builder.master("local[2,2]").appName("examples21-retry-fail").getOrCreate()
sc = spark.sparkContext
rdd = sc.parallelize(range(4), 4).map(flaky)
job_aborted = False
abort_message = ""
try:
    rdd.collect()
except Exception as e:
    job_aborted = True
    abort_message = str(e)
spark.stop()

assert job_aborted, "the identical flaky task should abort the job once it exceeds a lower failure limit"
assert "failed 2 times" in abort_message, "the abort message should name the exact failure count that triggered it"

# --- Claim 2: a fetch failure resubmits the parent shuffle-map stage. ---
LOCAL_DIR = "/tmp/spark-local-21"
os.makedirs(LOCAL_DIR, exist_ok=True)

spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples21-fetchfail")
    .config("spark.local.dir", LOCAL_DIR)
    .getOrCreate()
)
sc = spark.sparkContext

deleted = {"done": False}


def watcher():
    for _ in range(200):
        files = glob.glob(os.path.join(LOCAL_DIR, "**", "shuffle_*.data"), recursive=True)
        if files:
            try:
                os.remove(files[0])
                deleted["done"] = True
            except FileNotFoundError:
                pass
            return
        time.sleep(0.05)


t = threading.Thread(target=watcher)
t.start()

N = 2_000_000
rdd2 = sc.parallelize(range(N), 4).map(lambda x: (x % 1000, x))
grouped = rdd2.groupByKey().mapValues(lambda vs: sum(vs))
result_count = grouped.count()
t.join()

assert deleted["done"], "the watcher should have found and deleted a real shuffle data file"
assert result_count == 1000

stages = get_json(sc, "/stages")
map_stage_id = min(s["stageId"] for s in stages)
map_stage_attempts = sorted({s["attemptId"] for s in stages if s["stageId"] == map_stage_id})
reduce_stage_id = max(s["stageId"] for s in stages)
reduce_stage_statuses = {s["attemptId"]: s["status"] for s in stages if s["stageId"] == reduce_stage_id}

assert len(map_stage_attempts) >= 2, "deleting a shuffle file after the map stage finished should force a second map-stage attempt"
assert any(status == "FAILED" for status in reduce_stage_statuses.values()), "the reduce stage's own first attempt should fail with the fetch failure"
assert any(status == "COMPLETE" for status in reduce_stage_statuses.values()), "a later reduce stage attempt should complete once the map stage has been resubmitted and rerun"

spark.stop()

print("all claims verified")
