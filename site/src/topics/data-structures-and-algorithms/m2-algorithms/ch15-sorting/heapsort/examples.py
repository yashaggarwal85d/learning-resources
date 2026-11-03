"""dsa.heapsort — every number is computed and asserted here.

Heapsort as two ideas already built in Chapter 6 (linear bottom-up heap build,
sift-down), run in sequence: build a max-heap, then repeatedly swap the root
with the last live element, shrink the heap, and sift the new root down. The
introsort-style depth-limit fallback (libstdc++, the JDK, Rust) is named from
primary sources (see SOURCES.md), not reimplemented here, per CHAPTER.md's
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

    def swap(self, arr, i, j):
        if i != j:
            arr[i], arr[j] = arr[j], arr[i]
        self.swaps += 1


# ---------------------------------------------------------------------------
# Sift-down: push a[i] down within the heap occupying a[0:n), max-heap order.
# ---------------------------------------------------------------------------

def sift_down(a, i, n, c):
    while True:
        left = 2 * i + 1
        right = 2 * i + 2
        largest = i
        if left < n and c.cmp(a[largest], a[left]):
            largest = left
        if right < n and c.cmp(a[largest], a[right]):
            largest = right
        if largest == i:
            break
        c.swap(a, i, largest)
        i = largest


def build_max_heap(a, c):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n, c)


def heapsort(a):
    c = Counters()
    a = list(a)
    n = len(a)
    build_max_heap(a, c)
    build_comparisons = c.comparisons
    for end in range(n - 1, 0, -1):
        c.swap(a, 0, end)
        sift_down(a, 0, end, c)
    return a, c.comparisons, c.swaps, build_comparisons


# ---------------------------------------------------------------------------
# 1. The chapter's own 16-key deck, fixed in topic 48's examples.py, reused.
# ---------------------------------------------------------------------------

DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13]
assert len(DECK) == 16

deck_sorted, deck_cmp, deck_swaps, deck_build_cmp = heapsort(DECK)
assert deck_sorted == sorted(DECK)
print(f"Deck (n=16): {deck_cmp} comparisons ({deck_build_cmp} to build), {deck_swaps} swaps")


# ---------------------------------------------------------------------------
# 2. Comparison counts on 1,024 keys: random, sorted, reversed.
# ---------------------------------------------------------------------------

N = 1024
rng = random.Random(1024)
random_input = list(range(N))
rng.shuffle(random_input)
sorted_input = list(range(N))
reversed_input = list(range(N - 1, -1, -1))

random_sorted, random_cmp, random_swaps, random_build_cmp = heapsort(random_input)
sorted_sorted, sorted_cmp, sorted_swaps, sorted_build_cmp = heapsort(sorted_input)
reversed_sorted, reversed_cmp, reversed_swaps, reversed_build_cmp = heapsort(reversed_input)

assert random_sorted == sorted(random_input)
assert sorted_sorted == sorted(sorted_input)
assert reversed_sorted == sorted(reversed_input)

print(f"\nHeapsort on {N} keys:")
print(f"  random:   {random_cmp} comparisons (build {random_build_cmp}), {random_swaps} swaps")
print(f"  sorted:   {sorted_cmp} comparisons (build {sorted_build_cmp}), {sorted_swaps} swaps")
print(f"  reversed: {reversed_cmp} comparisons (build {reversed_build_cmp}), {reversed_swaps} swaps")

# The exact figures shown on screen (this topic's own random seed; CHAPTER.md's planning
# values are close but not bit-for-bit identical, see FACT-CHECK.md).
assert random_cmp == 17316
assert random_build_cmp == 1887
assert sorted_cmp == 18060
assert reversed_cmp == 16407

# Not adaptive: the three shapes land within a narrow band of each other,
# unlike insertion sort (topic 48) or merge sort's natural-run variant.
counts = [random_cmp, sorted_cmp, reversed_cmp]
assert max(counts) / min(counts) < 1.2, "heapsort should not vary much by input shape"


# ---------------------------------------------------------------------------
# 3. The two bounds heapsort is measured against.
# ---------------------------------------------------------------------------

def log2_factorial_ceil(n):
    """ceil(lg(n!)) via lg(n!) = sum_{k=1..n} lg(k)."""
    total = sum(math.log2(k) for k in range(1, n + 1))
    return math.ceil(total)


def merge_sort_worst_case(n):
    """n*ceil(lg n) - 2**ceil(lg n) + 1, merge sort's exact worst-case comparison count."""
    lg_n = math.ceil(math.log2(n))
    return n * lg_n - 2 ** lg_n + 1


info_bound = log2_factorial_ceil(N)
merge_bound = merge_sort_worst_case(N)
assert info_bound == 8770
assert merge_bound == 9217

print(f"\nBounds at n={N}: info-theoretic ceil(lg n!) = {info_bound}, "
      f"merge sort worst case = {merge_bound}")
print(f"Heapsort/info-theoretic ratio: random {random_cmp / info_bound:.2f}x, "
      f"sorted {sorted_cmp / info_bound:.2f}x, reversed {reversed_cmp / info_bound:.2f}x")

# Heapsort is roughly twice the information-theoretic minimum on every shape,
# and noticeably worse than merge sort's worst case, on every shape measured.
assert 1.8 < random_cmp / info_bound < 2.2
assert 1.8 < sorted_cmp / info_bound < 2.2
assert 1.8 < reversed_cmp / info_bound < 2.2
for cmp_count in counts:
    assert cmp_count > merge_bound


# ---------------------------------------------------------------------------
# 4. At most 2*lg(n) comparisons per sift-down (two child comparisons a level).
# ---------------------------------------------------------------------------

max_sift_down_comparisons = 2 * math.ceil(math.log2(N))
# Every individual sift-down call makes at most 2 comparisons per level of
# descent, and a heap of N keys has ceil(lg N) levels below the root.
print(f"\nMax comparisons in one sift-down at n={N}: 2*ceil(lg n) = {max_sift_down_comparisons}")


# ---------------------------------------------------------------------------
# 5. Poor locality: cache lines touched by a sift-down path, 2**20-key heap.
# ---------------------------------------------------------------------------

HEAP_SIZE = 2 ** 20
KEY_BYTES = 8          # a 64-bit key
LINE_BYTES = 64
KEYS_PER_LINE = LINE_BYTES // KEY_BYTES  # 8

def random_root_to_leaf_path(n, rng):
    """One sift-down's descent from the root to a leaf, child chosen at random."""
    path = [0]
    i = 0
    while True:
        left, right = 2 * i + 1, 2 * i + 2
        if left >= n:
            break
        i = left if (right >= n or rng.random() < 0.5) else right
        path.append(i)
    return path

path_rng = random.Random(2020)
TRIALS = 2000
path_lengths = []
distinct_line_counts = []
for _ in range(TRIALS):
    path = random_root_to_leaf_path(HEAP_SIZE, path_rng)
    path_lengths.append(len(path))
    lines = {idx // KEYS_PER_LINE for idx in path}
    distinct_line_counts.append(len(lines))

avg_path_length = sum(path_lengths) / len(path_lengths)
avg_distinct_lines = sum(distinct_line_counts) / len(distinct_line_counts)

print(f"\nSift-down path, heap of {HEAP_SIZE} keys, {KEYS_PER_LINE} keys/{LINE_BYTES}-byte line:")
print(f"  average path length: {avg_path_length:.1f} nodes")
print(f"  average distinct cache lines touched: {avg_distinct_lines:.1f}")

# A root-to-leaf path in a 2**20-key heap is about 20 nodes deep, and a
# majority of them land on distinct cache lines (the index gap roughly
# doubles each level), unlike a sequential scan's one-line-at-a-time cost.
assert 19 <= avg_path_length <= 21
assert avg_distinct_lines > avg_path_length * 0.75
assert round(avg_path_length, 1) == 20.0
assert round(avg_distinct_lines, 1) == 17.9


# ---------------------------------------------------------------------------
# 6. Unstable: the tagged deck, equal keys reordered by a distant swap.
# ---------------------------------------------------------------------------

tagged_deck = [(3, 'a'), (7, 'b'), (3, 'c'), (1, 'd'), (9, 'e'), (3, 'f'), (5, 'g'), (2, 'h')]
key_order_in = [tag for key, tag in tagged_deck if key == 3]

tagged_counters = Counters()
tagged_arr = list(tagged_deck)


def tagged_sift_down(a, i, n, c):
    while True:
        left, right = 2 * i + 1, 2 * i + 2
        largest = i
        if left < n and c.cmp(a[largest][0], a[left][0]):
            largest = left
        if right < n and c.cmp(a[largest][0], a[right][0]):
            largest = right
        if largest == i:
            break
        c.swap(a, i, largest)
        i = largest


def tagged_heapsort(a):
    c = Counters()
    a = list(a)
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        tagged_sift_down(a, i, n, c)
    for end in range(n - 1, 0, -1):
        c.swap(a, 0, end)
        tagged_sift_down(a, 0, end, c)
    return a


tagged_sorted = tagged_heapsort(tagged_deck)
assert [key for key, tag in tagged_sorted] == sorted(key for key, tag in tagged_deck)
key_order_out = [tag for key, tag in tagged_sorted if key == 3]

print(f"\nTagged deck, key 3's tags: input order {key_order_in}, heapsort output order {key_order_out}")
assert key_order_out != key_order_in, "heapsort should NOT preserve the input order of equal keys"
