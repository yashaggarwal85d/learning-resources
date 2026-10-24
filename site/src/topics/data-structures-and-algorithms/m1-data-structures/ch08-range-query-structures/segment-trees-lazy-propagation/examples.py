"""Segment trees and lazy propagation (dsa.segment-trees-lazy-propagation):
real behaviour, every number asserted.

Running example (Chapter 8's own, continued from topic 33): the same fixed
array of per-minute event counts from the log, 15 minutes, queried and
updated by position, never by key. Topic 33 answered one aggregate (a
running sum) with one operator. This topic answers any associative
aggregate, over any range, including a range-wide update.
"""

import math

COUNTS = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4]
N = len(COUNTS)
assert N == 15


# ---------------------------------------------------------------------------
# 1. A recursive segment tree, generalized over any associative combine
#    function (not just sum).
# ---------------------------------------------------------------------------

class SegmentTree:
    """Recursive segment tree over n slots, 0-indexed ranges [l, r)."""

    def __init__(self, data, combine, identity):
        self.n = len(data)
        self.combine = combine
        self.identity = identity
        self.tree = [identity] * (4 * self.n)
        self._build(data, 1, 0, self.n)

    def _build(self, data, v, tl, tr):
        if tr - tl == 1:
            self.tree[v] = data[tl]
            return
        tm = (tl + tr) // 2
        self._build(data, 2 * v, tl, tm)
        self._build(data, 2 * v + 1, tm, tr)
        self.tree[v] = self.combine(self.tree[2 * v], self.tree[2 * v + 1])

    def query(self, l, r, v=1, tl=None, tr=None):
        """Combine over [l, r), 0-indexed, half-open."""
        if tl is None:
            tl, tr = 0, self.n
        if l >= r:
            return self.identity
        if l <= tl and tr <= r:
            return self.tree[v]
        tm = (tl + tr) // 2
        left = self.query(l, r, 2 * v, tl, tm) if l < tm else self.identity
        right = self.query(l, r, 2 * v + 1, tm, tr) if r > tm else self.identity
        return self.combine(left, right)

    def update(self, pos, value, v=1, tl=None, tr=None):
        """Point update: set data[pos] = value."""
        if tl is None:
            tl, tr = 0, self.n
        if tr - tl == 1:
            self.tree[v] = value
            return
        tm = (tl + tr) // 2
        if pos < tm:
            self.update(pos, value, 2 * v, tl, tm)
        else:
            self.update(pos, value, 2 * v + 1, tm, tr)
        self.tree[v] = self.combine(self.tree[2 * v], self.tree[2 * v + 1])


sum_tree = SegmentTree(COUNTS, lambda a, b: a + b, 0)
min_tree = SegmentTree(COUNTS, min, math.inf)

# Verify every range sum and range min against a direct scan.
for l in range(N):
    for r in range(l + 1, N + 1):
        assert sum_tree.query(l, r) == sum(COUNTS[l:r]), (l, r)
        assert min_tree.query(l, r) == min(COUNTS[l:r]), (l, r)

# The chapter's own running range: minutes 5 through 11 (0-indexed [5, 11)).
range_5_11_sum = sum_tree.query(5, 11)
range_5_11_min = min_tree.query(5, 11)
assert range_5_11_sum == sum(COUNTS[5:11]) == 29
assert range_5_11_min == min(COUNTS[5:11]) == 2

# A point update (minute 5's own count changes from 4 to 10), confirmed on
# both trees, then every range re-checked against a fresh direct scan.
UPDATED = list(COUNTS)
UPDATED[5] = 10
sum_tree.update(5, 10)
min_tree.update(5, 10)
for l in range(N):
    for r in range(l + 1, N + 1):
        assert sum_tree.query(l, r) == sum(UPDATED[l:r]), (l, r)
        assert min_tree.query(l, r) == min(UPDATED[l:r]), (l, r)

# Reset for the rest of the walkthrough.
sum_tree = SegmentTree(COUNTS, lambda a, b: a + b, 0)
min_tree = SegmentTree(COUNTS, min, math.inf)


# ---------------------------------------------------------------------------
# 2. The same tree, built bottom-up in a single flat array (no recursion,
#    no pointers): leaves at positions n..2n-1, each internal node at i
#    combining its children at 2i and 2i+1, climbing from the leaves up.
# ---------------------------------------------------------------------------

class IterativeMinTree:
    """Iterative, bottom-up segment tree, range minimum, 0-indexed [l, r)."""

    def __init__(self, data):
        self.n = len(data)
        self.tree = [math.inf] * (2 * self.n)
        for i in range(self.n):
            self.tree[self.n + i] = data[i]
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = min(self.tree[2 * i], self.tree[2 * i + 1])

    def update(self, pos, value):
        i = pos + self.n
        self.tree[i] = value
        i //= 2
        while i >= 1:
            self.tree[i] = min(self.tree[2 * i], self.tree[2 * i + 1])
            i //= 2

    def query(self, l, r):
        """Minimum over [l, r), 0-indexed, half-open."""
        l += self.n
        r += self.n
        result = math.inf
        while l < r:
            if l % 2 == 1:
                result = min(result, self.tree[l])
                l += 1
            if r % 2 == 1:
                r -= 1
                result = min(result, self.tree[r])
            l //= 2
            r //= 2
        return result


iterative_min_tree = IterativeMinTree(COUNTS)

# Both layouts must answer the identical query on the identical array: the
# recursive version and the bottom-up array version are the same structure,
# built two different ways, not two different structures.
for l in range(N):
    for r in range(l + 1, N + 1):
        assert iterative_min_tree.query(l, r) == min_tree.query(l, r), (l, r)

# A point update on the iterative tree, same minute-5 change as above,
# climbing from leaf to root instead of recursing from root to leaf.
jumps_climbed = []
pos = 5
i = pos + iterative_min_tree.n
iterative_min_tree.tree[i] = 10
i //= 2
while i >= 1:
    jumps_climbed.append(i)
    iterative_min_tree.tree[i] = min(
        iterative_min_tree.tree[2 * i], iterative_min_tree.tree[2 * i + 1]
    )
    i //= 2
assert jumps_climbed == [10, 5, 2, 1]
assert len(jumps_climbed) == math.floor(math.log2(N)) + 1 == 4
iterative_min_tree = IterativeMinTree(COUNTS)  # reset


# ---------------------------------------------------------------------------
# 3. Lazy propagation: a range-wide add, applied in O(log n) instead of
#    touching every position in the range.
# ---------------------------------------------------------------------------

class LazySumTree:
    """Recursive sum segment tree with lazy range-add and range-assign tags.

    Composability follows USACO Guide's own four-case rule for combining a
    pending tag with a new one (SOURCES.md): ADD-then-ADD sums the two
    amounts into one pending ADD; ADD-then-ASSIGN discards the pending add
    and replaces it with the assign ("a set update will override all
    previous add updates"); ASSIGN-then-ADD folds the add into the pending
    assign's own value (add the new value to lzSet); ASSIGN-then-ASSIGN
    replaces the value outright. All four are verified directly below.
    """

    NONE, ADD, SET = 0, 1, 2

    def __init__(self, data):
        self.n = len(data)
        self.tree = [0] * (4 * self.n)
        self.lazy_kind = [self.NONE] * (4 * self.n)
        self.lazy_val = [0] * (4 * self.n)
        self._build(data, 1, 0, self.n)

    def _build(self, data, v, tl, tr):
        if tr - tl == 1:
            self.tree[v] = data[tl]
            return
        tm = (tl + tr) // 2
        self._build(data, 2 * v, tl, tm)
        self._build(data, 2 * v + 1, tm, tr)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def _apply(self, v, tl, tr, kind, val):
        length = tr - tl
        if kind == self.SET:
            self.tree[v] = val * length
            self.lazy_kind[v] = self.SET
            self.lazy_val[v] = val
        else:  # ADD
            self.tree[v] += val * length
            if self.lazy_kind[v] == self.SET:
                self.lazy_val[v] += val
            elif self.lazy_kind[v] == self.ADD:
                self.lazy_val[v] += val
            else:
                self.lazy_kind[v] = self.ADD
                self.lazy_val[v] = val

    def _push_down(self, v, tl, tm, tr):
        if self.lazy_kind[v] == self.NONE:
            return
        self._apply(2 * v, tl, tm, self.lazy_kind[v], self.lazy_val[v])
        self._apply(2 * v + 1, tm, tr, self.lazy_kind[v], self.lazy_val[v])
        self.lazy_kind[v] = self.NONE
        self.lazy_val[v] = 0

    def range_add(self, l, r, x, v=1, tl=None, tr=None):
        if tl is None:
            tl, tr = 0, self.n
        if l >= r or l >= tr or r <= tl:
            return
        if l <= tl and tr <= r:
            self._apply(v, tl, tr, self.ADD, x)
            return
        tm = (tl + tr) // 2
        self._push_down(v, tl, tm, tr)
        self.range_add(l, r, x, 2 * v, tl, tm)
        self.range_add(l, r, x, 2 * v + 1, tm, tr)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def range_assign(self, l, r, x, v=1, tl=None, tr=None):
        if tl is None:
            tl, tr = 0, self.n
        if l >= r or l >= tr or r <= tl:
            return
        if l <= tl and tr <= r:
            self._apply(v, tl, tr, self.SET, x)
            return
        tm = (tl + tr) // 2
        self._push_down(v, tl, tm, tr)
        self.range_assign(l, r, x, 2 * v, tl, tm)
        self.range_assign(l, r, x, 2 * v + 1, tm, tr)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def range_sum(self, l, r, v=1, tl=None, tr=None):
        if tl is None:
            tl, tr = 0, self.n
        if l >= r or l >= tr or r <= tl:
            return 0
        if l <= tl and tr <= r:
            return self.tree[v]
        tm = (tl + tr) // 2
        self._push_down(v, tl, tm, tr)
        return self.range_sum(l, r, 2 * v, tl, tm) + self.range_sum(
            l, r, 2 * v + 1, tm, tr
        )


def brute_range_add(arr, l, r, x):
    for i in range(l, r):
        arr[i] += x


def brute_range_assign(arr, l, r, x):
    for i in range(l, r):
        arr[i] = x


# A real range-wide add, checked against a brute-force array that pays for
# every position it touches.
reference = list(COUNTS)
lazy = LazySumTree(COUNTS)

lazy.range_add(5, 11, 3)
brute_range_add(reference, 5, 11, 3)
assert lazy.range_sum(5, 11) == sum(reference[5:11]) == 47
assert lazy.range_sum(0, N) == sum(reference)

# Two pending ADD tags on the same still-unvisited subtree compose into one:
# add 3, then add 2, to the identical range, without ever pushing down to
# the leaves in between. The result must match adding 5 once.
lazy2 = LazySumTree(COUNTS)
reference2 = list(COUNTS)
lazy2.range_add(0, N, 3)
lazy2.range_add(0, N, 2)
brute_range_add(reference2, 0, N, 3)
brute_range_add(reference2, 0, N, 2)
assert lazy2.range_sum(0, N) == sum(reference2)
# Confirm the tag actually composed (one combined ADD tag of 5), not two
# separate pending tags, by reading the root's own lazy state before any
# query has forced a push-down past it.
assert lazy2.lazy_kind[1] == LazySumTree.ADD
assert lazy2.lazy_val[1] == 5

# A pending ADD tag does NOT survive a later ASSIGN on the same node: assign
# overrides, it does not combine. Add 3 to the whole array, then assign the
# whole array to 7, with no query in between to force a push-down.
lazy3 = LazySumTree(COUNTS)
lazy3.range_add(0, N, 3)
lazy3.range_assign(0, N, 7)
assert lazy3.lazy_kind[1] == LazySumTree.SET
assert lazy3.lazy_val[1] == 7
assert lazy3.range_sum(0, N) == 7 * N == 105  # not 7*N plus the discarded add

# The opposite order does combine: assign 7, then add 3, lands on "8 added
# to the assigned value" because add always has meaning once the base value
# is fixed, so an add placed after a pending assign is folded into that same
# assign tag rather than creating a second, separate one.
lazy4 = LazySumTree(COUNTS)
lazy4.range_assign(0, N, 7)
lazy4.range_add(0, N, 3)
assert lazy4.lazy_kind[1] == LazySumTree.SET
assert lazy4.lazy_val[1] == 10
assert lazy4.range_sum(0, N) == 10 * N == 150

# ASSIGN-then-ASSIGN: the second assign simply replaces the first outright.
lazy5 = LazySumTree(COUNTS)
lazy5.range_assign(0, N, 7)
lazy5.range_assign(0, N, 2)
assert lazy5.lazy_kind[1] == LazySumTree.SET
assert lazy5.lazy_val[1] == 2
assert lazy5.range_sum(0, N) == 2 * N == 30


# ---------------------------------------------------------------------------
# 4. The real cost of a range update with lazy tags versus without them:
#    a workload of range-add operations on the chapter's own array,
#    counted by nodes actually touched.
# ---------------------------------------------------------------------------

class CountingLazySumTree(LazySumTree):
    """Same lazy sum tree, counting every node its own operations touch."""

    def __init__(self, data):
        self.ops = 0
        super().__init__(data)

    def _apply(self, v, tl, tr, kind, val):
        self.ops += 1
        super()._apply(v, tl, tr, kind, val)

    def _push_down(self, v, tl, tm, tr):
        if self.lazy_kind[v] != self.NONE:
            self.ops += 1
        super()._push_down(v, tl, tm, tr)


def eager_range_add_cost(n, l, r):
    """Leaves touched by a range add with NO lazy tags: every position in
    the range, one at a time, the way a segment tree without lazy
    propagation has no choice but to work (CHAPTER.md's own contrast: 'a
    segment tree without lazy tags, touching every leaf in a range')."""
    return r - l


# Each update is measured from a tree with no pending tags of its own, to
# isolate the lazy decomposition's own per-call cost (the O(log n) claim)
# from the extra push-down work later, unrelated updates would trigger on
# the same nodes — that accumulated cost is real too, but it is a property
# of a *sequence* of overlapping updates, not of the lazy mechanism itself,
# and mixing the two would overstate what this specific bound promises.
UPDATES = [(0, 15, 1), (3, 12, 2), (5, 11, 3), (1, 8, 1), (7, 14, 2),
           (0, 5, 4), (2, 15, 1), (6, 9, 2), (0, 9, 1), (4, 15, 3)]

lazy_ops = 0
eager_ops = 0
for (l, r, x) in UPDATES:
    fresh = CountingLazySumTree(COUNTS)
    fresh.range_add(l, r, x)
    lazy_ops += fresh.ops
    eager_ops += eager_range_add_cost(N, l, r)

assert lazy_ops == 24
assert eager_ops == 85
# Every one of the ten updates' own lazy-tag cost stays bounded by a small
# multiple of log2(n), never by the range length itself.
assert lazy_ops <= 10 * 4 * (math.floor(math.log2(N)) + 1)


if __name__ == "__main__":
    print(f"sum over minutes 5..11: {range_5_11_sum}")
    print(f"min over minutes 5..11: {range_5_11_min}")
    print(f"climbing a point update (iterative layout): {jumps_climbed}")
    print(f"two composed range-adds, combined tag: {lazy2.lazy_val[1]}")
    print(f"assign overriding a pending add: sum = {lazy3.range_sum(0, N)}")
    print(f"add folded into a pending assign: sum = {lazy4.range_sum(0, N)}")
    print(f"workload of 10 range-adds: lazy {lazy_ops} node-touches vs "
          f"eager (no lazy tags) {eager_ops} leaf-touches")
    print("all checks passed")
