"""Measured directly (see SOURCES.md).

Spark numbers: Apache Spark 3.5.9 (`pyspark==3.5.9`) in local[4] mode, run from a dedicated
Python 3.11 virtualenv (the sandbox's default Python is 3.13, which pyspark's own install
script can't build under) -- `python3.11 -m venv ...; pip install pyspark==3.5.9`. Local mode
is an honest test for these claims: coalescing, skew-split and join-strategy switching all act
on one job's own shuffle statistics, not on a real network boundary between machines (unlike
topic 25's broadcast-vs-shuffle network cost, which local mode could *not* have honestly shown).

PostgreSQL numbers: PostgreSQL 16.15, the `pw_orders` table (8,000,000 rows, 4 range partitions
on `region`) built for topic 25, reused here unchanged.
"""

# --- AQE: coalescing post-shuffle partitions ---
# spark.range(0, 2_000_000, 1, 8).withColumn("k", id % 50).groupBy("k").count()
AQE_SHUFFLE_PARTITIONS_CONFIGURED = 200
AQE_COALESCE_OFF_PARTITIONS = 200  # every configured partition kept, regardless of real data size
AQE_COALESCE_ON_PARTITIONS = 1  # AQE sees 50 tiny groups and coalesces down to what the data needs

# --- AQE: skew join -- a real plan-shape change, measured; wall-clock inconclusive on 4 cores ---
SKEW_FACT_ROWS = 20_000_000
SKEW_SHARE_PERCENT = 95  # share of fact rows carrying the one dominant join key
SKEW_DIM_ROWS = 20
SKEW_SHUFFLE_PARTITIONS = 8
SKEW_THRESHOLD_BYTES = 1_048_576
SKEW_FACTOR = 2
SKEW_JOIN_OFF_TIME_S = 9.233
SKEW_JOIN_ON_TIME_RUNS_S = [11.091, 8.611]  # two repeats; neither is a clean, repeatable win

# --- AQE: switching join strategy at runtime (measured: Initial Plan SMJ -> Final Plan BHJ) ---
SWITCH_FACT_ROWS = 2_000_000
SWITCH_DIM_ROWS = 1_000_000
SWITCH_DIM_ROWS_AFTER_FILTER_AND_AGG = 10  # the real size AQE sees only once this stage finishes
SWITCH_BROADCAST_THRESHOLD_BYTES = 1_048_576  # 1 MB, configured for this test (Spark's own default is 10 MB; see topic 25)

# --- Spark's own runtime (Bloom) filter: skip if the filter-creation side is too big ---
# (InjectRuntimeFilter.scala; not re-measured here -- see SOURCES.md and FACT-CHECK.md)

# --- Trino's dynamic filtering / dynamic partition pruning ---
# (Trino "Dynamic filtering" docs; not re-measured here -- no Trino installed, see FACT-CHECK.md)
TRINO_DYNAMIC_FILTER_RANGES_EXAMPLE = 3  # SortedRangeSet[...ranges=3...] quoted in SOURCES.md

# --- PostgreSQL: partition pruning performed during execution, not planning ---
PG_PARTITIONS_TOTAL = 4
PG_SUBPLANS_REMOVED = 3  # 4 partitions total, 1 kept, 3 removed at execution-plan init time
PG_PRUNE_ON_RUNS_MS = [90.854, 69.630, 77.556]
PG_PRUNE_OFF_RUNS_MS = [237.522, 212.775, 303.576]
PG_PRUNE_ON_MS = PG_PRUNE_ON_RUNS_MS[0]
PG_PRUNE_OFF_MS = PG_PRUNE_OFF_RUNS_MS[0]
PG_PRUNE_SPEEDUP_DISPLAY = 3.2
PG_BUFFERS_READ_ON = 14345
PG_BUFFERS_READ_OFF = 57631
PG_BUFFER_RATIO_DISPLAY = 4.0

# --- Quiz constant (Prove it) ---
QUIZ_SUBPLANS_REMOVED = 3
QUIZ_PARTITIONS_TOTAL = 4


def check():
    assert AQE_COALESCE_OFF_PARTITIONS == AQE_SHUFFLE_PARTITIONS_CONFIGURED
    assert AQE_COALESCE_ON_PARTITIONS < AQE_COALESCE_OFF_PARTITIONS, \
        "coalescing should reduce the real post-shuffle partition count, not match the configured one"

    assert SKEW_SHARE_PERCENT > 50, "the dominant key must actually be a majority to count as skewed"
    on_avg = sum(SKEW_JOIN_ON_TIME_RUNS_S) / len(SKEW_JOIN_ON_TIME_RUNS_S)
    assert not (on_avg < SKEW_JOIN_OFF_TIME_S * 0.9), \
        "this topic's honest claim is that splitting didn't show a clean local speedup -- don't silently 'fix' this to look better"

    assert SWITCH_DIM_ROWS_AFTER_FILTER_AND_AGG * 200 < SWITCH_BROADCAST_THRESHOLD_BYTES, \
        "the real, post-aggregation dim side must be comfortably under the broadcast threshold"

    assert PG_SUBPLANS_REMOVED == PG_PARTITIONS_TOTAL - 1
    on_avg = sum(PG_PRUNE_ON_RUNS_MS) / len(PG_PRUNE_ON_RUNS_MS)
    off_avg = sum(PG_PRUNE_OFF_RUNS_MS) / len(PG_PRUNE_OFF_RUNS_MS)
    speedup = off_avg / on_avg
    assert abs(speedup - PG_PRUNE_SPEEDUP_DISPLAY) < 0.2
    buffer_ratio = PG_BUFFERS_READ_OFF / PG_BUFFERS_READ_ON
    assert abs(buffer_ratio - PG_BUFFER_RATIO_DISPLAY) < 0.2

    assert QUIZ_SUBPLANS_REMOVED == QUIZ_PARTITIONS_TOTAL - 1

    print("adaptive-execution-runtime-filters examples: all numbers check out")


if __name__ == "__main__":
    check()
