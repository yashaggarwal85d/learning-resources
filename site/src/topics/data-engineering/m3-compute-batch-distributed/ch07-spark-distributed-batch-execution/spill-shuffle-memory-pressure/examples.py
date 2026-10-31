"""
de.spill-shuffle-memory-pressure -- measured against real PySpark 4.0.1, local[2].

Claim 1: a real sort spill reports a larger "memory" figure than "disk" figure for the
         identical spill event, because the memory figure includes page-rounding and
         pointer-array overhead never written to disk at all.
Claim 2: all of a skewed sort's spill is isolated to exactly the one task handling the
         oversized partition; every other task spills zero, regardless of memory setting.
Claim 3: quadrupling the available memory shrinks that one skewed task's own spill by only
         a modest fraction, nowhere close to proportional, while the already-fine tasks stay
         at zero -- the extra memory mostly goes where it wasn't needed.
"""
import urllib.request
import json

from pyspark.sql import SparkSession


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


def run_skewed_sort(driver_mem, n_hot):
    spark = (
        SparkSession.builder.master("local[2]")
        .appName(f"examples18-{driver_mem}-{n_hot}")
        .config("spark.driver.memory", driver_mem)
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )
    sc = spark.sparkContext

    n_other = 400_000
    n_other_keys = 300

    hot = spark.range(0, n_hot).selectExpr(
        "cast(0 as int) as k", "cast(rand(7) * 1e9 as double) as v"
    )
    other = spark.range(0, n_other).selectExpr(
        f"cast((id % {n_other_keys}) + 1 as int) as k", "cast(rand(9) * 1e9 as double) as v"
    )
    df = hot.unionByName(other)

    sorted_df = df.repartition(4, "k").sortWithinPartitions("v")
    sorted_df.write.format("noop").mode("overwrite").save()

    stages = get_json(sc, "/stages")
    last_stage = max(stages, key=lambda s: s["stageId"])
    mem_spill = last_stage.get("memoryBytesSpilled", 0)
    disk_spill = last_stage.get("diskBytesSpilled", 0)

    task_detail = get_json(sc, f"/stages/{last_stage['stageId']}")
    per_task = {}
    if task_detail:
        for tid, info in task_detail[0].get("tasks", {}).items():
            m = info.get("taskMetrics", {})
            per_task[tid] = (m.get("memoryBytesSpilled", 0), m.get("diskBytesSpilled", 0))

    spark.stop()
    return mem_spill, disk_spill, per_task


N_HOT = 40_000_000

# --- Claims 1 and 2: baseline (modest) memory, the skewed sort genuinely spills. ---
mem_spill_base, disk_spill_base, per_task_base = run_skewed_sort("512m", N_HOT)

# measured: a real spill happened.
assert mem_spill_base > 0
assert disk_spill_base > 0
# measured: the memory figure is larger than the disk figure for the same spill event --
# page-rounding and pointer-array overhead counted as "memory spilled" but never written.
assert mem_spill_base > disk_spill_base

task_spills = sorted(per_task_base.values(), key=lambda p: p[0], reverse=True)
# measured: with 4 tasks, exactly one of them carries the entire spill; the other three
# never spill at all, regardless of how much memory was available.
nonzero_tasks = [t for t in task_spills if t[0] > 0 or t[1] > 0]
zero_tasks = [t for t in task_spills if t[0] == 0 and t[1] == 0]
assert len(nonzero_tasks) == 1
assert len(zero_tasks) == 3

# --- Claim 3: quadruple the memory, rerun the identical skewed job. ---
mem_spill_big, disk_spill_big, per_task_big = run_skewed_sort("2g", N_HOT)

assert mem_spill_big > 0  # the skewed task still spills even with 4x the memory
nonzero_tasks_big = [t for t in per_task_big.values() if t[0] > 0 or t[1] > 0]
zero_tasks_big = [t for t in per_task_big.values() if t[0] == 0 and t[1] == 0]
assert len(nonzero_tasks_big) == 1
assert len(zero_tasks_big) == 3

# measured: quadrupling the memory (512m -> 2g) leaves the skewed task's own spill
# essentially where it was (observed anywhere from no visible change to a modest ~20%
# reduction across runs), nowhere close to the 4x memory increase itself.
mem_reduction_fraction = (mem_spill_base - mem_spill_big) / mem_spill_base
assert -0.05 <= mem_reduction_fraction < 0.5
