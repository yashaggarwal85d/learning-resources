"""
Measured: diagnosing skew from task-duration/shuffle-read-bytes ratios alone, and the remedy
ladder in the order the syllabus names it -- AQE skew-join splitting, broadcasting, salting --
plus why that same ladder's AQE step cannot reach a skewed aggregation, and the two-phase
remedy that does.

One key (k=0) holds 20,000,000 rows; the other 999 keys share 10,000,000 rows between them.
Every measurement below reuses this same skew, so the "straggler" in each stage is always the
same hot key, not a different confound each time.
"""
import json
import statistics
import urllib.request

from pyspark.sql import SparkSession
from pyspark.sql.functions import array, broadcast, collect_list, explode, floor, lit, rand
from pyspark.sql.functions import sum as fsum
from pyspark.sql.functions import flatten

spark = (
    SparkSession.builder.master("local[4]")
    .appName("de.data-skew-diagnosis-remedies")
    .config("spark.sql.adaptive.enabled", "false")
    .config("spark.sql.shuffle.partitions", "8")
    .config("spark.sql.autoBroadcastJoinThreshold", "-1")
    .getOrCreate()
)
sc = spark.sparkContext
APP_ID = sc.applicationId
UI_PORT = sc.uiWebUrl.split(":")[-1]

NUM_KEYS = 999
N_OTHER = 10_000_000
N_HOT = 20_000_000


def hot_partition(idx):
    import random

    rnd = random.Random(1000 + idx)
    for _ in range(N_HOT // 8):
        yield (0, rnd.randint(0, 2**31))


def rest_partition(idx):
    import random

    rnd = random.Random(2000 + idx)
    for _ in range(N_OTHER // 8):
        yield (rnd.randint(1, NUM_KEYS), rnd.randint(0, 2**31))


def skewed_fact_table():
    hot = sc.parallelize(range(8), 8).flatMap(hot_partition)
    rest = sc.parallelize(range(8), 8).flatMap(rest_partition)
    return spark.createDataFrame(hot.union(rest), ["k", "v"])


def dim_table(n_keys=NUM_KEYS):
    return spark.range(0, n_keys + 1).withColumnRenamed("id", "k2")


def fetch_stages():
    url = f"http://localhost:{UI_PORT}/api/v1/applications/{APP_ID}/stages?details=true"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


def fetch_tasks(stage_id):
    url = (
        f"http://localhost:{UI_PORT}/api/v1/applications/{APP_ID}/stages/"
        f"{stage_id}/0/taskList?length=100"
    )
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


def latest_reduce_stage(num_tasks, min_bytes=1_000_000):
    stages = fetch_stages()
    cand = [
        s
        for s in stages
        if s.get("numTasks") == num_tasks and s.get("shuffleReadBytes", 0) > min_bytes
    ]
    cand.sort(key=lambda s: -s["stageId"])
    return cand[0]["stageId"]


def task_shuffle_read_bytes(stage_id):
    tasks = fetch_tasks(stage_id)
    reads = []
    for t in tasks:
        srm = t.get("taskMetrics", {}).get("shuffleReadMetrics", {})
        reads.append(srm.get("remoteBytesRead", 0) + srm.get("localBytesRead", 0))
    return sorted(reads)


def task_durations(stage_id):
    return sorted(t["duration"] for t in fetch_tasks(stage_id))


def ratio(values):
    med = statistics.median(values)
    return max(values) / med if med else float("inf")


def stage_cursor():
    return max((s["stageId"] for s in fetch_stages()), default=-1)


def earliest_reduce_stage_after(after_id, num_tasks, min_bytes=1000):
    cand = [
        s
        for s in fetch_stages()
        if s["stageId"] > after_id
        and s.get("numTasks") == num_tasks
        and s.get("shuffleReadBytes", 0) > min_bytes
    ]
    return min(cand, key=lambda s: s["stageId"])["stageId"]


# --- Claim 1: baseline evidence -- one straggler task, visible as a max/median ratio on
# both duration and shuffle-read bytes, no AQE involved. ---

fact = skewed_fact_table()
dim = dim_table()
fact.join(dim, fact.k == dim.k2).selectExpr("sum(v) as s").collect()

baseline_stage = latest_reduce_stage(num_tasks=8)
baseline_durations = task_durations(baseline_stage)
baseline_bytes = task_shuffle_read_bytes(baseline_stage)
baseline_duration_ratio = ratio(baseline_durations)
baseline_bytes_ratio = ratio(baseline_bytes)
print("baseline duration ratio:", baseline_duration_ratio)
print("baseline bytes ratio:", baseline_bytes_ratio)
# reel/narration figures for this baseline, from a representative run: ~4x duration, 12.2x bytes.
assert baseline_duration_ratio > 2.5
assert baseline_bytes_ratio > 8

# --- Claim 2: AQE's skew-join handling with default thresholds does not fix this --
# the default skewedPartitionThresholdInBytes (256MB) is larger than the skewed
# partition's own real size (~155MB) at this data scale. ---

spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

fact = skewed_fact_table()
dim = dim_table()
fact.join(dim, fact.k == dim.k2).selectExpr("sum(v) as s").collect()
default_aqe_stage = latest_reduce_stage(num_tasks=8)
default_aqe_bytes = task_shuffle_read_bytes(default_aqe_stage)
default_aqe_ratio = ratio(default_aqe_bytes)
print("AQE skew-join, default thresholds, bytes ratio:", default_aqe_ratio)
skewed_partition_mb = max(default_aqe_bytes) / 1_000_000
print("skewed partition's own real size (MB):", skewed_partition_mb)
assert default_aqe_ratio > 8  # unchanged from baseline: the default threshold never triggers
assert 100 < skewed_partition_mb < 200  # genuinely below Spark's own default 256 (MB) threshold
# reel/narration figure, from a representative run: this partition measures roughly 155 (MB).

# --- Claim 3: lowering the skew threshold and advisory partition size to the data's own
# scale makes AQE actually split the skewed partition. ---

spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "16m")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "16m")

fact = skewed_fact_table()
dim = dim_table()
fact.join(dim, fact.k == dim.k2).selectExpr("sum(v) as s").collect()
tuned_aqe_stage = latest_reduce_stage(num_tasks=16)  # the split grows task count
tuned_aqe_bytes = task_shuffle_read_bytes(tuned_aqe_stage)
tuned_aqe_ratio = ratio(tuned_aqe_bytes)
print("AQE skew-join, tuned thresholds, bytes ratio:", tuned_aqe_ratio)
assert tuned_aqe_ratio < 1.3  # essentially balanced, down from the baseline's double digits
# reel/narration figure, from a representative run: roughly 1.1, down from 12.2.

spark.conf.set("spark.sql.adaptive.enabled", "false")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "false")

# --- Claim 4: broadcasting the small side removes the shuffle on the fact table outright --
# there is nothing left on that side to be skewed. ---

fact = skewed_fact_table()
dim = dim_table()
broadcast_joined = fact.join(broadcast(dim), fact.k == dim.k2)
broadcast_joined.selectExpr("sum(v) as s").collect()
broadcast_plan = broadcast_joined._jdf.queryExecution().executedPlan().toString()
assert "BroadcastHashJoin" in broadcast_plan
assert "SortMergeJoin" not in broadcast_plan
assert "ShuffledHashJoin" not in broadcast_plan
print("broadcast remedy: no shuffle join of any kind in the plan")

# --- Claim 5: salting helps, but it is not free -- replicating the small side across every
# salt bucket adds shuffle bytes nowhere else on the ladder costs. ---

SALT_N = 8
salted_fact = skewed_fact_table().withColumn("salt", floor(rand(42) * SALT_N))
salted_dim = dim_table().withColumn(
    "salt", explode(array(*[lit(i) for i in range(SALT_N)]))
)
salted_joined = salted_fact.join(
    salted_dim, (salted_fact.k == salted_dim.k2) & (salted_fact.salt == salted_dim.salt)
)
salted_joined.selectExpr("sum(v) as s").collect()
salted_stage = latest_reduce_stage(num_tasks=8)
salted_bytes = task_shuffle_read_bytes(salted_stage)
salted_durations = task_durations(salted_stage)
salted_bytes_ratio = ratio(salted_bytes)
salted_duration_ratio = ratio(salted_durations)
print("salting bytes ratio:", salted_bytes_ratio, "duration ratio:", salted_duration_ratio)
assert 1.5 < salted_bytes_ratio < 4  # real improvement over baseline, worse than AQE's split
assert sum(salted_bytes) > sum(baseline_bytes)  # the replicated dimension's real cost
# reel/narration figures, from a representative run: bytes ratio ~3.2, duration ratio ~2.6.

# --- Claim 6: a combinable aggregate isn't skewed at the shuffle at all -- map-side partial
# aggregation already collapsed the hot key to one row per task before any shuffle ran. ---

agg_fact = skewed_fact_table()
agg_fact.groupBy("k").agg(fsum("v").alias("s")).collect()
write_candidates = [
    s for s in fetch_stages() if s.get("numTasks") == 16 and s.get("shuffleWriteBytes", 0) > 0
]
write_stage_id = max(write_candidates, key=lambda s: s["stageId"])["stageId"]
write_tasks = fetch_tasks(write_stage_id)
writes = sorted(
    t["taskMetrics"]["shuffleWriteMetrics"]["bytesWritten"]
    for t in write_tasks
    if "taskMetrics" in t
)
hot_task_write = min(writes)  # the hot key collapsed to one row: the smallest write, not biggest
diverse_task_write = max(writes)  # a partition with up to 999 distinct keys writes more
print("combinable aggregate: hot-partition write bytes:", hot_task_write,
      "diverse-partition write bytes:", diverse_task_write)
assert hot_task_write < 500
assert diverse_task_write > 5_000
# reel/narration figures, from a representative run: hot-partition write 59 bytes,
# diverse-key partition write 12,750 bytes.

# --- Claim 7: a non-combinable aggregate has nowhere to hide the same way -- one reduce
# task gets the whole hot key's list. ---

N_OTHER_SMALL = 2_000_000
N_HOT_SMALL = 4_000_000


def hot_small(idx):
    import random

    rnd = random.Random(1000 + idx)
    for _ in range(N_HOT_SMALL // 8):
        yield (0, rnd.randint(0, 2**31))


def rest_small(idx):
    import random

    rnd = random.Random(2000 + idx)
    for _ in range(N_OTHER_SMALL // 8):
        yield (rnd.randint(1, NUM_KEYS), rnd.randint(0, 2**31))


small_fact = spark.createDataFrame(
    sc.parallelize(range(8), 8).flatMap(hot_small).union(
        sc.parallelize(range(8), 8).flatMap(rest_small)
    ),
    ["k", "v"],
)
naive = small_fact.groupBy("k").agg(collect_list("v").alias("vs"))
naive.filter("k = 0").selectExpr("size(vs) as n").collect()
naive_stage = latest_reduce_stage(num_tasks=8, min_bytes=1000)
naive_durations = task_durations(naive_stage)
naive_ratio = ratio(naive_durations)
print("non-combinable aggregate duration ratio:", naive_ratio)
assert naive_ratio > 8
# reel/narration figure: "well over 10" -- the true ratio is noisy run to run (observed roughly
# 8-26 across repeated runs on this sandbox); the assert and the reel text are both deliberately
# conservative rather than quoting one decimal that would not survive a re-run.

# --- Claim 8: the two-phase remedy -- salt the key, aggregate partially, then re-aggregate
# by the real key alone -- spreads that same hot key's work across tasks instead of one. ---

two_phase_fact = spark.createDataFrame(
    sc.parallelize(range(8), 8).flatMap(hot_small).union(
        sc.parallelize(range(8), 8).flatMap(rest_small)
    ),
    ["k", "v"],
).withColumn("salt", floor(rand(42) * SALT_N))
two_phase_cursor = stage_cursor()
partial = two_phase_fact.groupBy("k", "salt").agg(collect_list("v").alias("vs"))
final = partial.groupBy("k").agg(flatten(collect_list("vs")).alias("vs"))
final.filter("k = 0").selectExpr("size(vs) as n").collect()

# the partial (salted) aggregation's own reduce stage runs before the final merge stage,
# so it has the lower stageId of the two 8-task shuffle-read stages this query creates.
partial_stage = earliest_reduce_stage_after(two_phase_cursor, num_tasks=8, min_bytes=1000)
partial_durations = task_durations(partial_stage)
partial_ratio = ratio(partial_durations)
print("two-phase remedy, partial-aggregation stage duration ratio:", partial_ratio)
assert partial_ratio < naive_ratio
assert partial_ratio < 4
# reel/narration figure, from a representative run: roughly 2.3, down from well over 10.

# --- Claim 9 is sourced only, not re-measured here: OptimizeSkewedJoin.scala's own
# `optimizeSkewJoin` pattern-matches exactly SortMergeJoinExec and ShuffledHashJoinExec and
# nothing else (verified directly against the GitHub tag v4.0.0 source, see SOURCES.md) --
# the source-level reason claims 6-8's aggregation cases, the preserved side of an outer
# join, and window functions are all outside what AQE's skew-join rule can ever rewrite.

spark.stop()
print("all skew diagnosis/remedy claims verified against real PySpark 4.0.1.")
