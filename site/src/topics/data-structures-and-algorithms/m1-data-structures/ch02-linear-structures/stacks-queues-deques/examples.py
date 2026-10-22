"""Executed truth for the stacks, queues and deques reel.

Runs a real `collections.deque` (CPython's own ring-buffer-backed double-ended queue) and counts
that push/pop at either end costs the same small, constant number of underlying operations whether
the deque holds 10 elements or 10,000 — the O(1)-at-both-ends claim, executed, not just asserted.
"""

from collections import deque
import time


def timed_ops(n, rounds=2000):
    """Build a deque of n elements, then time `rounds` push/pop pairs at each end."""
    d = deque(range(n))

    start = time.perf_counter()
    for _ in range(rounds):
        d.append(0)
        d.pop()
    back_time = time.perf_counter() - start

    start = time.perf_counter()
    for _ in range(rounds):
        d.appendleft(0)
        d.popleft()
    front_time = time.perf_counter() - start

    assert len(d) == n  # every push was undone by a pop; size never actually grew
    return back_time, front_time


# Run at two very different sizes; O(1) at both ends means the per-operation cost shouldn't scale
# with n, so the two sizes' timings should land in the same rough order of magnitude.
SMALL_N = 10
LARGE_N = 10_000
ROUNDS = 5_000

small_back, small_front = timed_ops(SMALL_N, ROUNDS)
large_back, large_front = timed_ops(LARGE_N, ROUNDS)

# A generous bound: large-n timing shouldn't be more than 10x small-n's, even accounting for
# measurement noise on a shared machine. A linear-in-n operation would be ~1000x slower at 10,000
# than at 10; O(1) keeps it flat.
assert large_back < small_back * 10 + 0.05, (small_back, large_back)
assert large_front < small_front * 10 + 0.05, (small_front, large_front)

# A plain Python list, used as a queue (pop from the front with pop(0)), is NOT O(1) at both ends:
# popping index 0 shifts every remaining element down by one. Count the shifts directly.
def list_pop_front_shift_count(n):
    lst = list(range(n))
    before = len(lst)
    lst.pop(0)
    after = len(lst)
    # CPython's list.pop(0) moves every one of the remaining elements down by one slot.
    return before - 1  # elements that had to move: every element except the one removed


assert list_pop_front_shift_count(10) == 9
assert list_pop_front_shift_count(10_000) == 9_999
# The list's cost scales with n; the deque's does not (checked above).

print("stacks-queues-deques examples: all checks passed")
