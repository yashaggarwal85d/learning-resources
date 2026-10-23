"""Binary heaps and heapify: sift-up/sift-down, the implicit array, and the real
O(n)-vs-O(n log n) build-cost gap, measured rather than assumed."""
import random


def parent(i):
    return (i - 1) // 2


def children(i):
    return 2 * i + 1, 2 * i + 2


class BinaryHeap:
    """A min-heap, array-backed, zero-indexed, no pointers at all."""

    def __init__(self):
        self.a = []
        self.swaps = 0

    def sift_up(self, i):
        while i > 0:
            p = parent(i)
            if self.a[p] <= self.a[i]:
                break
            self.a[p], self.a[i] = self.a[i], self.a[p]
            self.swaps += 1
            i = p

    def sift_down(self, i):
        n = len(self.a)
        while True:
            left, right = children(i)
            smallest = i
            if left < n and self.a[left] < self.a[smallest]:
                smallest = left
            if right < n and self.a[right] < self.a[smallest]:
                smallest = right
            if smallest == i:
                break
            self.a[i], self.a[smallest] = self.a[smallest], self.a[i]
            self.swaps += 1
            i = smallest

    def push(self, value):
        self.a.append(value)
        self.sift_up(len(self.a) - 1)

    def pop_min(self):
        root = self.a[0]
        last = self.a.pop()
        if self.a:
            self.a[0] = last
            self.sift_down(0)
        return root

    def is_valid(self):
        n = len(self.a)
        for i in range(n):
            left, right = children(i)
            if left < n and self.a[left] < self.a[i]:
                return False
            if right < n and self.a[right] < self.a[i]:
                return False
        return True


# ---------------------------------------------------------------------------
# 1 & 5. Sift-up never touches more than one root-ward path: its swap count
#        for a single insertion can never exceed the tree's own height.
# ---------------------------------------------------------------------------

h = BinaryHeap()
rnd = random.Random(20261024)
for _ in range(50):
    before_swaps = h.swaps
    h.push(rnd.randrange(10_000))
    swaps_this_insert = h.swaps - before_swaps
    height = (len(h.a) - 1).bit_length()
    assert swaps_this_insert <= height, "a single sift-up must not exceed the tree's own height"
assert h.is_valid()

# ---------------------------------------------------------------------------
# 2, 3 & 4. Build the identical n elements two ways: one insertion at a time
#    (O(n log n)) versus a bottom-up sift-down build (O(n)). Count real swaps.
#
# Random input undersells the gap: for a random permutation, the expected
# sift-up cost per insertion is close to constant (most new values land near
# the bottom and barely move), so one-at-a-time's measured total stays close
# to linear too. Decreasing order is the adversarial case for a min-heap:
# every insertion is a brand-new minimum, so it swims the full root-ward path
# every single time, actually hitting the n*log2(n) bound.
# ---------------------------------------------------------------------------

N = 4000
values = list(range(N, 0, -1))

one_at_a_time = BinaryHeap()
for v in values:
    one_at_a_time.push(v)
one_at_a_time_swaps = one_at_a_time.swaps
assert one_at_a_time.is_valid()

bottom_up = BinaryHeap()
bottom_up.a = list(values)
for i in range(len(bottom_up.a) // 2 - 1, -1, -1):
    bottom_up.sift_down(i)
bottom_up_swaps = bottom_up.swaps
assert bottom_up.is_valid()

print(f"Build swap counts on the identical {N} elements (decreasing order, the adversarial case):")
print(f"  one-at-a-time insertion: {one_at_a_time_swaps} swaps")
print(f"  bottom-up sift-down:     {bottom_up_swaps} swaps")
print(f"  ratio (one-at-a-time / bottom-up): {one_at_a_time_swaps / bottom_up_swaps:.2f}x")

assert bottom_up_swaps < one_at_a_time_swaps, "bottom-up build must cost fewer swaps than one-at-a-time insertion"

# The bottom-up build's swap count must stay within a small constant factor
# of n (O(n)); the one-at-a-time build's must grow well past that, toward
# its own n*log2(n) bound.
import math
log2n = math.log2(N)
assert bottom_up_swaps < 2 * N, "bottom-up build must be within a small constant factor of n, not n log n"
assert one_at_a_time_swaps > 8 * N, "one-at-a-time insertion must cost well more than a small constant factor of n"

# ---------------------------------------------------------------------------
# 6. Sanity-check extraction too: popping every element off either heap
#    must return them in fully sorted order (the heap property, honored at
#    every step, suffices for this).
# ---------------------------------------------------------------------------

extracted = []
while bottom_up.a:
    extracted.append(bottom_up.pop_min())
assert extracted == sorted(values), "repeated pop_min must yield the fully sorted order"

print()
print("All checks passed.")
