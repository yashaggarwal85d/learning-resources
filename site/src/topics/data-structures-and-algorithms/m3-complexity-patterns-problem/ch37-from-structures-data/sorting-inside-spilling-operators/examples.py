"""Sorting inside spilling operators: run generation, balanced k-way merge passes, and two
designs for a hash aggregation that outgrows memory (PostgreSQL's hash-partitioned spill versus
Spark's fallback to a sort). Mirrors PostgreSQL's tuplesort.c/nodeAgg.c and Spark's
TungstenAggregationIterator.scala, SortMergeJoinExec.scala, quoted in SOURCES.md.
"""
import math
import random


def quicksort_runs(rows: list[int], budget: int) -> list[list[int]]:
    """Run generation: absorb rows until the budget is hit, sort in place, start a new run."""
    runs = []
    for i in range(0, len(rows), budget):
        chunk = rows[i:i + budget]
        chunk.sort()
        runs.append(chunk)
    return runs


def merge_runs(runs: list[list[int]], merge_order: int) -> list[list[int]]:
    """One balanced merge pass: merge groups of up to merge_order runs into one each."""
    out = []
    for i in range(0, len(runs), merge_order):
        group = runs[i:i + merge_order]
        merged = sorted(x for run in group for x in run)
        out.append(merged)
    return out


def count_merge_passes(num_runs: int, merge_order: int) -> int:
    """How many balanced merge passes bring num_runs runs down to one, at this merge order."""
    passes = 0
    n = num_runs
    while n > 1:
        n = math.ceil(n / merge_order)
        passes += 1
    return max(passes, 0)


# ---------------------------------------------------------------------------
# A small, concrete instance: verify run generation and the merge-pass count by
# actually running both, not only by formula.
# ---------------------------------------------------------------------------
random.seed(3)
SMALL_N = 2000
SMALL_BUDGET = 50
SMALL_ROWS = random.sample(range(10_000_000), SMALL_N)

SMALL_RUNS = quicksort_runs(list(SMALL_ROWS), SMALL_BUDGET)
NUM_SMALL_RUNS = len(SMALL_RUNS)
assert NUM_SMALL_RUNS == 40  # ceil(2000 / 50)
assert all(run == sorted(run) for run in SMALL_RUNS)

SMALL_MERGE_ORDER = 4
current = SMALL_RUNS
passes_run = 0
while len(current) > 1:
    current = merge_runs(current, SMALL_MERGE_ORDER)
    passes_run += 1
assert current[0] == sorted(SMALL_ROWS)  # the merge actually sorted everything
FORMULA_PASSES = count_merge_passes(NUM_SMALL_RUNS, SMALL_MERGE_ORDER)
assert passes_run == FORMULA_PASSES == 3  # the simulation and the formula agree

# ---------------------------------------------------------------------------
# The hook's own numbers: the same, validated run-count formula applied at scale.
# ---------------------------------------------------------------------------
HOOK_ROWS = 20_000_000
HOOK_BUDGET = 200_000
HOOK_NUM_RUNS = math.ceil(HOOK_ROWS / HOOK_BUDGET)
assert HOOK_NUM_RUNS == 100

# If the engine can hold all 100 runs' read buffers open at once (unlimited merge order),
# the balanced merge finishes in a single pass over the data, read on the fly.
HOOK_PASSES_UNLIMITED_TAPES = count_merge_passes(HOOK_NUM_RUNS, HOOK_NUM_RUNS)
assert HOOK_PASSES_UNLIMITED_TAPES == 1

# A more realistic merge order (far fewer tapes than runs) needs several passes.
HOOK_MERGE_ORDER_REALISTIC = 7
HOOK_PASSES_REALISTIC = count_merge_passes(HOOK_NUM_RUNS, HOOK_MERGE_ORDER_REALISTIC)
assert HOOK_PASSES_REALISTIC == 3

# ---------------------------------------------------------------------------
# Two spill designs for the same hash aggregation: PostgreSQL partitions the overflow
# by hash (HASHAGG_PARTITION_FACTOR etc.); Spark sorts the whole in-memory map and
# falls back to a sort-based aggregation. Measured on a skewed GROUP BY customer_id.
# ---------------------------------------------------------------------------
HASHAGG_PARTITION_FACTOR = 1.50  # nodeAgg.c
HASHAGG_MIN_PARTITIONS = 4
HASHAGG_MAX_PARTITIONS = 1024

N_GROUP_ROWS = 60_000
N_DISTINCT_CUSTOMERS = 3000
GROUP_BUDGET = 400  # distinct groups the in-memory table can hold at once

random.seed(9)
HOT_GROUP_CUSTOMERS = list(range(1, 9))
GROUP_KEYS = []
for _ in range(N_GROUP_ROWS):
    if random.random() < 0.5:
        GROUP_KEYS.append(random.choice(HOT_GROUP_CUSTOMERS))
    else:
        GROUP_KEYS.append(random.randint(1, N_DISTINCT_CUSTOMERS))

distinct_seen = len(set(GROUP_KEYS))
assert distinct_seen > GROUP_BUDGET  # the table really does outgrow its budget


def postgres_style_partition_count(estimated_groups: int) -> int:
    n = math.ceil(HASHAGG_PARTITION_FACTOR * estimated_groups)
    n = max(n, HASHAGG_MIN_PARTITIONS)
    n = min(n, HASHAGG_MAX_PARTITIONS)
    return n


def simulate_postgres_hashagg(keys: list[int], budget: int):
    """Groups already in the table keep updating; a new group beyond budget is written,
    partitioned by hash, to a logical tape instead of growing the table further."""
    resident: set[int] = set()
    rows_written_to_tapes = 0
    partitions = postgres_style_partition_count(max(len(set(keys)) - budget, 1))
    for k in keys:
        if k in resident or len(resident) < budget:
            resident.add(k)
        else:
            rows_written_to_tapes += 1
    return rows_written_to_tapes, partitions


PG_ROWS_SPILLED, PG_PARTITIONS = simulate_postgres_hashagg(GROUP_KEYS, GROUP_BUDGET)
assert 0 < PG_ROWS_SPILLED < N_GROUP_ROWS
PG_SPILLED_PERCENT = round(100 * PG_ROWS_SPILLED / N_GROUP_ROWS)


def simulate_spark_sort_fallback(keys: list[int], budget: int):
    """The in-memory map fills to budget; from that point on, every further row's key
    is appended to a buffer that is later sorted once and merged (sort-based aggregation)."""
    resident: set[int] = set()
    overflow_buffer = []
    for k in keys:
        if k in resident or len(resident) < budget:
            resident.add(k)
        else:
            overflow_buffer.append(k)
    overflow_buffer_sorted = sorted(overflow_buffer)
    return len(overflow_buffer), overflow_buffer_sorted


SPARK_OVERFLOW_ROWS, SPARK_SORTED_OVERFLOW = simulate_spark_sort_fallback(GROUP_KEYS, GROUP_BUDGET)
assert SPARK_OVERFLOW_ROWS == PG_ROWS_SPILLED  # both designs see the identical overflow rows
assert SPARK_SORTED_OVERFLOW == sorted(SPARK_SORTED_OVERFLOW)

# The two designs spill the identical rows but organize them differently: PostgreSQL writes
# them straight to PG_PARTITIONS hash-partitioned tapes (no sort); Spark sorts the whole
# overflow buffer once before merging it back with the resident groups.
assert PG_PARTITIONS >= HASHAGG_MIN_PARTITIONS

if __name__ == "__main__":
    print("small instance: runs", NUM_SMALL_RUNS, "merge passes (simulated)", passes_run, "(formula)", FORMULA_PASSES)
    print("hook instance: rows", HOOK_ROWS, "budget", HOOK_BUDGET, "runs", HOOK_NUM_RUNS)
    print("passes with unlimited tapes:", HOOK_PASSES_UNLIMITED_TAPES)
    print("passes with merge order", HOOK_MERGE_ORDER_REALISTIC, ":", HOOK_PASSES_REALISTIC)
    print("distinct customers seen:", distinct_seen, "group budget", GROUP_BUDGET)
    print("PostgreSQL-style partitions chosen:", PG_PARTITIONS)
    print("rows spilled (both designs, identical):", PG_ROWS_SPILLED, "=", PG_SPILLED_PERCENT, "%")
    print("ALL ASSERTS PASSED")
