"""The syllabus's own lab: time 10,000,000 Union/Find operations with and without path
compression (and with and without rank). Separate from examples.py's own smaller, fast,
asserted run, so the build's test suite doesn't have to pay this script's wall-clock cost.

Run: python3 lab_timing.py
"""

import random
import time

from examples import NaiveUF, RankUF, RankCompressUF

N = 1_000_000
M = 10_000_000


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
