"""
dsa.interval-merging-scheduling — every number this reel shows, computed and asserted here.
Intervals are half-open [start, end); a "booking" is (start, end, weight).
"""
import heapq
import bisect

# ---------------------------------------------------------------------------
# The running example: ten bookings, minutes from 08:00, with weights.
# ---------------------------------------------------------------------------
BOOKINGS = [
    (75, 120, 5),
    (210, 270, 4),
    (345, 495, 6),
    (480, 660, 5),
    (255, 300, 1),
    (435, 615, 3),
    (180, 210, 5),
    (120, 300, 8),
    (90, 120, 6),
    (270, 330, 8),
]


def overlaps(a, b):
    """Half-open overlap predicate: s1 < e2 and s2 < e1."""
    s1, e1 = a[0], a[1]
    s2, e2 = b[0], b[1]
    return s1 < e2 and s2 < e1


def greedy_by_key(bookings, key):
    """Take each booking in `key` order, keeping it if compatible with every kept one so far."""
    kept = []
    for b in sorted(bookings, key=key):
        if all(not overlaps(b, k) for k in kept):
            kept.append(b)
    return kept


earliest_finish = greedy_by_key(BOOKINGS, key=lambda b: b[1])
earliest_start = greedy_by_key(BOOKINGS, key=lambda b: b[0])
shortest_first = greedy_by_key(BOOKINGS, key=lambda b: b[1] - b[0])

assert sorted(earliest_finish) == sorted([(75, 120, 5), (180, 210, 5), (210, 270, 4), (270, 330, 8), (345, 495, 6)])
assert len(earliest_finish) == 5
assert len(earliest_start) == 3
assert len(shortest_first) == 4

# ---------------------------------------------------------------------------
# Fewest-conflicts-first trap: a separate eight-interval set.
# Each interval's conflict count is taken up front (counted once, never updated as picks happen).
# ---------------------------------------------------------------------------
EIGHT = [(2, 7), (3, 5), (3, 7), (6, 8), (7, 10), (8, 11), (10, 12), (11, 14)]


def fewest_conflicts_first(intervals):
    conflict_count = {
        i: sum(1 for j in intervals if j != i and overlaps(i, j))
        for i in intervals
    }
    kept = []
    for iv in sorted(intervals, key=lambda i: conflict_count[i]):
        if all(not overlaps(iv, k) for k in kept):
            kept.append(iv)
    return kept


def earliest_finish_pairs(intervals):
    kept = []
    for iv in sorted(intervals, key=lambda i: i[1]):
        if all(not overlaps(iv, k) for k in kept):
            kept.append(iv)
    return kept


fewest_conflicts_result = fewest_conflicts_first(EIGHT)
earliest_finish_on_eight = earliest_finish_pairs(EIGHT)
assert len(fewest_conflicts_result) == 3
assert len(earliest_finish_on_eight) == 4

# ---------------------------------------------------------------------------
# Merging intervals: sort by start, extend the current merged interval or start a new one.
# ---------------------------------------------------------------------------
TO_MERGE = [(30, 50), (5, 15), (40, 60), (65, 70), (10, 20), (62, 68)]


def merge_intervals(intervals):
    merged = []
    for s, e in sorted(intervals):
        if merged and s < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


MERGED = merge_intervals(TO_MERGE)
assert MERGED == [(5, 20), (30, 60), (62, 70)]
assert len(MERGED) == 3

# ---------------------------------------------------------------------------
# Insertion into an already-merged, sorted list.
# ---------------------------------------------------------------------------
def insert_into_merged(merged, new_iv):
    s, e = new_iv
    result = []
    i = 0
    n = len(merged)
    while i < n and merged[i][1] < s:
        result.append(merged[i])
        i += 1
    lo, hi = s, e
    while i < n and merged[i][0] <= hi:
        lo = min(lo, merged[i][0])
        hi = max(hi, merged[i][1])
        i += 1
    result.append((lo, hi))
    result.extend(merged[i:])
    return result


INSERTED = insert_into_merged(MERGED, (18, 35))
assert INSERTED == [(5, 60), (62, 70)]
assert len(INSERTED) == 2

# ---------------------------------------------------------------------------
# Minimum rooms via a min-heap of end times (interval partitioning).
# ---------------------------------------------------------------------------
def min_rooms_heap(bookings):
    heap = []  # min-heap of end times of rooms in use
    peak = 0
    for s, e, _w in sorted(bookings, key=lambda b: b[0]):
        if heap and heap[0] <= s:
            heapq.heapreplace(heap, e)
        else:
            heapq.heappush(heap, e)
        peak = max(peak, len(heap))
    return peak


def min_rooms_sweep(bookings):
    """The simpler +1/-1 walk over sorted endpoints, as a sanity check on the heap's answer."""
    events = []
    for s, e, _w in bookings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort(key=lambda ev: (ev[0], ev[1]))  # an end (-1) at a shared coordinate before a start (+1)
    running = 0
    peak = 0
    for _coord, delta in events:
        running += delta
        peak = max(peak, running)
    return peak


ROOMS_HEAP = min_rooms_heap(BOOKINGS)
ROOMS_SWEEP = min_rooms_sweep(BOOKINGS)
assert ROOMS_HEAP == 3
assert ROOMS_SWEEP == 3
assert ROOMS_HEAP == ROOMS_SWEEP

# ---------------------------------------------------------------------------
# Weighted interval scheduling by DP.
# ---------------------------------------------------------------------------
def weighted_interval_scheduling(bookings):
    jobs = sorted(bookings, key=lambda b: b[1])  # sort by finish time
    n = len(jobs)
    finishes = [j[1] for j in jobs]

    def p(j):
        # largest index i < j (0-based: i in [0, j-1]) such that job i's end <= job j's start
        target = jobs[j][0]
        # binary search over finishes[0..j-1] for the rightmost finish <= target
        idx = bisect.bisect_right(finishes, target, 0, j) - 1
        return idx  # -1 means none

    OPT = [0] * (n + 1)  # OPT[0] = 0 (base case); OPT[j] uses jobs[0..j-1]
    for j in range(1, n + 1):
        w_j = jobs[j - 1][2]
        pj = p(j - 1)  # predecessor of jobs[j-1], 0-based index into jobs, -1 if none
        take = w_j + OPT[pj + 1]
        skip = OPT[j - 1]
        OPT[j] = max(skip, take)

    # Reconstruct the chosen set by walking back.
    chosen = []
    j = n
    while j > 0:
        w_j = jobs[j - 1][2]
        pj = p(j - 1)
        take = w_j + OPT[pj + 1]
        if take >= OPT[j - 1] and take == OPT[j]:
            chosen.append(jobs[j - 1])
            j = pj + 1
        else:
            j -= 1
    chosen.reverse()
    return OPT[n], chosen


WEIGHTED_OPTIMUM, WEIGHTED_SET = weighted_interval_scheduling(BOOKINGS)
GREEDY_SET_WEIGHT = sum(b[2] for b in earliest_finish)
assert GREEDY_SET_WEIGHT == 28
assert WEIGHTED_OPTIMUM == 29
assert WEIGHTED_OPTIMUM > GREEDY_SET_WEIGHT
assert sum(b[2] for b in WEIGHTED_SET) == 29

# ---------------------------------------------------------------------------
# Exchange-argument sanity check: swapping the optimal's first pick for the greedy
# pick never shrinks a schedule, on a small synthetic case.
# ---------------------------------------------------------------------------
SYNTHETIC = [(0, 4), (1, 5), (4, 7), (6, 9), (8, 10)]
GREEDY_SYNTHETIC = earliest_finish_pairs(SYNTHETIC)
# A different maximal compatible set that does NOT start with the greedy's first choice.
ALTERNATE_SYNTHETIC = [(1, 5), (6, 9)]
assert all(not overlaps(a, b) for i, a in enumerate(ALTERNATE_SYNTHETIC) for b in ALTERNATE_SYNTHETIC[i + 1:])
# The exchange: replace the alternate's first interval with the greedy's first (earliest-finishing) choice.
SWAPPED = [GREEDY_SYNTHETIC[0]] + [iv for iv in ALTERNATE_SYNTHETIC if iv[0] >= GREEDY_SYNTHETIC[0][1]]
assert all(not overlaps(a, b) for i, a in enumerate(SWAPPED) for b in SWAPPED[i + 1:])
assert len(SWAPPED) >= len(ALTERNATE_SYNTHETIC)
assert len(GREEDY_SYNTHETIC) == 3

if __name__ == "__main__":
    print("earliest_finish:", earliest_finish, "count =", len(earliest_finish))
    print("earliest_start:", earliest_start, "count =", len(earliest_start))
    print("shortest_first:", shortest_first, "count =", len(shortest_first))
    print("fewest_conflicts (8-interval set):", fewest_conflicts_result, "count =", len(fewest_conflicts_result))
    print("earliest_finish (8-interval set):", earliest_finish_on_eight, "count =", len(earliest_finish_on_eight))
    print("merged:", MERGED)
    print("inserted:", INSERTED)
    print("rooms (heap):", ROOMS_HEAP, " rooms (sweep):", ROOMS_SWEEP)
    print("weighted optimum:", WEIGHTED_OPTIMUM, " greedy set weight:", GREEDY_SET_WEIGHT)
    print("weighted set:", WEIGHTED_SET)
    print("all assertions passed")
