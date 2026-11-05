import heapq
import math
import random
import time

# --- lookup -> hash: breaking condition is a range or "next larger key" query ---
N_MIX = 20_000
random.seed(7)
MIX_KEYS = random.sample(range(N_MIX * 5), N_MIX)
HASH_TABLE = {k: True for k in MIX_KEYS}
SORTED_ARRAY = sorted(MIX_KEYS)


def hash_lookup():
    k = random.choice(MIX_KEYS)
    return k in HASH_TABLE


def tree_lookup():
    k = random.choice(MIX_KEYS)
    i = bisect_left(SORTED_ARRAY, k)
    return i < len(SORTED_ARRAY) and SORTED_ARRAY[i] == k


from bisect import bisect_left, bisect_right, insort


def hash_range_fallback(lo, hi):
    # a hash table has no order to consult, so a range query must scan every key
    return [x for x in HASH_TABLE if lo <= x <= hi]


def tree_range(lo, hi):
    i = bisect_left(SORTED_ARRAY, lo)
    j = bisect_right(SORTED_ARRAY, hi)
    return SORTED_ARRAY[i:j]


def timed(fn, repeats, *args):
    t0 = time.perf_counter()
    for _ in range(repeats):
        fn(*args)
    return (time.perf_counter() - t0) / repeats


def measure_range_share_crossover(share, total_ops=4000):
    range_ops = round(total_ops * share)
    lookup_ops = total_ops - range_ops

    def hash_mix():
        for _ in range(lookup_ops):
            hash_lookup()
        for _ in range(range_ops):
            lo = random.randrange(N_MIX * 5)
            hash_range_fallback(lo, lo + 50)

    def tree_mix():
        for _ in range(lookup_ops):
            tree_lookup()
        for _ in range(range_ops):
            lo = random.randrange(N_MIX * 5)
            tree_range(lo, lo + 50)

    random.seed(42)
    t_hash = timed(hash_mix, 1)
    random.seed(42)
    t_tree = timed(tree_mix, 1)
    return t_hash, t_tree


# At a zero range-query share, the hash table's O(1) lookup wins outright.
HASH_AT_ZERO_SHARE, TREE_AT_ZERO_SHARE = measure_range_share_crossover(0.0)
assert HASH_AT_ZERO_SHARE < TREE_AT_ZERO_SHARE

# At a share of one tenth of one percent (one range query in a thousand operations),
# the tree already wins, because the hash table's range query costs a full scan of
# every key while the tree's costs only the width of the range.
HASH_AT_SMALL_SHARE, TREE_AT_SMALL_SHARE = measure_range_share_crossover(0.001)
assert TREE_AT_SMALL_SHARE < HASH_AT_SMALL_SHARE


# --- top-k -> heap or quickselect: the measured crossover against sorting everything ---
TOPK_N = 50_000
random.seed(3)
TOPK_ARRAY = random.sample(range(TOPK_N * 3), TOPK_N)


def topk_by_heap(k):
    return heapq.nlargest(k, TOPK_ARRAY)


def topk_by_sort(k):
    return sorted(TOPK_ARRAY, reverse=True)[:k]


def best_of(fn, k, repeats=11):
    best = None
    for _ in range(repeats):
        t0 = time.perf_counter()
        fn(k)
        dt = time.perf_counter() - t0
        if best is None or dt < best:
            best = dt
    return best


# At ten percent of n the heap wins; at twenty percent of n, sorting the whole array
# has already won, because the heap's own bookkeeping cost grows with k while a full
# sort's does not.
HEAP_AT_10PCT = best_of(topk_by_heap, round(TOPK_N * 0.10))
SORT_AT_10PCT = best_of(topk_by_sort, round(TOPK_N * 0.10))
assert HEAP_AT_10PCT < SORT_AT_10PCT

HEAP_AT_20PCT = best_of(topk_by_heap, round(TOPK_N * 0.20))
SORT_AT_20PCT = best_of(topk_by_sort, round(TOPK_N * 0.20))
assert SORT_AT_20PCT < HEAP_AT_20PCT


# --- membership at scale -> a Bloom filter, priced against an exact set ---
# optimal_k and the false-positive formula are used, not re-derived: Chapter 12's own
# bloom-filters-false-positive topic builds and verifies this arithmetic.
def bloom_optimal_k(bits_per_key):
    return round(bits_per_key * math.log(2))


def bloom_false_positive_rate(bits_per_key, k):
    return (1 - math.exp(-k / bits_per_key)) ** k


MEMBERSHIP_N_KEYS = 10_000_000
BLOOM_BITS_PER_KEY = 10
BLOOM_K = bloom_optimal_k(BLOOM_BITS_PER_KEY)
assert BLOOM_K == 7
BLOOM_FALSE_POSITIVE_RATE = bloom_false_positive_rate(BLOOM_BITS_PER_KEY, BLOOM_K)
BLOOM_BYTES = MEMBERSHIP_N_KEYS * BLOOM_BITS_PER_KEY / 8
EXACT_SET_BYTES = MEMBERSHIP_N_KEYS * 8  # each key stored exactly, eight bytes
assert BLOOM_BYTES < EXACT_SET_BYTES / 6


# --- grouping -> union-find, and its breaking condition: no split ---
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True


GROUPING_UF = UnionFind(10)
GROUPING_UF.union(0, 1)
GROUPING_UF.union(1, 2)
GROUPING_UF.union(3, 4)
assert GROUPING_UF.find(0) == GROUPING_UF.find(2)
assert GROUPING_UF.find(0) != GROUPING_UF.find(3)
# the breaking condition itself: there is no operation that un-merges a group once joined
assert not hasattr(GROUPING_UF, "split")


# --- prefixes -> a trie, and its breaking condition: a substring query, not a prefix one ---
class TrieNode:
    __slots__ = ("children", "end")

    def __init__(self):
        self.children = {}
        self.end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def has_prefix(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True

    def has_word(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.end


PREFIX_WORDS = ["cat", "car", "cart", "dog", "dove"]
PREFIX_TRIE = Trie()
for _word in PREFIX_WORDS:
    PREFIX_TRIE.insert(_word)
assert PREFIX_TRIE.has_prefix("ca")
assert PREFIX_TRIE.has_word("cart")
assert not PREFIX_TRIE.has_word("ca")
# "cart" contains "art" as a substring, found by a brute-force scan...
SUBSTRING_FOUND_BY_BRUTE_FORCE = any("art" in w for w in PREFIX_WORDS)
assert SUBSTRING_FOUND_BY_BRUTE_FORCE
# ...but the trie, searched from its root downward, cannot find a substring that isn't a prefix
assert not PREFIX_TRIE.has_prefix("art")


# --- range aggregates -> a Fenwick tree (sums) or a segment tree (any associative op) ---
class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def add(self, i, delta):
        i += 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def prefix_sum(self, i):
        i += 1
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)
        return total

    def range_sum(self, lo, hi):
        return self.prefix_sum(hi) - (self.prefix_sum(lo - 1) if lo > 0 else 0)


random.seed(5)
RANGE_ARRAY = [random.randint(1, 100) for _ in range(20)]
FENWICK = FenwickTree(len(RANGE_ARRAY))
for _i, _v in enumerate(RANGE_ARRAY):
    FENWICK.add(_i, _v)


def check_fenwick_range_sum(trials=20, seed=9):
    random.seed(seed)
    for _ in range(trials):
        lo = random.randint(0, len(RANGE_ARRAY) - 1)
        hi = random.randint(lo, len(RANGE_ARRAY) - 1)
        assert FENWICK.range_sum(lo, hi) == sum(RANGE_ARRAY[lo:hi + 1])
    return trials


FENWICK_RANGE_SUM_TRIALS = check_fenwick_range_sum()
assert FENWICK_RANGE_SUM_TRIALS == 20


class PrefixMaxOnly:
    """What a Fenwick-style prefix trick gives for maximum: only ever a *prefix* maximum,
    because subtraction (which recovers a range sum from two prefix sums) does not recover
    a range maximum from two prefix maxima — maximum has no inverse operation."""

    def __init__(self, arr):
        self.prefix = []
        running_max = float("-inf")
        for v in arr:
            running_max = max(running_max, v)
            self.prefix.append(running_max)

    def prefix_max(self, i):
        return self.prefix[i]


BREAKING_ARRAY = [999, 1, 2, 7, 3, 5]
PREFIX_MAX_ONLY = PrefixMaxOnly(BREAKING_ARRAY)
BREAKING_LO, BREAKING_HI = 3, 5
FENWICK_STYLE_WRONG_ANSWER = PREFIX_MAX_ONLY.prefix_max(BREAKING_HI)
TRUE_RANGE_MAX = max(BREAKING_ARRAY[BREAKING_LO:BREAKING_HI + 1])
assert FENWICK_STYLE_WRONG_ANSWER != TRUE_RANGE_MAX
assert FENWICK_STYLE_WRONG_ANSWER == 999
assert TRUE_RANGE_MAX == 7


class SegmentTree:
    def __init__(self, arr, combine=max, identity=float("-inf")):
        self.combine = combine
        self.identity = identity
        self.size = 1
        while self.size < len(arr):
            self.size *= 2
        self.tree = [identity] * (2 * self.size)
        for i, v in enumerate(arr):
            self.tree[self.size + i] = v
        for i in range(self.size - 1, 0, -1):
            self.tree[i] = combine(self.tree[2 * i], self.tree[2 * i + 1])

    def query(self, lo, hi):
        res = self.identity
        lo += self.size
        hi += self.size + 1
        while lo < hi:
            if lo & 1:
                res = self.combine(res, self.tree[lo])
                lo += 1
            if hi & 1:
                hi -= 1
                res = self.combine(res, self.tree[hi])
            lo //= 2
            hi //= 2
        return res


SEGMENT_TREE = SegmentTree(BREAKING_ARRAY, combine=max, identity=float("-inf"))


def check_segment_tree_range_max(trials=20, seed=11):
    random.seed(seed)
    for _ in range(trials):
        lo = random.randint(0, len(BREAKING_ARRAY) - 1)
        hi = random.randint(lo, len(BREAKING_ARRAY) - 1)
        assert SEGMENT_TREE.query(lo, hi) == max(BREAKING_ARRAY[lo:hi + 1])
    return trials


SEGMENT_TREE_TRIALS = check_segment_tree_range_max()
assert SEGMENT_TREE_TRIALS == 20
# the segment tree gets the exact case the Fenwick-style trick got wrong
assert SEGMENT_TREE.query(BREAKING_LO, BREAKING_HI) == TRUE_RANGE_MAX


# --- the thesis: total cost is a weighted sum, and the winner changes with the mix ---
# A cost model in abstract operation units (topic 113's own budget vocabulary), not wall-clock
# seconds: hash and a balanced tree/B-tree, and a size-k heap kept for a streaming top-k.
COST_N = 10_000_000
COST_K = 10
LOG2_N = math.log2(COST_N)
LOG2_K = math.log2(COST_K)

COST_HASH = {"lookup": 1, "range": COST_N, "insert": 1, "topk": COST_N}
COST_TREE = {"lookup": LOG2_N, "range": LOG2_N + COST_K, "insert": LOG2_N, "topk": COST_K}
COST_HEAP = {"lookup": COST_N, "range": COST_N, "insert": LOG2_K, "topk": COST_K}

MIXES = {
    "lookup-heavy": {"lookup": 1.0, "range": 0.0, "insert": 0.0, "topk": 0.0},
    "range-heavy": {"lookup": 0.4, "range": 0.6, "insert": 0.0, "topk": 0.0},
    "streaming-leaderboard": {"lookup": 0.0, "range": 0.0, "insert": 0.5, "topk": 0.5},
}


def total_cost(mix, costs):
    return sum(mix[op] * costs[op] for op in mix)


MIX_TOTALS = {
    name: {"hash": total_cost(mix, COST_HASH), "tree": total_cost(mix, COST_TREE), "heap": total_cost(mix, COST_HEAP)}
    for name, mix in MIXES.items()
}

assert min(MIX_TOTALS["lookup-heavy"], key=MIX_TOTALS["lookup-heavy"].get) == "hash"
assert min(MIX_TOTALS["range-heavy"], key=MIX_TOTALS["range-heavy"].get) == "tree"
assert min(MIX_TOTALS["streaming-leaderboard"], key=MIX_TOTALS["streaming-leaderboard"].get) == "heap"


if __name__ == "__main__":
    print(f"range-share crossover: at zero share hash={HASH_AT_ZERO_SHARE:.6f}s tree={TREE_AT_ZERO_SHARE:.6f}s (hash wins)")
    print(f"  at one tenth of one percent hash={HASH_AT_SMALL_SHARE:.6f}s tree={TREE_AT_SMALL_SHARE:.6f}s (tree wins)")
    print(f"top-k crossover: at ten percent of n heap={HEAP_AT_10PCT:.6f}s sort={SORT_AT_10PCT:.6f}s (heap wins)")
    print(f"  at twenty percent of n heap={HEAP_AT_20PCT:.6f}s sort={SORT_AT_20PCT:.6f}s (sort wins)")
    print(f"bloom filter: {BLOOM_BITS_PER_KEY} bits/key, k={BLOOM_K}, false-positive rate {BLOOM_FALSE_POSITIVE_RATE * 100:.3f}%, "
          f"{BLOOM_BYTES / 1e6:.1f} MB vs an exact set's {EXACT_SET_BYTES / 1e6:.1f} MB")
    print("union-find: grouping confirmed; no split operation exists")
    print("trie: prefix search confirmed; substring 'art' found by brute force, not by the trie's own prefix search")
    print(f"fenwick-style prefix-max trick: {FENWICK_STYLE_WRONG_ANSWER} vs the true range max {TRUE_RANGE_MAX}")
    print("segment tree: range max matches brute force, including the exact case the trick got wrong")
    for name, totals in MIX_TOTALS.items():
        winner = min(totals, key=totals.get)
        print(f"mix '{name}': hash={totals['hash']:.2f} tree={totals['tree']:.2f} heap={totals['heap']:.2f} -> winner {winner}")
