"""Every number and claim in the Lower bounds and adversary arguments reel, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel shows.

Conventions (stated once): the model is the comparison model, one unit of cost is one comparison of two keys, and the keys are distinct
unless a block says otherwise. log2 of a factorial at a million keys is computed from Stirling's series in 60-digit decimal arithmetic
(the series is checked against the exact integer n! for n up to 100,000), so the run takes seconds instead of the minute an exact
1,000,000! and C(2,000,000, 1,000,000) would take."""
import itertools
import math
import random
from decimal import Decimal, getcontext
from functools import lru_cache

getcontext().prec = 60
PI = Decimal("3.14159265358979323846264338327950288419716939937510582097494")
LN2 = Decimal(2).ln()


def ln_fact(n):
    """ln n! by Stirling's series; the first omitted term bounds the error, far below 10**-40 for n >= 1000."""
    n = Decimal(n)
    return n * n.ln() - n + (2 * PI * n).ln() / 2 + 1 / (12 * n) - 1 / (360 * n**3) + 1 / (1260 * n**5) - 1 / (1680 * n**7)


def log2_fact(n):
    return ln_fact(n) / LN2


def exact_ceil_log2_fact(n):
    return (math.factorial(n) - 1).bit_length()  # = ceil(log2 n!) for n >= 1


def ceil_log2(k):
    return (k - 1).bit_length()


# the series agrees with the exact integer at 1,000 and 100,000 (floor and ceiling both)
for n in (1000, 100_000):
    x = log2_fact(n)
    assert math.floor(x) == math.factorial(n).bit_length() - 1
    assert math.ceil(x) == exact_ceil_log2_fact(n)

# ---------------------------------------------------------------- Step 1 and 14: the vector and the three claims
N = 1_000_000  # keys, 64-bit
W = 64
CLAIM_SORT, CLAIM_MINMAX, CLAIM_DISTINCT = 15_000_000, 1_200_000, 5_000_000
LOG_FACT_N = log2_fact(N)
CEIL_LOG_FACT_N = math.ceil(LOG_FACT_N)
FLOOR_LOG_FACT_N = math.floor(LOG_FACT_N)
assert (CEIL_LOG_FACT_N, FLOOR_LOG_FACT_N) == (18_488_885, 18_488_884)
assert 0.001 < LOG_FACT_N - FLOOR_LOG_FACT_N < 0.999  # not within rounding of an integer
assert CLAIM_SORT < 18_488_885 and CLAIM_DISTINCT < 18_488_885
MINMAX_N = (3 * N + 1) // 2 - 2  # ceil(3n/2) - 2
assert MINMAX_N == 1_499_998 and CLAIM_MINMAX < 1_499_998

# ---------------------------------------------------------------- Step 2: any comparison sort of three keys is a tree


def insertion_sort(keys, log):
    """Insertion sort that scans from the right and records every comparison as (pair, answer)."""
    a = list(keys)
    for i in range(1, len(a)):
        j = i
        while j > 0:
            x, y = a[j - 1], a[j]
            less = x < y
            log.append(((x, y), less))
            if less:
                break
            a[j - 1], a[j] = a[j], a[j - 1]
            j -= 1
    return a


# Name the keys by their letters; the order they are given in is the input.
LETTERS = "abc"


def transcript(perm):
    """perm[i] is the rank of key i. Returns the comparisons as letter pairs with the answer (first < second?)."""
    log = []
    keys = [(perm[i], LETTERS[i]) for i in range(3)]

    class K:
        def __init__(self, r, n):
            self.r, self.n = r, n

        def __lt__(self, other):
            return self.r < other.r

    objs = [K(r, n) for r, n in keys]
    out = insertion_sort(objs, log)
    return tuple(((x.n, y.n), ans) for ((x, y), ans) in log), "<".join(o.n for o in out)


trans = {}
for perm in itertools.permutations(range(3)):
    tr, order = transcript(perm)
    trans[perm] = (tr, order)
assert len({v[0] for v in trans.values()}) == 6  # six inputs, six distinct transcripts: six leaves = 3!
depths = {v[1]: len(v[0]) for v in trans.values()}
assert depths == {"a<b<c": 2, "a<c<b": 3, "c<a<b": 3, "b<a<c": 2, "b<c<a": 3, "c<b<a": 3}
assert [depths[o] for o in ("a<b<c", "a<c<b", "c<a<b", "b<a<c", "b<c<a", "c<b<a")] == [2, 3, 3, 2, 3, 3]
assert max(depths.values()) == 3 and sum(depths.values()) == 16
# the root is a : b, the second comparison is b : c when a < b and a : c when b < a
roots = {v[0][0][0] for v in trans.values()}
assert roots == {("a", "b")}
second = {(v[0][0][1], v[0][1][0]) for v in trans.values()}
assert second == {(True, ("b", "c")), (False, ("a", "c"))}
# the input b < a < c (the dot's path in the picture): a:b is ">" (a is not less than b), then a:c is "<"
rank_b_a_c = (1, 0, 2)  # a has rank 1, b rank 0, c rank 2
assert trans[rank_b_a_c][0] == ((("a", "b"), False), (("a", "c"), True)) and trans[rank_b_a_c][1] == "b<a<c"
LEVEL_CAPACITY = [2**i for i in range(8)]
assert LEVEL_CAPACITY[:3] == [1, 2, 4] and LEVEL_CAPACITY[-1] == 128
assert math.factorial(3) == 6

# ---------------------------------------------------------------- Step 3: two comparisons cannot sort three keys
ORDERS3 = ["abc", "acb", "bac", "bca", "cab", "cba"]  # the keys in increasing order


def before(order, x, y):
    return order.index(x) < order.index(y)


def adversary_sizes(pairs):
    """The larger-half adversary on the six orders; returns the surviving sets after each comparison."""
    alive = list(ORDERS3)
    sizes = [len(alive)]
    for x, y in pairs:
        yes = [o for o in alive if before(o, x, y)]
        no = [o for o in alive if not before(o, x, y)]
        alive = yes if len(yes) >= len(no) else no
        sizes.append(len(alive))
    return sizes, alive


sizes, alive = adversary_sizes([("a", "b"), ("b", "c")])
assert sizes == [6, 3, 2] and sorted(alive) == ["acb", "cab"]
PAIRS3 = [("a", "b"), ("b", "c"), ("a", "c")]
for p1 in PAIRS3:
    for p2 in PAIRS3:
        s, _ = adversary_sizes([p1, p2])
        assert s[2] >= 2  # no choice of two comparisons leaves fewer than two orders: height 2 never suffices
assert 2**2 == 4 < 6 <= 2**3 and ceil_log2(6) == 3
# after a:b -> a<b the three survivors are abc, acb, cab
yes = [o for o in ORDERS3 if before(o, "a", "b")]
assert yes == ["abc", "acb", "cab"]

# ---------------------------------------------------------------- Step 4: n! leaves force log2 n! levels
for n, want in ((3, 3), (4, 5), (5, 7), (8, 16), (10, 22), (12, 29)):
    assert exact_ceil_log2_fact(n) == want
assert math.factorial(5) == 120 and 64 < 120 <= 128 and ceil_log2(120) == 7
assert math.factorial(8) == 40_320 and ceil_log2(40_320) == 16
assert round(math.log2(math.factorial(10)), 2) == 21.79
assert [2**i for i in range(8)] == [1, 2, 4, 8, 16, 32, 64, 128]
# the million-key table line
assert CEIL_LOG_FACT_N == 18_488_885
lo = round(N * math.log2(N) - 1.443 * N)
hi = round(N * math.log2(N))
assert (lo, hi) == (18_488_569, 19_931_569) and lo < CEIL_LOG_FACT_N < hi
for n in range(2, 1001):  # the elementary bracket (n/2)(log2 n - 1) <= log2 n! <= n log2 n
    lf = math.lgamma(n + 1) / math.log(2)
    assert n / 2 * (math.log2(n) - 1) <= lf <= n * math.log2(n)
    assert n * math.log2(n) - 1.443 * n < lf < n * math.log2(n)  # Stirling's bracket

# merge sort's worst-case comparisons: C(n) = C(ceil(n/2)) + C(floor(n/2)) + n - 1
@lru_cache(None)
def merge_worst(n):
    return 0 if n <= 1 else merge_worst((n + 1) // 2) + merge_worst(n // 2) + n - 1


def merge_formula(n):
    k = ceil_log2(n)
    return n * k - 2**k + 1


c = [0, 0]
for n in range(2, 100_001):
    c.append(c[(n + 1) // 2] + c[n // 2] + n - 1)
assert all(c[n] == merge_formula(n) for n in range(1, 100_001))
MERGE_WORST_N = merge_worst(N)
assert MERGE_WORST_N == merge_formula(N) == 18_951_425
ratio = MERGE_WORST_N / CEIL_LOG_FACT_N
assert round(ratio, 3) == 1.025 and round((ratio - 1) * 100, 1) == 2.5  # 2.5 % above the floor
assert 2**20 - 1 == 1_048_575  # (for the Deep dive's reminder of what the previous reel counted: n per level, not n - 1)


# exact minimum comparisons by exhaustive search over the sets of inputs still consistent with the answers
def perm_masks(n):
    perms = list(itertools.permutations(range(n)))  # perm[i] = rank of key i
    pairs = list(itertools.combinations(range(n), 2))
    less = {p: sum(1 << k for k, pm in enumerate(perms) if pm[p[0]] < pm[p[1]]) for p in pairs}
    return perms, pairs, less


def can_sort(n, d):
    perms, pairs, less = perm_masks(n)
    full = (1 << len(perms)) - 1

    @lru_cache(None)
    def ok(S, d):
        cnt = bin(S).count("1")
        if cnt <= 1:
            return True
        if d == 0 or cnt > 2**d:
            return False
        for p in pairs:
            a, b = S & less[p], S & ~less[p]
            if a and b and bin(a).count("1") <= 2 ** (d - 1) and bin(b).count("1") <= 2 ** (d - 1) and ok(a, d - 1) and ok(b, d - 1):
                return True
        return False

    return ok(full, d)


for n, need in ((3, 3), (4, 5), (5, 7)):
    assert can_sort(n, need) and not can_sort(n, need - 1)
    assert need == exact_ceil_log2_fact(n)

# ---------------------------------------------------------------- Step 5: the average order pays it too
KRAFT = lambda ds: sum(2.0 ** -d for d in ds)
caterpillar = [1, 2, 3, 4, 5, 5]
assert KRAFT(caterpillar) == 1.0


def rebalance(depths):
    """Hang the two deepest sibling leaves under the shallowest leaf (they become its two children; their parent becomes a leaf)."""
    d = sorted(depths)
    deepest = d[-1]
    assert d[-2] == deepest  # the two deepest leaves are siblings at that depth in these trees
    shallow = d[0]
    assert deepest - shallow >= 2
    rest = d[1:-2] + [deepest - 1]  # the sibling pair's parent is a leaf now
    return sorted(rest + [shallow + 1, shallow + 1])


# a depth multiset in which the deepest two are siblings: [1,2,3,4,5,5] -> [2,2,2,3,4,4]; then the 4,4 are siblings (leaf and its new sibling)
t1 = caterpillar
t2 = rebalance(t1)
t3 = rebalance(t2)
assert t2 == [2, 2, 2, 3, 4, 4] and t3 == [2, 2, 3, 3, 3, 3]
assert [sum(t) for t in (t1, t2, t3)] == [20, 17, 16]
assert [round(sum(t) / 6, 2) for t in (t1, t2, t3)] == [3.33, 2.83, 2.67]
assert KRAFT(t2) == 1.0 and KRAFT(t3) == 1.0
assert round(math.log2(6), 3) == 2.585 and sum(t3) / 6 >= math.log2(6)


@lru_cache(None)
def min_depth_sum(L):
    """Smallest sum of leaf depths over binary trees with L leaves."""
    if L == 1:
        return 0
    return min(min_depth_sum(a) + min_depth_sum(L - a) + L for a in range(1, L // 2 + 1))


assert min_depth_sum(6) == 16 and min_depth_sum(24) == 112
for L in range(1, 129):
    k = L.bit_length() - 1
    assert min_depth_sum(L) == L * k + 2 * (L - 2**k)
# average over the million keys' orders
assert FLOOR_LOG_FACT_N == 18_488_884

# ---------------------------------------------------------------- Step 6: count the answers
K_SEARCH = N + 1  # a position among N keys, or absent
assert K_SEARCH == 1_000_001 and ceil_log2(K_SEARCH) == 20 == N.bit_length() - 1 + 1  # floor(log2 N) + 1 = 20


def search_probes(arr_len, target_pos):
    """Three-way probes of binary search on a sorted array of arr_len keys when the target is `target_pos` (0..len-1) or absent (-1 .. mixed)."""
    lo, hi, probes = 0, arr_len - 1, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        probes += 1
        if target_pos == mid:
            return probes
        if target_pos < mid:
            hi = mid - 1
        else:
            lo = mid + 1
    return probes


# worst case over every present target and all gaps (a gap target g lies between keys g-1 and g): all positions and gaps for n <= 2000
def worst_probes(n):
    worst = 0
    for t2 in range(-1, 2 * n + 1):  # t2 even: key t2/2 present; t2 odd: gap
        lo, hi, probes = 0, n - 1, 0
        while lo <= hi:
            mid = (lo + hi) // 2
            probes += 1
            if t2 == 2 * mid:
                break
            if t2 < 2 * mid:
                hi = mid - 1
            else:
                lo = mid + 1
        worst = max(worst, probes)
    return worst


for n in range(1, 2001):
    assert worst_probes(n) == n.bit_length() == ceil_log2(n + 1)
# a million keys: the worst target reached by following the larger side always takes 20 probes
lo_, hi_, p_ = 0, N - 1, 0
while lo_ <= hi_:
    mid_ = (lo_ + hi_) // 2
    p_ += 1
    lo_ = mid_ + 1  # always go right: the longer side
assert p_ == 20 and search_probes(N, N - 1) <= 20
rnd = random.Random(1)
assert max(search_probes(N, rnd.randrange(N)) for _ in range(2000)) <= 20

# merging two sorted runs: C(2n, n) interleavings
for n, k_want, c_want in ((4, 7, 70), (3, 5, 20), (5, 8, 252), (8, 14, 12_870)):
    assert math.comb(2 * n, n) == c_want and ceil_log2(c_want) == k_want
assert 2 * 4 - 1 == 7 and 2 * 3 - 1 == 5 and 2 * 8 - 1 == 15
log2_comb_N = (ln_fact(2 * N) - 2 * ln_fact(N)) / LN2
assert math.ceil(log2_comb_N) == 1_999_990 and 1_999_990 < 2 * N - 1 == 1_999_999
approx = 2 * N - 0.5 * math.log2(N) - 0.5 * math.log2(math.pi)  # NMSU's approximation
assert abs(float(log2_comb_N) - approx) < 0.01


def standard_merge_comparisons(a, b):
    i = j = cmp = 0
    while i < len(a) and j < len(b):
        cmp += 1
        if a[i] < b[j]:
            i += 1
        else:
            j += 1
    return cmp


for n in range(1, 51):
    assert standard_merge_comparisons(list(range(1, 2 * n, 2)), list(range(2, 2 * n + 1, 2))) == 2 * n - 1


def merge_min(n):
    """Exhaustive minimum comparisons to merge two sorted runs of n: state = set of interleavings still possible."""
    inter = [frozenset(c) for c in itertools.combinations(range(2 * n), n)]  # positions in the merged order held by run A
    # a_i : b_j -> in an interleaving, a_i is the (i+1)-th A position and b_j the (j+1)-th B position
    info = []
    for A in inter:
        Al = sorted(A)
        Bl = sorted(set(range(2 * n)) - A)
        info.append((Al, Bl))
    qs = [(i, j) for i in range(n) for j in range(n)]
    mask = {q: sum(1 << k for k, (Al, Bl) in enumerate(info) if Al[q[0]] < Bl[q[1]]) for q in qs}
    full = (1 << len(info)) - 1

    @lru_cache(None)
    def ok(S, d):
        cnt = bin(S).count("1")
        if cnt <= 1:
            return True
        if d == 0 or cnt > 2**d:
            return False
        for q in qs:
            a, b = S & mask[q], S & ~mask[q]
            if a and b and ok(a, d - 1) and ok(b, d - 1):
                return True
        return False

    d = 0
    while not ok(full, d):
        d += 1
    return d


assert [merge_min(n) for n in (2, 3, 4, 5)] == [3, 5, 7, 9]  # 2n - 1; counting gives 3, 5, 7, 8
assert ceil_log2(math.comb(10, 5)) == 8 and 2 * 5 - 1 == 9 and ceil_log2(math.comb(16, 8)) == 14 and 2 * 8 - 1 == 15
# sorting five keys: 120 answers, 7 comparisons, met
assert ceil_log2(120) == 7 == exact_ceil_log2_fact(5)


# searching a sorted array: exhaustive minimum with three-way probes and with yes/no comparisons
def search_min(n, threeway):
    # situations: x equals key i (code 2i) or lies in gap g, g = 0..n (code 2g-1 -> use ('gap', g))
    sits = [("eq", i) for i in range(n)] + [("gap", g) for g in range(n + 1)]
    out = {s: (s[1] if s[0] == "eq" else -1) for s in sits}  # the answer: the index, or absent

    def rel(s, i):  # x < A[i], x = A[i], x > A[i]
        if s[0] == "eq":
            return 0 if s[1] == i else (-1 if s[1] < i else 1)
        return -1 if s[1] <= i else 1  # gap g lies below key i iff g <= i

    idx = {s: k for k, s in enumerate(sits)}
    qs = []
    if threeway:
        for i in range(n):
            qs.append([sum(1 << idx[s] for s in sits if rel(s, i) == r) for r in (-1, 0, 1)])
    else:
        for i in range(n):
            qs.append([sum(1 << idx[s] for s in sits if rel(s, i) == -1)])  # x < A[i]?
            qs.append([sum(1 << idx[s] for s in sits if rel(s, i) == 0)])  # x = A[i]?
    full = (1 << len(sits)) - 1
    outs = {}
    for s in sits:
        outs.setdefault(out[s], 0)
        outs[out[s]] |= 1 << idx[s]
    groups = list(outs.values())

    @lru_cache(None)
    def ok(S, d):
        if any(S & ~g == 0 for g in groups):  # all remaining situations give one answer
            return True
        if d == 0:
            return False
        for q in qs:
            parts = [S & m for m in q]
            if not threeway:
                parts = [parts[0], S & ~q[0]]
            parts = [p for p in parts if p]
            if len(parts) > 1 and all(p != S for p in parts) and all(ok(p, d - 1) for p in parts):
                return True
        return False

    d = 0
    while not ok(full, d):
        d += 1
    return d


for n in range(1, 11):
    assert search_min(n, True) == ceil_log2(n + 1)
    assert search_min(n, False) == ceil_log2(n) + 1
assert ceil_log2(N + 1) == 20 and ceil_log2(N) + 1 == 21  # three-way probes and yes/no comparisons at a million
assert math.ceil(math.log(N + 1, 3)) == 13  # plain counting with three-way questions would only give 13

# ---------------------------------------------------------------- Step 7: the maximum
assert ceil_log2(N) == 20 and N - 1 == 999_999
assert 8 - 1 == 7 and N // 2 == 500_000  # a scan of 8 keys: 7 comparisons, 7 losers


def scan_max(keys):
    best, cmp, losers = keys[0], 0, 0
    for k in keys[1:]:
        cmp += 1
        losers += 1
        best = max(best, k)
    return best, cmp, losers


assert scan_max(list(range(1, 9)))[1:] == (7, 7)

# ---------------------------------------------------------------- Step 8: an adversary decides the input last
TRANSCRIPT = [(1, 2, 2), (3, 4, 4), (5, 6, 6), (7, 8, 8), (2, 4, 4), (6, 8, 8)]  # (first key, second key, the larger one)
INPUT_A = {i: i for i in range(1, 9)}
INPUT_B = dict(INPUT_A)
INPUT_B[4] = 9
for x, y, win in TRANSCRIPT:
    for inp in (INPUT_A, INPUT_B):
        assert (x if inp[x] > inp[y] else y) == win  # both inputs give every one of the six answers
lost = {x if win == y else y for x, y, win in TRANSCRIPT}
never_lost = set(range(1, 9)) - lost
assert len(TRANSCRIPT) == 6 < 7 and never_lost == {4, 8}
assert max(INPUT_A, key=INPUT_A.get) == 8 and max(INPUT_B, key=INPUT_B.get) == 4

# 1,000 seeded random strategies that stop early on n = 8: the adversary x_i = i always leaves two keys unbeaten, and raising one
# of them (the one that is not the true maximum) gives a second input with all the same answers and a different maximum
rng = random.Random(7)
for _ in range(1000):
    m = rng.randrange(0, 7)  # fewer than n - 1 = 7 comparisons
    seq = [tuple(rng.sample(range(1, 9), 2)) for _ in range(m)]
    lost = {min(x, y) for x, y in seq}  # the adversary answers by x_i = i, so the smaller index loses
    free = [k for k in range(1, 9) if k not in lost]
    assert len(free) >= 2
    other = [k for k in free if k != 8][0]
    B = dict(INPUT_A)
    B[other] = 9
    assert all((x if B[x] > B[y] else y) == (x if INPUT_A[x] > INPUT_A[y] else y) for x, y in seq)
    assert max(B, key=B.get) == other != 8

# ---------------------------------------------------------------- Step 9 and 10: minimum and maximum together
assert 7 + 6 == 13 == 2 * 8 - 3
assert 4 + 3 + 3 == 10 == (3 * 8 + 1) // 2 - 2


def pairing(keys, referee_compare):
    """Pair up, then the max among winners and the min among losers; returns the comparison count."""
    cmp = 0
    ws, ls = [], []
    for i in range(0, len(keys) - 1, 2):
        cmp += 1
        a, b = keys[i], keys[i + 1]
        if referee_compare(a, b):
            ws.append(a)
            ls.append(b)
        else:
            ws.append(b)
            ls.append(a)
    if len(keys) % 2:
        ws.append(keys[-1])
        ls.append(keys[-1])
    mx = ws[0]
    for k in ws[1:]:
        cmp += 1
        mx = k if referee_compare(k, mx) else mx
    mn = ls[0]
    for k in ls[1:]:
        cmp += 1
        mn = k if referee_compare(mn, k) else mn
    return cmp


for n in range(2, 1001):
    vals = list(range(n))
    random.Random(n).shuffle(vals)
    assert pairing(vals, lambda a, b: a > b) == (3 * n + 1) // 2 - 2  # ceil(3n/2) - 2
assert (3 * 8 + 1) // 2 - 2 == 10 and (3 * 9 + 1) // 2 - 2 == 12
assert 2 * N - 3 == 1_999_997


def game_minmax(n):
    """Exhaustive game value for the minimum and maximum of n keys: fewest comparisons any algorithm can guarantee."""
    perms = list(itertools.permutations(range(n)))
    pairs = list(itertools.combinations(range(n), 2))
    less = {p: sum(1 << k for k, pm in enumerate(perms) if pm[p[0]] < pm[p[1]]) for p in pairs}
    classes = {}
    for k, pm in enumerate(perms):
        classes.setdefault((pm.index(0), pm.index(n - 1)), 0)
        classes[(pm.index(0), pm.index(n - 1))] |= 1 << k
    cls = list(classes.values())
    full = (1 << len(perms)) - 1

    @lru_cache(None)
    def ok(S, d):
        if any(S & ~g == 0 for g in cls):
            return True
        if d == 0:
            return False
        if sum(1 for g in cls if S & g) > 2**d:
            return False
        for p in pairs:
            a, b = S & less[p], S & ~less[p]
            if a and b and ok(a, d - 1) and ok(b, d - 1):
                return True
        return False

    d = 0
    while not ok(full, d):
        d += 1
    return d


assert [game_minmax(n) for n in (2, 3, 4, 5, 6)] == [1, 3, 4, 6, 7]  # = ceil(3n/2) - 2

# the four-state referee: keys are untested (U), only won (W), only lost (L) or both (B); a key gets its value at its first comparison
U, Wn, L, B = "U", "W", "L", "B"


class Referee:
    def __init__(self, n):
        self.n = n
        self.state = {i: U for i in range(n)}
        self.val = {}
        self.lo = 0
        self.hi = 0
        self.units = 0
        self.log = []  # (x, y, winner, units gained)

    def _place(self, k, above):
        if above:
            self.hi += 1
            self.val[k] = self.hi
        else:
            self.lo -= 1
            self.val[k] = self.lo

    def compare(self, x, y):
        """Answer 'x beats y?' (True when x is the larger) so that every answer fits one real input."""
        sx, sy = self.state[x], self.state[y]
        if sx == U and sy == U:
            self._place(x, True)
            self._place(y, False)
            win = x
        elif sx == U:
            # an untested key against a tested one gets at most one unit: it loses to an only-won key, beats an only-lost one
            win_x = sy != Wn
            self._place(x, win_x)
            win = x if win_x else y
        elif sy == U:
            win_y = sx != Wn
            self._place(y, win_y)
            win = y if win_y else x
        else:
            win = x if self.val[x] > self.val[y] else y
        lose = y if win == x else x
        gained = 0
        for k, won in ((win, True), (lose, False)):
            s = self.state[k]
            if won and s in (U, L):
                self.state[k] = Wn if s == U else B
                gained += 1
            elif not won and s in (U, Wn):
                self.state[k] = L if s == U else B
                gained += 1
        self.units += gained
        self.log.append((x, y, win, gained))
        return win == x

    def columns(self):
        return tuple(sum(1 for s in self.state.values() if s == c) for c in (U, Wn, L, B))

    def done(self):
        return self.units == 2 * self.n - 2


# pairing against the referee at n = 8: the trace of the picture
ref = Referee(8)
trace, cols = [], {}
ws, ls = [], []
for i in range(0, 8, 2):
    win = i if ref.compare(i, i + 1) else i + 1
    ws.append(win)
    ls.append(i + 1 if win == i else i)
    trace.append(ref.units)
mx = ws[0]
for k in ws[1:]:
    mx = k if ref.compare(k, mx) else mx
    trace.append(ref.units)
    if len(trace) == 7:
        cols[7] = ref.columns()
mn = ls[0]
for k in ls[1:]:
    mn = k if ref.compare(mn, k) else mn  # mn is the larger one: the new key is the smaller
    trace.append(ref.units)
assert len(ref.log) == 10 and trace == [2, 4, 6, 8, 9, 10, 11, 12, 13, 14] and ref.done() and ref.units == 2 * 8 - 2
# the scoreboard's ten comparisons, keys numbered from 1 as on screen: (first key, second key, larger key, units gained)
SCOREBOARD = [(1, 2, 1, 2), (3, 4, 3, 2), (5, 6, 5, 2), (7, 8, 7, 2), (3, 1, 3, 1), (5, 3, 5, 1), (7, 5, 7, 1), (2, 4, 2, 1), (4, 6, 4, 1), (6, 8, 6, 1)]
assert [(x + 1, y + 1, w + 1, g) for x, y, w, g in ref.log] == SCOREBOARD
assert (mx + 1, mn + 1) == (7, 8)  # the maximum is k7, the minimum is k8
cols[4] = None
ref4 = Referee(8)
for i in range(0, 8, 2):
    ref4.compare(i, i + 1)
assert ref4.columns() == (0, 4, 4, 0) and ref4.units == 8
assert cols[7] == (0, 1, 4, 3)
assert ref.columns() == (0, 1, 1, 6)
two_unit = sum(1 for *_x, g in ref.log if g == 2)
assert two_unit == 4 == 8 // 2

# random correct strategies against the referee: every run needs at least ceil(3n/2) - 2 comparisons, at most floor(n/2) give two units,
# and the referee's values are a real input consistent with every answer it gave
rng = random.Random(11)
for n in (5, 6, 7, 8, 9, 10):
    for _ in range(1000 if n == 8 else 300):
        ref = Referee(n)
        while not ref.done():
            x, y = rng.sample(range(n), 2)
            ref.compare(x, y)
        assert len(ref.log) >= (3 * n + 1) // 2 - 2
        assert sum(1 for *_x, g in ref.log if g == 2) <= n // 2
        assert all(g <= 2 for *_x, g in ref.log)
        assert len(set(ref.val.values())) == n  # distinct values: a real input with no ties
        for x, y, win, g in ref.log:
            assert win == (x if ref.val[x] > ref.val[y] else y)
assert ceil_log2(8 * 7) == 6 and ceil_log2(N * (N - 1)) == 40  # the counting bound for min and max together

# ---------------------------------------------------------------- Step 11 and 12: element distinctness
assert round(CEIL_LOG_FACT_N / 1_000_000, 1) == 18.5  # "about 18.5 million"
assert ceil_log2(2) == 1 and CEIL_LOG_FACT_N == 18_488_885 and N - 1 == 999_999 and MINMAX_N == 1_499_998


def weak_orders(n):
    """Every input with ties, as a tuple of ranks (ordered set partitions): 13, 75, 541 for n = 3, 4, 5."""
    out = set()
    for ranks in itertools.product(range(n), repeat=n):
        used = sorted(set(ranks))
        if used == list(range(len(used))):
            out.add(ranks)
    return sorted(out)


def distinct_min(n, threeway):
    inputs = weak_orders(n)
    idx = {s: k for k, s in enumerate(inputs)}
    dmask = sum(1 << k for k, s in enumerate(inputs) if len(set(s)) == n)
    nmask = ((1 << len(inputs)) - 1) & ~dmask
    pairs = list(itertools.combinations(range(n), 2))
    qs = []
    if threeway:
        for x, y in pairs:
            qs.append([sum(1 << k for k, s in enumerate(inputs) if (s[x] > s[y]) - (s[x] < s[y]) == r) for r in (-1, 0, 1)])
    else:
        for x, y in itertools.permutations(range(n), 2):
            qs.append([sum(1 << k for k, s in enumerate(inputs) if s[x] < s[y])])
    perms_in = sum(1 << k for k, s in enumerate(inputs) if len(set(s)) == n)
    full = (1 << len(inputs)) - 1

    @lru_cache(None)
    def ok(S, d):
        if S & dmask == 0 or S & nmask == 0:
            return True
        if d == 0 or bin(S & perms_in).count("1") > 2**d:
            return False
        for q in qs:
            parts = [S & m for m in q]
            if not threeway:
                parts = [parts[0], S & ~q[0]]
            parts = [p for p in parts if p]
            if len(parts) > 1 and all(p != S for p in parts) and all(ok(p, d - 1) for p in parts):
                return True
        return False

    d = 0
    while not ok(full, d):
        d += 1
    return d


assert [len(weak_orders(n)) for n in (3, 4, 5)] == [13, 75, 541]
assert [distinct_min(n, True) for n in (3, 4, 5)] == [3, 5, 7]  # = ceil(log2 n!): the same as sorting
assert [distinct_min(n, False) for n in (3, 4, 5)] == [4, 7, 10]  # yes/no "<" comparisons without an "=" answer cost more

# the step-12 instance: eight keys at the drawn values, 6 neighbour comparisons and 2 others
VAL = {3: 1, 7: 2, 1: 3, 5: 4, 2: 5, 8: 6, 4: 7, 6: 8}  # key k_i -> value; sorted order k3 k7 k1 k5 k2 k8 k4 k6
order = sorted(VAL, key=VAL.get)
assert order == [3, 7, 1, 5, 2, 8, 4, 6] and len(order) - 1 == 7
neighbours = {frozenset(p) for p in zip(order, order[1:])}
RECORDED = [(3, 7), (7, 1), (1, 5), (2, 8), (8, 4), (4, 6), (7, 5), (2, 6)]  # 6 neighbours (not 5-2) and 2 others, neither across the 5-2 gap
assert sum(1 for p in RECORDED if frozenset(p) in neighbours) == 6 and frozenset((5, 2)) in neighbours and (5, 2) not in RECORDED
assert all(frozenset(p) in neighbours for p in RECORDED[:6]) and all(frozenset(p) not in neighbours for p in RECORDED[6:])
before_answers = [VAL[x] < VAL[y] for x, y in RECORDED]
VAL2 = dict(VAL)
VAL2[2] = VAL[5]  # k2 slides left onto k5: the adversary's move
assert [VAL2[x] < VAL2[y] for x, y in RECORDED] == before_answers  # every recorded answer is unchanged
assert len(set(VAL.values())) == 8 and len(set(VAL2.values())) == 7  # but the keys are no longer distinct
assert math.factorial(8) == 40_320 and ceil_log2(40_320) == 16

rng = random.Random(5)
vector = [rng.getrandbits(64) for _ in range(N)]
assert len(set(vector)) == len(vector)  # a hash set decides distinctness (a count, no timing claimed)
srt = sorted(vector)
assert all(a != b for a, b in zip(srt, srt[1:])) is True  # sort-then-scan agrees

# ---------------------------------------------------------------- Step 13: what a lower bound rules out
assert W // 16 == 4 and 2**16 == 65_536
assert N - 1 == 999_999  # verifying a sorted vector
assert [sum(1 for o in itertools.permutations([1, 2, 3, 4]) if set(o[:2]) == {1, 2} and set(o[2:]) == {3, 4})] == [4]  # smallest half first: 4 right answers
assert N * (N - 1) // 2 == 499_999_500_000


def insertion_worst(n):
    a, cmp = list(range(n, 0, -1)), 0
    for i in range(1, n):
        j = i
        while j > 0:
            cmp += 1
            if a[j - 1] < a[j]:
                break
            a[j - 1], a[j] = a[j], a[j - 1]
            j -= 1
    return cmp


for n in range(1, 201):
    assert insertion_worst(n) == n * (n - 1) // 2
assert 17_000_000 < FLOOR_LOG_FACT_N

# ---------------------------------------------------------------- Steps 15 to 17: Prove it
# 1: merge two runs of 8 (see the merging block above)
assert math.comb(16, 8) == 12_870 and ceil_log2(12_870) == 14 and 2 * 8 - 1 == 15
assert standard_merge_comparisons(list(range(1, 16, 2)), list(range(2, 17, 2))) == 15
# 2: the "first named is larger" adversary says a > b, b > c, c > a: no order of three distinct keys fits
fits = [p for p in itertools.permutations(range(3)) if p[0] > p[1] and p[1] > p[2] and p[2] > p[0]]
assert fits == [] and len(list(itertools.permutations(range(3)))) == 6
# 3: the average-case bound refutes 17 million
assert 17_000_000 < 18_488_884 and W // 16 == 4 and N - 1 == 999_999

print("all checks passed")
