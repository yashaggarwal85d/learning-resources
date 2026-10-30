"""de.dag-scheduling-stage-boundaries — every number the reel shows, measured against a real
local Apache Spark 4.0.1 session (PySpark, local[4]). Actions use collect() rather than count(),
because count() always adds its own final merge stage even for an otherwise-narrow chain, which
would obscure the narrow/wide distinction this topic is actually about.
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def main():
    spark = (
        SparkSession.builder.appName("de.dag-scheduling-stage-boundaries")
        .master("local[4]")
        .getOrCreate()
    )
    sc = spark.sparkContext
    tracker = sc.statusTracker()

    def newest_job_stage_count():
        jid = max(tracker.getJobIdsForGroup(None))
        return jid, len(tracker.getJobInfo(jid).stageIds)

    # A chain of only narrow operations (filter, select — each output partition depends on
    # exactly one input partition) pipelines into ONE stage, however many operations are chained,
    # and its plan contains no shuffle Exchange at all.
    df = spark.range(0, 1_000_000, numPartitions=4)
    narrow_chain = df.filter(col("id") % 2 == 0).select((col("id") * 2).alias("doubled")).filter(col("doubled") > 100)
    narrow_rows = narrow_chain.collect()
    assert len(narrow_rows) > 0
    _, narrow_stages = newest_job_stage_count()
    assert narrow_stages == 1, narrow_stages

    narrow_plan = narrow_chain._jdf.queryExecution().toString()
    assert "Exchange" not in narrow_plan, "a purely narrow chain must not contain a shuffle Exchange"

    # The same source, grouped by a derived key (a wide dependency: one output partition needs
    # rows from every input partition, since any row could land in any bucket) forces a shuffle
    # and a SECOND stage, and its plan contains an Exchange.
    wide_df = df.groupBy((col("id") % 10).alias("bucket")).agg({"id": "count"})
    wide_rows = wide_df.collect()
    assert len(wide_rows) == 10, len(wide_rows)
    _, wide_stages = newest_job_stage_count()
    assert wide_stages == 2, wide_stages

    wide_plan = wide_df._jdf.queryExecution().toString()
    assert "Exchange" in wide_plan, "a groupBy must contain a shuffle Exchange in its plan"

    # A THIRD stage appears when a second, independent shuffle is chained after the first: group,
    # then re-partition the grouped result by a different key and aggregate again — each wide
    # dependency cuts one more stage boundary, exactly as many as there are shuffles.
    two_shuffle_df = wide_df.groupBy((col("bucket") % 3).alias("bucket3")).agg({"count(id)": "sum"})
    two_shuffle_rows = two_shuffle_df.collect()
    assert len(two_shuffle_rows) == 3, len(two_shuffle_rows)
    _, two_shuffle_stages = newest_job_stage_count()
    assert two_shuffle_stages == 3, two_shuffle_stages

    print(f"narrow chain (filter, select, filter): {narrow_stages} stage, no Exchange in the plan")
    print(f"one groupBy (wide dependency): {wide_stages} stages, Exchange present")
    print(f"groupBy then a second groupBy (two shuffles): {two_shuffle_stages} stages")

    spark.stop()


if __name__ == "__main__":
    main()
