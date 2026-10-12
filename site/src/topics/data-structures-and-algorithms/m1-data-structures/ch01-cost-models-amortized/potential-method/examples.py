"""Every number and claim in the potential-method reel and Deep dive, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows, rounded on-screen literals included.

The chapter's rule (CHAPTER.md): an empty vector has capacity 0; the first push allocates 1; a push to a full vector
allocates ceil(g * cap) (at least cap + 1; g = 2 unless a block says otherwise), copies the n keys, then writes the new one.
One unit of cost = one element write (allocation and freeing are not counted). A pop costs 1, plus the keys it copies
when it shrinks. Shrink rules (made exact for this topic):
  shrink-at-a: after a pop, if n < a * cap (strictly), cap becomes cap // 2 and the n keys are copied;
               a = 1/4 is "shrink-at-1/4", a = 1/2 is "shrink-at-1/2"; one halving per pop; 1 -> 0 frees the vector.
  'at most half' variant: shrink when 2n <= cap.
A pop on an empty vector is not an operation. All potentials use Fractions so that Phi = 1/2 is exact."""
import math
import random
from fractions import Fraction as F

HALF, QUARTER = F(1, 2), F(1, 4)


class Vector:
    """The vector of 64-bit keys. `a` is the shrink fraction (a Fraction); `atmost=True` shrinks when 2n <= cap."""

    def __init__(self, a=QUARTER, g=2, atmost=False, n=0, cap=0):
        self.a, self.g, self.atmost, self.n, self.cap = a, F(g), atmost, n, cap
        self.copies = 0  # keys copied by resizes so far

    def grown(self, cap):
        return 1 if cap == 0 else max(math.ceil(self.g * cap), cap + 1)

    def push(self):
        c = 1
        if self.n == self.cap:
            self.copies += self.n
            c += self.n
            self.cap = self.grown(self.cap)
        self.n += 1
        return c

    def pop(self):
        assert self.n > 0, 'a pop on an empty vector is not an operation'
        self.n -= 1
        c = 1
        small = 2 * self.n <= self.cap if self.atmost else self.n < self.a * self.cap
        if small:
            self.copies += self.n
            c += self.n
            self.cap //= 2
        return c

    def state(self):
        return self.n, self.cap


def phi2(n, cap):
    """The two-piece potential: 2n - cap when alpha >= 1/2, cap/2 - n below."""
    return max(2 * n - cap, F(cap, 2) - n)


def run(v, ops, phi=phi2):
    """Run 'push'/'pop' ops; return per-op (c, amortized c-hat) lists and the potential before the first op."""
    cs, hats = [], []
    for op in ops:
        before = phi(v.n, v.cap)
        c = v.push() if op == 'push' else v.pop()
        cs.append(c)
        hats.append(c + phi(v.n, v.cap) - before)
    return cs, hats


def fill_and_push(v, C):
    """The adversarial sequence's start: fill from empty to n = cap = C (a power of two), then push once."""
    cs = [v.push() for _ in range(C)]
    assert v.state() == (C, C)
    cs.append(v.push())
    assert v.state() == (C + 1, 2 * C)
    return cs


ROUND = ['pop', 'pop', 'push', 'push']

# ---- Step 1-2: the rules, one round from (17, 32) -------------------------------------------------------------------
v = Vector(HALF, n=17, cap=32)
cs, _ = run(v, ROUND)
assert cs == [1, 16, 1, 17] and sum(cs) == 35 == 1 + 16 + 1 + 17 and v.state() == (17, 32)
v = Vector(HALF, n=17, cap=32)
v.pop()
assert v.state() == (16, 32)  # 16 of 32 is exactly half: not less than half, no shrink on the first pop
assert v.pop() == 16 and v.state() == (15, 16)  # the second pop leaves 15 of 32, under half: halve to 16, copy 15
assert 1 + 15 == 16 and v.push() == 1 and v.state() == (16, 16)  # 15 of 16 slots: the push fits
assert v.push() == 17 and v.state() == (17, 32)  # now full: doubles, copies 16, writes 1
assert [1, 19, 4, 64] and 1 + 16 + 1 + 1 == 19 and 4 * 1 == 4 and 4 * 16 == 64  # the wrong options of the predict step

# ---- Step 3, 16: the opening sequence under both rules, C = 16 -------------------------------------------------------
C = 16
costs_half = []
for a in (HALF, QUARTER):
    v = Vector(a)
    cs = fill_and_push(v, C)
    for _ in range(8):
        cs += run(v, ROUND)[0]
    assert len(cs) == 49 == 16 + 1 + 8 * 4
    if a == HALF:
        costs_half = cs
        assert cs[:16] == [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1] and sum(cs[:16]) == 31
        assert cs[16] == 17 and cs[17:] == [1, 16, 1, 17] * 8 and sum(cs[17:]) == 280 == 8 * 35
        assert sum(cs) == 328 and v.copies == 279 and 3 * 49 == 147
    else:
        assert cs[:17] == costs_half[:17] and cs[17:] == [1] * 32 and sum(cs[17:]) == 32
        assert sum(cs) == 80 and v.copies == 31
assert 16 + 1 + 32 * 0 == 17 and 33 == 16 + 1 + 16 and 16 == 8 * 2  # pushes 33, pops 16
assert 3 * 33 + 2 * 16 == 131 >= 80
assert 328 - 80 == 248 and 279 - 31 == 248
assert 31 == 2 * C - 1 and 279 == 2 * C - 1 + 8 * (2 * C - 1) and 8 * (2 * C - 1) == 248
assert [F(2 * c + 3, 4) for c in (16, 1024, 1_048_576)] == [F(35, 4), F(2051, 4), F(2097155, 4)]
assert [float(F(2 * c + 3, 4)) for c in (16, 1024, 1_048_576)] == [8.75, 512.75, 524288.75]

# the per-operation cost of the rounds equals (2C + 3)/4 by simulation (C = 16 and 1,024)
for C in (16, 1024):
    v = Vector(HALF)
    fill_and_push(v, C)
    cs, _ = run(v, ROUND * 8)
    assert F(sum(cs), len(cs)) == F(2 * C + 3, 4)
assert 8 * 4 == 32 and 8 * 35 == 280 and 280 + 48 == 328  # 48 = fill (31) + the push (17)

# ---- Step 4, 5: the counter priced by a potential, telescoping ------------------------------------------------------
def ones(x):
    return bin(x).count('1')


def increment_cost(x):
    """Bits flipped by x -> x + 1: the trailing 1s become 0 and one 0 becomes 1."""
    return ones(x ^ (x + 1))


x = 0b00111
c = increment_cost(x)
assert (x + 1) == 0b01000 == 8 and c == 4 and ones(x) == 3 and ones(x + 1) == 1
assert c + ones(x + 1) - ones(x) == 2 and 1 - 3 == -2  # c-hat = 2, Delta Phi = -2

cs16 = [increment_cost(i) for i in range(16)]
hats16 = [c + ones(i + 1) - ones(i) for i, c in enumerate(cs16)]
assert hats16 == [2] * 16 and sum(cs16) == 31 and sum(hats16) == 32 and ones(16) == 1
assert sum(hats16) == sum(cs16) + ones(16) - ones(0) and 32 == 31 + 1 - 0
tot = 0
for n in range(1, 100_001):
    tot += increment_cost(n - 1)
    assert n % 997 or (tot == 2 * n - ones(n))
assert tot == 2 * 100_000 - ones(100_000)
# every increment: c-hat = 2 (for n up to 100,000), so the sum of c-hat is 2n
assert all(increment_cost(i) + ones(i + 1) - ones(i) == 2 for i in range(100_000))
# a 3-bit wrapping counter: Phi >= 0 and c-hat <= 2 at every increment (the wrap has c-hat = 2 - k)
for i in range(32):
    cur = i % 8
    nxt = (cur + 1) % 8
    cw = ones(cur ^ nxt)
    assert cw + ones(nxt) - ones(cur) <= 2
assert ones(0b111 ^ 0) == 3 and 3 + ones(0) - ones(7) == 0  # the wrap 111 -> 000: c = 3 flips, Phi falls by 3, c-hat = 0

# Erickson's increment/decrement counter (P, N): Phi = ones(P) + ones(N); c-hat <= 2
rs = random.Random(5)
P = N = 0
for _ in range(20_000):
    old = ones(P) + ones(N)
    if rs.random() < 0.5:
        P += 1
        flips = ones((P - 1) ^ P)
    else:
        N += 1
        flips = ones((N - 1) ^ N)
    assert flips + ones(P) + ones(N) - old <= 2
# the plain counter alternating 15 <-> 16 (increment, decrement, ...) flips 5 bits every time
assert ones(15 ^ 16) == 5

# ---- Step 6: the multipop stack -------------------------------------------------------------------------------------
def stack_run(ops):
    size, costs, phis = 0, [], []
    for op, k in ops:
        if op == 'push':
            size += 1
            costs.append(1)
        else:
            m = min(k, size)
            size -= m
            costs.append(m)
        phis.append(size)
    return costs, phis


ops = [('push', 0)] * 6 + [('multipop', 4)] + [('push', 0)] * 2 + [('multipop', 10)]
costs, phis = stack_run(ops)
assert costs == [1, 1, 1, 1, 1, 1, 4, 1, 1, 4] and sum(costs) == 16
assert phis == [1, 2, 3, 4, 5, 6, 2, 3, 4, 0]
hats = [c + p - q for c, p, q in zip(costs, phis, [0] + phis[:-1])]
assert hats == [2, 2, 2, 2, 2, 2, 0, 2, 2, 0] and sum(hats) == 16 == sum(costs) + 0
# Tarjan's operations: k pops, then one push, each has c-hat = 2 (pops lower Phi by k, the push raises it by 1)
rs = random.Random(11)
for _ in range(1000):
    size, total_c, total_hat = 0, 0, 0
    m = rs.randrange(1, 200)
    for _ in range(m):
        k = rs.randrange(0, 8)
        pops = min(k, size)
        c = pops + 1
        newsize = size - pops + 1
        hat = c + newsize - size
        assert hat == 2
        total_c, total_hat, size = total_c + c, total_hat + hat, newsize
    assert total_c == total_hat - size and total_c <= 2 * m

# ---- Step 7, 8: the doubling vector with Phi = 2n - cap ------------------------------------------------------------
v = Vector()
cs, caps, phis, hats = [], [], [], []
prev = 0
for i in range(16):
    c = v.push()
    cs.append(c)
    caps.append(v.cap)
    ph = 2 * v.n - v.cap
    phis.append(ph)
    hats.append(c + ph - prev)
    prev = ph
assert cs == [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1] and sum(cs) == 31
assert caps == [1, 2, 4, 4, 8, 8, 8, 8, 16, 16, 16, 16, 16, 16, 16, 16]
assert phis == [1, 2, 2, 4, 2, 4, 6, 8, 2, 4, 6, 8, 10, 12, 14, 16]
assert hats == [2] + [3] * 15 and sum(hats) == 47 == 31 + 16 and sum(hats) == sum(cs) + phis[-1] - 0
assert 48 - 1 == 47 and 3 * 16 == 48
# Phi just before each grow == n (the copies); just after each copying grow == 2; after append 1 it is 1
v = Vector()
bank = 0  # the last reel's bank under a charge of 3
for i in range(1, 2**17 + 1):
    n0, cap0 = v.n, v.cap
    c = v.push()
    bank += 3 - c
    assert bank == 2 * v.n - v.cap + 1  # the bank is 2n - cap + 1 ...
    assert 2 * v.n - v.cap == bank - 1  # ... so Phi = the bank without its spare coin
    if c > 1 and n0 > 0:
        assert 2 * n0 - cap0 == n0 and 2 * v.n - v.cap == 2
    if i == 1:
        assert 2 * v.n - v.cap == 1
# a million appends
v = Vector()
sum_c = sum_hat = 0
prev = 0
for i in range(1_000_000):
    c = v.push()
    ph = 2 * v.n - v.cap
    hat = c + ph - prev
    assert ph >= 0 and hat <= 3
    sum_c += c
    sum_hat += hat
    prev = ph
assert ph == 951_424 and sum_hat == 2_999_999 and sum_c == 2_048_575 == sum_hat - ph
assert 1_048_575 == 2**20 - 1 and 1_000_000 + 1_048_575 == 2_048_575

# which Phi (step 7): c-hat of append 9 under four potentials
def hat9(phi):
    v = Vector()
    out = None
    for i in range(9):
        before = phi(v.n, v.cap)
        c = v.push()
        out = c + phi(v.n, v.cap) - before
    return out, c


assert hat9(lambda n, cap: n)[0] == 10 and hat9(lambda n, cap: cap - n)[0] == 16
assert hat9(lambda n, cap: 2 * n - cap)[0] == 3 and hat9(lambda n, cap: cap)[0] == 17 and hat9(lambda n, cap: n)[1] == 9
assert 9 - 6 == 3 and 8 + 1 == 9 and 9 + 1 == 10
for phi in (lambda n, cap: n, lambda n, cap: cap - n, lambda n, cap: 2 * n - cap, lambda n, cap: cap):
    v = Vector()
    assert phi(0, 0) == 0
    for _ in range(2000):
        v.push()
        assert phi(v.n, v.cap) >= 0
for k in range(1, 20):  # under Phi = n the append that copies 2^k keys has c-hat = 2^k + 2
    v = Vector(n=2**k, cap=2**k)
    c = v.push()
    assert c == 2**k + 1 and c + (v.n - 2**k) == 2**k + 2
assert 2**19 + 2 == 524_290

# ---- Step 9: Phi = 2n - cap with pops goes negative ------------------------------------------------------------------
v = Vector(QUARTER)
cs = [v.push() for _ in range(17)]
assert v.state() == (17, 32) and sum(cs) == 48
sum_c = 48
sum_hat = 48 + 2  # sum of c-hat over the 17 pushes = sum c + Phi_17 - 0, Phi_17 = 2 * 17 - 32 = 2
v = Vector(QUARTER)
for _ in range(17):
    v.push()
phs, hs = [], []
ph = 2
for k in range(9):  # 9 pops: n = 17 -> 8
    c = v.pop()
    assert c == 1 and v.cap == 32
    nph = 2 * v.n - 32
    hs.append(c + nph - ph)
    ph = nph
    phs.append(ph)
assert v.n == 8 and phs == [0, -2, -4, -6, -8, -10, -12, -14, -16] and hs == [-1] * 9
assert sum_c + 2 == 50 and sum_hat + hs[0] + hs[1] == 48 and sum_hat - 2 == 48  # after pop 2: 50 actual, 48 amortized
assert 48 < 50
# the shrinking pop (8 -> 7, cap 32 -> 16) under Phi = 2n - cap: c = 8, Phi -16 -> -2, c-hat = 22
assert v.pop() == 8 and v.state() == (7, 16) and 8 + (2 * 7 - 16) - (2 * 8 - 32) == 22 == 8 + 14
# Blum's footnote: push, push, pop, pop with Phi = 2n - cap goes 1, 2, 0, -2 and costs 5, not 4
v = Vector(F(0))  # a vector that never shrinks, as in Blum's setting
ph_seq, cs_b = [], []
for op in ('push', 'push', 'pop', 'pop'):
    cs_b.append(v.push() if op == 'push' else v.pop())
    ph_seq.append(2 * v.n - v.cap)
assert ph_seq == [1, 2, 0, -2] and sum(cs_b) == 5 and 3 + 3 - 1 - 1 == 4

# ---- Step 10-12: the two-piece potential ---------------------------------------------------------------------------
assert phi2(32, 32) == 32 and phi2(16, 32) == 0 and phi2(8, 32) == 8 and phi2(0, 1) == F(1, 2)
assert 32 // 4 == 8 and 8 - 1 == 7 and 32 * 2 // 4 == 16
assert all(phi2(n, cap) == (2 * n - cap if 2 * n >= cap else F(cap, 2) - n) and phi2(n, cap) >= 0 for cap in (2, 4, 8, 32) for n in range(cap + 1))
# the shrinking pop of step 11: (8, 32) -> (7, 16)
v = Vector(QUARTER, n=8, cap=32)
_, h = run(v, ['pop'])
assert v.state() == (7, 16) and h == [1] and phi2(8, 32) == 8 and phi2(7, 16) == 1 and 8 + 1 - 8 == 1 and 8 + 7 == 15 and 8 - 7 == 1
assert 16 - 8 == 8 and 8 - 7 == 1  # Phi = 8 before, 1 after: cap/2 - n
# BFS over every state reachable from empty under shrink-at-1/4, capacity <= 4,096
CAPMAX = 4096
seen, queue = {(0, 0)}, [(0, 0)]
hat_seen = {'push': set(), 'push_resize': set(), 'pop': set(), 'pop_shrink': set()}
rows = {}
while queue:
    n, cap = queue.pop()
    for op in ('push', 'pop'):
        if op == 'pop' and n == 0:
            continue
        v = Vector(QUARTER, n=n, cap=cap)
        c = v.push() if op == 'push' else v.pop()
        if v.cap > CAPMAX:
            continue
        hat = c + phi2(v.n, v.cap) - phi2(n, cap)
        resized = v.cap != cap
        hat_seen[op + ('_resize' if resized and op == 'push' else '_shrink' if resized else '')].add(hat)
        assert phi2(v.n, v.cap) >= 0
        if (v.n, v.cap) not in seen:
            seen.add((v.n, v.cap))
            queue.append((v.n, v.cap))
        # the six rows of step 12 (ordinary sizes)
        if cap >= 8:
            alpha_ge = 2 * n >= cap
            if op == 'push' and not resized and alpha_ge and n > 0:
                rows.setdefault('push, alpha >= 1/2', set()).add((c, phi2(v.n, v.cap) - phi2(n, cap), hat))
            if op == 'push' and resized:
                rows.setdefault('push that grows', set()).add((c == n + 1, phi2(v.n, v.cap) - phi2(n, cap) == 2 - n, hat))
            if op == 'push' and not resized and not alpha_ge:
                rows.setdefault('push, alpha < 1/2', set()).add((c, phi2(v.n, v.cap) - phi2(n, cap), hat))
            if op == 'pop' and not resized and 2 * v.n >= cap:
                rows.setdefault('pop, stays >= 1/2', set()).add((c, phi2(v.n, v.cap) - phi2(n, cap), hat))
            if op == 'pop' and not resized and 2 * v.n < cap:
                rows.setdefault('pop, ends below 1/2', set()).add((c, phi2(v.n, v.cap) - phi2(n, cap), hat))
            if op == 'pop' and resized:
                rows.setdefault('pop that shrinks', set()).add((c == cap // 4, phi2(v.n, v.cap) - phi2(n, cap) == 1 - cap // 4, hat))
assert len(seen) == 6158
assert hat_seen['push'] == {F(0), F(3, 2), 3} and hat_seen['push_resize'] == {2, 3}
assert hat_seen['pop'] == {-1, 2} and hat_seen['pop_shrink'] == {0, 1, F(3, 2)}
assert max(hat_seen['push'] | hat_seen['push_resize']) == 3 and max(hat_seen['pop'] | hat_seen['pop_shrink']) == 2
assert rows['push, alpha >= 1/2'] == {(1, 2, 3)} and rows['push that grows'] == {(True, True, 3)}
assert rows['push, alpha < 1/2'] == {(1, -1, 0)} and rows['pop, stays >= 1/2'] == {(1, -2, -1)}
assert rows['pop, ends below 1/2'] == {(1, 1, 2)} and rows['pop that shrinks'] == {(True, True, 1)}
# edge cases at capacities 0-2: first push, push into an empty capacity 1, the shrink 2 -> 1, the pop that frees capacity 1
v = Vector(QUARTER)
assert run(v, ['push'])[1] == [2]  # first push: c = 1, Phi 0 -> 1
v = Vector(QUARTER, n=0, cap=1)
assert phi2(0, 1) == F(1, 2) and run(v, ['push'])[1] == [F(3, 2)]
v = Vector(QUARTER, n=1, cap=2)
assert run(v, ['pop'])[1] == [F(3, 2)] and v.state() == (0, 1)  # the pop that shrinks 2 -> 1
v = Vector(QUARTER, n=1, cap=1)
assert run(v, ['pop'])[1] == [0] and v.state() == (0, 0)
assert max(run(Vector(QUARTER, n=1, cap=1), ['push'])[1]) == 3  # ordinary pushes at capacities 1 and 2 still cost 3
# random sequences: Phi >= 0 after every operation and total c <= 3 pushes + 2 pops after every prefix
rs = random.Random(2026)
for trial in range(2000):
    bias = rs.choice([0.3, 0.5, 0.55, 0.7, 0.9])
    v = Vector(QUARTER)
    total = pushes = pops = 0
    total_hat_cap = 0
    for _ in range(rs.randrange(1, 3001)):
        if v.n == 0 or rs.random() < bias:
            total += v.push()
            pushes += 1
        else:
            total += v.pop()
            pops += 1
        assert phi2(v.n, v.cap) >= 0
        assert total <= 3 * pushes + 2 * pops <= 3 * (pushes + pops)
assert 3 * 49 == 147 and 3 * 33 + 2 * 16 == 131

# ---- Step 9/13: the ½ rule and the two-piece potential -----------------------------------------------------------
# One round under 1/2 from (17, 32): c = [1, 16, 1, 17], c-hat = [-1, 30, 3, 3]; under 1/4: c = [1, 1, 1, 1], c-hat = [-1, 2, 0, 3]
v = Vector(HALF, n=17, cap=32)
cs, hs = run(v, ROUND)
assert cs == [1, 16, 1, 17] and hs == [-1, 30, 3, 3]
v = Vector(QUARTER, n=17, cap=32)
cs, hs = run(v, ROUND)
assert cs == [1, 1, 1, 1] and hs == [-1, 2, 0, 3]
# the climb (step 13): quarter (8, 32) -> (7, 16) Phi 8 -> 1; half (16, 32) -> (15, 16) Phi 0 -> 14
assert (phi2(8, 32), phi2(7, 16)) == (8, 1) and (phi2(16, 32), phi2(15, 16)) == (0, 14) and (phi2(16, 16), phi2(17, 32)) == (16, 2)
assert 16 + 14 - 0 == 30 and 17 + 2 - 16 == 3 and 1 + 2 - 0 == 3 and 14 / 16 == 0.875 and F(8, 32) == QUARTER and F(1, 16) == F(1, 16)
for cap in (8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096):  # the shrinking pop under 1/2 has c-hat = cap - 2
    v = Vector(HALF, n=cap // 2, cap=cap)
    _, h = run(v, ['pop'])
    assert v.state() == (cap // 2 - 1, cap // 2) and h == [cap - 2]
assert [cap - 2 for cap in (32, 64, 128)] == [30, 62, 126] and 512 - 2 == 510 and 4096 - 2 == 4094
# the final gauge values of step 16 (shrink-at-1/4): 16 after the fill, 2 after the grow, then 0, 1, 0, 2 each round
v = Vector(QUARTER)
fill_and_push(v, 16)
assert phi2(16, 16) == 16 and phi2(17, 32) == 2
phi_round = []
for op in ROUND:
    v.push() if op == 'push' else v.pop()
    phi_round.append(phi2(v.n, v.cap))
assert phi_round == [0, 1, 0, 2]
v = Vector(QUARTER)
cs = fill_and_push(v, 16)
cs_all = list(cs)
hats_all = run(Vector(QUARTER), ['push'] * 17)[1]
v = Vector(QUARTER)
cs_a, h_a = run(v, ['push'] * 17)
for _ in range(8):
    c_, h_ = run(v, ROUND)
    cs_a += c_
    h_a += h_
assert sum(cs_a) == 80 and sum(h_a) == 82 == 80 + phi2(17, 32) and v.copies == 31 and phi2(17, 32) == 2

# ---- Step 14: hysteresis gaps -------------------------------------------------------------------------------------
def ops_until_resize(rule, state, op):
    v = Vector(rule, n=state[0], cap=state[1])
    for k in range(1, 100):
        cap0 = v.cap
        v.push() if op == 'push' else v.pop()
        if v.cap != cap0:
            return k
    return None


assert ops_until_resize(QUARTER, (17, 32), 'pop') == 10 and ops_until_resize(QUARTER, (17, 32), 'push') == 16
assert ops_until_resize(QUARTER, (7, 16), 'pop') == 4 and ops_until_resize(QUARTER, (7, 16), 'push') == 10
assert ops_until_resize(HALF, (17, 32), 'pop') == 2 and ops_until_resize(HALF, (15, 16), 'push') == 2
assert ops_until_resize(HALF, (15, 16), 'pop') == 8  # (the other side: 8 pops to the next shrink)

# ---- Step 3, Deep dive, lab: the honest scaling ---------------------------------------------------------------------
for k in range(2, 21):
    C = 2**k
    v = Vector(HALF, n=C + 1, cap=2 * C)
    cs, _ = run(v, ROUND)
    assert sum(cs) == 2 * C + 3 and v.copies == 2 * C - 1 and cs == [1, C - 1 + 1, 1, C + 1]
    v = Vector(QUARTER, n=C + 1, cap=2 * C)
    cs, _ = run(v, ROUND)
    assert sum(cs) == 4 and v.copies == 0
for C in (16, 1024):
    v = Vector(HALF)
    cs = fill_and_push(v, C)
    assert sum(cs) == 3 * C and v.copies == 2 * C - 1
assert 3 * 16 == 48 and 3 * 1024 == 3072 and 3 * 1_048_576 == 3_145_728
for C, writes, copies in ((16, 35_000, 31_000), (1024, 2_051_000, 2_047_000), (1_048_576, 2_097_155_000, 2_097_151_000)):
    assert 1000 * (2 * C + 3) == writes and 1000 * (2 * C - 1) == copies
assert 1000 * 4 == 4000
for C, tot_half, tot_quarter in ((1024, 528_128, 4_096), (1_048_576, 549_759_746_048, 4_194_304)):
    assert 3 * C + (C // 4) * (2 * C + 3) == tot_half == C * C // 2 + 15 * C // 4
    assert 3 * C + (C // 4) * 4 == tot_quarter == 4 * C
v = Vector(HALF)
cs = fill_and_push(v, 1024)
for _ in range(1024 // 4):
    cs += run(v, ROUND)[0]
assert sum(cs) == 528_128 and len(cs) == 2 * 1024 + 1 == 2049
m = 2 * 1024 + 1
assert abs(528_128 / (m * m / 8) - 1) < 0.01
m = 2 * 1_048_576 + 1
assert abs(549_759_746_048 / (m * m / 8) - 1) < 0.01
assert 1_048_576**2 == 1_099_511_627_776

# ---- Prove it 1: g = 1.5 ---------------------------------------------------------------------------------------------
v = Vector(g=F(3, 2))
caps15 = []
for i in range(60):
    v.push()
    if not caps15 or v.cap != caps15[-1]:
        caps15.append(v.cap)
assert caps15[:9] == [1, 2, 3, 5, 8, 12, 18, 27, 41]
v = Vector(g=F(3, 2))
prev = 0
hats15, out = [], {}
for i in range(1, 29):
    c = v.push()
    ph = 2 * v.n - v.cap
    out[i] = (c, c + ph - prev, prev, ph)
    prev = ph
assert out[13] == (13, 9, 12, 8) and out[19][1] == 12 and out[28][1] == 16
assert 13 - (12 - 8) == 9 and 13 - 4 == 9 and 24 - 12 == 12 and 26 - 18 == 8 and 2 * 12 - 12 == 12 and 2 * 13 - 18 == 8
assert out[19][0] // 2 + 3 == 12 and out[13][0] // 2 + 3 == 9  # c-hat is about c/2 + 3 for a copy of c
# Phi = 3n - 2cap for g = 1.5: c-hat <= 4 for a million appends, Phi >= 1 after the first append
for g, maxhat in ((F(2), 3), (F(3, 2), 4)):
    v = Vector(g=g)
    prev = F(0)
    worst = 0
    low = None
    for i in range(1_000_000):
        c = v.push()
        ph = (g / (g - 1)) * (v.n - F(v.cap) / g)
        hat = c + ph - prev
        worst = max(worst, hat)
        low = ph if low is None else min(low, ph)
        prev = ph
    assert worst == maxhat == 1 + g / (g - 1) and low == 1
v = Vector(g=F(3, 2))
prev = 0
for i in range(1_000_000):
    c = v.push()
    ph = 3 * v.n - 2 * v.cap
    assert ph >= 1 and c + ph - prev <= 4
    prev = ph
assert 1 + 2 == 3 and 1 + 3 == 4  # 1 + g/(g-1) for g = 2 and 1.5
# the fixed-point claim that Phi_g is 0 just after a resize and cap when full is not asserted here: Phi >= 1 is

# ---- Prove it 2 and 3 ------------------------------------------------------------------------------------------------
C = 1_048_576
assert 1000 * (2 * C + 3) == 2_097_155_000 and 1000 * (2 * C - 1) == 2_097_151_000 and 2 * C + 3 == 2_097_155
assert 2_097_155 + 999 * 4 == 2_101_151 and 999 * 4 == 3_996
v = Vector(HALF, n=C + 1, cap=2 * C)
cs, _ = run(v, ROUND * 1000)
assert sum(cs) == 2_097_155_000 and v.copies == 2_097_151_000
v = Vector(QUARTER, n=C + 1, cap=2 * C)
cs, _ = run(v, ROUND * 1000)
assert sum(cs) == 4000 and v.copies == 0
assert round(2_097_155_000 / 1e9, 1) == 2.1 and round(1_099_511_627_776 / 1e12, 1) == 1.1 and 2_101_151 // 1_000_000 == 2 and 2_097_155_000 // 1_000_000_000 == 2 and 1_000_000_000 < 2_097_155_000 < 3_000_000_000
# strict alternation from full at 16: push, pop, push, pop, ...
for atmost, expect in ((False, [17] + [1] * 7), (True, [17] * 8)):
    v = Vector(HALF, atmost=atmost, n=16, cap=16)
    cs = []
    for k in range(8):
        cs.append(v.push() if k % 2 == 0 else v.pop())
    assert cs == expect
    assert sum(cs) == (24 if not atmost else 136)
v = Vector(HALF, n=17, cap=32)
v.pop()
assert v.state() == (16, 32) and 2 * v.n == v.cap  # exactly half: 'less than half' does not shrink, 'at most half' does

# ---- Deep dive: any shrink fraction a < 1/2 -------------------------------------------------------------------------
def kfor(a):
    return max(F(1), (3 * a - HALF) / (HALF - a))


def check_a(a, capmax=4096):
    k = kfor(a)
    phi = lambda n, cap: max(2 * n - cap, k * (F(cap, 2) - n))
    seen, queue = {(0, 0)}, [(0, 0)]
    mx = {'push': F(-99), 'pop': F(-99)}
    while queue:
        n, cap = queue.pop()
        for op in ('push', 'pop'):
            if op == 'pop' and n == 0:
                continue
            v = Vector(a, n=n, cap=cap)
            c = v.push() if op == 'push' else v.pop()
            if v.cap > capmax:
                continue
            assert phi(v.n, v.cap) >= 0
            hat = c + phi(v.n, v.cap) - phi(n, cap)
            mx[op] = max(mx[op], hat)
            if (v.n, v.cap) not in seen:
                seen.add((v.n, v.cap))
                queue.append((v.n, v.cap))
    return k, mx


expected = {F(1, 8): 1, F(1, 4): 1, F(1, 3): 3, F(3, 8): 5, F(7, 16): 13}
pops = {}
for a, k in expected.items():
    kk, mx = check_a(a)
    assert kk == k and mx['push'] <= 3
    assert mx['pop'] <= 1 + k, (a, mx)
    pops[a] = mx['pop']
assert pops[F(1, 4)] == 2 and pops[F(1, 3)] == 4 and pops[F(7, 16)] == 14, pops
assert pops[F(3, 8)] == 6
assert 1 + 3 == 4 and 1 + 13 == 14
# a = 1/2: the shrinking pop's c-hat is cap - 2, unbounded
assert 512 - 2 == 510 and 4096 - 2 == 4094

# ---- More questions: Erickson's exercise 9 ---------------------------------------------------------------------------
def erickson(ops, mincap=4):
    """Grow x2 when an insertion leaves the table more than 3/4 full; shrink /2 when a deletion leaves it less than 1/4 full.
    A rebuild costs the n elements it reinserts; insert and delete cost 1."""
    n, cap, total, worst = 0, mincap, 0, F(0)
    for k, op in enumerate(ops, 1):
        if op == 'ins':
            n += 1
            total += 1
            if 4 * n > 3 * cap:
                cap *= 2
                total += n
        else:
            n -= 1
            total += 1
            if 4 * n < cap and cap > mincap:
                cap //= 2
                total += n
        worst = max(worst, F(total, k))
    return total, worst


tot, worst = erickson(['ins'] * 97)
assert tot == 292 and round(292 / 97, 2) == 3.01 and worst < 4
rs = random.Random(9)
for trial in range(300):
    n, ops = 0, []
    for _ in range(3000):
        if n == 0 or rs.random() < rs.choice([0.5, 0.6, 0.8]):
            ops.append('ins')
            n += 1
        else:
            ops.append('del')
            n -= 1
    assert erickson(ops)[1] <= 4
# an adversarial family: fill to just under 3/4, then alternate insert/delete around the thresholds
ops = ['ins'] * 40 + ['ins', 'del'] * 500 + ['del'] * 30
assert erickson(ops)[1] <= 4

# the amortized-cost bound holds with Phi = 1/2 states (exact fractions), and the totals are integers
v = Vector(QUARTER)
tot = 0
hat_tot = F(0)
prev = F(0)
for op in (['push'] * 3 + ['pop'] * 3) * 50:
    c = v.push() if op == 'push' else v.pop()
    ph = phi2(v.n, v.cap)
    tot += c
    hat_tot += c + ph - prev
    prev = ph
    assert tot <= hat_tot
assert F(1, 2) == phi2(0, 1) and isinstance(tot, int)

# telescoping, generically: sum c = sum c-hat + Phi_0 - Phi_m for every simulation above (re-checked on a mixed run)
rs = random.Random(1)
v = Vector(QUARTER)
tot, hats_sum, p0 = 0, F(0), phi2(0, 0)
for _ in range(5000):
    op = 'push' if v.n == 0 or rs.random() < 0.55 else 'pop'
    before = phi2(v.n, v.cap)
    c = v.push() if op == 'push' else v.pop()
    tot += c
    hats_sum += c + phi2(v.n, v.cap) - before
assert tot == hats_sum + p0 - phi2(v.n, v.cap)

print('potential-method examples: all assertions hold')
