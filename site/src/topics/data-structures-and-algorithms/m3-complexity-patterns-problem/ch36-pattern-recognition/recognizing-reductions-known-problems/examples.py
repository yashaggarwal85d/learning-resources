import heapq
import itertools
from collections import deque, defaultdict

# =====================================================================================
# Shape 1: Flow and cut. Structural fact: something moves from sources to sinks through
# capacity-limited links. Built here: a reviewer-to-paper assignment, each paper needing
# two reviews, each reviewer willing to do at most two papers, solved as a max-flow problem.
# =====================================================================================

def max_flow_edmonds_karp(capacity, source, sink):
    graph = defaultdict(dict)
    for (u, v), c in capacity.items():
        graph[u][v] = graph[u].get(v, 0) + c
        graph[v].setdefault(u, 0)
    flow = 0
    while True:
        parent = {source: None}
        queue = deque([source])
        while queue:
            u = queue.popleft()
            if u == sink:
                break
            for v, cap in graph[u].items():
                if cap > 0 and v not in parent:
                    parent[v] = u
                    queue.append(v)
        if sink not in parent:
            break
        path_flow = float("inf")
        v = sink
        while parent[v] is not None:
            u = parent[v]
            path_flow = min(path_flow, graph[u][v])
            v = u
        v = sink
        while parent[v] is not None:
            u = parent[v]
            graph[u][v] -= path_flow
            graph[v][u] += path_flow
            v = u
        flow += path_flow
    return flow

REVIEWERS = ["r1", "r2", "r3", "r4", "r5", "r6"]
PAPERS = ["p1", "p2", "p3", "p4"]
WILLING = {
    "r1": {"p1", "p2"},
    "r2": {"p1", "p3"},
    "r3": {"p2", "p3"},
    "r4": {"p2", "p4"},
    "r5": {"p3", "p4"},
    "r6": {"p1", "p4"},
}
REVIEWS_NEEDED_PER_PAPER = 2
MAX_PAPERS_PER_REVIEWER = 2

def build_review_capacity():
    cap = {}
    for r in REVIEWERS:
        cap[("S", r)] = MAX_PAPERS_PER_REVIEWER
    for p in PAPERS:
        cap[(p, "T")] = REVIEWS_NEEDED_PER_PAPER
    for r in REVIEWERS:
        for p in WILLING[r]:
            cap[(r, p)] = 1
    return cap

REVIEW_CAPACITY = build_review_capacity()
TOTAL_REVIEWS_NEEDED = REVIEWS_NEEDED_PER_PAPER * len(PAPERS)
MAX_ASSIGNMENT_FLOW = max_flow_edmonds_karp(REVIEW_CAPACITY, "S", "T")
assert MAX_ASSIGNMENT_FLOW == TOTAL_REVIEWS_NEEDED == 8

def brute_force_max_reviews():
    edges = [(r, p) for r in REVIEWERS for p in WILLING[r]]
    best = 0
    for mask in range(1 << len(edges)):
        chosen = [edges[i] for i in range(len(edges)) if mask & (1 << i)]
        reviewer_count = defaultdict(int)
        paper_count = defaultdict(int)
        ok = True
        for r, p in chosen:
            reviewer_count[r] += 1
            paper_count[p] += 1
            if reviewer_count[r] > MAX_PAPERS_PER_REVIEWER or paper_count[p] > REVIEWS_NEEDED_PER_PAPER:
                ok = False
                break
        if ok:
            best = max(best, len(chosen))
    return best

BRUTE_FORCE_MAX_REVIEWS = brute_force_max_reviews()
assert BRUTE_FORCE_MAX_REVIEWS == MAX_ASSIGNMENT_FLOW == 8

# =====================================================================================
# Shape 2: Matching. Structural fact: the graph is bipartite (two sides, every edge
# crosses). Built here: Kuhn's augmenting-path algorithm on a small instance, cross-
# checked against the flow-based answer on the identical instance.
# =====================================================================================

SMALL_LEFT = ["a", "b", "c"]
SMALL_RIGHT = ["x", "y", "z"]
SMALL_EDGES = {("a", "x"), ("a", "y"), ("b", "y"), ("c", "z")}

def kuhn_bipartite_matching(left, edges):
    adjacency = defaultdict(list)
    for l, r in edges:
        adjacency[l].append(r)
    match_right = {}

    def try_augment(l, visited):
        for r in adjacency[l]:
            if r in visited:
                continue
            visited.add(r)
            if r not in match_right or try_augment(match_right[r], visited):
                match_right[r] = l
                return True
        return False

    matched = 0
    for l in left:
        if try_augment(l, set()):
            matched += 1
    return matched

KUHN_MATCHING_SIZE = kuhn_bipartite_matching(SMALL_LEFT, SMALL_EDGES)

def flow_bipartite_matching_size(left, right, edges):
    cap = {}
    for l in left:
        cap[("S", l)] = 1
    for r in right:
        cap[(r, "T")] = 1
    for (l, r) in edges:
        cap[(l, r)] = 1
    return max_flow_edmonds_karp(cap, "S", "T")

FLOW_MATCHING_SIZE = flow_bipartite_matching_size(SMALL_LEFT, SMALL_RIGHT, SMALL_EDGES)
assert KUHN_MATCHING_SIZE == FLOW_MATCHING_SIZE == 3

# The near-miss: pairing reviewers with each other (one group, not two) is a general
# matching, not a bipartite one. A general graph's maximum matching is still polynomial
# (Edmonds' blossom algorithm), but is not the bipartite algorithm above; demonstrated here
# only by brute force on a tiny instance with an odd cycle, which the bipartite test below
# correctly refuses to call bipartite.

def is_bipartite(vertices, edges):
    color = {}
    adjacency = defaultdict(set)
    for u, v in edges:
        adjacency[u].add(v)
        adjacency[v].add(u)
    for start in vertices:
        if start in color:
            continue
        color[start] = 0
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in adjacency[u]:
                if v not in color:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True

ODD_CYCLE_VERTICES = ["p", "q", "r"]
ODD_CYCLE_EDGES = [("p", "q"), ("q", "r"), ("r", "p")]
assert is_bipartite(SMALL_LEFT + SMALL_RIGHT, [(l, r) for l, r in SMALL_EDGES]) is True
assert is_bipartite(ODD_CYCLE_VERTICES, ODD_CYCLE_EDGES) is False

def brute_force_general_matching_size(vertices, edges):
    best = 0
    for r in range(len(edges) + 1):
        for subset in itertools.combinations(edges, r):
            used = set()
            ok = True
            for u, v in subset:
                if u in used or v in used:
                    ok = False
                    break
                used.add(u)
                used.add(v)
            if ok:
                best = max(best, len(subset))
    return best

ODD_CYCLE_MAX_MATCHING = brute_force_general_matching_size(ODD_CYCLE_VERTICES, ODD_CYCLE_EDGES)
assert ODD_CYCLE_MAX_MATCHING == 1  # an odd cycle of three has no perfect matching

# =====================================================================================
# Shape 3: 2-SAT. Structural fact: constraints involve at most two choices each. Built
# here: implication graph + Tarjan's strongly connected components; satisfiable iff no
# variable and its negation lie in the same component. Verified against brute-force
# truth-table enumeration on a small instance, both satisfiable and unsatisfiable.
# =====================================================================================

def literal_index(var, is_true, num_vars):
    base = var * 2
    return base if is_true else base + 1

def negate(lit):
    return lit ^ 1

def tarjan_scc(num_nodes, adjacency):
    index_counter = [0]
    stack = []
    lowlink = [None] * num_nodes
    index = [None] * num_nodes
    on_stack = [False] * num_nodes
    result = []

    def strongconnect(v):
        index[v] = index_counter[0]
        lowlink[v] = index_counter[0]
        index_counter[0] += 1
        stack.append(v)
        on_stack[v] = True
        for w in adjacency[v]:
            if index[w] is None:
                strongconnect(w)
                lowlink[v] = min(lowlink[v], lowlink[w])
            elif on_stack[w]:
                lowlink[v] = min(lowlink[v], index[w])
        if lowlink[v] == index[v]:
            component = []
            while True:
                w = stack.pop()
                on_stack[w] = False
                component.append(w)
                if w == v:
                    break
            result.append(component)

    for v in range(num_nodes):
        if index[v] is None:
            strongconnect(v)
    return result

def two_sat_satisfiable(num_vars, clauses):
    # Each clause is a pair of literals ((var, is_true), (var, is_true)).
    num_nodes = num_vars * 2
    adjacency = defaultdict(list)
    for (v1, t1), (v2, t2) in clauses:
        a = literal_index(v1, t1, num_vars)
        b = literal_index(v2, t2, num_vars)
        adjacency[negate(a)].append(b)
        adjacency[negate(b)].append(a)
    components = tarjan_scc(num_nodes, adjacency)
    node_component = {}
    for i, comp in enumerate(components):
        for node in comp:
            node_component[node] = i
    for var in range(num_vars):
        pos = literal_index(var, True, num_vars)
        neg = literal_index(var, False, num_vars)
        if node_component[pos] == node_component[neg]:
            return False
    return True

def brute_force_two_sat(num_vars, clauses):
    for bits in itertools.product([False, True], repeat=num_vars):
        ok = True
        for (v1, t1), (v2, t2) in clauses:
            if (bits[v1] == t1) or (bits[v2] == t2):
                continue
            ok = False
            break
        if ok:
            return True
    return False

# A satisfiable instance: (x0 or x1), (not x0 or x2), (not x1 or not x2)
SAT_CLAUSES = [((0, True), (1, True)), ((0, False), (2, True)), ((1, False), (2, False))]
assert two_sat_satisfiable(3, SAT_CLAUSES) == brute_force_two_sat(3, SAT_CLAUSES) == True

# An unsatisfiable instance: (x0), (not x0 or x1), (not x1), forces x0 true and x0 false
UNSAT_CLAUSES = [((0, True), (0, True)), ((0, False), (1, True)), ((1, False), (1, False))]
assert two_sat_satisfiable(2, UNSAT_CLAUSES) == brute_force_two_sat(2, UNSAT_CLAUSES) == False

# =====================================================================================
# Shape 4: Interval scheduling. Structural fact: the objects are intervals on one
# resource. Built here: the earliest-finish greedy for the maximum count of non-
# overlapping intervals, verified against brute force on a small instance.
# =====================================================================================

INTERVALS = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]

def earliest_finish_greedy(intervals):
    chosen = []
    last_end = float("-inf")
    for start, end in sorted(intervals, key=lambda iv: iv[1]):
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen

def brute_force_max_non_overlapping(intervals):
    best = 0
    for r in range(len(intervals) + 1):
        for subset in itertools.combinations(intervals, r):
            ordered = sorted(subset, key=lambda iv: iv[0])
            ok = all(ordered[i][1] <= ordered[i + 1][0] for i in range(len(ordered) - 1))
            if ok:
                best = max(best, len(subset))
    return best

GREEDY_SCHEDULE = earliest_finish_greedy(INTERVALS)
BRUTE_FORCE_SCHEDULE_SIZE = brute_force_max_non_overlapping(INTERVALS)
assert len(GREEDY_SCHEDULE) == BRUTE_FORCE_SCHEDULE_SIZE == 4

# =====================================================================================
# Shape 5: DP on a DAG. Structural fact: a decision sequence whose dependency graph is
# acyclic. Built here: the longest path in a small DAG by relaxing in topological order,
# verified against brute-force enumeration of every path.
# =====================================================================================

DAG_EDGES = {
    "start": [("a", 2), ("b", 3)],
    "a": [("c", 4), ("d", 1)],
    "b": [("d", 2), ("e", 5)],
    "c": [("end", 3)],
    "d": [("end", 6)],
    "e": [("end", 1)],
}
DAG_ORDER = ["start", "a", "b", "c", "d", "e", "end"]

def longest_path_dag(order, edges, source):
    best = {node: float("-inf") for node in order}
    best[source] = 0
    for node in order:
        if best[node] == float("-inf"):
            continue
        for neighbor, weight in edges.get(node, []):
            best[neighbor] = max(best[neighbor], best[node] + weight)
    return best

DAG_BEST = longest_path_dag(DAG_ORDER, DAG_EDGES, "start")

def brute_force_longest_path(edges, source, target):
    best = [float("-inf")]

    def dfs(node, total):
        if node == target:
            best[0] = max(best[0], total)
            return
        for neighbor, weight in edges.get(node, []):
            dfs(neighbor, total + weight)

    dfs(source, 0)
    return best[0]

BRUTE_FORCE_LONGEST = brute_force_longest_path(DAG_EDGES, "start", "end")
assert DAG_BEST["end"] == BRUTE_FORCE_LONGEST == 11  # start -> b -> e -> end: 3 + 5 + 1

# The near-miss: a cycle in the dependency graph breaks the topological relaxation
# entirely, and asking for the longest path in a graph that may have cycles is NP-hard
# (the same Hamiltonian-cycle-family hardness topic 115 already sourced from Erickson).
CYCLIC_EDGES = dict(DAG_EDGES)
CYCLIC_EDGES["d"] = CYCLIC_EDGES["d"] + [("a", 1)]  # d -> a closes a cycle a -> d -> a

def has_cycle(order_guess, edges):
    # A correct topological order must have every edge go forward in the list.
    position = {node: i for i, node in enumerate(order_guess)}
    for node, neighbors in edges.items():
        for neighbor, _ in neighbors:
            if neighbor in position and position[neighbor] <= position[node]:
                return True
    return False

assert has_cycle(DAG_ORDER, CYCLIC_EDGES) is True
assert has_cycle(DAG_ORDER, DAG_EDGES) is False

# =====================================================================================
# The pattern catalogue: four of the seven patterns demonstrated directly (the other
# three — matrix traversal, binary search on the answer, and top-k via a heap's sibling
# concept from the operation-mix topic — are pointed at, not rebuilt, since topics 113
# through 115 already built and verified them).
# =====================================================================================

# Fast and slow pointers: find whether a linked sequence (given as a next-index array)
# cycles, verified against a visited-set walk that would, on a real cycle, loop forever
# without a step bound — here bounded and cross-checked instead.
CYCLIC_SEQUENCE = [1, 2, 3, 4, 2]  # 0->1->2->3->4->2 (cycles back to index 2)
ACYCLIC_SEQUENCE = [1, 2, 3, 4, -1]  # 0->1->2->3->4->stop

def has_cycle_fast_slow(next_index):
    slow = fast = 0
    while True:
        if next_index[fast] == -1:
            return False
        fast = next_index[fast]
        if next_index[fast] == -1:
            return False
        fast = next_index[fast]
        slow = next_index[slow]
        if slow == fast:
            return True

def has_cycle_visited_set(next_index):
    seen = set()
    node = 0
    while node != -1:
        if node in seen:
            return True
        seen.add(node)
        node = next_index[node]
    return False

assert has_cycle_fast_slow(CYCLIC_SEQUENCE) == has_cycle_visited_set(CYCLIC_SEQUENCE) == True
assert has_cycle_fast_slow(ACYCLIC_SEQUENCE) == has_cycle_visited_set(ACYCLIC_SEQUENCE) == False

# Top-k via a heap: the k largest of a stream, verified against a full sort.
STREAM = [17, 3, 42, 8, 56, 9, 23, 71, 4, 61, 15, 29]
K = 4
TOP_K_HEAP = sorted(heapq.nlargest(K, STREAM))
TOP_K_SORT = sorted(sorted(STREAM, reverse=True)[:K])
assert TOP_K_HEAP == TOP_K_SORT == [42, 56, 61, 71]

# k-way merge: merge several already-sorted lists in one pass, verified against sorting
# the concatenation from scratch.
SORTED_LISTS = [[1, 7, 12], [2, 3, 19, 25], [0, 15], [5, 6, 8, 9]]
K_WAY_MERGED = list(heapq.merge(*SORTED_LISTS))
CONCATENATED_SORT = sorted(x for lst in SORTED_LISTS for x in lst)
assert K_WAY_MERGED == CONCATENATED_SORT

# Monotonic stack: next greater element for every position, verified against the
# brute-force O(n^2) scan.
NGE_SEQUENCE = [2, 1, 2, 4, 3, 1]

def next_greater_monotonic_stack(sequence):
    result = [-1] * len(sequence)
    stack = []
    for i, value in enumerate(sequence):
        while stack and sequence[stack[-1]] < value:
            result[stack.pop()] = value
        stack.append(i)
    return result

def next_greater_brute_force(sequence):
    result = [-1] * len(sequence)
    for i in range(len(sequence)):
        for j in range(i + 1, len(sequence)):
            if sequence[j] > sequence[i]:
                result[i] = sequence[j]
                break
    return result

assert next_greater_monotonic_stack(NGE_SEQUENCE) == next_greater_brute_force(NGE_SEQUENCE) == [4, 2, 4, -1, -1, -1]

if __name__ == "__main__":
    print("review assignment: flow", MAX_ASSIGNMENT_FLOW, "brute force", BRUTE_FORCE_MAX_REVIEWS)
    print("bipartite matching: kuhn", KUHN_MATCHING_SIZE, "flow", FLOW_MATCHING_SIZE)
    print("odd cycle is bipartite:", is_bipartite(ODD_CYCLE_VERTICES, ODD_CYCLE_EDGES), "max matching", ODD_CYCLE_MAX_MATCHING)
    print("2-SAT satisfiable instance:", two_sat_satisfiable(3, SAT_CLAUSES))
    print("2-SAT unsatisfiable instance:", two_sat_satisfiable(2, UNSAT_CLAUSES))
    print("interval scheduling: greedy", len(GREEDY_SCHEDULE), "brute force", BRUTE_FORCE_SCHEDULE_SIZE)
    print("DAG longest path:", DAG_BEST["end"], "brute force", BRUTE_FORCE_LONGEST)
    print("cyclic dependency graph detected:", has_cycle(DAG_ORDER, CYCLIC_EDGES))
    print("fast/slow pointers cycle check: cyclic", has_cycle_fast_slow(CYCLIC_SEQUENCE), "acyclic", has_cycle_fast_slow(ACYCLIC_SEQUENCE))
    print("top-k via heap:", TOP_K_HEAP)
    print("k-way merge matches full sort:", K_WAY_MERGED == CONCATENATED_SORT)
    print("monotonic stack next-greater:", next_greater_monotonic_stack(NGE_SEQUENCE))
