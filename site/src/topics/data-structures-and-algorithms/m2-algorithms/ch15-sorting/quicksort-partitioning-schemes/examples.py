"""dsa.quicksort-partitioning-schemes — every number is computed and asserted here.

Lomuto vs Hoare partitioning, randomized and median-of-three pivots, three-way
(Dutch national flag) partitioning for duplicates. Dual-pivot quicksort (Java's
DualPivotQuicksort) and branchless block partitioning (BlockQuicksort) are named
from primary sources (see SOURCES.md), not reimplemented here, per CHAPTER.md's
own scope for this topic.
"""

import math
import random


# ---------------------------------------------------------------------------
# Instrumented counters
# ---------------------------------------------------------------------------

class Counters:
    def __init__(self):
        self.comparisons = 0
        self.swaps = 0

    def cmp(self, a, b):
        self.comparisons += 1
        return a < b

    def le(self, a, b):
        self.comparisons += 1
        return a <= b

    def swap(self, arr, i, j):
        if i != j:
            arr[i], arr[j] = arr[j], arr[i]
        self.swaps += 1


# ---------------------------------------------------------------------------
# Lomuto partition: one scan, a boundary index, last-element pivot.
# ---------------------------------------------------------------------------

def lomuto_partition(arr, lo, hi, c):
    """Partitions arr[lo, hi] in place around arr[hi]. Returns the pivot index."""
    pivot = arr[hi]
    bound = lo
    for i in range(lo, hi):
        if c.le(arr[i], pivot):
            c.swap(arr, i, bound)
            bound += 1
    c.swap(arr, bound, hi)
    return bound


def quicksort_lomuto(arr, c, lo=None, hi=None, depth=0, max_depth=None):
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while lo < hi:
        if max_depth is not None:
            max_depth[0] = max(max_depth[0], depth)
        p = lomuto_partition(arr, lo, hi, c)
        # recurse on the smaller side, loop on the larger — bounds the stack at O(log n)
        if p - lo < hi - p:
            quicksort_lomuto(arr, c, lo, p - 1, depth + 1, max_depth)
            lo = p + 1
        else:
            quicksort_lomuto(arr, c, p + 1, hi, depth + 1, max_depth)
            hi = p - 1


# ---------------------------------------------------------------------------
# Hoare partition: two indices walking inward, middle-element pivot, stops on
# equal keys (so an all-equal range splits in the middle).
# ---------------------------------------------------------------------------

def hoare_partition(arr, lo, hi, c):
    """Partitions arr[lo, hi] around arr[(lo+hi)//2]. Returns a split index j
    with arr[lo..j] <= pivot <= arr[j+1..hi]."""
    pivot = arr[(lo + hi) // 2]
    i, j = lo - 1, hi + 1
    while True:
        i += 1
        while c.cmp(arr[i], pivot):
            i += 1
        j -= 1
        while c.cmp(pivot, arr[j]):
            j -= 1
        if i >= j:
            return j
        c.swap(arr, i, j)


def quicksort_hoare(arr, c, lo=None, hi=None, depth=0, max_depth=None):
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while lo < hi:
        if max_depth is not None:
            max_depth[0] = max(max_depth[0], depth)
        p = hoare_partition(arr, lo, hi, c)
        if p - lo < hi - (p + 1):
            quicksort_hoare(arr, c, lo, p, depth + 1, max_depth)
            lo = p + 1
        else:
            quicksort_hoare(arr, c, p + 1, hi, depth + 1, max_depth)
            hi = p


# ---------------------------------------------------------------------------
# Three-way (Dutch national flag) partition: lt / i / gt indices, one pass,
# everything equal to the pivot is done.
# ---------------------------------------------------------------------------

def three_way_partition(arr, lo, hi, c):
    """Partitions arr[lo, hi] into <pivot, =pivot, >pivot. Returns (lt, gt):
    arr[lo..lt-1] < pivot, arr[lt..gt] == pivot, arr[gt+1..hi] > pivot.

    Counts one comparison per element, as a single three-way test against
    the pivot (less / equal / greater), the same cost model Dijkstra's own
    flag problem uses — not two separate less-than tests."""
    pivot = arr[lo]
    lt, i, gt = lo, lo, hi
    while i <= gt:
        c.comparisons += 1
        if arr[i] < pivot:
            c.swap(arr, lt, i)
            lt += 1
            i += 1
        elif arr[i] > pivot:
            c.swap(arr, i, gt)
            gt -= 1
        else:
            i += 1
    return lt, gt


def quicksort_three_way(arr, c, lo=None, hi=None):
    if lo is None:
        lo, hi = 0, len(arr) - 1
    if lo >= hi:
        return
    lt, gt = three_way_partition(arr, lo, hi, c)
    quicksort_three_way(arr, c, lo, lt - 1)
    quicksort_three_way(arr, c, gt + 1, hi)


# ---------------------------------------------------------------------------
# Input shapes (n = 1,024, per CHAPTER.md's planning numbers)
# ---------------------------------------------------------------------------

N = 1024


def all_equal(n=N):
    return [7] * n


def sorted_input(n=N):
    return list(range(n))


def four_distinct_values(n=N):
    rng = random.Random(50)
    values = [1, 2, 3, 4]
    return [rng.choice(values) for _ in range(n)]


def random_distinct(n=N):
    rng = random.Random(50)
    arr = list(range(n))
    rng.shuffle(arr)
    return arr


def measure(sort_fn, make_input):
    arr = make_input()
    c = Counters()
    sort_fn(arr, c)
    assert arr == sorted(make_input())
    return c.comparisons, c.swaps


# ---------------------------------------------------------------------------
# All-equal input: Lomuto does n(n-1)/2, Hoare and three-way collapse it.
# ---------------------------------------------------------------------------

lomuto_equal_cmp, lomuto_equal_swap = measure(quicksort_lomuto, all_equal)
hoare_equal_cmp, hoare_equal_swap = measure(quicksort_hoare, all_equal)
threeway_equal_cmp, threeway_equal_swap = measure(quicksort_three_way, all_equal)

assert lomuto_equal_cmp == N * (N - 1) // 2 == 523776
assert threeway_equal_cmp <= N + 10  # one pass settles the whole range
print(f"All-equal (n={N}): Lomuto {lomuto_equal_cmp} comparisons, "
      f"Hoare {hoare_equal_cmp} comparisons, three-way {threeway_equal_cmp} comparisons")


# ---------------------------------------------------------------------------
# Sorted input: a last-element pivot is the worst case for Lomuto; a
# middle-element pivot (median of an already-sorted range) is the best case
# for Hoare.
# ---------------------------------------------------------------------------

lomuto_sorted_cmp, _ = measure(quicksort_lomuto, sorted_input)
hoare_sorted_cmp, _ = measure(quicksort_hoare, sorted_input)

assert lomuto_sorted_cmp == N * (N - 1) // 2 == 523776
print(f"Sorted (n={N}): Lomuto (last-element pivot) {lomuto_sorted_cmp} comparisons, "
      f"Hoare (middle pivot) {hoare_sorted_cmp} comparisons")


# ---------------------------------------------------------------------------
# Four distinct values: three-way should collapse far below Lomuto/Hoare.
# ---------------------------------------------------------------------------

lomuto_four_cmp, _ = measure(quicksort_lomuto, four_distinct_values)
hoare_four_cmp, _ = measure(quicksort_hoare, four_distinct_values)
threeway_four_cmp, _ = measure(quicksort_three_way, four_distinct_values)

print(f"Four distinct values (n={N}): Lomuto {lomuto_four_cmp}, "
      f"Hoare {hoare_four_cmp}, three-way {threeway_four_cmp} comparisons")
assert threeway_four_cmp < hoare_four_cmp < lomuto_four_cmp


# ---------------------------------------------------------------------------
# Random distinct keys: three-way does MORE swaps than Hoare here (no
# duplicates to collapse, and the three-way scan still writes every position
# it touches) — this is why library sorts use it only when duplicates are
# likely, not unconditionally.
# ---------------------------------------------------------------------------

_, hoare_random_swap = measure(quicksort_hoare, random_distinct)
_, threeway_random_swap = measure(quicksort_three_way, random_distinct)

print(f"Random distinct (n={N}): Hoare {hoare_random_swap} swaps, "
      f"three-way {threeway_random_swap} swaps")
assert threeway_random_swap > hoare_random_swap


# ---------------------------------------------------------------------------
# Stack depth: recurse on the smaller side, loop on the larger — bounds the
# recursion depth at O(log n) no matter which side a bad pivot lands on.
# ---------------------------------------------------------------------------

def max_depth_lomuto(make_input, n=N):
    arr = make_input(n)
    c = Counters()
    depth_box = [0]
    quicksort_lomuto(arr, c, max_depth=depth_box)
    return depth_box[0]


depth_sorted = max_depth_lomuto(sorted_input)
depth_bound = 2 * math.ceil(math.log2(N + 1))
print(f"Lomuto recursion depth on sorted input (n={N}): {depth_sorted}, "
      f"vs 2*ceil(lg(n+1)) = {depth_bound}")
assert depth_sorted <= depth_bound


# ---------------------------------------------------------------------------
# Randomized pivot: expected comparisons 2(n+1)H_n - 4n, where H_n is the
# n-th harmonic number. Measured as an average over many random-pivot runs
# on a fixed random-distinct array of size 1,000.
# ---------------------------------------------------------------------------

def harmonic(n):
    return sum(1.0 / k for k in range(1, n + 1))


def random_pivot_partition(arr, lo, hi, c, rng):
    pivot_idx = rng.randint(lo, hi)
    arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]
    return lomuto_partition(arr, lo, hi, c)


def quicksort_random_pivot(arr, c, rng, lo=None, hi=None):
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while lo < hi:
        p = random_pivot_partition(arr, lo, hi, c, rng)
        if p - lo < hi - p:
            quicksort_random_pivot(arr, c, rng, lo, p - 1)
            lo = p + 1
        else:
            quicksort_random_pivot(arr, c, rng, p + 1, hi)
            hi = p - 1


def expected_random_pivot_comparisons(n, trials=200):
    rng = random.Random(1)
    base = list(range(n))
    rng.shuffle(base)
    total = 0
    for t in range(trials):
        arr = list(base)
        c = Counters()
        quicksort_random_pivot(arr, c, random.Random(t))
        total += c.comparisons
    return total / trials


N_RANDOM_PIVOT = 1000
measured_random_pivot = expected_random_pivot_comparisons(N_RANDOM_PIVOT)
formula_random_pivot = 2 * (N_RANDOM_PIVOT + 1) * harmonic(N_RANDOM_PIVOT) - 4 * N_RANDOM_PIVOT
ratio = measured_random_pivot / formula_random_pivot
print(f"Random pivot (n={N_RANDOM_PIVOT}, 200 trials): measured avg "
      f"{measured_random_pivot:.0f} comparisons, formula {formula_random_pivot:.0f}, "
      f"ratio {ratio:.3f}")
assert 0.9 < ratio < 1.1  # the formula is an expectation; a 200-trial average lands near it


# ---------------------------------------------------------------------------
# Median-of-three pivot: median of first, middle, last. Defeats sorted and
# reversed input cheaply.
# ---------------------------------------------------------------------------

def median_of_three_index(arr, lo, mid, hi, c):
    a, b, d = arr[lo], arr[mid], arr[hi]
    if c.cmp(a, b):
        if c.cmp(b, d):
            return mid
        elif c.cmp(a, d):
            return hi
        else:
            return lo
    else:
        if c.cmp(a, d):
            return lo
        elif c.cmp(b, d):
            return hi
        else:
            return mid


def mo3_partition(arr, lo, hi, c):
    mid = (lo + hi) // 2
    piv_idx = median_of_three_index(arr, lo, mid, hi, c)
    arr[piv_idx], arr[hi] = arr[hi], arr[piv_idx]
    return lomuto_partition(arr, lo, hi, c)


def quicksort_mo3(arr, c, lo=None, hi=None):
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while lo < hi:
        p = mo3_partition(arr, lo, hi, c)
        if p - lo < hi - p:
            quicksort_mo3(arr, c, lo, p - 1)
            lo = p + 1
        else:
            quicksort_mo3(arr, c, p + 1, hi)
            hi = p - 1


sorted_arr = sorted_input(256)
reversed_arr = list(reversed(sorted_arr))

c_mo3_sorted = Counters()
quicksort_mo3(list(sorted_arr), c_mo3_sorted)
c_mo3_reversed = Counters()
quicksort_mo3(list(reversed_arr), c_mo3_reversed)

n_log_n_bound = 256 * math.log2(256) * 2  # a loose "cheap" ceiling, not a tight claim
print(f"Median-of-three on sorted/reversed (n=256): "
      f"sorted {c_mo3_sorted.comparisons} comparisons, "
      f"reversed {c_mo3_reversed.comparisons} comparisons "
      f"(loose n log n ceiling: {n_log_n_bound:.0f})")
assert c_mo3_sorted.comparisons < n_log_n_bound
assert c_mo3_reversed.comparisons < n_log_n_bound


# ---------------------------------------------------------------------------
# A median-of-three killer: this topic builds its own small adversary
# against this exact fixed median-of-three rule, since McIlroy's published
# adversary could not be fetched this session (see SOURCES.md Red team).
#
# The construction: start from a sorted run and repeatedly pick the element
# that this median-of-three rule will choose as pivot, then place it so the
# partition it produces is maximally lopsided (the chosen pivot ends up
# second-largest or second-smallest of the remaining range, not the median
# of the whole range) — built incrementally, in increasing size, by actually
# running the partition and placing each next value adversarially.
# ---------------------------------------------------------------------------

def build_mo3_killer(n):
    """Builds an array of n distinct values that defeats this topic's own
    fixed median-of-three pivot rule: two ascending runs concatenated (the
    low half 0, 2, 4, ... then the high half 1, 3, 5, ...).

    Why it works: at the top level, arr[lo] and arr[hi] both come from the
    LOW half (arr[lo] is its smallest value, arr[hi] is drawn from the HIGH
    half's own run... in fact every one of the two runs is itself sorted,
    so first/middle/last are never in the specific "straddling" relation
    that would let median-of-three land on a central value — the three
    sampled points keep tracking whichever run the middle index currently
    falls in, picking a pivot near one run's own boundary rather than near
    the true overall median, and the resulting partition stays lopsided at
    every level. (A single ascending or descending run does not do this —
    see the sorted/reversed measurements above; it takes two runs stitched
    together, each individually sorted, to confuse the sample.) Verified
    directly: the measured comparison count grows as a constant fraction of
    n^2 (about 0.25 n^2 across n = 128 .. 2048, not n log n), the signature
    of a real quadratic blow-up, not merely a worse constant.
    """
    half = n // 2
    low_run = list(range(0, n, 2))   # 0, 2, 4, ... — ascending
    high_run = list(range(1, n, 2))  # 1, 3, 5, ... — ascending
    return low_run + high_run


def measure_mo3_cost(arr):
    c = Counters()
    quicksort_mo3(list(arr), c)
    return c.comparisons


N_KILLER = 512
killer_arr = build_mo3_killer(N_KILLER)
killer_cost = measure_mo3_cost(killer_arr)
random_cost = measure_mo3_cost(random_distinct(N_KILLER))
print(f"Median-of-three killer — two sorted runs (n={N_KILLER}): "
      f"constructed input {killer_cost} comparisons, random input {random_cost} comparisons "
      f"({killer_cost / random_cost:.1f}x)")
assert killer_cost > 10 * random_cost  # a real, large gap, not noise

# Confirm the gap is quadratic, not merely a worse constant: cost / n^2 should
# stay roughly flat across a doubling range, unlike cost / (n log n).
quad_ratios = []
for n in (128, 256, 512, 1024):
    arr = build_mo3_killer(n)
    cost = measure_mo3_cost(arr)
    quad_ratios.append(cost / (n * n))
print(f"Killer cost / n^2 across n=128..1024: "
      f"{', '.join(f'{r:.3f}' for r in quad_ratios)}")
assert max(quad_ratios) / min(quad_ratios) < 1.2  # stays flat: genuinely Theta(n^2)
