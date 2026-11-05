import math
import random
from itertools import permutations

def harmonic(n):
    return sum(1.0 / i for i in range(1, n + 1))

# Linearity of expectation needs no independence: draw two balls without replacement from an
# urn of 3 red and 2 blue (5 total). X1 = first draw red, X2 = second draw red; X1 and X2 are
# dependent (knowing the first was red changes the odds for the second), but E[X1+X2] is still
# E[X1] + E[X2].
URN_RED, URN_BLUE = 3, 2
URN = ['R'] * URN_RED + ['B'] * URN_BLUE

def urn_expected_reds_exhaustive(urn, draws):
    total = 0.0
    count = 0
    for seq in permutations(range(len(urn)), draws):
        total += sum(1 for idx in seq if urn[idx] == 'R')
        count += 1
    return total / count

URN_E_X1 = URN_RED / len(URN)
URN_E_X2 = URN_RED / len(URN)  # same marginal, by symmetry, despite the dependence
URN_E_SUM_BY_LINEARITY = URN_E_X1 + URN_E_X2
URN_E_SUM_EXHAUSTIVE = urn_expected_reds_exhaustive(URN, 2)
assert abs(URN_E_SUM_BY_LINEARITY - URN_E_SUM_EXHAUSTIVE) < 1e-9
assert round(URN_E_SUM_EXHAUSTIVE, 2) == 1.2

# The exact expectation of fixed points, from n indicator variables each with probability 1/n,
# whatever the dependence among them: n * (1/n) = 1, for every n.
EXPECTED_FIXED_POINTS = 1.0
assert EXPECTED_FIXED_POINTS == 1.0

def quicksort_expected_comparisons(n):
    Hn = harmonic(n)
    return 2 * (n + 1) * Hn - 4 * n

Q10 = round(quicksort_expected_comparisons(10), 2)
Q100 = round(quicksort_expected_comparisons(100), 2)
Q1000 = round(quicksort_expected_comparisons(1000), 2)
assert Q10 == 24.44
assert Q100 == 647.85
assert Q1000 == 10985.91

def quicksort_comparisons(a, rng):
    a = list(a)
    count = 0

    def sort(lo, hi):
        nonlocal count
        if hi - lo < 2:
            return
        p = lo + rng.randrange(hi - lo)
        a[lo], a[p] = a[p], a[lo]
        pivot = a[lo]
        count += hi - lo - 1
        store = lo + 1
        for i in range(lo + 1, hi):
            if a[i] < pivot:
                a[i], a[store] = a[store], a[i]
                store += 1
        a[lo], a[store - 1] = a[store - 1], a[lo]
        sort(lo, store - 1)
        sort(store, hi)

    sort(0, len(a))
    return count

rng = random.Random(29)
N = 1000
SIMULATED_RUNS = [quicksort_comparisons(range(N), rng) for _ in range(200)]
SIMULATED_MEAN = round(sum(SIMULATED_RUNS) / len(SIMULATED_RUNS))
assert 10800 <= SIMULATED_MEAN <= 11200

TWO_N_LN_N = round(2 * N * math.log(N))
assert TWO_N_LN_N == 13816

def coupon_collector_expected(n):
    return n * harmonic(n)

C10 = round(coupon_collector_expected(10), 1)
C50 = round(coupon_collector_expected(50), 1)
C365 = round(coupon_collector_expected(365), 1)
assert C10 == 29.3
assert C50 == 225.0
assert C365 == 2364.6

def coupon_collector_simulate(n, rng):
    seen = set()
    draws = 0
    while len(seen) < n:
        seen.add(rng.randrange(n))
        draws += 1
    return draws

rng2 = random.Random(50)
COUPON_RUNS_50 = [coupon_collector_simulate(50, rng2) for _ in range(2000)]
COUPON_MEAN_50 = round(sum(COUPON_RUNS_50) / len(COUPON_RUNS_50), 1)
assert 215 <= COUPON_MEAN_50 <= 240

def fixed_points(perm):
    return sum(1 for i, v in enumerate(perm) if i == v)

rng3 = random.Random(10)
FIXED_POINT_RUNS = []
for _ in range(20000):
    perm = list(range(10))
    rng3.shuffle(perm)
    FIXED_POINT_RUNS.append(fixed_points(perm))
FIXED_POINT_MEAN = round(sum(FIXED_POINT_RUNS) / len(FIXED_POINT_RUNS), 3)
assert 0.9 <= FIXED_POINT_MEAN <= 1.1

def sattolo_shuffle(a, rng):
    a = list(a)
    n = len(a)
    for i in range(n - 1, 0, -1):
        j = rng.randrange(i)  # strictly below i: Sattolo's variant
        a[i], a[j] = a[j], a[i]
    return a

rng4 = random.Random(4)
SATTOLO_FIXED_POINT_RUNS = []
for _ in range(20000):
    perm = sattolo_shuffle(range(4), rng4)
    SATTOLO_FIXED_POINT_RUNS.append(fixed_points(perm))
assert sum(SATTOLO_FIXED_POINT_RUNS) == 0

HN_APPROX_1000 = round(math.log(1000) + 0.5772156649, 2)
HN_EXACT_1000 = round(harmonic(1000), 2)
assert abs(HN_APPROX_1000 - HN_EXACT_1000) < 0.01

if __name__ == "__main__":
    print("Quicksort expectation:", Q10, Q100, Q1000)
    print("Simulated mean at n=1000 over 200 runs:", SIMULATED_MEAN, "vs 2n ln n:", TWO_N_LN_N)
    print("Coupon collector:", C10, C50, C365, "simulated mean at n=50:", COUPON_MEAN_50)
    print("Fixed points mean (Fisher-Yates):", FIXED_POINT_MEAN, "Sattolo fixed points total:", sum(SATTOLO_FIXED_POINT_RUNS))
    print("H_1000 exact vs approx:", HN_EXACT_1000, HN_APPROX_1000)
