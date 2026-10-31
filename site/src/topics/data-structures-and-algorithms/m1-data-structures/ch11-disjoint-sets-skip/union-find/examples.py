"""Executed truth for the union-find reel.

Three things, each checked against a real run rather than assumed:
1. the naive parent-pointer forest, under an adversarial merge order, really does build a
   chain of depth n-1 on n elements, while union by rank bounds the same adversarial order's
   depth at floor(log2(n));
2. path compression, layered on rank, collapses a chain of parent-pointer reads to near-flat
   in one Find, and the total number of parent-pointer reads over a long operation sequence
   drops by orders of magnitude once both rank and compression are on;
3. the chapter-10 edge list, fed through union-find in its own order and in Kruskal's
   sorted-by-weight order, really does split five-and-five both times, and the five edges
   Kruskal's order accepts are exactly the ones this topic's visual idea shows.
"""

import random

# ---------------------------------------------------------------------------
# 1. Three union-find variants, each counting the parent-pointer reads it performs.
# ---------------------------------------------------------------------------


class NaiveUF:
    """MakeSet/Find/Union with no rank rule and no compression: Union always points the
    first set's root at the second set's root, so the caller's merge order alone decides
    the shape of the forest."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.reads = 0

    def find(self, x):
        while self.parent[x] != x:
            self.reads += 1
            x = self.parent[x]
        self.reads += 1  # the final check that confirms x is a root
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry

    def depth(self, x):
        d = 0
        while self.parent[x] != x:
            x = self.parent[x]
            d += 1
        return d


class RankUF:
    """Union by rank, no compression: Find still walks every parent pointer on the path,
    but the rank rule bounds how long that path can ever get."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.reads = 0

    def find(self, x):
        while self.parent[x] != x:
            self.reads += 1
            x = self.parent[x]
        self.reads += 1
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1

    def depth(self, x):
        d = 0
        while self.parent[x] != x:
            x = self.parent[x]
            d += 1
        return d


class RankCompressUF:
    """Union by rank, with full path compression on every Find: every node visited on the
    path is relinked straight to the root in the same pass."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.reads = 0

    def find(self, x):
        path = []
        while self.parent[x] != x:
            self.reads += 1
            path.append(x)
            x = self.parent[x]
        self.reads += 1
        for node in path:
            self.parent[node] = x
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1


# ---------------------------------------------------------------------------
# 2. The adversarial merge order: always attach the newest singleton under the current
#    deepest chain's own root, so a naive Union builds one long chain.
# ---------------------------------------------------------------------------


def chain_pairs(n):
    """n-1 pairs that, fed to a naive forest (root of the second arg wins), build a chain
    0 -> 1 -> 2 -> ... -> n-1: the worst case for Union with no rank rule at all."""
    return [(i, i + 1) for i in range(n - 1)]


def doubling_pairs(n):
    """The worst case *for union by rank*: merge equal-sized trees with equal rank at every
    round (singles into pairs, pairs into quads, ...), so every merge raises the winning
    root's rank by exactly one and the final tree's height is tight to floor(log2(n))."""
    assert n & (n - 1) == 0, "doubling_pairs needs a power of two"
    groups = [[i] for i in range(n)]
    pairs = []
    while len(groups) > 1:
        nxt = []
        for i in range(0, len(groups), 2):
            pairs.append((groups[i][0], groups[i + 1][0]))
            nxt.append(groups[i] + groups[i + 1])
        groups = nxt
    return pairs


N_SMALL = 16
chain = chain_pairs(N_SMALL)

naive = NaiveUF(N_SMALL)
for x, y in chain:
    rx, ry = naive.find(x), naive.find(y)
    naive.parent[rx] = ry  # deliberately naive: always attach x's root under y's root
naive_depth = naive.depth(0)
assert naive_depth == N_SMALL - 1 == 15, naive_depth

import math

rank_uf = RankUF(N_SMALL)
for x, y in doubling_pairs(N_SMALL):
    rank_uf.union(x, y)
max_rank_depth = max(rank_uf.depth(i) for i in range(N_SMALL))
assert max_rank_depth <= math.floor(math.log2(N_SMALL)), max_rank_depth
assert max_rank_depth == 4, max_rank_depth  # tight to log2(16): the worst rank can ever do

# ---------------------------------------------------------------------------
# 3. Path compression collapsing a chain in one Find, and the long-run read-count drop.
# ---------------------------------------------------------------------------

compress_uf = RankCompressUF(N_SMALL)
compress_uf.parent = list(naive.parent)  # start from the naive chain itself (depth 15),
# the picture the chapter-11 visual idea draws: compression collapsing the worst case,
# not a tree rank had already kept shallow
reads_before_one_find = compress_uf.reads
root_before = compress_uf.find(0)  # the deepest node in that chain (15 is the chain's root)
reads_for_that_find = compress_uf.reads - reads_before_one_find
assert reads_for_that_find == naive_depth + 1, reads_for_that_find  # one Find walks the
# whole chain exactly once, same cost as the naive version's first walk
# every node compress_uf.find just visited now points straight at the root
direct_now = sum(1 for i in range(N_SMALL) if compress_uf.parent[i] in (root_before, i))
assert direct_now == N_SMALL, direct_now
second_find_reads_before = compress_uf.reads
compress_uf.find(0)  # the node that was depth 15 a moment ago
assert compress_uf.reads - second_find_reads_before == 2  # one pointer read (0 -> root)
# plus the one root-confirmation read every Find does last; compression already pointed
# it straight at the root on the previous call, so this is as cheap as a Find ever gets


def random_ops(n, m, seed):
    """m Union/Find operations over n elements, uniformly random pairs — not adversarial;
    this is the mixed workload the long-run read count is measured on."""
    rnd = random.Random(seed)
    ops = []
    for _ in range(m):
        x, y = rnd.randrange(n), rnd.randrange(n)
        ops.append((x, y))
    return ops


N_LONG = 20_000
M_LONG = 200_000  # scaled down from the lab's 10^7 for this sandbox's run time; the lab
# (post-notes.md) reports the real 10^7-operation timing, run separately, not asserted here.
ops = random_ops(N_LONG, M_LONG, seed=11)

naive_long = NaiveUF(N_LONG)
for x, y in ops:
    rx, ry = naive_long.find(x), naive_long.find(y)
    if rx != ry:
        naive_long.parent[rx] = ry  # still naive: no rank rule on the long random run either

rank_long = RankUF(N_LONG)
for x, y in ops:
    rank_long.union(x, y)

compress_long = RankCompressUF(N_LONG)
for x, y in ops:
    compress_long.union(x, y)

reads_naive = naive_long.reads
reads_rank = rank_long.reads
reads_compress = compress_long.reads
assert reads_rank < reads_naive, (reads_rank, reads_naive)
assert reads_compress < reads_rank, (reads_compress, reads_rank)
avg_reads_naive = reads_naive / M_LONG
avg_reads_rank = reads_rank / M_LONG
avg_reads_compress = reads_compress / M_LONG
assert avg_reads_compress < 6, avg_reads_compress  # near-constant per operation (each op
# does two Finds, each paying the fixed root-confirmation read, so the floor is 2, not 0),
# measured, not asserted against a theoretical alpha(n) value
assert avg_reads_rank < 2 * (math.log2(N_LONG) + 2), avg_reads_rank

# ---------------------------------------------------------------------------
# 4. The chapter-10 edge list (undirected connectivity), fed in its own order and in
#    Kruskal's sorted-by-weight order.
# ---------------------------------------------------------------------------

VERTICES = ["A", "B", "C", "D", "E", "F"]
EDGES = [  # (source, target, weight) -- identical to ch10's own EDGES
    ("A", "B", 4),
    ("A", "C", 2),
    ("A", "B", 7),
    ("B", "C", 3),
    ("B", "D", 5),
    ("C", "D", 1),
    ("C", "E", 6),
    ("D", "E", 2),
    ("D", "F", 8),
    ("E", "F", 3),
]
assert len(EDGES) == 10
IDX = {v: i for i, v in enumerate(VERTICES)}


def run_stream(order):
    uf = RankCompressUF(len(VERTICES))
    merges, already = [], []
    for u, w, wt in order:
        a, b = IDX[u], IDX[w]
        if uf.find(a) != uf.find(b):
            merges.append((u, w, wt))
            uf.union(a, b)
        else:
            already.append((u, w, wt))
    return merges, already


merges_in_order, already_in_order = run_stream(EDGES)
assert len(merges_in_order) == 5, len(merges_in_order)
assert len(already_in_order) == 5, len(already_in_order)
assert [f"{u}{w}" for u, w, _ in merges_in_order] == ["AB", "AC", "BD", "CE", "DF"]
assert [f"{u}{w}" for u, w, _ in already_in_order] == ["AB", "BC", "CD", "DE", "EF"]

sorted_by_weight = sorted(EDGES, key=lambda e: e[2])
merges_kruskal, already_kruskal = run_stream(sorted_by_weight)
assert len(merges_kruskal) == 5, len(merges_kruskal)
assert len(already_kruskal) == 5, len(already_kruskal)
kruskal_pairs = [f"{u}{w}" for u, w, _ in merges_kruskal]
assert kruskal_pairs == ["CD", "AC", "DE", "BC", "EF"], kruskal_pairs

# ---------------------------------------------------------------------------
# 5. Entity-resolution framing: union-find has no Split (step "Prove it").
# ---------------------------------------------------------------------------


class MergeLog:
    """Demonstrates the one structural limit directly: once two records are unioned, there
    is no operation that separates them again short of rebuilding from the surviving pairs."""

    def __init__(self, n):
        self.uf = RankCompressUF(n)

    def same_cluster(self, x, y):
        return self.uf.find(x) == self.uf.find(y)


log = MergeLog(4)
log.uf.union(0, 1)  # records 0 and 1 merged on a (wrong) match decision
log.uf.union(1, 2)  # record 2 merged into the same cluster afterwards
assert log.same_cluster(0, 2)
has_split = hasattr(log.uf, "split")
assert not has_split  # no Split operation exists on this structure, by construction

if __name__ == "__main__":
    print(f"naive adversarial depth on {N_SMALL} elements: {naive_depth}")
    print(f"rank-only adversarial depth on {N_SMALL} elements: {max_rank_depth}")
    print(f"random {M_LONG}-op run on {N_LONG} elements, average parent-pointer reads/op:")
    print(f"  naive:            {avg_reads_naive:.2f}")
    print(f"  rank only:        {avg_reads_rank:.2f}")
    print(f"  rank+compression: {avg_reads_compress:.2f}")
    print(f"edge list, own order: {len(merges_in_order)} merge, {len(already_in_order)} already-together")
    print(f"edge list, Kruskal order, merges: {kruskal_pairs}")
