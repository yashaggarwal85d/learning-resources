"""Measured directly (see SOURCES.md).

PostgreSQL numbers: two real clusters on this sandbox -- PostgreSQL 16.15 (the existing "shop"
database used by topics 23-26) on port 5432, and a freshly installed PostgreSQL 18.6 on port
5433 (`sudo pg_createcluster 18 main --port=5433`), both queried directly with `psql`.

Spark numbers: Apache Spark 3.5.9 (`pyspark==3.5.9`) in local[2]/local[4] mode, from the same
Python 3.11 venv used in topic 26, with `spark.ui.enabled=true` so its own REST API
(`/api/v1/applications/<id>/stages`) could be queried directly with a plain HTTP request.
"""

# --- PostgreSQL: the same EXPLAIN (ANALYZE) command, two versions apart ---
PG16_VERSION = 16
PG18_VERSION = 18
PG18_BUFFERS_HIT = 896  # "Buffers: shared hit=896" -- shown with no BUFFERS option asked for

# --- PostgreSQL: estimated vs actual rows, on a real filter the planner doesn't model exactly ---
PG_ESTIMATED_ROWS = 1012
PG_ACTUAL_ROWS = 2000
PG_ESTIMATE_RATIO_DISPLAY = 2.0

# --- Spark: the "estimated" figure lives in the plan text; "actual" lives in the UI/API ---
SPARK_COST_PLAN_ROWCOUNT = 1_000_000  # Statistics(rowCount=1.00E+6) in `explain(mode="cost")`

# --- Spark: the same kind of job, comfortable vs memory-constrained (both measured via the UI's own REST API) ---
SPARK_CLEAN_SHUFFLE_BYTES = 73_464
SPARK_CLEAN_MEMORY_SPILLED_MB = 0
SPARK_CLEAN_DISK_SPILLED_MB = 0
SPARK_CONSTRAINED_MEMORY_SPILLED_MB = 388
SPARK_CONSTRAINED_DISK_SPILLED_MB = 198

# --- Quiz constants (Prove it) ---
QUIZ_ESTIMATED_ROWS = 500
QUIZ_ACTUAL_ROWS = 50_000
QUIZ_RATIO_DISPLAY = 100


def check():
    assert PG18_VERSION > PG16_VERSION
    assert PG18_BUFFERS_HIT > 0

    assert PG_ACTUAL_ROWS > PG_ESTIMATED_ROWS, "this topic's own example is a real underestimate, not an overestimate"
    ratio = PG_ACTUAL_ROWS / PG_ESTIMATED_ROWS
    assert abs(ratio - PG_ESTIMATE_RATIO_DISPLAY) < 0.1

    assert SPARK_CLEAN_MEMORY_SPILLED_MB == 0 and SPARK_CLEAN_DISK_SPILLED_MB == 0
    assert SPARK_CONSTRAINED_MEMORY_SPILLED_MB > 0 and SPARK_CONSTRAINED_DISK_SPILLED_MB > 0

    assert QUIZ_ACTUAL_ROWS / QUIZ_ESTIMATED_ROWS == QUIZ_RATIO_DISPLAY

    print("reading-explain-across-engines examples: all numbers check out")


if __name__ == "__main__":
    check()
