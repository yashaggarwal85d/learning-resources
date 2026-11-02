"""de.tungsten-whole-stage-codegen — every plan-text and generated-code fact the reel shows,
measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session's own
debug.codegen()-equivalent output (org.apache.spark.sql.execution.debug.package, reached via the
JVM gateway, since PySpark has no public wrapper for Scala's implicit debugCodegen()).
"""
import shutil
import tempfile

from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def main():
    spark = (
        SparkSession.builder.appName("de.tungsten-whole-stage-codegen")
        .master("local[4]")
        .config("spark.sql.adaptive.enabled", "false")
        .getOrCreate()
    )
    debug_pkg = spark.sparkContext._jvm.org.apache.spark.sql.execution.debug.package

    df = spark.range(0, 1_000_000).withColumnRenamed("id", "a").withColumn("b", col("a") * 2)
    q = df.filter(col("a") > 10).select((col("a") + col("b")).alias("c"))
    plan_str = q._jdf.queryExecution().executedPlan().toString()

    # 1. Fusion: three operators (Range, Filter, Project) all carry the SAME codegen stage marker,
    # *(1) — one generated method covers all three, not one virtual next() call per operator.
    assert plan_str.count("*(1)") == 3, plan_str
    codegen_text = debug_pkg.codegenString(q._jdf.queryExecution().executedPlan())
    assert "Found 1 WholeStageCodegen subtrees." in codegen_text, codegen_text

    # 2. UnsafeRow binary layout: the generated Java source itself writes rows through
    # UnsafeRowWriter, not as ordinary JVM objects with per-field getters/setters.
    assert "UnsafeRowWriter" in codegen_text, codegen_text
    assert "UnsafeRow" in codegen_text, codegen_text

    # 3. The vectorised Parquet reader is the columnar exception: it reports Batched: true and
    # carries NO codegen-stage marker of its own, with a separate ColumnarToRow node bridging it
    # into the row-based, codegen-fused rest of the pipeline.
    work_dir = tempfile.mkdtemp(prefix="tungsten-parquet-")
    try:
        df.write.mode("overwrite").parquet(work_dir)
        parquet_df = spark.read.parquet(work_dir).filter(col("a") > 10)
        parquet_plan = parquet_df._jdf.queryExecution().executedPlan().toString()
        assert "Batched: true" in parquet_plan, parquet_plan
        assert "ColumnarToRow" in parquet_plan, parquet_plan
        # The FileScan line itself has no leading "*(N)" codegen marker (it is columnar, not
        # row-at-a-time generated code); ColumnarToRow and the Filter above it DO share one.
        file_scan_line = next(line for line in parquet_plan.splitlines() if "FileScan parquet" in line)
        assert not file_scan_line.strip().startswith("*"), file_scan_line
        assert "*(1) ColumnarToRow" in parquet_plan, parquet_plan
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

    # 4. Codegen fallback, forced deterministically: dropping spark.sql.codegen.maxFields to 0
    # makes every stage exceed the field-count limit, so Spark silently falls back to the
    # non-generated (volcano/interpreted) execution path — zero codegen-stage markers anywhere.
    spark.conf.set("spark.sql.codegen.maxFields", "0")
    q_fallback = df.filter(col("a") > 10).select((col("a") + col("b")).alias("c"))
    fallback_plan = q_fallback._jdf.queryExecution().executedPlan().toString()
    assert "*(1)" not in fallback_plan, fallback_plan
    fallback_codegen_text = debug_pkg.codegenString(q_fallback._jdf.queryExecution().executedPlan())
    assert "Found 0 WholeStageCodegen subtrees." in fallback_codegen_text, fallback_codegen_text

    print("fused codegen stage markers (normal plan):", plan_str.count("*(1)"))
    print("generated code uses UnsafeRow/UnsafeRowWriter:", "UnsafeRowWriter" in codegen_text)
    print("vectorised Parquet reader: Batched=true, no stage marker on FileScan, ColumnarToRow bridges in:", "Batched: true" in parquet_plan and "ColumnarToRow" in parquet_plan)
    print("forced fallback (maxFields=0): codegen stage markers present:", "*(1)" in fallback_plan, ", subtrees found:", "Found 0 WholeStageCodegen subtrees." in fallback_codegen_text)

    spark.stop()


if __name__ == "__main__":
    main()
