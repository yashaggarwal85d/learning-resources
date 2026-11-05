import heapq
import math
import random

VERTICES = ["A", "B", "C", "D", "E", "F"]
EDGES = [
    ("A", "B", 4), ("A", "C", 2), ("A", "B", 7), ("B", "C", 3), ("B", "D", 5),
    ("C", "D", 1), ("C", "E", 6), ("D", "E", 2), ("D", "F", 8), ("E", "F", 3),
]


def build_adj(vertices, edges):
    adj = {v: [] for v in vertices}
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    return adj


ADJ = build_adj(VERTICES, EDGES)


def prim_lazy(adj, start):
    in_tree = {start}
    heap = []
    for v, w in adj[start]:
        heapq.heappush(heap, (w, v, start))
    mst = []
    order = [start]
    pushes = len(adj[start])
    pops = 0
    heap_snapshots = []
    while heap and len(in_tree) < len(adj):
        heap_snapshots.append(sorted(heap))
        w, v, u = heapq.heappop(heap)
        pops += 1
        if v in in_tree:
            continue
        in_tree.add(v)
        order.append(v)
        mst.append((u, v, w))
        for v2, w2 in adj[v]:
            if v2 not in in_tree:
                heapq.heappush(heap, (w2, v2, v))
                pushes += 1
    return mst, order, pushes, pops, heap_snapshots


def prim_eager(adj, start):
    INF = float("inf")
    key = {v: INF for v in adj}
    key[start] = 0
    parent = {start: None}
    in_tree = set()
    heap = [(0, start)]
    mst = []
    order = []
    pushes = 1
    decreases = 0
    while heap and len(in_tree) < len(adj):
        k, v = heapq.heappop(heap)
        if v in in_tree:
            continue
        in_tree.add(v)
        order.append(v)
        if parent[v] is not None:
            mst.append((parent[v], v, k))
        for v2, w2 in adj[v]:
            if v2 not in in_tree and w2 < key[v2]:
                key[v2] = w2
                parent[v2] = v
                heapq.heappush(heap, (w2, v2))
                pushes += 1
                decreases += 1
    return mst, order, pushes, decreases


def prim_array(vertices, adj, start):
    INF = float("inf")
    key = {v: INF for v in vertices}
    key[start] = 0
    parent = {start: None}
    in_tree = set()
    mst = []
    order = []
    comparisons = 0
    for _ in range(len(vertices)):
        u = None
        best = INF
        for v in vertices:
            if v not in in_tree:
                comparisons += 1
                if key[v] < best:
                    best = key[v]
                    u = v
        in_tree.add(u)
        order.append(u)
        if parent[u] is not None:
            mst.append((parent[u], u, key[u]))
        for v2, w2 in adj[u]:
            if v2 not in in_tree and w2 < key[v2]:
                key[v2] = w2
                parent[v2] = u
    return mst, order, comparisons


def edge_set(mst):
    return {frozenset((u, v)) for u, v, w in mst}


def mst_weight(mst):
    return sum(w for _, _, w in mst)


# --- the chapter's own graph, three ways to run Prim from A ---

lazy_mst, lazy_order, lazy_pushes, lazy_pops, lazy_snaps = prim_lazy(ADJ, "A")
assert lazy_order == ["A", "C", "D", "E", "B", "F"], lazy_order
assert mst_weight(lazy_mst) == 11

KRUSKAL_MST_PAIRS = {
    frozenset(("C", "D")), frozenset(("A", "C")), frozenset(("D", "E")),
    frozenset(("B", "C")), frozenset(("E", "F")),
}
assert edge_set(lazy_mst) == KRUSKAL_MST_PAIRS

eager_mst, eager_order, eager_pushes, eager_decreases = prim_eager(ADJ, "A")
assert eager_order == ["A", "C", "D", "E", "B", "F"], eager_order
assert mst_weight(eager_mst) == 11
assert edge_set(eager_mst) == KRUSKAL_MST_PAIRS

array_mst, array_order, array_comparisons = prim_array(VERTICES, ADJ, "A")
assert array_order == ["A", "C", "D", "E", "B", "F"], array_order
assert mst_weight(array_mst) == 11
assert edge_set(array_mst) == KRUSKAL_MST_PAIRS

# the array version's own scan cost is six plus five plus four plus three plus two plus one,
# fixed by the vertex count alone, never by how many edges the graph actually has
assert array_comparisons == 21

# the eager version never pushes more entries than the lazy version does, on this graph
assert eager_pushes <= lazy_pushes

print("lazy pushes:", lazy_pushes, "lazy pops:", lazy_pops)
print("eager pushes:", eager_pushes, "eager decreases:", eager_decreases)
print("array comparisons:", array_comparisons)


# --- the array version's cost, confirmed independent of the edge count ---

def random_connected_graph(n, m, seed):
    rnd = random.Random(seed)
    vertices = list(range(n))
    perm = vertices[:]
    rnd.shuffle(perm)
    edges = set()
    for i in range(1, n):
        u = perm[i]
        v = perm[rnd.randrange(i)]
        a, b = min(u, v), max(u, v)
        edges.add((a, b))
    max_edges = n * (n - 1) // 2
    m = min(m, max_edges)
    attempts = 0
    while len(edges) < m and attempts < m * 20:
        a = rnd.randrange(n)
        b = rnd.randrange(n)
        attempts += 1
        if a == b:
            continue
        a, b = min(a, b), max(a, b)
        edges.add((a, b))
    return [(a, b, rnd.randint(1, 1000)) for (a, b) in edges]


def build_adj_int(n, weighted_edges):
    adj = {v: [] for v in range(n)}
    for a, b, w in weighted_edges:
        adj[a].append((b, w))
        adj[b].append((a, w))
    return adj


def array_ops(n, adj):
    INF = float("inf")
    key = [INF] * n
    key[0] = 0
    in_tree = [False] * n
    comparisons = 0
    for _ in range(n):
        u = -1
        best = INF
        for v in range(n):
            if not in_tree[v]:
                comparisons += 1
                if key[v] < best:
                    best = key[v]
                    u = v
        in_tree[u] = True
        for v2, w2 in adj[u]:
            if not in_tree[v2] and w2 < key[v2]:
                key[v2] = w2
    return comparisons


def lazy_heap_cost(n, adj):
    """A heap operation's own cost is proportional to log2 of the heap's size at that
    moment; this sums that cost over every push and pop, as a stand-in for real elapsed
    time that still scales the same way a real binary heap does."""
    in_tree = [False] * n
    in_tree[0] = True
    heap = []
    cost = 0.0
    for v2, w2 in adj[0]:
        heapq.heappush(heap, (w2, v2))
        cost += math.log2(len(heap) + 1)
    added = 1
    while heap and added < n:
        w, v = heapq.heappop(heap)
        cost += math.log2(len(heap) + 2)
        if in_tree[v]:
            continue
        in_tree[v] = True
        added += 1
        for v2, w2 in adj[v]:
            if not in_tree[v2]:
                heapq.heappush(heap, (w2, v2))
                cost += math.log2(len(heap) + 1)
    return cost


N = 200
MAX_M = N * (N - 1) // 2

array_cost_sparse = array_ops(N, build_adj_int(N, random_connected_graph(N, N - 1, seed=0)))
array_cost_dense = array_ops(N, build_adj_int(N, random_connected_graph(N, MAX_M, seed=1)))
assert array_cost_sparse == array_cost_dense == N * (N + 1) // 2

# --- the predicted crossover against a measured one ---

predicted_crossover = (N * N) / math.log2(N)

lo, hi = N - 1, MAX_M
while hi - lo > 1:
    mid = (lo + hi) // 2
    adj = build_adj_int(N, random_connected_graph(N, mid, seed=42))
    if lazy_heap_cost(N, adj) > array_cost_sparse:
        hi = mid
    else:
        lo = mid
measured_crossover = hi

print("array cost (fixed):", array_cost_sparse)
print("predicted crossover m:", round(predicted_crossover), "measured crossover m:", measured_crossover)

# the measured and predicted crossovers land in the same broad range: Big-O hides constant
# factors, so this checks order of magnitude, not an exact match
ratio = measured_crossover / predicted_crossover
assert 0.1 < ratio < 2, ratio

print("All Prim's-algorithm examples verified.")
