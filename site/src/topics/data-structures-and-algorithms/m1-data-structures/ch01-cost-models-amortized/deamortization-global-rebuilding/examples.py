"""Every number and claim in the deamortization reel and Deep dive, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows, rounded on-screen literals included.
`python3 examples.py --export` prints the one data line scenes.tsx embeds (the 256 largest scapegoat rebuilds).

The chapter's rule (CHAPTER.md): an empty vector has capacity 0; the first append allocates 1; an append to a full vector
allocates 2 * cap (g = 2; g = 1.5 where a block says so), copies the n keys, then writes the new one. One unit of cost = one
element write (allocation and freeing are not counted); a pop counts 1. For trees the unit is one node written.

The time model of this topic (a model, said as one on screen): one server that handles requests in arrival order, each
request appends one key, one tick = the time of one element write, a request arrives every 4 ticks.
Percentiles are nearest rank with an exact integer rank, never a float product."""
import math
import random
import sys
from bisect import bisect_left, bisect_right
from collections import Counter
from fractions import Fraction as F

MILLION = 1_000_000


# ---------------------------------------------------------------------------------------------------------------
# Percentiles: nearest rank. The p-th percentile of N values is the value at rank ceil(p * N / 100) in sorted order.
# ---------------------------------------------------------------------------------------------------------------
def rank(n, p):
    """ceil(p * n / 100), exact (p is a string or Fraction such as '99.9')."""
    return -((-F(str(p)) * n) // 100)


def pct(sorted_vals, p):
    return sorted_vals[rank(len(sorted_vals), p) - 1]


def test_percentiles():
    assert rank(1_000_000, 99) == 990_000
    assert rank(1_000_000, '99.9') == 999_000
    assert math.ceil(99.9 / 100 * 1_000_000) == 999_001  # the float pitfall: the same rank computed with floats is one too high
    assert rank(1_000_000, '99.99') == 999_900
    assert rank(1_000_000, '99.999') == 999_990
    assert rank(1_000_000, 50) == 500_000
    # the lecture's self-check: ten requests of 1, 1, 1, 1, 1, 1, 1, 1, 1 and 50 ms
    ms = [1] * 9 + [50]
    assert (pct(ms, 50), pct(ms, 90), pct(ms, 99)) == (1, 1, 50)
    # 120 requests: p99 is the 119th smallest, so 1 request in 100 is slower
    assert rank(120, 99) == 119


# ---------------------------------------------------------------------------------------------------------------
# The plain doubling vector (the chapter's rule)
# ---------------------------------------------------------------------------------------------------------------
def plain_costs(n, grow=lambda c: 2 * c):
    costs, size, cap = [], 0, 0
    for _ in range(n):
        c = 1
        if size == cap:
            if cap == 0:
                cap = 1
            else:
                c += size
                cap = grow(cap)
        size += 1
        costs.append(c)
    return costs


def plain_total(n):
    """Closed form for the total writes of n appends, g = 2 (checked against the simulation below)."""
    if n <= 1:
        return n
    k = (n - 1).bit_length() - 1  # the last resize is append 2**k + 1, copying 2**k keys
    return n + 2 ** (k + 1) - 1


def test_plain():
    c16 = plain_costs(16)
    assert c16 == [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1] and sum(c16) == 31 and max(c16) == 9
    assert c16[8:12] == [9, 1, 1, 1] and sum(c16[8:12]) == 12
    phi = 2 * 8 - 8  # the potential 2n - cap just before append 9 (the last reel)
    assert phi == 8

    costs = plain_costs(MILLION)
    s = sorted(costs)
    assert sum(costs) == 2_048_575 and sum(costs) - MILLION == 1_048_575 == 2 ** 20 - 1
    assert round(sum(costs) / MILLION, 2) == 2.05 and sum(costs) / MILLION == 2.048575
    assert max(costs) == 524_289 and costs.index(524_289) == 524_288  # append 524,289
    resizing = [i + 1 for i, c in enumerate(costs) if c > 1]
    assert len(resizing) == 20 and resizing == [2 ** k + 1 for k in range(20)]
    assert Counter(costs)[1] == 999_980  # 999,980 appends cost 1: the first only allocates
    assert [pct(s, p) for p in ('50', '99', '99.9', '99.99')] == [1, 1, 1, 1]
    assert pct(s, '99.999') == 513 and pct(s, 100) == 524_289
    assert 20 / MILLION * 100 == 0.002  # 0.002% of the appends resize
    assert round(100 * 999_980 / MILLION, 3) == 99.998  # 99.998% cost 1
    assert rank(MILLION, '99.99') == 999_900 < 999_981  # the 20 resizing appends are ranks 999,981 and up

    # the closed form against the simulation, at sample points
    cum, tot = [], 0
    for c in costs:
        tot += c
        cum.append(tot)
    for n in list(range(1, 400)) + [2 ** k + d for k in range(2, 20) for d in (-1, 0, 1, 2)] + [MILLION]:
        assert cum[n - 1] == plain_total(n), n
    # a billion appends: only the formulas
    assert plain_total(10 ** 9) == 2_073_741_823 and plain_total(10 ** 9) - 10 ** 9 == 1_073_741_823 == 2 ** 30 - 1
    assert 2 ** 29 + 1 == 536_870_913 and 2 ** 29 + 1 <= 10 ** 9 < 2 ** 30 + 1  # the largest plain append, 536,870,913 writes
    return costs


# ---------------------------------------------------------------------------------------------------------------
# The incremental vector (the design every number uses): two buffers, a frontier k, `rate` moves per operation.
# ---------------------------------------------------------------------------------------------------------------
class IncVector:
    """buf (capacity cap), old (the previous buffer or None), m (old keys that must move), k (the frontier: old
    indices < k have moved), n. An operation writes its key and then moves up to `rate` old keys; a migration ends
    when k reaches m. Cost of an operation = 1 + keys moved. Shrinks at n < cap/4 (strict) into cap/2."""

    def __init__(self, rate=2, grow=lambda c: 2 * c, shrink=True):
        self.rate, self.grow, self.shrink = rate, grow, shrink
        self.buf, self.cap, self.n = [], 0, 0
        self.old, self.m, self.k = None, 0, 0
        self.starts = 0

    def clone(self):
        v = IncVector(self.rate, self.grow, self.shrink)
        v.buf, v.cap, v.n = list(self.buf), self.cap, self.n
        v.old, v.m, v.k, v.starts = (None if self.old is None else list(self.old)), self.m, self.k, self.starts
        return v

    def _start(self, newcap):
        assert self.old is None, 'a resize started while a migration was running'
        self.old, self.m, self.k = self.buf, self.n, 0
        self.buf, self.cap = [None] * newcap, newcap
        self.starts += 1

    def _move(self):
        w = 0
        if self.old is not None:
            while w < self.rate and self.k < min(self.m, self.n):
                self.buf[self.k] = self.old[self.k]
                self.k += 1
                w += 1
            if self.k >= min(self.m, self.n):
                self.old = None
        return w

    def where(self, i):
        """Which buffer a read or write at index i uses."""
        return 'old' if self.old is not None and self.k <= i < self.m else 'new'

    def get(self, i):
        assert 0 <= i < self.n
        return (self.old if self.where(i) == 'old' else self.buf)[i]

    def set(self, i, x):
        assert 0 <= i < self.n
        (self.old if self.where(i) == 'old' else self.buf)[i] = x

    def append(self, x):
        if self.n == self.cap:
            if self.cap == 0:
                self.buf, self.cap = [None], 1
            else:
                self._start(self.grow(self.cap))
        self.buf[self.n] = x
        self.n += 1
        return 1 + self._move()

    def pop(self):
        assert self.n > 0
        x = self.get(self.n - 1)
        self.n -= 1
        if self.old is not None:
            self.m = min(self.m, self.n)
        cost = 1 + self._move()
        if self.old is None and self.shrink and 4 * self.n < self.cap:
            if self.n == 0:
                self.buf, self.cap = [], 0
            else:
                self._start(self.cap // 2)
                cost += self._move()
        return x, cost

    def key(self):
        """The state: (cap, n, migrating, m, k); m and k mean nothing when no migration runs."""
        return (self.cap, self.n, True, self.m, self.k) if self.old is not None else (self.cap, self.n, False, 0, 0)

    def buffers(self):
        return 1 + (self.old is not None)


def test_incremental_appends():
    v = IncVector()
    c16 = [v.append(i) for i in range(16)]
    assert c16 == [1, 2, 3, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1] and sum(c16) == 31 and max(c16) == 3
    assert c16[8:12] == [3, 3, 3, 3] and sum(c16[8:12]) == 12

    # the vector of 8 is full: the last reel's potential 2n - cap is 8, the keys append 9 must copy. The keys left to copy
    # (the gauge of the reel) then fall by 2 on each of appends 9 to 12, and the free slots by 1.
    v = IncVector()
    for i in range(8):
        v.append(i)
    assert v.n == v.cap == 8 and 2 * v.n - v.cap == 8
    left_to_copy, free = [v.n], [v.cap - v.n]
    for i in range(8, 12):
        v.append(i)
        left_to_copy.append(v.m - v.k if v.old is not None else 0)
        free.append(v.cap - v.n)
        if i == 8:
            assert (v.cap, v.n, v.m, v.k) == (16, 9, 8, 2)  # append 9: 16 slots, 2 old keys moved
    assert left_to_copy == [8, 6, 4, 2, 0]  # the gauge: 8, 6, 4, 2, 0
    assert free == [0, 7, 6, 5, 4]  # after append 9: 6 left to copy and 7 slots free; then 4 and 6, 2 and 5, 0 and 4
    assert v.old is None and (v.n, v.cap) == (12, 16)  # 12 of 16 in use when the last old key moves
    assert v.cap - v.n == 4 == v.cap // 4 and F(v.n, 8) == F(3, 2)  # a quarter of the new buffer spare; n = 1.5 times the old size
    # a copy of 1 key per append would end exactly full: n == 16 of 16
    v1 = IncVector(rate=1)
    for i in range(9):
        v1.append(i)
    while v1.old is not None:
        v1.append(0)
    assert v1.n == v1.cap == 16

    # the state after append 10: get(1) reads new, get(5) reads old, get(9) reads new
    v = IncVector()
    for i in range(10):
        v.append(i + 1)  # key = index + 1
    assert (v.n, v.m, v.k, v.cap) == (10, 8, 4, 16)
    assert (v.where(1), v.where(5), v.where(9)) == ('new', 'old', 'new')
    assert (v.get(1), v.get(5), v.get(9)) == (2, 6, 10)

    # the frontier off-by-one guard: during every migration of a 16-append run get(k) returns the old buffer's key
    v = IncVector()
    for i in range(1, 2000):
        v.append(i)
        if v.old is not None and v.k < v.m:
            assert v.where(v.k) == 'old' and v.get(v.k) == v.k + 1
        if v.old is not None:
            assert all(v.get(j) == j + 1 for j in range(v.n))

    # Prove it 2: right after append 9 (k == 2, m == 8) a buggy get(5) that always reads the new buffer finds an empty slot
    v = IncVector()
    for i in range(9):
        v.append(i + 1)
    assert (v.k, v.m) == (2, 8)
    assert v.buf[5] is None  # the buggy read: an empty slot of the new buffer
    assert v.get(5) == 6 and v.where(5) == 'old'  # the right read: key 6, in the old buffer
    assert all(v.buf[j] is None for j in range(2, 8)) and v.buf[8] == 9  # new slots 2 to 7 are empty; slot 8 holds key 9
    assert len(v.buf) == 16
    # append 9 moved indices 0 and 1; index 5 moves on append 11
    v.append(10)
    assert v.k == 4
    v.append(11)
    assert v.k == 6 and v.buf[5] == 6
    # a buggy set below m: write to the new buffer while the old key is still waiting to move; the later move overwrites it
    v = IncVector()
    for i in range(9):
        v.append(i + 1)
    v.buf[5] = 999  # buggy set(5, 999) always writes the new buffer
    v.append(10)
    v.append(11)
    assert v.buf[5] == 6  # overwritten by the later move
    v = IncVector()
    for i in range(9):
        v.append(i + 1)
    v.set(5, 999)  # the right set follows the read rule
    v.append(10)
    v.append(11)
    assert v.get(5) == 999

    # a million appends
    v = IncVector()
    costs = [v.append(i) for i in range(MILLION)]
    s = sorted(costs)
    assert sum(costs) == 2_048_575 and max(costs) == 3
    c = Counter(costs)
    assert c[3] == 524_287 and c[2] == 1 and c[1] == 475_712
    assert [pct(s, p) for p in ('50', '99', '99.9', '100')] == [3, 3, 3, 3]
    assert round(100 * c[3] / MILLION) == 52  # 52% of the appends cost 3
    assert 475_712 + 524_287 + 1 == MILLION
    return costs


def test_incremental_exhaustive():
    """Every state reachable from empty up to capacity 256: every operation costs <= 3, no resize starts during a
    migration, at most two buffers, and the reads are right."""
    CAP = 256

    def explore(rate, bound):
        start = IncVector(rate=rate)
        seen = {start.key()}
        frontier = [start]
        worst = 0
        while frontier:
            nxt = []
            for v in frontier:
                for op in ('push', 'pop'):
                    if op == 'pop' and v.n == 0:
                        continue
                    w = v.clone()
                    cost = w.append(0) if op == 'push' else w.pop()[1]  # raises if a resize starts during a migration
                    assert w.buffers() <= 2
                    if w.cap > CAP:
                        continue
                    worst = max(worst, cost)
                    if w.key() not in seen:
                        seen.add(w.key())
                        nxt.append(w)
            frontier = nxt
        return len(seen), worst

    states, worst = explore(2, 3)
    assert worst == 3 and states == 17_570, (states, worst)
    states1, worst1 = explore(1, 2)  # 1 move per operation is a valid design for g = 2: at most 2 writes, zero slack
    assert worst1 == 2, worst1
    return states, states1


def test_incremental_random():
    for seed in range(300):
        rnd = random.Random(seed)
        bias = rnd.choice([0.3, 0.5, 0.55, 0.7])  # chance that an operation is an append
        v, ref, worst = IncVector(), [], 0
        for step in range(4000):
            if not ref or rnd.random() < bias:
                x = rnd.randrange(10 ** 9)
                cost = v.append(x)
                ref.append(x)
            else:
                x, cost = v.pop()
                assert x == ref.pop()
            worst = max(worst, cost)
            assert v.buffers() <= 2 and v.n == len(ref)
            if step % 97 == 0:
                assert all(v.get(i) == ref[i] for i in range(len(ref)))
                if ref:
                    j = rnd.randrange(len(ref))
                    ref[j] = y = rnd.randrange(10 ** 9)
                    v.set(j, y)
        assert worst <= 3
    # the last reel's adversarial sequence: fill 16, push once, then 1,000 rounds of pop, pop, push, push
    v = IncVector()
    costs = [v.append(i) for i in range(17)]
    for _ in range(1000):
        costs += [v.pop()[1], v.pop()[1], v.append(0), v.append(0)]
    assert max(costs) == 3 and len(costs) == 17 + 4000


def test_rate_one_and_growth():
    # Break it 1: 1 move per append with g = 1.5 starts a resize while a copy runs. Report the first such append.
    g15 = lambda c: max((3 * c + 1) // 2, c + 1)  # ceil(1.5 * cap), at least cap + 1
    caps = [1]
    while caps[-1] < MILLION:
        caps.append(g15(caps[-1]))
    assert caps[:8] == [1, 2, 3, 5, 8, 12, 18, 27]
    # rate 2 with g = 1.5: the copy ends exactly on the append that fills the new buffer, at every resize up to 10**6
    resizes, n = 0, 0
    v = IncVector(rate=2, grow=g15, shrink=False)
    while n < MILLION:
        starts = v.starts
        v.append(n)
        n += 1
        if v.starts > starts:
            resizes += 1
            new_cap = v.cap
            while v.old is not None:
                assert v.n < new_cap  # still copying: the buffer is not full yet
                v.append(n)
                n += 1
            assert v.n == new_cap, (new_cap, v.n)  # the copy ended exactly when the buffer filled: zero slack
    assert resizes == 33, resizes
    # rate 1 with g = 1.5 fails: the first append that grows while a copy is still running
    v = IncVector(rate=1, grow=g15, shrink=False)
    first_bad = None
    for i in range(1, 1000):
        try:
            v.append(i)
        except AssertionError:
            first_bad = i
            break
    assert first_bad is not None and first_bad < 20  # reported in the Deep dive (the first append that grows mid-copy)
    return first_bad


def test_costs_and_space():
    c = 524_288
    assert c + 2 * c == 1_572_864 and 1_572_864 * 8 == 12 * 2 ** 20  # 12 MiB of 8-byte keys
    # plain doubling holds the same two buffers (c old + 2c new) during its one copying append: the peak is the same
    assert 524_288 + 1_048_576 == 1_572_864 and 1_572_864 * 8 // 2 ** 20 == 12  # old cap + new cap at append 524,289
    assert c // 2 == 262_144  # both buffers stay alive for c / 2 appends
    assert 3 * c * 8 // 2 ** 20 == 12
    # the next resize, from 1,048,576 keys (Prove it 1)
    c2 = 1_048_576
    assert 2 * c2 == 2_097_152 and c2 // 2 == 524_288 and c2 + c2 // 2 == 1_572_864
    assert c2 + 2 * c2 == 3_145_728 and 3_145_728 * 8 == 24 * 2 ** 20  # 24 MiB
    # the Prove-it-1 picture: the new bar ends at 75% of its slots (n = 1,572,864 of 2,097,152), the old keys moved are 50%
    assert 4 * 1_572_864 == 3 * 2_097_152 and 2 * c2 == 2_097_152  # 75% of the new buffer in use, and the moved old keys are 50% of it
    v = IncVector()
    for i in range(c2):
        v.append(i)
    assert v.n == v.cap == c2 and v.old is None
    first = v.append(0)  # append 1,048,577
    assert first == 3 and v.cap == 2_097_152
    appends = 1
    while v.old is not None:
        assert v.append(0) == 3
        appends += 1
    assert appends == 524_288 and v.n == 1_572_864
    # the wrong options: plain vector 1,048,577 writes; 1 key per append 1,048,576 appends and 2 writes; 4 keys: 262,144 and 5
    assert c2 + 1 == 1_048_577
    for rate, (apps, worst) in {1: (1_048_576, 2), 4: (262_144, 5)}.items():
        w = IncVector(rate=rate)
        for i in range(c2):
            w.append(i)
        costs, a = [w.append(0)], 1
        while w.old is not None:
            costs.append(w.append(0))
            a += 1
        assert (a, max(costs)) == (apps, worst), (rate, a, max(costs))
    # the number of resizes and the growth factor: at least 1/(g - 1) keys per append
    assert F(1, 2 - 1) == 1 and F(1, F(3, 2) - 1) == 2
    # a billion appends: the plain vector copies 2**30 - 1 keys either way
    assert 2 ** 30 - 1 == 1_073_741_823


# ---------------------------------------------------------------------------------------------------------------
# The queue model
# ---------------------------------------------------------------------------------------------------------------
def queue(costs, gap):
    """One server, requests in arrival order, request i arrives at tick gap * i and runs for costs[i] ticks.
    Returns (latencies, waited, starts) with latency = finish - arrival."""
    lat, waited, finish = [], 0, 0
    starts = []
    for i, c in enumerate(costs):
        a = gap * i
        start = a if a > finish else finish
        finish = start + c
        lat.append(finish - a)
        starts.append(start)
        if start > a:
            waited += 1
    return lat, waited, starts


def test_queue(plain, inc):
    lat, waited, starts = queue(plain, 4)
    s = sorted(lat)
    # append 524,289 starts at tick 2,097,152 and ends at 2,621,441, without waiting
    assert starts[524_288] == 2_097_152 == 4 * 524_288 and starts[524_288] + 524_289 == 2_621_441
    during = sum(1 for i in range(len(plain)) if 2_097_152 < 4 * i < 2_621_441)
    assert during == 131_072 == 524_288 // 4  # requests that arrive while it runs
    assert [pct(s, p) for p in ('50', '90', '99', '99.9', '100')] == [1, 243_218, 494_289, 521_289, 524_289]
    assert pct(s, '99.9') == 524_289 - 3 * 1_000  # the latencies behind the last copy are 524,289 - 3j; rank 999,000 is j = 1,000
    assert waited == 349_515 and round(100 * waited / MILLION) == 35
    assert sum(lat) == 61_085_503_615 and sum(lat) / MILLION == 61_085.503615
    assert round(sum(plain) / MILLION / 4 * 100) == 51  # the server is busy about half the time
    # arrival gaps 3 and 8
    lat3, w3, _ = queue(plain, 3)
    s3 = sorted(lat3)
    assert (pct(s3, 50), pct(s3, 99), w3) == (5_771, 504_289, 524_268)
    assert round(sum(plain) / MILLION / 3 * 100) == 68
    lat8, w8, _ = queue(plain, 8)
    s8 = sorted(lat8)
    assert (pct(s8, 50), pct(s8, 99), w8) == (1, 454_289, 149_790)
    assert round(sum(plain) / MILLION / 8 * 100) == 26
    # incremental copying: any gap of at least 3 ticks, no request ever waits
    for gap in (3, 4, 8):
        li, wi, _ = queue(inc, gap)
        assert wi == 0 and li == inc  # latency == own cost
        si = sorted(li)
        assert [pct(si, p) for p in ('50', '99', '99.9', '100')] == [3, 3, 3, 3]
    # more questions (d): a service that fans out to 100 shards that each resize like the plain vector
    q = F(waited, MILLION)
    p_slow = 1 - (1 - q) ** 100
    assert float(1 - p_slow) < 1e-18 and 0.349515 == float(q)
    return waited


# ---------------------------------------------------------------------------------------------------------------
# Fan-out (Dean and Barroso, The Tail at Scale: 10 ms typical, 1 s at the 99th percentile)
# ---------------------------------------------------------------------------------------------------------------
def slow_share(p, k):
    """The share of requests that take over the slow time when each of k independent servers is slow with probability p."""
    return 1 - (1 - p) ** k


def test_fanout():
    typical_ms, p99_ms = 10, 1000  # "typically responds in 10ms but with a 99th-percentile latency of one second"
    one = slow_share(F(1, 100), 1)
    assert one == F(1, 100)  # on one such server, one user request in 100 is slow
    hundred = slow_share(F(1, 100), 100)
    assert round(100 * hundred) == 63 and round(float(hundred), 3) == 0.634  # 100 servers: 63% slow
    big = slow_share(F(1, 10_000), 2000)
    assert round(100 * big) == 18 and round(float(big), 3) == 0.181  # 2,000 servers, 1 in 10,000 slow: almost one in five
    assert F(1, 6) < big < F(1, 5)
    leaf_ms, all_ms = 10, 140  # Table 1, measured: 99th percentile for a single random request and for all requests to finish
    assert (typical_ms, p99_ms, leaf_ms, all_ms) == (10, 1000, 10, 140)


# ---------------------------------------------------------------------------------------------------------------
# Tombstones, all at once (global rebuilding in dsbook's sense)
# ---------------------------------------------------------------------------------------------------------------
class TombVector:
    """A sorted vector; a delete marks a tombstone (1 write). When at least half the slots are tombstones, copy the live
    keys into a compact vector (cost = the live keys)."""

    def __init__(self, keys):
        self.keys = list(keys)
        self.dead = bytearray(len(self.keys))
        self.ndead = 0

    def find(self, key):
        i = bisect_left(self.keys, key)
        return i if i < len(self.keys) and self.keys[i] == key else None

    def contains(self, key):
        i = self.find(key)
        return i is not None and not self.dead[i]

    def delete(self, key):
        i = self.find(key)
        assert i is not None and not self.dead[i]
        self.dead[i] = 1
        self.ndead += 1
        cost = 1
        if 2 * self.ndead >= len(self.keys):
            live = [k for k, d in zip(self.keys, self.dead) if not d]
            cost += len(live)
            self.keys, self.dead, self.ndead = live, bytearray(len(live)), 0
        return cost

    def longest_dead_run(self):
        best = cur = 0
        for d in self.dead:
            cur = cur + 1 if d else 0
            best = max(best, cur)
        return best


def test_tombstones():
    v = TombVector(range(1, 17))
    costs = [v.delete(k) for k in (3, 6, 10, 14, 2, 15, 8, 11)]
    assert costs == [1, 1, 1, 1, 1, 1, 1, 9] and sum(costs) == 16
    assert v.keys == [1, 4, 5, 7, 9, 12, 13, 16] and len(v.keys) == 8  # live after the rebuild
    # the lookups: a tombstoned key reports absent
    w = TombVector(range(1, 17))
    for k in (3, 6, 10, 14):
        w.delete(k)
    assert not w.contains(3) and w.contains(4) and not w.contains(99)
    # at 1,048,576 keys the 524,288th delete costs 524,289
    N = 1 << 20
    big = TombVector(range(N))
    ref = set(range(N))
    last = 0
    for j in range(1, N // 2 + 1):
        last = big.delete(j - 1)
        ref.discard(j - 1)
        if j % 100_000 == 0 or j == 1:
            for probe in (j - 1, j, j + 1, N - 1, N + 5):
                assert big.contains(probe) == (probe in ref)
    assert last == 524_289 and N // 2 == 524_288
    # what tombstones hide: after deleting keys 0 ... 262,143 (smallest first, before the rebuild) a successor query for
    # the smallest key steps over a run of 262,144 tombstones; just before the rebuild the run is 524,287
    big = TombVector(range(N))
    for j in range(262_144):
        big.delete(j)
    assert big.longest_dead_run() == 262_144 == N // 4
    for j in range(262_144, N // 2 - 1):
        big.delete(j)
    assert big.longest_dead_run() == 524_287 and big.ndead == 524_287


# ---------------------------------------------------------------------------------------------------------------
# Tombstones, rebuilt in the background (Overmars's global rebuilding): this topic's own design
# ---------------------------------------------------------------------------------------------------------------
class BgTomb:
    """Sorted vector with tombstones, rebuilt in the background. Trigger: tombstones >= a quarter of the slots. Each delete
    also does `work` units: one unit = one old slot scanned (a live key is copied: 1 write) or one log entry replayed
    (1 write). A delete of a key the scan has already passed goes in a log (1 write) and is replayed as a tombstone in
    the new copy. Queries use the old copy until the swap. budget='copies' is the broken budget: 8 live copies per delete."""

    def __init__(self, keys, work=8, budget='units'):
        self.keys = list(keys)
        self.dead = bytearray(len(self.keys))
        self.ndead = 0
        self.work, self.budget = work, budget
        self.scan = None  # None: no rebuild running; else the number of old slots scanned
        self.new_keys, self.log, self.swaps = [], [], 0
        self.max_share = F(0)
        self.new_start_share = F(0)
        self.longest_scan = 0
        self.max_units = self.max_writes = self.max_writes_no_log = 0
        self.peak_dead, self.logged, self.max_copies = 0, [], 1

    def contains(self, key):
        i = bisect_left(self.keys, key)
        return i < len(self.keys) and self.keys[i] == key and not self.dead[i]

    def _units(self):
        """Do the delete's share of the rebuild; return (writes, units, slots_scanned_this_delete)."""
        writes = units = scanned = 0
        S = len(self.keys)
        if self.budget == 'copies':
            copied = 0
            while copied < self.work and self.scan < S:
                i = self.scan
                self.scan += 1
                scanned += 1
                if not self.dead[i]:
                    self.new_keys.append(self.keys[i])
                    copied += 1
                    writes += 1
            units = copied
        else:
            while units < self.work and (self.scan < S or self.log):
                if self.scan < S:
                    i = self.scan
                    self.scan += 1
                    scanned += 1
                    if not self.dead[i]:
                        self.new_keys.append(self.keys[i])
                        writes += 1
                else:
                    key = self.log.pop(0)
                    j = bisect_left(self.new_keys, key)
                    assert self.new_keys[j] == key
                    self.new_dead.add(j)
                    writes += 1
                units += 1
        return writes, units, scanned

    def delete(self, key):
        i = bisect_left(self.keys, key)
        assert i < len(self.keys) and self.keys[i] == key and not self.dead[i]
        self.dead[i] = 1
        self.ndead += 1
        self.peak_dead = max(self.peak_dead, self.ndead)
        writes = writes_no_log = 1
        if self.scan is not None and i < self.scan:
            self.logged.append(key)
            self.log.append(key)  # behind the scan: logged, replayed in the new copy before the swap
            writes += 1
        if self.scan is None and 4 * self.ndead >= len(self.keys):
            self.scan, self.new_keys, self.log, self.new_dead = 0, [], [], set()
        if self.scan is not None:
            self.max_copies = 2  # the old copy and the one being built; a rebuild never starts while another runs
        S = len(self.keys)
        self.max_share = max(self.max_share, F(self.ndead, S)) if S >= 64 else self.max_share
        units = scanned = 0
        if self.scan is not None:
            w, units, scanned = self._units()
            writes += w
            writes_no_log += w
            self.longest_scan = max(self.longest_scan, scanned)
            if self.scan >= S and not self.log:
                # swap: the new copy is the old one's live keys that were copied, minus the replayed deletes
                nk = self.new_keys
                self.keys = nk
                self.dead = bytearray(len(nk))
                for j in self.new_dead:
                    self.dead[j] = 1
                self.ndead = len(self.new_dead)
                self.scan, self.new_keys, self.log, self.swaps = None, [], [], self.swaps + 1
                if len(nk) >= 64:
                    self.new_start_share = max(self.new_start_share, F(self.ndead, len(nk)))
        self.max_units = max(self.max_units, units)
        self.max_writes = max(self.max_writes, writes)
        self.max_writes_no_log = max(self.max_writes_no_log, writes_no_log)
        return writes


def test_background_tombstones():
    v = BgTomb(range(1, 17))
    costs, state = [], []
    for k in (3, 6, 10, 14, 2, 15):
        costs.append(v.delete(k))
        state.append((v.scan, list(v.log)))
    assert costs == [1, 1, 1, 7, 8, 4], costs  # a log entry is a write too
    assert state[3] == (8, []) and state[4] == (16, [2]), state  # the scan starts at the 4th delete; the log holds [2] after delete 5
    assert v.swaps == 1 and v.scan is None  # swap after delete 6
    assert len(v.keys) == 12 and v.ndead == 2  # the new copy: 12 slots with 2 tombstones
    assert [k for k, d in zip(v.keys, v.dead) if d] == [2, 15]
    assert [k for k, d in zip(v.keys, v.dead) if not d] == [1, 4, 5, 7, 8, 9, 11, 12, 13, 16]
    assert v.peak_dead == 6  # the old copy peaks at 6 tombstones of 16 before the swap
    assert v.logged == [2, 15] and v.log == []  # both entries were logged, and replayed before the swap

    # at 1,048,576 keys: all keys deleted, smallest first, largest first, seeded random
    N = 1 << 20
    shares = []
    for name, order in (('smallest', list(range(N))), ('largest', list(range(N - 1, -1, -1))), ('random', random.Random(5).sample(range(N), N))):
        v = BgTomb(range(N))
        ref = set(range(N))
        for j, key in enumerate(order):
            v.delete(key)
            ref.discard(key)
            if j % 50_000 == 0:
                for probe in (key, order[min(j + 1, N - 1)], order[j // 2]):
                    assert v.contains(probe) == (probe in ref)
        assert v.max_writes == 10 and v.max_writes_no_log == 9 and v.max_units == 8, (name, v.max_writes, v.max_writes_no_log, v.max_units)
        assert v.max_share <= F(11, 28), (name, float(v.max_share))
        assert v.new_start_share <= F(4, 17)
        assert v.max_copies == 2  # never more than two copies: the old and the new
        shares.append(float(v.max_share))
    assert round(100 * 11 / 28) == 39 and round(100 * 4 / 17) == 24  # 39% and under a quarter

    # the broken budget: 8 copies per delete (a write budget, not a time budget): one delete scans a long run of tombstones
    longest = {}
    for name, order in (('smallest', range(N)), ('largest', range(N - 1, -1, -1))):
        v = BgTomb(range(N), budget='copies')
        for key in order:
            v.delete(key)
            if v.swaps:
                break
        longest[name] = v.longest_scan
    assert longest['smallest'] == 262_152, longest
    assert longest['largest'] == 349_528, longest
    return shares, longest


# ---------------------------------------------------------------------------------------------------------------
# The scapegoat tree (Galperin and Rivest, SODA 1993), with node writes as the unit
# ---------------------------------------------------------------------------------------------------------------
class Node:
    __slots__ = ('key', 'left', 'right', 'size')

    def __init__(self, key):
        self.key, self.left, self.right, self.size = key, None, None, 1


class Scapegoat:
    """No balance data in nodes. The tree keeps size and max_size. alpha strictly between 1/2 and 1 (a Fraction).
    h(n) = floor(log base 1/alpha of n), exact. A node deeper than h(n) (n counts the new node) triggers a climb to the
    first ancestor with a child holding more than alpha of its subtree (rule 'weight'), or to the deepest ancestor x_i with
    i > h(size(x_i)) (rule 'height', the paper's (4.6)). The scapegoat's subtree is rebuilt perfectly balanced:
    mid='lower' makes the lower middle node the root (index floor((s - 1) / 2)), mid='upper' the paper's BUILD-TREE (s // 2).
    (Subtree sizes are cached in the nodes; the paper computes them on the way up, which gives the same numbers.)
    Cost of an insert = 1 + the nodes of a rebuilt subtree; of a delete = 1 + the nodes of a full rebuild."""

    def __init__(self, alpha=F(2, 3), rule='weight', mid='lower'):
        assert F(1, 2) < alpha < 1
        self.alpha, self.num, self.den = alpha, alpha.numerator, alpha.denominator
        self.rule, self.mid = rule, mid
        self.root, self.size, self.max_size = None, 0, 0
        # thresholds[h] = the smallest n with floor(log_{1/alpha} n) >= h, i.e. n >= (1/alpha)**h
        self.thr = [-(-(self.den ** h) // (self.num ** h)) for h in range(200)]
        self.ub = 0  # an upper bound on the height (the deepest depth), never lowered
        self.last_rebuild = 0

    def h(self, n):
        return bisect_right(self.thr, n) - 1

    # -- rebuild -------------------------------------------------------------------------------------------
    @staticmethod
    def flatten(x):
        out, stack = [], []
        while stack or x is not None:
            while x is not None:
                stack.append(x)
                x = x.left
            x = stack.pop()
            out.append(x)
            x = x.right
        return out

    def build(self, nodes, lo, hi):
        s = hi - lo
        if s <= 0:
            return None
        mid = lo + ((s - 1) // 2 if self.mid == 'lower' else s // 2)
        x = nodes[mid]
        x.left = self.build(nodes, lo, mid)
        x.right = self.build(nodes, mid + 1, hi)
        x.size = s
        return x

    def unbalanced(self, x):
        """True if a child of x holds more than alpha of x's subtree (x is not alpha-weight-balanced)."""
        l = x.left.size if x.left is not None else 0
        r = x.right.size if x.right is not None else 0
        return max(l, r) * self.den > self.num * x.size

    # -- operations ----------------------------------------------------------------------------------------
    def insert(self, key):
        path, x = [], self.root
        while x is not None:
            path.append(x)
            x = x.left if key < x.key else x.right
        node = Node(key)
        if path:
            if key < path[-1].key:
                path[-1].left = node
            else:
                path[-1].right = node
        else:
            self.root = node
        for a in path:
            a.size += 1
        self.size += 1
        if self.size > self.max_size:
            self.max_size = self.size
        d = len(path)
        self.last_depth = d
        self.last_scapegoat = None
        if d <= self.h(self.size):
            if d > self.ub:
                self.ub = d
            return 1
        # too deep: climb. path[d - j] is the j-th ancestor x_j of the new node.
        goat = None
        if self.rule == 'weight':
            for j in range(1, d + 1):
                a = path[d - j]
                if self.unbalanced(a):
                    goat = d - j
                    break
        else:
            for j in range(1, d + 1):
                a = path[d - j]
                if j > self.h(a.size):
                    goat = d - j
                    break
        assert goat is not None, 'Lemma 5.1: a too-deep node has a weight-unbalanced ancestor'
        g = path[goat]
        self.last_scapegoat = g.key
        s = g.size
        nodes = self.flatten(g)
        new_root = self.build(nodes, 0, s)
        if goat == 0:
            self.root = new_root
        else:
            p = path[goat - 1]
            if p.left is g:
                p.left = new_root
            else:
                p.right = new_root
        self.ub = max(self.ub, goat + s.bit_length() - 1)  # a balanced subtree of s nodes has depth floor(log2 s)
        self.last_rebuild = s
        return 1 + s

    def delete(self, key):
        path, x = [], self.root
        while x.key != key:
            path.append(x)
            x = x.left if key < x.key else x.right
        if x.left is not None and x.right is not None:
            path.append(x)
            y = x.right
            while y.left is not None:
                path.append(y)
                y = y.left
            x.key = y.key
            target, child = y, y.right
        else:
            target, child = x, (x.left if x.left is not None else x.right)
        for a in path:
            a.size -= 1
        if not path:
            self.root = child
        elif path[-1].left is target:
            path[-1].left = child
        else:
            path[-1].right = child
        self.size -= 1
        cost = 1
        self.last_rebuild = 0
        if self.size * self.den < self.num * self.max_size:  # strict: size < alpha * max_size
            nodes = self.flatten(self.root)
            self.root = self.build(nodes, 0, len(nodes))
            cost += len(nodes)
            self.max_size = self.size
            self.last_rebuild = len(nodes)
            self.ub = max(0, self.size.bit_length() - 1)
        return cost

    # -- inspection ----------------------------------------------------------------------------------------
    def depths(self):
        out, stack = {}, [(self.root, 0)] if self.root else []
        while stack:
            x, d = stack.pop()
            out[x.key] = d
            if x.left:
                stack.append((x.left, d + 1))
            if x.right:
                stack.append((x.right, d + 1))
        return out

    def height(self):
        best, stack = -1, [(self.root, 0)] if self.root else []
        while stack:
            x, d = stack.pop()
            best = max(best, d)
            if x.left:
                stack.append((x.left, d + 1))
            if x.right:
                stack.append((x.right, d + 1))
        return best

    def shape(self):
        def go(x):
            return None if x is None else (x.key, go(x.left), go(x.right))
        return go(self.root)


def test_scapegoat_example():
    t = Scapegoat()
    costs = [t.insert(k) for k in (22, 31, 18, 87, 54, 51, 80, 63)]
    assert costs == [1] * 8  # no rebuild before 69
    d = t.depths()
    assert d == {22: 0, 18: 1, 31: 1, 87: 2, 54: 3, 51: 4, 80: 4, 63: 5}
    assert t.h(8) == 5 and t.h(9) == 5 and t.h(1) == 0 and t.h(2) == 1 and t.h(3) == 2  # (3/2)**5 = 7.59 <= 8, 9 < (3/2)**6 = 11.39
    assert F(3, 2) ** 5 < 8 and F(3, 2) ** 6 > 9
    assert round(math.log(9, 1.5), 2) == 5.42 and math.floor(math.log(9, 1.5)) == 5
    assert 1.5 ** 5 < 8 < 1.5 ** 6 and round(1.5 ** 5, 1) == 7.6 and round(1.5 ** 6, 1) == 11.4
    assert (t.size, t.max_size) == (8, 8)
    # the heavier child's share on the path 63, 80, 54, 87, 31, 22 once 69 is in
    def depth_of_new(tree, key):
        x, dd = tree.root, 0
        while x.key != key:
            x = x.left if key < x.key else x.right
            dd += 1
        return dd
    # insert 69 without the rebuild, to read the shares
    probe = Scapegoat()
    for k in (22, 31, 18, 87, 54, 51, 80, 63):
        probe.insert(k)
    probe.h = lambda n: 99  # (no rebuild: only to read the sizes)
    probe.insert(69)
    assert depth_of_new(probe, 69) == 6
    shares = {}
    x = probe.root
    while x.key != 69:
        l = x.left.size if x.left else 0
        r = x.right.size if x.right else 0
        shares[x.key] = (max(l, r), x.size)
        x = x.left if 69 < x.key else x.right
    assert shares == {22: (7, 9), 31: (6, 7), 87: (5, 6), 54: (3, 5), 80: (2, 3), 63: (1, 2)}, shares
    # 80's 2 of 3 is exactly alpha: still allowed; 54's 3 of 5 is under 2/3 though it looks lopsided; 87's 5 of 6 is over
    by_key = {}
    x = probe.root
    while x.key != 69:
        by_key[x.key] = probe.unbalanced(x)
        x = x.left if 69 < x.key else x.right
    assert by_key == {22: True, 31: True, 87: True, 54: False, 80: False, 63: False}, by_key  # climbing from 69, the first True is 87
    # the potential at 87 before the rebuild: left 5, right 0, so |5 - 0| = 5
    n87 = subtree = probe.root.right.right
    assert n87.key == 87 and abs((n87.left.size if n87.left else 0) - (n87.right.size if n87.right else 0)) == 5
    # Galperin and Rivest scale the potential by a constant c: at 87 (size 6, delta 5) c = 3 gives 15, which pays for the
    # rebuild (6 writes) plus a climb that counts at most 6 more sizes. In general, for alpha = 2/3, an unbalanced node of
    # size s has delta > s/3 + 1, so 3 * delta > s + 3.
    d87 = 5
    assert n87.size == 6 and d87 > F(n87.size, 3) + 1 and 3 * d87 == 15 and 3 * d87 >= 6 + 6
    # insert 69: depth 6 > h(9) = 5
    c69 = t.insert(69)
    assert t.last_depth == 6 and t.last_scapegoat == 87 and t.last_rebuild == 6 and c69 == 7
    assert (t.size, t.max_size) == (9, 9)
    sub = t.shape()
    assert sub == (22, (18, None, None), (31, None, (63, (51, None, (54, None, None)), (80, (69, None, None), (87, None, None)))))
    d = t.depths()
    # depths in the whole tree: 22:0, 31:1, 63:2 (the rebuilt subtree hangs under 31's right), 51 and 80:3, 54, 69, 87: 4
    assert d == {22: 0, 18: 1, 31: 1, 63: 2, 51: 3, 80: 3, 54: 4, 69: 4, 87: 4}
    assert t.height() == 4 and max(depths for depths in d.values()) == 4  # height 6 -> 4
    # the lower middle: 63 is the root of the six sorted nodes; the paper's BUILD-TREE uses the upper middle: 69
    six = [51, 54, 63, 69, 80, 87]
    assert six[(6 - 1) // 2] == 63 and six[6 // 2] == 69
    tu = Scapegoat(mid='upper')
    for k in (22, 31, 18, 87, 54, 51, 80, 63, 69):
        tu.insert(k)
    assert tu.depths()[69] == 2 and tu.height() == 4  # both conventions give height 4 here

    # the alternative scapegoat rule (4.6): the deepest ancestor x_i with i > h(size(x_i)): 31, 7 nodes, cost 8
    t2 = Scapegoat(rule='height')
    for k in (22, 31, 18, 87, 54, 51, 80, 63):
        t2.insert(k)
    c = t2.insert(69)
    assert t2.last_scapegoat == 31 and t2.last_rebuild == 7 and c == 8
    # at 87: i = 4 is not > h(6) = 4; at 31: i = 5 > h(7) = 4
    assert Scapegoat().h(6) == 4 and Scapegoat().h(7) == 4
    assert not (4 > Scapegoat().h(6)) and 5 > Scapegoat().h(7)

    # delete: from the tree above, four deletes (18, 51, 69, 87) cost [1, 1, 1, 6]; rebuild at size 5 < 6 = 2/3 * 9
    dc = [t.delete(k) for k in (18, 51, 69, 87)]
    assert dc == [1, 1, 1, 6], dc
    assert t.size == 5 and t.max_size == 5  # reset
    assert F(2, 3) * 9 == 6 and 5 < 6 and not 6 < 6
    assert sorted(t.depths()) == [22, 31, 54, 63, 80]
    # Wikipedia's "<=" would rebuild at size 6, after 3 deletes (not followed)
    t3 = Scapegoat()
    for k in (22, 31, 18, 87, 54, 51, 80, 63, 69):
        t3.insert(k)
    sizes = []
    for k in (18, 51, 69):
        t3.delete(k)
        sizes.append(t3.size)
    assert sizes == [8, 7, 6] and not (t3.last_rebuild)  # strict "<": no rebuild at 6

    # alpha = 0.8: nothing is deep in the example (More questions c)
    t4 = Scapegoat(alpha=F(4, 5))
    assert t4.h(9) == 9 and F(5, 4) ** 9 <= 9 < F(5, 4) ** 10
    for k in (22, 31, 18, 87, 54, 51, 80, 63, 69):
        assert t4.insert(k) == 1
    assert F(5, 6) > F(4, 5)  # 87 has 5 of 6 = 0.83 > 0.8, but the climb only starts from a deep node
    assert round(5 / 6, 2) == 0.83

    # the counters at a million: the first size below (2/3) * 1,000,000
    size, mx, deletes = 1_000_000, 1_000_000, 0
    while not size * 3 < 2 * mx:
        size -= 1
        deletes += 1
    assert (size, deletes) == (666_666, 333_334)
    assert 666_666 < F(2_000_000, 3) < 666_667
    # and the full rule on 1,000 keys
    t5 = Scapegoat()
    for k in range(1, 1001):
        t5.insert(k)
    n_del = 0
    while True:
        c = t5.delete(1000 - n_del)
        n_del += 1
        if c > 1:
            break
    assert (t5.size, n_del, c) == (666, 334, 667)


def pstats(costs):
    s = sorted(costs)
    return {p: pct(s, p) for p in ('50', '99', '99.9')} | {'max': s[-1]}


def run_sorted(n, alpha=F(2, 3), mid='lower', rule='weight', check_every=0):
    t = Scapegoat(alpha, rule, mid)
    costs, deepest = [], 0
    for i in range(1, n + 1):
        costs.append(t.insert(i))
        assert t.ub <= t.h(t.size), (i, t.ub, t.h(t.size))  # Theorem 5.1: inserts only keep the tree alpha-height-balanced
        deepest = max(deepest, t.last_depth)
        if check_every and i % check_every == 0:
            assert t.height() <= t.h(t.size)
    return t, costs, deepest


def test_scapegoat_million():
    t, costs, deepest = run_sorted(MILLION, check_every=100_000)
    assert sum(costs) == 28_240_382 and round(sum(costs) / MILLION, 2) == 28.24
    st = pstats(costs)
    assert st == {'50': 5, '99': 246, '99.9': 2_460, 'max': 751_333}, st
    assert costs.index(751_333) + 1 == 900_961 and 751_333 - 1 == 751_332
    assert t.height() == 33 and t.h(MILLION) == 34
    assert deepest == 35  # a new node lands one level below the limit before its rebuild; after every insert the depth is <= h(n)
    assert round(sum(costs) / MILLION) == 28
    top = sorted(((c, i + 1) for i, c in enumerate(costs) if c > 1), reverse=True)[:256]
    spikes = sorted((i, c) for c, i in top)
    return spikes, costs


def test_scapegoat_random():
    rnd = random.Random(7)
    keys = rnd.sample(range(1, 10 ** 9), MILLION)
    t = Scapegoat()
    costs = [t.insert(k) for k in keys]
    st = pstats(costs)
    assert round(sum(costs) / MILLION, 2) == 1.04 and F(sum(costs), MILLION) > F(1043, 1000) - F(1, 1000)
    assert st['max'] == 191 and st['50'] == 1 and st['99'] == 1, st
    assert t.height() == 34 or t.height() <= t.h(t.size)
    return t.height(), sum(costs) / MILLION


def test_alpha_sweep():
    want = {F(11, 20): (55.74, 19, 15.76), F(2, 3): (22.81, 27, 20.09), F(3, 4): (17.04, 40, 27.09)}
    out = {}
    for alpha, (writes, height, avg_depth) in want.items():
        t, costs, _ = run_sorted(100_000, alpha=alpha)
        total_depth = sum(t.depths().values())
        got = (round(sum(costs) / 100_000, 2), t.height(), round(total_depth / 100_000, 2))
        assert got == (writes, height, avg_depth), (alpha, got)
        out[alpha] = got
    return out


def test_alternative_rule_million():
    t, costs, _ = run_sorted(MILLION, rule='height')
    assert round(sum(costs) / MILLION, 2) == 19.50 and max(costs) == 596_467 and t.height() <= 34
    return sum(costs) / MILLION, max(costs)


# ---------------------------------------------------------------------------------------------------------------
# Ehrlich's Gray code counter (Erickson, Lecture 9): constant worst-case time per increment
# ---------------------------------------------------------------------------------------------------------------
def test_ehrlich():
    n = 4
    G = [0] * n
    Fo = list(range(n + 1))
    codes, writes = [tuple(G)], []
    for _ in range(2 ** n - 1):
        w = 0
        j = Fo[0]
        Fo[0] = 0
        w += 1
        if j == n:
            G[n - 1] = 1 - G[n - 1]
            w += 1
        else:
            G[j] = 1 - G[j]
            Fo[j] = Fo[j + 1]
            Fo[j + 1] = j + 1
            w += 3
        codes.append(tuple(G))
        writes.append(w)
    assert len(set(codes)) == 16
    assert all(sum(a != b for a, b in zip(codes[i], codes[i + 1])) == 1 for i in range(15))
    assert max(writes) == 4
    assert [''.join(map(str, reversed(c))) for c in codes[:4]] == ['0000', '0001', '0011', '0010']


# ---------------------------------------------------------------------------------------------------------------
def main():
    test_percentiles()
    plain = test_plain()
    inc = test_incremental_appends()
    states, states1 = test_incremental_exhaustive()
    test_incremental_random()
    first_bad = test_rate_one_and_growth()
    test_costs_and_space()
    waited = test_queue(plain, inc)
    test_fanout()
    test_tombstones()
    shares, longest = test_background_tombstones()
    test_scapegoat_example()
    spikes, costs = test_scapegoat_million()
    height_random, mean_random = test_scapegoat_random()
    sweep = test_alpha_sweep()
    mean_alt, max_alt = test_alternative_rule_million()
    test_ehrlich()

    # the data scenes.tsx embeds for the million-insert strip must be exactly what the simulation produced
    import re
    from pathlib import Path
    scenes = (Path(__file__).parent / 'scenes.tsx').read_text()
    m = re.search(r'SG_SPIKES: \[number, number\]\[\] = (\[\[.*?\]\]);', scenes)
    assert m, 'scenes.tsx has no SG_SPIKES line (run: python3 examples.py --export)'
    assert [tuple(p) for p in eval(m.group(1))] == spikes, 'SG_SPIKES in scenes.tsx is stale (run: python3 examples.py --export)'

    print('plain: 2,048,575 writes, max 524,289, p99 1; incremental: max 3, p50 3')
    print('queue (gap 4): 349,515 waited; exhaustive states', states, '(rate 1:', states1, ')')
    print('first append that grows mid-copy at rate 1, g = 1.5:', first_bad)
    print('background tombstones: max old share', [round(x, 4) for x in shares], 'longest scan with a copies budget', longest)
    print('scapegoat random order: mean', round(mean_random, 3), 'height', height_random)
    print('alpha sweep', {str(k): v for k, v in sweep.items()})
    print('alternative rule: mean', round(mean_alt, 2), 'max', max_alt)
    print('ok')


if __name__ == '__main__':
    if '--export' in sys.argv:
        spikes, _ = test_scapegoat_million()
        print('export const SG_SPIKES: [number, number][] = ' + str([list(p) for p in spikes]).replace(' ', '') + ';')
    else:
        main()
