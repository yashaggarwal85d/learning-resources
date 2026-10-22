"""Measured directly on a real PostgreSQL 16.15 instance (see SOURCES.md and FACT-CHECK.md).

Schema: mem_demo (2,000,000 rows: sort_key, join_key, skew_key columns), mem_join_small
(500,000 rows), mem_join_skew (495,001 distinct values). `max_parallel_workers_per_gather = 0`
unless noted, so a work_mem change alone -- not a parallel-plan change -- explains each number.
"""

# --- External sort: ORDER BY sort_key, no LIMIT, over 2,000,000 rows ---
SORT_INMEM_WORK_MEM_MB = 256
SORT_INMEM_METHOD = "quicksort"
SORT_INMEM_MEMORY_KB = 111_653
SORT_INMEM_MS = 849.199  # first of two repeated runs; second was 828.871

SORT_DEFAULT_WORK_MEM_MB = 4
SORT_DEFAULT_METHOD = "external merge"
SORT_DEFAULT_DISK_KB = 35_248
SORT_DEFAULT_MS = 785.415  # first of two runs; second was 757.355 -- consistently faster than in-memory

SORT_STARVED_WORK_MEM_KB = 128
SORT_STARVED_DISK_KB = 35_288
SORT_STARVED_MS = 1065.678  # first of two runs; second was 1016.723

SORT_STARVED2_WORK_MEM_KB = 64
SORT_STARVED2_DISK_KB = 35_296
SORT_STARVED2_MS = 1089.428  # first of two runs; second was 1028.168

# --- Hash join: mem_demo JOIN mem_join_small ON join_key (enable_mergejoin/nestloop off) ---
JOIN_WORK_MEM_256MB_BATCHES = 1
JOIN_WORK_MEM_256MB_BUCKETS = 524_288
JOIN_WORK_MEM_256MB_MS = 1451.970

JOIN_WORK_MEM_4MB_BATCHES = 4
JOIN_WORK_MEM_4MB_BUCKETS = 262_144
JOIN_WORK_MEM_4MB_MS = 1429.936

JOIN_WORK_MEM_1MB_BATCHES = 16
JOIN_WORK_MEM_1MB_BUCKETS = 65_536
JOIN_WORK_MEM_1MB_MS = 1204.486

JOIN_WORK_MEM_256KB_BATCHES = 64
JOIN_WORK_MEM_256KB_BUCKETS = 16_384
JOIN_WORK_MEM_256KB_MS = 1184.550

JOIN_WORK_MEM_64KB_BATCHES = 256
JOIN_WORK_MEM_64KB_BUCKETS = 4_096
JOIN_WORK_MEM_64KB_MS = 1244.820

# Fine-granularity check (adjacent halvings only): 1MB -> 512kB -> 256kB doubles batches each step
JOIN_WORK_MEM_512KB_BATCHES = 32
JOIN_WORK_MEM_512KB_MS = 1140.622

# --- hash_mem_multiplier, same work_mem = 4MB throughout ---
HASH_MULT_1X_BATCHES = 8
HASH_MULT_1X_MS = 1475.117

HASH_MULT_4X_BATCHES = 2
HASH_MULT_4X_MS = 1481.917

# --- Concurrency: two sessions, each work_mem = 4MB, running the sort above together ---
CONCURRENT_SESSIONS = 2
CONCURRENT_SINGLE_SPILL_MB = 35  # one session's own spill, rounded (35248kB measured above)
CONCURRENT_PEAK_COMBINED_MB = 69  # pg_ls_tmpdir() sum during overlap, polled live
CONCURRENT_EARLY_COMBINED_MB = 37  # an earlier poll, before both sessions reached their peak

# --- Skew: one value out of 2,000,000 rows carries this fraction ---
SKEW_KEY_ROW_SHARE_PERCENT = 1  # skew_key = 1 carries 20,000 of 2,000,000 rows
SKEW_JOIN_WORK_MEM_KB = 64
SKEW_JOIN_BATCHES = 256  # EXPLAIN shows the same plain Buckets/Batches line -- no separate skew indicator

# --- Quiz constants (Prove it) ---
QUIZ_SESSIONS = 6
QUIZ_WORK_MEM_MB = 8
QUIZ_WORST_CASE_MB = QUIZ_SESSIONS * QUIZ_WORK_MEM_MB  # 48


def check():
    assert SORT_INMEM_MS > SORT_DEFAULT_MS, "the in-memory sort should measure slower here, not faster"
    assert SORT_STARVED_MS > SORT_DEFAULT_MS and SORT_STARVED2_MS > SORT_DEFAULT_MS, \
        "a severely starved work_mem should measure slower than the default spill"
    assert SORT_STARVED_DISK_KB - SORT_DEFAULT_DISK_KB < 200, \
        "the starved and default runs should spill about the same amount of data"

    assert JOIN_WORK_MEM_256MB_BATCHES == 1
    assert JOIN_WORK_MEM_4MB_BATCHES == JOIN_WORK_MEM_1MB_BATCHES // 4
    assert JOIN_WORK_MEM_1MB_BATCHES * 2 == JOIN_WORK_MEM_512KB_BATCHES
    assert JOIN_WORK_MEM_512KB_BATCHES * 2 == JOIN_WORK_MEM_256KB_BATCHES
    assert JOIN_WORK_MEM_256KB_BATCHES * 4 == JOIN_WORK_MEM_64KB_BATCHES

    assert HASH_MULT_4X_BATCHES < HASH_MULT_1X_BATCHES, "a bigger hash_mem_multiplier should need fewer batches"

    assert CONCURRENT_PEAK_COMBINED_MB > CONCURRENT_SINGLE_SPILL_MB, \
        "two concurrent spillers should use more combined temp space than one"
    assert CONCURRENT_EARLY_COMBINED_MB < CONCURRENT_PEAK_COMBINED_MB

    assert QUIZ_WORST_CASE_MB == QUIZ_SESSIONS * QUIZ_WORK_MEM_MB

    print("memory-budgets-spilling-grace examples: all numbers check out")


if __name__ == "__main__":
    check()
