"""
de.spark-output-file-layout — measured against real PySpark 4.0.1, local[4].

Claim 1: output file count = writing tasks x partitions touched.
Claim 2: maxRecordsPerFile caps rows per file, independent of task count.
Claim 3: the REBALANCE hint only changes output file count when AQE is enabled;
         REBALANCE(col) aligns the coalesced output to the partition columns.
"""
import shutil
import glob

from pyspark.sql import SparkSession


def count_files(path):
    return len(glob.glob(path + "/**/*.parquet", recursive=True))


BASE = "/tmp/claude-0/scratch/examples16-out"
shutil.rmtree(BASE, ignore_errors=True)

# ---------------------------------------------------------------------------
# Claim 1: file count = tasks x partitions touched. AQE off, so the task
# count at write time is exactly the number of partitions in the DataFrame.
# ---------------------------------------------------------------------------
spark1 = (
    SparkSession.builder.master("local[4]")
    .appName("examples16-claim1")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)

df1 = spark1.range(0, 1_000_000).selectExpr("id", "id % 4 as k")
N_PARTITIONS_TOUCHED = 4  # distinct values of k

files_by_tasks = {}
for n_tasks in (2, 4, 8):
    p = f"{BASE}/claim1_tasks_{n_tasks}"
    df1.repartition(n_tasks).write.mode("overwrite").partitionBy("k").parquet(p)
    files_by_tasks[n_tasks] = count_files(p)

# measured: tasks=2 -> 8 files, tasks=4 -> 16 files, tasks=8 -> 32 files
assert files_by_tasks[2] == 2 * N_PARTITIONS_TOUCHED == 8
assert files_by_tasks[4] == 4 * N_PARTITIONS_TOUCHED == 16
assert files_by_tasks[8] == 8 * N_PARTITIONS_TOUCHED == 32
for n_tasks, n_files in files_by_tasks.items():
    assert n_files == n_tasks * N_PARTITIONS_TOUCHED

spark1.stop()

# ---------------------------------------------------------------------------
# Claim 2: maxRecordsPerFile caps rows per file. With 2 tasks writing into 4
# partitions, each task's ~125,000 rows per partition get split into
# ceil(125000 / 50000) = 3 files per task per partition once the cap is set.
# ---------------------------------------------------------------------------
spark2 = (
    SparkSession.builder.master("local[4]")
    .appName("examples16-claim2")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)

df2 = spark2.range(0, 1_000_000).selectExpr("id", "id % 4 as k")

p_baseline = f"{BASE}/claim2_baseline"
df2.repartition(2).write.mode("overwrite").partitionBy("k").parquet(p_baseline)
baseline_files = count_files(p_baseline)
assert baseline_files == 8  # same tasks x partitions rule as claim 1

MAX_RECORDS_PER_FILE = 50_000
p_capped = f"{BASE}/claim2_capped"
(
    df2.repartition(2)
    .write.mode("overwrite")
    .option("maxRecordsPerFile", MAX_RECORDS_PER_FILE)
    .partitionBy("k")
    .parquet(p_capped)
)
capped_files = count_files(p_capped)

# measured: 24 files (up from 8), one 2x-the-task-count jump in file count
# for the same data, with no change to repartition(2) at all.
assert capped_files == 24
assert capped_files > baseline_files

row_counts = [
    spark2.read.parquet(f).count()
    for f in sorted(glob.glob(p_capped + "/**/*.parquet", recursive=True))
]
# every file respects the cap: max observed row count across all 24 files
# was exactly 50,000 (the cap itself), every run.
assert max(row_counts) == MAX_RECORDS_PER_FILE
assert all(c <= MAX_RECORDS_PER_FILE for c in row_counts)

spark2.stop()

# ---------------------------------------------------------------------------
# Claim 3: REBALANCE only does anything with AQE on; REBALANCE(col) further
# aligns the coalesced output to the partition column.
# ---------------------------------------------------------------------------
spark3_off = (
    SparkSession.builder.master("local[4]")
    .appName("examples16-claim3-aqe-off")
    .config("spark.sql.adaptive.enabled", "false")
    .getOrCreate()
)

df3_off = spark3_off.range(0, 1_000_000).selectExpr("id", "id % 4 as k")
df3_off.repartition(32).createOrReplaceTempView("t32")

p_norebal_off = f"{BASE}/claim3_norebalance_aqe_off"
spark3_off.sql("select * from t32").write.mode("overwrite").partitionBy("k").parquet(
    p_norebal_off
)
norebal_off_files = count_files(p_norebal_off)
assert norebal_off_files == 32 * N_PARTITIONS_TOUCHED == 128  # same tasks x partitions rule

p_rebal_off = f"{BASE}/claim3_rebalance_aqe_off"
spark3_off.sql("select /*+ REBALANCE */ * from t32").write.mode("overwrite").partitionBy(
    "k"
).parquet(p_rebal_off)
rebal_off_files = count_files(p_rebal_off)

# measured: the hint is silently ignored without AQE -- same file count either way.
assert rebal_off_files == norebal_off_files == 128

spark3_off.stop()

spark3_on = (
    SparkSession.builder.master("local[4]")
    .appName("examples16-claim3-aqe-on")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.minPartitionSize", "1m")
    .getOrCreate()
)

df3_on = spark3_on.range(0, 1_000_000).selectExpr("id", "id % 4 as k")
df3_on.repartition(32).createOrReplaceTempView("t32")

p_norebal_on = f"{BASE}/claim3_norebalance_aqe_on"
spark3_on.sql("select * from t32").write.mode("overwrite").partitionBy("k").parquet(
    p_norebal_on
)
norebal_on_files = count_files(p_norebal_on)
# measured: AQE on by itself doesn't touch a write with no hint -- still 128.
assert norebal_on_files == 128

p_rebal_on = f"{BASE}/claim3_rebalance_aqe_on"
spark3_on.sql("select /*+ REBALANCE */ * from t32").write.mode("overwrite").partitionBy(
    "k"
).parquet(p_rebal_on)
rebal_on_files = count_files(p_rebal_on)

p_rebal_col_on = f"{BASE}/claim3_rebalance_col_aqe_on"
spark3_on.sql("select /*+ REBALANCE(k) */ * from t32").write.mode("overwrite").partitionBy(
    "k"
).parquet(p_rebal_col_on)
rebal_col_on_files = count_files(p_rebal_col_on)

# measured: plain REBALANCE coalesces the 32-task shuffle down before the
# write, cutting 128 files to 16. REBALANCE(k) rebalances by the partition
# column itself, landing on exactly one file per partition value (4).
assert rebal_on_files == 16
assert rebal_col_on_files == N_PARTITIONS_TOUCHED == 4
assert rebal_col_on_files < rebal_on_files < norebal_on_files

spark3_on.stop()
