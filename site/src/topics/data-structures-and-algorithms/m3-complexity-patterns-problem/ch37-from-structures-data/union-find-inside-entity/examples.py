"""Union-find inside entity resolution: scored pairs clustered into entities, the chain problem
(over-merging), and what a distributed engine does instead of a shared parent array.

Mirrors the structural facts read from Splink (`clustering.html`) and GraphFrames
(`graphframes.html`, `connectedComponents`), and the citation for Kiveris, Lattanzi, Mirrokni,
Rastogi and Vassilvitskii, "Connected Components in MapReduce and Beyond" (2014), quoted and
cited in SOURCES.md.

Union-find itself (path compression, union by size, the O(alpha(n)) bound) is Chapter 11's own
structure (`dsa.union-find`); it is reused here, not re-derived — this topic's own contribution is
the match graph, the threshold sweep, and the single-pass-versus-label-propagation measurement.
"""
import random
from collections import Counter, deque


# ---------------------------------------------------------------------------
# 1. Union-find, union by size with path compression (Chapter 11's structure, reused).
# ---------------------------------------------------------------------------


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:  # path compression (halving to the root)
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True


# ---------------------------------------------------------------------------
# 2. The chapter's match graph: 24 records in three natural groups of eight, joined inside by
#    strong-scoring pairs (a spanning structure plus a few extra edges) and joined to each other
#    by two WEAK bridging pairs — exactly the "one weak edge joins two large clusters" case.
# ---------------------------------------------------------------------------

N_RECORDS = 24
GROUPS = [list(range(0, 8)), list(range(8, 16)), list(range(16, 24))]

random.seed(7)
SCORED_PAIRS = []  # (record_a, record_b, match_probability)
for group in GROUPS:
    for i in range(1, len(group)):
        SCORED_PAIRS.append((group[i - 1], group[i], round(random.uniform(0.90, 0.99), 2)))
SCORED_PAIRS += [
    (GROUPS[0][0], GROUPS[0][3], 0.93),
    (GROUPS[1][2], GROUPS[1][6], 0.91),
    (GROUPS[2][1], GROUPS[2][5], 0.95),
    (GROUPS[0][7], GROUPS[1][0], 0.58),  # the weak bridge: group 0 <-> group 1
    (GROUPS[1][7], GROUPS[2][0], 0.62),  # the weak bridge: group 1 <-> group 2
]

assert len(SCORED_PAIRS) == 26  # 21 within-group (7+7+7) + 3 extra + 2 bridges


# ---------------------------------------------------------------------------
# 3. Clustering at one threshold: Splink's own description — "Clusters the pairwise match
#    predictions into groups of connected records using the connected components graph
#    clustering algorithm" — is exactly one union per matching pair, one find per entity id.
# ---------------------------------------------------------------------------


def cluster_at_threshold(n, scored_pairs, threshold):
    """Each pair scoring at or above `threshold` is a match: one union. Returns each record's
    entity id (its root) and the sizes of the resulting clusters, largest first."""
    uf = UnionFind(n)
    for a, b, score in scored_pairs:
        if score >= threshold:
            uf.union(a, b)
    entity_of = [uf.find(i) for i in range(n)]
    sizes = sorted(Counter(entity_of).values(), reverse=True)
    return entity_of, sizes


# A representative's id changes as unions land: track record 0's entity id after each pair,
# processed in score-descending order (closer to how a real pipeline would land its best matches
# first), at a threshold low enough that every pair matches.
ORDER_BY_SCORE_DESC = sorted(SCORED_PAIRS, key=lambda p: -p[2])
_uf_trace = UnionFind(N_RECORDS)
REPRESENTATIVE_TRACE = [_uf_trace.find(0)]
for a, b, _s in ORDER_BY_SCORE_DESC:
    _uf_trace.union(a, b)
    REPRESENTATIVE_TRACE.append(_uf_trace.find(0))
assert len(set(REPRESENTATIVE_TRACE)) > 1  # record 0's entity id really does change


# ---------------------------------------------------------------------------
# 4. The chain problem, measured: raise the threshold and the biggest cluster does not shrink
#    smoothly. It jumps, at the two points where a bridging pair's score is crossed.
# ---------------------------------------------------------------------------

THRESHOLD_SWEEP = [0.50, 0.55, 0.59, 0.60, 0.63, 0.70]
SWEEP_RESULTS = [(t, cluster_at_threshold(N_RECORDS, SCORED_PAIRS, t)[1]) for t in THRESHOLD_SWEEP]

assert SWEEP_RESULTS[0][1] == [24]            # below both bridges: one giant cluster
assert SWEEP_RESULTS[1][1] == [24]            # 0.55 still below the first bridge (0.58)
assert SWEEP_RESULTS[2][1] == [16, 8]         # 0.59 crosses the first bridge: splits into two
assert SWEEP_RESULTS[3][1] == [16, 8]         # 0.60 — same split, second bridge (0.62) still below
assert SWEEP_RESULTS[4][1] == [8, 8, 8]       # 0.63 crosses the second bridge: splits into three
assert SWEEP_RESULTS[5][1] == [8, 8, 8]       # 0.70 — same three groups, no further splits

LARGEST_CLUSTER_SIZE_BY_THRESHOLD = [sizes[0] for _t, sizes in SWEEP_RESULTS]
assert LARGEST_CLUSTER_SIZE_BY_THRESHOLD == [24, 24, 16, 16, 8, 8]  # two jumps, not a slope


# ---------------------------------------------------------------------------
# 5. A lineage graph: the same structure over a different graph — vertices are datasets/jobs,
#    edges are "feeds into" dependencies, and a connected component is a blast-radius: everything
#    that could be affected by a change to any one member.
# ---------------------------------------------------------------------------

LINEAGE_EDGES = [
    ("orders_raw", "orders_clean"), ("orders_clean", "orders_daily_agg"),
    ("orders_daily_agg", "revenue_dashboard"), ("customers_raw", "customers_clean"),
    ("customers_clean", "orders_clean"),  # orders_clean depends on customers_clean too
    ("inventory_raw", "inventory_clean"), ("inventory_clean", "stock_alerts"),
]
LINEAGE_NODES = sorted({n for edge in LINEAGE_EDGES for n in edge})
_lineage_index = {name: i for i, name in enumerate(LINEAGE_NODES)}
_lineage_uf = UnionFind(len(LINEAGE_NODES))
for u, v in LINEAGE_EDGES:
    _lineage_uf.union(_lineage_index[u], _lineage_index[v])
LINEAGE_COMPONENTS = {}
for name in LINEAGE_NODES:
    LINEAGE_COMPONENTS.setdefault(_lineage_uf.find(_lineage_index[name]), []).append(name)
LINEAGE_COMPONENT_SIZES = sorted((len(members) for members in LINEAGE_COMPONENTS.values()), reverse=True)

assert LINEAGE_COMPONENT_SIZES == [6, 3]  # orders+customers+revenue (6) vs inventory+alerts (3)
assert "revenue_dashboard" in next(m for m in LINEAGE_COMPONENTS.values() if "customers_raw" in m)


# ---------------------------------------------------------------------------
# 6. On one machine: a single union-find pass over the match graph (step 4's threshold of 0.60,
#    giving two clusters) against a label-propagation loop on the identical graph — rounds until
#    no label changes, the MapReduce-era alternative when no shared parent array exists.
# ---------------------------------------------------------------------------


def label_propagation_rounds(n, scored_pairs, threshold):
    """Each node repeatedly adopts the minimum label among itself and its neighbors, round by
    round, until no label changes — no shared mutable structure, only local, repeated passes."""
    adjacency = {i: set() for i in range(n)}
    for a, b, score in scored_pairs:
        if score >= threshold:
            adjacency[a].add(b)
            adjacency[b].add(a)
    labels = list(range(n))
    rounds = 0
    while True:
        rounds += 1
        changed = False
        new_labels = labels[:]
        for node in range(n):
            best = min([labels[node]] + [labels[neighbor] for neighbor in adjacency[node]])
            if best != new_labels[node]:
                new_labels[node] = best
                changed = True
        labels = new_labels
        if not changed:
            break
    return rounds, sorted(Counter(labels).values(), reverse=True)


UNION_FIND_PASSES = 1  # one pass over the edge list: every pair processed exactly once
LPA_ROUNDS, LPA_SIZES = label_propagation_rounds(N_RECORDS, SCORED_PAIRS, 0.60)

assert LPA_ROUNDS == 10
assert LPA_SIZES == [16, 8]  # label propagation converges to the SAME clustering union-find found
assert LPA_ROUNDS > UNION_FIND_PASSES  # ten rounds of communication, versus one pass in memory


if __name__ == "__main__":
    print("record 0's entity id over the match stream:", REPRESENTATIVE_TRACE)
    print("threshold sweep, largest cluster size:", LARGEST_CLUSTER_SIZE_BY_THRESHOLD)
    for t, sizes in SWEEP_RESULTS:
        print(f"  threshold {t}: cluster sizes {sizes}")
    print("lineage components (blast radius):", LINEAGE_COMPONENT_SIZES)
    print("union-find: one pass. Label propagation: ", LPA_ROUNDS, "rounds, same result:", LPA_SIZES)
    print("ALL ASSERTS PASSED")
