"""
dsa.dijkstra-s-algorithm -- every number this topic puts on screen, computed or asserted
here. Dijkstra's own label-setting algorithm, confirmed against a brute-force shortest-path
computation; the exact negative-edge counterexample from Wikipedia's own "Dijkstra's
algorithm" article, reproduced to show the failure directly; lazy deletion vs. decrease-key,
compared by relaxation count on the same graph.
"""

import heapq
import itertools


# A small weighted graph with more than one path between some pairs, so the shortest
# path isn't simply the one with fewest edges.
#   0 -> 1 (4), 0 -> 2 (1)
#   1 -> 3 (1)
#   2 -> 1 (2), 2 -> 3 (5)
#   3 -> 4 (3)
WEIGHTED_ADJ = {
    0: [(1, 4), (2, 1)],
    1: [(3, 1)],
    2: [(1, 2), (3, 5)],
    3: [(4, 3)],
    4: [],
}
WEIGHTED_N = 5


def dijkstra(adj, n, source):
    dist = [float('inf')] * n
    dist[source] = 0
    visited = [False] * n
    heap = [(0, source)]
    relaxations = 0
    while heap:
        d, u = heapq.heappop(heap)
        if visited[u]:
            continue
        visited[u] = True
        for v, w in adj[u]:
            relaxations += 1
            if visited[v]:
                continue  # v is already finalized -- its distance can never change again
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    return dist, relaxations


def brute_force_shortest_paths(adj, n, source):
    # Try every permutation-free path by relaxing repeatedly until nothing changes --
    # a slow, obviously-correct reference, independent of any priority queue.
    dist = [float('inf')] * n
    dist[source] = 0
    for _ in range(n):
        for u in adj:
            for v, w in adj[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
    return dist


dijkstra_dist, _ = dijkstra(WEIGHTED_ADJ, WEIGHTED_N, 0)
brute_dist = brute_force_shortest_paths(WEIGHTED_ADJ, WEIGHTED_N, 0)
assert dijkstra_dist == brute_dist == [0, 3, 1, 4, 7], dijkstra_dist


# ---------------------------------------------------------------------------
# Why non-negative weights are required: Wikipedia's own exact counterexample.
# 3 nodes: s(=0) -> a(=1) weight 2, s -> b(=2) weight 5, b -> a weight -10.
# ---------------------------------------------------------------------------

NEGATIVE_COUNTEREXAMPLE_ADJ = {
    0: [(1, 2), (2, 5)],
    1: [],
    2: [(1, -10)],
}
dijkstra_wrong_dist, _ = dijkstra(NEGATIVE_COUNTEREXAMPLE_ADJ, 3, 0)
# Dijkstra finalizes vertex 1 (a) at 2 the moment it's popped, and never revisits it --
# but the true shortest path s -> b -> a costs 5 + (-10) = -5.
true_shortest_to_a = 5 + (-10)
assert dijkstra_wrong_dist[1] == 2, dijkstra_wrong_dist
assert dijkstra_wrong_dist[1] != true_shortest_to_a
assert true_shortest_to_a < dijkstra_wrong_dist[1], "the real shortest path must be strictly shorter than Dijkstra's wrong answer"


# ---------------------------------------------------------------------------
# Lazy deletion vs. decrease-key: same graph, same final distances, different
# number of heap entries pushed and popped.
# ---------------------------------------------------------------------------

def dijkstra_lazy(adj, n, source):
    # Lazy deletion: push a new, smaller entry whenever a distance improves; skip a
    # popped entry if it's stale (its distance no longer matches the current best).
    dist = [float('inf')] * n
    dist[source] = 0
    heap = [(0, source)]
    pushes = 0
    stale_pops = 0
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            stale_pops += 1
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
                pushes += 1
    return dist, pushes, stale_pops


def dijkstra_decrease_key(adj, n, source):
    # A simple array-backed "decrease-key" simulation: no duplicate entries ever
    # exist in the queue, so there is nothing stale to skip.
    dist = [float('inf')] * n
    dist[source] = 0
    in_queue = set(range(n))
    decreases = 0
    while in_queue:
        u = min(in_queue, key=lambda x: dist[x])
        in_queue.discard(u)
        for v, w in adj[u]:
            if v in in_queue and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                decreases += 1
    return dist, decreases


lazy_dist, lazy_pushes, lazy_stale_pops = dijkstra_lazy(WEIGHTED_ADJ, WEIGHTED_N, 0)
decrease_key_dist, decrease_key_ops = dijkstra_decrease_key(WEIGHTED_ADJ, WEIGHTED_N, 0)
assert lazy_dist == decrease_key_dist == brute_dist
# Lazy deletion's own cost: some of its heap entries turn out stale (superseded by a
# better one pushed later) and have to be popped and discarded, work decrease-key
# never pays since it never holds more than one entry per vertex.
assert lazy_stale_pops > 0, "need at least one stale pop to show lazy deletion's own waste"
assert lazy_pushes + lazy_stale_pops > decrease_key_ops


if __name__ == '__main__':
    print(f"Dijkstra's distances from vertex 0: {dijkstra_dist}")
    print(f"Matches brute-force relaxation: {dijkstra_dist == brute_dist}")
    print(f"Negative-edge counterexample: Dijkstra finalizes vertex a (1) at distance {dijkstra_wrong_dist[1]}, "
          f"but the true shortest path s->b->a costs {true_shortest_to_a}")
    print(f"Lazy deletion: {lazy_pushes} heap pushes, {lazy_stale_pops} stale pops; "
          f"decrease-key: {decrease_key_ops} decrease operations, 0 stale pops")
    print("dijkstra-s-algorithm examples: all checks passed")
