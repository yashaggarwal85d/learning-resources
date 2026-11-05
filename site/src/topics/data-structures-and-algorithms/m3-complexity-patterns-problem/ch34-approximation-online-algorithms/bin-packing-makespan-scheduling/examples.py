"""dsa.bin-packing-makespan-scheduling — every number is computed and asserted here.

Two more guarantees of the same shape as the chapter's first topic (bound your own
answer against a computable lower bound on OPT), on the two NP-hard problems named in
the intractability chapter before this one (declared, not yet live): First-Fit
Decreasing for bin packing (an asymptotic ratio: 11/9 * OPT plus an additive constant,
not an absolute one) and Longest-Processing-Time-first for scheduling on identical
machines (an absolute ratio of 4/3 - 1/(3m)). A third section reads Apache Spark's own
file-splitting source directly and reports what it actually implements, named, not
reimplemented as a theory algorithm.
"""

from fractions import Fraction as F
import itertools


# ---------------------------------------------------------------------------
# 1. First-Fit Decreasing for bin packing.
# ---------------------------------------------------------------------------

def ffd(items, capacity):
    items = sorted(items, reverse=True)
    bins = []
    for it in items:
        for b in bins:
            if sum(b) + it <= capacity:
                b.append(it)
                break
        else:
            bins.append([it])
    return bins


# Johnson's own tight construction (read from the source's bound FFD(I) <= 11/9 OPT(I)
# + 6/9; the exact instance below is this topic's own reproduction of the standard
# "6+6+6+12 items near 1/2, 1/4+2eps, 1/4+eps, 1/4-2eps" family, scaled by capacity 1):
eps = F(1, 100)
cap = F(1)
johnson_items = [F(1, 2) + eps] * 6 + [F(1, 4) + 2 * eps] * 6 + [F(1, 4) + eps] * 6 + [F(1, 4) - 2 * eps] * 12
johnson_total = sum(johnson_items)
johnson_bins = ffd(johnson_items, cap)
volume_lower_bound = -(-johnson_total // 1)  # ceil(total size / capacity)

print(f"Johnson family: {len(johnson_items)} items, total size {johnson_total} "
      f"(as a float: {float(johnson_total):.4f})")
print(f"FFD uses {len(johnson_bins)} bins; lower bound by volume alone: {volume_lower_bound}")

assert len(johnson_items) == 30
assert johnson_total == 9
assert volume_lower_bound == 9
assert len(johnson_bins) == 11
# This shows FFD = 11 against a volume-only lower bound of 9 (not a proof OPT = 9 — a
# lower bound by total volume is never larger than OPT, so this is consistent with the
# published 11/9 ratio but does not itself establish OPT's exact value).
assert F(len(johnson_bins)) <= F(11, 9) * volume_lower_bound + F(6, 9) + F(1, 1000)  # sanity, not a proof of tightness


def brute_force_min_bins(items, capacity):
    """Exact bin count for small instances: try k = volume lower bound upward."""
    items = sorted(items, reverse=True)
    n = len(items)
    lb = int(-(-sum(items) // capacity))
    for k in range(lb, n + 1):
        loads = [F(0)] * k

        def backtrack(i):
            if i == n:
                return True
            seen = set()
            for b in range(k):
                if loads[b] in seen:
                    continue
                seen.add(loads[b])
                if loads[b] + items[i] <= capacity:
                    loads[b] += items[i]
                    if backtrack(i + 1):
                        return True
                    loads[b] -= items[i]
            return False

        if backtrack(0):
            return k
    return n


# A small instance (found by random search, not hand-picked) where FFD is provably
# non-optimal and the optimum is small enough to verify exactly by brute force.
small_items = [3, 6, 5, 3, 4, 5, 3, 5]
small_cap = 12
small_ffd = ffd(small_items, small_cap)
small_opt = brute_force_min_bins([F(x) for x in small_items], F(small_cap))
print(f"\nSmall instance {small_items}, capacity {small_cap}: "
      f"FFD uses {len(small_ffd)} bins, true optimum is {small_opt}")
assert len(small_ffd) == 4
assert small_opt == 3
assert F(len(small_ffd)) <= F(11, 9) * small_opt + F(6, 9)


# ---------------------------------------------------------------------------
# 2. Longest-Processing-Time-first for identical-machine scheduling.
# ---------------------------------------------------------------------------

def lpt_makespan(jobs, m):
    loads = [0] * m
    for j in sorted(jobs, reverse=True):
        i = min(range(m), key=lambda k: loads[k])
        loads[i] += j
    return max(loads)


def optimal_makespan_bruteforce(jobs, m):
    n = len(jobs)
    best = sum(jobs)
    for assign in itertools.product(range(m), repeat=n):
        loads = [0] * m
        for job, a in zip(jobs, assign):
            loads[a] += job
        best = min(best, max(loads))
    return best


GRAHAM_RESULTS = []
for m in [2, 3, 4, 5]:
    jobs = []
    for size in range(2 * m - 1, m, -1):
        jobs += [size, size]
    jobs += [m, m, m]
    lpt_ms = lpt_makespan(jobs, m)
    opt_ms = optimal_makespan_bruteforce(jobs, m)
    ratio = lpt_ms / opt_ms
    GRAHAM_RESULTS.append((m, jobs, lpt_ms, opt_ms, ratio))

print("\nGraham's tight family, LPT makespan against the true (brute-force) optimum:")
for m, jobs, lpt_ms, opt_ms, ratio in GRAHAM_RESULTS:
    bound = F(4, 3) - F(1, 3 * m)
    print(f"  m={m}: jobs={jobs}  LPT={lpt_ms}  OPT={opt_ms}  ratio={ratio:.4f}  bound(4/3-1/3m)={float(bound):.4f}")
    assert abs(ratio - float(bound)) < 1e-9

assert [r[2] for r in GRAHAM_RESULTS] == [7, 11, 15, 19]
assert [r[3] for r in GRAHAM_RESULTS] == [6, 9, 12, 15]
assert [round(r[4], 4) for r in GRAHAM_RESULTS] == [1.1667, 1.2222, 1.25, 1.2667]


# ---------------------------------------------------------------------------
# 3. The two cost models side by side: arbitrary-order list scheduling vs. LPT,
#    on the identical Graham-family jobs (order is the only difference).
# ---------------------------------------------------------------------------

def list_schedule_makespan(jobs_in_order, m):
    loads = [0] * m
    for j in jobs_in_order:
        i = min(range(m), key=lambda k: loads[k])
        loads[i] += j
    return max(loads)


# The classic list-scheduling worst case: m*(m-1) unit jobs, then one job of size m,
# submitted in that order (small jobs first, arbitrary — not sorted by size). Every
# machine fills with (m-1) unit jobs before the size-m job arrives and lands on one of
# the (tied) machines, for a makespan of 2m-1 against a true optimum of m.
LIST_SCHED_RESULTS = []
for m in [2, 3]:
    worst_order_jobs = [1] * (m * (m - 1)) + [m]
    ls_ms = list_schedule_makespan(worst_order_jobs, m)
    ls_opt = optimal_makespan_bruteforce(worst_order_jobs, m)
    lpt_same_ms = lpt_makespan(worst_order_jobs, m)  # LPT sorts first, so order doesn't matter
    LIST_SCHED_RESULTS.append((m, worst_order_jobs, ls_ms, ls_opt, lpt_same_ms))

print("\nArbitrary-order list scheduling's own worst case (same jobs LPT handles correctly):")
for m, jobs, ls_ms, ls_opt, lpt_ms in LIST_SCHED_RESULTS:
    bound = 2 - 1 / m
    print(f"  m={m}: jobs={jobs}  arbitrary-order makespan={ls_ms}  true optimum={ls_opt}  "
          f"LPT on the same jobs={lpt_ms}  bound(2-1/m)={bound:.4f}")
    assert ls_ms / ls_opt == bound
    assert lpt_ms == ls_opt  # sorting first (LPT) finds the optimum on this instance; order was the only difference

assert [r[2] for r in LIST_SCHED_RESULTS] == [3, 5]
assert [r[3] for r in LIST_SCHED_RESULTS] == [2, 3]


# ---------------------------------------------------------------------------
# 4. Spark's own file-splitting algorithm, read directly, not reimplemented as FFD.
# ---------------------------------------------------------------------------

def spark_next_fit_decreasing(file_sizes, max_split_bytes, open_cost_in_bytes):
    """Reproduces FilePartition.scala's getFilePartitions: sort descending (done by the
    caller in the real system), then close the current partition and start a new one the
    moment adding the next file would exceed max_split_bytes. Each file also carries a
    fixed per-file open cost added to the running size, per the real source's own line
    `currentSize += file.length + openCostInBytes`."""
    partitions = []
    current = []
    current_size = 0
    for size in file_sizes:
        if current_size + size > max_split_bytes:
            if current:
                partitions.append(current)
            current = []
            current_size = 0
        current_size += size + open_cost_in_bytes
        current.append(size)
    if current:
        partitions.append(current)
    return partitions


# A skewed list of file sizes (sorted descending, as Spark's own planner does before
# calling getFilePartitions), measured against true First-Fit-Decreasing on the same list.
skewed_files = sorted([120, 95, 95, 60, 60, 60, 40, 40, 40, 40, 20, 20, 20, 20, 20], reverse=True)
MAX_SPLIT = 150
OPEN_COST = 10

spark_partitions = spark_next_fit_decreasing(skewed_files, MAX_SPLIT, OPEN_COST)
ffd_partitions = ffd([s + OPEN_COST for s in skewed_files], MAX_SPLIT)

print(f"\nSkewed file sizes {skewed_files}, max split {MAX_SPLIT}, open cost {OPEN_COST}:")
print(f"  Spark's own Next-Fit-Decreasing: {len(spark_partitions)} partitions -> {spark_partitions}")
print(f"  True First-Fit-Decreasing (same open-cost accounting): {len(ffd_partitions)} bins")

assert len(spark_partitions) == 7
assert len(ffd_partitions) <= len(spark_partitions)
# On this instance Spark's next-fit variant matches true FFD exactly; the general claim
# (next-fit can use strictly more partitions than First-Fit-Decreasing on some input) is
# a known property of next-fit algorithms, cited in SOURCES.md, not reproduced by a
# counting argument here — the 11/9 guarantee itself is proved for First-Fit, not for
# this next-fit relative, and this topic states only that distinction.
