"""
dsa.binary-search-invariants-boundaries -- every number this topic puts on screen,
computed or asserted here. lower_bound and upper_bound over a half-open range; first/
last occurrence and the count of a key, both built from them; the overflow-safe midpoint
against the naive one, with the overflow actually reproduced on a small fixed-width
integer (not merely asserted); and the exact number of iterations binary search needs,
checked against the formula ceil(lg(n + 1)) for several n up to a million.
"""

import math

# A small sorted array with several duplicate values, used by every step of this topic.
ARRAY = [1, 3, 3, 3, 5, 7, 7, 9, 11, 11, 13, 15]
assert ARRAY == sorted(ARRAY)
assert len(ARRAY) == 12


# ---------------------------------------------------------------------------
# 1. lower_bound and upper_bound over a half-open range [lo, hi).
# ---------------------------------------------------------------------------

def lower_bound(a, x):
    """First index i in [0, len(a)) with a[i] >= x; len(a) if none.
    Invariant kept at the top of every iteration: the answer lies in [lo, hi)."""
    lo, hi = 0, len(a)
    iterations = 0
    while lo < hi:
        iterations += 1
        mid = lo + (hi - lo) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo, iterations


def upper_bound(a, x):
    """First index i in [0, len(a)) with a[i] > x; len(a) if none."""
    lo, hi = 0, len(a)
    iterations = 0
    while lo < hi:
        iterations += 1
        mid = lo + (hi - lo) // 2
        if a[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
    return lo, iterations


# lower_bound(3): the first of the three 3s, at index 1.
lb3, lb3_iters = lower_bound(ARRAY, 3)
assert lb3 == 1
assert ARRAY[lb3] == 3 and ARRAY[lb3 - 1] != 3

# upper_bound(3): one past the last 3, at index 4 (ARRAY[4] == 5).
ub3, ub3_iters = upper_bound(ARRAY, 3)
assert ub3 == 4
assert ARRAY[ub3] == 5

# A value present only once: lower_bound and upper_bound differ by exactly one.
lb5, _ = lower_bound(ARRAY, 5)
ub5, _ = upper_bound(ARRAY, 5)
assert lb5 == 4 and ub5 == 5 and ub5 - lb5 == 1

# A value absent entirely: both land on the same insertion point, the first index
# where a value greater than x would go.
lb6, _ = lower_bound(ARRAY, 6)
ub6, _ = upper_bound(ARRAY, 6)
assert lb6 == ub6 == 5  # ARRAY[5] == 7, the first value greater than 6

# A value larger than every element: both return len(a), the half-open range's own end.
lb_big, _ = lower_bound(ARRAY, 100)
ub_big, _ = upper_bound(ARRAY, 100)
assert lb_big == ub_big == len(ARRAY)


# ---------------------------------------------------------------------------
# 2. First/last occurrence and the count of a key, built from the two bounds above.
# ---------------------------------------------------------------------------

def first_occurrence(a, x):
    i, _ = lower_bound(a, x)
    return i if i < len(a) and a[i] == x else -1


def last_occurrence(a, x):
    i, _ = upper_bound(a, x)
    return i - 1 if i - 1 >= 0 and a[i - 1] == x else -1


def count_of(a, x):
    lo, _ = lower_bound(a, x)
    hi, _ = upper_bound(a, x)
    return hi - lo


assert first_occurrence(ARRAY, 3) == 1
assert last_occurrence(ARRAY, 3) == 3
assert count_of(ARRAY, 3) == 3  # three 3s, at indices 1, 2, 3

assert first_occurrence(ARRAY, 11) == 8
assert last_occurrence(ARRAY, 11) == 9
assert count_of(ARRAY, 11) == 2

assert first_occurrence(ARRAY, 6) == -1  # absent
assert count_of(ARRAY, 6) == 0


# ---------------------------------------------------------------------------
# 3. The overflow-safe midpoint against the naive one, overflow actually reproduced
#    on a small fixed-width signed integer (not asserted from memory).
# ---------------------------------------------------------------------------

BITS = 8  # a small width so the overflow happens at indices anyone can check by hand
SIGNED_MAX = 2 ** (BITS - 1) - 1   # 127
SIGNED_MIN = -(2 ** (BITS - 1))    # -128


def to_signed(x, bits=BITS):
    """Wrap an integer into bits-wide two's-complement signed arithmetic, the same
    wraparound a real fixed-width int (C, Java) performs silently on overflow."""
    mask = (1 << bits) - 1
    x &= mask
    if x & (1 << (bits - 1)):
        x -= (1 << bits)
    return x


def truncating_half(x):
    """Integer division truncating toward zero, as C and Java's `/` do (not Python's
    floor division, which rounds toward negative infinity and would hide the bug for
    some negative values)."""
    q = abs(x) // 2
    return -q if x < 0 else q


def naive_mid(low, high, bits=BITS):
    """The line Bentley's Programming Pearls and the JDK's own binary search both
    shipped: `(low + high) / 2`. Computed here in bits-wide signed arithmetic so the
    overflow it has in a real fixed-width language actually happens."""
    raw_sum = to_signed(low + high, bits)  # the overflow: the true sum wraps negative
    return truncating_half(raw_sum)


def safe_mid(low, high):
    """The overflow-safe form: low + ((high - low) / 2). high - low never exceeds the
    array's own length, so this sum never overflows regardless of how large low and
    high themselves are."""
    return low + (high - low) // 2


# Two in-range indices whose sum exceeds the 8-bit signed maximum (127): 70 + 90 = 160.
LOW, HIGH = 70, 90
raw = LOW + HIGH
assert raw > SIGNED_MAX  # the true sum genuinely overflows an 8-bit signed int

wrapped_sum = to_signed(raw, BITS)
assert wrapped_sum < 0  # the wraparound Bloch's post describes: the sum goes negative
assert wrapped_sum == raw - 256  # exactly one width subtracted, two's-complement wraparound

bad_mid = naive_mid(LOW, HIGH)
good_mid = safe_mid(LOW, HIGH)

assert bad_mid < 0  # the naive midpoint is now a negative "index" -- out of bounds
assert LOW <= good_mid <= HIGH  # the safe midpoint always stays inside the range it was given
assert good_mid == 80  # 70 + (90 - 70) // 2 = 80, the true midpoint

# The threshold: the naive line is correct as long as low + high never exceeds the
# signed maximum for the width in use. Below it, naive and safe agree exactly.
SAFE_LOW, SAFE_HIGH = 10, 20
assert naive_mid(SAFE_LOW, SAFE_HIGH) == safe_mid(SAFE_LOW, SAFE_HIGH) == 15


# ---------------------------------------------------------------------------
# 4. Termination by invariant: the exact number of iterations, checked against the
#    formula ceil(lg(n + 1)) for an absent key (the search that runs the longest).
# ---------------------------------------------------------------------------

def iterations_formula(n):
    """The worst-case number of iterations lower_bound/upper_bound ever needs on an
    array of n elements: ceil(lg(n + 1)) -- every iteration halves (hi - lo), which
    starts at n and must reach 0."""
    if n <= 0:
        return 0
    return math.ceil(math.log2(n + 1))


def max_iterations(n):
    """The worst case over every possible target, not just one: every insertion point
    0..n is tried, since which one is slowest to reach depends on the parity of the
    widths the loop happens to produce, not simply on whether the key is absent."""
    arr = list(range(n))
    worst = 0
    for x in range(0, n + 1):
        _, iters = lower_bound(arr, x)
        worst = max(worst, iters)
    return worst

for n in (1, 2, 3, 4, 7, 8, 15, 16, 1000):
    assert max_iterations(n) == iterations_formula(n), (n, max_iterations(n), iterations_formula(n))

# n = 1,000,000 is too large to brute-force over every target; the loop invariant
# argument (each iteration strictly shrinks hi - lo, which starts at n) already proves
# the bound, so this checks only the single longest path: x = 0, which always takes the
# "hi = mid" branch and is the slowest possible path for this loop shape.
_, iters_at_million = lower_bound(list(range(1_000_000)), 0)
ITERATIONS_AT_A_MILLION = iterations_formula(1_000_000)
assert iters_at_million == ITERATIONS_AT_A_MILLION == 20

# Every iteration strictly shrinks hi - lo by at least one: confirmed directly, not
# assumed, by instrumenting the loop's own range width at every step.
def widths_each_iteration(n, x):
    a = list(range(n))
    lo, hi = 0, len(a)
    widths = [hi - lo]
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
        widths.append(hi - lo)
    return widths

widths = widths_each_iteration(1000, 1000)  # absent key, the longest run
assert all(widths[i] > widths[i + 1] for i in range(len(widths) - 1))  # strictly shrinking
assert widths[-1] == 0  # terminates with an empty range, never negative, never stuck


if __name__ == "__main__":
    print(f"lower_bound(3) = {lb3}, upper_bound(3) = {ub3}, count(3) = {count_of(ARRAY, 3)}")
    print(f"first/last occurrence of 11: {first_occurrence(ARRAY, 11)}, {last_occurrence(ARRAY, 11)}")
    print(f"8-bit overflow: {LOW} + {HIGH} = {raw} wraps to {wrapped_sum}")
    print(f"naive_mid({LOW}, {HIGH}) = {bad_mid} (negative -- out of bounds)")
    print(f"safe_mid({LOW}, {HIGH}) = {good_mid} (correct)")
    print(f"Iterations for n = 1,000,000 (absent key): {ITERATIONS_AT_A_MILLION}")
    print("binary-search-invariants-boundaries examples: all checks passed")
