"""
dsa.depth-first-search-edge -- every number this topic puts on screen, computed or
asserted here. Discovery/finish times and the parenthesis property on a constructed
directed graph with one of each edge type; the undirected-graph restriction to only
tree and back edges; three-colour cycle detection in a directed graph and a parent-check
in an undirected one; an iterative, explicit-stack DFS that survives the recursion-depth
failure a naive recursive DFS hits on a long chain.
"""

import sys


# ---------------------------------------------------------------------------
# 1. Discovery/finish times, the parenthesis property, and edge classification
#    on a small directed graph built to have one of each edge type.
# ---------------------------------------------------------------------------

# A directed graph with a tree edge, a back edge (a real cycle) and a cross edge, all
# distinguishable from discovery/finish times alone (a forward edge needs its own small
# graph below, FORWARD_ADJ, to keep this one simple).
#   0 -> 1 -> 2 -> 0   (2 -> 0 is a back edge: a real cycle)
#   0 -> 3             (tree edge)
#   4 -> 1             (cross edge: 4 is a separate DFS tree, pointing into vertex 1's tree)
DIRECTED_ADJ = {
    0: [1, 3],
    1: [2],
    2: [0],
    3: [],
    4: [1],
}


def dfs_classify(adj, n):
    WHITE, GREY, BLACK = 0, 1, 2
    color = [WHITE] * n
    disc = [-1] * n
    fin = [-1] * n
    parent = [-1] * n
    clock = [0]
    edge_type = {}

    def visit(u):
        color[u] = GREY
        disc[u] = clock[0]
        clock[0] += 1
        for v in adj[u]:
            if color[v] == WHITE:
                edge_type[(u, v)] = 'tree'
                parent[v] = u
                visit(v)
            elif color[v] == GREY:
                edge_type[(u, v)] = 'back'
            elif color[v] == BLACK:
                # Ancestor/descendant relation decided purely from discovery/finish times.
                if disc[u] < disc[v]:
                    edge_type[(u, v)] = 'forward'
                else:
                    edge_type[(u, v)] = 'cross'
        color[u] = BLACK
        fin[u] = clock[0]
        clock[0] += 1

    for s in range(n):
        if color[s] == WHITE:
            visit(s)
    return disc, fin, edge_type, color


disc, fin, edge_type, _ = dfs_classify(DIRECTED_ADJ, 5)

# Parenthesis property: for any two vertices, their [disc, fin] intervals are either
# disjoint or one nests entirely inside the other -- never partially overlapping.
def intervals_consistent(disc, fin, n):
    for u in range(n):
        for v in range(n):
            if u == v:
                continue
            nested_uv = disc[u] < disc[v] and fin[v] < fin[u]
            nested_vu = disc[v] < disc[u] and fin[u] < fin[v]
            disjoint = fin[u] < disc[v] or fin[v] < disc[u]
            if not (nested_uv or nested_vu or disjoint):
                return False
    return True


assert intervals_consistent(disc, fin, 5)
assert edge_type[(0, 1)] == 'tree'
assert edge_type[(2, 0)] == 'back'
assert edge_type[(4, 1)] == 'cross'
assert edge_type[(0, 3)] == 'tree'

# A forward edge needs a vertex with two ways to reach a shared descendant, one a tree
# edge and the other a later-processed shortcut; build that case explicitly.
FORWARD_ADJ = {0: [1, 3], 1: [2], 2: [3], 3: []}
disc2, fin2, edge_type2, _ = dfs_classify(FORWARD_ADJ, 4)
assert edge_type2[(0, 3)] == 'forward', edge_type2
assert intervals_consistent(disc2, fin2, 4)

# Descendant test from the parenthesis property's own corollary: v is a proper
# descendant of u iff d[u] < d[v] < f[v] < f[u].
def is_descendant(u, v, disc, fin):
    return disc[u] < disc[v] < fin[v] < fin[u]


assert is_descendant(0, 2, disc2, fin2)  # 0 -> 1 -> 2
assert not is_descendant(3, 0, disc2, fin2)


# ---------------------------------------------------------------------------
# 2. Undirected graphs have only tree and back edges -- confirmed directly, not assumed.
# ---------------------------------------------------------------------------

def dfs_classify_undirected(adj, n):
    color = [0] * n  # 0 white, 1 grey, 2 black
    disc = [-1] * n
    fin = [-1] * n
    clock = [0]
    edge_type = {}
    seen_edge = set()

    def visit(u, parent_edge):
        color[u] = 1
        disc[u] = clock[0]
        clock[0] += 1
        for v in adj[u]:
            if (u, v) == parent_edge or (v, u) == parent_edge:
                continue
            key = frozenset((u, v))
            if key in seen_edge:
                continue
            seen_edge.add(key)
            if color[v] == 0:
                edge_type[(u, v)] = 'tree'
                visit(v, (u, v))
            else:
                edge_type[(u, v)] = 'back'
        color[u] = 2
        fin[u] = clock[0]
        clock[0] += 1

    for s in range(n):
        if color[s] == 0:
            visit(s, None)
    return edge_type


UNDIRECTED_ADJ = {0: [1, 2], 1: [0, 2, 3], 2: [0, 1], 3: [1]}
und_types = dfs_classify_undirected(UNDIRECTED_ADJ, 4)
assert set(und_types.values()) <= {'tree', 'back'}, und_types
assert 'forward' not in und_types.values() and 'cross' not in und_types.values()


# ---------------------------------------------------------------------------
# 3. Cycle detection: three-colour back-edge test (directed), parent-check (undirected).
# ---------------------------------------------------------------------------

def has_cycle_directed(adj, n):
    WHITE, GREY, BLACK = 0, 1, 2
    color = [WHITE] * n

    def visit(u):
        color[u] = GREY
        for v in adj[u]:
            if color[v] == GREY:
                return True
            if color[v] == WHITE and visit(v):
                return True
        color[u] = BLACK
        return False

    return any(color[s] == WHITE and visit(s) for s in range(n))


assert has_cycle_directed(DIRECTED_ADJ, 5) is True  # 0 -> 1 -> 2 -> 0
ACYCLIC_ADJ = {0: [1, 3], 1: [2], 2: [], 3: []}
assert has_cycle_directed(ACYCLIC_ADJ, 4) is False


def has_cycle_undirected(adj, n):
    visited = [False] * n

    def visit(u, parent):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                if visit(v, u):
                    return True
            elif v != parent:
                return True
        return False

    return any(not visited[s] and visit(s, -1) for s in range(n))


assert has_cycle_undirected(UNDIRECTED_ADJ, 4) is True  # 0-1-2-0 triangle
TREE_ADJ = {0: [1, 2], 1: [0], 2: [0]}
assert has_cycle_undirected(TREE_ADJ, 3) is False


# ---------------------------------------------------------------------------
# 4. Iterative DFS with an explicit stack survives a recursion-depth failure a
#    naive recursive DFS hits on a long chain.
# ---------------------------------------------------------------------------

def long_chain_adj(length):
    return {i: ([i + 1] if i + 1 < length else []) for i in range(length)}


def recursive_dfs_count(adj, start):
    visited = set()

    def visit(u):
        visited.add(u)
        for v in adj[u]:
            if v not in visited:
                visit(v)

    visit(start)
    return len(visited)


def iterative_dfs_count(adj, start):
    visited = {start}
    # Stack of (vertex, iterator over its neighbours), the construction that yields
    # the identical traversal order to recursive DFS (Wikipedia "Depth-first search").
    stack = [(start, iter(adj[start]))]
    count = 1
    while stack:
        u, it = stack[-1]
        advanced = False
        for v in it:
            if v not in visited:
                visited.add(v)
                count += 1
                stack.append((v, iter(adj[v])))
                advanced = True
                break
        if not advanced:
            stack.pop()
    return count


CRASH_LENGTH = 50_000
chain = long_chain_adj(CRASH_LENGTH)

old_limit = sys.getrecursionlimit()
sys.setrecursionlimit(1000)  # a realistic default-ish limit, to actually trigger the failure
recursion_failed = False
try:
    recursive_dfs_count(chain, 0)
except RecursionError:
    recursion_failed = True
finally:
    sys.setrecursionlimit(old_limit)

assert recursion_failed, "expected the recursive DFS to overflow on a 50,000-long chain at a 1,000 recursion limit"

iterative_result = iterative_dfs_count(chain, 0)
assert iterative_result == CRASH_LENGTH, iterative_result


if __name__ == '__main__':
    print(f"Discovery/finish times on the 5-vertex directed graph: disc={disc}, fin={fin}")
    print(f"Edge classification: {edge_type}")
    print(f"Parenthesis property holds for all vertex pairs: {intervals_consistent(disc, fin, 5)}")
    print(f"Undirected graph edge types (should be only tree/back): {set(und_types.values())}")
    print(f"Directed cycle detected (0->1->2->0): {has_cycle_directed(DIRECTED_ADJ, 5)}")
    print(f"Undirected cycle detected (0-1-2 triangle): {has_cycle_undirected(UNDIRECTED_ADJ, 4)}")
    print(f"Recursive DFS on a {CRASH_LENGTH:,}-long chain (limit 1,000): "
          f"{'RecursionError, as expected' if recursion_failed else 'did not crash'}")
    print(f"Iterative DFS on the identical chain: visited all {iterative_result:,} vertices, no crash")
    print("depth-first-search-edge examples: all checks passed")
