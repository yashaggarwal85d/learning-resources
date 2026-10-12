"""Every number and claim in the Recurrences: Master theorem and Akra-Bazzi reel, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows.

Conventions (stated once): recurrences are evaluated by brute force on integers with floors (or the exact floors and
ceilings where said) and T(1) = 1. Where a floor can reach 0 (the selection and thirds recurrences) T(n) = 1 for n <= 1,
T(0) included: the counts 6,532 / 8,832,605 / 10,526 depend on it."""
import math
import sys
from array import array
from functools import lru_cache

sys.setrecursionlimit(10000)
log2 = math.log2


def levels(a, b, f, n):
    """The column of a recursion tree: a**i * f(n / b**i) for i = 0 .. log_b n (n a power of b)."""
    depth = round(math.log(n, b))
    assert b**depth == n
    return [a**i * f(n // b**i) for i in range(depth + 1)]


# ---------------------------------------------------------------- Step 1 and 12: the vector and the three procedures
N = 1_000_000  # keys, 64-bit
assert N == 10**6

# ---------------------------------------------------------------- Step 2: merge sort's tree at n = 64
col = levels(2, 2, lambda m: m, 64)
assert col == [64] * 7 and sum(col) == 448 and len(col) == 7 == round(log2(64)) + 1


@lru_cache(None)
def merge_pow2(n):  # T(1) = 1, T(n) = 2T(n/2) + n
    return 1 if n == 1 else 2 * merge_pow2(n // 2) + n


assert merge_pow2(64) == 448 == 64 * (round(log2(64)) + 1)
for k in range(0, 21):
    assert merge_pow2(2**k) == 2**k * k + 2**k  # n log2 n + n
# node sizes on the tree: 64, 32, 16, 8, then 16, 32 and 64 dots at levels 4, 5, 6
assert [2**i for i in range(7)] == [1, 2, 4, 8, 16, 32, 64]
assert [64 // 2**i for i in range(4)] == [64, 32, 16, 8]

# ---------------------------------------------------------------- Step 3: 8 calls on each half, f = n^2
big = levels(8, 2, lambda m: m * m, 64)
assert big == [4096, 8192, 16384, 32768, 65536, 131072, 262144]
assert sum(big) == 520192 and 520192 < 2 * 262144
assert 8**6 == 262144 == 64**3 and big[-1] == 64 * big[0] == 262144
assert [8**i for i in range(3, 7)] == [512, 4096, 32768, 262144]  # nodes on levels 3..6: the strip labels
assert 8 * (32**2) == 8192 == 2 * 4096  # one level of 8 calls on half the keys doubles the total
assert (32 // 2) ** 2 * 8 == 2048 and 1024 == 32**2 and 1024 == (64 // 2) ** 2  # the first labelled box on level 1
assert 4096 == 64**2 and 1024 * 4 == 4096
assert round(520192 / 64**3, 2) == 1.98


@lru_cache(None)
def eight(n):  # T(1) = 1, T(n) = 8T(n/2) + n^2
    return 1 if n == 1 else 8 * eight(n // 2) + n * n


assert eight(64) == 520192
for k in range(6, 17):
    r = eight(2**k) / (2**k) ** 3
    assert 1.98 < r < 2.0  # Theta(n^3)

# ---------------------------------------------------------------- Step 4: three shapes of the column at n = 64
shrink = levels(2, 2, lambda m: m * m, 64)
flat = levels(2, 2, lambda m: m, 64)
assert shrink == [4096, 2048, 1024, 512, 256, 128, 64] and sum(shrink) == 8128 and 8128 < 2 * 4096
assert flat == [64] * 7 and sum(flat) == 448
assert big[0] == 4096 and big[-1] == 262144
# per-level ratios a * f(n/b) / f(n) at n = 64
assert 2 * (32**2) / 64**2 == 0.5 and 2 * 32 / 64 == 1 and 8 * (32**2) / 64**2 == 2

# ---------------------------------------------------------------- Step 5: the watershed table
assert math.log2(8) == 3 and math.log2(2) == 1 and math.log2(1) == 0
assert f"{math.log2(3):.3f}" == "1.585" and f"{math.log2(7):.3f}" == "2.807"
assert 3**6 == 729 == round(64 ** math.log2(3)) and 7**6 == 117649 == round(64 ** math.log2(7))
assert 64 == 64**1 and 1 == 64**0
tri = levels(3, 2, lambda m: m, 64)
assert tri == [64, 96, 144, 216, 324, 486, 729]
# regularity for f = n^2 under 2T(n/2): a f(n/b) = n^2 / 2, so c = 1/2 for every n
for n in (64, 10**6):
    assert 2 * (n // 2) ** 2 * 2 == n * n  # 2 * (n/2)^2 = n^2 / 2
    assert 2 * (n // 2) ** 2 / n**2 == 0.5
assert 2 / 2**2 == 0.5  # c = a / b^d with a = 2, b = 2, d = 2


@lru_cache(None)
def two_sq(n):
    return 1 if n == 1 else 2 * two_sq(n // 2) + n * n


for k in range(6, 17):
    r = two_sq(2**k) / (2**k) ** 2
    assert 1.98 < r < 2.0  # Theta(n^2): case 3


@lru_cache(None)
def tri_rec(n):
    return 1 if n == 1 else 3 * tri_rec(n // 2) + n


ratios = [tri_rec(2**k) / 3**k for k in range(6, 21)]
assert 2.8 < ratios[0] < 2.83 and 2.99 < ratios[-1] < 3.0  # T(n) / n^(log2 3) rises from 2.82 to 2.999, bounded
assert all(a < b for a, b in zip(ratios, ratios[1:]))
assert 2**6 == 64 and 2**20 == 1048576
# binary search: T(1) = 1, T(n) = T(n/2) + 1 is log2 n + 1 on powers of two
assert levels(1, 2, lambda m: 1, 64) == [1] * 7


def bsearch(n):  # T(1) = 1, T(n) = T(floor(n/2)) + 1
    return 1 if n == 1 else bsearch(n // 2) + 1


assert bsearch(64) == 7 == round(log2(64)) + 1
for n in range(1, 5000):
    assert bsearch(n) == n.bit_length() == int(math.floor(math.log2(n))) + 1
assert bsearch(N) == 20 == int(math.floor(math.log2(N))) + 1  # 20 probes (19 halvings)

# ---------------------------------------------------------------- Step 6: the gap, 2T(n/2) + n log2 n at n = 64
gap = [2**i * ((64 // 2**i) * round(log2(64 // 2**i))) for i in range(6)]
assert gap == [384, 320, 256, 192, 128, 64] and sum(gap) == 1344 == 64 * 21 == 64 * 6 * 7 // 2
assert [round(b / a, 3) for a, b in zip(gap, gap[1:])] == [0.833, 0.8, 0.75, 0.667, 0.5]
assert 0.83 == round(320 / 384, 2) and 0.80 == round(256 / 320, 2) and 0.75 == 192 / 256 and 0.67 == round(128 / 192, 2) and 0.50 == 64 / 128


@lru_cache(None)
def nlogn(n):  # T(1) = 1, T(n) = 2T(n/2) + n log2 n
    return 1 if n == 1 else 2 * nlogn(n // 2) + n * round(log2(n))


assert nlogn(64) == 1408 == 1344 + 64  # six levels of splitting work plus 64 leaves with T(1) = 1
for k in range(8, 21):
    n = 2**k
    assert 0.4 < nlogn(n) / (n * k * k) < 0.6  # Theta(n log^2 n)

# ---------------------------------------------------------------- Step 7: the lopsided tree, selection, n = 1000
sel = [1000 * 0.9**i for i in range(6)]
assert [round(x) for x in sel] == [1000, 900, 810, 729, 656, 590]
assert abs(sel[4] - 656.1) < 1e-9 and abs(sel[5] - 590.49) < 1e-9
assert round(1000 / (1 - 0.9)) == 10000 and abs(1 / 5 + 7 / 10 - 0.9) < 1e-12 and abs(9 / 10 * 9 / 10 - 0.81) < 1e-12
assert [1000 // 5, 7 * 1000 // 10] == [200, 700]
assert [200 // 5, 7 * 200 // 10, 700 // 5, 7 * 700 // 10] == [40, 140, 140, 490]
assert [40 // 5, 7 * 40 // 10, 140 // 5, 7 * 140 // 10, 140 // 5, 7 * 140 // 10, 490 // 5, 7 * 490 // 10] == [8, 28, 28, 98, 28, 98, 98, 343]


@lru_cache(None)
def S(n):  # T(n) = 1 for n <= 1 (T(0) included), S(n) = S(n//5) + S(7n//10) + n
    return 1 if n <= 1 else S(n // 5) + S(7 * n // 10) + n


assert S(1000) == 6532 and S(N) == 8832605
assert round(S(N) / N, 2) == 8.83
# the count depends on T(0): with T(0) = 0 the answers are different
@lru_cache(None)
def S0(n):
    return 0 if n <= 0 else (1 if n == 1 else S0(n // 5) + S0(7 * n // 10) + n)


assert S0(1000) == 6394 and S0(N) == 8788161
# S(n) <= 10 n for every 1 <= n <= 10^7, by array DP
LIM = 10**7
arr = array("q", [1]) * (LIM + 1)
worst = 0.0
for n in range(2, LIM + 1):
    v = arr[n // 5] + arr[7 * n // 10] + n
    arr[n] = v
    if v > 10 * n:
        raise AssertionError(n)
    if n >= 1000 and v / n > worst:
        worst, at = v / n, n
assert worst < 9.2 and abs(worst - 9.19) < 0.01  # largest S(n)/n is 9.19
assert arr[1000] == 6532 and arr[N] == 8832605
for n, want in ((10**2, 5.0), (10**3, 6.53), (10**4, 7.60), (10**5, 8.32), (10**6, 8.83), (10**7, 9.19)):
    assert round(arr[n] / n, 2) == want, (n, arr[n] / n)
del arr
# the substitution constant: (1/5 + 7/10) k + 1 <= k  iff  k >= 10
assert (1 / 5 + 7 / 10) * 10 + 10 <= 100 and all((9 / 10) * k * 100 + 100 <= k * 100 for k in (10, 11, 50))
assert not (9 / 10) * 9 * 100 + 100 <= 9 * 100
# the exact form with ceilings and + 6: S6(n) = S6(ceil(n/5)) + S6(floor(7n/10) + 6) + n, S6(n) = n for n <= 100
LIM6 = 10**7
S6 = array("q", [0]) * (LIM6 + 1)
for n in range(0, 101):
    S6[n] = n
worst6 = 0.0
for n in range(101, LIM6 + 1):
    S6[n] = S6[(n + 4) // 5] + S6[7 * n // 10 + 6] + n
    if S6[n] > 10 * n:
        raise AssertionError(n)
    worst6 = max(worst6, S6[n] / n) if n > 10**6 else worst6
assert round(S6[LIM6] / LIM6, 2) == 8.76
del S6
# the 50c of the exact ceiling recurrence: 8k + cn - kn/10 <= 0 exactly when n >= 100 (k = 50c, c = 1)
assert all(8 * 50 + n - 50 * n / 10 <= 0 for n in range(100, 1000)) and not (8 * 50 + 99 - 50 * 99 / 10 <= 0)
assert 8 * 50 == 400 and 400 - 4 * 100 == 0

# ---------------------------------------------------------------- Step 8: groups of 3, T(n/3) + T(2n/3) + n
@lru_cache(None)
def G(n):
    return 1 if n <= 1 else G(n // 3) + G(2 * n // 3) + n


assert G(1000) == 10526 and round(G(1000) / (1000 * log2(1000)), 3) == 1.056
@lru_cache(None)
def G0(n):
    return 0 if n <= 0 else (1 if n == 1 else G0(n // 3) + G0(2 * n // 3) + n)


assert G0(1000) == 10261
assert abs(1 / 3 + 2 / 3 - 1) < 1e-12
assert [round(1000 / 3), round(2000 / 3), round(1000 / 9), round(2000 / 9), round(2000 / 9), round(4000 / 9)] == [333, 667, 111, 222, 222, 444]
for e in range(3, 7):
    n = 10**e
    assert 1.0 <= G(n) / (n * log2(n)) <= 1.1
tcols = [1000 * (1 / 3 + 2 / 3) ** i for i in range(7)]
assert all(abs(x - 1000) < 1e-6 for x in tcols)
assert 3**6 == 729 < 1000 and 1.5**6 < 12 and math.log(1000, 3) > 6 > 0  # the first six levels are complete (n=1000 > 3^6)

# ---------------------------------------------------------------- Step 9: the exponent p
phi = lambda p: (1 / 5) ** p + (7 / 10) ** p


def solve(terms):
    lo, hi = -5.0, 5.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if sum(a * b**mid for a, b in terms) > 1:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


p = solve([(1, 1 / 5), (1, 7 / 10)])
assert 0.8397 < p < 0.8398 and abs(phi(p) - 1) < 1e-9 and round(p, 2) == 0.84
assert round(phi(0), 3) == 2.0 and round(phi(0.5), 3) == 1.284 and round(phi(1), 3) == 0.9 and round(phi(1.5), 3) == 0.675
assert round(phi(0.8398), 3) == 1.000
assert all(phi(a) > phi(b) for a, b in zip([x / 10 for x in range(-50, 50)], [x / 10 for x in range(-49, 51)]))
for terms, want in (
    ([(2, 1 / 2)], 1), ([(8, 1 / 2)], 3), ([(1, 1 / 2)], 0), ([(1, 1 / 3), (1, 2 / 3)], 1), ([(1, 1 / 4), (1, 3 / 4)], 1),
    ([(3, 1 / 2)], math.log2(3)), ([(7, 1 / 2)], math.log2(7)), ([(0.5, 1 / 2)], -1), ([(2, 1 / 4), (3, 1 / 6)], 1),
    ([(2, 1 / 2), (8 / 9, 3 / 4)], 2),
):
    assert abs(solve(terms) - want) < 1e-9, (terms, want)
# Akra-Bazzi's integral for f(u) = u: n^p (1 + (n^(1-p) - 1)/(1 - p)) / n rises towards 1/(1 - p)
vals = [(n**p * (1 + (n ** (1 - p) - 1) / (1 - p))) / n for n in (10**3, 10**6, 10**9)]
assert [round(v, 2) for v in vals] == [4.51, 5.67, 6.05] and 6.23 < 1 / (1 - p) < 6.25 and round(1 / (1 - p), 2) == 6.24

# ---------------------------------------------------------------- Step 10: the false proof; T(n)/n climbs by 3 every x8
for k in (1, 4, 7, 10, 13, 16, 19):
    n = 2**k
    assert merge_pow2(n) / n == k + 1
assert [k + 1 for k in (1, 4, 7, 10, 13, 16, 19)] == [2, 5, 8, 11, 14, 17, 20]
assert [2**k for k in (1, 4, 7, 10)] == [2, 16, 128, 1024] and [2**k for k in (13, 16, 19)] == [8192, 65536, 524288]

# ---------------------------------------------------------------- Step 11: a right guess that fails: C(n) = 2C(n/2) + 1
@lru_cache(None)
def calls(n):
    return 1 if n == 1 else 2 * calls(n // 2) + 1


assert [calls(n) for n in (1, 2, 4, 8, 64, 1024)] == [1, 3, 7, 15, 127, 2047]
assert all(calls(2**k) == 2 * 2**k - 1 for k in range(0, 21))
assert levels(2, 2, lambda m: 1, 64) == [1, 2, 4, 8, 16, 32, 64]  # watershed n, f = 1: leaves win
# c*n - d: 2(c n/2 - d) + 1 = c n - 2d + 1 <= c n - d iff d >= 1  (c = 2, d = 1 is exact)
assert all(2 * (2 * (n // 2) - 1) + 1 == 2 * n - 1 for n in (2, 4, 8, 64, 1024))
assert not all(2 * (2 * (n // 2) - 0) + 1 <= 2 * n - 0 for n in (2, 4))

# ---------------------------------------------------------------- Step 12: the three counts at a million keys
@lru_cache(None)
def mergesort_exact(n):  # T(1) = 1, T(n) = T(ceil(n/2)) + T(floor(n/2)) + n
    return 1 if n == 1 else mergesort_exact((n + 1) // 2) + mergesort_exact(n // 2) + n


assert mergesort_exact(N) == 20951424 and mergesort_exact(64) == 448
assert abs(mergesort_exact(N) / (N * log2(N)) - 1) < 0.06 and round(N * log2(N)) == 19931569
assert N * 20 == 20000000

# ---------------------------------------------------------------- Step 13: 7T(n/2) + n^2
seven = levels(7, 2, lambda m: m * m, 64)
assert seven == [4096, 7168, 12544, 21952, 38416, 67228, 117649] and 7**6 == 117649
assert 7168 / 4096 == 7 / 4 and abs(math.log2(7) - 2.807) < 1e-3 and round(math.log2(7), 2) == 2.81
assert abs((math.log2(7) - 2) - 0.807) < 1e-3  # epsilon is about 0.8

# ---------------------------------------------------------------- Step 14: 2T(n/2) + n / log n, the harmonic column
hcol = [2**i * ((64 // 2**i) / log2(64 // 2**i)) for i in range(6)]
assert [round(x, 1) for x in hcol] == [10.7, 12.8, 16.0, 21.3, 32.0, 64.0]
assert [round(b / a, 2) for a, b in zip(hcol, hcol[1:])] == [1.2, 1.25, 1.33, 1.5, 2.0]
assert [round(64 / j, 2) for j in range(6, 0, -1)] == [10.67, 12.8, 16.0, 21.33, 32.0, 64.0]


@lru_cache(None)
def P(n):  # P(n) = 2P(floor(n/2)) + n / log2 n, P(n) = 1 for n <= 2
    return 1 if n <= 2 else 2 * P(n // 2) + n / log2(n)


for k, lo, hi in ((10, 0.70, 0.75), (16, 0.70, 0.75), (20, 0.70, 0.75), (24, 0.70, 0.75)):
    n = 2**k
    assert lo < P(n) / (n * log2(k)) < hi  # Theta(n log log n)
falling = [P(2**k) / (2**k * k) for k in (10, 16, 20, 24)]
assert [round(x, 3) for x in falling] == [0.243, 0.180, 0.155, 0.136]
# the integral of du / (u ln u) from 2 to n is ln ln n - ln ln 2
# numerically: the sum of 1 / (j ln 2) style terms equals the integral up to a constant (harmonic growth)
assert abs(sum(1 / j for j in range(1, 21)) - math.log(20)) < 0.61  # H_k - ln k tends to 0.577: level sums n/(lg n - i) add up to n H_(lg n)

# ---------------------------------------------------------------- Step 15: 4T(n/2) + n = 2n^2 - n
@lru_cache(None)
def four(n):
    return 1 if n == 1 else 4 * four(n // 2) + n


assert [four(n) for n in (2, 4, 8, 64, 1024)] == [6, 28, 120, 8128, 2096128]
assert all(four(2**k) == 2 * 4**k - 2**k for k in range(0, 21))
# c1 n^2 - c2 n: 4(c1 n^2/4 - c2 n/2) + n = c1 n^2 - 2 c2 n + n <= c1 n^2 - c2 n iff c2 >= 1 (c1 = 2, c2 = 1 exact)
assert all(4 * (2 * (n // 2) ** 2 - (n // 2)) + n == 2 * n * n - n for n in (2, 4, 8, 64, 1024))

# ---------------------------------------------------------------- Deep dive: regularity matters
def R(k):  # R(n) = R(n/2) + f(n) on n = 2^k, f = n when k is even and n^2 when k is odd, R(1) = 1
    return sum(2**i if i % 2 == 0 else 4**i for i in range(k + 1))


for j in (5, 10, 15):
    n = 4**j
    assert abs(R(2 * j) / n**2 - 4 / 15) < 3 / n and (2 ** (2 * j)) == n  # f(n) = n there, yet R(n) ~ 4/15 n^2
assert round(4 / 15, 3) == 0.267
# the MIT handout's n(2 - cos n): regularity fails (ratio up to 1.5) yet T(n) = Theta(n)
worst_ratio = max(((m // 2) * (2 - math.cos(m // 2))) / (m * (2 - math.cos(m))) for m in range(2, 10**6, 2))
assert 1.49 < worst_ratio <= 1.5
TT = [0.0] * (200000)
TT[1] = 1.0
for m in range(2, 200000):
    TT[m] = TT[m // 2] + m * (2 - math.cos(m))
rr = [TT[m] / m for m in range(2, 200000)]
assert 2.0 <= min(rr) and max(rr) <= 5.6
# 0.5 T(n/2) + 1/n: n T(n) = log2 n + 1 on powers of two with T(1) = 1
from fractions import Fraction

half = {1: Fraction(1)}
for k in range(1, 21):
    n = 2**k
    half[n] = Fraction(1, 2) * half[n // 2] + Fraction(1, n)
    assert n * half[n] == k + 1

# ---------------------------------------------------------------- Deep dive: floors, ceilings and Leighton's examples
M = array("q", [0]) * (N + 1)  # M(1) = 0
for n in range(2, N + 1):
    M[n] = M[(n + 1) // 2] + M[n // 2] + n
assert M[100] == 672 and M[1000] == 9976 and M[N] == 19951424
assert round(100 * log2(100)) == 664 and round(1000 * log2(1000)) == 9966
for n in (100, 10**3, 10**4, 10**5, 10**6):
    assert 0.99 <= M[n] / (n * log2(n)) <= 1.02
# the exact merge sort count oscillates: M(n) = n ceil(log2 n) + n - 2^ceil(log2 n), and (M - n log2 n) / n in [0, 0.0861]
top = 1 - (1 + math.log(math.log(2))) / math.log(2)
assert abs(top - 0.0861) < 1e-4
mx = 0.0
for n in range(2, N + 1):
    c = (n - 1).bit_length()
    assert M[n] == n * c + n - 2**c
    d = (M[n] - n * log2(n)) / n
    assert -1e-12 <= d <= top + 1e-9
    mx = max(mx, d)
assert mx > 0.085
del M
# Leighton's examples, where brute force can check them
for k in range(10, 21):
    n = 2**k
    four_n = four(n)
    assert four_n / n**2 < 2.0  # p = 2


@lru_cache(None)
def tlog(n):  # T(n) = T(n/2) + log2 n, T(1) = 1
    return 1 if n == 1 else tlog(n // 2) + round(log2(n))


assert all(0.3 < tlog(2**k) / (k * k) < 1.0 for k in range(10, 21))  # Theta(log^2 n), p = 0


@lru_cache(None)
def al(x):  # 2T(x/4) + 3T(x/6) + x log2 x, real arguments, T = 1 for x <= 6
    return 1.0 if x <= 6 else 2 * al(x / 4) + 3 * al(x / 6) + x * log2(x)


for k in (10, 15, 20):
    x = float(2**k)
    assert 0.2 < al(x) / (x * log2(x) ** 2) < 2.0  # Theta(x log^2 x), p = 1


@lru_cache(None)
def ex2(x):  # 2T(x/2) + (8/9) T(3x/4) + x^2 / log2 x with floors, T = 1 for x <= 4
    return 1.0 if x <= 4 else 2 * ex2(x // 2) + (8 / 9) * ex2(3 * x // 4) + x * x / log2(x)


r2 = [ex2(2**k) / (2**k) ** 2 for k in (10, 20, 30, 40)]
assert [round(v, 2) for v in r2] == [2.06, 2.97, 3.52, 3.90]
for k in (10, 20, 30, 40):
    v = ex2(2**k) / ((2**k) ** 2 * log2(log2(2**k)))
    assert 0.6 <= v <= 0.75
assert abs(2 / 4 + (8 / 9) * (9 / 16) - 1) < 1e-12  # p = 2


@lru_cache(None)
def tight(x):  # 2T(floor(x/2 + x / log2 x)) + x, T = 1 for x <= 16
    return 1 if x <= 16 else 2 * tight(int(x / 2 + x / log2(x))) + x


a10, a50 = tight(2**10) / (2**10 * 10), tight(2**50) / (2**50 * 50)
assert round(a10, 1) == 3.7 and round(a50, 1) == 28.6
assert all(0.36 <= tight(2**k) / (2**k * k * k) <= 0.58 for k in range(10, 51, 10))

# ---------------------------------------------------------------- Deep dive: change of variables, the van Emde Boas recurrence
bits, halvings = 64, 0
while bits > 1:
    bits //= 2
    halvings += 1
assert halvings == 6 == math.ceil(log2(log2(2**64)))
u, steps = 2**64, 0
while u > 2:
    u = math.isqrt(u)
    steps += 1
assert steps == 6
assert math.ceil(log2(log2(2**32))) == 5 and math.ceil(log2(log2(2**16))) == 4

# ---------------------------------------------------------------- Deep dive: base cases
def doubling(n, base):  # T(n) = 2T(n/2), T(1) = base
    return base if n == 1 else 2 * doubling(n // 2, base)


assert all(doubling(2**k, 0) == 0 and doubling(2**k, 1) == 2**k for k in range(12))  # T(1) = 0 is identically 0
print("examples.py: all assertions passed")
