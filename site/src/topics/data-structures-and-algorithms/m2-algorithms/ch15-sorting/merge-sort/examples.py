"""
dsa.merge-sort — every number this topic puts on screen, computed or asserted here. The
merge procedure's own comparison bound; top-down and bottom-up merge sort, instrumented,
shown equal when n is a power of two and different otherwise; the worst-case formula
brute-force checked against every permutation for small n; the gap to the information-
theoretic bound at n = 8 and n = 1,024, and that the gap stays a small fraction of n up
to 200,000; stability shown directly, and broken by one character; the three buffer
strategies' own real sizes; natural (run-adaptive) merge sort on five input shapes.
"""

import math

# The chapter's own 16-key deck, fixed in topic 48's examples.py and reused unchanged.
DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13]
assert len(DECK) == 16


# ---------------------------------------------------------------------------
# 1. The merge procedure: two sorted ranges into one, instrumented.
# ---------------------------------------------------------------------------

def _key(x):
    return x[0] if isinstance(x, tuple) else x


def merge(left, right):
    """Two sorted ranges merged into one sorted range. A tie keeps the left key first --
    the whole proof of stability lives in this one `<=`. Compares by key only, so a
    tagged record's own tag never breaks a tie the key itself didn't break."""
    out = []
    comparisons = 0
    i = j = 0
    while i < len(left) and j < len(right):
        comparisons += 1
        if _key(left[i]) <= _key(right[j]):
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out, comparisons


def merge_unstable(left, right):
    """The one-character change (`<` instead of `<=`) that breaks stability: on a tie,
    the right key now goes first."""
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if _key(left[i]) < _key(right[j]):
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

# Merging [1..8] with [9..16]: the left list is used up before the right is ever touched.
left8 = list(range(1, 9))
right8 = list(range(9, 17))
merged, cmp_best = merge(left8, right8)
assert merged == list(range(1, 17))
assert cmp_best == 8  # one comparison per left-list element; the right list is never probed

# A perfect interleaving of the identical two ranges: every element compared against one
# from the other side, until the very last pair -- m + n - 1 comparisons.
left_interleaved = [1, 3, 5, 7, 9, 11, 13, 15]
right_interleaved = [2, 4, 6, 8, 10, 12, 14, 16]
merged2, cmp_worst = merge(left_interleaved, right_interleaved)
assert merged2 == list(range(1, 17))
assert cmp_worst == 15  # m + n - 1: the last element never needs a comparison to place

# The merge's own comparison count always sits in [min(m, n), m + n - 1].
assert cmp_best == min(8, 8)
assert cmp_worst == 8 + 8 - 1


# ---------------------------------------------------------------------------
# 2. Top-down and bottom-up merge sort, instrumented identically.
# ---------------------------------------------------------------------------

def top_down_merge_sort(a):
    comparisons = 0

    def sort(sub):
        nonlocal comparisons
        if len(sub) <= 1:
            return sub
        mid = len(sub) // 2
        left = sort(sub[:mid])
        right = sort(sub[mid:])
        merged, c = merge(left, right)
        comparisons += c
        return merged

    return sort(a), comparisons


def bottom_up_merge_sort(a):
    """No recursion, no stack: merge adjacent runs of width 1, then 2, then 4 ..."""
    a = a[:]
    n = len(a)
    comparisons = 0
    width = 1
    while width < n:
        for start in range(0, n, 2 * width):
            left = a[start:start + width]
            right = a[start + width:start + 2 * width]
            merged, c = merge(left, right)
            comparisons += c
            a[start:start + len(merged)] = merged
        width *= 2
    return a, comparisons


# Both agree with Python's own sort, on the chapter's own deck.
td_result, td_cmp = top_down_merge_sort(DECK)
bu_result, bu_cmp = bottom_up_merge_sort(DECK)
assert td_result == sorted(DECK)
assert bu_result == sorted(DECK)

# When n is a power of two, every merge at every level splits exactly in half for both
# strategies, so the two comparison counts are identical. When it isn't, top-down's
# recursive midpoint split and bottom-up's fixed-width sweep disagree on where some of
# the smaller merges fall, and the counts can differ.
import random as _random
rng = _random.Random(11)

def counts_for(n, seed):
    a = list(range(n))
    rng2 = _random.Random(seed)
    rng2.shuffle(a)
    _, c_td = top_down_merge_sort(a)
    _, c_bu = bottom_up_merge_sort(a)
    return c_td, c_bu

for n in (4, 8, 16, 32):  # powers of two: always equal
    for seed in range(5):
        c_td, c_bu = counts_for(n, seed)
        assert c_td == c_bu, (n, seed, c_td, c_bu)

disagreement_found = False
for n in (5, 6, 7, 9, 11, 13):  # not powers of two
    for seed in range(20):
        c_td, c_bu = counts_for(n, seed)
        if c_td != c_bu:
            disagreement_found = True
assert disagreement_found  # top-down and bottom-up really can disagree when n isn't a power of two


# ---------------------------------------------------------------------------
# 3. The worst-case comparison count: brute force for small n, then the formula.
# ---------------------------------------------------------------------------

def worst_case_formula(n):
    """n * ceil(lg n) - 2^ceil(lg n) + 1 -- top-down merge sort's own worst case."""
    if n <= 1:
        return 0
    ceil_lg = math.ceil(math.log2(n))
    return n * ceil_lg - 2 ** ceil_lg + 1


def brute_force_worst_case(n):
    best = 0
    import itertools
    for perm in itertools.permutations(range(n)):
        _, c = top_down_merge_sort(list(perm))
        best = max(best, c)
    return best


PLANNING_WORST = {4: 5, 5: 8, 6: 11, 7: 14, 8: 17}
for n, expected in PLANNING_WORST.items():
    formula_value = worst_case_formula(n)
    assert formula_value == expected, (n, formula_value, expected)
    brute_value = brute_force_worst_case(n)
    assert brute_value == expected, (n, brute_value, expected)  # the formula really is the worst case


def ceil_log2_factorial(n):
    """ceil(lg(n!)), computed via lgamma to avoid converting an astronomically large
    integer (n! at n = 1,024 has over 2,500 digits) to a float directly."""
    if n <= 1:
        return 0
    log2_n_factorial = math.lgamma(n + 1) / math.log(2)
    return math.ceil(log2_n_factorial - 1e-9)  # guard against landing just under an integer


# At n = 8: merge sort's own worst case (17) is one comparison above the bound (16).
assert worst_case_formula(8) == 17
assert ceil_log2_factorial(8) == 16

# At n = 1,024: merge sort's own worst case (9,217) against the bound (8,770).
assert worst_case_formula(1024) == 9217
assert ceil_log2_factorial(1024) == 8770

# The gap grows only linearly: checked up to 200,000, the ratio of the gap to n stays
# under the planning figure (0.53) at every size tested.
max_ratio = 0.0
for n in range(2, 200_001, 971):  # a coprime-ish stride, not aligned to any power of two
    gap = worst_case_formula(n) - ceil_log2_factorial(n)
    ratio = gap / n
    max_ratio = max(max_ratio, ratio)
assert max_ratio < 0.53


# ---------------------------------------------------------------------------
# 4. Stability: the tagged deck, and the one-character break.
# ---------------------------------------------------------------------------

Tagged = tuple  # (key, tag)
tagged_left = [(3, 'a'), (5, 'x')]
tagged_right = [(3, 'b'), (3, 'c'), (9, 'y')]

stable_merged, _ = merge(tagged_left, tagged_right)
stable_keys_tags = [t for _, t in stable_merged]
assert stable_keys_tags.index('a') < stable_keys_tags.index('b') < stable_keys_tags.index('c')
# every 3 (a, b, c) appears in left-to-right input order among themselves

unstable_merged = merge_unstable(tagged_left, tagged_right)
unstable_keys_tags = [t for _, t in unstable_merged]
# the unstable merge, on a tie, takes the *right* key first -- b and c now come before a
assert unstable_keys_tags.index('b') < unstable_keys_tags.index('a')


# ---------------------------------------------------------------------------
# 5. The three buffer strategies, and the real auxiliary space each one uses.
# ---------------------------------------------------------------------------

def merge_sort_full_copy_buffer(a):
    """The simple version: every merge copies its whole input range into a fresh buffer."""
    peak = [0]

    def sort(sub):
        if len(sub) <= 1:
            return sub
        mid = len(sub) // 2
        left = sort(sub[:mid])
        right = sort(sub[mid:])
        buf = list(left) + list(right)  # a full-size scratch copy, every call
        peak[0] = max(peak[0], len(buf))
        merged, _ = merge(left, right)
        return merged

    result = sort(a)
    return result, peak[0]


def merge_sort_half_copy_buffer(a):
    """The usual refinement: only the left half is ever copied out; the right half and
    the output both live in the original array's own space (modelled here as a half-size
    buffer, matching the real technique's own peak)."""
    n = len(a)
    peak = [0]

    def sort(lo, hi):
        if hi - lo <= 1:
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid, hi)
        left_copy = a[lo:mid]  # only the left half is copied
        peak[0] = max(peak[0], len(left_copy))
        merged, _ = merge(left_copy, a[mid:hi])
        a[lo:hi] = merged

    a = a[:]
    sort(0, n)
    return a, peak[0]


def merge_sort_min_copy_buffer(a):
    """Timsort's own refinement: copy only the *shorter* of the two runs, min(A, B)."""
    peak = [0]

    def sort(sub):
        if len(sub) <= 1:
            return sub
        mid = len(sub) // 2
        left = sort(sub[:mid])
        right = sort(sub[mid:])
        shorter = min(len(left), len(right))
        peak[0] = max(peak[0], shorter)
        merged, _ = merge(left, right)
        return merged

    result = sort(a)
    return result, peak[0]


full_result, full_peak = merge_sort_full_copy_buffer(DECK)
half_result, half_peak = merge_sort_half_copy_buffer(DECK)
min_result, min_peak = merge_sort_min_copy_buffer(DECK)
assert full_result == sorted(DECK)
assert half_result == sorted(DECK)
assert min_result == sorted(DECK)
# The full-copy version's own peak buffer is the whole array (16); the half-copy
# version's peak is half that (8, the top-level left half); the min(A, B) version's own
# peak, on this exact 16-key deck, is also 8 at the top level -- but it is never larger
# than the half-copy version's peak, and can be smaller lower in the recursion.
assert full_peak == 16
assert half_peak == 8
assert min_peak <= half_peak


# ---------------------------------------------------------------------------
# 6. Natural (run-adaptive) merge sort: find the runs already there, merge pairwise.
# ---------------------------------------------------------------------------

def find_runs(a):
    """Maximal ascending stretches, found in one linear pass."""
    if not a:
        return []
    runs = []
    start = 0
    for i in range(1, len(a)):
        if a[i] < a[i - 1]:
            runs.append(a[start:i])
            start = i
    runs.append(a[start:])
    return runs


def natural_merge_sort(a):
    runs = find_runs(a)
    comparisons = 0
    # Count the comparisons the run-finding pass itself makes: one per adjacent pair.
    comparisons += max(0, len(a) - 1)
    while len(runs) > 1:
        next_runs = []
        for i in range(0, len(runs) - 1, 2):
            merged, c = merge(runs[i], runs[i + 1])
            comparisons += c
            next_runs.append(merged)
        if len(runs) % 2 == 1:
            next_runs.append(runs[-1])
        runs = next_runs
    return (runs[0] if runs else []), comparisons, len(find_runs(a))


# Already-sorted input: one run, no merge pass needed at all -- n - 1 comparisons total
# (every one of them spent finding the single run, none spent merging).
sorted_input = list(range(16))
result, total_cmp, n_runs = natural_merge_sort(sorted_input)
assert result == sorted_input
assert n_runs == 1
assert total_cmp == 15  # n - 1, all of it the run-finding pass

# Reversed input: every element starts a new run -- n runs of length one, the worst case
# for an ascending-only run detector.
reversed_input = list(range(16, 0, -1))
result_r, total_cmp_r, n_runs_r = natural_merge_sort(reversed_input)
assert result_r == sorted(reversed_input)
assert n_runs_r == 16  # one run per element

# A random shuffle: on average, close to half the elements start a new run (an ascending
# run ends, on average, after two elements for a uniformly random sequence) -- checked
# directly over many trials, not assumed.
rng3 = _random.Random(5)
run_counts = []
for _ in range(500):
    arr = list(range(200))
    rng3.shuffle(arr)
    run_counts.append(len(find_runs(arr)))
avg_runs = sum(run_counts) / len(run_counts)
assert 90 < avg_runs < 110  # close to n / 2 = 100, not exactly it, over 500 trials of n = 200

# The deck's own long ascending stretch: natural merge sort finds fewer runs on it than
# on a fully shuffled array of the identical size, because that stretch alone removes
# three of the "breaks" a fully random array would have.
deck_runs = find_runs(DECK)
assert len(deck_runs) < 16  # strictly fewer than one run per element


if __name__ == "__main__":
    print(f"Merge [1..8] with [9..16]: {cmp_best} comparisons (best case)")
    print(f"Perfectly interleaved merge: {cmp_worst} comparisons (worst case)")
    print(f"Worst case at n=8: formula {worst_case_formula(8)}, bound {ceil_log2_factorial(8)}")
    print(f"Worst case at n=1024: formula {worst_case_formula(1024)}, bound {ceil_log2_factorial(1024)}")
    print(f"Largest gap/n ratio up to 200,000: {max_ratio:.3f}")
    print(f"Buffer peaks: full={full_peak}, half={half_peak}, min(A,B)={min_peak}")
    print(f"Natural merge sort: sorted input {total_cmp} comparisons, {n_runs} run(s)")
    print(f"Natural merge sort: reversed input, {n_runs_r} run(s)")
    print(f"Average run count on 500 random 200-key shuffles: {avg_runs:.1f}")
    print(f"Deck's own run count: {len(deck_runs)} (of 16 possible)")
    print("merge-sort examples: all checks passed")
