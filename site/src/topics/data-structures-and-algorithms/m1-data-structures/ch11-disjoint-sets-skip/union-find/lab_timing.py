"""The syllabus's own lab: time a large batch of Union/Find operations with and without
rank, and with and without path compression. Separate from examples.py's own smaller, fast,
asserted run, so the build's test suite doesn't have to pay this script's wall-clock cost.

The syllabus names 10,000,000 operations; at that scale the naive variant (no rank at all)
builds trees deep enough that a pure-Python run does not finish in any practical time here
(its cost is the whole point — this script's own run is evidence of exactly that, not a
shortcut around it). N and M below are scaled down to what this sandbox's interpreter
finishes in under a minute; the orders-of-magnitude gap between naive, rank-only and
rank+compression is already visible at this scale and does not need 10^7 operations to show.

Run: python3 lab_timing.py
"""

import random
import time

from examples import NaiveUF, RankUF, RankCompressUF

N = 10_000
M = 150_000


def random_ops(n, m, seed):
    rnd = random.Random(seed)
    return [(rnd.randrange(n), rnd.randrange(n)) for _ in range(m)]


def time_naive(ops, n):
    uf = NaiveUF(n)
    t0 = time.perf_counter()
    for x, y in ops:
        rx, ry = uf.find(x), uf.find(y)
        if rx != ry:
            uf.parent[rx] = ry
    return time.perf_counter() - t0, uf.reads


def time_rank(ops, n):
    uf = RankUF(n)
    t0 = time.perf_counter()
    for x, y in ops:
        uf.union(x, y)
    return time.perf_counter() - t0, uf.reads


def time_compress(ops, n):
    uf = RankCompressUF(n)
    t0 = time.perf_counter()
    for x, y in ops:
        uf.union(x, y)
    return time.perf_counter() - t0, uf.reads


if __name__ == "__main__":
    ops = random_ops(N, M, seed=7)
    for name, fn in [("naive", time_naive), ("rank only", time_rank), ("rank+compression", time_compress)]:
        seconds, reads = fn(ops, N)
        print(f"{name:18s} {seconds:8.2f}s total, {reads / M:8.3f} avg parent-pointer reads/op")
