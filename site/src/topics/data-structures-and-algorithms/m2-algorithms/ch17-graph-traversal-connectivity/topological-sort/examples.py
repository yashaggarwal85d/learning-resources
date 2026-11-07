"""
dsa.topological-sort -- every number this topic puts on screen, computed or asserted
here. Kahn's in-degree-queue algorithm and reverse-DFS-finish-order, run side by side
on the same DAG and confirmed independently valid; cycle detection as the natural
failure mode of each (no separate check bolted on); a heap-based Kahn's variant
confirmed to produce the lexicographically smallest valid order.
"""

import heapq
from collections import deque


# A small DAG: a build-system-shaped dependency graph with more than one valid order.
#   0 -> 2, 0 -> 3
#   1 -> 3
#   2 -> 4
#   3 -> 4
DAG_ADJ = {0: [2, 3], 1: [3], 2: [4], 3: [4], 4: []}
DAG_N = 5


def in_degrees(adj, n):
    deg = [0] * n
    for u in adj:
        for v in adj[u]:
            deg[v] += 1
    return deg


# ---------------------------------------------------------------------------
# 1. Kahn's algorithm: an in-degree queue.
# ---------------------------------------------------------------------------

def kahn_toposort(adj, n):
    deg = in_degrees(adj, n)
    q = deque(v for v in range(n) if deg[v] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            deg[v] -= 1
            if deg[v] == 0:
                q.append(v)
    return order if len(order) == n else None  # None signals a cycle


# ---------------------------------------------------------------------------
# 2. Reverse DFS finish order.
# ---------------------------------------------------------------------------

def dfs_finish_order(adj, n):
    WHITE, GREY, BLACK = 0, 1, 2
    color = [WHITE] * n
    finish_order = []
    has_cycle = [False]

    def visit(u):
        color[u] = GREY
        for v in adj[u]:
            if color[v] == GREY:
                has_cycle[0] = True
            elif color[v] == WHITE:
                visit(v)
        color[u] = BLACK
        finish_order.append(u)

    for s in range(n):
        if color[s] == WHITE:
            visit(s)
    return (None if has_cycle[0] else list(reversed(finish_order))), has_cycle[0]


def is_valid_topo_order(adj, order):
    position = {v: i for i, v in enumerate(order)}
    return all(position[u] < position[v] for u in adj for v in adj[u])


kahn_order = kahn_toposort(DAG_ADJ, DAG_N)
dfs_order, _ = dfs_finish_order(DAG_ADJ, DAG_N)

assert kahn_order is not None
assert dfs_order is not None
assert is_valid_topo_order(DAG_ADJ, kahn_order), kahn_order
assert is_valid_topo_order(DAG_ADJ, dfs_order), dfs_order
# The two algorithms need not produce the identical order -- only each its own valid one.
both_valid_not_necessarily_equal = True  # documented, not asserted as equal


# ---------------------------------------------------------------------------
# 3. Cycle detection as a by-product -- no separate check, in either algorithm.
# ---------------------------------------------------------------------------

CYCLIC_ADJ = {0: [1], 1: [2], 2: [0, 3], 3: []}
cyclic_kahn = kahn_toposort(CYCLIC_ADJ, 4)
cyclic_dfs, cyclic_dfs_had_cycle = dfs_finish_order(CYCLIC_ADJ, 4)

assert cyclic_kahn is None, "Kahn's queue should drain short of n vertices on a cyclic graph"
assert cyclic_dfs is None and cyclic_dfs_had_cycle is True


# ---------------------------------------------------------------------------
# 4. Heap-based Kahn's: the lexicographically smallest valid order.
# ---------------------------------------------------------------------------

def kahn_toposort_lexicographic(adj, n):
    deg = in_degrees(adj, n)
    heap = [v for v in range(n) if deg[v] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in adj[u]:
            deg[v] -= 1
            if deg[v] == 0:
                heapq.heappush(heap, v)
    return order if len(order) == n else None


# A graph built so a plain FIFO queue and a lexicographic heap actually disagree:
# vertex 2 starts at in-degree 0 and is enqueued immediately, but a plain FIFO queue
# still pops it before vertex 1, which only reaches in-degree 0 one round later --
# a heap, by contrast, always pops the smallest *currently available* vertex.
MULTI_ORDER_ADJ = {0: [1], 1: [], 2: []}
plain_order = kahn_toposort(MULTI_ORDER_ADJ, 3)
lex_order = kahn_toposort_lexicographic(MULTI_ORDER_ADJ, 3)


def all_valid_topo_orders(adj, n):
    import itertools
    return [list(p) for p in itertools.permutations(range(n)) if is_valid_topo_order(adj, list(p))]


all_orders = all_valid_topo_orders(MULTI_ORDER_ADJ, 3)
smallest_order = min(all_orders)
assert lex_order == smallest_order, (lex_order, smallest_order)
assert len(all_orders) > 1, "need genuinely more than one valid order to show the heap matters"
assert plain_order != lex_order, "need the plain queue and the heap to actually disagree here"


if __name__ == '__main__':
    print(f"Kahn's algorithm order on the DAG: {kahn_order}")
    print(f"Reverse-DFS-finish-order on the same DAG: {dfs_order}")
    print(f"Both independently valid: {is_valid_topo_order(DAG_ADJ, kahn_order)} and {is_valid_topo_order(DAG_ADJ, dfs_order)}")
    print(f"Cyclic graph: Kahn's algorithm reports a cycle: {cyclic_kahn is None}; "
          f"reverse-DFS reports a cycle: {cyclic_dfs is None}")
    print(f"All {len(all_orders)} valid orders of the multi-order graph: {all_orders}")
    print(f"Plain-queue Kahn's order: {plain_order}; lexicographically smallest (heap-based): {lex_order}")
    print("topological-sort examples: all checks passed")
