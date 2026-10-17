"""Executed truth for the window-function-execution-internals reel (run by `npm run test:examples`).

The four frame-aggregation strategies are implemented and instrumented (counting element operations), and the window
query is compared with the correlated-subquery version in a real engine (SQLite). The parallel-skew figures are computed.
Leis et al. (PVLDB 2015) is the source of the strategies; PostgreSQL's sort-reuse comment is quoted in the Deep dive.
"""

import math
import sqlite3

N = 1000
HALF = 5  # a frame of 5 rows each side = 11 rows
FRAME = 2 * HALF + 1
assert FRAME == 11
data = [(i * 37) % 101 for i in range(N)]  # deterministic readings

# -- Correlated subquery vs window, in a real engine ---------------------------
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE m (t INT, v INT)")
db.executemany("INSERT INTO m VALUES (?,?)", list(enumerate(data)))
window = db.execute(f"SELECT SUM(v) OVER (ORDER BY t ROWS BETWEEN {HALF} PRECEDING AND {HALF} FOLLOWING) FROM m ORDER BY t").fetchall()
corr = db.execute(f"SELECT (SELECT SUM(v) FROM m m2 WHERE m2.t BETWEEN m.t - {HALF} AND m.t + {HALF}) FROM m ORDER BY t").fetchall()
assert window == corr  # same answer
rescan_work = N * N  # each of N correlated subqueries compares against all N rows
assert rescan_work == 1_000_000
window_work = N  # one sorted pass
assert window_work == 1000
db.close()

# -- The four strategies, counting element operations ---------------------------
def naive(vals):
    ops, out = 0, []
    for i in range(len(vals)):
        lo, hi = max(0, i - HALF), min(len(vals) - 1, i + HALF)
        out.append(sum(vals[lo : hi + 1]))
        ops += hi - lo + 1
    return out, ops


def removable(vals):
    ops, out, total = 0, [], 0
    lo, hi = 0, -1
    for i in range(len(vals)):
        nlo, nhi = max(0, i - HALF), min(len(vals) - 1, i + HALF)
        while hi < nhi:
            hi += 1
            total += vals[hi]
            ops += 1
        while lo < nlo:
            total -= vals[lo]
            lo += 1
            ops += 1
        out.append(total)
    return out, ops


def cumulative(vals):
    ops, out, total = 0, [], 0
    for v in vals:  # frame = start of partition .. current row: only grows
        total += v
        ops += 1
        out.append(total)
    return out, ops


n_out, n_ops = naive(data)
r_out, r_ops = removable(data)
assert n_out == r_out == [x[0] for x in window]
assert n_ops > 10_000 and r_ops < 2 * N + FRAME  # naive does about N * 11 additions, removable about 2N
c_out, c_ops = cumulative(data)
assert c_ops == N == 1000  # one addition per row, not N*(N+1)/2
assert N * (N + 1) // 2 == 500_500  # what recomputing the growing frame each time would cost: about half a million

# Segment tree: any frame in O(log n) node visits.
class Seg:
    def __init__(self, vals):
        self.n = 1 << math.ceil(math.log2(len(vals)))
        self.t = [0] * (2 * self.n)
        self.t[self.n : self.n + len(vals)] = vals
        for i in range(self.n - 1, 0, -1):
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]
        self.visits = 0

    def query(self, lo, hi):  # inclusive
        s, lo, hi = 0, lo + self.n, hi + self.n + 1
        while lo < hi:
            if lo & 1:
                s += self.t[lo]; lo += 1; self.visits += 1
            if hi & 1:
                hi -= 1; s += self.t[hi]; self.visits += 1
            lo //= 2; hi //= 2
        return s


tree = Seg(data)
assert tree.query(100, 800) == sum(data[100:801])  # wildly different frames still work
assert tree.query(0, N - 1) == sum(data)
LOG_N = math.ceil(math.log2(N))
assert LOG_N == 10  # about 10 node visits for 1,000 rows
tree.visits = 0
tree.query(3, 997)
assert tree.visits <= 2 * LOG_N

# -- Sort reuse: windows needing the same (partition, order) share one sort ------
windows = [(("a",), ("b",)), (("a",), ("b",)), (("a",), ())]  # the third is a prefix of the first
def sorts_needed(ws):
    keys = sorted({p + o for p, o in ws}, key=len, reverse=True)
    kept = []
    for k in keys:
        if not any(big[: len(k)] == k for big in kept):
            kept.append(k)
    return len(kept)


assert sorts_needed(windows) == 1
assert sorts_needed([(("a",), ("b",)), (("c",), ())]) == 2
assert sorts_needed(windows[:2]) == 1  # different frames, same sort

# -- Skew: makespan of whole-partition parallelism on 4 workers ----------------------
parts = [100, 100, 100, 700]
workers = 4
assert sum(parts) == 1000 and len(parts) == workers
assert max(parts) == 700  # the slowest worker sets the finish time
ideal = sum(parts) / workers
assert ideal == 250 and max(parts) / ideal == 2.8

print("window-function-execution-internals examples: all numbers check out")
