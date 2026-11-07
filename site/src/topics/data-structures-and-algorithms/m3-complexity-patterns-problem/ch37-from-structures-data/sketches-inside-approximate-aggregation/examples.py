"""Sketches inside approximate aggregation: this chapter's eighth topic.

A sketch is useful inside a distributed aggregate exactly when it is mergeable: the
sketch of two partitions' union must equal (HyperLogLog's register maximum) or
approximate within a stated error (a quantile sketch) what a single pass over the
combined data would have produced. This file measures the merge law on one
partitioned stream (eight partitions of order amounts and customer ids, built with
the same skew the chapter's other topics use), and measures the two wrong shortcuts
a reader reaches for instead: summing per-partition distinct-count estimates, and
averaging per-partition medians.
"""

import hashlib
import math
import random


def h32(s):
    # A fixed MD5-based digest keeps every number in this file reproducible run to
    # run; CPython's built-in hash() of a str is randomly seeded per process
    # (PYTHONHASHSEED) and was rejected for exactly that reason.
    return int.from_bytes(hashlib.md5(s.encode()).digest()[:4], "big")


# ---------------------------------------------------------------------------
# The chapter's partitioned stream: order amounts and customer ids across eight
# partitions, with the same skew the chapter's other topics carry (one customer
# places many orders; one partition is far smaller than the rest).
# ---------------------------------------------------------------------------

NUM_PARTITIONS = 8
rows = []  # (partition_index, customer_id, amount)

random.seed(37124)
for p in range(NUM_PARTITIONS - 1):
    n = 6000
    for i in range(n):
        customer = f"cust-{random.randint(0, 3999)}"
        amount = round(random.uniform(8.0, 40.0), 2)
        rows.append((p, customer, amount))
# The eighth partition is a hundredth the size of the others and holds only a
# cluster of large, unusual orders -- a small, skewed partition, matching the
# chapter's own hook: a partition this small barely moves the true median.
last_p = NUM_PARTITIONS - 1
for i in range(60):
    customer = f"cust-{random.randint(4000, 4199)}"
    amount = round(random.uniform(300.0, 520.0), 2)
    rows.append((last_p, customer, amount))

TOTAL_ROWS = len(rows)
assert TOTAL_ROWS == 42060
partitions = [[r for r in rows if r[0] == p] for p in range(NUM_PARTITIONS)]
assert [len(p) for p in partitions] == [6000] * 7 + [60]

# ---------------------------------------------------------------------------
# PostgreSQL's own words for what a combine function must be: the same
# transition function (MAX/MIN) or an addition (SUM) -- a merge law so small
# that a sketch is just an aggregate whose combine function happens to be
# more interesting than addition.
# ---------------------------------------------------------------------------

EXACT_SUM_IS_MERGEABLE = True   # SUM: combine(a, b) = a + b
EXACT_MAX_IS_MERGEABLE = True   # MAX: combine(a, b) = max(a, b)
EXACT_AVG_IS_MERGEABLE = False  # AVG needs (sum, count) as its state, not the average itself
assert EXACT_SUM_IS_MERGEABLE and EXACT_MAX_IS_MERGEABLE and not EXACT_AVG_IS_MERGEABLE


# ---------------------------------------------------------------------------
# HyperLogLog: a register array that merges by element-wise maximum, exactly.
# m registers (a power of two), register index from the top log2(m) bits of a
# hash, the register value the position of the leftmost one bit in the rest.
# ---------------------------------------------------------------------------

M_BITS = 6
M = 1 << M_BITS  # 64 registers, small enough to draw on screen


def leading_zero_run(bits_32_minus_mbits, width):
    # Position (1-indexed) of the leftmost 1 bit, or width + 1 if there is none.
    for i in range(width):
        if (bits_32_minus_mbits >> (width - 1 - i)) & 1:
            return i + 1
    return width + 1


def hll_registers(customer_ids):
    regs = [0] * M
    width = 32 - M_BITS
    mask = (1 << width) - 1
    for cid in customer_ids:
        x = h32(cid)
        idx = x >> width
        rest = x & mask
        rank = leading_zero_run(rest, width)
        if rank > regs[idx]:
            regs[idx] = rank
    return regs


def hll_merge(regs_a, regs_b):
    return [max(a, b) for a, b in zip(regs_a, regs_b)]


ALPHA_64 = 0.709  # HyperLogLog's bias constant for m = 64 (Flajolet et al.)


def hll_estimate(regs):
    inv_sum = sum(2.0 ** (-r) for r in regs)
    return ALPHA_64 * M * M / inv_sum


# Per-partition registers, merged two ways: incrementally, and all at once.
# Both must equal the registers of a single pass over every row -- the merge
# law for HyperLogLog is exact at the register level, not only within an
# error bound.
per_partition_customers = [sorted({r[1] for r in part}) for part in partitions]
per_partition_regs = [hll_registers(cs) for cs in per_partition_customers]

all_customers = sorted({r[1] for r in rows})
single_pass_regs = hll_registers(all_customers)

merged_regs = per_partition_regs[0]
for regs in per_partition_regs[1:]:
    merged_regs = hll_merge(merged_regs, regs)

assert merged_regs == single_pass_regs, "HLL's merge law must hold at the register level, exactly"

EXACT_DISTINCT_CUSTOMERS = len(all_customers)
merged_estimate = hll_estimate(merged_regs)
hll_relative_error = abs(merged_estimate - EXACT_DISTINCT_CUSTOMERS) / EXACT_DISTINCT_CUSTOMERS
assert hll_relative_error < 0.15, f"merged HLL estimate should track the exact count, got {hll_relative_error:.3f}"

# The wrong shortcut: summing each partition's own distinct-count estimate.
# Customers repeat across partitions (the same shopper orders more than
# once, sometimes in different partitions), so the sum over-counts.
per_partition_estimates = [hll_estimate(regs) for regs in per_partition_regs]
naive_summed_estimate = sum(per_partition_estimates)
summed_overcount_ratio = naive_summed_estimate / EXACT_DISTINCT_CUSTOMERS
assert summed_overcount_ratio > 1.3, (
    f"summing per-partition HLL estimates must over-count distinct customers who ordered in more than "
    f"one partition, got only {summed_overcount_ratio:.2f}x"
)


# ---------------------------------------------------------------------------
# A quantile sketch: each partition keeps a small reservoir sample (Algorithm
# R, Chapter 29's structure, declared here) instead of every amount; merging
# is concatenating the samples, weighted by how many rows each one stands
# for -- the same weighting Spark's RangePartitioner.sketch uses.
# ---------------------------------------------------------------------------

SAMPLE_SIZE_PER_PARTITION = 200


def reservoir_sample(values, k, seed):
    rnd = random.Random(seed)
    sample = []
    for i, v in enumerate(values):
        if i < k:
            sample.append(v)
        else:
            j = rnd.randint(0, i)
            if j < k:
                sample[j] = v
    return sample


def true_median(values):
    s = sorted(values)
    n = len(s)
    mid = n // 2
    if n % 2 == 1:
        return s[mid]
    return (s[mid - 1] + s[mid]) / 2.0


def weighted_quantile(weighted_values, q):
    # weighted_values: list of (value, weight), as Spark's determineBounds consumes.
    ordered = sorted(weighted_values, key=lambda vw: vw[0])
    total = sum(w for _, w in ordered)
    target = q * total
    cum = 0.0
    for value, weight in ordered:
        cum += weight
        if cum >= target:
            return value
    return ordered[-1][0]


partition_amounts = [[r[2] for r in part] for part in partitions]
EXACT_MEDIAN = true_median([r[2] for r in rows])

partition_medians = [true_median(a) for a in partition_amounts]
naive_average_of_medians = sum(partition_medians) / len(partition_medians)

# The hook's own shape: the small, skewed eighth partition pulls the naive
# average of medians far from the true median, which barely moves since that
# partition holds so few of the rows.
naive_error = abs(naive_average_of_medians - EXACT_MEDIAN)
exact_in_normal_range = min(partition_medians[:-1]) <= EXACT_MEDIAN <= max(partition_medians[:-1])
assert exact_in_normal_range, "the true median should stay inside the seven ordinary partitions' own range"
assert naive_error > 15.0, f"averaging partition medians should miss badly, got only {naive_error:.2f} off"

# The merged, weighted reservoir sample: a mergeable summary of the same data.
weighted_candidates = []
for idx, amounts in enumerate(partition_amounts):
    sample = reservoir_sample(amounts, SAMPLE_SIZE_PER_PARTITION, seed=1000 + idx)
    weight = len(amounts) / len(sample)
    for v in sample:
        weighted_candidates.append((v, weight))

sketch_median = weighted_quantile(weighted_candidates, 0.5)
sketch_error = abs(sketch_median - EXACT_MEDIAN)
assert sketch_error < naive_error / 3, (
    f"the merged sketch's median should land far closer to the true median than the naive average did, "
    f"got sketch error {sketch_error:.2f} against naive error {naive_error:.2f}"
)


# ---------------------------------------------------------------------------
# Spark's own planning-time use of the same mergeable sample: RangePartitioner
# oversamples by three and caps the sample size at one million, so that
# boundaries chosen from partial, per-partition samples still land close to
# the boundaries a full sort would have produced.
# ---------------------------------------------------------------------------

SAMPLE_POINTS_PER_PARTITION_HINT = 20
OVERSAMPLE_FACTOR = 3.0
SAMPLE_SIZE_CAP = 1_000_000
TARGET_OUTPUT_PARTITIONS = 4

sample_size = min(SAMPLE_POINTS_PER_PARTITION_HINT * TARGET_OUTPUT_PARTITIONS, SAMPLE_SIZE_CAP)
per_partition_hint = math.ceil(OVERSAMPLE_FACTOR * sample_size / NUM_PARTITIONS)
assert per_partition_hint == 30

range_candidates = []
for idx, amounts in enumerate(partition_amounts):
    sample = reservoir_sample(amounts, per_partition_hint, seed=2000 + idx)
    weight = len(amounts) / len(sample)
    for v in sample:
        range_candidates.append((v, weight))

# One boundary per cut between the four target output partitions.
range_bounds = [weighted_quantile(range_candidates, q) for q in (0.25, 0.5, 0.75)]
all_amounts_sorted = sorted(r[2] for r in rows)
true_bounds = [
    all_amounts_sorted[int(q * (len(all_amounts_sorted) - 1))] for q in (0.25, 0.5, 0.75)
]
bound_errors = [abs(a - b) for a, b in zip(range_bounds, true_bounds)]
assert max(bound_errors) < 20.0, f"sampled range boundaries should track the true quartiles, got {bound_errors}"


# ---------------------------------------------------------------------------
# A Bloom filter, built once per partition with equal parameters, is also
# mergeable -- by bitwise OR -- named once, as the chapter's own cross-link
# to topic 117's pushdown filter and Chapter 12's structure.
# ---------------------------------------------------------------------------

BLOOM_BITS = 2048
BLOOM_HASHES = 4


def bloom_build(items, bits=BLOOM_BITS, k=BLOOM_HASHES):
    arr = 0
    for item in items:
        base = h32(item)
        for i in range(k):
            pos = (base + i * 0x9E3779B1) % bits
            arr |= 1 << pos
    return arr


def bloom_contains(arr, item, bits=BLOOM_BITS, k=BLOOM_HASHES):
    base = h32(item)
    for i in range(k):
        pos = (base + i * 0x9E3779B1) % bits
        if not (arr >> pos) & 1:
            return False
    return True


bloom_a = bloom_build(per_partition_customers[0])
bloom_b = bloom_build(per_partition_customers[1])
bloom_merged = bloom_a | bloom_b  # mergeable by OR, built with equal bits and hash count

all_in_a_or_b = per_partition_customers[0] + per_partition_customers[1]
assert all(bloom_contains(bloom_merged, c) for c in all_in_a_or_b), (
    "every customer present in either partition's filter must still test present in the OR-merged filter"
)


if __name__ == "__main__":
    print(f"total rows: {TOTAL_ROWS}")
    print(f"exact distinct customers: {EXACT_DISTINCT_CUSTOMERS}")
    print(f"merged HLL estimate: {merged_estimate:.1f} ({hll_relative_error * 100:.1f}% off)")
    print(f"naive summed HLL estimate: {naive_summed_estimate:.1f} ({summed_overcount_ratio:.2f}x over)")
    print(f"exact median: {EXACT_MEDIAN:.2f}")
    print(f"naive average of partition medians: {naive_average_of_medians:.2f} (off by {naive_error:.2f})")
    print(f"merged sketch median: {sketch_median:.2f} (off by {sketch_error:.2f})")
    print(f"range bounds (sampled): {range_bounds}")
    print(f"range bounds (true quartiles): {true_bounds}")
