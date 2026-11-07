"""dsa.pseudo-polynomial-time-strong — worked examples.

Knapsack's O(nW) dynamic program is pseudo-polynomial: polynomial in the
*value* W, exponential in the *length* b = ceil(log2 W) of W written in
binary. Bin packing has no such escape (it is strongly NP-hard), shown here
by the number of bins K fixing the table instead: the table is
pseudo-polynomial in K, but K is not an input number, it is a count of
dimensions, and 3-partition (the problem bin packing reduces from) stays
hard even with every number small.
"""

import itertools
import math
import random
import time


# --- 1. The knapsack O(nW) dynamic program -------------------------------

def knapsack_max_value(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    for i in range(n):
        w, v = weights[i], values[i]
        for c in range(capacity, w - 1, -1):
            cand = dp[c - w] + v
            if cand > dp[c]:
                dp[c] = cand
    return dp[capacity]


def knapsack_cell_count(n, capacity):
    return n * (capacity + 1)


# --- 2. Cell count against the bit length of the capacity ----------------

N_ITEMS = 100


def cells_at_bits(n, b):
    capacity = 2 ** b
    return n * capacity


cells_10 = cells_at_bits(N_ITEMS, 10)
cells_20 = cells_at_bits(N_ITEMS, 20)
cells_40 = cells_at_bits(N_ITEMS, 40)

assert cells_10 == 102_400
assert cells_20 == 104_857_600
assert cells_40 == 109_951_162_777_600

assert abs(cells_10 / 1.024e5 - 1) < 1e-9
assert abs(cells_20 / 1.048576e8 - 1) < 1e-9
assert abs(cells_40 / 1.099511627776e14 - 1) < 1e-9


# --- 3. The DP actually runs, and its time roughly doubles per bit -------

def timed_knapsack(n, b, seed=0):
    rng = random.Random(seed)
    capacity = 2 ** b
    weights = [rng.randint(1, capacity) for _ in range(n)]
    values = [rng.randint(1, 1000) for _ in range(n)]
    start = time.perf_counter()
    knapsack_max_value(weights, values, capacity)
    return time.perf_counter() - start


SMALL_N = 20
times_by_bit = {}
for bit in (12, 13, 14, 15, 16, 17):
    times_by_bit[bit] = timed_knapsack(SMALL_N, bit, seed=bit)

ratios = []
bits_sorted = sorted(times_by_bit)
for a, b in zip(bits_sorted, bits_sorted[1:]):
    if times_by_bit[a] > 0:
        ratios.append(times_by_bit[b] / times_by_bit[a])

avg_ratio = sum(ratios) / len(ratios)
assert 1.2 < avg_ratio < 4.0, f"expected roughly-doubling growth, got avg ratio {avg_ratio:.2f}"


# --- 4. A small, correct knapsack instance, checked by brute force -------

def brute_force_knapsack(weights, values, capacity):
    n = len(weights)
    best = 0
    for mask in range(1 << n):
        total_w = total_v = 0
        for i in range(n):
            if mask & (1 << i):
                total_w += weights[i]
                total_v += values[i]
        if total_w <= capacity and total_v > best:
            best = total_v
    return best


rng = random.Random(1)
for _ in range(20):
    k = rng.randint(1, 10)
    ws = [rng.randint(1, 20) for _ in range(k)]
    vs = [rng.randint(1, 20) for _ in range(k)]
    cap = rng.randint(1, 40)
    assert knapsack_max_value(ws, vs, cap) == brute_force_knapsack(ws, vs, cap)


# --- 5. Unary length against binary length --------------------------------

def binary_length_bits(value):
    return value.bit_length()


def unary_length(value):
    return value


UNARY_W = 10 ** 6
assert binary_length_bits(UNARY_W) == 20
assert unary_length(UNARY_W) == 1_000_000
assert unary_length(UNARY_W) > 1000 * binary_length_bits(UNARY_W)


# --- 6. Three-partition: small numbers, still explodes with m ------------

def three_partition_brute_force(multiset):
    n = len(multiset)
    assert n % 3 == 0
    m = n // 3
    total = sum(multiset)
    if total % m != 0:
        return False, 0
    target = total // m

    items = list(multiset)
    used = [False] * n
    calls = [0]

    def backtrack(triples_left):
        calls[0] += 1
        if triples_left == 0:
            return True
        first_free = next(i for i in range(n) if not used[i])
        used[first_free] = True
        for j in range(n):
            if used[j] or j == first_free:
                continue
            for k in range(n):
                if used[k] or k in (first_free, j):
                    continue
                if items[first_free] + items[j] + items[k] == target:
                    used[j] = used[k] = True
                    if backtrack(triples_left - 1):
                        return True
                    used[j] = used[k] = False
        used[first_free] = False
        return False

    found = backtrack(m)
    return found, calls[0]


def random_three_partition_instance(m, low, high, seed, target=None):
    rng = random.Random(seed)
    if target is None:
        target = 3 * (low + high) // 2
    flat = []
    for _ in range(m):
        a = rng.randint(low, high)
        b_low = max(low, target - a - high)
        b_high = min(high, target - a - low)
        b = rng.randint(b_low, b_high)
        c = target - a - b
        flat.extend([a, b, c])
    rng.shuffle(flat)
    return flat


call_counts = []
elapsed_times = []
for m in (2, 3, 4, 5, 6):
    instance = random_three_partition_instance(m, low=1, high=30, seed=100 + m)
    start = time.perf_counter()
    found, calls = three_partition_brute_force(instance)
    elapsed = time.perf_counter() - start
    assert found
    call_counts.append(calls)
    elapsed_times.append(elapsed)

assert call_counts[-1] > call_counts[0] * 5, f"expected call count to grow sharply with m, got {call_counts}"

assert max(random_three_partition_instance(5, 1, 9, 5)) < 10


# --- 7. Bin packing with K bins fixed: pseudo-polynomial in K -------------

def bin_packing_k_fixed_feasible(sizes, capacity, k):
    n = len(sizes)
    loads_seen = set()
    loads_seen.add((0,) * k)

    def backtrack(i, loads):
        if i == n:
            return True
        for b in range(k):
            if loads[b] + sizes[i] <= capacity:
                new_loads = list(loads)
                new_loads[b] += sizes[i]
                new_loads = tuple(sorted(new_loads))
                if new_loads in loads_seen:
                    continue
                loads_seen.add(new_loads)
                if backtrack(i + 1, new_loads):
                    return True
        return False

    return backtrack(0, (0,) * k)


def bin_packing_table_size(capacity, k):
    return (capacity + 1) ** k


CAPACITY = 10
for k in (1, 2, 3):
    table_size = bin_packing_table_size(CAPACITY, k)
    assert table_size == (CAPACITY + 1) ** k

sizes = [4, 6, 3, 7, 2, 5]
assert bin_packing_k_fixed_feasible(sizes, capacity=10, k=3)
assert not bin_packing_k_fixed_feasible(sizes, capacity=10, k=1)

table_sizes_by_k = [bin_packing_table_size(CAPACITY, k) for k in (1, 2, 3, 4, 5)]
for earlier, later in zip(table_sizes_by_k, table_sizes_by_k[1:]):
    assert later == earlier * (CAPACITY + 1)


if __name__ == "__main__":
    print("knapsack cells at b=10,20,40 bits:", cells_10, cells_20, cells_40)
    print("timed knapsack by bit length:", times_by_bit)
    print("average time ratio per added bit:", round(avg_ratio, 2))
    print("3-partition backtracking call counts by m:", call_counts)
    print("bin packing table size by K (capacity=10):", table_sizes_by_k)
    print("All assertions passed.")
