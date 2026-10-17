"""Executed truth for the external merge sort and k-way merge reel.

Checks the numbers the reel shows, by computing them rather than restating them from memory.
"""

import math

KiB, MiB, GiB, TiB = 2**10, 2**20, 2**30, 2**40

# -- The running example: 1 TiB sorted with 16 GiB of memory, 1 MiB blocks ---------------------
DATA, MEMORY, BLOCK = 1 * TiB, 16 * GiB, 1 * MiB
assert DATA == 1 * TiB and MEMORY == 16 * GiB and BLOCK == 1 * MiB

# -- Phase one: quicksort load-sort-spill runs, about M each -----------------------------------
quicksort_runs = math.ceil(DATA / MEMORY)
assert quicksort_runs == 64

# -- Replacement selection: about 2M per run, so about half as many runs -----------------------
replacement_selection_runs = math.ceil(DATA / (2 * MEMORY))
assert replacement_selection_runs == 32

# -- Fan-in: one read buffer per run, plus one for the output ----------------------------------
buffers = MEMORY // BLOCK
assert buffers == 16_384
fan_in = buffers - 1
assert fan_in == 16_383


def passes(runs, fan_in):
    merges = 0
    while runs > 1:
        runs = math.ceil(runs / fan_in)
        merges += 1
    return 1 + merges


assert passes(quicksort_runs, fan_in) == 2  # one run-generation pass, one merge pass

# A two-way (cascade) merge of the 64 runs instead: ceil(log2(64)) = 6 merge passes, 7 total.
cascade_merge_passes = math.ceil(math.log2(quicksort_runs))
assert cascade_merge_passes == 6
assert 1 + cascade_merge_passes == 7

# -- A third pass only once runs exceed the fan-in; the headroom here is enormous ---------------
assert quicksort_runs < fan_in
assert passes(fan_in, fan_in) == 2  # still fine right up to the fan-in itself
assert passes(fan_in + 1, fan_in) == 3  # one more run tips it to a third pass

print("external-merge-sort-k examples: all numbers check out")
