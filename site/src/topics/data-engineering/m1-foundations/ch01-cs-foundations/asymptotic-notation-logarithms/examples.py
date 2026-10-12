"""Every number shown in the "Asymptotic notation and logarithms" reel and Deep dive, computed and asserted.
Run: python3 examples.py (CI runs it too). Plain standard library; integer arithmetic wherever a count is exact."""
import math
import random
import sys

ORDERS = 100_000_000  # the shop's `orders` rows (chapter constant, steps 4, 8 and 10)
assert ORDERS == 10**8

# ---- Step 2: O is a ceiling, Omega a floor, Theta both. g(n) = 3 n log2 n + 8 n -------------------------------
def g(n):
    return 3 * n * math.log2(n) + 8 * n

def ratio(n):
    return g(n) / (n * math.log2(n))  # = 3 + 8 / log2 n

# The floor 3 n log2 n holds for every n >= 1 (8n > 0); the ceiling 4 n log2 n holds exactly from n0 = 256 on.
assert all(3 * n * math.log2(n) <= g(n) for n in range(2, 2**20 + 1, 997))
assert all(g(n) <= 4 * n * math.log2(n) for n in range(256, 2**20 + 1, 997))
assert all(g(2**k) <= 4 * 2**k * k for k in range(8, 28))  # sampled powers of two up to 2**27
assert g(128) == 3712 and 4 * 128 * math.log2(128) == 3584 and g(128) > 4 * 128 * math.log2(128)  # crossed below n0
assert g(256) == 8192 == 4 * 256 * 8  # equality at n0
# n0 is the least power of two with 8 n <= n log2 n.
assert min(2**k for k in range(1, 30) if 8 * 2**k <= 2**k * k) == 256
assert all(g(n) > 4 * n * math.log2(n) for n in range(2, 256))  # the ceiling fails for every smaller n
# The ratio values drawn on the curve.
assert round(ratio(2), 2) == 11.00
assert round(ratio(16), 2) == 5.00
assert round(ratio(256), 2) == 4.00
assert round(ratio(65_536), 2) == 3.50
assert round(ratio(100_000_000), 2) == 3.30
# n0 comes paired with c: c = 5 gives 16, c = 11 gives 2, and no c works at n = 1 (n log2 n = 0 there, the cost is 8).
assert min(2**k for k in range(1, 30) if 3 * k + 8 <= 5 * k) == 16
assert min(2**k for k in range(1, 30) if 3 * k + 8 <= 11 * k) == 2
assert 1 * math.log2(1) == 0 and g(1) == 8
# Where the dot crosses n0 on the log2 axis (n = 2 .. 100,000,000): 7 of 25.58 units, 27 percent.
frac = (math.log2(256) - math.log2(2)) / (math.log2(100_000_000) - math.log2(2))
assert round(frac * 100) == 27
# The 8n share at n = 16 (Deep dive).
assert g(16) == 320 and 8 * 16 == 128 and 128 / 320 == 0.4  # 40 percent

# ---- Step 3: it is also O(n^2), a loose ceiling ----------------------------------------------------------------------
assert all(g(n) <= 11 * n * n for n in range(1, 10**6 + 1, 7)) and g(1) == 8 <= 11
assert all(math.log2(n) <= n for n in range(1, 10**6, 13))
assert round(g(10**8)) == 8_772_627_428
assert 10**16 // round(g(10**8)) == 1_139_909 and 10**16 / g(10**8) > 1_000_000  # over a million times too high
assert 10**16 == 10_000_000_000_000_000  # "10 quadrillion"
# On a log10 axis from 1 billion to 10 quadrillion the job's bar is about 1/7 of the n^2 bar.
axis = math.log10(10**16) - math.log10(10**9)
assert round(axis) == 7 and round((math.log10(g(10**8)) - 9) / axis, 2) == 0.13

# ---- Step 4: the race, at a stated round assumption of 10^9 simple steps per second ------------------------------
SPEED = 10**9
assert SPEED == 1_000_000_000  # the note on screen: 1,000,000,000 steps per second
def steps(n):
    return n, round(n * math.log2(n)), n * n
assert steps(1_000) == (1_000, 9_966, 1_000_000)
assert steps(1_000_000) == (1_000_000, 19_931_569, 10**12)
assert steps(10**8) == (10**8, 2_657_542_476, 10**16)
# n = 1,000: 1 us / 10 us / 1 ms
assert steps(1_000)[0] / SPEED == 1e-6 and round(steps(1_000)[1] / SPEED * 1e6) == 10 and steps(1_000)[2] / SPEED == 1e-3
# n = 1,000,000: 1 ms / 20 ms / 1,000 s = 17 min
assert steps(10**6)[0] / SPEED == 1e-3 and round(steps(10**6)[1] / SPEED * 1e3) == 20
assert steps(10**6)[2] / SPEED == 1_000 and round(1_000 / 60) == 17
# n = 100,000,000: 0.1 s / 2.7 s / 10,000,000 s = 116 days
assert steps(10**8)[0] / SPEED == 0.1 and round(steps(10**8)[1] / SPEED, 1) == 2.7
assert steps(10**8)[2] / SPEED == 10_000_000 and round(10_000_000 / 86_400) == 116
# Doubling the data at 100 million: x2, x2.08, x4.
def nlogn(n):
    return n * math.log2(n)
assert round(nlogn(2 * 10**8) / nlogn(10**8), 2) == 2.08
assert (2 * 10**8) ** 2 // (10**8) ** 2 == 4
# The time axis is logarithmic: 100 ns (10^-7 s) to 100,000,000 s (10^8 s), 15 decades. Ticks sit every 3 decades (x1,000), up to 1,000 s.
AXIS_LO, AXIS_HI = -7, 8
def axis_frac(seconds):
    return (math.log10(seconds) - AXIS_LO) / (AXIS_HI - AXIS_LO)
TICKS = [(1e-6, '1 us'), (1e-3, '1 ms'), (1.0, '1 s'), (1e3, '1,000 s')]
assert [round(axis_frac(s_), 3) for s_, _ in TICKS] == [0.067, 0.267, 0.467, 0.667]  # tick positions on the track
assert all(round(TICKS[i + 1][0] / TICKS[i][0]) == 1_000 for i in range(3))  # each tick is x1,000
# Every bar fits on the axis, so no bar is cut off: the largest, n^2 at 100 million rows (10,000,000 s), sits at 14/15.
assert 100e-9 <= 1e-6 and 10_000_000 < 10**AXIS_HI and round(axis_frac(10_000_000), 3) == 0.933
# On this axis the gaps are still honest: a x1,000 gap is 3/15 = 20 percent of the track.
assert round(axis_frac(1e-3) - axis_frac(1e-6), 2) == 0.2 and round(axis_frac(1e-3) - axis_frac(1e-6), 2) == round(3 / 15, 2)

# ---- Step 5: a logarithm counts divisions; bisect callback ---------------------------------------------------------------
assert round(math.log2(1_000), 2) == 9.97 and math.ceil(math.log2(1_000)) == 10 and 2**10 == 1_024 > 1_000
def halvings_ceil(x):
    k = 0
    while x > 1:
        x = (x + 1) // 2  # round up, so "down to 1" means 1 or below
        k += 1
    return k
def halvings_floor(x):
    k = 0
    while x > 1:
        x //= 2  # the trap: counts floor(log2 x), one short for a billion
        k += 1
    return k
def halvings_pow(n):
    k = 0
    while 2**k < n:
        k += 1
    return k
N9 = 10**9
assert halvings_ceil(N9) == 30 and halvings_pow(N9) == 30 and math.ceil(math.log2(N9)) == 30
assert halvings_floor(N9) == 29 == math.floor(math.log2(N9))  # never used on screen
assert (N9 - 1).bit_length() == 30 and 2**29 < N9 <= 2**30
assert 2**29 == 536_870_912 and 2**30 == 1_073_741_824
assert round(math.log2(N9), 1) == 29.9
assert N9 / 2**10 == 976_562.5 and math.floor(976_562.5 + 0.5) == 976_563
assert round(N9 / 2**20) == 954 and round(N9 / 2**30, 2) == 0.93 and round(N9 / 2**29, 2) == 1.86
assert 1_024 == 2**10  # every 10 halvings divide by 1,024, about a thousand
assert round(math.log2(10**6), 1) == 19.9  # the million: about 20 (the classic slip of one factor of a thousand)
assert math.floor(math.log2(N9)) + 1 == 30  # binary search over a billion keys: at most 30 comparisons
# On screen: log2 of a billion = 29.9 (written out as a billion, not as a power of ten).

# ---- Step 6: any base, one formula --------------------------------------------------------------------------------------
for x, b in [(N9, 2), (N9, 10), (N9, 1_000)]:
    assert math.isclose(math.log(x, b), math.log(x) / math.log(b), rel_tol=1e-12)
assert round(math.log(N9), 2) == 20.72
assert round(math.log(2), 3) == 0.693 and round(math.log(10), 3) == 2.303 and round(math.log(1_000), 3) == 6.908
assert round(math.log(N9) / math.log(2), 1) == 29.9
assert round(math.log(N9) / math.log(10)) == 9  # round(), never int(): math.log(10**9) / math.log(10) is 8.999999999999998
assert round(math.log(N9) / math.log(1_000)) == 3
assert round(1 / math.log10(2), 2) == 3.32 and round(3.32 * 9, 1) == 29.9
# DLMF 4.2.17 and 4.2.18, and 4.2.10.
assert abs(math.log10(math.e) - 0.4342944819) < 1e-10 and abs(math.log(10) - 2.302585093) < 1e-9
assert math.isclose(math.log(8, 2), 1 / math.log(2, 8))
# Tick spacing in step 6's drawing, in canvas units: the bar is 500 wide for ln(10^9) = 20.72.
assert round(500 * math.log(2) / math.log(N9)) == 17 and round(500 * math.log(10) / math.log(N9)) == 56
assert round(500 * math.log(1_000) / math.log(N9)) == 167

# ---- Step 7: a large base flattens the tower ---------------------------------------------------------------------------------
assert 1_000**3 == N9
assert N9 // 16_384 == 61_035 and round(N9 / 16_384**2, 2) == 3.73
assert round(math.log(N9, 16_384), 2) == 2.14
assert round(math.log(10**6, 16_384), 2) == 1.42 and math.log(10**6, 16_384) < 1.5
# The base-2 tower: 29 whole steps and a 0.9 sliver (29.9 divisions).
assert round(math.log2(N9) - 29, 1) == 0.9 and round(math.log(N9, 16_384) - 2, 2) == 0.14

# ---- Step 8: how tall is the orders index? -------------------------------------------------------------------------------------
PAGE, HEADER, SPECIAL, ENTRY = 8_192, 24, 16, 20  # 8 KB page; header; b-tree special space; 8 (tuple) + 8 (key) + 4 (line pointer)
assert 6 + 2 == 8 and 8 + 8 + 4 == ENTRY == 20  # TID (6-byte row pointer) + t_info (2) = 8-byte tuple header; 8-byte key; 4-byte line pointer
assert (PAGE - HEADER) // ENTRY == 408 and (PAGE - HEADER - SPECIAL) // ENTRY == 407  # "about 400"
LEAF_FILL, UPPER_FILL = 0.9, 0.7  # PostgreSQL defaults (nbtree.h)
leaf_fanout = int((PAGE - HEADER - SPECIAL) * LEAF_FILL) // ENTRY
upper_fanout = int((PAGE - HEADER - SPECIAL) * UPPER_FILL) // ENTRY
assert leaf_fanout == 366 and upper_fanout == 285
def levels(n, fanout):
    h, reach = 0, 1
    while reach < n:  # integer loop, no float log
        reach *= fanout
        h += 1
    return h
assert [400**h for h in (1, 2, 3, 4)] == [400, 160_000, 64_000_000, 25_600_000_000]
assert 400**3 < ORDERS <= 400**4 and levels(ORDERS, 400) == 4
assert 400**3 // 10**6 == 64 and 400**4 / 10**9 == 25.6  # '64 million' and '25.6 billion' in the explain
assert round(math.log(ORDERS, 400), 2) == 3.07
assert levels(ORDERS, 99) == 5 and levels(ORDERS, 100) == 4 and 100**4 == ORDERS
assert levels(ORDERS, 464) == 4 and 464**3 == 99_897_344 < ORDERS
assert levels(ORDERS, 465) == 3 and 465**3 == 100_544_625 >= ORDERS
assert round(math.log(ORDERS, 100)) == 4  # agrees with the I/O cost model topic's own check
assert math.ceil(math.log2(ORDERS)) == 27 and round(math.log2(ORDERS), 1) == 26.6  # a binary tree: 27 levels
# Page by page at the default fill: leaves, then upper pages.
n, h = ORDERS, 1
n = -(-n // leaf_fanout)
assert n == 273_225
while n > 1:
    n = -(-n // upper_fanout)
    h += 1
    if h == 2:
        assert n == 959
    if h == 3:
        assert n == 4
assert h == 4 and n == 1
assert 1 - 1 / 400 > 0.99  # leaf pages are over 99 percent of the pages (PostgreSQL docs: "typically, over 99%")
# Everything above the leaves: 959 + 4 + 1 pages of 8 KiB, about 7.5 MiB, against 273,225 leaves (Deep dive).
assert 959 + 4 + 1 == 964 and 964 * 8 == 7_712 and round(964 * 8 / 1024, 1) == 7.5

# ---- Step 9: sort passes -----------------------------------------------------------------------------------------------------------
TiB, GiB, MiB = 2**40, 2**30, 2**20
def passes(total, memory, block, fan_in=None):
    runs = -(-total // memory)
    fan = fan_in if fan_in is not None else memory // block - 1
    merges, r = 0, runs
    while r > 1:
        r = -(-r // fan)
        merges += 1
    return 1 + merges, runs, fan
blocks, mem_blocks = TiB // MiB, 16 * GiB // MiB
assert blocks == 1_048_576 and mem_blocks == 16_384
assert passes(TiB, 16 * GiB, MiB) == (2, 64, 16_383)  # same as io-cost-model/examples.py
assert math.isclose(math.log(blocks, mem_blocks), 20 / 14, rel_tol=1e-12) and round(20 / 14, 2) == 1.43
assert 1 + math.ceil(math.log(64, 16_383)) == 2 == math.ceil(math.log(blocks, mem_blocks))
# The drawing's line: 20/14 = 1 + log(64) = 1 + 6/14, and 6/14 = 0.43. A pass cannot be partial, so the sliver rounds up to a whole pass.
assert math.isclose(20 / 14, 1 + 6 / 14) and round(6 / 14, 2) == 0.43 and round(math.log(64, 16_384), 2) == 0.43
assert 64 / 16_383 < 0.004  # 64 runs use under 0.4 percent of the fan-in
# Each pass reads and writes the whole 1 TiB: 2 passes x (1 TiB read + 1 TiB written) = 4 TiB of I/O.
assert 2 * (TiB + TiB) == 4 * TiB
assert min(k for k in range(1, 10) if 16_383**k >= 64) == 1 and 64 <= 16_383
assert passes(TiB, 16 * GiB, MiB, fan_in=2) == (7, 64, 2) and 1 + (64 - 1).bit_length() == 7  # two at a time (integer, no float log)
# Why the ceiling goes on the merge log: 16,384 runs at fan-in 16,383 need 3 passes, but ceil of the whole log says 2.
assert passes(16_384 * 16 * GiB, 16 * GiB, MiB)[0] == 3 and math.ceil(math.log(16_384 * 16_384, 16_384)) == 2
# Vitter's example (Deep dive): N = 10 billion, M = 10 million, B = 10,000 gives n = 1 million, m = 1,000 and log_m n = 2.
assert (10_000_000_000, 10_000_000, 10_000) == (10**10, 10**7, 10**4)
assert 10_000_000_000 // 10_000 == 1_000_000 and 10_000_000 // 10_000 == 1_000
assert round(math.log(10**10 // 10**4, 10**7 // 10**4)) == 2

# ---- Step 10: same steps, same Theta, unknown price per step ---------------------------------------------------------------
assert ORDERS == 100_000_000

# Deep dive: a bigger constant can outweigh a lower growth class for a while. 100 steps per item on an n log2 n method
# against 1 step per pair on an n^2 method: the quadratic one is cheaper for every n up to 996 and loses from 997 on.
assert all(n * n <= 100 * n * math.log2(n) for n in range(2, 997))
assert min(n for n in range(2, 5_000) if n * n > 100 * n * math.log2(n)) == 997
assert 1_000 ** 2 == 1_000_000 and round(100 * 1_000 * math.log2(1_000)) == 996_578

# ---- Try it 1: the float log gotchas -------------------------------------------------------------------------------------------------
assert math.log(1000, 10) == 2.9999999999999996 and int(math.log(1000, 10)) == 2
assert math.log(10**9, 10) == 8.999999999999998 and int(math.log(10**9, 10)) == 8
assert math.log(125, 5) == 3.0000000000000004 and math.ceil(math.log(125, 5)) == 4  # the ceil trap: 3 levels, not 4
assert math.log10(1000) == 3.0 and math.log2(2**30) == 30.0
assert (2**10).bit_length() == 11 and (2**10 - 1).bit_length() == 10
assert N9.bit_length() == 30 and (N9 - 1).bit_length() == 30
assert levels(125, 5) == 3 and levels(1000, 10) == 3 and levels(10**9, 10) == 9  # the integer loop is exact

# ---- Try it 3: count comparisons instead of timing (ranges only: exact counts depend on the CPython sort) -------
class Counted:
    count = 0
    __slots__ = ('v',)
    def __init__(self, v):
        self.v = v
    def __lt__(self, other):
        Counted.count += 1
        return self.v < other.v

def sort_count(n, seed=5):
    keys = list(range(n))
    random.Random(seed).shuffle(keys)
    items = [Counted(k) for k in keys]
    Counted.count = 0
    items.sort()
    return Counted.count

counts = [sort_count(2**k) for k in (14, 15, 16)]
for c, k in zip(counts, (14, 15, 16)):
    assert c < 2**k * k  # fewer than n log2 n comparisons
for a, b in zip(counts, counts[1:]):
    assert 2.0 < b / a < 2.3  # about 2.1x per doubling
def pairwise(n):
    return n * (n - 1) // 2
assert pairwise(2**14) == 134_209_536
assert round(pairwise(2**15) / pairwise(2**14)) == 4

print(f'all asymptotic notation and logarithm examples pass on Python {sys.version.split()[0]} '
      f'(sort comparisons at 2^14, 2^15, 2^16: {counts})')
