"""de.task-scheduling-locality-parallelism — every number the reel shows, measured against a real
local Apache Spark 4.0.1 session (PySpark, local[4]): the independence of spark.default.parallelism
(an RDD-level, core-count-driven default) from spark.sql.shuffle.partitions (a SQL-layer
config, default 200), confirmed in both directions.
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def main():
    spark = (
        SparkSession.builder.appName("de.task-scheduling-locality-parallelism")
        .master("local[4]")
        # AQE's coalescePartitions feature (on by default in 4.x) shrinks a shuffle's actual
        # output partition count at runtime based on data volume — a different, later-pipeline
        # optimisation this topic isn't about. Disabled here so the measured partition count
        # reflects spark.sql.shuffle.partitions itself, the setting this topic actually covers.
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )

    # 1. A bare RDD, no explicit partition count, created with no parent RDD: its partition count
    # is spark.default.parallelism, which in local mode is exactly the core count (local[4] -> 4).
    bare_rdd = spark.sparkContext.parallelize(range(1_000_000))
    assert bare_rdd.getNumPartitions() == 4, bare_rdd.getNumPartitions()

    default_parallelism = spark.sparkContext.defaultParallelism
    assert default_parallelism == 4, default_parallelism

    # 2. A wide shuffle (groupBy) on a DataFrame with the SAME four-partition source, with
    # spark.sql.shuffle.partitions left at its own default: the shuffle's OUTPUT partition count is
    # 200, completely independent of the 4-core default parallelism just measured above.
    df = spark.range(0, 1_000_000, numPartitions=4)
    default_shuffle_partitions = int(spark.conf.get("spark.sql.shuffle.partitions"))
    assert default_shuffle_partitions == 200, default_shuffle_partitions

    grouped = df.groupBy((col("id") % 97).alias("bucket")).count()
    assert grouped.rdd.getNumPartitions() == 200, grouped.rdd.getNumPartitions()

    # 3. Set spark.sql.shuffle.partitions explicitly to 8 and re-run the SAME groupBy: only the
    # shuffle's own output partition count moves, to 8.
    spark.conf.set("spark.sql.shuffle.partitions", "8")
    grouped_8 = df.groupBy((col("id") % 97).alias("bucket")).count()
    assert grouped_8.rdd.getNumPartitions() == 8, grouped_8.rdd.getNumPartitions()

    # 4. And a FRESH bare RDD, created after that change, still gets the unchanged 4 — proving the
    # independence holds in the other direction too: changing the shuffle config never touches
    # spark.default.parallelism or the core-count-driven partition count of a plain parallelize.
    fresh_rdd = spark.sparkContext.parallelize(range(1_000_000))
    assert fresh_rdd.getNumPartitions() == 4, fresh_rdd.getNumPartitions()
    assert spark.sparkContext.defaultParallelism == 4, spark.sparkContext.defaultParallelism

    print(f"default parallelism (local[4]): {default_parallelism} partitions, bare RDD: {bare_rdd.getNumPartitions()}")
    print(f"default spark.sql.shuffle.partitions: {default_shuffle_partitions}, groupBy output partitions: {grouped.rdd.getNumPartitions()}")
    print(f"after setting shuffle.partitions=8: groupBy output partitions: {grouped_8.rdd.getNumPartitions()}")
    print(f"fresh bare RDD after that change: {fresh_rdd.getNumPartitions()} partitions (unchanged)")

    spark.stop()


if __name__ == "__main__":
    main()
