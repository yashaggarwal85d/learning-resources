"""Hash tables inside hash joins: build/probe/batch/skew and a runtime Bloom filter.

Mirrors the structural facts read from PostgreSQL's executor (src/backend/executor/nodeHash.c,
nodeHashjoin.c, src/include/executor/hashjoin.h) and Spark's optimizer/sketch code, quoted in
SOURCES.md. Every number below is computed here, not taken from a paper.
"""
import hashlib
import math
import random


def hash32(x: int) -> int:
    """A deterministic 32-bit hash, standing in for PostgreSQL's hash of the join key."""
    return int(hashlib.blake2b(str(x).encode(), digest_size=4).hexdigest(), 16)


def rotate_right_32(x: int, n: int) -> int:
    n &= 31
    return ((x >> n) | (x << (32 - n))) & 0xFFFFFFFF


def bucket_and_batch(h: int, nbuckets: int, nbatch: int, log2_nbuckets: int):
    """ExecHashGetBucketAndBatch: bucket from the low bits, batch from the next bits."""
    if nbatch > 1:
        bucketno = h & (nbuckets - 1)
        batchno = rotate_right_32(h, log2_nbuckets) & (nbatch - 1)
    else:
        bucketno = h & (nbuckets - 1)
        batchno = 0
    return bucketno, batchno


def next_power_of_two(n: int) -> int:
    p = 1
    while p < n:
        p *= 2
    return p


NTUP_PER_BUCKET = 1          # nodeHash.c
SKEW_HASH_MEM_PERCENT = 2    # hashjoin.h

# ---------------------------------------------------------------------------
# The shop workload: customers is the build side, orders the probe side.
# ---------------------------------------------------------------------------
random.seed(7)
N_CUSTOMERS = 4000
BUDGET_M = N_CUSTOMERS // 20   # the hook's "one twentieth of the build side"
assert BUDGET_M == 200

CUSTOMER_IDS = list(range(1, N_CUSTOMERS + 1))
NBUCKETS = next_power_of_two(math.ceil(N_CUSTOMERS / NTUP_PER_BUCKET))
LOG2_NBUCKETS = NBUCKETS.bit_length() - 1
assert NBUCKETS == 4096 and LOG2_NBUCKETS == 12

CUSTOMER_HASHES = {c: hash32(c) for c in CUSTOMER_IDS}


def batch_sizes(nbatch: int):
    sizes = [0] * nbatch
    for c in CUSTOMER_IDS:
        _, b = bucket_and_batch(CUSTOMER_HASHES[c], NBUCKETS, nbatch, LOG2_NBUCKETS)
        sizes[b] += 1
    return sizes


def choose_nbatch(budget: int) -> int:
    """Double nbatch, as ExecHashIncreaseNumBatches does, until every batch fits the budget."""
    nbatch = 1
    while max(batch_sizes(nbatch)) > budget:
        nbatch *= 2
    return nbatch


NBATCH = choose_nbatch(BUDGET_M)
BATCH_SIZES = batch_sizes(NBATCH)
assert NBATCH == 32
assert max(BATCH_SIZES) <= BUDGET_M

# A skewed orders stream: a handful of customers place many orders.
N_ORDERS = 80000
HOT_CUSTOMERS = CUSTOMER_IDS[:8]            # the eight busiest accounts
ORDERS = []
for _ in range(N_ORDERS):
    if random.random() < 0.55:
        ORDERS.append(random.choice(HOT_CUSTOMERS))
    else:
        ORDERS.append(random.choice(CUSTOMER_IDS))

ORDER_BATCH = [bucket_and_batch(CUSTOMER_HASHES[c], NBUCKETS, NBATCH, LOG2_NBUCKETS)[1] for c in ORDERS]

# Batch 0 stays resident while the build side is read; a probe-side row whose key
# hashes to any other batch must be written to that batch's temporary file.
ORDERS_SPILLED = sum(1 for b in ORDER_BATCH if b != 0)
FRACTION_SPILLED = ORDERS_SPILLED / N_ORDERS
assert 0.90 < FRACTION_SPILLED < 1.0
SPILLED_PERCENT_ROUNDED = round(FRACTION_SPILLED * 100)
assert SPILLED_PERCENT_ROUNDED == 92

# Skew optimization: the skew hashtable is capped at SKEW_HASH_MEM_PERCENT of the
# budget (hashjoin.h), so only the very hottest customers get a dedicated, always-
# resident skew bucket that never spills, however many batches there are.
SKEW_CAPACITY_ROWS = max(1, BUDGET_M * SKEW_HASH_MEM_PERCENT // 100)
assert SKEW_CAPACITY_ROWS == 4

counts = {c: 0 for c in CUSTOMER_IDS}
for c in ORDERS:
    counts[c] += 1
SKEW_CUSTOMERS = sorted(CUSTOMER_IDS, key=lambda c: -counts[c])[:SKEW_CAPACITY_ROWS]
ORDERS_SERVED_BY_SKEW = sum(counts[c] for c in SKEW_CUSTOMERS)
FRACTION_SKEW_AVOIDS_SPILL = ORDERS_SERVED_BY_SKEW / N_ORDERS
assert FRACTION_SKEW_AVOIDS_SPILL > 0.15  # four of eight hot ids already carry a sixth of all orders

# ---------------------------------------------------------------------------
# A reviewers' scale model of Spark's runtime Bloom filter, same bits-per-item ratio
# as the real defaults (expectedNumItems 1000000, numBits 8388608), scaled down 100x
# so the simulation runs in milliseconds while keeping the identical ratio and k.
# ---------------------------------------------------------------------------
SPARK_EXPECTED_ITEMS = 1_000_000
SPARK_NUM_BITS = 8_388_608
BITS_PER_ITEM = SPARK_NUM_BITS / SPARK_EXPECTED_ITEMS
assert round(BITS_PER_ITEM, 1) == 8.4


def optimal_num_hash_functions(n: int, m: int) -> int:
    """BloomFilter.optimalNumOfHashFunctions: round(m/n * ln 2), at least 1."""
    return max(1, round(m / n * math.log(2)))


SPARK_K = optimal_num_hash_functions(SPARK_EXPECTED_ITEMS, SPARK_NUM_BITS)
assert SPARK_K == 6


def false_positive_rate(n: int, m: int, k: int) -> float:
    return (1 - math.exp(-k * n / m)) ** k


SPARK_FPR = false_positive_rate(SPARK_EXPECTED_ITEMS, SPARK_NUM_BITS, SPARK_K)
assert 0.015 < SPARK_FPR < 0.02

# Scaled simulation: same ratio and k, a size that runs fast.
SCALE = 100
SIM_N = SPARK_EXPECTED_ITEMS // SCALE
SIM_M = SPARK_NUM_BITS // SCALE
SIM_K = optimal_num_hash_functions(SIM_N, SIM_M)
assert SIM_K == SPARK_K


def slot(x: int, i: int, m: int) -> int:
    """One of k independent slots for x, double-hashing with two 32-bit hashes."""
    h1 = hash32(x)
    h2 = int(hashlib.blake2b(f"{x}:salt".encode(), digest_size=4).hexdigest(), 16)
    return (h1 + i * h2) % m


def bloom_build(items, m: int, k: int):
    bits = bytearray(m)
    for x in items:
        for i in range(k):
            bits[slot(x, i, m)] = 1
    return bits


def bloom_contains(bits, x, m: int, k: int) -> bool:
    return all(bits[slot(x, i, m)] for i in range(k))


random.seed(11)
BUILD_SIDE_KEYS = set(random.sample(range(SIM_N * 5), SIM_N))
FILTER_BITS = bloom_build(BUILD_SIDE_KEYS, SIM_M, SIM_K)

PROBE_SAMPLE_SIZE = 20000
probe_not_in_build = [x for x in random.sample(range(SIM_N * 5, SIM_N * 50), PROBE_SAMPLE_SIZE)]
FALSE_POSITIVES = sum(1 for x in probe_not_in_build if bloom_contains(FILTER_BITS, x, SIM_M, SIM_K))
MEASURED_FPR = FALSE_POSITIVES / PROBE_SAMPLE_SIZE
assert abs(MEASURED_FPR - SPARK_FPR) < 0.01  # the measured filter matches the formula

if __name__ == "__main__":
    print("nbuckets", NBUCKETS, "log2_nbuckets", LOG2_NBUCKETS)
    print("nbatch chosen", NBATCH, "max batch size", max(BATCH_SIZES), "min", min(BATCH_SIZES))
    print("orders spilled to temp files:", ORDERS_SPILLED, "/", N_ORDERS, "=", round(FRACTION_SPILLED, 4))
    print("skew capacity (rows):", SKEW_CAPACITY_ROWS, "hot customers", SKEW_CUSTOMERS)
    print("fraction of orders a skew table keeps off disk:", round(FRACTION_SKEW_AVOIDS_SPILL, 4))
    print("Spark bloom filter: bits/item", BITS_PER_ITEM, "k", SPARK_K, "formula fpr", round(SPARK_FPR, 5))
    print("measured fpr on scaled filter:", round(MEASURED_FPR, 5))
    print("ALL ASSERTS PASSED")
