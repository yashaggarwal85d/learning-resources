"""
de.executor-memory-model — measured against real PySpark 4.0.1, local mode.

Claim 1: a cache that uses most of the unified pool gets fully evicted (and the job still
         has to spill) once a later task genuinely needs execution memory.
Claim 2: a cache sized under the storageFraction-protected minimum survives the identical
         execution pressure untouched.
Claim 3: a JVM heap OutOfMemoryError is a real, catchable Java exception with a full stack
         trace -- distinct in kind from a container-level OOM-kill (claim 4, disclosed in
         FACT-CHECK.md: measured once via a real Linux cgroup in this session, but not run
         here since it needs root and a cgroups v1 memory controller not guaranteed in every
         environment this script runs in).
"""
import time
import urllib.request
import json

from pyspark.sql import SparkSession
from pyspark import StorageLevel


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


# ---------------------------------------------------------------------------
# Claim 1 + 2: eviction under pressure vs. the protected storage minimum.
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples17")
    .config("spark.driver.memory", "768m")
    .config("spark.memory.fraction", "0.6")
    .config("spark.memory.storageFraction", "0.3")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "1")
    .getOrCreate()
)
sc = spark.sparkContext

max_mem = get_json(sc, "/executors")[0]["maxMemory"]
# measured: a 768MB driver heap gives a ~294MB unified pool, matching the source's own
# formula: (heap - 300MB reserved) * memory.fraction.
assert 280_000_000 < max_mem < 310_000_000
storage_min = max_mem * 0.3  # storageFraction's protected minimum

# --- Claim 1: cache well past the protected minimum, then apply real execution pressure. ---
n_cache_rows = 30_000_000
cache_df = spark.range(0, n_cache_rows).selectExpr(
    "id", "cast(rand(42) * 1000000000 as double) as v"
)
cache_df.persist(StorageLevel.MEMORY_ONLY)
cache_df.count()
time.sleep(1)

storage_before = get_json(sc, "/storage/rdd")
cached_before = storage_before[0]["memoryUsed"]
partitions_before = storage_before[0]["numCachedPartitions"]
# measured: the cache uses well over half the pool (observed 65-82% across runs), clearly
# past the 30% protected minimum.
assert cached_before / max_mem > 0.5
assert partitions_before == 2

sort_df = spark.range(0, 20_000_000).selectExpr(
    "cast(rand(7) * 1000000000 as double) as k", "id"
)
sort_df.repartition(1).sortWithinPartitions("k").write.format("noop").mode("overwrite").save()
time.sleep(1)

storage_after = get_json(sc, "/storage/rdd")
# measured: the single-partition sort needs enough execution memory that every cached
# partition gets evicted entirely -- the RDD disappears from /storage/rdd altogether, every
# run, rather than showing up with 0 bytes still "cached".
cached_after = storage_after[0]["memoryUsed"] if storage_after else 0
partitions_after = storage_after[0]["numCachedPartitions"] if storage_after else 0
assert cached_after == 0
assert partitions_after == 0
assert storage_after == []

stages = get_json(sc, "/stages")
last_stage = max(stages, key=lambda s: s["stageId"])
# measured: even after evicting the entire cache, the sort still has to spill to disk --
# borrowing storage's space wasn't enough on its own.
assert last_stage["memoryBytesSpilled"] > 0
assert last_stage["diskBytesSpilled"] > 0

spark.stop()

# --- Claim 2: the identical pressure, but the cache now sits under the protected minimum. ---
spark2 = (
    SparkSession.builder.master("local[2]")
    .appName("examples17-protected")
    .config("spark.driver.memory", "768m")
    .config("spark.memory.fraction", "0.6")
    .config("spark.memory.storageFraction", "0.3")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "1")
    .getOrCreate()
)
sc2 = spark2.sparkContext
max_mem2 = get_json(sc2, "/executors")[0]["maxMemory"]
storage_min2 = max_mem2 * 0.3

n_small_cache_rows = 8_000_000
small_cache_df = spark2.range(0, n_small_cache_rows).selectExpr(
    "id", "cast(rand(42) * 1000000000 as double) as v"
)
small_cache_df.persist(StorageLevel.MEMORY_ONLY)
small_cache_df.count()
time.sleep(1)

small_before = get_json(sc2, "/storage/rdd")[0]["memoryUsed"]
# measured: this cache sits under the protected storage minimum.
assert small_before < storage_min2

sort_df2 = spark2.range(0, 20_000_000).selectExpr(
    "cast(rand(7) * 1000000000 as double) as k", "id"
)
sort_df2.repartition(1).sortWithinPartitions("k").write.format("noop").mode("overwrite").save()
time.sleep(1)

small_after = get_json(sc2, "/storage/rdd")[0]["memoryUsed"]
small_partitions_after = get_json(sc2, "/storage/rdd")[0]["numCachedPartitions"]
# measured: identical execution pressure, but this cache is completely untouched -- the
# protected minimum held, byte for byte.
assert small_after == small_before
assert small_partitions_after == 2

spark2.stop()

# ---------------------------------------------------------------------------
# Claim 3: a genuine JVM heap OutOfMemoryError, with a real, visible stack trace.
#
# The OOM text itself is written by the JVM straight to the process's own stderr, not
# necessarily into the Python-side exception message -- so this runs the scenario as its
# own subprocess and inspects its combined stdout+stderr, exactly how it was first
# confirmed manually in this session.
# ---------------------------------------------------------------------------
import subprocess
import sys
import textwrap

heap_oom_script = textwrap.dedent(
    """
    from pyspark.sql import SparkSession

    spark = (
        SparkSession.builder.master("local[1]")
        .appName("examples17-heap-oom")
        .config("spark.driver.memory", "512m")
        .config("spark.driver.maxResultSize", "2g")
        .getOrCreate()
    )
    try:
        spark.range(0, 60_000_000).selectExpr("cast(id as string) as s").collect()
        print("DID NOT OOM")
    except Exception as e:
        print("CAUGHT:", type(e).__name__)
    spark.stop()
    """
)

result = subprocess.run(
    [sys.executable, "-c", heap_oom_script],
    capture_output=True,
    text=True,
    timeout=120,
)
combined_output = result.stdout + result.stderr

# measured: the JVM's own "java.lang.OutOfMemoryError: Java heap space" text appears
# directly in the process output, with a full stack trace -- a heap OOM is a visible,
# diagnosable Java exception, not a silent process death.
assert "OutOfMemoryError" in combined_output
assert "Java heap space" in combined_output
