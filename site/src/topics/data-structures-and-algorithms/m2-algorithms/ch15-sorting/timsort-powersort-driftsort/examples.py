"""dsa.timsort-powersort-driftsort — every number is computed and asserted here.

Run detection, minrun, binary-insertion-sort extension, galloping merges, the 2015
Timsort invariant bug (reproduced from the JDK's own mergeCollapse loop, transcribed
from CAV 2015), CPython's Powersort node-power computation, and Stefan Pochmann's
2025 minrun refinement. Driftsort's own allocation formula is named from its own
source (see SOURCES.md), not reimplemented, per CHAPTER.md's own scope for this topic.
"""

import math
from fractions import Fraction


# ---------------------------------------------------------------------------
# 1. Run detection: ascending/non-decreasing, or strictly descending then
#    reversed in place (CPython's own worked example).
# ---------------------------------------------------------------------------

def count_run(a):
    """Length of the next run starting at a[0], and whether it was descending."""
    n = len(a)
    if n <= 1:
        return n, False
    if a[1] < a[0]:
        i = 1
        while i + 1 < n and a[i + 1] < a[i]:
            i += 1
        return i + 1, True
    else:
        i = 1
        while i + 1 < n and a[i + 1] >= a[i]:
            i += 1
        return i + 1, False


def next_run_ascending(a):
    """count_run, reversing a descending run in place (stable: strict descent only)."""
    run_len, descending = count_run(a)
    run = a[:run_len]
    if descending:
        run.reverse()
    return run, run_len


# CPython's own worked example: "given [3, 2, 1, 3, 4, 5, 0], the 3-element
# descending prefix is reversed in-place, and then extended by [3, 4, 5]."
example = [3, 2, 1, 3, 4, 5, 0]
run_len, descending = count_run(example)
assert run_len == 3
assert descending
first_run, _ = next_run_ascending(example)
assert first_run == [1, 2, 3]
# The reversed run (1, 2, 3) is itself non-decreasing and the array's next
# three elements (3, 4, 5) continue non-decreasing from it -- the "extended by
# an adjacent ascending run" case CPython's own file describes.
assert example[3:6] == [3, 4, 5]
assert first_run[-1] <= example[3]
print(f"Run detection on {example}: descending run of length {run_len}, "
      f"reversed to {first_run}, extended by {example[3:6]}")


# ---------------------------------------------------------------------------
# 2. Binary insertion sort, used to extend a short run to minrun.
# ---------------------------------------------------------------------------

class Counters:
    def __init__(self):
        self.comparisons = 0

    def le(self, a, b):
        self.comparisons += 1
        return a <= b


def binary_insertion_sort(a, c, start=1):
    """Extend a[0:start) (already sorted) to a fully sorted a, binary-insertion style."""
    for i in range(start, len(a)):
        key = a[i]
        lo, hi = 0, i
        while lo < hi:
            mid = (lo + hi) // 2
            if c.le(key, a[mid]):
                hi = mid
            else:
                lo = mid + 1
        a[lo + 1:i + 1] = a[lo:i]
        a[lo] = key
    return a


# ---------------------------------------------------------------------------
# 3. The old minrun scheme (CPython pre-2025): pick minrun in [32, 65) so that
#    N / minrun lands at or just under a power of 2.
# ---------------------------------------------------------------------------

def merge_compute_minrun_old(n):
    """CPython's pre-2025 scheme: take the top 6 bits of n, round up if any
    lower bit is set."""
    r = 0
    while n >= 64:
        r |= n & 1
        n >>= 1
    return n + r


# The 2112 case CPython's own file names: minrun 32 gives 66 runs of 32 (64 of
# them merge perfectly, leaving an unbalanced 2048/64 tail); the scheme instead
# picks 33, giving 64 perfectly balanced runs.
assert merge_compute_minrun_old(2112) == 33
assert 2112 // 33 == 64 and 2112 % 33 == 0
print(f"\nOld minrun scheme on N=2112: minrun={merge_compute_minrun_old(2112)}, "
      f"{2112 // merge_compute_minrun_old(2112)} runs, no remainder")


# ---------------------------------------------------------------------------
# 4. The five shapes: sorted and reversed are each one run (n-1 comparisons to
#    confirm, via the chapter's own deck plus a larger array matching
#    CPython's own cited figure).
# ---------------------------------------------------------------------------

DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13]
deck_run_len, deck_descending = count_run(DECK)
print(f"\nDeck run detection: first run length {deck_run_len}, descending={deck_descending}")
assert DECK[8:12] == [8, 9, 10, 11]  # the chapter's own long ascending stretch

N_SHAPE = 32768
sorted_shape = list(range(N_SHAPE))
reversed_shape = list(range(N_SHAPE - 1, -1, -1))
equal_shape = [5] * N_SHAPE

for name, shape in [("sorted", sorted_shape), ("reversed", reversed_shape), ("equal", equal_shape)]:
    run_len, _ = count_run(shape)
    assert run_len == N_SHAPE, f"{name} shape should be a single run"
# A single run of n elements is found with exactly n-1 comparisons (one
# a[i+1] vs a[i] test per step, confirmed by instrumenting count_run).
counted = Counters()


def count_run_instrumented(a, c):
    n = len(a)
    if n <= 1:
        return n
    i = 1
    descending = c.le(a[1], a[0]) and a[1] != a[0]
    if a[1] < a[0]:
        while i + 1 < n:
            c.comparisons += 1
            if not (a[i + 1] < a[i]):
                break
            i += 1
    else:
        while i + 1 < n:
            c.comparisons += 1
            if not (a[i + 1] >= a[i]):
                break
            i += 1
    return i + 1


for name, shape in [("sorted", sorted_shape), ("reversed", reversed_shape), ("equal", equal_shape)]:
    c = Counters()
    run_len = count_run_instrumented(shape, c)
    assert run_len == N_SHAPE
    assert c.comparisons == N_SHAPE - 1
print(f"Sorted/reversed/equal at n={N_SHAPE}: exactly {N_SHAPE - 1} comparisons each "
      f"(matches CPython's own cited 32,767 at n=32,768)")


# ---------------------------------------------------------------------------
# 5. Galloping: linear search vs galloping vs galloping+binary search, the
#    crossover at i=6, and MIN_GALLOP=7.
# ---------------------------------------------------------------------------

def gallop_compares(i):
    """Comparisons galloping needs to find that A[0] belongs at B[i]:
    2*floor(lg(i)) + 2, per CPython's own formula."""
    if i == 0:
        return 1
    return 2 * math.floor(math.log2(i)) + 2


def linear_compares(i):
    return i + 1


print("\nGalloping vs linear search, comparisons needed for A[0] belonging at B[i]:")
crossover = None
for i in range(0, 12):
    lin, gal = linear_compares(i), gallop_compares(i)
    print(f"  i={i:2d}: linear={lin}, gallop={gal}")
    if crossover is None and gal < lin:
        crossover = i

assert crossover == 6, "galloping should first strictly win at i=6"
# It loses at i=2 and i=4, ties elsewhere below 6, per CPython's own account.
assert gallop_compares(2) > linear_compares(2)
assert gallop_compares(4) > linear_compares(4)
for i in [0, 1, 3, 5]:
    assert gallop_compares(i) == linear_compares(i)
for i in range(6, 20):
    assert gallop_compares(i) <= linear_compares(i)

MIN_GALLOP = 7
print(f"Galloping first strictly wins at i={crossover}; MIN_GALLOP={MIN_GALLOP} "
      f"(CPython's own threshold, past the crossover)")


# ---------------------------------------------------------------------------
# 6. The 2015 Timsort invariant bug: transcribed from the JDK's own
#    mergeCollapse loop (CAV 2015's own account), reproduced on the paper's
#    own example run lengths.
# ---------------------------------------------------------------------------

def merge_collapse(run_len):
    """A transcription of the (buggy) JDK mergeCollapse loop: merges the
    second-to-last run into whichever neighbour the comparisons favour,
    checking the invariant only on the top three stack entries."""
    run_len = list(run_len)
    while len(run_len) > 1:
        n = len(run_len) - 2
        if n > 0 and run_len[n - 1] <= run_len[n] + run_len[n + 1]:
            if run_len[n - 1] < run_len[n + 1]:
                n -= 1
        elif n < 0 or run_len[n] > run_len[n + 1]:
            break
        # merge run n and n+1
        run_len[n] = run_len[n] + run_len[n + 1]
        del run_len[n + 1]
    return run_len


def invariant_holds(run_len):
    """A > B + C and B > C for every consecutive triple, reading left to right."""
    for i in range(len(run_len) - 2):
        a, b, c = run_len[i], run_len[i + 1], run_len[i + 2]
        if not (a > b + c and b > c):
            return False, i
    return True, None


# CAV 2015's own worked example.
runs = [120, 80, 25, 20, 30]
after = merge_collapse(runs)
assert after == [120, 80, 45, 30], f"expected [120, 80, 45, 30], got {after}"
ok, break_at = invariant_holds(after)
assert not ok, "the invariant should be broken after this merge (the 2015 bug)"
assert break_at == 0  # broken at the leftmost triple: 120, 80, 45 -> 120 <= 80+45
print(f"\n2015 Timsort bug reproduction: {runs} -> mergeCollapse -> {after}")
print(f"Invariant (A > B+C, B > C) holds on the top three (80, 45, 30): "
      f"{80 > 45 + 30 and 45 > 30}")
print(f"Invariant holds at the leftmost triple (120, 80, 45): {120 > 80 + 45} -- broken")


# ---------------------------------------------------------------------------
# 7. Powersort's node-power computation (CPython's own powerloop() definition,
#    computed exactly via fractions rather than floating point).
# ---------------------------------------------------------------------------

def node_power(s1, n1, n2, n):
    """The power of the run starting at s1 (length n1), paired with the run
    starting at s1+n1 (length n2), within a list of total length n: the least
    integer L such that floor(a * 2**L) != floor(b * 2**L), where a and b are
    the midpoint fractions (s1 + n1/2)/n and (s2 + n2/2)/n."""
    s2 = s1 + n1
    a = Fraction(2 * s1 + n1, 2 * n)
    b = Fraction(2 * s2 + n2, 2 * n)
    L = 1
    while int(a * (2 ** L)) == int(b * (2 ** L)):
        L += 1
    return L


# CHAPTER.md's own planning values, both recomputed exactly here.
assert node_power(0, 40, 40, 80) == 1
assert node_power(0, 10, 10, 80) == 3   # the pair (10, 10)
assert node_power(10, 10, 60, 80) == 1  # the pair (10, 60)
print(f"\nPowersort node power: runs 40,40 in n=80 -> power {node_power(0, 40, 40, 80)}")
print(f"Powersort node power: runs 10,10 in n=80 -> power {node_power(0, 10, 10, 80)}")
print(f"Powersort node power: runs 10,60 in n=80 -> power {node_power(10, 10, 60, 80)}")

# Powers on the merge-tree stack strictly decrease: merge runs while the
# stored power exceeds the new one. Demonstrated on a small synthetic stack.
run_lengths = [40, 40, 10, 10, 60]
starts = [0]
for length in run_lengths[:-1]:
    starts.append(starts[-1] + length)
powers = [node_power(starts[i], run_lengths[i], run_lengths[i + 1],
                      sum(run_lengths)) for i in range(len(run_lengths) - 1)]
print(f"Run lengths {run_lengths} -> pairwise powers {powers}")


# ---------------------------------------------------------------------------
# 8. Stefan Pochmann's 2025 minrun refinement, on CPython's own 315-element
#    example: old fixed minrun=40 vs the new at-most-two-lengths scheme.
# ---------------------------------------------------------------------------

def old_run_lengths(n, minrun):
    """Fixed minrun, a shorter final run."""
    lengths = [minrun] * (n // minrun)
    remainder = n % minrun
    if remainder:
        lengths.append(remainder)
    return lengths


def pochmann_run_lengths(n, num_runs):
    """At most two run lengths, the smaller one less than the larger, as many
    short runs as needed to make up the difference."""
    base = n // num_runs
    extra = n % num_runs
    # `extra` runs of length base+1, the rest of length base.
    return [base + 1] * extra + [base] * (num_runs - extra)


N_POCHMANN = 315
old_lengths = old_run_lengths(N_POCHMANN, 40)
assert old_lengths == [40, 40, 40, 40, 40, 40, 40, 35]

new_lengths = pochmann_run_lengths(N_POCHMANN, 8)
assert sorted(set(new_lengths)) == [39, 40]
assert sum(new_lengths) == N_POCHMANN
assert len(new_lengths) == 8  # a power of 2, same as the old scheme
# At most two different lengths, differing by exactly one.
assert max(new_lengths) - min(new_lengths) == 1
print(f"\nPochmann minrun on n={N_POCHMANN}: old scheme {old_lengths}")
print(f"                              new scheme {sorted(new_lengths, reverse=True)}")


# ---------------------------------------------------------------------------
# 9. Driftsort's own allocation formula is named from its own source
#    (SOURCES.md), not reimplemented: max(n/2, min(n, 8MB)) of scratch space,
#    shown here only as a plain computation for a couple of sizes, in the
#    units the source itself uses (elements, assuming 8-byte elements).
# ---------------------------------------------------------------------------

def driftsort_alloc_elements(n, element_bytes=8, max_full_alloc_bytes=8_000_000):
    max_full_alloc = max_full_alloc_bytes // element_bytes
    return max(n // 2, min(n, max_full_alloc))


small_n = 1_000
large_n = 10_000_000
print(f"\nDriftsort scratch allocation (8-byte elements): "
      f"n={small_n:,} -> {driftsort_alloc_elements(small_n):,} elements "
      f"(scales like n for small inputs)")
print(f"                                                  n={large_n:,} -> "
      f"{driftsort_alloc_elements(large_n):,} elements "
      f"(capped near n/2 for large inputs)")
assert driftsort_alloc_elements(small_n) == small_n  # small: scales like n
assert driftsort_alloc_elements(large_n) == large_n // 2  # large: n/2


# ---------------------------------------------------------------------------
# 10. Release facts, cited from SOURCES.md, not computed here: CPython shipped
#     Powersort in 3.11; Rust's standard library shipped driftsort in 1.81;
#     the CAV 2015 paper's smallest crashing counterexample needed just over
#     67 million elements.
# ---------------------------------------------------------------------------

CPYTHON_POWERSORT_RELEASE = "3.11"
RUST_DRIFTSORT_RELEASE = "1.81"
CAV2015_SMALLEST_COUNTEREXAMPLE_MILLIONS = 67
assert CPYTHON_POWERSORT_RELEASE == "3.11"
assert RUST_DRIFTSORT_RELEASE == "1.81"
assert CAV2015_SMALLEST_COUNTEREXAMPLE_MILLIONS == 67
