"""Executed truth for the external-memory (input and output) model reel.

Checks the numbers the reel shows, by computing them rather than restating them from memory.
"""

import math

# -- The running example: a 1 GiB vector of 64-bit keys ----------------------------------------
GiB_BITS, KEY_BITS = 1 * 2**30 * 8, 64
N = (GiB_BITS) // KEY_BITS
assert N == 2**27 == 134_217_728

M = 2**23
assert M == 8_388_608  # 64 MiB of keys

B = 512
assert B == 512

# PDM constraint (Vitter's survey): M < N and B <= M/2 for the single-disk case.
assert M < N
assert B <= M / 2

# -- Predict: a sorted sweep vs a random visit of a million keys --------------------------------
VISIT = 1_000_000
sweep_transfers = math.ceil(VISIT / B)
random_transfers = VISIT  # each key lands in its own block
assert VISIT == 1_000_000
assert round(random_transfers / sweep_transfers) == 512  # about a 512x gap

# -- Scan: N / B blocks ---------------------------------------------------------------------------
scan_transfers = N // B
assert scan_transfers == 262_144

# -- Search: log base B vs log base 2 ------------------------------------------------------------
log2_n = round(math.log2(N))
log_b_n = round(math.log(N, B))
assert log2_n == 27
assert log_b_n == 3

# -- Sort passes: N/M runs, fan-in M/B --------------------------------------------------------
runs = N // M
fan_in = M // B
assert runs == 16
assert fan_in == 16_384


def passes(num_runs, fan_in_):
    merges = 0
    while num_runs > 1:
        num_runs = math.ceil(num_runs / fan_in_)
        merges += 1
    return 1 + merges


assert passes(runs, fan_in) == 2  # run formation, then one merge pass

# A two-way (cascade) merge of the same 16 runs instead: ceil(log2(16)) = 4 merge passes.
cascade_passes = math.ceil(math.log2(runs))
assert cascade_passes == 4

# -- Count the same sort twice: comparisons vs block transfers ----------------------------------
comparisons = N * log2_n
assert round(comparisons / 1e9, 1) == 3.6  # about 3.6 billion comparisons

transfers_two_passes = 2 * scan_transfers
assert transfers_two_passes == 524_288

# -- Repricing the doubling vector: at most 2N items copied, at most 2N/B transfers -------------
resize_transfers_bound = 2 * N // B
assert resize_transfers_bound == 2 * scan_transfers

# -- The same model at the cache boundary: B = 8 keys for a 64-byte line -------------------------
CACHE_LINE_BYTES = 64
cache_line_keys = CACHE_LINE_BYTES // (KEY_BITS // 8)
assert CACHE_LINE_BYTES == 64
assert cache_line_keys == 8

print("external-memory-i-o examples: all numbers check out")
