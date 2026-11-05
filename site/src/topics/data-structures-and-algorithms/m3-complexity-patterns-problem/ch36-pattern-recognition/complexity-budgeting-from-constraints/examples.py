import heapq
import math
import random
import time
from itertools import combinations

# --- The rule of thumb and the budget table (Laaksonen, "Estimating efficiency") ---
# "a modern computer can perform some hundreds of millions of operations in a second"
OPS_PER_SECOND = 10**8

FACTORIAL_AT_10 = math.factorial(10)
assert FACTORIAL_AT_10 == 3_628_800

POW2_AT_20 = 2**20
assert POW2_AT_20 == 1_048_576

CUBE_AT_500 = 500**3
assert CUBE_AT_500 == 125_000_000

SQUARE_AT_5000 = 5000**2
assert SQUARE_AT_5000 == 25_000_000

NLOGN_AT_1E6 = round(10**6 * math.log2(10**6))
assert NLOGN_AT_1E6 == 19_931_569

# --- The worked arithmetic that makes the table fall out: n^2 at n=1e5 is too slow ---
N_COUNTER = 10**5
SQUARE_AT_1E5 = N_COUNTER**2
assert SQUARE_AT_1E5 == 10_000_000_000
SQUARE_AT_1E5_SECONDS = SQUARE_AT_1E5 / OPS_PER_SECOND
assert SQUARE_AT_1E5_SECONDS == 100.0

NLOGN_AT_1E5 = round(N_COUNTER * math.log2(N_COUNTER))
assert NLOGN_AT_1E5 == 1_660_964
NLOGN_AT_1E5_SECONDS = NLOGN_AT_1E5 / OPS_PER_SECOND
assert round(NLOGN_AT_1E5_SECONDS, 3) == 0.017

# --- The meet-in-the-middle exception: 2^40 at n=40 is too slow, but two halves of 2^20 fit ---
POW2_AT_40 = 2**40
assert POW2_AT_40 == 1_099_511_627_776
TWO_HALVES_OF_POW2_AT_20 = POW2_AT_20 * 2
assert TWO_HALVES_OF_POW2_AT_20 == 2_097_152

# --- Binary search on the answer: iteration count for the "minimum maximum" signal ---
RANGE_AT_1E9 = 10**9
ITERATIONS_FOR_RANGE_1E9 = math.ceil(math.log2(RANGE_AT_1E9))
assert ITERATIONS_FOR_RANGE_1E9 == 30
TOTAL_OPS_AT_1E5_RANGE_1E9 = N_COUNTER * ITERATIONS_FOR_RANGE_1E9
assert TOTAL_OPS_AT_1E5_RANGE_1E9 == 3_000_000

RANGE_AT_1E18 = 10**18
ITERATIONS_FOR_RANGE_1E18 = math.ceil(math.log2(RANGE_AT_1E18))
assert ITERATIONS_FOR_RANGE_1E18 == 60


# --- The budget broken: the same operation count run sequentially and with random access ---
def measure_sequential_vs_random(n, seed=7):
    arr = list(range(n))
    order = list(range(n))
    random.seed(seed)
    random.shuffle(order)

    t0 = time.perf_counter()
    total_seq = 0
    for i in range(n):
        total_seq += arr[i]
    seq_time = time.perf_counter() - t0

    t0 = time.perf_counter()
    total_rand = 0
    for i in order:
        total_rand += arr[i]
    rand_time = time.perf_counter() - t0

    assert total_seq == total_rand
    return seq_time, rand_time


MEASURE_N = 2_000_000
SEQUENTIAL_TIME, RANDOM_ACCESS_TIME = measure_sequential_vs_random(MEASURE_N)
# Same count of array reads, same machine, same instant: random access is reliably slower.
assert RANDOM_ACCESS_TIME > SEQUENTIAL_TIME
RANDOM_OVER_SEQUENTIAL_RATIO = RANDOM_ACCESS_TIME / SEQUENTIAL_TIME


# --- Signal word: "sorted" -> binary search, checked against a linear scan ---
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def check_binary_search_against_linear_scan(trials=30, seed=5):
    random.seed(seed)
    for _ in range(trials):
        n = random.randint(1, 30)
        arr = sorted(random.sample(range(-100, 100), n))
        target = random.choice(arr + [random.randint(-150, 150)])
        found_by_search = binary_search(arr, target) != -1
        found_by_scan = target in arr
        assert found_by_search == found_by_scan
    return trials


SORTED_SIGNAL_TRIALS = check_binary_search_against_linear_scan()
assert SORTED_SIGNAL_TRIALS == 30


# --- Signal word: "k-th" -> a size-k heap, checked against sorting the whole array ---
def kth_smallest_by_heap(arr, k):
    return heapq.nsmallest(k, arr)[-1]


def check_kth_smallest(trials=20, seed=3):
    random.seed(seed)
    for _ in range(trials):
        n = random.randint(1, 30)
        arr = [random.randint(-50, 50) for _ in range(n)]
        k = random.randint(1, n)
        assert kth_smallest_by_heap(arr, k) == sorted(arr)[k - 1]
    return trials


KTH_SIGNAL_TRIALS = check_kth_smallest()
assert KTH_SIGNAL_TRIALS == 20


# --- Signal word: "all pairs" -> counting pairs by a fixed difference, brute force vs sort+two-pointer ---
def count_pairs_by_difference_bruteforce(arr, d):
    n = len(arr)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            if abs(arr[i] - arr[j]) == d:
                count += 1
    return count


def count_pairs_by_difference_two_pointer(arr, d):
    a = sorted(arr)
    n = len(a)
    count = 0
    j = 0
    for i in range(n):
        if j < i + 1:
            j = i + 1
        while j < n and a[j] - a[i] < d:
            j += 1
        k = j
        while k < n and a[k] - a[i] == d:
            count += 1
            k += 1
    return count


def check_all_pairs_signal(trials=20, seed=9):
    random.seed(seed)
    checked = 0
    for _ in range(trials):
        n = random.randint(1, 15)
        arr = [random.randint(0, 15) for _ in range(n)]
        d = random.randint(1, 10)
        assert count_pairs_by_difference_bruteforce(arr, d) == count_pairs_by_difference_two_pointer(arr, d)
        checked += 1
    return checked


ALL_PAIRS_SIGNAL_TRIALS = check_all_pairs_signal()
assert ALL_PAIRS_SIGNAL_TRIALS == 20


# --- Signal word: "minimum maximum" -> binary search on the answer, checked against brute force ---
def can_split_within_cap(arr, pieces_allowed, cap):
    pieces_used = 1
    running_sum = 0
    for x in arr:
        if x > cap:
            return False
        if running_sum + x > cap:
            pieces_used += 1
            running_sum = x
        else:
            running_sum += x
    return pieces_used <= pieces_allowed


def min_possible_maximum_binary_search(arr, pieces_allowed):
    lo, hi = max(arr), sum(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_split_within_cap(arr, pieces_allowed, mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


def min_possible_maximum_bruteforce(arr, pieces_allowed):
    n = len(arr)
    if pieces_allowed - 1 > n - 1:
        return max(arr)
    best = sum(arr)
    gaps = list(range(1, n))
    for cut_points in combinations(gaps, pieces_allowed - 1):
        bounds = (0,) + cut_points + (n,)
        worst_piece = 0
        for i in range(len(bounds) - 1):
            worst_piece = max(worst_piece, sum(arr[bounds[i]:bounds[i + 1]]))
        best = min(best, worst_piece)
    return best


def check_minimum_maximum_signal(trials=20, seed=11):
    random.seed(seed)
    for _ in range(trials):
        n = random.randint(1, 8)
        arr = [random.randint(1, 20) for _ in range(n)]
        pieces_allowed = random.randint(1, n)
        assert min_possible_maximum_binary_search(arr, pieces_allowed) == min_possible_maximum_bruteforce(arr, pieces_allowed)
    return trials


MINIMUM_MAXIMUM_SIGNAL_TRIALS = check_minimum_maximum_signal()
assert MINIMUM_MAXIMUM_SIGNAL_TRIALS == 20


if __name__ == "__main__":
    print("n! at n=10:", FACTORIAL_AT_10)
    print("2^n at n=20:", POW2_AT_20)
    print("n^3 at n=500:", CUBE_AT_500)
    print("n^2 at n=5000:", SQUARE_AT_5000)
    print("n log2 n at n=1e6:", NLOGN_AT_1E6)
    print("n^2 at n=1e5:", SQUARE_AT_1E5, f"({SQUARE_AT_1E5_SECONDS:.0f} s at 1e8 ops/s)")
    print("n log2 n at n=1e5:", NLOGN_AT_1E5, f"({NLOGN_AT_1E5_SECONDS:.3f} s)")
    print("2^40:", POW2_AT_40, "  two halves of 2^20:", TWO_HALVES_OF_POW2_AT_20)
    print("binary-search-on-answer iterations, range 1e9:", ITERATIONS_FOR_RANGE_1E9,
          "-> total ops at n=1e5:", TOTAL_OPS_AT_1E5_RANGE_1E9)
    print("binary-search-on-answer iterations, range 1e18:", ITERATIONS_FOR_RANGE_1E18)
    print(f"measured at n={MEASURE_N}: sequential {SEQUENTIAL_TIME:.3f}s, random-access "
          f"{RANDOM_ACCESS_TIME:.3f}s, ratio {RANDOM_OVER_SEQUENTIAL_RATIO:.2f}x")
    print("signal 'sorted' (binary search vs linear scan):", SORTED_SIGNAL_TRIALS, "trials matched")
    print("signal 'k-th' (heap vs sorted):", KTH_SIGNAL_TRIALS, "trials matched")
    print("signal 'all pairs' (two-pointer vs brute force):", ALL_PAIRS_SIGNAL_TRIALS, "trials matched")
    print("signal 'minimum maximum' (binary search on the answer vs brute force):",
          MINIMUM_MAXIMUM_SIGNAL_TRIALS, "trials matched")
