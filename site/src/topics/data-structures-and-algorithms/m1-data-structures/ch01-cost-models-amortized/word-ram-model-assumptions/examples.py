"""Every number and claim in the word-RAM model reel, executed and checked.
Run: python3 examples.py (CI runs it too). Standard library only, seeded, deterministic.

No timing and no measured cache or branch costs: interpreter overhead would swamp them. The hardware figures
(Drepper 2007, Agner Fog 2026) are the sources' own numbers, kept as named constants with their source and date.
The real latency staircase is measured in the chapter lab (topic 10)."""
import math
import random
from bisect import bisect_right

# ── The running example: the vector, a million sorted 64-bit keys (w = 64, U = 2^64) ──────────────────────────
W = 64
N = 1_000_000
U = 2**W
assert U == 18_446_744_073_709_551_616
_rng = random.Random(2026)
keys = sorted(_rng.getrandbits(W) for _ in range(N))
assert len(keys) == N and all(a <= b for a, b in zip(keys, keys[1:]))


def binary_search_predecessor(x):
    """Index of the largest key <= x (or -1), counting comparisons, probe indices and live-range lengths."""
    lo, hi = 0, N
    comparisons, probes, sizes = 0, [], [hi - lo]
    while lo < hi:
        mid = (lo + hi) // 2
        comparisons += 1
        probes.append(mid)
        if keys[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
        sizes.append(hi - lo)
    return lo - 1, comparisons, probes, sizes


# Step 1: a million keys, twenty probes.
assert N == 1_000_000
assert math.ceil(math.log2(N + 1)) == 20 and N + 1 == 1_000_001
assert round(math.log2(N), 1) == 19.9  # "log2 1,000,000 is about 19.9, so 20 probes"
FIXED = 653159  # the fixed query is the key after keys[FIXED]: it needs the full 20 comparisons and touches 17 lines
x_fixed = keys[FIXED] + 1
pos, comps, probes, sizes = binary_search_predecessor(x_fixed)
assert pos == FIXED == bisect_right(keys, x_fixed) - 1  # predecessor means the largest key <= x
assert comps == 20
# The live range halves: 1,000,000, 500,000, 250,000, 125,000, 62,500, 31,250, 15,625 (the exact length is within 1).
nominal = [1_000_000, 500_000, 250_000, 125_000, 62_500, 31_250, 15_625]
assert nominal == [N // 2**k for k in range(7)] and all(N % 2**k == 0 for k in range(7))
assert all(abs(s - m) <= 1 for s, m in zip(sizes, nominal))
sample = random.Random(1)
counts = set()
for _ in range(2000):
    q = sample.getrandbits(W)
    p, c, _, _ = binary_search_predecessor(q)
    assert p == bisect_right(keys, q) - 1 and c <= 20
    counts.add(c)
assert counts <= {19, 20}  # over random queries 19 or 20 comparisons

# n log2 n against the exact comparison-sort floor log2(n!).
n_log_n = N * math.log2(N)
assert 19_900_000 < n_log_n < 20_000_000  # shown as "about 20,000,000"
log2_factorial = sum(math.log2(k) for k in range(1, N + 1))
assert round(log2_factorial) == 18_488_885  # about 18.5 million: the floor is of order n log n, 8% below it
assert 1.07 < n_log_n / log2_factorial < 1.09
assert round(math.log2(10**9), 1) == 29.9 and math.ceil(math.log2(10**9)) == 30  # Prove it 1

# ── Step 2: the word-RAM, five unit operations on a 64-bit word ─────────────────────────────────────────────
x = 3 * 2**32 + 7
assert x == 12_884_901_895
assert x >> 32 == 3 and x & (2**32 - 1) == 7  # high 32 bits: cluster 3; low 32 bits: position 7
memory = [x, 0, 0]  # cells at addresses 0, 1, 2
units = 0
mid = (0 + 2) // 2  # an address held in a register
units += 1  # + (computing the address)
v = memory[mid]
units += 1  # load at a computed address
less = v < x
units += 1  # compare
shifted = x >> 1
units += 1  # shift
memory[0] = shifted
units += 1  # store
assert units == 5 and shifted == 6_442_450_947
OPERATIONS = ['+', '-', '*', 'div', 'mod', '&', '|', 'xor', '<<', '>>', '<', '>', 'load', 'store']
assert len(OPERATIONS) == 14  # ten on the first line of the drawing, four on the second
assert len(memory) == 3  # addresses 0, 1, 2

# ── Step 4: a word must hold a pointer, w >= log2 n ────────────────────────────────────────────────────────
assert math.ceil(math.log2(N)) == 20 and 2**20 == 1_048_576 >= N
assert 2**20 - 1 == 1_048_575 >= N - 1 == 999_999  # the largest index fits in 20 bits
assert W - 20 == 44 and W >= math.ceil(math.log2(N))
assert 2**8 == 256 < N  # an 8-bit word reaches 256 cells
# Why the word cannot be unbounded: repeated squaring makes a 2^n-bit number in n steps (Mehlhorn and Sanders).
assert (2 ** (2**20)).bit_length() == 2**20 + 1  # squaring 2 twenty times: 1,048,577 bits in twenty steps (step 4: a million-bit number)
sq = 2
for _ in range(20):
    sq = sq * sq  # twenty squarings, each one unit on an unbounded word
assert sq.bit_length() == 2**20 + 1 > 1_000_000
assert (2**64 - 59).bit_length() == 64  # topic 1's prime: one word

# ── Step 5: big numbers pay by the word ───────────────────────────────────────────────────────────────────
big = random.Random(5)
BITS = 4096
a, b = big.getrandbits(BITS) | (1 << (BITS - 1)), big.getrandbits(BITS) | (1 << (BITS - 1))


def to_words(v, digit_bits, count):
    return [(v >> (digit_bits * i)) & ((1 << digit_bits) - 1) for i in range(count)]


def from_words(ws, digit_bits):
    return sum(d << (digit_bits * i) for i, d in enumerate(ws))


words = BITS // W
assert words == 64
A, B = to_words(a, W, words), to_words(b, W, words)
carry, out, word_additions = 0, [], 0
for i in range(words):  # one word addition (with carry) per word
    s = A[i] + B[i] + carry
    word_additions += 1
    out.append(s & (2**W - 1))
    carry = s >> W
assert from_words(out, W) + (carry << BITS) == a + b
assert word_additions == 64 and math.log2(4096) == 12  # Prove it 3: 64, not 1, 4,096 or 12


def schoolbook(xs, ys, digit_bits):
    """Schoolbook multiplication; each digit-by-digit product is one multiply (it returns a two-digit product)."""
    res, multiplies = [0] * (len(xs) + len(ys)), 0
    for i, p in enumerate(xs):
        c = 0
        for j, q in enumerate(ys):
            t = res[i + j] + p * q + c
            multiplies += 1
            res[i + j] = t & ((1 << digit_bits) - 1)
            c = t >> digit_bits
        res[i + len(ys)] += c
    return res, multiplies


prod, mults = schoolbook(A, B, W)  # a multiply that returns the full two-word product (Fredman and Willard)
assert from_words(prod, W) == a * b and mults == 64 * 64 == 4096
A32, B32 = to_words(a, 32, 128), to_words(b, 32, 128)  # with C's low-word multiply: 32-bit digits
prod32, mults32 = schoolbook(A32, B32, 32)
assert from_words(prod32, 32) == a * b and mults32 == 128 * 128 == 16_384
assert mults32 == 4 * mults

# ── Step 6: one load, two prices (the sources' numbers, not measurements) ──────────────────────────────────
# Intel's figures for a Pentium M as listed by Drepper, "What Every Programmer Should Know About Memory", 2007.
DREPPER_PENTIUM_M_CYCLES = {'register': 1, 'L1d': 3, 'L2': 14, 'main_memory': 240}
assert DREPPER_PENTIUM_M_CYCLES['main_memory'] // DREPPER_PENTIUM_M_CYCLES['L1d'] == 80  # the 80x ratio
assert [10**k for k in range(4)] == [1, 10, 100, 1000]  # the decade ticks of the cycle axis
CACHE_LINE_BYTES = 64  # Drepper: "nowadays the norm is 64 bytes"; Agner's Zen 5 table: "64 B line size"
KEYS_PER_LINE = CACHE_LINE_BYTES // 8
assert KEYS_PER_LINE == 8
lines = {(i * 8) // CACHE_LINE_BYTES for i in probes}  # 8-byte keys in an array aligned to 64 bytes
assert len(lines) == 17 and len(probes) == 20
line_counts = set()
for _ in range(500):
    _, _, pr, _ = binary_search_predecessor(sample.getrandbits(W))
    line_counts.add(len({(i * 8) // CACHE_LINE_BYTES for i in pr}))
    assert pr[0] == N // 2 and pr[1] in (N // 4, 3 * N // 4)  # every query starts at the midpoint: hot queries share the first lines
assert line_counts <= {16, 17}  # 17 is a cold-cache count: up to 17 trips, fewer when the first probes are cached
# Zen 5 (Agner Fog's manual, last updated 2026-05-23): L1d 4 clocks, L2 14 clocks, no main-memory figure.
AGNER_ZEN5_LATENCY = {'L1d': 4, 'L2': 14}
AGNER_ZEN5_LINE_BYTES = 64

# ── Step 7: a wrong guess flushes the pipeline (Agner Fog's manual, 2026-05-23) ────────────────────────────
STAGES = 8  # stage boxes in the drawing (an illustration, not a real core)
AGNER_MISPREDICT_ZEN5 = (15, 25)
AGNER_MISPREDICT_INTEL_RECENT = (15, 20)  # Haswell to the Lakes (section 3.8)
AGNER_MISPREDICT_TIGER_LAKE = (16, 20)  # Ice Lake and Tiger Lake chapter: "varies between 16 and 20 clock cycles"
assert AGNER_MISPREDICT_TIGER_LAKE[1] == AGNER_MISPREDICT_INTEL_RECENT[1]  # Alder Lake: "sometimes exceeding 20"
AGNER_MISPREDICT_PPRO = (10, 20)
assert AGNER_MISPREDICT_ZEN5 == (15, 25) and AGNER_MISPREDICT_INTEL_RECENT == (15, 20) and AGNER_MISPREDICT_PPRO == (10, 20)
assert STAGES == 8  # drawn, not measured; the model charges the comparison one unit

# ── Step 8: the comparison model, one bit per question ─────────────────────────────────────────────────────
places, left_after = 8 + 1, []
while places > 1:
    left_after.append(places)
    places = (places + 1) // 2  # an answer keeps the larger side
left_after.append(places)
assert left_after == [9, 5, 3, 2, 1] and len(left_after) - 1 == 4
assert math.ceil(math.log2(9)) == 4 and math.ceil(math.log2(1_000_001)) == 20

# ── Step 10: radix sort, digits as array indices ───────────────────────────────────────────────────────────
passes_done = 0


def radix_sort_lsd(ks, width, r):
    """LSD radix sort: a stable counting sort on each r-bit digit, lowest digit first. Returns (sorted list, passes, placements),
    where a placement is one key put into a bucket (each key is placed once per pass)."""
    passes = placements = 0
    for shift in range(0, width, r):
        buckets = [[] for _ in range(1 << r)]
        for k in ks:
            buckets[(k >> shift) & ((1 << r) - 1)].append(k)  # stable: input order kept inside a bucket
            placements += 1
        ks = [k for bucket in buckets for k in bucket]
        passes += 1
    return ks, passes, placements


radix_rng = random.Random(9)
sample_keys = [radix_rng.getrandbits(W) for _ in range(1000)]
for r, expected_passes in [(8, 8), (16, 4)]:
    out_keys, passes, placed = radix_sort_lsd(sample_keys, W, r)
    assert out_keys == sorted(sample_keys) and passes == expected_passes == math.ceil(64 / r)
    assert placed == passes * len(sample_keys)  # each key is placed once per pass: 4 placements per key for r = 16
assert [math.ceil(64 / r) for r in (8, 16, 20, 32)] == [8, 4, 4, 2]  # 2^20 and 2^32 buckets: counted, not built
assert 2**16 == 65_536
assert radix_sort_lsd(sample_keys, W, 16)[2] // len(sample_keys) == 4  # 4 placements per key ...
assert 4 * N == 4_000_000  # ... so 4,000,000 placements for the million-key vector
assert 2**16 <= N  # a 16-bit digit gives at most about n buckets: one pass is O(n)
assert W // 16 == 4  # w / digit bits = 64 / 16 passes
digits = [(x_fixed >> s) & 0xFFFF for s in (0, 16, 32, 48)]
assert sum(d << (16 * i) for i, d in enumerate(digits)) == x_fixed  # the four 16-bit digits recombine
ks32 = [radix_rng.getrandbits(32) for _ in range(1000)]
out32, passes32, _ = radix_sort_lsd(ks32, 32, 11)
assert out32 == sorted(ks32) and passes32 == 3 == math.ceil(32 / 11) and 2**11 == 2048  # Prove it, in full (b)
# Four passes stay four as n grows; log2 n does not.
assert [round(math.log2(m), 1) for m in (10**6, 10**9)] == [19.9, 29.9]

# ── Steps 3, 11, 12, 15: van Emde Boas, halve the bits ─────────────────────────────────────────────────────
class VEB:
    """A van Emde Boas tree over w-bit keys (w a power of two). Clusters live in a dictionary, so w = 64 is possible
    without a 2^64-slot array. min and max are stored at every level; each operation recurses once."""

    def __init__(self, w):
        self.w, self.min, self.max = w, None, None
        if w > 1:
            self.lo_bits = w // 2
            self.summary = None
            self.cluster = {}

    def insert(self, x):
        if self.min is None:
            self.min = self.max = x
            return
        if x == self.min or x == self.max:
            return
        if x < self.min:
            x, self.min = self.min, x
        if self.w > 1:
            c, i = x >> self.lo_bits, x & ((1 << self.lo_bits) - 1)
            if c not in self.cluster:
                self.cluster[c] = VEB(self.lo_bits)
            if self.cluster[c].min is None:
                if self.summary is None:
                    self.summary = VEB(self.lo_bits)
                self.summary.insert(c)  # the one recursive call: the cluster is new
            self.cluster[c].insert(i)
        if x > self.max:
            self.max = x

    def contains(self, x):
        if x == self.min or x == self.max:
            return True
        if self.w == 1 or self.min is None:
            return False
        c, i = x >> self.lo_bits, x & ((1 << self.lo_bits) - 1)
        return c in self.cluster and self.cluster[c].contains(i)

    def pred_lt(self, x, depth=0):
        """Largest stored key < x, and the number of levels entered below this one."""
        if self.min is None or x <= self.min:
            return None, depth
        if x > self.max:
            return self.max, depth
        if self.w == 1:  # one bit: min = 0, max = 1, x = 1
            return self.min, depth
        c, i = x >> self.lo_bits, x & ((1 << self.lo_bits) - 1)
        if c in self.cluster and self.cluster[c].min is not None and i > self.cluster[c].min:
            y, d = self.cluster[c].pred_lt(i, depth + 1)  # recurse into the cluster ...
            return (c << self.lo_bits) | y, d
        pc, d = self.summary.pred_lt(c, depth + 1) if self.summary else (None, depth)  # ... or into the summary
        if pc is None:
            return self.min, d
        return (pc << self.lo_bits) | self.cluster[pc].max, d

    def predecessor(self, x):
        """Largest stored key <= x (None if there is none) and the recursion depth."""
        if self.contains(x):
            return x, 0
        return self.pred_lt(x)


halvings, wbits = [], 64
while wbits >= 1:
    halvings.append(wbits)
    wbits //= 2
assert halvings == [64, 32, 16, 8, 4, 2, 1] and len(halvings) - 1 == 6 == int(math.log2(64))
assert math.log2(16) == 4
for w in (16, 64):
    veb_rng = random.Random(100 + w)
    members = sorted({veb_rng.getrandbits(w) for _ in range(1000)})
    tree = VEB(w)
    for k in members:
        tree.insert(k)
    deepest = 0
    queries = [veb_rng.getrandbits(w) for _ in range(5000)] + members[:50] + [m + 1 for m in members[:50] if m + 1 < 2**w]
    for q in queries:
        got, depth = tree.predecessor(q)
        j = bisect_right(members, q) - 1
        assert got == (members[j] if j >= 0 else None)
        deepest = max(deepest, depth)
    assert deepest <= math.log2(w)
    assert len(tree.cluster) <= len(members)  # the clusters actually stored: at most n, not 2^(w/2)
# A deliberate worst case for w = 64: two keys that differ only in the last bit are found at the bottom level.
deep = VEB(64)
for k in (0, 1, 2**32 + 5, 2**32 + 6, 2**33):
    deep.insert(k)
assert deep.predecessor(2**32 + 6)[0] == 2**32 + 6 and deep.pred_lt(2**32 + 6)[0] == 2**32 + 5
depths = [deep.pred_lt(q)[1] for q in range(2**32 + 1, 2**32 + 9)]
assert max(depths) <= 6
assert 2 ** (64 // 2) == 4_294_967_296  # the top level of a plain array vEB: 2^32 cluster slots (Prove it, in full (d))
# The depth does not depend on n.
assert all(d <= 6 for d in depths) and int(math.log2(64)) == 6

# ── Step 13: fusion tree toy, four 8-bit keys inside a 64-bit word ─────────────────────────────────────────
FKEYS = [21, 27, 100, 110]
FW = 8
assert [format(k, '08b') for k in FKEYS] == ['00010101', '00011011', '01100100', '01101110']


def distinguishing_positions(ks, width):
    """Bit positions (0 = rightmost) where the trie of the keys branches."""
    pos = set()
    for a, b in zip(ks, ks[1:]):  # sorted keys: adjacent pairs give every branching
        pos.add((a ^ b).bit_length() - 1)
    return sorted(pos, reverse=True)


POS = distinguishing_positions(FKEYS, FW)
assert POS == [6, 3] and len(POS) <= len(FKEYS) - 1  # at most k - 1 bits matter


def sketch(v):
    return sum(((v >> p) & 1) << (len(POS) - 1 - i) for i, p in enumerate(POS))


sketches = [sketch(k) for k in FKEYS]
assert sketches == [0, 1, 2, 3] and [format(s, '02b') for s in sketches] == ['00', '01', '10', '11']  # order preserved
BLOCK = 3  # a 1 before each 2-bit sketch
node_word = sum((0b100 | s) << (BLOCK * (len(FKEYS) - 1 - i)) for i, s in enumerate(sketches))
assert format(node_word, '012b') == '100101110111' and node_word == 2423
q = 25
assert format(q, '08b') == '00011001' and sketch(q) == 1
query_word = sum(sketch(q) << (BLOCK * (len(FKEYS) - 1 - i)) for i in range(len(FKEYS)))
assert format(query_word, '012b') == '001001001001' and query_word == 585
diff = node_word - query_word
assert format(diff, '012b') == '011100101110' and diff == 1838
leading = [(diff >> (BLOCK * (len(FKEYS) - 1 - i) + 2)) & 1 for i in range(len(FKEYS))]
assert leading == [0, 1, 1, 1] and sum(leading) == 3  # 3 sketches are >= sketch(q)
rank_pred = FKEYS[len(FKEYS) - sum(leading) - 1]
assert rank_pred == 21 == FKEYS[bisect_right(FKEYS, q) - 1]
assert node_word < 2**64 and node_word >= 2**8  # the node word is 12 bits: inside a 64-bit word, not an 8-bit one


def sketch_rank_only(v):
    s = sketch(v)
    r = sum(1 for t in sketches if t < s)
    return FKEYS[r - 1] if r else None


def fusion_predecessor(v):
    """Predecessor by sketch rank plus desketchifying (Demaine, 6.851 lecture 12, section 5)."""
    s = sketch(v)
    i = sum(1 for t in sketches if t < s)
    near = [FKEYS[j] for j in (i - 1, i) if 0 <= j < len(FKEYS)]  # the sketch neighbours of v

    def lcp(a, b):
        n = 0
        while n < FW and ((a >> (FW - 1 - n)) & 1) == ((b >> (FW - 1 - n)) & 1):
            n += 1
        return n

    best = max(near, key=lambda c: lcp(v, c))
    n = lcp(v, best)
    if n == FW:
        return best
    prefix = (v >> (FW - n)) << (FW - n) if n else 0
    if (v >> (FW - 1 - n)) & 1:
        e = prefix | ((1 << (FW - 1 - n)) - 1)  # v goes right: the largest value on the other (left) side
        r = sum(1 for t in sketches if t <= sketch(e))
    else:
        e = prefix | (1 << (FW - 1 - n))  # v goes left: the smallest value on the other (right) side
        r = sum(1 for t in sketches if t < sketch(e))
    return FKEYS[r - 1] if r else None


assert sketch(22) == 0 and format(22, '08b') == '00010110'
q22_diff = node_word - sum(sketch(22) << (BLOCK * (len(FKEYS) - 1 - i)) for i in range(len(FKEYS)))
q22_leading = [(q22_diff >> (BLOCK * (len(FKEYS) - 1 - i) + 2)) & 1 for i in range(len(FKEYS))]
assert q22_leading == [1, 1, 1, 1] and sketch_rank_only(22) is None  # the parallel compare says "no predecessor"
assert FKEYS[bisect_right(FKEYS, 22) - 1] == 21 and fusion_predecessor(22) == 21  # desketchifying finds it
expected = [FKEYS[bisect_right(FKEYS, v) - 1] if bisect_right(FKEYS, v) else None for v in range(256)]
assert [fusion_predecessor(v) for v in range(256)] == expected
assert sum(1 for v in range(256) if sketch_rank_only(v) == expected[v]) == 42  # the sketch rank alone: right 42 times of 256
# A fusion node holds about w^(1/5) keys (the notes' exponent; "any small constant power suffices"). With 2.3 keys the
# node is nearly binary; with w^(1/3) = 4 keys the height is about 10. Either way it is far from log n / log w = 3.3.
assert round(64**0.2, 1) == 2.3
assert round(math.log2(N) / math.log2(64**0.2), 1) == 16.6
assert round(64 ** (1 / 3), 6) == 4.0 and round(math.log(N, 4), 1) == 10.0  # w^(1/3) = 4 keys per node: height about 10
assert round(math.log2(N) / math.log2(64), 1) == 3.3  # log n / log w before constants

# ── Step 14 and the Deep dive: the three counts, side by side ─────────────────────────────────────────────
assert comps == 20 and int(math.log2(64)) == 6
assert N == 10**6

# ── Prerequisites self-checks and Deep dive ("Prove it, in full") ───────────────────────────────────────
assert 13 >> 2 == 3 and 13 & 6 == 4
assert math.ceil(math.log2(1000)) == 10 and math.ceil(math.log2(1001)) == 10  # halvings for 1,000 keys
assert 1024 // 64 == 16  # comparing two 1,024-bit keys: 16 words
assert 2**3 == 8 and 2**2 == 4 and 2**1 == 2
# min{log w, log_w n} is at most about sqrt(log n): the two are equal where log w = sqrt(log n).
for log_n in (20, 30, 64, 1024):  # log2 n
    for log_w in range(1, 65):  # log2 w
        assert min(log_w, log_n / log_w) <= math.sqrt(log_n) + 1e-9
print('word-RAM examples: all assertions hold')
