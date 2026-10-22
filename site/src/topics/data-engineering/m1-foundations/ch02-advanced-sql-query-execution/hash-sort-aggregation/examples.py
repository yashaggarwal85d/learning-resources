"""Executed truth for the hash-vs-sort-aggregation reel (run by `npm run test:examples`).

Every number below is this topic's own measurement on a real PostgreSQL 16 instance (`agg_demo` schema,
`sales` table, 2,000,000 rows: `low_card` 100 distinct values, `high_card` 1,500,000 distinct values) — see
SOURCES.md, "Measured directly". There is no formula to re-derive (unlike topic 20's cost-formula arithmetic);
this file asserts the measured numbers are internally consistent and fixes them as named constants so reel.tsx
and narration never drift from what was actually measured.
"""

# -- Low cardinality (100 groups), single worker -----------------------------------------------------------------
LOW_CARD_GROUPS = 100
LOW_CARD_HASH_MS = 558.673  # default planner: HashAggregate, 1 batch
LOW_CARD_SORT_MS = 1174.777  # forced: GroupAggregate over an external-merge Sort (41,104kB disk)
LOW_CARD_SORT_DISK_KB = 41_104

low_card_hash_speedup = LOW_CARD_SORT_MS / LOW_CARD_HASH_MS
assert 2.0 < low_card_hash_speedup < 2.2, low_card_hash_speedup  # "about 2.1x" in the reel
LOW_CARD_SPEEDUP_DISPLAY = round(low_card_hash_speedup, 1)
assert LOW_CARD_SPEEDUP_DISPLAY == 2.1

# -- High cardinality (1,500,000 groups out of 2,000,000 rows), single worker: the crossover -----------------------
HIGH_CARD_GROUPS = 1_500_000
TOTAL_ROWS = 2_000_000
HIGH_CARD_HASH_MS = 2479.537  # default planner: HashAggregate, still chosen, but spills
HIGH_CARD_HASH_PARTITIONS = 64
HIGH_CARD_HASH_BATCHES = 321
HIGH_CARD_HASH_DISK_KB = 61_408
HIGH_CARD_SORT_MS = 1737.653  # forced: GroupAggregate over the same kind of external-merge Sort
HIGH_CARD_SORT_DISK_KB = 41_104  # same as the low-cardinality sort: depends on row count, not group count

assert HIGH_CARD_SORT_DISK_KB == LOW_CARD_SORT_DISK_KB  # sort cost tracks rows, which didn't change

high_card_sort_speedup = HIGH_CARD_HASH_MS / HIGH_CARD_SORT_MS
assert 1.4 < high_card_sort_speedup < 1.45, high_card_sort_speedup  # "about 1.43x" in the reel
HIGH_CARD_SORT_SPEEDUP_DISPLAY = round(high_card_sort_speedup, 2)
assert HIGH_CARD_SORT_SPEEDUP_DISPLAY == 1.43

# The crossover itself: hash wins at low cardinality, sort wins at high cardinality — opposite winners.
assert LOW_CARD_HASH_MS < LOW_CARD_SORT_MS
assert HIGH_CARD_SORT_MS < HIGH_CARD_HASH_MS

# -- Parallel aggregation (2 workers), low cardinality --------------------------------------------------------------
PARALLEL_WORKERS = 2
PARALLEL_LOW_CARD_MS = 260.757  # Finalize GroupAggregate <- Gather Merge <- Sort <- Partial HashAggregate (x2)

parallel_speedup = LOW_CARD_HASH_MS / PARALLEL_LOW_CARD_MS
assert 2.0 < parallel_speedup < 2.3, parallel_speedup  # "more than 2x faster" in the reel
PARALLEL_SPEEDUP_DISPLAY = round(parallel_speedup, 1)
assert PARALLEL_SPEEDUP_DISPLAY == 2.1

# -- COUNT(DISTINCT low_card): measured taking a sort-based path, not hash ------------------------------------------
DISTINCT_COUNT_MS = 651.016
DISTINCT_SORT_DISK_KB = 23_528

# -- "Prove it" quiz scenarios: hypothetical cardinalities and a batch count, distinct from this topic's own
#    measurements above, used only to check recognition of the same reasoning on different numbers.
QUIZ_ROWS = 10_000_000
QUIZ_GROUPS = 20
assert QUIZ_GROUPS < QUIZ_ROWS

QUIZ_BATCH_COUNT = 9
assert QUIZ_BATCH_COUNT > 1  # more than one batch means the hash table spilled

print("hash-sort-aggregation examples: all numbers check out")
