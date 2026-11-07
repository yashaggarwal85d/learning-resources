import math


def topological_order(n, adj):
    indeg = [0] * n
    for u in range(n):
        for v, _ in adj[u]:
            indeg[v] += 1
    order = []
    queue = [u for u in range(n) if indeg[u] == 0]
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v, _ in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    assert len(order) == n, "graph has a cycle, no topological order exists"
    return order


def dag_shortest_paths(n, adj, source, order):
    dist = [math.inf] * n
    pred = [None] * n
    dist[source] = 0
    for u in order:
        if dist[u] == math.inf:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pred[v] = u
    return dist, pred


def dag_shortest_paths_wrong_order(n, adj, source, bad_order):
    dist = [math.inf] * n
    dist[source] = 0
    for u in bad_order:
        if dist[u] == math.inf:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist


def brute_force_all_paths_shortest(n, adj, source):
    dist = [math.inf] * n
    dist[source] = 0
    for _ in range(n - 1):
        changed = False
        for u in range(n):
            if dist[u] == math.inf:
                continue
            for v, w in adj[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    changed = True
        if not changed:
            break
    return dist


def negate(adj, n):
    return [[(v, -w) for v, w in adj[u]] for u in range(n)]


def dag_longest_paths(n, adj, source, order):
    neg_adj = negate(adj, n)
    neg_dist, pred = dag_shortest_paths(n, neg_adj, source, order)
    dist = [-d if d != math.inf else -math.inf for d in neg_dist]
    return dist, pred


def reconstruct_path(pred, source, target):
    path = [target]
    while path[-1] != source:
        path.append(pred[path[-1]])
    path.reverse()
    return path


N = 6
ADJ = [
    [(1, 3), (2, 2)],
    [(3, 4)],
    [(3, 1), (4, 5)],
    [(5, 2)],
    [(5, 6)],
    [],
]

order = topological_order(N, ADJ)
assert order.index(0) < order.index(1) < order.index(3) < order.index(5)
assert order.index(0) < order.index(2) < order.index(4) < order.index(5)

dag_dist, dag_pred = dag_shortest_paths(N, ADJ, 0, order)
brute_dist = brute_force_all_paths_shortest(N, ADJ, 0)
assert dag_dist == brute_dist
assert dag_dist[5] == 5
shortest_path_to_5 = reconstruct_path(dag_pred, 0, 5)
assert shortest_path_to_5 == [0, 2, 3, 5]

bad_order = [0, 1, 3, 5, 2, 4]
assert bad_order != order
wrong_dist = dag_shortest_paths_wrong_order(N, ADJ, 0, bad_order)
assert wrong_dist[5] != dag_dist[5]
assert wrong_dist[5] > dag_dist[5]

long_dist, long_pred = dag_longest_paths(N, ADJ, 0, order)
assert long_dist[5] == 13
longest_path_to_5 = reconstruct_path(long_pred, 0, 5)
assert longest_path_to_5 == [0, 2, 4, 5]
assert long_dist[5] > dag_dist[5]


TASK_N = 7
TASK_NAMES = ["start", "design", "build-frame", "wiring", "paint", "inspect", "ship"]
TASK_ADJ = [
    [(1, 0)],
    [(2, 4), (3, 3)],
    [(4, 6), (5, 2)],
    [(4, 2), (5, 5)],
    [(6, 1)],
    [(6, 3)],
    [],
]

task_order = topological_order(TASK_N, TASK_ADJ)
task_dist, task_pred = dag_longest_paths(TASK_N, TASK_ADJ, 0, task_order)
assert task_dist[6] == 11
critical_path = reconstruct_path(task_pred, 0, 6)
assert critical_path == [0, 1, 2, 4, 6]
assert [TASK_NAMES[i] for i in critical_path] == [
    "start",
    "design",
    "build-frame",
    "paint",
    "ship",
]

print("all assertions passed")
print("dag shortest distances:", dag_dist)
print("shortest path to 5:", shortest_path_to_5)
print("dag longest distances:", long_dist)
print("longest path to 5:", longest_path_to_5)
print("critical path:", [TASK_NAMES[i] for i in critical_path], "total:", task_dist[6])
