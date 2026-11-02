"""de.partition-sizing-repartition-coalesce — every partition-count and plan-text fact the reel
shows, measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session.
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def main():
    spark = (
        SparkSession.builder.appName("de.partition-sizing-repartition-coalesce")
        .master("local[4]")
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )

    # 1. Shuffle partition count is a config, not a derived number: the exact same groupBy
    # produces exactly as many output partitions as spark.sql.shuffle.partitions says.
    df = spark.range(0, 1_000_000)
    spark.conf.set("spark.sql.shuffle.partitions", "4")
    g4 = df.groupBy((col("id") % 10).alias("k")).count()
    assert g4.rdd.getNumPartitions() == 4, g4.rdd.getNumPartitions()

    spark.conf.set("spark.sql.shuffle.partitions", "17")
    g17 = df.groupBy((col("id") % 10).alias("k")).count()
    assert g17.rdd.getNumPartitions() == 17, g17.rdd.getNumPartitions()

    # 2. repartition introduces a real shuffle Exchange and produces exactly N even-ish
    # partitions; coalesce produces the same N partitions with no new Exchange at all — a narrow
    # merge, not a shuffle. Both start from the identical 8-partition base with no Exchange of
    # its own, so any Exchange found below comes from the repartition/coalesce call itself.
    base = spark.range(0, 1_000_000, 1, 8)
    base_plan = base._jdf.queryExecution().executedPlan().toString()
    assert "Exchange" not in base_plan, base_plan
    assert base.rdd.getNumPartitions() == 8, base.rdd.getNumPartitions()

    rep = base.repartition(3)
    assert rep.rdd.getNumPartitions() == 3, rep.rdd.getNumPartitions()
    rep_plan = rep._jdf.queryExecution().executedPlan().toString()
    assert "Exchange" in rep_plan, rep_plan

    coal = base.coalesce(3)
    assert coal.rdd.getNumPartitions() == 3, coal.rdd.getNumPartitions()
    coal_plan = coal._jdf.queryExecution().executedPlan().toString()
    assert "Exchange" not in coal_plan, coal_plan

    # 3. coalesce can only merge partitions, never split them: asking for more partitions than
    # you started with silently keeps the original count instead of growing it.
    coal_up = base.coalesce(20)
    assert coal_up.rdd.getNumPartitions() == 8, coal_up.rdd.getNumPartitions()

    # 4. The coalesce(1) trap: collapsing to one partition narrowly merges every upstream
    # partition's own task into that single task too, not just the final output. A wide,
    # 8-partition read collapses into exactly one partition holding every single row, measured
    # by counting rows per partition directly rather than trusting the final count alone.
    wide = spark.range(0, 2_000_000, 1, 8)
    assert wide.rdd.getNumPartitions() == 8, wide.rdd.getNumPartitions()
    collapsed = wide.coalesce(1)
    assert collapsed.rdd.getNumPartitions() == 1, collapsed.rdd.getNumPartitions()
    counts_per_partition = collapsed.rdd.mapPartitions(lambda it: [sum(1 for _ in it)]).collect()
    assert counts_per_partition == [2_000_000], counts_per_partition

    print("shuffle.partitions=4 -> groupBy partitions:", g4.rdd.getNumPartitions())
    print("shuffle.partitions=17 -> groupBy partitions:", g17.rdd.getNumPartitions())
    print("repartition(3): partitions =", rep.rdd.getNumPartitions(), ", has Exchange =", "Exchange" in rep_plan)
    print("coalesce(3): partitions =", coal.rdd.getNumPartitions(), ", has Exchange =", "Exchange" in coal_plan)
    print("coalesce(20) from 8 partitions stays at:", coal_up.rdd.getNumPartitions())
    print("coalesce(1) on an 8-partition, 2,000,000-row dataset: partitions =", collapsed.rdd.getNumPartitions(), ", rows in that one partition =", counts_per_partition[0])

    spark.stop()


if __name__ == "__main__":
    main()
