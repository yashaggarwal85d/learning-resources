"""
de.jvm-garbage-collection-symptoms -- measured against real PySpark 4.0.1, local[2].

Two claims, verified against real local Spark sessions:

1. Object-heavy RDD code (a groupByKey shuffle over per-row tuples) produces real, nonzero
   JVM garbage-collection time; the equivalent DataFrame aggregation over the identical data,
   routed through Tungsten's binary row format, produces zero measured GC time.
2. Reading the GC-time column means comparing it against total executor run time, not reacting
   to any nonzero number by itself: the RDD job's own GC time, while real and nonzero, is a
   small fraction of its total executor run time -- not the bottleneck in this particular job,
   even though it is the job that pays any GC cost at all.
"""
import time
import urllib.request
import json

from pyspark.sql import SparkSession


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


def total_gc_ms(sc):
    execs = get_json(sc, "/executors")
    return sum(e.get("totalGCTime", 0) for e in execs)


N = 30_000_000

# --- Claim 1: object-heavy RDD code vs. Tungsten binary rows. ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples20-rdd")
    .config("spark.driver.memory", "900m")
    .getOrCreate()
)
sc = spark.sparkContext

gc_before_rdd = total_gc_ms(sc)
rdd = sc.parallelize(range(N), 8).map(lambda x: (x % 5000, (x, str(x), float(x))))
grouped = rdd.groupByKey().mapValues(lambda vs: sum(v[0] for v in vs))
grouped.count()
time.sleep(1)
gc_after_rdd = total_gc_ms(sc)
gc_rdd = gc_after_rdd - gc_before_rdd

assert gc_rdd > 0, "object-heavy RDD code should produce real, measurable GC time"

# --- Claim 2 setup: read the same job's own GC time against its total run time. ---
stages = get_json(sc, "/stages?status=complete")
total_gc_from_tasks = 0
total_run_from_tasks = 0
for s in stages:
    detail = get_json(sc, f"/stages/{s['stageId']}")
    for t in detail[0]["tasks"].values():
        m = t.get("taskMetrics", {})
        total_gc_from_tasks += m.get("jvmGcTime", 0)
        total_run_from_tasks += m.get("executorRunTime", 0)

gc_fraction = total_gc_from_tasks / total_run_from_tasks

assert total_gc_from_tasks > 0
assert gc_fraction < 0.05, "this job's own GC time should be a small fraction of its run time, not a bottleneck"

spark.stop()

# --- Claim 1, continued: the identical computation via DataFrame/Tungsten. ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples20-df")
    .config("spark.driver.memory", "900m")
    .getOrCreate()
)
sc = spark.sparkContext

gc_before_df = total_gc_ms(sc)
df = spark.range(0, N).selectExpr("cast(id % 5000 as int) as k", "id as v")
agg = df.groupBy("k").agg({"v": "sum"})
agg.collect()
time.sleep(1)
gc_after_df = total_gc_ms(sc)
gc_df = gc_after_df - gc_before_df

assert gc_df == 0, "the equivalent Tungsten DataFrame aggregation should produce zero measured GC time"

spark.stop()

print("all claims verified")
print("gc_rdd_ms=", gc_rdd, "gc_df_ms=", gc_df, "gc_fraction_of_rdd_job=", gc_fraction)
