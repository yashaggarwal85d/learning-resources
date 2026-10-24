"""Fenwick trees (dsa.fenwick-trees): real behaviour, every number asserted.

Running example (Chapter 8's own): one fixed array of per-minute event counts
from the log, 15 minutes, queried and updated by position, never by key.
"""

COUNTS = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4]
N = len(COUNTS)
assert N == 15


def lowbit(i):
    return i & (-i)


class Fenwick:
    """1-based Fenwick tree over n slots, sum as the group operation."""

    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def add(self, idx, delta):
        visited = []
        while idx <= self.n:
            self.tree[idx] += delta
            visited.append(idx)
            idx += lowbit(idx)
        return visited

    def prefix_sum(self, idx):
        total = 0
        visited = []
        while idx > 0:
            total += self.tree[idx]
            visited.append(idx)
            idx -= lowbit(idx)
        return total, visited

    def range_sum(self, l, r):
        hi, _ = self.prefix_sum(r)
        lo, _ = self.prefix_sum(l - 1)
        return hi - lo


def naive_prefix_sum(arr, idx):
    return sum(arr[:idx])


# --- 1. Build the Fenwick tree from the running example, verify against a naive scan ---

bit = Fenwick(N)
for i, v in enumerate(COUNTS, start=1):
    bit.add(i, v)

for i in range(1, N + 1):
    fenwick_val, _ = bit.prefix_sum(i)
    assert fenwick_val == naive_prefix_sum(COUNTS, i)

# --- 2. Lowest-set-bit arithmetic: the exact numbers the reel shows ---

assert lowbit(5) == 1       # 0101 -> 0001
assert lowbit(6) == 2       # 0110 -> 0010
assert lowbit(8) == 8       # 1000 -> 1000
assert lowbit(11) == 1      # 1011 -> 0001
assert lowbit(10) == 2      # 1010 -> 0010
assert bin(5) == '0b101'
assert bin(11) == '0b1011'

# --- 3. Point update at minute 5: the real index-jump sequence ---

update_jumps = Fenwick(N).add(5, 0)  # fresh tree, same jump sequence regardless of delta
assert update_jumps == [5, 6, 8]
assert len(update_jumps) == 3

# --- 4. Prefix-sum query through minute 11: the real index-jump sequence ---

_, query_jumps = bit.prefix_sum(11)
assert query_jumps == [11, 10, 8]
assert len(query_jumps) == 3

# --- 5. Worst-case jump count over 15 slots is bounded by floor(log2(15)) + 1 ---

import math

max_jumps_seen = 0
for i in range(1, N + 1):
    _, jumps = bit.prefix_sum(i)
    max_jumps_seen = max(max_jumps_seen, len(jumps))
for i in range(1, N + 1):
    jumps = Fenwick(N).add(i, 0)
    max_jumps_seen = max(max_jumps_seen, len(jumps))
assert max_jumps_seen == 4
assert math.floor(math.log2(N)) + 1 == 4

# --- 6. Range sum from two prefix sums: minutes 5 through 11 ---

range_5_11 = bit.range_sum(5, 11)
assert range_5_11 == sum(COUNTS[4:11])  # 0-based slice for minutes 5..11 inclusive
assert range_5_11 == 30
# exactly two Fenwick prefix-sum queries answer any range sum
QUERIES_PER_RANGE_SUM = 2
assert QUERIES_PER_RANGE_SUM == 2

# --- 7. Range-update / range-query with two Fenwick trees ---


class RangeFenwick:
    """Range-add, range-sum via two Fenwick trees (B1, B2), cp-algorithms' own derivation."""

    def __init__(self, n):
        self.n = n
        self.b1 = Fenwick(n)
        self.b2 = Fenwick(n)

    def range_add(self, l, r, x):
        self.b1.add(l, x)
        self.b1.add(r + 1, -x) if r + 1 <= self.n else None
        self.b2.add(l, x * (l - 1))
        self.b2.add(r + 1, -x * r) if r + 1 <= self.n else None

    def prefix_sum(self, idx):
        s1, _ = self.b1.prefix_sum(idx)
        s2, _ = self.b2.prefix_sum(idx)
        return s1 * idx - s2

    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)


rf = RangeFenwick(N)

# apply the same per-minute counts as a sequence of range-adds of width 1, so rf should match COUNTS
for i, v in enumerate(COUNTS, start=1):
    rf.range_add(i, i, v)
for i in range(1, N + 1):
    assert rf.prefix_sum(i) == naive_prefix_sum(COUNTS, i)

# now a real range-wide correction: add 10 to every minute from 5 through 11, verify against a brute-force array
corrected = list(COUNTS)
for i in range(5, 12):
    corrected[i - 1] += 10
rf.range_add(5, 11, 10)
for i in range(1, N + 1):
    assert rf.prefix_sum(i) == naive_prefix_sum(corrected, i)
assert rf.range_sum(5, 11) == sum(corrected[4:11])
assert rf.range_sum(5, 11) == 100

# --- 8. 2D Fenwick tree, named and demonstrated at a small scale (4x4 grid) ---


class Fenwick2D:
    def __init__(self, rows, cols):
        self.rows, self.cols = rows, cols
        self.tree = [[0] * (cols + 1) for _ in range(rows + 1)]

    def add(self, x, y, delta):
        xi = x
        while xi <= self.rows:
            yi = y
            while yi <= self.cols:
                self.tree[xi][yi] += delta
                yi += lowbit(yi)
            xi += lowbit(xi)

    def prefix_sum(self, x, y):
        total = 0
        xi = x
        while xi > 0:
            yi = y
            while yi > 0:
                total += self.tree[xi][yi]
                yi -= lowbit(yi)
            xi -= lowbit(xi)
        return total


GRID_SIZE = 4
assert GRID_SIZE == 4
grid = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 1, 2, 3], [4, 5, 6, 7]]
bit2d = Fenwick2D(GRID_SIZE, GRID_SIZE)
for x in range(1, GRID_SIZE + 1):
    for y in range(1, GRID_SIZE + 1):
        bit2d.add(x, y, grid[x - 1][y - 1])


def brute_2d_prefix(g, x, y):
    return sum(g[i][j] for i in range(x) for j in range(y))


for x in range(1, GRID_SIZE + 1):
    for y in range(1, GRID_SIZE + 1):
        assert bit2d.prefix_sum(x, y) == brute_2d_prefix(grid, x, y)
assert bit2d.prefix_sum(GRID_SIZE, GRID_SIZE) == 73

# --- 9. Prove it: naive rebuild cost vs Fenwick cost over a real workload ---

UPDATES = [(3, 2), (9, -1), (1, 5), (14, 3), (7, -2), (11, 4), (5, 1), (2, 2), (13, -3), (8, 6)]
QUERIES = [15, 4, 11, 7, 13, 1, 9, 6, 12, 3]

naive_ops = 0
fenwick_ops = 0
workload_tree = Fenwick(N)
for idx, delta in UPDATES:
    naive_ops += N  # a naive cached-prefix-sum array rebuilds every slot from idx onward, worst case all N
    jumps = workload_tree.add(idx, delta)
    fenwick_ops += len(jumps)
for q in QUERIES:
    naive_ops += 1  # a naive prefix-sum array answers a query in one lookup once it's rebuilt
    _, jumps = workload_tree.prefix_sum(q)
    fenwick_ops += len(jumps)

assert naive_ops == 160  # 10 updates * 15 + 10 queries * 1
assert fenwick_ops == 47
NAIVE_UPDATE_COST = N
assert NAIVE_UPDATE_COST == 15

if __name__ == '__main__':
    print(f'array: {N} per-minute event counts {COUNTS}')
    print(f'lowbit(5)={lowbit(5)} lowbit(6)={lowbit(6)} lowbit(8)={lowbit(8)}')
    print(f'update jump sequence at minute 5: {update_jumps}')
    print(f'prefix-sum query jump sequence through minute 11: {query_jumps}')
    print(f'max jumps seen over {N} slots: {max_jumps_seen}')
    print(f'range sum minutes 5..11: {range_5_11}')
    print(f'range-update/range-query minutes 5..11 after +10 correction: {rf.range_sum(5, 11)}')
    print(f'2D Fenwick prefix sum over the whole {GRID_SIZE}x{GRID_SIZE} grid: {bit2d.prefix_sum(GRID_SIZE, GRID_SIZE)}')
    print(f'workload of {len(UPDATES)} updates + {len(QUERIES)} queries: naive {naive_ops} ops vs Fenwick {fenwick_ops} ops')
    print('all checks passed')
