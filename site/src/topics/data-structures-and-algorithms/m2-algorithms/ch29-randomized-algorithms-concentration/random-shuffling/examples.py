import itertools
import math
import random


def fisher_yates(items, rng):
    a = list(items)
    for i in range(len(a) - 1, 0, -1):
        j = rng.randrange(i + 1)
        a[i], a[j] = a[j], a[i]
    return a


def sattolo(items, rng):
    a = list(items)
    for i in range(len(a) - 1, 0, -1):
        j = rng.randrange(i)
        a[i], a[j] = a[j], a[i]
    return a


def naive_swap_shuffle(items, rng):
    a = list(items)
    n = len(a)
    for i in range(n):
        j = rng.randrange(n)
        a[i], a[j] = a[j], a[i]
    return a


def chi_squared(counts, expected):
    return sum((c - expected) ** 2 / expected for c in counts)


ITEMS3 = [0, 1, 2]
PERMS3 = list(itertools.permutations(ITEMS3))
RUNS = 60_000
EXPECTED3 = RUNS / len(PERMS3)

rng = random.Random(1)
fy_counts = {p: 0 for p in PERMS3}
naive_counts = {p: 0 for p in PERMS3}
for _ in range(RUNS):
    fy_counts[tuple(fisher_yates(ITEMS3, rng))] += 1
    naive_counts[tuple(naive_swap_shuffle(ITEMS3, rng))] += 1

FY_CHI2 = chi_squared(list(fy_counts.values()), EXPECTED3)
NAIVE_CHI2 = chi_squared(list(naive_counts.values()), EXPECTED3)
assert FY_CHI2 < 15
assert NAIVE_CHI2 > 100

# Exact enumeration of the naive shuffle's 3^3 = 27 equally likely choice sequences on 3 items.
EXACT_NAIVE_COUNTS = {p: 0 for p in PERMS3}
for choices in itertools.product(range(3), repeat=3):
    a = list(ITEMS3)
    for i, j in enumerate(choices):
        a[i], a[j] = a[j], a[i]
    EXACT_NAIVE_COUNTS[tuple(a)] += 1
assert sum(EXACT_NAIVE_COUNTS.values()) == 27
EXACT_NAIVE_SORTED = sorted(EXACT_NAIVE_COUNTS.values())
assert EXACT_NAIVE_SORTED == [4, 4, 4, 5, 5, 5]

# n^n is not divisible by n! for n >= 3.
DIVISIBILITY_CHECK = {}
for n in (3, 4, 5, 6):
    DIVISIBILITY_CHECK[n] = (n ** n) % math.factorial(n)
assert DIVISIBILITY_CHECK[3] == 27 % 6 == 3
assert DIVISIBILITY_CHECK[4] == 256 % 24 == 16
assert DIVISIBILITY_CHECK[5] == 3125 % 120 == 5
assert DIVISIBILITY_CHECK[6] == 46656 % 720 == 576
assert all(v != 0 for v in DIVISIBILITY_CHECK.values())

# Sattolo's algorithm: every output is a single cycle, (n-1)! of the n! permutations at n = 4.
N4 = [0, 1, 2, 3]
rng2 = random.Random(2)
SATTOLO_RUNS = 20_000
sattolo_cycle_lengths = set()
sattolo_fixed_point_count = 0
sattolo_distinct_outcomes = set()
for _ in range(SATTOLO_RUNS):
    out = sattolo(N4, rng2)
    sattolo_distinct_outcomes.add(tuple(out))
    fixed = sum(1 for i, v in enumerate(out) if v == i)
    sattolo_fixed_point_count += fixed
    # cycle length of the permutation that sends position i's original item to position i
    perm = {N4[i]: out[i] for i in range(4)}
    seen = set()
    start = N4[0]
    cur = start
    length = 0
    while cur not in seen:
        seen.add(cur)
        cur = perm[cur]
        length += 1
    sattolo_cycle_lengths.add(length)

assert sattolo_cycle_lengths == {4}
assert sattolo_fixed_point_count == 0
SATTOLO_DISTINCT_COUNT = len(sattolo_distinct_outcomes)
assert SATTOLO_DISTINCT_COUNT == math.factorial(3)  # (4-1)! = 6 distinct cyclic permutations

FY_FIXED_POINT_MEAN = sum(
    sum(1 for i, v in enumerate(fisher_yates(N4, rng2)) if v == i) for _ in range(SATTOLO_RUNS)
) / SATTOLO_RUNS
assert 0.9 <= FY_FIXED_POINT_MEAN <= 1.1

# Seed-size limit: the largest n with n! <= 2^19937 - 1 (Python's Mersenne Twister period).
MT_PERIOD_BITS = 19937


def log2_factorial(n):
    return sum(math.log2(i) for i in range(1, n + 1))


n = 1
while log2_factorial(n) <= MT_PERIOD_BITS:
    n += 1
LARGEST_COVERABLE_LENGTH = n - 1
FIRST_UNCOVERABLE_LENGTH = n
assert LARGEST_COVERABLE_LENGTH == 2080
assert FIRST_UNCOVERABLE_LENGTH == 2081
assert log2_factorial(2080) <= MT_PERIOD_BITS
assert log2_factorial(2081) > MT_PERIOD_BITS

DECK_LOG2_FACTORIAL = round(log2_factorial(52), 1)
assert DECK_LOG2_FACTORIAL == 225.6

# Buffered streaming shuffle (reservoir-style): exact emission-position distribution for a
# small buffer, by enumerating every random choice (not simulated — the plan calls for exact).
from fractions import Fraction as Frac


def buffered_shuffle_emission_matrix_exact(n, b):
    counts = [[Frac(0) for _ in range(n)] for _ in range(n)]
    start_buf = tuple(range(min(b, n)))
    start_next = len(start_buf)

    def rec(buf, next_in, out, prob):
        if not buf:
            if next_in >= n:
                for pos, item in enumerate(out):
                    counts[item][pos] += prob
            return
        m = len(buf)
        for k in range(m):
            item = buf[k]
            if next_in < n:
                new_buf = buf[:k] + (next_in,) + buf[k + 1:]
                rec(new_buf, next_in + 1, out + [item], prob / m)
            else:
                new_buf = buf[:k] + buf[k + 1:]
                rec(new_buf, next_in, out + [item], prob / m)

    rec(start_buf, start_next, [], Frac(1))
    return counts


N_STREAM = 6
MATRIX_B2 = buffered_shuffle_emission_matrix_exact(N_STREAM, 2)
MATRIX_B3 = buffered_shuffle_emission_matrix_exact(N_STREAM, 3)

# Every row sums to exactly 1 (every run of the process emits every item exactly once).
assert all(sum(row) == 1 for row in MATRIX_B2)
assert all(sum(row) == 1 for row in MATRIX_B3)

# An item at input position p is never emitted earlier than output position max(0, p - (b - 1)):
# the buffer holds at most b items, so an item newly arrived at position p can displace at most
# b - 1 older arrivals ahead of it before the next emission.
for b, matrix in ((2, MATRIX_B2), (3, MATRIX_B3)):
    for p, row in enumerate(matrix):
        earliest_possible = max(0, p - (b - 1))
        for q in range(earliest_possible):
            assert row[q] == 0
        assert row[earliest_possible] > 0

# The first item of the stream is heavily concentrated in the first few output positions, with
# a geometrically shrinking tail — not a flat 1/n over every position the way a true shuffle is.
FIRST_ITEM_FIRST_TWO_B2 = float(MATRIX_B2[0][0] + MATRIX_B2[0][1])
FIRST_ITEM_FIRST_THREE_B3 = float(MATRIX_B3[0][0] + MATRIX_B3[0][1] + MATRIX_B3[0][2])
assert round(FIRST_ITEM_FIRST_TWO_B2, 3) == 0.75
assert round(FIRST_ITEM_FIRST_THREE_B3, 3) == 0.704
assert FIRST_ITEM_FIRST_TWO_B2 > 0.7
assert FIRST_ITEM_FIRST_THREE_B3 > 0.6

# A late item (close to the end of a long stream) can still be emitted near the front only up
# to the buffer-size limit above — it is never emitted in the very first output slot unless its
# input position is within b - 1 of the start.
LAST_ITEM_EARLIEST_SLOT_B2 = next(q for q, v in enumerate(MATRIX_B2[N_STREAM - 1]) if v > 0)
LAST_ITEM_EARLIEST_SLOT_B3 = next(q for q, v in enumerate(MATRIX_B3[N_STREAM - 1]) if v > 0)
assert LAST_ITEM_EARLIEST_SLOT_B2 == N_STREAM - 1 - (2 - 1)
assert LAST_ITEM_EARLIEST_SLOT_B3 == N_STREAM - 1 - (3 - 1)
UNIFORM_FRACTION = round(1 / N_STREAM, 3)
assert UNIFORM_FRACTION == 0.167

if __name__ == "__main__":
    print("Fisher-Yates chi-squared:", round(FY_CHI2, 2), "naive chi-squared:", round(NAIVE_CHI2, 2))
    print("Exact 27-choice naive counts (sorted):", EXACT_NAIVE_SORTED)
    print("n^n mod n!:", DIVISIBILITY_CHECK)
    print("Sattolo cycle lengths seen:", sattolo_cycle_lengths, "fixed points:", sattolo_fixed_point_count)
    print("Sattolo distinct outcomes:", SATTOLO_DISTINCT_COUNT, "Fisher-Yates mean fixed points:", round(FY_FIXED_POINT_MEAN, 3))
    print("Largest coverable length:", LARGEST_COVERABLE_LENGTH, "first uncoverable:", FIRST_UNCOVERABLE_LENGTH)
    print("log2(52!):", DECK_LOG2_FACTORIAL)
    print("First item, first two slots (b=2):", FIRST_ITEM_FIRST_TWO_B2, "first three slots (b=3):", FIRST_ITEM_FIRST_THREE_B3)
    print("Last item earliest emittable slot (b=2):", LAST_ITEM_EARLIEST_SLOT_B2, "(b=3):", LAST_ITEM_EARLIEST_SLOT_B3)
