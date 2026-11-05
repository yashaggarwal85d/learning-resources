"""External merge sort: run generation (simple block sort vs. replacement
selection), multi-way merge pass count, and the block-transfer cost.

Section 1: simple run generation (read M, sort, write) gives exactly
ceil(N / M) runs of length M (except the last).

Section 2: replacement selection ("snowplow") -- a heap of M items,
repeatedly output the smallest key not smaller than the last key written to
the current run, replace it with the next input item, and hold back
anything too small for the current run into the next run's heap. This
reproduces CHAPTER.md's own three planning figures:
  - random input, M = 1,000 over 200,000 keys: ~2.0 M average run length
    (first and last runs excluded, since they are each boundary-truncated).
  - already-sorted input, M = 100 over 10,000 keys: exactly one run.
  - reverse-sorted input, M = 100 over 10,000 keys: 100 runs of 100.

Section 3: merge pass count and block-transfer cost, on CHAPTER.md's own
running example (N = 2**27, M = 2**23, B = 512) and a small worked instance
(16 runs, fan-ins 2/4/16), plus a table of M against pass count showing the
step-function threshold. The merge step itself uses Chapter 6 topic 31's
loser tree (ceil(lg k) comparisons per output item) -- named here, not
rebuilt.
"""

import heapq
import math
import random

# ---------------------------------------------------------------------------
# Section 1: simple run generation
# ---------------------------------------------------------------------------

def simple_runs(n, m):
    return math.ceil(n / m)


N_SIMPLE = 1_000_000
M_SIMPLE = 4_000
assert simple_runs(N_SIMPLE, M_SIMPLE) == 250

# ---------------------------------------------------------------------------
# Section 2: replacement selection ("snowplow")
# ---------------------------------------------------------------------------

def replacement_selection_runs(keys, m):
    """Simulate replacement selection with heap capacity m.

    Returns the list of run lengths. Uses two heaps: `current` holds
    (key, seq) pairs eligible for the run being written (key >= last
    written key for this run); `held` holds pairs too small for the
    current run, deferred to the next run. seq breaks ties and marks
    which "epoch" (run number parity) a held item belongs to, so that
    when `current` empties we swap it in for the next run.
    """
    it = iter(keys)
    current = []
    held = []
    for _ in range(m):
        try:
            heapq.heappush(current, next(it))
        except StopIteration:
            break

    runs = []
    last_written = None
    run_len = 0

    while current or held:
        if not current:
            runs.append(run_len)
            run_len = 0
            current, held = held, []
            last_written = None
            continue
        key = heapq.heappop(current)
        run_len += 1
        last_written = key
        try:
            nxt = next(it)
        except StopIteration:
            nxt = None
        if nxt is not None:
            if nxt >= last_written:
                heapq.heappush(current, nxt)
            else:
                heapq.heappush(held, nxt)
    if run_len:
        runs.append(run_len)
    return runs


random.seed(54)

# Figure 1: random input, M = 1,000 over 200,000 keys -> ~2.0 M average,
# first and last runs excluded (boundary-truncated).
RS_N = 200_000
RS_M = 1_000
random_keys = [random.random() for _ in range(RS_N)]
random_runs = replacement_selection_runs(random_keys, RS_M)
assert len(random_runs) >= 3
interior_runs = random_runs[1:-1]
average_interior_run = sum(interior_runs) / len(interior_runs)
assert round(average_interior_run / RS_M, 1) == 2.0

# Figure 2: already-sorted input, M = 100 over 10,000 keys -> one run.
SORTED_N = 10_000
SORTED_M = 100
sorted_keys = list(range(SORTED_N))
sorted_runs = replacement_selection_runs(sorted_keys, SORTED_M)
assert sorted_runs == [SORTED_N]
assert len(sorted_runs) == 1

# Figure 3: reverse-sorted input, M = 100 over 10,000 keys -> 100 runs of 100.
reversed_keys = list(range(SORTED_N, 0, -1))
reversed_runs = replacement_selection_runs(reversed_keys, SORTED_M)
assert reversed_runs == [SORTED_M] * 100
assert len(reversed_runs) == 100
assert all(r == SORTED_M for r in reversed_runs)

# ---------------------------------------------------------------------------
# Section 3: merge pass count and block-transfer cost
# ---------------------------------------------------------------------------

def passes_needed(num_runs, fan_in):
    """Number of merge passes to reduce num_runs runs to 1, merging up to
    fan_in runs at a time each pass."""
    runs = num_runs
    passes = 0
    while runs > 1:
        runs = math.ceil(runs / fan_in)
        passes += 1
    return passes


# CHAPTER.md's own running example: N = 2**27 keys, M = 2**23, B = 512.
N_KEYS = 2 ** 27
M_MEM = 2 ** 23
B_BLOCK = 512

num_initial_runs = N_KEYS // M_MEM
assert num_initial_runs == 16

max_fan_in = (M_MEM // B_BLOCK) - 1
assert max_fan_in == 16_383

merge_passes = passes_needed(num_initial_runs, max_fan_in)
assert merge_passes == 1

blocks_per_scan = N_KEYS // B_BLOCK
assert blocks_per_scan == 262_144

# One run-generation scan (read + write) plus one merge pass (read + write):
# 2 * blocks_per_scan for run generation, 2 * blocks_per_scan for the single
# merge pass.
total_block_transfers = 2 * blocks_per_scan + 2 * blocks_per_scan
assert total_block_transfers == 1_048_576
assert total_block_transfers == 4 * blocks_per_scan

# A small, fully-worked instance: 16 runs, fan-ins 2, 4, 16 -> 4, 2, 1 passes.
SMALL_RUNS = 16
assert passes_needed(SMALL_RUNS, 2) == 4
assert passes_needed(SMALL_RUNS, 4) == 2
assert passes_needed(SMALL_RUNS, 16) == 1

# A table of M against passes, holding N and B fixed, showing the
# step-function-like threshold: passes only changes when num_initial_runs /
# max_fan_in crosses an integer boundary, not continuously with M.
M_TABLE = [2 ** 23, 2 ** 22, 2 ** 21, 2 ** 20, 2 ** 19, 2 ** 18]
pass_table = []
for m in M_TABLE:
    runs = math.ceil(N_KEYS / m)
    fan_in = max(1, (m // B_BLOCK) - 1)
    pass_table.append((m, runs, fan_in, passes_needed(runs, fan_in)))

assert pass_table[0] == (2 ** 23, 16, 16_383, 1)
assert pass_table[1] == (2 ** 22, 32, 8_191, 1)
assert pass_table[2] == (2 ** 21, 64, 4_095, 1)
assert pass_table[3] == (2 ** 20, 128, 2_047, 1)
assert pass_table[4] == (2 ** 19, 256, 1_023, 1)
assert pass_table[5] == (2 ** 18, 512, 511, 2)

# Halving M from 2**19 down through 2**18 is the one step in this table
# where the pass count actually changes (1 -> 2): fan-in drops just below
# the run count, which is the threshold CHAPTER.md's own predict step asks
# about ("halve the memory and keep the file the same: do the merge passes
# double? Usually not at all, until a threshold").
assert pass_table[4][3] == 1
assert pass_table[5][3] == 2

# The merge step itself: Chapter 6 topic 31's loser tree gives ceil(lg k)
# comparisons per output item for a k-way merge -- used here, not rebuilt.
LOSER_TREE_FAN_IN = max_fan_in
loser_tree_comparisons_per_item = math.ceil(math.log2(LOSER_TREE_FAN_IN))
assert loser_tree_comparisons_per_item == 14

print("All external merge sort examples verified.")
