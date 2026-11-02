"""
de.caching-persistence-checkpointing -- measured against real PySpark 4.0.1, local[2].

Three claims, each verified against a real local Spark session:

1. Caching a reused computation avoids redoing it: without caching, two actions over the
   same heavy-UDF DataFrame each run the UDF on every row; with caching, the UDF runs once
   on the first action, and the second action reuses the cached result (confirmed by an
   accumulator counting actual UDF invocations, not timing alone).
2. Storage levels differ in what happens on eviction under real memory pressure: a
   MEMORY_ONLY cache that gets evicted is recomputed in full the next time it's touched
   (the accumulator count doubles); a MEMORY_AND_DISK cache spills the evicted data to disk
   instead and is read back without recomputation (the accumulator count stays the same).
3. Caching a non-deterministic computation freezes its output: without caching, two actions
   over the same non-deterministic UDF produce different values per row every time; once
   cached, every later action sees the exact same materialized values.
"""
import hashlib
import random
import urllib.request
import json

from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, sum as ssum
from pyspark.sql.types import DoubleType
from pyspark import StorageLevel


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


# --- Claim 1: caching avoids redoing a reused computation. ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples19-reuse")
    .config("spark.driver.memory", "700m")
    .getOrCreate()
)
sc = spark.sparkContext


def make_slow_udf(acc):
    def slow_hash(v):
        acc.add(1)
        x = str(v).encode()
        for _ in range(3000):
            x = hashlib.sha256(x).digest()
        return float(x[0])

    return udf(slow_hash, DoubleType())


N1 = 8000
base = spark.range(0, N1).selectExpr("id", "cast(rand(1) * 1e6 as double) as v")

acc_nocache = sc.accumulator(0)
heavy_nocache = base.withColumn("h", make_slow_udf(acc_nocache)(base.v))
heavy_nocache.agg(ssum("h")).collect()
after_run1 = acc_nocache.value
heavy_nocache.agg(ssum("h")).collect()
after_run2 = acc_nocache.value

assert after_run1 == N1
assert after_run2 == 2 * N1, "without caching, the second action should re-run the UDF on every row"

acc_cached = sc.accumulator(0)
heavy_cached = base.withColumn("h", make_slow_udf(acc_cached)(base.v)).cache()
heavy_cached.agg(ssum("h")).collect()
after_materialize = acc_cached.value
heavy_cached.agg(ssum("h")).collect()
after_reuse = acc_cached.value

assert after_materialize == N1
assert after_reuse == N1, "with caching, the second action should reuse the materialized result, not re-run the UDF"

spark.stop()


# --- Claim 2: storage levels differ in what eviction does. ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples19-eviction")
    .config("spark.driver.memory", "700m")
    .config("spark.memory.fraction", "0.6")
    .config("spark.memory.storageFraction", "0.3")
    .getOrCreate()
)
sc = spark.sparkContext

N2 = 150_000


def make_cheap_udf(acc):
    def h(v):
        acc.add(1)
        return float(int(hashlib.sha256(str(v).encode()).hexdigest()[:8], 16))

    return udf(h, DoubleType())


def big_df(seed):
    return spark.range(0, N2).selectExpr(
        "id", f"repeat(concat(cast(id as string), '-{seed}-'), 200) as pad"
    )


def run_eviction(level, acc):
    df = big_df(1)
    heavy = df.withColumn("hv", make_cheap_udf(acc)(df.id)).persist(level)
    heavy.agg(ssum("hv")).collect()
    after_materialize = acc.value

    rdds_before = get_json(sc, "/storage/rdd")
    cached_mb_before = sum(r.get("memoryUsed", 0) for r in rdds_before) / 1e6

    filler = big_df(2).cache()
    filler.count()

    rdds_after = get_json(sc, "/storage/rdd")
    cached_mb_after = sum(r.get("memoryUsed", 0) for r in rdds_after) / 1e6

    heavy.agg(ssum("hv")).collect()
    after_retouch = acc.value

    filler.unpersist()
    heavy.unpersist()
    return after_materialize, after_retouch, cached_mb_before, cached_mb_after


acc_mem_only = sc.accumulator(0)
mo_mat, mo_retouch, mo_mb_before, mo_mb_after = run_eviction(StorageLevel.MEMORY_ONLY, acc_mem_only)

acc_mem_disk = sc.accumulator(0)
md_mat, md_retouch, md_mb_before, md_mb_after = run_eviction(StorageLevel.MEMORY_AND_DISK, acc_mem_disk)

# a real amount of cached data existed before and grew well past it once the filler landed
assert mo_mb_before > 0
assert mo_mb_after > mo_mb_before * 10
assert md_mb_before > 0
assert md_mb_after > md_mb_before * 10

assert mo_mat == N2
assert mo_retouch == 2 * N2, "MEMORY_ONLY: an evicted partition should be recomputed in full on the next touch"

assert md_mat == N2
assert md_retouch == N2, "MEMORY_AND_DISK: an evicted partition should be read back from disk, not recomputed"

spark.stop()


# --- Claim 3: caching a non-deterministic computation freezes its output. ---
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples19-nondeterministic")
    .config("spark.driver.memory", "512m")
    .getOrCreate()
)


@udf(DoubleType())
def random_udf(x):
    return random.random()


random_udf = random_udf.asNondeterministic()

N3 = 40
df3 = spark.range(0, N3).withColumn("r", random_udf("id"))

rows_a = df3.orderBy("id").collect()
rows_b = df3.orderBy("id").collect()
diffs_uncached = sum(1 for a, b in zip(rows_a, rows_b) if a.r != b.r)
assert diffs_uncached == N3, "without caching, every row's random value should differ across the two actions"

cached3 = df3.cache()
cached3.count()
rows_a = cached3.orderBy("id").collect()
rows_b = cached3.orderBy("id").collect()
diffs_cached = sum(1 for a, b in zip(rows_a, rows_b) if a.r != b.r)
assert diffs_cached == 0, "once cached, every row's value should be identical across later actions"

spark.stop()

print("all claims verified")
