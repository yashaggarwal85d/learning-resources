"""
de.diagnosing-jobs-spark-ui -- measured against real PySpark 4.0.1.

Five deliberately broken jobs, one per failure mode (skew, spill, GC, small files, driver
bottleneck), each read back purely from the REST API that mirrors what the Spark UI shows --
the same stage/task/executor metrics tables the Stages, Executors and SQL tabs render.

1. Skew: a groupBy aggregation where one key holds 95% of the rows produces one task whose
   run time is an order of magnitude above every other task in the same stage.
2. Spill: a skewed sort with modest memory produces a real memory-vs-disk spill, isolated to
   the one task handling the oversized partition.
3. GC: object-heavy RDD code produces real, nonzero JVM GC time; the identical aggregation
   expressed as a DataFrame produces exactly zero.
4. Small files: thousands of tiny partitions make per-task scheduling overhead dominate the
   job's own useful work, visible as a huge task count with a tiny average run time each.
5. Driver bottleneck: heavy post-processing on the driver after collect() produces a long
   stretch of wall-clock time with no executor task running at all -- a gap no stage accounts
   for.
"""
import math
import time
import urllib.request
import json

from pyspark.sql import SparkSession, functions as F


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


# --- Scenario 1: skew. ---
def heavy(v):
    x = 0.0
    for i in range(2000):
        x += math.sin(v + i) * math.cos(v - i)
    return x


spark = SparkSession.builder.master("local[4]").appName("examples22-skew").getOrCreate()
sc = spark.sparkContext

N = 800_000
# one key (0) holds 798,000 of 800,000 rows; the other seven keys share the remaining 2,000.
# groupByKey (no map-side combine) forces every row's heavy per-value work into the single
# downstream task that owns the hot key, rather than letting a partial aggregation hide it.
rdd = sc.parallelize(range(N), 4).map(lambda x: (0 if x < 798000 else 1 + x % 7, x))
grouped = rdd.partitionBy(8).groupByKey().mapValues(lambda vs: sum(heavy(v) for v in vs))
grouped.count()
time.sleep(1)

stages = get_json(sc, "/stages")
reduce_stage = max((s for s in stages if s["numTasks"] == 8), key=lambda s: s["stageId"])
tasks = get_json(sc, f"/stages/{reduce_stage['stageId']}/0/taskList?length=100")
durations = sorted(t["taskMetrics"]["executorRunTime"] for t in tasks if "taskMetrics" in t)

assert len(durations) == 8
median = durations[len(durations) // 2]
# measured: one task in an 8-task stage runs far longer than the stage's own median -- the
# signature of skew, not an unlucky scheduling fluke.
assert durations[-1] >= median * 20, "the hot key's task should dominate the stage's own median"

spark.stop()

# --- Scenario 2: spill (same recipe as de.spill-shuffle-memory-pressure). ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples22-spill")
    .config("spark.driver.memory", "512m")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)
sc = spark.sparkContext

n_hot = 40_000_000
n_other = 400_000
n_other_keys = 300
hot = spark.range(0, n_hot).selectExpr("cast(0 as int) as k", "cast(rand(7) * 1e9 as double) as v")
other = spark.range(0, n_other).selectExpr(
    f"cast((id % {n_other_keys}) + 1 as int) as k", "cast(rand(9) * 1e9 as double) as v"
)
spilly = hot.unionByName(other).repartition(4, "k").sortWithinPartitions("v")
spilly.write.format("noop").mode("overwrite").save()

stages = get_json(sc, "/stages")
last_stage = max(stages, key=lambda s: s["stageId"])
mem_spill = last_stage.get("memoryBytesSpilled", 0)
disk_spill = last_stage.get("diskBytesSpilled", 0)

# measured: a real spill happened, and the memory figure (which includes page-rounding and
# pointer-array overhead never written to disk) exceeds the disk figure for the same event.
assert mem_spill > 0 and disk_spill > 0
assert mem_spill > disk_spill

spark.stop()

# --- Scenario 3: GC (same contrast as de.jvm-garbage-collection-symptoms). ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples22-gc")
    .config("spark.driver.memory", "900m")
    .getOrCreate()
)
sc = spark.sparkContext


def total_gc_ms():
    execs = get_json(sc, "/executors")
    return sum(e.get("totalGCTime", 0) for e in execs)


N_GC = 30_000_000
gc_before = total_gc_ms()
rdd = sc.parallelize(range(N_GC), 8).map(lambda x: (x % 5000, (x, str(x), float(x))))
grouped = rdd.groupByKey().mapValues(lambda vs: sum(v[0] for v in vs))
grouped.count()
time.sleep(1)
gc_rdd = total_gc_ms() - gc_before

gc_before2 = total_gc_ms()
df_gc = spark.range(N_GC).selectExpr("id % 5000 as k", "id as v")
df_gc.groupBy("k").agg(F.sum("v")).count()
time.sleep(1)
gc_df = total_gc_ms() - gc_before2

# measured: the object-heavy RDD job pays real GC cost; the identical aggregation through
# Tungsten's binary rows pays exactly zero.
assert gc_rdd > 0, "object-heavy RDD code should produce real, measurable GC time"
assert gc_df == 0, "the equivalent DataFrame aggregation should show zero GC time"

spark.stop()

# --- Scenario 4: small files -- overhead dominates when each task does almost no work. ---
spark = (
    SparkSession.builder.master("local[4]")
    .appName("examples22-small-files")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)
sc = spark.sparkContext

N_SMALL = 2000
df_small = spark.range(N_SMALL, numPartitions=N_SMALL).selectExpr("id * 2 as v")
df_small.selectExpr("sum(v) as s").collect()
time.sleep(1)

stages = get_json(sc, "/stages")
sid = [s["stageId"] for s in stages if s["numTasks"] >= N_SMALL][0]
tasks = get_json(sc, f"/stages/{sid}/0/taskList?length={N_SMALL + 10}")
sched_delay = [t["schedulerDelay"] for t in tasks]
cpu_ms = [t["taskMetrics"]["executorCpuTime"] / 1e6 for t in tasks]

# measured: with one input file per task, each task's own scheduler delay (queuing and
# result-handling overhead, not computation) exceeds the real CPU time it spent -- the
# signature of thousands of tiny partitions paying fixed per-task overhead over and over.
assert len(sched_delay) == N_SMALL
avg_delay = sum(sched_delay) / len(sched_delay)
avg_cpu = sum(cpu_ms) / len(cpu_ms)
assert avg_delay > avg_cpu, "per-task scheduling overhead should exceed the real CPU work per task"
assert avg_cpu < 10, "each individual task should be doing almost no real computation"

spark.stop()

# --- Scenario 5: driver bottleneck -- a long gap with no executor task running at all. ---
spark = SparkSession.builder.master("local[4]").appName("examples22-driver").getOrCreate()
sc = spark.sparkContext

df_driver = spark.range(200_000).selectExpr("id % 100 as k", "id as v")
t0 = time.time()
df_driver.groupBy("k").count().collect()
t_spark_done = time.time()

total = 0
for _ in range(30_000_000):
    total += 1
t_driver_done = time.time()

driver_only_s = t_driver_done - t_spark_done

time.sleep(1)
stages = get_json(sc, "/stages")
total_task_time_ms = 0
for s in stages:
    tasks = get_json(sc, f"/stages/{s['stageId']}/0/taskList?length=1000")
    total_task_time_ms += sum(t["taskMetrics"]["executorRunTime"] for t in tasks if "taskMetrics" in t)

# measured: a real stretch of wall-clock time (the driver's own post-processing loop) that
# no stage, and so no executor task, accounts for at all -- the signature the Jobs tab's own
# event timeline shows as a gap between two jobs with every executor idle.
assert driver_only_s > total_task_time_ms / 1000.0, (
    "driver-only time should exceed the total executor task time summed across the "
    "whole application, since the driver loop ran after every Spark stage had finished"
)

spark.stop()

print("all claims verified")
