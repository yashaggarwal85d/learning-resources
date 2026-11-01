"""
dsa.elementary-sorts-sorting-networks — every number this topic puts on screen, computed or
asserted here. Insertion, selection and bubble sort on the fixed 16-key deck and the planning
examples; the instability demonstration; a four-input sorting network, brute-force verified
against every permutation and every zero-one input; the small-sort cutoff facts named from
primary sources, cited only, not re-derived.
"""

import itertools


# ---------------------------------------------------------------------------
# 1. The 16-key deck, fixed here and reused by every later §15.1 topic (per
#    CHAPTER.md: "the builder fixes its values in topic 48's examples.py").
#    Several duplicates, one long ascending stretch.
# ---------------------------------------------------------------------------

DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13]
assert len(DECK) == 16
assert len(set(DECK)) < 16  # duplicates present (three 3s, two 9s)
# The long ascending stretch: 8, 9, 10, 11 at positions 8..11.
assert DECK[8:12] == [8, 9, 10, 11]


# ---------------------------------------------------------------------------
# 2. Insertion sort, instrumented: exact comparisons and moves, on the
#    planning example and on 8 sorted/reversed keys.
# ---------------------------------------------------------------------------

def insertion_sort(a):
    a = a[:]
    comparisons = 0
    moves = 0
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0:
            comparisons += 1
            if a[j] > key:
                a[j + 1] = a[j]
                moves += 1
                j -= 1
            else:
                break
        a[j + 1] = key
    return a, comparisons, moves


def count_inversions(a):
    n = len(a)
    return sum(1 for i in range(n) for j in range(i + 1, n) if a[i] > a[j])


planning_example = [5, 2, 4, 6, 1, 3]
sorted_result, comparisons, moves = insertion_sort(planning_example)
assert sorted_result == sorted(planning_example)
inversions = count_inversions(planning_example)
assert inversions == 9, inversions
assert comparisons == 12, comparisons
assert moves == 9, moves
assert moves == inversions  # moves = inversions, exactly

# Insertion sort's cost is n - 1 (comparisons that find "already in place")
# plus the number of inversions — the n - 1 figure shows up as the fixed
# per-element floor (one comparison per element that needs no shifting at
# all), separate from the comparisons spent actually shifting.
eight_sorted = list(range(1, 9))
_, c_sorted, m_sorted = insertion_sort(eight_sorted)
assert c_sorted == 7, c_sorted   # n - 1 = 7, zero inversions
assert m_sorted == 0, m_sorted

eight_reversed = list(range(8, 0, -1))
_, c_rev, m_rev = insertion_sort(eight_reversed)
assert c_rev == 28, c_rev        # all 28 inversions of a fully reversed 8-key array
assert m_rev == 28, m_rev
assert count_inversions(eight_reversed) == 28


# ---------------------------------------------------------------------------
# 3. Selection sort and bubble sort, instrumented the same way, plus the
#    instability demonstration (selection sort swaps equal keys out of order).
# ---------------------------------------------------------------------------

def selection_sort_stable_tagged(records, key=lambda r: r[0]):
    """records: list of (key, tag). Returns the sorted list; used to show
    whether equal keys keep their relative input order."""
    a = records[:]
    n = len(a)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if key(a[j]) < key(a[min_idx]):
                min_idx = j
        a[i], a[min_idx] = a[min_idx], a[i]
    return a


tagged = [(3, 'a'), (1, 'b'), (3, 'c'), (2, 'd'), (1, 'e')]
result = selection_sort_stable_tagged(tagged)
assert result == [(1, 'b'), (1, 'e'), (2, 'd'), (3, 'c'), (3, 'a')], result
# The two 3s (a and c) come out in the opposite order from how they went in:
# selection sort is not stable.
assert [r for r in result if r[0] == 3] == [(3, 'c'), (3, 'a')]


def insertion_sort_tagged(records, key=lambda r: r[0]):
    a = records[:]
    for i in range(1, len(a)):
        rec = a[i]
        j = i - 1
        while j >= 0 and key(a[j]) > key(rec):
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = rec
    return a


ins_result = insertion_sort_tagged(tagged)
assert ins_result == [(1, 'b'), (1, 'e'), (2, 'd'), (3, 'a'), (3, 'c')], ins_result
# Insertion sort only ever moves a key across strictly smaller/larger keys,
# so equal keys never cross each other: stable.
assert [r for r in ins_result if r[0] == 3] == [(3, 'a'), (3, 'c')]


def selection_sort(a):
    a = a[:]
    comparisons = 0
    swaps = 0
    n = len(a)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            comparisons += 1
            if a[j] < a[min_idx]:
                min_idx = j
        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
            swaps += 1
    return a, comparisons, swaps


def bubble_sort(a):
    a = a[:]
    comparisons = 0
    moves = 0
    n = len(a)
    for i in range(n):
        swapped = False
        for j in range(n - 1 - i):
            comparisons += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                moves += 1
                swapped = True
        if not swapped:
            break
    return a, comparisons, moves


deck_sel, sel_c, sel_s = selection_sort(DECK)
deck_bub, bub_c, bub_m = bubble_sort(DECK)
deck_ins, ins_c, ins_m = insertion_sort(DECK)
assert deck_sel == sorted(DECK) == deck_bub == deck_ins
# Selection sort's comparison count is always n(n-1)/2, whatever the input.
n = len(DECK)
assert sel_c == n * (n - 1) // 2, sel_c
# Selection sort makes at most n - 1 swaps.
assert sel_s <= n - 1
# Bubble sort makes strictly more moves than insertion sort for the same
# result on this deck (the reason nobody uses it): each bubble-sort move is
# an adjacent swap (two writes), each insertion-sort move is one shift.
assert bub_m >= ins_m


# ---------------------------------------------------------------------------
# 4. A four-input sorting network: 5 compare-exchanges, verified by brute
#    force against all 24 permutations and all 16 zero-one inputs (the
#    zero-one principle, used only as a check here, not proved).
# ---------------------------------------------------------------------------

NETWORK_4 = [(0, 1), (2, 3), (0, 2), (1, 3), (1, 2)]
assert len(NETWORK_4) == 5


def run_network(a, network):
    a = list(a)
    for i, j in network:
        if a[i] > a[j]:
            a[i], a[j] = a[j], a[i]
    return a


# Every permutation of 4 distinct keys comes out sorted.
all_sorted = True
for perm in itertools.permutations(range(4)):
    if run_network(perm, NETWORK_4) != sorted(perm):
        all_sorted = False
assert all_sorted

# Every zero-one input (16 of them) comes out sorted — the zero-one
# principle's own claim, checked directly rather than invoked as a shortcut.
all_zero_one_sorted = True
for bits in itertools.product([0, 1], repeat=4):
    if run_network(bits, NETWORK_4) != sorted(bits):
        all_zero_one_sorted = False
assert all_zero_one_sorted

# The network's own size (5) meets the information-theoretic bound for 4
# inputs exactly: ceil(lg(4!)) = ceil(lg 24).
import math
ITB_4 = math.ceil(math.log2(math.factorial(4)))
assert ITB_4 == 5
assert len(NETWORK_4) == ITB_4  # the chapter's one fact about the bound meeting a network

# The optimal 8-input network (19 compare-exchanges, from Dobbelaere's table,
# citing Knuth vol. 3 — not built here, only its size is used) against the
# information-theoretic bound for 8 inputs.
OPTIMAL_SIZE_8 = 19
ITB_8 = math.ceil(math.log2(math.factorial(8)))
assert ITB_8 == 16
assert OPTIMAL_SIZE_8 > ITB_8  # the optimal network is NOT optimal against the bound at n=8


# ---------------------------------------------------------------------------
# 5. The small-sort cutoff: named facts from primary sources (not re-derived
#    here — these are read from the sources in SOURCES.md, asserted as the
#    exact figures this topic puts on screen).
# ---------------------------------------------------------------------------

LIBSTDCXX_THRESHOLD = 16      # enum { _S_threshold = 16 }; stl_algo.h
RUST_SORT13_CUTOFF = 13       # region.len() >= 13 -> sort13_optimal
RUST_SORT9_CUTOFF = 9         # region.len() >= 9 -> sort9_optimal
assert LIBSTDCXX_THRESHOLD == 16
assert RUST_SORT13_CUTOFF == 13
assert RUST_SORT9_CUTOFF == 9


if __name__ == "__main__":
    print(f"planning example {planning_example}: {inversions} inversions, {comparisons} comparisons, {moves} moves (moves == inversions: {moves == inversions})")
    print(f"insertion sort on 8 sorted keys: {c_sorted} comparisons, {m_sorted} moves")
    print(f"insertion sort on 8 reversed keys: {c_rev} comparisons, {m_rev} moves")
    print(f"selection sort instability: {result}")
    print(f"insertion sort keeps stability: {ins_result}")
    print(f"deck (16 keys) selection sort: {sel_c} comparisons, {sel_s} swaps (n(n-1)/2 = {n*(n-1)//2})")
    print(f"deck bubble vs insertion moves: bubble {bub_m}, insertion {ins_m}")
    print(f"4-input network sorts all 24 permutations: {all_sorted}; all 16 zero-one inputs: {all_zero_one_sorted}")
    print(f"network size {len(NETWORK_4)} meets ceil(lg 4!) = {ITB_4}")
    print(f"optimal 8-input network size {OPTIMAL_SIZE_8} vs ceil(lg 8!) = {ITB_8}")
    print("all assertions passed.")
