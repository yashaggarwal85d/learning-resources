"""Bipartite matching and Hopcroft-Karp: the chapter's own task-machine graph (greedy against
maximum, the zig-zag reroute), the Hall-obstruction graph (maximum matching and its own minimum
vertex cover), a one-augmentation-at-a-time baseline against Hopcroft-Karp's phases on a large
random graph, and Konig's-theorem vertex-cover construction on both small graphs.
"""

import random
from collections import deque

# ---------------------------------------------------------------------------
# The chapter's own task-machine graph: t1: m1, m2; t2: m1; t3: m2, m3; t4: m3, m4.
# ---------------------------------------------------------------------------

TASK_MACHINE = {
    "t1": ["m1", "m2"],
    "t2": ["m1"],
    "t3": ["m2", "m3"],
    "t4": ["m3", "m4"],
}
LEFT = list(TASK_MACHINE.keys())


def greedy_matching(graph, left_order):
    """Process each left vertex in order, take the first unmatched neighbour."""
    match_right = {}
    match_left = {}
    for u in left_order:
        for v in graph[u]:
            if v not in match_right:
                match_right[v] = u
                match_left[u] = v
                break
    return match_left, match_right


greedy_left, greedy_right = greedy_matching(TASK_MACHINE, LEFT)
assert greedy_left == {"t1": "m1", "t3": "m2", "t4": "m3"}
assert len(greedy_left) == 3
assert "t2" not in greedy_left, "t2 should be left unmatched by the greedy scan"


def find_alternating_path(graph, start, match_left, match_right):
    """BFS for an augmenting path from a free left vertex, alternating non-matching
    and matching edges, ending at a free right vertex. Returns the path as an
    alternating sequence of vertices, or None.
    """
    parent = {start: None}
    queue = deque([start])
    side = {start: "L"}
    while queue:
        u = queue.popleft()
        if side[u] == "L":
            for v in graph[u]:
                if v not in parent:
                    parent[v] = u
                    side[v] = "R"
                    if v not in match_right:
                        path = [v]
                        while parent[path[-1]] is not None:
                            path.append(parent[path[-1]])
                        return list(reversed(path))
                    queue.append(v)
        else:
            w = match_right[u]
            if w not in parent:
                parent[w] = u
                side[w] = "L"
                queue.append(w)
    return None


def flip_path(path, match_left, match_right):
    for i in range(0, len(path) - 1, 2):
        u, v = path[i], path[i + 1]
        match_left[u] = v
        match_right[v] = u


def one_at_a_time(graph, lefts):
    """Kuhn's one-augmentation-at-a-time algorithm: try every free left vertex in
    order, record each successful augmentation.
    """
    match_left, match_right = {}, {}
    augmentations = []
    for u in lefts:
        if u in match_left:
            continue
        path = find_alternating_path(graph, u, match_left, match_right)
        if path is not None:
            flip_path(path, match_left, match_right)
            augmentations.append(tuple(path))
    return match_left, match_right, augmentations


tm_left, tm_right, tm_augmentations = one_at_a_time(TASK_MACHINE, LEFT)
assert tm_left == {"t1": "m2", "t2": "m1", "t3": "m3", "t4": "m4"}
assert len(tm_left) == 4, "the maximum matching on the task-machine graph has size four"

# the zig-zag reroute: starting the one-at-a-time algorithm from the greedy
# matching, the single augmenting path for the still-free t2 is exactly the
# chapter's own zig-zag
rerouted_left, rerouted_right = dict(greedy_left), dict(greedy_right)
reroute_path = find_alternating_path(TASK_MACHINE, "t2", rerouted_left, rerouted_right)
assert reroute_path == ["t2", "m1", "t1", "m2", "t3", "m3", "t4", "m4"]
flip_path(reroute_path, rerouted_left, rerouted_right)
assert rerouted_left == {"t2": "m1", "t1": "m2", "t3": "m3", "t4": "m4"}
assert rerouted_left == tm_left or set(rerouted_left.items()) == set(tm_left.items())


def konig_vertex_cover(graph, lefts, rights, match_left, match_right):
    """Konig's construction: Z = vertices reachable from free left vertices by
    alternating paths (non-matching edge L->R, matching edge R->L). The minimum
    vertex cover is (lefts not in Z) union (rights in Z).
    """
    free_lefts = [u for u in lefts if u not in match_left]
    z_left, z_right = set(free_lefts), set()
    queue = deque(free_lefts)
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in z_right:
                z_right.add(v)
                w = match_right.get(v)
                if w is not None and w not in z_left:
                    z_left.add(w)
                    queue.append(w)
    cover = {u for u in lefts if u not in z_left} | {v for v in rights if v in z_right}
    return cover


tm_rights = ["m1", "m2", "m3", "m4"]
tm_cover = konig_vertex_cover(TASK_MACHINE, LEFT, tm_rights, tm_left, tm_right)
assert tm_cover == {"t1", "t2", "t3", "t4"}
assert len(tm_cover) == len(tm_left) == 4

# ---------------------------------------------------------------------------
# Hall's obstruction graph: t1: m1; t2: m1; t3: m2, m3.
# ---------------------------------------------------------------------------

HALL = {
    "t1": ["m1"],
    "t2": ["m1"],
    "t3": ["m2", "m3"],
}
hall_left_order = ["t1", "t2", "t3"]
hall_left, hall_right, hall_augmentations = one_at_a_time(HALL, hall_left_order)
assert len(hall_left) == 2, "t1 and t2 both only reach m1, so one of them stays free"
hall_rights = ["m1", "m2", "m3"]
hall_cover = konig_vertex_cover(HALL, hall_left_order, hall_rights, hall_left, hall_right)
assert hall_cover == {"m1", "t3"}
assert len(hall_cover) == 2 == len(hall_left)

# ---------------------------------------------------------------------------
# One-at-a-time against Hopcroft-Karp on a large random bipartite graph.
# ---------------------------------------------------------------------------


def random_bipartite(n_left, n_right, degree, seed):
    rng = random.Random(seed)
    graph = {}
    for i in range(n_left):
        u = f"L{i}"
        k = rng.randint(1, degree)
        graph[u] = [f"R{j}" for j in rng.sample(range(n_right), k)]
    return graph


def hopcroft_karp(graph, lefts, rights):
    """Standard Hopcroft-Karp: each phase builds BFS layers from every free left
    vertex at once, then a DFS finds a maximal set of vertex-disjoint shortest
    augmenting paths, all flipped together. Returns the matching and the list
    of how many paths each phase flipped.
    """
    match_left = {}
    match_right = {}
    phase_sizes = []
    while True:
        dist = {}
        queue = deque()
        for u in lefts:
            if u not in match_left:
                dist[u] = 0
                queue.append(u)
        found_free_right = False
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                w = match_right.get(v)
                if w is None:
                    found_free_right = True
                elif w not in dist:
                    dist[w] = dist[u] + 1
                    queue.append(w)
        if not found_free_right:
            break

        def dfs(u):
            for v in graph[u]:
                w = match_right.get(v)
                if w is None:
                    match_left[u] = v
                    match_right[v] = u
                    return True
                if w in dist and dist[w] == dist[u] + 1 and dfs(w):
                    match_left[u] = v
                    match_right[v] = u
                    return True
            dist[u] = -1
            return False

        flipped = 0
        for u in lefts:
            if u not in match_left:
                if dfs(u):
                    flipped += 1
        phase_sizes.append(flipped)
    return match_left, match_right, phase_sizes


N = 1000
BIG_GRAPH = random_bipartite(N, N, degree=4, seed=42)
BIG_LEFTS = [f"L{i}" for i in range(N)]
BIG_RIGHTS = [f"R{i}" for i in range(N)]

one_left, one_right, one_augmentations = one_at_a_time(BIG_GRAPH, BIG_LEFTS)
hk_left, hk_right, hk_phases = hopcroft_karp(BIG_GRAPH, BIG_LEFTS, BIG_RIGHTS)

assert len(one_left) == len(hk_left), "both algorithms find a matching of the same size"
assert len(one_augmentations) == len(one_left)
assert sum(hk_phases) == len(hk_left)
assert len(hk_phases) < len(one_augmentations), "Hopcroft-Karp uses far fewer rounds"
assert len(hk_phases) <= 3 * int(N ** 0.5) + 1, "phase count should be in the O(sqrt(V)) range"

# ---------------------------------------------------------------------------
# A second König check: on the large graph, the cover's size matches the
# matching's size exactly, independent of which algorithm found the matching.
# ---------------------------------------------------------------------------

big_cover = konig_vertex_cover(BIG_GRAPH, BIG_LEFTS, BIG_RIGHTS, hk_left, hk_right)
assert len(big_cover) == len(hk_left)

print("All bipartite-matching examples verified.")
print(f"Task-machine graph: greedy matches {len(greedy_left)}, maximum is {len(tm_left)}.")
print(f"Zig-zag reroute from the greedy matching: {reroute_path}")
print(f"Hall obstruction: maximum matching {len(hall_left)}, minimum cover {sorted(hall_cover)}.")
print(f"Random graph ({N}+{N} vertices): one-at-a-time took {len(one_augmentations)} augmentations; "
      f"Hopcroft-Karp took {len(hk_phases)} phases {hk_phases}, matching size {len(hk_left)}.")
