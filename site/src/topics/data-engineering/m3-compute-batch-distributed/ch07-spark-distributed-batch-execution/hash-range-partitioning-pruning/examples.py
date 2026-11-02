"""de.hash-range-partitioning-pruning — every plan-text fact the reel shows, measured against a
real local Apache Spark 4.0.1 (PySpark, local[4]) session.
"""
import shutil
import tempfile

from pyspark.sql import SparkSession, Window
from pyspark.sql.functions import avg as favg
from pyspark.sql.functions import col
from pyspark.sql.functions import sum as fsum


def main():
    spark = (
        SparkSession.builder.appName("de.hash-range-partitioning-pruning")
        .master("local[4]")
        .config("spark.sql.adaptive.enabled", "false")
        .config("spark.sql.shuffle.partitions", "4")
        .getOrCreate()
    )

    df = spark.range(0, 1_000_000).withColumn("k", (col("id") % 1000))

    # 1. Hash partitioner vs sampled range partitioner: a groupBy's own shuffle is tagged
    # hashpartitioning; an orderBy's own shuffle, needing a global sort, is tagged
    # rangepartitioning — the exact two plan-text signals naming which partitioner a shuffle uses.
    group_plan = df.groupBy("k").count()._jdf.queryExecution().executedPlan().toString()
    assert "hashpartitioning" in group_plan, group_plan
    sort_plan = df.orderBy("k")._jdf.queryExecution().executedPlan().toString()
    assert "rangepartitioning" in sort_plan, sort_plan

    # 2. Exchange elimination: two window operations back to back, partitioned by the SAME key,
    # share one Exchange — the second one's required distribution is already satisfied by the
    # first's, so Catalyst doesn't add a second. Partitioning by two DIFFERENT keys back to back
    # genuinely needs two separate Exchanges, confirming the elimination isn't just "windows are
    # always free."
    w_k = Window.partitionBy("k")
    df2 = df.withColumn("j", (col("id") % 37))
    same_key = df2.withColumn("s", fsum("id").over(w_k)).withColumn("a", favg("id").over(w_k))
    same_plan = same_key._jdf.queryExecution().executedPlan().toString()
    assert same_plan.count("Exchange") == 1, same_plan

    w_j = Window.partitionBy("j")
    diff_key = df2.withColumn("s", fsum("id").over(w_k)).withColumn("a", favg("id").over(w_j))
    diff_plan = diff_key._jdf.queryExecution().executedPlan().toString()
    assert diff_plan.count("Exchange") == 2, diff_plan

    # 3. Static partition pruning on a Hive-style directory layout: writing a dataset
    # partitioned by a column, then filtering on that column, shows a real PartitionFilters
    # entry in the scan node, naming the exact pruning predicate. The identical filter against a
    # flat (unpartitioned) layout shows an empty PartitionFilters list — there is no directory
    # structure to prune against, confirming this is specifically about the Hive-style layout,
    # not the filter alone.
    part_dir = tempfile.mkdtemp(prefix="de-hash-range-partitioned-")
    flat_dir = tempfile.mkdtemp(prefix="de-hash-range-flat-")
    try:
        small = spark.range(0, 100_000).withColumn("day", (col("id") % 10))
        small.write.mode("overwrite").partitionBy("day").parquet(part_dir)
        small.write.mode("overwrite").parquet(flat_dir)

        part_plan = (
            spark.read.parquet(part_dir)
            .filter(col("day") == 3)
            ._jdf.queryExecution()
            .executedPlan()
            .toString()
        )
        part_scan_line = next(line for line in part_plan.splitlines() if "FileScan parquet" in line)
        assert "PartitionFilters: [isnotnull" in part_scan_line, part_scan_line
        assert "(day#" in part_scan_line and "= 3)" in part_scan_line, part_scan_line

        flat_plan = (
            spark.read.parquet(flat_dir)
            .filter(col("day") == 3)
            ._jdf.queryExecution()
            .executedPlan()
            .toString()
        )
        flat_scan_line = next(line for line in flat_plan.splitlines() if "FileScan parquet" in line)
        assert "PartitionFilters: []" in flat_scan_line, flat_scan_line
    finally:
        shutil.rmtree(part_dir, ignore_errors=True)
        shutil.rmtree(flat_dir, ignore_errors=True)

    print("groupBy uses hashpartitioning:", "hashpartitioning" in group_plan)
    print("orderBy uses rangepartitioning:", "rangepartitioning" in sort_plan)
    print("same-key back-to-back windows, Exchange count:", same_plan.count("Exchange"))
    print("different-key back-to-back windows, Exchange count:", diff_plan.count("Exchange"))
    print("partitioned layout, filtered scan has real PartitionFilters:", "PartitionFilters: [isnotnull" in part_scan_line)
    print("flat layout, filtered scan has empty PartitionFilters:", "PartitionFilters: []" in flat_scan_line)

    spark.stop()


if __name__ == "__main__":
    main()
