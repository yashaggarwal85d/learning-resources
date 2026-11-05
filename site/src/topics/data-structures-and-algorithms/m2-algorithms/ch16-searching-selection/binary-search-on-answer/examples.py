"""
dsa.binary-search-on-answer -- every number this topic puts on screen, computed or
asserted here. A feasibility predicate (minimum truck capacity to ship a fixed set of
packages in a fixed number of trips) binary-searched over the answer space; a
non-monotone predicate shown to give a wrong boundary, not just a slow one; real-valued
bisection and its exact iteration count; the doubling-precision-costs-one-more-iteration
fact, checked directly.
"""

import math


# ---------------------------------------------------------------------------
# 1. Binary search on the answer: minimum truck capacity for a fixed number of trips.
# ---------------------------------------------------------------------------

WEIGHTS = [7, 2, 5, 10, 8]
TRIPS = 2


def groups_needed(weights, capacity):
    """Greedy: pack weights into consecutive groups, starting a new group only when the
    current one would exceed capacity. The count of groups this needs is monotone
    non-increasing in capacity -- more room never forces more groups."""
    if capacity < max(weights):
        return math.inf  # no single weight even fits: infeasible at any group count
    groups = 1
    current = 0
    for w in weights:
        if current + w > capacity:
            groups += 1
            current = 0
        current += w
    return groups


def feasible(weights, trips, capacity):
    """The monotone predicate: can these weights ship in at most `trips` groups at this
    capacity? False for every capacity below the answer, true for every capacity at or
    above it -- the precondition binary search on the answer depends on."""
    return groups_needed(weights, capacity) <= trips


def min_capacity_for_trips(weights, trips):
    """Binary search over the answer space (candidate capacities), using `feasible` as
    the monotone predicate -- the identical half-open loop from topic 55, with the
    predicate swapped out for a feasibility check instead of an array lookup."""
    lo, hi = max(weights), sum(weights)  # [lo, hi]: lo is the smallest capacity that
    # could ever work, hi is one trip's worth (always feasible)
    iterations = 0
    while lo < hi:
        iterations += 1
        mid = lo + (hi - lo) // 2
        if feasible(weights, trips, mid):
            hi = mid
        else:
            lo = mid + 1
    return lo, iterations


# The predicate really is monotone on this input: every capacity from the maximum
# weight up to the total is checked directly, confirming no false-then-true-then-false
# pattern exists before trusting binary search on it.
monotone_confirmed = True
prev = False
for c in range(max(WEIGHTS), sum(WEIGHTS) + 1):
    cur = feasible(WEIGHTS, TRIPS, c)
    if prev and not cur:
        monotone_confirmed = False
    prev = cur
assert monotone_confirmed

answer, search_iterations = min_capacity_for_trips(WEIGHTS, TRIPS)
assert answer == 18  # the classic result for this exact input: [7,2,5,10,8] in 2 trips
# Confirmed independently by brute force over every candidate capacity, not just by the
# search that found it:
brute_answer = min(c for c in range(max(WEIGHTS), sum(WEIGHTS) + 1) if feasible(WEIGHTS, TRIPS, c))
assert brute_answer == answer == 18


# ---------------------------------------------------------------------------
# 2. A non-monotone predicate gives a wrong boundary, not a slow search.
# ---------------------------------------------------------------------------

def lower_bound_predicate(n, predicate):
    """The identical half-open loop, over integer indices 0..n, assuming (possibly
    wrongly) that `predicate` is monotone: false, false, ..., false, true, true, ...,
    true. Returns what the loop believes is the first true index."""
    lo, hi = 0, n
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


# A genuinely non-monotone predicate: true, false, true, true, false -- it flips more
# than once, so "the first true index" is not even well defined by a single boundary.
NON_MONOTONE = [True, False, True, True, False]
search_result = lower_bound_predicate(len(NON_MONOTONE), lambda i: NON_MONOTONE[i])
true_indices = [i for i, v in enumerate(NON_MONOTONE) if v]
# The search returns index 2 (mid=2 is True, so it searches left; mid=1 is False, so it
# moves right to 2, where it stops) -- but the array has three true positions (0, 2, 3),
# not one boundary, and the search never even looks at index 0, the first true position.
assert search_result == 2
assert true_indices == [0, 2, 3]
assert search_result != true_indices[0]  # the search missed the actual first true index
# The real content of the bug: the search found *a* true position, but a monotone
# predicate never has a False after a True; this one does (True at 0, False at 1).
assert NON_MONOTONE[0] and not NON_MONOTONE[1]  # a True immediately followed by a False
# -- proof the predicate is not monotone, so "the boundary" the search reports is not
# the single boundary the algorithm's own correctness proof assumes exists.


# ---------------------------------------------------------------------------
# 3. Real-valued bisection: a precision bound instead of lo == hi, and its exact count.
# ---------------------------------------------------------------------------

def bisect_sqrt(target, lo, hi, eps):
    """Bisection for sqrt(target) over a real-valued half-open-in-spirit range, stopped
    by a precision bound instead of an integer lo == hi (no 'next' real number to reach
    exactly)."""
    iterations = 0
    while hi - lo > eps:
        iterations += 1
        mid = (lo + hi) / 2  # a real-valued midpoint has no integer-overflow analogue:
        # low and high are both small, bounded reals here, not array indices
        if mid * mid < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2, iterations


def iterations_for_precision(span, eps):
    """The iteration count to narrow a real-valued range of width `span` down to a
    precision of `eps`: ceil(lg(span / eps)), independent of what the predicate itself
    computes."""
    return math.ceil(math.log2(span / eps))


EPS = 1e-6
sqrt2_approx, sqrt2_iters = bisect_sqrt(2.0, 1.0, 2.0, EPS)
assert abs(sqrt2_approx - math.sqrt(2)) < EPS
assert sqrt2_iters == iterations_for_precision(1.0, EPS)
assert sqrt2_iters == 20  # ceil(lg(1 / 1e-6)) = ceil(lg(1,000,000)) = 20

# Doubling the required precision (halving eps) costs exactly one more iteration, not
# twice the work -- checked directly, not assumed from the formula alone.
_, iters_at_eps = bisect_sqrt(2.0, 1.0, 2.0, EPS)
_, iters_at_half_eps = bisect_sqrt(2.0, 1.0, 2.0, EPS / 2)
assert iters_at_half_eps == iters_at_eps + 1

# The same relationship holds across several precisions, not just one pair:
for test_eps in (1e-2, 1e-3, 1e-4, 1e-5):
    _, a = bisect_sqrt(2.0, 1.0, 2.0, test_eps)
    _, b = bisect_sqrt(2.0, 1.0, 2.0, test_eps / 2)
    assert b == a + 1, (test_eps, a, b)


if __name__ == "__main__":
    print(f"Minimum capacity for {WEIGHTS} in {TRIPS} trips: {answer} ({search_iterations} iterations)")
    print(f"Non-monotone predicate: search returns index {search_result}, true indices are {true_indices}")
    print(f"sqrt(2) by bisection to precision {EPS}: {sqrt2_approx:.6f} in {sqrt2_iters} iterations")
    print(f"Halving epsilon costs exactly one more iteration: {iters_at_eps} -> {iters_at_half_eps}")
    print("binary-search-on-answer examples: all checks passed")
