"""Cut property and Kruskal's algorithm: the chapter's own six-vertex, ten-edge graph
(Chapter 10's graph, read as undirected), Kruskal's algorithm on it, the cut property and
cycle property demonstrated directly, spanning-tree counts by brute force, the MST against
the shortest-path tree, and a negative-weight check.
"""

import itertools

# ---------------------------------------------------------------------------
# The chapter's own graph: 6 vertices, 10 undirected edges (A-B appears twice:
# the chapter's own multi-edge, weights 4 and 7).
# ---------------------------------------------------------------------------

VERTICES = ["A", "B", "C", "D", "E", "F"]
EDGES = [  # (u, v, weight) -- identical to Chapter 10/11's own edge list, read undirected
    ("A", "B", 4),
    ("A", "C", 2),
    ("A", "B", 7),  # the multi-edge
    ("B", "C", 3),
    ("B", "D", 5),
    ("C", "D", 1),
    ("C", "E", 6),
    ("D", "E", 2),
    ("D", "F", 8),
    ("E", "F", 3),
]
N = len(VERTICES)
assert N == 6 and len(EDGES) == 10
IDX = {v: i for i, v in enumerate(VERTICES)}


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True


def kruskal(edges, n, idx):
    """Stable-sort by weight, scan, union-find vetoes cycles. Returns (accepted, rejected)."""
    order = sorted(edges, key=lambda e: e[2])
    uf = UnionFind(n)
    accepted, rejected = [], []
    for u, v, w in order:
        if len(accepted) == n - 1:
            rejected.append((u, v, w))
            continue
        if uf.union(idx[u], idx[v]):
            accepted.append((u, v, w))
        else:
            rejected.append((u, v, w))
    return accepted, rejected, order


# ---------------------------------------------------------------------------
# 1. Sorted order and Kruskal's run, matching the chapter's own planning table.
# ---------------------------------------------------------------------------

accepted, rejected, sorted_order = kruskal(EDGES, N, IDX)
sorted_pairs = [f"{u}{v}{w}" for u, v, w in sorted_order]
assert sorted_pairs == ["CD1", "AC2", "DE2", "BC3", "EF3", "AB4", "BD5", "CE6", "AB7", "DF8"], sorted_pairs

accepted_pairs = [f"{u}{v}" for u, v, _ in accepted]
rejected_pairs = [f"{u}{v}" for u, v, _ in rejected]
assert accepted_pairs == ["CD", "AC", "DE", "BC", "EF"], accepted_pairs
assert rejected_pairs == ["AB", "BD", "CE", "AB", "DF"], rejected_pairs
assert len(accepted) == 5 and len(rejected) == 5

mst_weight = sum(w for _, _, w in accepted)
assert mst_weight == 11

mst_edge_set = {frozenset((u, v)) for u, v, _ in accepted}

# ---------------------------------------------------------------------------
# 2. The cut property, demonstrated: cut S = {A, C} vs the rest.
# ---------------------------------------------------------------------------

S = {"A", "C"}
crossing = [(u, v, w) for u, v, w in EDGES if (u in S) != (v in S)]
lightest_crossing = min(crossing, key=lambda e: e[2])
assert (lightest_crossing[0], lightest_crossing[1], lightest_crossing[2]) == ("C", "D", 1)
assert frozenset((lightest_crossing[0], lightest_crossing[1])) in mst_edge_set

# ---------------------------------------------------------------------------
# 3. The cycle property, demonstrated: the triangle A-B-C.
# ---------------------------------------------------------------------------

triangle = [("A", "B", 4), ("B", "C", 3), ("A", "C", 2)]
heaviest = max(triangle, key=lambda e: e[2])
assert heaviest == ("A", "B", 4)
assert frozenset(("A", "B")) not in mst_edge_set

# ---------------------------------------------------------------------------
# 4. Spanning-tree counts by brute force (exact, small enough to enumerate).
# ---------------------------------------------------------------------------


def is_spanning_tree(edge_subset, n, idx):
    uf = UnionFind(n)
    for u, v, _ in edge_subset:
        if not uf.union(idx[u], idx[v]):
            return False
    return True


def count_and_weigh_spanning_trees(edges, n, idx):
    weights = []
    for combo in itertools.combinations(edges, n - 1):
        if is_spanning_tree(combo, n, idx):
            weights.append(sum(w for _, _, w in combo))
    return weights

all_tree_weights = count_and_weigh_spanning_trees(EDGES, N, IDX)
assert len(all_tree_weights) == 89, len(all_tree_weights)

edges_without_heavy_ab = [e for e in EDGES if e != ("A", "B", 7)]
assert len(edges_without_heavy_ab) == 9
without_7_weights = count_and_weigh_spanning_trees(edges_without_heavy_ab, N, IDX)
assert len(without_7_weights) == 55, len(without_7_weights)

min_weight = min(all_tree_weights)
assert min_weight == 11
num_minimum = sum(1 for w in all_tree_weights if w == min_weight)
assert num_minimum == 1  # the MST is unique on this graph
second_best = min(w for w in all_tree_weights if w != min_weight)
assert second_best == 12

# ---------------------------------------------------------------------------
# 5. The tie-trap: a 4-cycle with all four edges the same weight has four MSTs.
# ---------------------------------------------------------------------------

tie_square = [("W", "X", 1), ("X", "Y", 1), ("Y", "Z", 1), ("Z", "W", 1)]
tie_weights = count_and_weigh_spanning_trees(tie_square, 4, {"W": 0, "X": 1, "Y": 2, "Z": 3})
assert len(tie_weights) == 4
assert all(w == 3 for w in tie_weights)  # four trees, all of weight 3 (any 3 of the 4 edges)

# ---------------------------------------------------------------------------
# 6. The MST against the shortest-path tree from A (using the cheaper A-B edge).
# ---------------------------------------------------------------------------


def dijkstra_tree(edges, n, idx, source):
    adj = {v: [] for v in idx}
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    dist = {v: float("inf") for v in idx}
    parent_edge = {}
    dist[source] = 0
    visited = set()
    while len(visited) < n:
        u = min((v for v in idx if v not in visited), key=lambda v: dist[v])
        visited.add(u)
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent_edge[v] = (u, v, w)
    return parent_edge


sp_tree = dijkstra_tree(EDGES, N, IDX, "A")
sp_weight = sum(w for _, _, w in sp_tree.values())
assert sp_weight == 12, sp_weight
sp_pairs = sorted(f"{u}{v}" if u < v else f"{v}{u}" for u, v, _ in sp_tree.values())
assert sp_pairs == ["AB", "AC", "CD", "DE", "EF"], sp_pairs
assert mst_weight == 11 and sp_weight == 12 and mst_weight != sp_weight

# ---------------------------------------------------------------------------
# 7. Negative weights change nothing: shift one edge negative, Kruskal still correct.
# ---------------------------------------------------------------------------

negative_edges = [(u, v, w - 20) for u, v, w in EDGES]  # every weight shifted by the same amount
neg_accepted, neg_rejected, _ = kruskal(negative_edges, N, IDX)
neg_accepted_pairs = [f"{u}{v}" for u, v, _ in neg_accepted]
assert neg_accepted_pairs == accepted_pairs  # a uniform shift changes no relative order
assert sum(w for _, _, w in neg_accepted) == mst_weight - 5 * 20

print("All cut property / Kruskal examples verified.")
