"""Measured directly on PostgreSQL 16.15 (see SOURCES.md).

Two tables, pw_orders (8,000,000 rows) and pw_customers (2,000,000 rows), both range-partitioned
into 4 matching partitions on `region`, with every order's customer_id constructed to land in the
same partition as its customer -- so a join on region AND customer_id can, in principle, be done
entirely partition-by-partition. Query: SELECT count(*), sum(o.amount) FROM pw_orders o JOIN
pw_customers c ON o.region = c.region AND o.customer_id = c.customer_id.
"""

ORDERS_ROWS = 8_000_000
CUSTOMERS_ROWS = 2_000_000
PARTITIONS = 4
ROWS_PER_CUSTOMER_PARTITION = CUSTOMERS_ROWS // PARTITIONS  # 500,000

# --- Correctness check: same answer under both planner settings ---
MATCHED_ROWS = 8_000_000
JOIN_SUM = 2_004_000_000.0

# --- Plan shape (EXPLAIN node counts) ---
HASH_NODES_OFF = 1  # one combined Hash Join over an Append of all partitions
HASH_NODES_ON = PARTITIONS  # one independent Hash Join per matching partition pair

# --- At work_mem = 16MB, single execution thread: spill vs. no spill ---
WORK_MEM_MB = 16
PW_OFF_SPILL_BATCHES = 4  # the single 2,000,000-row hash table spills
PW_ON_SPILL_BATCHES = 1  # each 500,000-row hash table does not

PW_OFF_RUNS_MS = [4619.117, 4621.824, 4363.915]
PW_OFF_MS = PW_OFF_RUNS_MS[0]  # 4619.117

PW_ON_RUNS_MS = [3684.680, 3497.753, 3699.608]
PW_ON_MS = PW_ON_RUNS_MS[0]  # 3684.680

# --- PostgreSQL's own default settings (parallel workers on, ample work_mem): converges ---
PW_OFF_DEFAULT_RUNS_MS = [1387.614, 1421.772]
PW_ON_DEFAULT_RUNS_MS = [1556.110, 1407.918]

# --- Spark's own documented broadcast threshold (not re-measured; see SOURCES.md) ---
SPARK_BROADCAST_THRESHOLD_BYTES = 10_485_760  # 10 MB, spark.sql.autoBroadcastJoinThreshold default
SPARK_BROADCAST_THRESHOLD_MB = 10

# --- Quiz constant (Prove it): a hypothetical join side under the threshold ---
QUIZ_JOIN_SIDE_MB = 6

# --- The two exchange-operator fragment types this topic names (Trino's own EXPLAIN vocabulary) ---
EXCHANGE_FRAGMENT_TYPES_NAMED = 2  # HASH (repartition/shuffle) and BROADCAST


def check():
    assert MATCHED_ROWS == ORDERS_ROWS, "every order should match exactly one customer by construction"
    assert ROWS_PER_CUSTOMER_PARTITION * PARTITIONS == CUSTOMERS_ROWS

    assert HASH_NODES_ON == PARTITIONS and HASH_NODES_OFF == 1

    assert PW_OFF_SPILL_BATCHES > PW_ON_SPILL_BATCHES, \
        "the combined hash table should spill where the smaller, per-partition ones don't"

    assert PW_OFF_MS > PW_ON_MS, "avoiding a spill should measure faster, not slower"
    speedup = PW_OFF_MS / PW_ON_MS
    assert 1.15 < speedup < 1.35, "the measured speedup should be a real but moderate ~20%, not exaggerated"

    assert SPARK_BROADCAST_THRESHOLD_BYTES == SPARK_BROADCAST_THRESHOLD_MB * 1024 * 1024
    assert QUIZ_JOIN_SIDE_MB < SPARK_BROADCAST_THRESHOLD_MB
    assert EXCHANGE_FRAGMENT_TYPES_NAMED == 2

    print("parallel-distributed-query-plans examples: all numbers check out")


if __name__ == "__main__":
    check()
