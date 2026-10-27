"""Executed truth for the adjacency lists, matrices and edge lists reel.

Builds one real small directed, weighted graph (acyclic by construction, with one real
multi-edge: two directed edges on the identical ordered pair A->B), derives an adjacency
list, an adjacency matrix and an edge list from it programmatically, and checks every
space/cost claim and the matrix's own multi-edge limit directly against that graph. Then
scales the identical construction up to show the real V^2 vs V+E crossover.
"""

# The chapter's own small graph: 6 vertices, 10 directed weighted edges, every edge i->j
# with i < j (guarantees acyclicity by construction), including one real multi-edge
# (A->B twice, with two different weights).
VERTICES = ["A", "B", "C", "D", "E", "F"]
EDGES = [  # (source, target, weight)
    ("A", "B", 4),
    ("A", "C", 2),
    ("A", "B", 7),  # the multi-edge: second A->B edge, a different weight
    ("B", "C", 3),
    ("B", "D", 5),
    ("C", "D", 1),
    ("C", "E", 6),
    ("D", "E", 2),
    ("D", "F", 8),
    ("E", "F", 3),
]
V = len(VERTICES)
E = len(EDGES)
assert V == 6 and E == 10


# --- Build each representation from the identical edge list -----------------------------

def build_adjacency_list(vertices, edges):
    """One chain per vertex, holding its own out-neighbours as (target, weight) pairs."""
    adj = {v: [] for v in vertices}
    for u, w, wt in edges:
        adj[u].append((w, wt))
    return adj


def build_adjacency_matrix(vertices, edges):
    """One cell per ordered pair. An unweighted multigraph could store a count here; this
    matrix instead tries to store a *weight*, which is the case this topic's own predict
    question is about: a second edge on the identical pair overwrites the first."""
    index = {v: i for i, v in enumerate(vertices)}
    n = len(vertices)
    matrix = [[None] * n for _ in range(n)]
    count = [[0] * n for _ in range(n)]
    for u, w, wt in edges:
        i, j = index[u], index[w]
        matrix[i][j] = wt  # a second edge on the same pair simply overwrites this cell
        count[i][j] += 1
    return matrix, count, index


def build_edge_list(edges):
    """No per-vertex structure at all: just every edge, once, as its own (u, v, weight) row."""
    return list(edges)


adj_list = build_adjacency_list(VERTICES, EDGES)
matrix, matrix_count, idx = build_adjacency_matrix(VERTICES, EDGES)
edge_list = build_edge_list(EDGES)


# --- Space: adjacency list ~ V + E, matrix ~ V^2, edge list ~ E exactly ------------------

list_total_entries = sum(len(neighbours) for neighbours in adj_list.values())
assert list_total_entries == E  # one entry per directed edge, at its own source's chain
assert len(adj_list) == V  # one chain per vertex, even F, which has none

matrix_cells = V * V
assert matrix_cells == 36  # V^2, independent of how many edges actually exist

assert len(edge_list) == E  # exactly one row per edge; no per-vertex cost at all


# --- The matrix's own multi-edge limit: a count works, a second weight doesn't ----------

a, b = idx["A"], idx["B"]
assert matrix_count[a][b] == 2  # the matrix *can* record that two edges exist here
# But the cell holds one scalar: the second edge's weight (7) is what survives, and the
# first edge's own weight (4) is gone, not merely "harder to find" — it was never stored.
assert matrix[a][b] == 7
# The adjacency list and the edge list, in contrast, keep both edges and both weights.
assert sorted(w for w, wt in adj_list["A"] if w == "B") == ["B", "B"]
assert sorted(wt for w, wt in adj_list["A"] if w == "B") == [4, 7]
assert sum(1 for u, w, wt in edge_list if u == "A" and w == "B") == 2
assert sorted(wt for u, w, wt in edge_list if u == "A" and w == "B") == [4, 7]


# --- Cost: listing a vertex's own neighbours (list: O(out-degree); matrix: O(V)) ---------

def list_neighbours_cost(vertex):
    """The adjacency list touches exactly the vertex's own out-neighbours, nothing more."""
    return len(adj_list[vertex])


def matrix_neighbours_cost(vertex):
    """The matrix must scan its whole row — every other vertex, present or not."""
    i = idx[vertex]
    touched = 0
    found = []
    for j in range(V):
        touched += 1
        if matrix[i][j] is not None:
            found.append(VERTICES[j])
    return touched, found


assert list_neighbours_cost("A") == 3  # A's own out-degree (B, C, B)
assert list_neighbours_cost("F") == 0  # F has no out-edges at all
touched_a, found_a = matrix_neighbours_cost("A")
assert touched_a == V == 6  # the matrix scans every column regardless of degree
assert sorted(set(found_a)) == ["B", "C"]


# --- Cost: testing one specific edge (list: search the source's own chain) --------------

def list_edge_exists(u, w):
    """Search u's own chain only (this is a directed graph: edges live at their source)."""
    probes = 0
    for target, _ in adj_list[u]:
        probes += 1
        if target == w:
            return True, probes
    return False, probes


found, probes = list_edge_exists("A", "C")
assert found and probes == 2  # A's chain is [B, C, B]; C is found on the second probe
found, probes = list_edge_exists("A", "F")
assert not found and probes == 3  # not present; the whole 3-entry chain had to be searched

# The matrix answers the identical question in exactly one lookup, every time.
assert matrix[idx["A"]][idx["F"]] is None  # one cell read; no edge there
assert matrix[idx["A"]][idx["C"]] == 2  # one cell read; the edge (and its weight) is right there


# --- DAG: the graph is acyclic by construction, and a topological order exists ----------

def topological_order(vertices, edges):
    """Kahn's algorithm: repeatedly remove a vertex with no remaining incoming edge."""
    out_edges = {v: [] for v in vertices}
    in_degree = {v: 0 for v in vertices}
    for u, w, _ in edges:
        out_edges[u].append(w)
        in_degree[w] += 1
    ready = [v for v in vertices if in_degree[v] == 0]
    order = []
    while ready:
        v = ready.pop(0)
        order.append(v)
        for w in out_edges[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                ready.append(w)
    return order


order = topological_order(VERTICES, EDGES)
assert len(order) == V  # every vertex was removed; no cycle blocked the process
assert order.index("A") < order.index("B") < order.index("D") < order.index("F")
assert order.index("A") < order.index("C") < order.index("E") < order.index("F")


# --- Scaled up: the real V + E vs V^2 vs E crossover, at a size large enough to see it ---

def scaled_counts(n_vertices, avg_out_degree):
    n_edges = n_vertices * avg_out_degree
    list_space = n_vertices + n_edges  # one chain header per vertex, one entry per edge
    matrix_space = n_vertices * n_vertices
    edge_list_space = n_edges
    return list_space, matrix_space, edge_list_space

SCALE_N = 1000
SCALE_AVG_DEGREE = 3  # a sparse graph: a few out-edges per vertex, not close to V-1
list_space, matrix_space, edge_list_space = scaled_counts(SCALE_N, SCALE_AVG_DEGREE)
assert list_space == 1000 + 3000 == 4000
assert matrix_space == 1000 * 1000 == 1_000_000
assert edge_list_space == 3000
# At this size the matrix is 250x the adjacency list's own space, for the identical graph.
assert matrix_space / list_space == 250.0

print("adjacency-lists-matrices-edge examples: all checks passed")
