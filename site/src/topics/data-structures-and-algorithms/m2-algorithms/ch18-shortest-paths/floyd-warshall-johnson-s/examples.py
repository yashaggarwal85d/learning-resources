"""
dsa.floyd-warshall-johnson-s -- every number this topic puts on screen, computed or asserted
here. Floyd-Warshall's own O(n^3) dynamic program over intermediate vertices, confirmed
against a brute-force all-pairs computation and against topic 64's own Bellman-Ford run from
every vertex; the transitive closure of a directed graph, computed by the same recurrence over
booleans; path reconstruction from a predecessor matrix, confirmed to reproduce an actual
shortest path, not merely its length; Johnson's algorithm (reweighting plus Dijkstra from
every vertex), confirmed to match Floyd-Warshall exactly on the identical graph.
"""

import heapq
import math


# A small weighted graph with negative edges but no negative cycle: five vertices, enough
# intermediate-vertex choices that the recurrence actually has to pick between routes.
#   0 -> 1 (3), 0 -> 2 (8), 0 -> 4 (-4)
#   1 -> 3 (1), 1 -> 4 (7)
#   2 -> 1 (4)
#   3 -> 0 (2), 3 -> 2 (-5)
#   4 -> 3 (6)
WEIGHTED_N = 5
WEIGHTED_EDGES = [
    (0, 1, 3), (0, 2, 8), (0, 4, -4),
    (1, 3, 1), (1, 4, 7),
    (2, 1, 4),
    (3, 0, 2), (3, 2, -5),
    (4, 3, 6),
]


def floyd_warshall(n, edges):
    dist = [[math.inf] * n for _ in range(n)]
    pred = [[None] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
            pred[u][v] = u
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    pred[i][j] = pred[k][j]
    return dist, pred


def brute_force_all_pairs(n, edges):
    # Run n - 1 full relaxation rounds (topic 64's own Bellman-Ford bound) from every source.
    dist = [[math.inf] * n for _ in range(n)]
    for s in range(n):
        dist[s][s] = 0
        for _ in range(n - 1):
            for u, v, w in edges:
                if dist[s][u] + w < dist[s][v]:
                    dist[s][v] = dist[s][u] + w
    return dist


fw_dist, fw_pred = floyd_warshall(WEIGHTED_N, WEIGHTED_EDGES)
brute_dist = brute_force_all_pairs(WEIGHTED_N, WEIGHTED_EDGES)
assert fw_dist == brute_dist, (fw_dist, brute_dist)


# ---------------------------------------------------------------------------
# Path reconstruction: the predecessor matrix recovers an actual path, not just its length.
# ---------------------------------------------------------------------------

def reconstruct_path(pred, u, v):
    if pred[u][v] is None:
        return [u] if u == v else None
    path = [v]
    while path[-1] != u:
        path.append(pred[u][path[-1]])
    path.reverse()
    return path


def path_weight(edges, path):
    w_by_edge = {(u, v): w for u, v, w in edges}
    return sum(w_by_edge[(path[i], path[i + 1])] for i in range(len(path) - 1))


path_0_to_2 = reconstruct_path(fw_pred, 0, 2)
assert path_0_to_2 is not None and path_0_to_2[0] == 0 and path_0_to_2[-1] == 2
assert path_weight(WEIGHTED_EDGES, path_0_to_2) == fw_dist[0][2], (path_0_to_2, fw_dist[0][2])
# The direct edge 0 -> 2 costs 8; the reconstructed path must be the strictly cheaper one
# Floyd-Warshall actually found, not the direct edge.
assert path_weight(WEIGHTED_EDGES, path_0_to_2) < 8, path_0_to_2


# ---------------------------------------------------------------------------
# Transitive closure: the identical recurrence, with booleans in place of weights.
# ---------------------------------------------------------------------------

def transitive_closure(n, edges):
    reach = [[False] * n for _ in range(n)]
    for i in range(n):
        reach[i][i] = True
    for u, v, _ in edges:
        reach[u][v] = True
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if reach[i][k] and reach[k][j]:
                    reach[i][j] = True
    return reach


def brute_force_reachability(n, edges):
    adj = {i: [] for i in range(n)}
    for u, v, _ in edges:
        adj[u].append(v)
    reach = [[False] * n for _ in range(n)]
    for s in range(n):
        stack, seen = [s], {s}
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        for v in seen:
            reach[s][v] = True
    return reach


closure = transitive_closure(WEIGHTED_N, WEIGHTED_EDGES)
brute_reach = brute_force_reachability(WEIGHTED_N, WEIGHTED_EDGES)
assert closure == brute_reach, (closure, brute_reach)
# Every vertex here can reach every other -- confirms the closure computation does real work,
# not a vacuously sparse one.
assert all(all(row) for row in closure)


# ---------------------------------------------------------------------------
# Johnson's algorithm: reweight by a Bellman-Ford potential, then Dijkstra from every vertex.
# ---------------------------------------------------------------------------

def bellman_ford_from(n, edges, source):
    dist = [math.inf] * n
    dist[source] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None  # negative cycle
    return dist


def dijkstra_from(n, adj, source):
    dist = [math.inf] * n
    dist[source] = 0
    heap = [(0, source)]
    visited = [False] * n
    while heap:
        d, u = heapq.heappop(heap)
        if visited[u]:
            continue
        visited[u] = True
        for v, w in adj[u]:
            if not visited[v] and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    return dist


def johnsons(n, edges):
    # Add a source q = n, connected to every vertex by a zero-weight edge.
    q = n
    augmented = edges + [(q, v, 0) for v in range(n)]
    h = bellman_ford_from(n + 1, augmented, q)
    assert h is not None, "a negative cycle would have to be rejected here"
    reweighted = [(u, v, w + h[u] - h[v]) for u, v, w in edges]
    assert all(w >= 0 for _, _, w in reweighted), "reweighting must remove every negative edge"
    adj = {i: [] for i in range(n)}
    for u, v, w in reweighted:
        adj[u].append((v, w))
    dist = [[math.inf] * n for _ in range(n)]
    for s in range(n):
        reweighted_dist = dijkstra_from(n, adj, s)
        for v in range(n):
            if reweighted_dist[v] < math.inf:
                dist[s][v] = reweighted_dist[v] - h[s] + h[v]
    return dist


johnson_dist = johnsons(WEIGHTED_N, WEIGHTED_EDGES)
assert johnson_dist == fw_dist, (johnson_dist, fw_dist)


if __name__ == '__main__':
    print(f"Floyd-Warshall distances (vertex 0 row): {fw_dist[0]}")
    print(f"Matches Bellman-Ford run from every vertex: {fw_dist == brute_dist}")
    print(f"Reconstructed path 0 to 2: {path_0_to_2}, weight {path_weight(WEIGHTED_EDGES, path_0_to_2)} (direct edge costs 8)")
    print(f"Transitive closure matches brute-force reachability: {closure == brute_reach}")
    print(f"Johnson's algorithm matches Floyd-Warshall exactly: {johnson_dist == fw_dist}")
    print("floyd-warshall-johnson-s examples: all checks passed")
