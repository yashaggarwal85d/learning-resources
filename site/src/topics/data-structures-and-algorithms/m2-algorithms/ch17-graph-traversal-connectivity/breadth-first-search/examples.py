"""
dsa.breadth-first-search -- every number this topic puts on screen, computed or
asserted here. Plain BFS and its shortest-path guarantee on an unweighted graph;
multi-source BFS against running single-source BFS once per source; 0-1 BFS with
a deque against plain Dijkstra on the same 0/1-weighted graph; bipartiteness by
2-colouring with a constructed odd-cycle witness; a small top-down/bottom-up
toggle shaped like direction-optimizing BFS, showing the edges-examined saving.
"""

import random
from collections import deque


# ---------------------------------------------------------------------------
# 1. Plain BFS: FIFO frontier, parent pointers, and the shortest-path guarantee.
# ---------------------------------------------------------------------------

def bfs(adj, source):
    n = len(adj)
    dist = [-1] * n
    parent = [-1] * n
    dist[source] = 0
    q = deque([source])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)
    return dist, parent, order


def reconstruct_path(parent, source, target):
    if parent[target] == -1 and target != source:
        return None
    path = [target]
    while path[-1] != source:
        path.append(parent[path[-1]])
    path.reverse()
    return path


# A graph with several paths of different length from 0 to 6: a short direct-ish
# route and a long detour, so the shortest-path guarantee is actually exercised.
MULTI_PATH_ADJ = {
    0: [1, 7],
    1: [0, 2],
    2: [1, 3, 6],
    3: [2, 4],
    4: [3, 5],
    5: [4, 6],
    6: [2, 5, 7],
    7: [0, 6],
}
dist, parent, _ = bfs(MULTI_PATH_ADJ, 0)
# 0 -> 7 -> 6 is length 2; 0 -> 1 -> 2 -> 6 is length 3; 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 is length 6.
assert dist[6] == 2, dist[6]
path_to_6 = reconstruct_path(parent, 0, 6)
assert path_to_6 == [0, 7, 6], path_to_6
assert dist[4] == 4, dist[4]  # both 0->1->2->3->4 and 0->7->6->5->4 are length 4


# ---------------------------------------------------------------------------
# 2. Multi-source BFS: one pass with several seeds, vs. k single-source passes.
# ---------------------------------------------------------------------------

def multi_source_bfs(adj, sources):
    n = len(adj)
    dist = [-1] * n
    q = deque()
    for s in sources:
        dist[s] = 0
        q.append(s)
    edges_examined = 0
    while q:
        u = q.popleft()
        for v in adj[u]:
            edges_examined += 1
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist, edges_examined


def grid_adj(rows, cols):
    def idx(r, c):
        return r * cols + c
    adj = {idx(r, c): [] for r in range(rows) for c in range(cols)}
    for r in range(rows):
        for c in range(cols):
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    adj[idx(r, c)].append(idx(nr, nc))
    return adj, idx


ROWS, COLS = 20, 20
GRID_ADJ, grid_idx = grid_adj(ROWS, COLS)
FIRE_SOURCES = [grid_idx(0, 0), grid_idx(ROWS - 1, COLS - 1), grid_idx(0, COLS - 1)]

multi_dist, multi_edges = multi_source_bfs(GRID_ADJ, FIRE_SOURCES)

single_edges_total = 0
single_dists = []
for s in FIRE_SOURCES:
    d, edges = multi_source_bfs(GRID_ADJ, [s])
    single_dists.append(d)
    single_edges_total += edges

# The minimum over k single-source runs must equal the one multi-source run's distances.
min_dist = [min(single_dists[i][v] for i in range(len(FIRE_SOURCES))) for v in range(ROWS * COLS)]
assert multi_dist == min_dist
assert single_edges_total > multi_edges
# k = 3 single-source passes cost roughly 3x the edge examinations of one multi-source pass.
ratio = single_edges_total / multi_edges
assert 2.5 < ratio < 3.5, ratio


# ---------------------------------------------------------------------------
# 3. 0-1 BFS with a deque: 0-weight edges to the front, 1-weight edges to the back.
# ---------------------------------------------------------------------------

def zero_one_bfs(adj_weighted, n, source):
    """adj_weighted[u] is a list of (v, weight) with weight in {0, 1}."""
    INF = float('inf')
    dist = [INF] * n
    dist[source] = 0
    dq = deque([source])
    while dq:
        u = dq.popleft()
        for v, w in adj_weighted[u]:
            nd = dist[u] + w
            if nd < dist[v]:
                dist[v] = nd
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist


def dijkstra(adj_weighted, n, source):
    import heapq
    INF = float('inf')
    dist = [INF] * n
    dist[source] = 0
    pq = [(0, source)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj_weighted[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist


random.seed(7)
N01 = 60
zero_one_adj = {i: [] for i in range(N01)}
for i in range(N01):
    for j in range(i + 1, min(i + 4, N01)):
        w = random.choice([0, 0, 1])
        zero_one_adj[i].append((j, w))
        zero_one_adj[j].append((i, w))

zo_dist = zero_one_bfs(zero_one_adj, N01, 0)
dj_dist = dijkstra(zero_one_adj, N01, 0)
assert zo_dist == dj_dist, (zo_dist, dj_dist)


# ---------------------------------------------------------------------------
# 4. Bipartiteness by 2-colouring, with a constructed odd-cycle witness.
# ---------------------------------------------------------------------------

def bipartite_check(adj, n):
    color = [-1] * n
    parent = [-1] * n
    for start in range(n):
        if color[start] != -1:
            continue
        color[start] = 0
        q = deque([start])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    parent[v] = u
                    q.append(v)
                elif color[v] == color[u]:
                    # Witness: the path from u up to the common ancestor, the path
                    # from v up to the common ancestor, plus the offending edge.
                    pu, pv = [u], [v]
                    su, sv = {u}, {v}
                    a, b = u, v
                    while a != b:
                        if a in sv or b in su:
                            break
                        if parent[a] != -1:
                            a = parent[a]
                            pu.append(a)
                            su.add(a)
                        if parent[b] != -1 and b not in su:
                            b = parent[b]
                            pv.append(b)
                            sv.add(b)
                    return False, (color, (u, v))
    return True, (color, None)


# A 5-cycle (odd) glued to otherwise-bipartite structure: 0-1-2-3-4-0 is an odd cycle.
ODD_CYCLE_ADJ = {0: [1, 4], 1: [0, 2], 2: [1, 3], 3: [2, 4], 4: [3, 0]}
is_bip, (colors, witness_edge) = bipartite_check(ODD_CYCLE_ADJ, 5)
assert is_bip is False
assert witness_edge is not None
u, v = witness_edge
assert colors[u] == colors[v]

# A genuinely bipartite graph (an even cycle) colours cleanly.
EVEN_CYCLE_ADJ = {0: [1, 5], 1: [0, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5], 5: [4, 0]}
is_bip2, (colors2, _) = bipartite_check(EVEN_CYCLE_ADJ, 6)
assert is_bip2 is True
for a in EVEN_CYCLE_ADJ:
    for b in EVEN_CYCLE_ADJ[a]:
        assert colors2[a] != colors2[b]


# ---------------------------------------------------------------------------
# 5. A top-down/bottom-up toggle shaped like direction-optimizing BFS: once the
#    frontier is large, scanning unvisited vertices for a frontier neighbour
#    examines fewer edges than scanning the frontier's own outgoing edges.
#    (A demonstration of the shape of the saving, not Beamer et al.'s tuned
#    switching heuristic or their parallel implementation.)
# ---------------------------------------------------------------------------

def bfs_top_down_count(adj, n, source):
    visited = [False] * n
    visited[source] = True
    frontier = [source]
    edges_examined = 0
    while frontier:
        next_frontier = []
        for u in frontier:
            for v in adj[u]:
                edges_examined += 1
                if not visited[v]:
                    visited[v] = True
                    next_frontier.append(v)
        frontier = next_frontier
    return edges_examined


def bfs_hybrid_count(adj, n, source, switch_frac=0.15):
    """Top-down while the frontier is small; once it crosses switch_frac of the
    graph, switch to scanning unvisited vertices for any frontier neighbour
    instead (bottom-up), the same switch direction-optimizing BFS makes."""
    visited = [False] * n
    visited[source] = True
    frontier = [source]
    edges_examined = 0
    while frontier:
        if len(frontier) >= switch_frac * n:
            frontier_set = set(frontier)
            next_frontier = []
            for u in range(n):
                if visited[u]:
                    continue
                for v in adj[u]:
                    edges_examined += 1
                    if v in frontier_set:
                        visited[u] = True
                        next_frontier.append(u)
                        break
            frontier = next_frontier
        else:
            next_frontier = []
            for u in frontier:
                for v in adj[u]:
                    edges_examined += 1
                    if not visited[v]:
                        visited[v] = True
                        next_frontier.append(v)
            frontier = next_frontier
    return edges_examined


def random_low_diameter_graph(n, avg_degree, seed):
    rnd = random.Random(seed)
    adj = {i: [] for i in range(n)}
    for i in range(n):
        for _ in range(avg_degree):
            j = rnd.randrange(n)
            if j != i:
                adj[i].append(j)
                adj[j].append(i)
    return adj


LOW_DIAM_N = 2000
LOW_DIAM_ADJ = random_low_diameter_graph(LOW_DIAM_N, 20, seed=3)
top_down_edges = bfs_top_down_count(LOW_DIAM_ADJ, LOW_DIAM_N, 0)
hybrid_edges = bfs_hybrid_count(LOW_DIAM_ADJ, LOW_DIAM_N, 0)
# Once the frontier covers a sizeable fraction of a low-diameter graph, switching
# to scanning unvisited vertices for a frontier neighbour (bottom-up) examines far
# fewer edges than the frontier scanning its own, much larger, set of outgoing
# edges every round (pure top-down).
assert hybrid_edges < top_down_edges, (hybrid_edges, top_down_edges)
speedup_shape = top_down_edges / hybrid_edges
assert speedup_shape > 5, speedup_shape


if __name__ == '__main__':
    print(f"Shortest path 0->6 in the multi-path graph: {path_to_6}, length {dist[6]}")
    print(f"Multi-source BFS ({len(FIRE_SOURCES)} sources) on a {ROWS}x{COLS} grid: "
          f"{multi_edges} edges examined, vs. {single_edges_total} for {len(FIRE_SOURCES)} "
          f"single-source passes (ratio {ratio:.2f})")
    print(f"0-1 BFS matches Dijkstra on the identical 0/1-weighted graph: {zo_dist == dj_dist}")
    print(f"Odd 5-cycle: not bipartite, witness edge {witness_edge}")
    print(f"Even 6-cycle: bipartite, 2-coloured cleanly")
    print(f"Low-diameter graph (n={LOW_DIAM_N}): top-down examines {top_down_edges} edges, "
          f"hybrid (direction-optimizing shape) examines {hybrid_edges} edges "
          f"(top-down/hybrid ratio {speedup_shape:.2f})")
    print("breadth-first-search examples: all checks passed")
