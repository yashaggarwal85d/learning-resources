"""dsa.counting-radix-bucket-sort — every number is computed and asserted here.

Counting sort, LSD and MSD radix sort, American flag sort (the in-place MSD
variant, McIlroy/Bostic/McIlroy 1993), DuckDB's own multi-column byte
encoding (its 2021 post, read in SOURCES.md), the IEEE 754 float
order-preserving transform (stereopsis.com's "Radix Tricks", read in
SOURCES.md), the Theta(n w / log n) crossover argument, and a bucket-sort
expected-cost simulation. Every number shown on screen is computed here.
"""

import math
import random
import struct


# ---------------------------------------------------------------------------
# 1. Counting sort: Theta(n + k). Stable because the scatter walks the input
#    in order.
# ---------------------------------------------------------------------------

def counting_sort(keys, k):
    """Stable counting sort of integers in [0, k). Returns (sorted, moves)."""
    counts = [0] * k
    for key in keys:
        counts[key] += 1
    starts = [0] * k
    acc = 0
    for v in range(k):
        starts[v] = acc
        acc += counts[v]
    out = [None] * len(keys)
    moves = 0
    cursor = starts[:]
    for key in keys:
        out[cursor[key]] = key
        cursor[key] += 1
        moves += 1
    return out, moves


DECK = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]
K_DECK = 10
sorted_deck, deck_moves = counting_sort(DECK, K_DECK)
assert sorted_deck == sorted(DECK)
assert deck_moves == len(DECK) == 12

# Stability check: tag equal keys and confirm input order is preserved.
tagged = list(enumerate(DECK))  # (original_index, key)
counts = [0] * K_DECK
for _, key in tagged:
    counts[key] += 1
starts = [0] * K_DECK
acc = 0
for v in range(K_DECK):
    starts[v] = acc
    acc += counts[v]
tagged_out = [None] * len(tagged)
cursor = starts[:]
for idx, key in tagged:
    tagged_out[cursor[key]] = idx
    cursor[key] += 1
fives = [idx for idx in tagged_out if DECK[idx] == 5]
assert fives == [4, 8, 10]  # input order preserved among equal keys


# ---------------------------------------------------------------------------
# 2. LSD radix sort: counting-sort by each digit, least significant first.
#    Stability of each pass is why the composed result is sorted.
# ---------------------------------------------------------------------------

def lsd_radix_sort(keys, base, digits):
    """Stable LSD radix sort. Returns (sorted, passes, moves_per_pass)."""
    arr = list(keys)
    moves_per_pass = []
    for d in range(digits):
        divisor = base ** d
        digit_of = lambda x: (x // divisor) % base
        _, moves = counting_sort([digit_of(x) for x in arr], base)
        # Re-run counting sort on the actual values, keyed by this digit.
        counts = [0] * base
        for x in arr:
            counts[digit_of(x)] += 1
        starts = [0] * base
        acc = 0
        for v in range(base):
            starts[v] = acc
            acc += counts[v]
        out = [None] * len(arr)
        cursor = starts[:]
        for x in arr:
            dv = digit_of(x)
            out[cursor[dv]] = x
            cursor[dv] += 1
        arr = out
        moves_per_pass.append(moves)
    return arr, digits, moves_per_pass


LSD_DECK = [170, 45, 75, 90, 802, 24, 2, 66]
lsd_sorted, lsd_passes, lsd_moves = lsd_radix_sort(LSD_DECK, 10, 3)
assert lsd_sorted == sorted(LSD_DECK)
assert lsd_passes == 3
assert all(m == len(LSD_DECK) for m in lsd_moves)
assert sum(lsd_moves) == 24  # d * n = 3 * 8

# Against roughly lg(10**6) ~ 20 comparison levels at a million keys:
# a 32-bit key with 8-bit digits needs ceil(32/8) = 4 passes.
RADIX_PASSES_32BIT_8BIT_DIGITS = 32 // 8
assert RADIX_PASSES_32BIT_8BIT_DIGITS == 4
COMPARISON_LEVELS_AT_1M = math.ceil(math.log2(1_000_000))
assert COMPARISON_LEVELS_AT_1M == 20


# ---------------------------------------------------------------------------
# 3. MSD radix sort: partition by the first digit, recurse on each bucket by
#    the next digit; falls back to insertion sort on small buckets (topic
#    48's small-sort-cutoff).
# ---------------------------------------------------------------------------

def insertion_sort(arr, counters=None):
    for i in range(1, len(arr)):
        j = i
        while j > 0 and arr[j - 1] > arr[j]:
            arr[j - 1], arr[j] = arr[j], arr[j - 1]
            j -= 1
    return arr


def msd_radix_sort(keys, base, digits, cutoff=4):
    stats = {"insertion_calls": 0, "recursive_calls": 0}

    def digit_at(x, d):
        divisor = base ** (digits - 1 - d)
        return (x // divisor) % base

    def recurse(arr, d):
        stats["recursive_calls"] += 1
        if len(arr) <= cutoff or d >= digits:
            stats["insertion_calls"] += 1
            return insertion_sort(list(arr))
        buckets = [[] for _ in range(base)]
        for x in arr:
            buckets[digit_at(x, d)].append(x)
        out = []
        for b in buckets:
            out.extend(recurse(b, d + 1) if b else b)
        return out

    return recurse(list(keys), 0), stats


msd_sorted, msd_stats = msd_radix_sort(LSD_DECK, 10, 3, cutoff=2)
assert msd_sorted == sorted(LSD_DECK)
assert msd_stats["recursive_calls"] >= 1


# ---------------------------------------------------------------------------
# 4. American flag sort (McIlroy, Bostic & McIlroy 1993): the in-place MSD
#    variant. Count the digit values, turn counts into bucket boundaries,
#    then permute in place by following cycles of the permutation (not
#    stable: see the tag-order check below).
# ---------------------------------------------------------------------------

def american_flag_sort(arr, base, digit_fn):
    """In-place single-level American flag sort (one digit): count the
    digit values, turn the counts into each bucket's own start and next-free
    slot, then walk the array left to right, swapping any key that is not
    yet in its own bucket into that bucket's next free slot (a cycle-leader
    permutation: each swap either places a key for good or hands the loop
    another displaced key to place), following the mechanism SOURCES.md
    describes."""
    n = len(arr)
    counts = [0] * base
    for x in arr:
        counts[digit_fn(x)] += 1
    starts = [0] * base
    acc = 0
    for v in range(base):
        starts[v] = acc
        acc += counts[v]
    ends = [starts[v] + counts[v] for v in range(base)]
    next_free = starts[:]
    swaps = 0
    v = 0
    while v < base:
        if next_free[v] >= ends[v]:
            v += 1
            continue
        x = arr[next_free[v]]
        c = digit_fn(x)
        if c == v:
            next_free[v] += 1
        else:
            arr[next_free[v]], arr[next_free[c]] = arr[next_free[c]], arr[next_free[v]]
            next_free[c] += 1
            swaps += 1
    return arr, swaps


def american_flag_sort_simple(arr, base, digit_fn):
    """A second, independently written implementation, used only to confirm
    the first against a trusted result (both must agree with Python's own
    stable sort on the digit value)."""
    counts = [0] * base
    for x in arr:
        counts[digit_fn(x)] += 1
    starts = [0] * base
    acc = 0
    for v in range(base):
        starts[v] = acc
        acc += counts[v]
    out = [None] * len(arr)
    cursor = starts[:]
    for x in arr:
        c = digit_fn(x)
        out[cursor[c]] = x
        cursor[c] += 1
    return out


AF_DECK = [53, 31, 90, 11, 72, 64, 20, 48]
af_digit = lambda x: x // 10  # single "digit": the tens place, base 10
af_sorted, af_swaps = american_flag_sort(list(AF_DECK), 10, af_digit)
af_expected = american_flag_sort_simple(AF_DECK, 10, af_digit)
assert sorted(af_sorted, key=af_digit) == sorted(af_expected, key=af_digit)
assert [af_digit(x) for x in af_sorted] == sorted(af_digit(x) for x in AF_DECK)
assert af_swaps >= 1

# Instability check: two keys sharing a digit value can swap order.
AF_TAGGED = [(57, 'a'), (34, 'b'), (92, 'c'), (29, 'd'), (75, 'e'), (13, 'f'), (40, 'g'), (3, 'h'), (2, 'i')]
tagged_af_sorted, _ = american_flag_sort(list(AF_TAGGED), 10, lambda t: t[0] // 10)
same_pile_0 = [t for t in AF_TAGGED if t[0] // 10 == 0]
same_pile_0_out = [t for t in tagged_af_sorted if t[0] // 10 == 0]
assert set(same_pile_0) == set(same_pile_0_out)
assert same_pile_0 == [(3, 'h'), (2, 'i')]
AF_UNSTABLE = same_pile_0_out != same_pile_0  # order among the pile-0 keys changed
assert AF_UNSTABLE
assert same_pile_0_out == [(2, 'i'), (3, 'h')]


# ---------------------------------------------------------------------------
# 5. DuckDB's multi-column byte encoding: reproduce the 2021 post's own
#    three-row example (c_birth_country DESC, c_birth_year ASC NULLS LAST)
#    by hand, then confirm byte comparison gives the right row order.
# ---------------------------------------------------------------------------

def encode_string_desc(s, width):
    b = s.encode('ascii').ljust(width, b'\x00')
    return bytes(0xFF ^ byte for byte in b)


def encode_int32_asc(n):
    # Big-endian, sign bit flipped so negatives sort before non-negatives.
    unsigned = (n + (1 << 31)) & 0xFFFFFFFF
    return struct.pack('>I', unsigned)


ROWS = [("NETHERLANDS", 1991), ("NETHERLANDS", 1992), ("GERMANY", 1924)]
WIDTH = len("NETHERLANDS")
encoded = [encode_string_desc(country, WIDTH) + encode_int32_asc(year) for country, year in ROWS]

# The post's own two leading NETHERLANDS bytes, inverted (0x4E='N' -> 0xB1).
assert encoded[0][0] == (0xFF ^ ord('N')) == 0xB1
# GERMANY is shorter and padded with 0x00, which the DESC inversion turns to 0xFF.
assert encoded[2][len("GERMANY")] == 0xFF

# Byte comparison must reproduce the post's own stated row order:
# NETHERLANDS/1991, NETHERLANDS/1992, GERMANY/1924.
byte_order = sorted(range(len(ROWS)), key=lambda i: encoded[i])
assert byte_order == [0, 1, 2]

# The two NETHERLANDS rows differ only in the year suffix; confirm the year
# bytes alone are correctly ordered ascending.
assert encode_int32_asc(1991) < encode_int32_asc(1992)
assert encode_int32_asc(-5) < encode_int32_asc(0) < encode_int32_asc(5)


# ---------------------------------------------------------------------------
# 6. IEEE 754 float order-preserving transform (stereopsis.com's "Radix
#    Tricks"): always flip the sign bit; if the sign bit was set, flip every
#    other bit too.
# ---------------------------------------------------------------------------

def float_flip(f):
    (bits,) = struct.unpack('>I', struct.pack('>f', f))
    if bits & 0x80000000:
        return (~bits) & 0xFFFFFFFF
    return bits ^ 0x80000000


FLOAT_SAMPLES = [-3.5, -0.001, 0.0, 0.001, 3.5, 100.25, -100.25]
flipped = {f: float_flip(f) for f in FLOAT_SAMPLES}
ordered_by_value = sorted(FLOAT_SAMPLES)
ordered_by_flip = sorted(FLOAT_SAMPLES, key=lambda f: flipped[f])
assert ordered_by_value == ordered_by_flip
assert flipped[-3.5] < flipped[0.0] < flipped[3.5]


# ---------------------------------------------------------------------------
# 7. The Theta(n w / log n) crossover: a measured comparison between LSD
#    radix sort's key-moves and a comparison sort's comparisons, on random
#    32-bit keys with 8-bit digits (4 passes) against a comparison sort's
#    roughly n lg n comparisons.
# ---------------------------------------------------------------------------

def count_comparisons_mergesort(arr):
    counters = {"cmp": 0}

    def merge_sort(a):
        if len(a) <= 1:
            return a
        mid = len(a) // 2
        left = merge_sort(a[:mid])
        right = merge_sort(a[mid:])
        out = []
        i = j = 0
        while i < len(left) and j < len(right):
            counters["cmp"] += 1
            if left[i] <= right[j]:
                out.append(left[i]); i += 1
            else:
                out.append(right[j]); j += 1
        out.extend(left[i:]); out.extend(right[j:])
        return out

    merge_sort(list(arr))
    return counters["cmp"]


random.seed(53)
N_CROSSOVER = 50_000
random_keys = [random.randrange(0, 2 ** 32) for _ in range(N_CROSSOVER)]
_, radix_passes, radix_moves_per_pass = lsd_radix_sort(random_keys, 256, 4)
radix_total_moves = sum(radix_moves_per_pass)
assert radix_passes == 4
assert radix_total_moves == 4 * N_CROSSOVER  # every pass touches every key once

comparison_count = count_comparisons_mergesort(random_keys)
assert comparison_count == 718346  # exact, on this topic's own seed
assert radix_total_moves == 200000  # exact: 4 passes * 50,000 keys
assert comparison_count < N_CROSSOVER * math.log2(N_CROSSOVER)  # under the n lg n bound
# Radix's own move count is a small constant times n; the comparison sort's
# is n log n. At this n, radix moves fewer total "touches" than comparisons:
assert radix_total_moves < comparison_count

# Already-sorted input: radix sort still makes all 4 passes and n moves each
# (it does not adapt to order); a comparison sort's cost on sorted input
# depends on the algorithm (merge sort does not adapt either, by contrast
# with topic 52's Timsort, which does).
sorted_keys = sorted(random_keys)
_, _, sorted_radix_moves = lsd_radix_sort(sorted_keys, 256, 4)
assert sum(sorted_radix_moves) == 4 * N_CROSSOVER  # unchanged: radix is not adaptive


# ---------------------------------------------------------------------------
# 8. Bucket sort: n keys drawn uniformly from [0, 1) into n buckets, each
#    sorted by insertion sort. Expected: about e^-1 of the buckets empty.
# ---------------------------------------------------------------------------

random.seed(53)
N_BUCKETS = 100_000
uniform_keys = [random.random() for _ in range(N_BUCKETS)]
buckets = [[] for _ in range(N_BUCKETS)]
for x in uniform_keys:
    idx = min(int(x * N_BUCKETS), N_BUCKETS - 1)
    buckets[idx].append(x)
for b in buckets:
    insertion_sort(b)
largest_bucket = max(len(b) for b in buckets)
empty_fraction = sum(1 for b in buckets if len(b) == 0) / N_BUCKETS
e_inv = math.exp(-1)
assert abs(empty_fraction - e_inv) < 0.01
assert round(empty_fraction * 100, 1) == 36.7
assert round(e_inv * 100, 1) == 36.8
assert largest_bucket <= 12  # a small constant, not growing with n
# Confirm the whole thing is actually sorted when buckets are concatenated.
bucket_sorted = [x for b in buckets for x in b]
assert bucket_sorted == sorted(uniform_keys)

# Skewed input: almost everything in one bucket, so bucket sort falls back
# to its inner sort's cost on a near-full-size array.
zipf_keys = [0.5 + random.random() * 1e-6 for _ in range(N_BUCKETS)]  # clustered
zipf_buckets = [[] for _ in range(N_BUCKETS)]
for x in zipf_keys:
    idx = min(int(x * N_BUCKETS), N_BUCKETS - 1)
    zipf_buckets[idx].append(x)
zipf_largest = max(len(b) for b in zipf_buckets)
assert zipf_largest > N_BUCKETS // 2  # most keys land in a handful of buckets


print(f"Counting sort: {deck_moves} moves on {len(DECK)} keys; stability confirmed (fives: {fives})")
print(f"LSD radix sort: {lsd_passes} passes, {sum(lsd_moves)} total moves on {len(LSD_DECK)} keys")
print(f"32-bit key, 8-bit digits: {RADIX_PASSES_32BIT_8BIT_DIGITS} passes, vs {COMPARISON_LEVELS_AT_1M} comparison levels at n=1,000,000")
print(f"American flag sort: {af_swaps} cycle-leader swaps; unstable confirmed (pile 0 order changed: {AF_UNSTABLE})")
print(f"DuckDB byte encoding: byte order {byte_order} matches the post's own row order")
print(f"IEEE 754 float flip: order-preserving confirmed on {len(FLOAT_SAMPLES)} samples")
print(f"Crossover at n={N_CROSSOVER:,}: radix {radix_total_moves:,} moves vs mergesort {comparison_count:,} comparisons")
print(f"Bucket sort at n={N_BUCKETS:,}: largest bucket {largest_bucket}, {empty_fraction:.3f} empty (e^-1 = {e_inv:.3f})")
print(f"Skewed bucket sort: largest bucket {zipf_largest:,} of {N_BUCKETS:,} keys")
