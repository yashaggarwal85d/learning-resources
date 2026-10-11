"""Every number and claim in the Asymptotic notation and case analysis reel, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows."""
import math, random, sys
from fractions import Fraction
from functools import cmp_to_key
from itertools import permutations

# Step: O, Omega, Theta are inequalities with witnesses c and n0.
f = lambda n: 3 * n * n + 10 * n
assert all(3 * n * n <= f(n) <= 4 * n * n for n in range(10, 100_001))  # c1=3, c2=4, n0=10
assert f(9) > 4 * 9 * 9 and f(9) == 333 and 4 * 9 * 9 == 324  # n0=10 is the first n where 4n^2 holds
assert f(10) == 400 and 4 * 10 * 10 == 400
# the constant 3 cannot be raised: f(n)/n^2 tends to 3 from above, so c1 must be at most 3
assert 3 < f(10**6) / 10**12 <= 3.00001

# Step (predict): 2^(n+1) = O(2^n), but 2^(2n) is not O(2^n).
assert all(2 ** (n + 1) <= 2 * 2**n for n in range(1, 200))  # c = 2
for c in (10, 1000, 10**6):  # no constant c works for 4^n <= c * 2^n
    n = c.bit_length()  # then 2^n > c
    assert 4**n > c * 2**n
assert 4**20 == 2 ** (2 * 20)

# Deep dive: log bases differ by a constant factor, but not inside an exponent.
for m in (2**10, 2**20, 2**40):
    assert abs(math.log2(m) / math.log10(m) - math.log2(10)) < 1e-9  # a constant ratio
    assert round(2 ** math.log2(m)) == m and round(2 ** (math.log(m, 4))) == math.isqrt(m)  # n versus sqrt(n)
# Deep dive: the doubling test cannot see a log factor: n^1 and n log n both give a ratio tending to 2.
T = lambda m: m * math.log2(m)
assert 2 < T(2 * 10**9) / T(10**9) < 2.07

# Step: o and omega are strict; the ratio decides.
ratios = [(n * math.log2(n)) / (n * n) for n in (10, 10**3, 10**6)]
assert ratios[0] > ratios[1] > ratios[2]  # n log n / n^2 -> 0, so n log n = o(n^2)
assert abs(f(10**6) / (10**6) ** 2 - 3) < 1e-4  # 3n^2+10n over n^2 -> 3, not 0: Theta, not o

# Step: bound type and case are independent. Insertion sort, counting comparisons of a[j] > key.
def insertion_comparisons(a):
    a = list(a); count = 0
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0:
            count += 1
            if a[j] > key:
                a[j + 1] = a[j]; j -= 1
            else:
                break
        a[j + 1] = key
    assert a == sorted(a)
    return count

n = 8
assert insertion_comparisons(range(n)) == n - 1 == 7  # best case: already sorted
assert insertion_comparisons(range(n, 0, -1)) == n * (n - 1) // 2 == 28  # worst case: reversed
H = lambda m: sum(Fraction(1, k) for k in range(1, m + 1))
avg = lambda m: Fraction(m * (m - 1), 4) + m - H(m)  # expected comparisons over a uniformly random permutation
for m in (5, 6, 7, 8):
    exact = Fraction(sum(insertion_comparisons(p) for p in permutations(range(m))), math.factorial(m))
    assert exact == avg(m), (m, exact, avg(m))  # checked by enumerating every permutation
assert math.factorial(8) == 40_320  # all orders of 8 items, enumerated above
assert float(avg(8)) == 19.282142857142858 and round(float(avg(8)), 1) == 19.3
# So 'worst case' and 'big-O' are separate axes: worst case is Theta(n^2) and also Omega(n^2);
# best case is Theta(n) and also O(n); average is Theta(n^2).
for m in (100, 200, 400):  # best ~ n, worst ~ n^2/2, average ~ n^2/4 (ratio to n^2)
    assert insertion_comparisons(range(m)) == m - 1
    assert insertion_comparisons(range(m, 0, -1)) / (m * m) > 0.49
    assert 0.24 < float(avg(m)) / (m * m) < 0.26

# Step: expected vs average. Quicksort with a fixed first pivot vs a random pivot, on already-sorted input.
def quicksort_comparisons(a, pick):
    count = 0
    stack = [list(a)]
    while stack:
        xs = stack.pop()
        if len(xs) <= 1:
            continue
        p = xs[pick(xs)]
        lo = [x for x in xs if x < p]; hi = [x for x in xs if x > p]
        count += len(xs) - 1  # every other key is compared with the pivot once
        stack += [lo, hi]
    return count

N = 1000
assert quicksort_comparisons(range(N), lambda xs: 0) == N * (N - 1) // 2 == 499_500  # sorted input, first pivot
rng = random.Random(7)
formula = lambda m: 2 * (m + 1) * float(H(m)) - 4 * m  # exact expected comparisons, random pivot, distinct keys
C = {0: Fraction(0), 1: Fraction(0)}  # check the formula against its recurrence C(n) = n-1 + (2/n) sum C(k)
run = Fraction(0)
for m in range(2, N + 1):
    run += C[m - 2] if m >= 2 else 0
    C[m] = (m - 1) + Fraction(2, m) * sum(C[k] for k in range(m))
    if m in (10, 100, 1000):
        assert abs(float(C[m]) - formula(m)) < 1e-6
assert round(formula(N)) == 10_986
assert round(2 * N * math.log(N)) == 13_816  # the leading term alone overshoots at n = 1,000 (Deep dive)
runs = [quicksort_comparisons(range(N), lambda xs: rng.randrange(len(xs))) for _ in range(2000)]
mean = sum(runs) / len(runs)
assert abs(mean - formula(N)) / formula(N) < 0.01  # the sample mean matches the formula within 1%
assert max(runs) < 1.5 * formula(N), max(runs)  # w.h.p.: no run strays far; the worst was well under 1.5 x mean
assert max(runs) < 499_500 / 30
assert (min(runs), max(runs), round(mean), len(runs)) == (9_449, 15_583, 10_991, 2_000)
assert round(max(runs) / mean, 2) == 1.42  # slowest run against the mean (Deep dive)
HIST = [55, 1086, 704, 139, 13, 2, 1, 0]  # runs per 1,000-comparison bucket starting at 9,000 (drawn in the reel)
assert HIST == [sum(1 for x in runs if 9000 + 1000 * i <= x < 10000 + 1000 * i) for i in range(8)] and sum(HIST) == 2000
# the same inputs shuffled to a random permutation: average over inputs, first pivot, is about the same mean
perm_runs = [quicksort_comparisons(rng.sample(range(N), N), lambda xs: 0) for _ in range(300)]
assert abs(sum(perm_runs) / len(perm_runs) - formula(N)) / formula(N) < 0.03

# Step: time versus space. Is there a duplicate among n distinct numbers (the worst case: scan everything)?
def dup_pairs(a):
    comps = 0
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            comps += 1
            if a[i] == a[j]: return True, comps, 0
    return False, comps, 0  # O(1) extra values

def dup_set(a):
    seen = set()
    for x in a:
        if x in seen: return True, len(seen), len(seen)
        seen.add(x)
    return False, len(a), len(seen)  # n lookups, n stored values

def dup_heapsort(a):
    a = list(a); comps = 0; n = len(a)  # in place: O(1) extra values
    def lt(x, y):
        nonlocal comps; comps += 1; return x < y
    def sift(i, end):
        while True:
            l = 2 * i + 1
            if l >= end: return
            big = l + 1 if l + 1 < end and lt(a[l], a[l + 1]) else l
            if lt(a[i], a[big]): a[i], a[big] = a[big], a[i]; i = big
            else: return
    for i in range(n // 2 - 1, -1, -1): sift(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]; sift(0, end)
    assert a == sorted(a)
    for i in range(1, n):
        comps += 1
        if a[i] == a[i - 1]: return True, comps, 0
    return False, comps, 0

data = list(range(N)); rng.shuffle(data)
p, s, h = dup_pairs(data), dup_set(data), dup_heapsort(data)
assert p == (False, 499_500, 0) and s == (False, 1000, 1000)
assert h == (False, 17_830, 0), h  # seeded: about 1.8 n log2 n comparisons, no extra storage
assert round(N * math.log2(N)) == 9966 and h[1] < 2 * N * math.log2(N)

# Step: constants matter. 100n steps (a big constant) against n^2 steps (a small one).
big, small = (lambda n: 100 * n), (lambda n: n * n)
assert big(99) > small(99) and big(100) == small(100) and big(101) < small(101)  # crossover at n = 100
assert small(1000) // big(1000) == 10 and small(10**6) // big(10**6) == 10_000  # then the gap only grows
# Counting comparisons only, merge sort's average overtakes insertion sort's almost at once.
def merge_comparisons(a):
    count = 0
    def msort(xs):
        nonlocal count
        if len(xs) <= 1: return xs
        mid = len(xs) // 2; l, r = msort(xs[:mid]), msort(xs[mid:]); out = []; i = j = 0
        while i < len(l) and j < len(r):
            count += 1
            if l[i] <= r[j]: out.append(l[i]); i += 1
            else: out.append(r[j]); j += 1
        return out + l[i:] + r[j:]
    assert msort(list(a)) == sorted(a)
    return count
def avg_merge(m):  # exact average over every permutation, for small m
    return Fraction(sum(merge_comparisons(p) for p in permutations(range(m))), math.factorial(m))
assert all(avg(m) == avg_merge(m) for m in (2, 3))  # equal at 2 and 3 (Deep dive)
assert all(avg(m) > avg_merge(m) for m in range(4, 9))  # merge sort is ahead for n = 4..8

# Step: the ladder, at one million items and a stated 10^9 simple operations per second.
n, ops = 10**6, 10**9
assert round(math.log2(n), 1) == 19.9
assert round(n * math.log2(n) / ops, 2) == 0.02  # seconds
assert n * n / ops == 1000  # seconds
assert round(n * n / ops / 60, 1) == 16.7  # minutes
assert math.log2(2**64) == 64 and 2**64 / ops / (3600 * 24 * 365) > 580  # 2^n at n=64 is centuries
assert round(2**64 / ops / (3600 * 24 * 365)) == 585  # years
assert round(math.log2(n) / ops * 1e9) == 20  # log n: about 20 ns
assert round(n * math.log2(n) / 1e6) == 20 and n * n == 10**12  # 20 million and 1 trillion steps
assert round(2**64 / 1e19, 1) == 1.8  # 2^64 is about 1.8 x 10^19 steps

# Step: bits versus value. Trial division is O(sqrt(v)) in the VALUE v, exponential in the BITS.
def trial_division_steps(v):
    steps, d = 0, 2
    while d * d <= v:
        steps += 1
        if v % d == 0: return steps
        d += 1
    return steps
prime32, prime64 = 4_294_967_291, 18_446_744_073_709_551_557  # largest primes below 2^32 and 2^64
assert prime32 == 2**32 - 5 and prime64 == 2**64 - 59
assert trial_division_steps(prime32) == 65_534  # 16 bits' worth: sqrt(2^32) = 65536
assert math.isqrt(prime64) > 4 * 10**9  # doubling the bits squares the work: 2^32 steps for a 64-bit input
assert abs((math.isqrt(prime64) - 1) / 65_534 - 65_536) < 5 and 2**16 == 65_536  # 32 more bits: about 65,536 times the steps

# Step: the two disagreeing conventions for Omega are visible on f(n) = n for odd n, 0 for even n.
g = lambda n: n if n % 2 else 0
# CS convention: g = Omega(n) needs g(n) >= c*n for ALL large n. It fails at every even n.
assert not all(g(n) >= 0.5 * n for n in range(1000, 1100))
# Hardy-Littlewood convention: Omega means 'not o(.)', i.e. g(n) >= c*n for infinitely many n. It holds.
assert all(g(n) >= n for n in range(1001, 1100, 2))

print('asymptotic-notation examples: all assertions hold')
