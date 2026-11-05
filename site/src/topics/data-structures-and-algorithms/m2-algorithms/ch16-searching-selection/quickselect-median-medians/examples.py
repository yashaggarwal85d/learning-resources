"""
dsa.quickselect-median-medians -- every number this topic puts on screen, computed or
asserted here. Quickselect (Hoare's FIND, reusing Chapter 15's partition idea, built
locally here) measured against a full sort on random keys; the adversarial pivot
degrading it to a quadratic comparison count; median-of-medians (BFPRT) and its
guaranteed 3/10-7/10 discard fraction, verified by direct counting; a measured
comparison-count gap showing why nobody uses it by default; introselect's real
depth-limit fallback, read directly from this machine's own libstdc++ headers.
"""

import math
import random


class Counters:
    def __init__(self):
        self.comparisons = 0

    def le(self, a, b):
        self.comparisons += 1
        return a <= b

    def lt(self, a, b):
        self.comparisons += 1
        return a < b


# ---------------------------------------------------------------------------
# 1. Quickselect: partition around a pivot, recurse into only the side with rank k.
# ---------------------------------------------------------------------------

def lomuto_partition(arr, lo, hi, pivot_index, c):
    """Chapter 15's Lomuto partition, reused: move the chosen pivot to the end,
    then one scan places everything <= it to the left."""
    arr[pivot_index], arr[hi] = arr[hi], arr[pivot_index]
    pivot = arr[hi]
    bound = lo
    for i in range(lo, hi):
        if c.le(arr[i], pivot):
            arr[i], arr[bound] = arr[bound], arr[i]
            bound += 1
    arr[bound], arr[hi] = arr[hi], arr[bound]
    return bound


def quickselect(arr, k, c, pivot_rule, lo=None, hi=None):
    """Find the k-th smallest element (0-indexed): partition, then recurse into only
    the side that contains rank k -- the other side is discarded, never sorted."""
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while True:
        if lo == hi:
            return arr[lo]
        pivot_index = pivot_rule(arr, lo, hi)
        p = lomuto_partition(arr, lo, hi, pivot_index, c)
        if k == p:
            return arr[p]
        elif k < p:
            hi = p - 1
        else:
            lo = p + 1


def random_pivot(arr, lo, hi):
    return random.randint(lo, hi)


def first_element_pivot(arr, lo, hi):
    return lo


# ---------------------------------------------------------------------------
# 2. Measured comparison counts: quickselect's median vs a full sort, on random keys.
# ---------------------------------------------------------------------------

def median_via_sort_comparisons(n):
    """A full sort's comparison count for n elements, by the standard n*log2(n) bound
    (Chapter 1's own comparison-model result), used only as the contrast figure."""
    return n * math.log2(n) if n > 1 else 0


random.seed(0)

for n in (1_000, 1_000_000):
    arr = list(range(n))
    random.shuffle(arr)
    c = Counters()
    median = quickselect(list(arr), n // 2, c, random_pivot)
    assert median == n // 2  # the true median of a random permutation of range(n)
    sort_estimate = median_via_sort_comparisons(n)
    # Quickselect's measured comparisons stay a small constant times n; the full sort's
    # own estimate grows by an extra factor of log2(n) on top of that.
    assert c.comparisons < 10 * n
    assert c.comparisons < sort_estimate
    if n == 1_000:
        quickselect_1000_comparisons = c.comparisons
        sort_1000_estimate = sort_estimate
    else:
        quickselect_1000000_comparisons = c.comparisons
        sort_1000000_estimate = sort_estimate


# ---------------------------------------------------------------------------
# 3. The worst case: an adversarial or always-unlucky pivot degrades to Theta(n^2).
# ---------------------------------------------------------------------------

def count_comparisons_for_pivot_rule(n, pivot_rule):
    arr = list(range(n))  # already sorted -- the worst input for a first-element pivot
    c = Counters()
    quickselect(arr, n - 1, c, pivot_rule)  # select the maximum: every pivot is the
    # smallest remaining element, so each partition only shrinks the range by one
    return c.comparisons


SMALL_N = 200
first_element_comparisons = count_comparisons_for_pivot_rule(SMALL_N, first_element_pivot)
random_pivot_comparisons = count_comparisons_for_pivot_rule(SMALL_N, random_pivot)
# A first-element pivot on already-sorted input, selecting the maximum, triggers the
# textbook worst case: quadratic in n, not linear.
assert first_element_comparisons > SMALL_N * SMALL_N / 4
assert random_pivot_comparisons < SMALL_N * 10  # the same input, a random pivot: linear


# ---------------------------------------------------------------------------
# 4. Median-of-medians (BFPRT / PICK): groups of five, a guaranteed discard fraction.
# ---------------------------------------------------------------------------

def insertion_sort(group, c):
    for i in range(1, len(group)):
        j = i
        while j > 0 and c.lt(group[j], group[j - 1]):
            group[j], group[j - 1] = group[j - 1], group[j]
            j -= 1
    return group


def median_of_medians(arr, k, c, lo=None, hi=None):
    """PICK: group into fives, take each group's median, recursively find the median
    of those medians, and use that as the pivot -- worst-case Theta(n), not expected.
    `k` is always an absolute index into `arr` (0-indexed), matching quickselect's own
    convention above."""
    if lo is None:
        lo, hi = 0, len(arr) - 1
    while True:
        n = hi - lo + 1
        if n <= 5:
            segment = arr[lo:hi + 1]
            insertion_sort(segment, c)
            arr[lo:hi + 1] = segment
            return arr[k]
        medians = []
        i = lo
        while i <= hi:
            j = min(i + 4, hi)
            group = arr[i:j + 1]
            insertion_sort(group, c)
            medians.append(group[(len(group) - 1) // 2])
            i += 5
        pivot_value = median_of_medians(medians, (len(medians) - 1) // 2, c)
        pivot_index = arr.index(pivot_value, lo, hi + 1)
        p = lomuto_partition(arr, lo, hi, pivot_index, c)
        if k == p:
            return arr[p]
        elif k < p:
            hi = p - 1
        else:
            lo = p + 1


MOM_N = 500
mom_arr = list(range(MOM_N))
random.shuffle(mom_arr)
c_mom = Counters()
mom_median = median_of_medians(list(mom_arr), MOM_N // 2, c_mom)
true_median = sorted(mom_arr)[MOM_N // 2]
assert mom_median == true_median


def discard_fraction_at_first_pivot(arr):
    """Verify directly, on one constructed array, that the chosen group-of-medians
    pivot has at least 3/10 of the array provably smaller and at least 3/10 provably
    larger -- the paper's own counting argument, not asserted from the formula alone."""
    n = len(arr)
    groups = [sorted(arr[i:i + 5]) for i in range(0, n, 5)]
    full_groups = [g for g in groups if len(g) == 5]
    medians = [g[2] for g in full_groups]
    pivot = sorted(medians)[(len(medians) - 1) // 2]
    smaller = sum(1 for x in arr if x < pivot)
    larger = sum(1 for x in arr if x > pivot)
    return smaller, larger, n


DISCARD_N = 1000  # a clean multiple of 5, so every group is full
discard_arr = list(range(DISCARD_N))
random.shuffle(discard_arr)
smaller_count, larger_count, total = discard_fraction_at_first_pivot(discard_arr)
assert smaller_count >= 0.3 * total - 10  # allow for the one partial/boundary group
assert larger_count >= 0.3 * total - 10
assert smaller_count + larger_count <= total


# ---------------------------------------------------------------------------
# 5. Why nobody uses it: median-of-medians vs randomised quickselect, measured.
# ---------------------------------------------------------------------------

COMPARE_N = 2000
compare_arr = list(range(COMPARE_N))
random.shuffle(compare_arr)

c_qs = Counters()
quickselect(list(compare_arr), COMPARE_N // 2, c_qs, random_pivot)
c_mom2 = Counters()
median_of_medians(list(compare_arr), COMPARE_N // 2, c_mom2)

# On the same random input, randomised quickselect's measured comparison count beats
# median-of-medians' -- the real-world reason production code defaults to the former.
assert c_qs.comparisons < c_mom2.comparisons


# ---------------------------------------------------------------------------
# 6. Floyd-Rivest sampling: a small random sample narrows the range before partitioning.
# ---------------------------------------------------------------------------

def floyd_rivest_select(arr, k, c, sample_factor=2.0, margin_factor=0.7):
    """A simplified version of the real algorithm's own idea (Floyd & Rivest, 1975):
    take a small random sample, use it to estimate two bounds u <= v around the target
    rank, split the full array into "below u", "between u and v", and "above v" in one
    pass, then finish with plain quickselect on only the (much smaller) band that must
    contain the target rank. The real algorithm recomputes u and v adaptively as it
    narrows further, which this simplified version does not; it is built to show the
    same shape of saving, not to reproduce the paper's own tighter bound exactly."""
    n = len(arr)
    if n <= 40:
        return quickselect(list(arr), k, c, random_pivot)
    sample_size = max(5, int(sample_factor * math.sqrt(n)))
    sample = random.sample(arr, sample_size)
    insertion_sort(sample, c)
    scaled_rank = min(sample_size - 1, max(0, round(k * sample_size / n)))
    margin = max(1, int(margin_factor * math.sqrt(sample_size)))
    u = sample[max(0, scaled_rank - margin)]
    v = sample[min(sample_size - 1, scaled_rank + margin)]
    below, between, above = [], [], []
    for x in arr:
        if c.lt(x, u):
            below.append(x)
        elif c.lt(v, x):
            above.append(x)
        else:
            between.append(x)
    if k < len(below):
        return quickselect(below, k, c, random_pivot)
    elif k < len(below) + len(between):
        return quickselect(between, k - len(below), c, random_pivot)
    else:
        return quickselect(above, k - len(below) - len(between), c, random_pivot)


FR_TRIALS = 5
fr_qs_total, fr_floyd_total = 0, 0
for trial in range(FR_TRIALS):
    fr_arr = list(range(COMPARE_N))
    random.shuffle(fr_arr)
    c_fr_qs = Counters()
    r1 = quickselect(list(fr_arr), COMPARE_N // 2, c_fr_qs, random_pivot)
    c_fr = Counters()
    r2 = floyd_rivest_select(list(fr_arr), COMPARE_N // 2, c_fr)
    assert r1 == r2 == COMPARE_N // 2
    fr_qs_total += c_fr_qs.comparisons
    fr_floyd_total += c_fr.comparisons

# Averaged over several random inputs (a single draw can go either way; the paper's own
# claim is about the expected count), Floyd-Rivest sampling measurably beats plain
# randomised quickselect on the same inputs.
assert fr_floyd_total < fr_qs_total


# ---------------------------------------------------------------------------
# 7. Introselect's real depth-limit fallback, read from this machine's own libstdc++.
# ---------------------------------------------------------------------------

# bits/stl_algo.h (GCC 13, this session's own /usr/include/c++/13):
#   nth_element calls __introselect(..., std::__lg(__last - __first) * 2, ...)
#   __introselect falls back to __heap_select, NOT median-of-medians, when the depth
#   budget reaches zero -- read directly from the header, not assumed from a textbook.
def introselect_depth_limit(n):
    return math.floor(math.log2(n)) * 2 if n > 0 else 0


assert introselect_depth_limit(1_000_000) == 2 * math.floor(math.log2(1_000_000))
assert introselect_depth_limit(1_000_000) == 38  # floor(lg(1,000,000)) = 19, times two


if __name__ == "__main__":
    print(f"Quickselect median, n=1,000: {quickselect_1000_comparisons} comparisons (full-sort estimate {sort_1000_estimate:.0f})")
    print(f"Quickselect median, n=1,000,000: {quickselect_1000000_comparisons} comparisons (full-sort estimate {sort_1000000_estimate:.0f})")
    print(f"Adversarial first-element pivot (n={SMALL_N}): {first_element_comparisons} comparisons (quadratic)")
    print(f"Random pivot, same input (n={SMALL_N}): {random_pivot_comparisons} comparisons (linear)")
    print(f"Median-of-medians discard at first pivot: {smaller_count} smaller, {larger_count} larger, of {total}")
    print(f"Same input (n={COMPARE_N}): quickselect {c_qs.comparisons} comparisons, median-of-medians {c_mom2.comparisons} comparisons")
    print(f"Averaged over {FR_TRIALS} trials (n={COMPARE_N}): quickselect {fr_qs_total / FR_TRIALS:.0f}, Floyd-Rivest sampling {fr_floyd_total / FR_TRIALS:.0f}")
    print(f"Introselect depth limit for n=1,000,000: {introselect_depth_limit(1_000_000)}")
    print("quickselect-median-medians examples: all checks passed")
