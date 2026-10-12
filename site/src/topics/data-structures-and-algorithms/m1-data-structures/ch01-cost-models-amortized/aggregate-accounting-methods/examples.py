"""Every number and claim in the Aggregate and accounting methods reel and Deep dive, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows, rounded on-screen literals included.

The chapter's rule (CHAPTER.md): an empty vector has capacity 0; the first append allocates 1; an append to a full
vector allocates ceil(g * cap) (at least cap + 1), copies the n keys, then writes the new one.
One unit of cost = one element write (allocation is not counted)."""
import math
import random
from functools import lru_cache
from fractions import Fraction
from itertools import accumulate

G2, G15 = Fraction(2), Fraction(3, 2)


def grow(cap, g):
    return 1 if cap == 0 else max(math.ceil(g * cap), cap + 1)


def resize_events(n, g=G2, nextcap=None):
    """[(append_number, copies)] for every append among the first n that finds the vector full."""
    nextcap = nextcap or (lambda c: grow(c, g))
    ev, cap = [], 0
    while cap + 1 <= n:
        ev.append((cap + 1, cap))  # append cap + 1 finds the vector full: it copies cap keys
        cap = nextcap(cap)
    return ev


@lru_cache(maxsize=None)
def _costs(n, g):
    """Cost of each of the first n appends (list), by direct simulation."""
    out, size, cap = [], 0, 0
    for _ in range(n):
        c = 1
        if size == cap:
            c += size
            cap = grow(cap, g)
        size += 1
        out.append(c)
    return out


def costs(n, g=G2):
    return list(_costs(n, g))


def totals(n, g=G2, nextcap=None):
    """(total writes, copies, number of resizes that copied, last copy, final capacity) after n appends."""
    ev = resize_events(n, g, nextcap)
    copies = sum(c for _, c in ev)
    nc = nextcap or (lambda c: grow(c, g))
    cap = 0
    for _ in ev:
        cap = nc(cap)
    copying = [c for _, c in ev if c > 0]
    return n + copies, copies, len(copying), (copying[-1] if copying else 0), cap


# ---- Step 3 (Sixteen appends), step 4 (Add up the whole sequence) ----------------------------------------------------
c16 = costs(16)
assert c16 == [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1]
assert sum(c16) == 31 and 3 * 16 == 48
assert [a for a, _ in resize_events(16)] == [1, 2, 3, 5, 9]  # appends that find a full vector (the first allocates 1)
assert [c for _, c in resize_events(16)] == [0, 1, 2, 4, 8]  # copies; capacities reached 1, 2, 4, 8, 16
assert grow(0, G2) == 1 and [grow(c, G2) for c in (1, 2, 4, 8)] == [2, 4, 8, 16]
assert 1 + 2 + 4 + 8 == 15 < 16  # copies < n
assert [i for i, c in enumerate(c16, 1) if c > 1] == [2, 3, 5, 9]  # the four spikes
assert all(s <= 3 * i for i, s in enumerate(accumulate(c16), 1))  # the running total stays under 3i
assert 16 + 15 == 31  # writes + copies

# ---- Step 2 (What do a million appends cost?) and the aggregate bound for every n ------------------------------------
N = 1_000_000
big = costs(N)
tot, copies, resizes, last, cap = totals(N)
assert sum(big) == tot == 2_048_575 and copies == 1_048_575 == 2**20 - 1
assert resizes == 20 and last == 524_288 and cap == 1_048_576 and 3 * N == 3_000_000
assert big.index(max(big)) + 1 == 524_289 and max(big) == 524_289  # the dearest append
assert sum(1 for c in big if c == 1) == 999_980  # all but 20 appends cost exactly 1
assert [a for a, c in enumerate(big, 1) if c > 1] == [2**k + 1 for k in range(20)]  # 20 resizing appends, from 2 to 524,289
assert round(copies / N, 2) == 1.05  # copies per append at a million, not 2
assert N * 20 == 20_000_000 and N * 524_289 == 524_289_000_000  # the two wrong answers of the predict question
assert 2_048_575 < 3_000_000 and N + copies == 2_048_575
assert N * 524_289 // 10**9 == 524  # '524 billion', the per-operation worst case times n

run, cp = 0, 0
for n, c in enumerate(costs(2**20), 1):
    run += c
    cp += c - 1
    assert cp < 2 * n and run < 3 * n, n  # the aggregate bound, for every n up to 2^20
    k = (n - 1).bit_length() - 1 if n >= 2 else 0
    assert cp == (2 ** (k + 1) - 1 if n >= 2 else 0)  # exact: 2^(k+1) - 1, 2^k the largest power of two below n
    if n >= 3 and n & (n - 1):
        assert cp <= 2 * n - 3  # off a power of two
    if n & (n - 1) == 0 and n >= 2:
        assert cp == n - 1 and run == 2 * n - 1  # at a power of two
assert 2 * 16 - 1 == 31

# ---- Step 6 and 7 (the accounting method, charge 3), partner scheme simulated cell by cell ---------------------------
def bank_series(n, charge, g=G2):
    b, out = 0, []
    for c in costs(n, g)[:n]:
        b += charge - c
        out.append(b)
    return out

assert bank_series(16, 3) == [2, 3, 3, 5, 3, 5, 7, 9, 3, 5, 7, 9, 11, 13, 15, 17]
bank = bank_series(2**20, 3)
assert min(bank) == 2 and bank.index(2) == 0 and min(bank[:16]) == 2  # lowest: 2, after append 1
assert 48 - 31 == 17 == bank[15]
assert all(bank[i - 1] == 3 for i in (2, 3, 5, 9, 17, 33, 65, 524_289))  # exactly 3 just after every resize
assert bank[524_288 - 1] == 524_289  # the bank before append 524,289 ...
assert 2 * 262_144 + 1 == 524_289  # ... is 2 coins from each of the 262,144 appends since the previous resize, plus the spare

# the partner scheme: append i in the new half leaves a coin on key i and one on key i - cap/2; the first append has no partner
coins, spare, size, cap, on_cells = {}, 0, 0, 0, 0
for i in range(1, 2**17 + 1):
    if size == cap:  # resize: every key copied is paid by the coin on it
        assert on_cells == size and len(coins) == size and all(v == 1 for v in coins.values()), i  # one coin on every key at the copy
        coins, on_cells = {}, 0
        cap = grow(cap, G2)
    size += 1
    coins[size] = coins.get(size, 0) + 1
    on_cells += 1
    if cap >= 2:
        coins[size - cap // 2] = coins.get(size - cap // 2, 0) + 1
        on_cells += 1
    else:
        spare += 1  # the first append has no old half: a spare coin
    if cap >= 2:
        assert on_cells + spare == 2 * size - cap + 1  # bank = 2n - cap + 1 after every append
    if size == cap:
        assert on_cells == cap and all(v == 1 for v in coins.values()) and spare == 1  # after appends 8, 16, ...
assert (2 * 8 - 8 + 1, 2 * 16 - 16 + 1) == (9, 17)

# step 6, drawn: after append 8 every one of the 8 keys holds one coin; append 9 copies 8 keys with 8 coins and leaves coins on 9 and 1
assert 9 - 8 == 1 and 5 - 4 == 1 and 8 - 4 == 4  # partners i - 4 for appends 5..8; 9 - 8 = 1 for append 9
assert c16[8] == 9 and 3 - 1 == 2  # append 9 costs 9; its charge 3 = 1 write + 2 coins

# a stack that never shrinks: valid (push, pop) charges, and the one in CMU's footnote that is not
def stack_ok(push_c, pop_c, seq):
    size = cap = 0
    bank = 0
    for op in seq:
        if op == 'push':
            c = 1 + (size if size == cap else 0)
            if size == cap:
                cap = grow(cap, G2)
            size += 1
            bank += push_c - c
        else:
            size -= 1
            bank += pop_c - 1
        if bank < 0:
            return False
    return True

rs = random.Random(11)
seqs = []
for _ in range(3000):
    s, size = [], 0
    for _ in range(rs.randrange(1, 120)):
        if size and rs.random() < 0.45:
            s.append('pop'); size -= 1
        else:
            s.append('push'); size += 1
    seqs.append(s)
for pair in ((3, 1), (4, 0), (5, -1)):
    assert all(stack_ok(*pair, s) for s in seqs), pair  # amortized bounds are not unique
assert not stack_ok(3, -1, ['push', 'push', 'pop', 'pop'])  # costs 1 + 2 + 1 + 1 = 5 against 3 + 3 - 1 - 1 = 4
assert 1 + 2 + 1 + 1 == 5 and 3 + 3 - 1 - 1 == 4

# ---- Step 17 / Prove it 1 (charge 2) -------------------------------------------------------------------------------
assert bank_series(16, 2) == [1, 1, 0, 1, -2, -1, 0, 1, -6, -5, -4, -3, -2, -1, 0, 1]
b2 = bank_series(2**20, 2)
assert [i + 1 for i, b in enumerate(b2) if b < 0][0] == 5 and b2[4] == -2  # first negative at the 5th append
assert sum(c16[:5]) == 12 and 2 * 5 == 10  # costs to there against charges
assert all(b2[2**k - 1] == 1 for k in range(0, 21))  # the bank is back to +1 at every power of two
assert min(b2) == -524_286 and b2.index(-524_286) + 1 == 524_289
assert b2[2] == 0  # the 3rd append: exactly zero (a distractor)

# ---- Step 8 (additive growth) --------------------------------------------------------------------------------------
def cum_total(n, nextcap):
    return totals(n, nextcap=nextcap)[0]

by_one = cum_total(N, lambda c: c + 1)
by_1000 = cum_total(N, lambda c: c + 1000)
assert by_one == N * (N + 1) // 2 == 500_000_500_000 and (N + 1) / 2 == 500_000.5
assert by_1000 == 500_500_000
assert abs(by_1000 - (N * N / (2 * 1000) + N)) / by_1000 < 0.01  # within 1% of n^2 / (2k) + n
assert totals(1000, nextcap=lambda c: c + 1)[0] == sum(range(1, 1001))  # direct check at a small n
assert 2_048_575 < 500_500_000 < 500_000_500_000
assert round(math.log10(by_one), 2) == 11.7 and round(math.log10(by_1000), 2) == 8.7 and round(math.log10(2_048_575), 2) == 6.31

# ---- Steps 9, 10 and Prove it 2 (growth factor g) ------------------------------------------------------------------
caps15 = [0]
for _ in range(10):
    caps15.append(grow(caps15[-1], G15))
assert caps15[1:] == [1, 2, 3, 5, 8, 12, 18, 27, 41, 62]
assert float(1.5) == 1.5 and all(grow(c, G15) == max(math.ceil(1.5 * c), c + 1) for c in range(0, 5000))  # float 1.5 gives the same capacities
c15_16 = costs(16, G15)
assert c15_16 == [1, 2, 3, 4, 1, 6, 1, 1, 9, 1, 1, 1, 13, 1, 1, 1] and sum(c15_16) == 47 <= 4 * 16 == 64
tot15, copies15, res15, last15, cap15 = totals(N, G15)
assert (copies15, res15, last15, cap15) == (2_099_719, 33, 699_912, 1_049_868) and tot15 == 3_099_719 <= 4_000_000
assert [a for a, c in resize_events(N, G15) if c == last15] == [699_913]
assert round(copies15 / N, 2) == 2.10 and 3 * 699_912 == 2_099_736 and abs(2_099_736 - copies15) / copies15 < 0.0001
assert 1_049_869 > N  # no resize between append 699,914 and the millionth

def tiles(g, last, upto):
    """Copies of the resizes up to the one that copied `last`, latest first."""
    ev = [c for a, c in resize_events(upto, g) if c > 0 and c <= last]
    return ev[::-1]

t2 = tiles(G2, 524_288, 524_289)
assert t2[:4] == [524_288, 262_144, 131_072, 65_536] and sum(t2) == 1_048_575 and round(sum(t2) / 524_289, 2) == 2.00
t15 = tiles(G15, 699_912, 699_913)
assert t15[:4] == [699_912, 466_608, 311_072, 207_381] and sum(t15) == 2_099_719 and round(sum(t15) / 699_913, 2) == 3.00
assert 160 * 1_000_000 // 699_912 == 228  # step 18: the n bar next to a 160-unit last tile
assert round(160 * sum(t2) / 524_288) == 320 and round(160 * sum(t15) / 699_912) == 480  # tilings end at x 360 and 520

# the sawtooth: copies per append against n, for both g
def ratio_curve(g, n_max):
    ev = dict(resize_events(n_max, g))
    cp, out = 0, []
    for n in range(1, n_max + 1):
        cp += ev.get(n, 0)
        out.append(cp / n)
    return out

r2, r15 = ratio_curve(G2, N), ratio_curve(G15, N)
assert max(r2) < 2 and max(r15) < 3 and max(r2) > 1.99 and max(r15) > 2.99  # strict, approached
assert min(r2[1023:]) > 0.99 and min(r15[1023:]) > 1.99  # troughs for n >= 1,024
assert max(r2[1023:]) > 1.99 and max(r15[1023:]) > 2.98  # peaks for n >= 1,024
assert round(r15[1065], 4) == 2.9878 and r15[1065] < 2.99 and r15[1598] > 2.99  # append 1,066 and append 1,599
ev15 = dict(resize_events(N, G15))
assert all(r15[i] > 2.99 for i in range(1598, N) if (i + 1) in ev15)  # peaks at the resizing appends from 1,599 on
assert round(r2[N - 1], 2) == 1.05 and round(r15[N - 1], 2) == 2.10
assert 1 - 1 / 2 == 0.5 and round(1 - 1 / 1.5, 2) == 0.33 and 1 / (2 - 1) == 1 and 1 / (1.5 - 1) == 2  # empty fraction, troughs
assert 2 / (2 - 1) == 2 and 1.5 / (1.5 - 1) == 3  # g / (g - 1)
assert 1 + 2 / (2 - 1) == 3 and 1 + 1.5 / (1.5 - 1) == 4  # accounting charge 1 + g / (g - 1)
b15 = bank_series(N, 4, G15)
assert min(b15) == 3 and min(bank_series(N, 3, G15)) < 0  # charge 4 holds for g = 1.5, charge 3 does not
b15_3 = bank_series(N, 3, G15)
assert [i + 1 for i, b in enumerate(b15_3) if b < 0][0] == 9 and b15_3[8] == -1 and b15_3[699_912] == -699_893
for gg in (Fraction(5, 4), Fraction(3, 2), G2, Fraction(3)):
    assert min(bank_series(20000, math.ceil(1 + gg / (gg - 1)), gg)) >= 0  # charge 1 + g/(g-1), rounded up to whole units
assert [1 + g / (g - 1) for g in (Fraction(5, 4), Fraction(3, 2), G2, Fraction(3))] == [6, 4, 3, Fraction(5, 2)]  # charges 6, 4, 3, 2.5
# the lab prediction table: copies per append at n = 10^3 .. 10^6
rows2 = [(1_000, 1_023, 1.02), (10_000, 16_383, 1.64), (100_000, 131_071, 1.31), (1_000_000, 1_048_575, 1.05)]
rows15 = [(1_000, 2_120, 2.12), (10_000, 24_261, 2.43), (100_000, 276_492, 2.76), (1_000_000, 2_099_719, 2.10)]
for n, cp_, rr in rows2:
    assert totals(n, G2)[1] == cp_ and round(cp_ / n, 2) == rr
for n, cp_, rr in rows15:
    assert totals(n, G15)[1] == cp_ and round(cp_ / n, 2) == rr
n1 = next(n for n in range(2**19 + 1, 2**20 + 1) if 1_048_575 / n < 1.5)
assert n1 == 699_051  # More questions (c)

# ---- Steps 11 and 12 (binary counter) ------------------------------------------------------------------------------
def flips_seq(n):
    v, out = 0, []
    for _ in range(n):
        t = 0
        while (v >> t) & 1:
            t += 1
        out.append(t + 1)  # t trailing ones reset, one zero set
        v += 1
    return out

f16 = flips_seq(16)
assert f16 == [1, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1, 5] and sum(f16) == 31 and max(f16) == 5
bits16 = [0] * 5
v = 0
for _ in range(16):
    nv = v + 1
    for b in range(5):
        if ((v ^ nv) >> b) & 1:
            bits16[b] += 1
    v = nv
assert bits16 == [16, 8, 4, 2, 1] and all(bits16[i] == 16 // 2**i for i in range(5))  # bit i flips n // 2^i times
assert 16 + 8 + 4 + 2 + 1 == 31 and 16 * 5 == 80 and 16 * 4 == 64  # the wrong options of step 11
fl, tot_f = flips_seq(100_000), 0
for n, f in enumerate(fl, 1):
    tot_f += f
    assert tot_f == 2 * n - bin(n).count('1') and tot_f < 2 * n
assert sum(flips_seq(N)) == 1_999_993 and bin(N).count('1') == 7
assert all(sum(flips_seq(2**k)) == 2 ** (k + 1) - 1 == totals(2**k)[0] for k in range(0, 15))  # both 31s coincide at 2^k
assert totals(2**20)[0] == 2 ** 21 - 1

def counter_bank(n, width=None):
    """Charge 2 per increment: bank after each increment, and the number of 1 bits."""
    v, bank_, out = 0, 0, []
    for _ in range(n):
        t = 0
        while (v >> t) & 1:
            t += 1
        if width is not None and t == width:  # the wrap: every bit resets, none is set
            flips = width
            v = 0
        else:
            flips = t + 1
            v += 1
        bank_ += 2 - flips
        out.append((bank_, bin(v).count('1')))
    return out

assert all(b == pc and b >= 0 for b, pc in counter_bank(5000))  # bank = number of 1 bits, never negative
wrap = counter_bank(100, width=3)
assert all(b >= 0 for b, _ in wrap)
assert all(b == pc + 2 * ((i + 1) // 8) for i, (b, pc) in enumerate(wrap))  # popcount + 2 per wrap
assert 7 + 1 == 8 and f16[7] == 4 and 3 == bin(7).count('1')  # 7 -> 8 resets 3 bits (and sets 1)
assert 16 * 2 == 32 and 32 - 31 == 1 == bin(16).count('1')  # 1 coin left at 10000

def weighted(n):
    v, out = 0, []
    for _ in range(n):
        t = 0
        while (v >> t) & 1:
            t += 1
        out.append(sum(2**i for i in range(t + 1)))  # flipping bit k costs 2^k
        v += 1
    return out

w16 = weighted(16)
assert sum(w16) == 80 == 16 * (int(math.log2(16)) + 1) and max(w16) == 31 == 2 * 16 - 1
assert all(sum(weighted(n)) <= n * (math.log2(n) + 1) for n in range(1, 4097))

# ---- Step 15 (when the bound breaks) -------------------------------------------------------------------------------
def flips_between(a, b):
    return bin(a ^ b).count('1')

assert format(15, '05b') == '01111' and format(16, '05b') == '10000'  # the 5-bit counter at 01111 and one increment later
v, tot_d = 15, 0
for i in range(8):
    nv = v + 1 if i % 2 == 0 else v - 1  # increment, then decrement, alternating
    tot_d += flips_between(v, nv)
    assert flips_between(v, nv) == 5
    v = nv
assert tot_d == 40 and 2 * 8 == 16  # 40 flips against a bound of 16
def append_from_full(size, cap):
    return 1 + (size if size == cap else 0)
assert append_from_full(16, 16) == 17 and 10 * 17 == 170 and 3 * 10 == 30  # ten appends to one old full version
assert append_from_full(16, 16) > 3  # from a full vector with an empty bank the first append costs 17 > 3 (the seed)

# ---- Steps 13, 14 and Prove it 3 (multipop stack) ------------------------------------------------------------------
def stack_run(ops):
    size, out = 0, []
    for op, k in ops:
        if op == 'push':
            size += 1; out.append(1)
        elif op == 'pop':
            m = 1 if size else 0
            size -= m; out.append(m)
        else:
            m = min(k, size)
            size -= m; out.append(m)
    return out

seq13 = [('push', 0)] * 6 + [('multi', 4)] + [('push', 0)] * 2 + [('multi', 10)]
c13 = stack_run(seq13)
assert c13 == [1, 1, 1, 1, 1, 1, 4, 1, 1, 4] and sum(c13) == 16
assert sum(1 for op, _ in seq13 if op == 'push') == 8 and 16 <= 2 * 8 <= 2 * 10 == 20
assert stack_run([('multi', 5)]) == [0]  # multipop on an empty stack costs 0
rs = random.Random(3)
for _ in range(1000):
    ops, size = [], 0
    for _ in range(rs.randrange(1, 201)):
        r = rs.random()
        if r < 0.5:
            ops.append(('push', 0)); size += 1
        elif r < 0.7:
            ops.append(('pop', 0)); size = max(0, size - 1)
        else:
            k = rs.randrange(0, 60); ops.append(('multi', k)); size = max(0, size - k)
    cs = stack_run(ops)
    pushes = sum(1 for op, _ in ops if op == 'push')
    assert sum(cs) <= 2 * pushes <= 2 * len(ops)
    bank_s, size = 0, 0
    for (op, k), c in zip(ops, cs):
        bank_s += (2 if op == 'push' else 0) - c  # charge 2 per push, 0 for pop and multipop
        size += 1 if op == 'push' else -c
        assert bank_s == size >= 0  # the bank is exactly the keys on the stack
n2 = 50
worst = stack_run([('push', 0)] * (n2 - 1) + [('multi', n2)])
assert sum(worst) == 2 * n2 - 2 and max(worst) == n2 - 1  # tight: 2n - 2, one operation costs n - 1

mp = []
for i in range(1000):
    mp.append(1000)  # multipush(1000) writes 1000 keys; multipop(1000) pops 1000 keys
assert sum(mp) == 1_000_000 and len(mp) == 1000 and sum(mp) // len(mp) == 1000
assert 10 * 1000 == 10_000  # the first 10 operations drawn in the reel

# ---- Deep dive extras ------------------------------------------------------------------------------------------------
assert 100 * 1 + 100 == 200 and 200 / 101 < 2 and round(200 / 101, 3) == 1.980
f_total = sum(1024 if (k & (k - 1)) == 0 else 1 for k in range(1, 1025))
assert f_total == 12_277 == 11 * 1024 + 1013 and round(f_total / (1024 * 10), 2) == 1.2  # More questions (a)
rq = random.Random(5)
for _ in range(500):
    inn, out_, moves, enq = [], [], 0, 0
    for _ in range(rq.randrange(1, 300)):
        if rq.random() < 0.55 or not (inn or out_):
            inn.append(1); moves += 1; enq += 1  # enqueue: one push
        else:
            if not out_:
                while inn:
                    inn.pop(); out_.append(1); moves += 2  # a pop and a push per moved element
            out_.pop(); moves += 1  # dequeue: one pop
    assert moves <= 4 * enq  # each element: push, pop, push, pop at most (queue from two stacks)

# the vector's and the counter's bound, side by side with topic 1's wording: amortized is a worst-case total over a sequence
assert max(big) > 3 * 100_000 and sum(big) < 3 * N  # one append can cost far more than 3, yet the total is below 3n
assert 524_289 > N // 2

print('aggregate-accounting-methods examples: all assertions hold')
