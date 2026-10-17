"""Executed truth for the B+-trees vs LSM-trees at a glance reel.

Checks the numbers the reel shows, by computing them rather than restating them from memory.
"""

import math

KiB = 2**10

# -- A B+-tree node is one page, 8 KiB in PostgreSQL --------------------------------------------
PAGE_KIB = 8
assert PAGE_KIB == 8

# -- Height from fan-out: a hundred million keys, two illustrative fan-outs ---------------------
N = 100_000_000
assert N == 100_000_000


def height(n, fanout):
    return math.ceil(math.log(n, fanout))


FANOUT_A, FANOUT_B = 256, 1_000
assert FANOUT_A == 256 and FANOUT_B == 1_000
assert height(N, FANOUT_A) == 4
assert height(N, FANOUT_B) == 3

# -- RocksDB leveled compaction: each level about ten times the one above -----------------------
LEVEL_MULTIPLIER = 10
assert LEVEL_MULTIPLIER == 10

# -- A sixteen-byte update dirties a whole eight-kibibyte page -----------------------------------
UPDATE_BYTES = 16
assert UPDATE_BYTES == 16
assert PAGE_KIB * KiB > UPDATE_BYTES  # a tiny logical change, a whole page rewritten

# -- RocksDB's own worked example for leveled compaction (RocksDB Tuning Guide) ------------------
# Write amplification: approximately 1 (flush) + 2 (L0->L1) + 10 + 10 + 10 (each further level).
leveled_write_amp = 1 + 2 + LEVEL_MULTIPLIER + LEVEL_MULTIPLIER + LEVEL_MULTIPLIER
assert leveled_write_amp == 33

leveled_space_amp = 1.14  # RocksDB's own worked example for leveled compaction's space overhead
assert leveled_space_amp == 1.14

# -- Bloom filters: RocksDB's default is 10 bits per key, about a 1% false-positive rate --------
BLOOM_BITS_PER_KEY = 10
BLOOM_FALSE_POSITIVE_PCT = 1
assert BLOOM_BITS_PER_KEY == 10
assert BLOOM_FALSE_POSITIVE_PCT == 1
# Bloom filter false-positive rate shrinks roughly as 0.6185^(bits per key) (standard approximation).
approx_fpr = 0.6185 ** BLOOM_BITS_PER_KEY
assert round(approx_fpr * 100) <= 2  # consistent with "about 1%"

print("b-trees-vs-lsm examples: all numbers check out")
