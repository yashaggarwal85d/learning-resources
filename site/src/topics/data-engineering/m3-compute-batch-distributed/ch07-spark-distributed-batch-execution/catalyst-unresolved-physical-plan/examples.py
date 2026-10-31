"""de.catalyst-unresolved-physical-plan — every plan-text fact the reel shows, measured against a
real local Apache Spark 4.0.1 (PySpark, local[4]) session's own query-execution plans at each of
Catalyst's four stages: parsed (unresolved), analysed (resolved), optimised (rules applied),
physical (strategy selected).
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit


def main():
    spark = (
        SparkSession.builder.appName("de.catalyst-unresolved-physical-plan")
        .master("local[4]")
        # AQE can rewrite the physical plan at runtime based on actual shuffle statistics — a
        # separate, later optimisation layer (this chapter's own later topic). Disabled here so
        # the measured plan reflects Catalyst's own up-front planning decisions cleanly.
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )

    df = spark.range(0, 1_000).withColumnRenamed("id", "a").withColumn("b", col("a") * 2)

    # 1. Parse: a query written out of its most efficient order (filter after a narrowing select).
    q = df.select("a", "b").filter(col("a") > 10)
    qe = q._jdf.queryExecution()

    parsed = qe.logical().toString()
    analyzed = qe.analyzed().toString()
    optimized = qe.optimizedPlan().toString()

    # The parsed plan is UNRESOLVED: Catalyst marks every not-yet-resolved node with a leading
    # tick (') — this is the literal textual signal of "parse" having happened with no catalog
    # lookup yet.
    assert "'Filter" in parsed, parsed
    # 2. Analysis: after catalog resolution, every attribute carries a resolved id (#N), and the
    # unresolved tick marker is gone.
    assert "'Filter" not in analyzed, analyzed
    assert "#" in analyzed, analyzed

    # 3. Rule-based logical optimisation — predicate pushdown: the user wrote Filter on top of
    # Project (select, then filter); the optimizer moves the Filter BELOW the Project, closer to
    # the scan. Measured as a literal reordering of which keyword appears first in the plan text.
    assert analyzed.index("Filter") < analyzed.index("Project"), "analyzed: Filter should be the outer (first) node, as written"
    assert optimized.index("Project") < optimized.index("Filter"), "optimized: Project should now be outer; Filter pushed down"

    # 3b. Rule-based logical optimisation — constant folding: a literal arithmetic expression gets
    # folded into its single resulting literal at optimisation time, not left as two operands.
    q_fold = df.select((lit(1) + lit(2)).alias("x"))
    qe_fold = q_fold._jdf.queryExecution()
    analyzed_fold = qe_fold.analyzed().toString()
    optimized_fold = qe_fold.optimizedPlan().toString()
    assert "(1 + 2)" in analyzed_fold, analyzed_fold
    assert "(1 + 2)" not in optimized_fold, optimized_fold
    assert "3 AS" in optimized_fold, optimized_fold

    # 4. Physical planning — join strategy selection. A join against a small side (well under
    # spark.sql.autoBroadcastJoinThreshold's default of 10MB) is planned as a BroadcastHashJoin:
    # no shuffle Exchange on the large side at all.
    big = spark.range(0, 100_000, numPartitions=4).withColumnRenamed("id", "k").withColumn("w", col("k") * 2)
    small = spark.range(0, 10).withColumnRenamed("id", "k2").withColumn("v", col("k2") * 10).withColumnRenamed("k2", "k")

    broadcast_join = big.join(small, "k")
    broadcast_plan = broadcast_join._jdf.queryExecution().executedPlan().toString()
    assert "BroadcastHashJoin" in broadcast_plan, broadcast_plan
    assert "SortMergeJoin" not in broadcast_plan, broadcast_plan

    # Force the SAME shape of join (two Range-derived DataFrames) to skip broadcast eligibility by
    # disabling the threshold, and it falls back to a SortMergeJoin with a real shuffle Exchange on
    # BOTH sides — the strategy choice is cost-based (data size vs. the threshold), not fixed.
    spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
    big2 = spark.range(0, 100_000, numPartitions=4).withColumnRenamed("id", "k2").withColumn("w2", col("k2") * 3).withColumnRenamed("k2", "k")
    shuffle_join = big.join(big2, "k")
    shuffle_plan = shuffle_join._jdf.queryExecution().executedPlan().toString()
    assert "SortMergeJoin" in shuffle_plan, shuffle_plan
    assert "BroadcastHashJoin" not in shuffle_plan, shuffle_plan
    assert shuffle_plan.count("Exchange hashpartitioning") == 2, shuffle_plan

    print("parsed plan has unresolved tick marker:", "'Filter" in parsed)
    print("analyzed plan resolved, no tick marker:", "'Filter" not in analyzed, "has resolved ids:", "#" in analyzed)
    print(f"predicate pushdown — analyzed order Filter<Project: {analyzed.index('Filter') < analyzed.index('Project')}, optimized order Project<Filter: {optimized.index('Project') < optimized.index('Filter')}")
    print("constant folding — analyzed has (1 + 2):", "(1 + 2)" in analyzed_fold, ", optimized has 3 AS:", "3 AS" in optimized_fold)
    print("small join physical strategy: BroadcastHashJoin present:", "BroadcastHashJoin" in broadcast_plan)
    print("large join (broadcast disabled) physical strategy: SortMergeJoin present, 2 Exchange nodes:", "SortMergeJoin" in shuffle_plan, shuffle_plan.count("Exchange hashpartitioning"))

    spark.stop()


if __name__ == "__main__":
    main()
