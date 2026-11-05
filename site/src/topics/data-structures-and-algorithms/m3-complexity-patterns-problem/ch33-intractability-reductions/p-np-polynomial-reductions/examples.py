import itertools
import math
import random

# ---------------------------------------------------------------------------
# One problem, three forms: bin packing (decision, search, optimization)
# ---------------------------------------------------------------------------

def bin_packing_decision(items, k, capacity):
    """Does `items` fit into k bins of the given capacity?"""
    n = len(items)
    bins = [0] * k

    def backtrack(i):
        if i == n:
            return True
        for b in range(k):
            if bins[b] + items[i] <= capacity:
                bins[b] += items[i]
                if backtrack(i + 1):
                    return True
                bins[b] -= items[i]
            if bins[b] == 0:
                break  # symmetry break: trying another empty bin is pointless
        return False

    return backtrack(0)


def bin_packing_search(items, k, capacity):
    """Return an actual packing (list of bins, each a list of items), or None."""
    n = len(items)
    bins = [[] for _ in range(k)]
    sums = [0] * k

    def backtrack(i):
        if i == n:
            return True
        for b in range(k):
            if sums[b] + items[i] <= capacity:
                bins[b].append(items[i])
                sums[b] += items[i]
                if backtrack(i + 1):
                    return True
                sums[b] -= items[i]
                bins[b].pop()
            if sums[b] == 0:
                break
        return False

    if backtrack(0):
        return bins
    return None


def verify_packing(bins, capacity):
    """A verifier: checks a candidate packing in O(n) time."""
    return all(sum(b) <= capacity for b in bins)


def bin_packing_optimal(items, capacity):
    """The fewest bins, found by trying k = 1, 2, ... until feasible."""
    n = len(items)
    for k in range(1, n + 1):
        if bin_packing_decision(items, k, capacity):
            return k
    return n


ITEMS = [4, 8, 1, 4, 2, 1]
CAPACITY = 10
optimal_k = bin_packing_optimal(ITEMS, CAPACITY)
packing = bin_packing_search(ITEMS, optimal_k, CAPACITY)
assert packing is not None
assert verify_packing(packing, CAPACITY)
assert sorted(x for b in packing for x in b) == sorted(ITEMS)
assert not bin_packing_decision(ITEMS, optimal_k - 1, CAPACITY)
print(f"bin packing: optimal bins = {optimal_k}, packing = {packing}")

# ---------------------------------------------------------------------------
# Verify against find: independent set on n = 60, k = 30
# ---------------------------------------------------------------------------

N_VERTICES = 60
K_WITNESS = 30
assert N_VERTICES == 60
assert K_WITNESS == 30
candidate_count = math.comb(N_VERTICES, K_WITNESS)
verify_cost = K_WITNESS * (K_WITNESS - 1) // 2
assert verify_cost == 435
assert 1.17e17 < candidate_count < 1.19e17
print(f"independent set n=60,k=30: candidates = {candidate_count:.3e}, verify cost = {verify_cost}")

# ---------------------------------------------------------------------------
# Search from a decision procedure: the self-reduction
# ---------------------------------------------------------------------------

def decision_is_ge(vertices, adj, k):
    """Does the graph restricted to `vertices` have an independent set of size >= k?"""
    vlist = list(vertices)
    if k == 0:
        return True
    if k > len(vlist):
        return False
    for combo in itertools.combinations(vlist, k):
        if all(b not in adj[a] for a, b in itertools.combinations(combo, 2)):
            return True
    return False


def max_independent_set_size(vertices, adj):
    vlist = list(vertices)
    for k in range(len(vlist), -1, -1):
        if decision_is_ge(vlist, adj, k):
            return k
    return 0


def self_reduce_witness(vertices, adj, k):
    """Build an independent set of size k using only a yes/no oracle, in n + 1 calls."""
    calls = 0
    remaining = set(vertices)
    calls += 1
    assert decision_is_ge(remaining, adj, k)
    for v in vertices:
        trial = remaining - {v}
        calls += 1
        if decision_is_ge(trial, adj, k):
            remaining = trial
    return remaining, calls


def random_graph(n, edge_prob, seed):
    rng = random.Random(seed)
    adj = {i: set() for i in range(n)}
    for a, b in itertools.combinations(range(n), 2):
        if rng.random() < edge_prob:
            adj[a].add(b)
            adj[b].add(a)
    return adj


SELF_REDUCE_N = 12
assert SELF_REDUCE_N == 12
for seed in range(10):
    n = SELF_REDUCE_N
    adj = random_graph(n, 0.3, seed)
    vertices = list(range(n))
    k = max_independent_set_size(vertices, adj)
    if k == 0:
        continue
    witness, calls = self_reduce_witness(vertices, adj, k)
    assert len(witness) == k, (seed, k, witness)
    assert all(b not in adj[a] for a, b in itertools.combinations(witness, 2))
    assert calls == n + 1, (calls, n)
print(f"self-reduction: n + 1 = {n + 1} calls always reconstructs a witness of the claimed size")

# ---------------------------------------------------------------------------
# A Karp reduction, checked by exhaustion: independent set -> vertex cover
# ---------------------------------------------------------------------------

def decision_vc_le(n, edges, j):
    """Does the graph on n vertices have a vertex cover of size <= j?"""
    vertices = range(n)
    for size in range(0, j + 1):
        for combo in itertools.combinations(vertices, size):
            cover = set(combo)
            if all(a in cover or b in cover for a, b in edges):
                return True
    return False


def decision_is_ge_edges(n, edges, k):
    edge_set = set(frozenset(e) for e in edges)
    vertices = range(n)
    if k == 0:
        return True
    if k > n:
        return False
    for combo in itertools.combinations(vertices, k):
        if all(frozenset((a, b)) not in edge_set for a, b in itertools.combinations(combo, 2)):
            return True
    return False


MAX_VERTICES_CHECKED = 6
assert MAX_VERTICES_CHECKED == 6
checked = 0
for m in range(1, MAX_VERTICES_CHECKED + 1):
    possible_edges = list(itertools.combinations(range(m), 2))
    for edge_mask in range(2 ** len(possible_edges)):
        edges = [e for i, e in enumerate(possible_edges) if edge_mask & (1 << i)]
        for k in range(0, m + 1):
            has_is = decision_is_ge_edges(m, edges, k)
            has_vc = decision_vc_le(m, edges, m - k)
            assert has_is == has_vc, (m, edges, k)
            checked += 1

print(f"Karp reduction (G,k) -> (G, n-k), independent set <-> vertex cover: "
      f"{checked} (graph, k) pairs checked on every graph of <= 6 vertices, 0 mismatches")
print("The same check, read backwards, is also the reduction vertex cover -> independent set: "
      "the iff is symmetric, so the two problems are equally hard.")
print("The reduction's output (G, n - k) has exactly the input's own vertex and edge count: "
      "computing n - k is O(1), so the map's output size is linear in the input's.")

# ---------------------------------------------------------------------------
# A reduction in the wrong direction: vacuous reductions from every P problem
# ---------------------------------------------------------------------------

def is_two_colorable(n, edges):
    adj = {i: set() for i in range(n)}
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    color = {}
    for start in range(n):
        if start in color:
            continue
        color[start] = 0
        stack = [start]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if v not in color:
                    color[v] = 1 - color[u]
                    stack.append(v)
                elif color[v] == color[u]:
                    return False
    return True


# A fixed yes-instance and a fixed no-instance of independent set, decided once.
FIXED_YES = (1, [], 1)       # one vertex, no edges: independent set of size 1 exists
FIXED_NO = (2, [(0, 1)], 2)  # two vertices, one edge: no independent set of size 2


def reduce_two_colorable_to_independent_set(n, edges):
    """A reduction that exists but proves nothing: ignores the real instance entirely."""
    return FIXED_YES if is_two_colorable(n, edges) else FIXED_NO


for seed in range(20):
    n = 8
    rng = random.Random(seed + 100)
    edges = [e for e in itertools.combinations(range(n), 2) if rng.random() < 0.4]
    target_n, target_edges, target_k = reduce_two_colorable_to_independent_set(n, edges)
    mapped_answer = decision_is_ge_edges(target_n, target_edges, target_k)
    assert mapped_answer == is_two_colorable(n, edges)

print("A reduction from 2-colourability (in P) to independent set exists and is vacuous: "
      "it ignores the instance and outputs one of two fixed, pre-decided graphs. "
      "This shows only that 2-colourability is no harder than independent set, nothing more.")

# ---------------------------------------------------------------------------
# The lab reduction: 3-SAT -> independent set (post-notes)
# ---------------------------------------------------------------------------

def sat_to_independent_set(clauses):
    """clauses: list of clauses, each a list of (var_index, is_negated)."""
    lits = [(ci, lit) for ci, clause in enumerate(clauses) for lit in clause]
    n = len(lits)
    edges = []
    for i, j in itertools.combinations(range(n), 2):
        ci, (vi, ni) = lits[i]
        cj, (vj, nj) = lits[j]
        if ci == cj:
            edges.append((i, j))
        elif vi == vj and ni != nj:
            edges.append((i, j))
    return n, edges, len(clauses)


def brute_force_sat(num_vars, clauses):
    for bits in itertools.product([False, True], repeat=num_vars):
        if all(
            any((not bits[v]) if neg else bits[v] for v, neg in clause)
            for clause in clauses
        ):
            return True
    return False


def random_3cnf(num_vars, num_clauses, seed):
    rng = random.Random(seed + 200)
    clauses = []
    for _ in range(num_clauses):
        vs = rng.sample(range(num_vars), 3)
        clauses.append([(v, rng.random() < 0.5) for v in vs])
    return clauses


for seed in range(30):
    clauses = random_3cnf(4, 4, seed)
    n, edges, k = sat_to_independent_set(clauses)
    assert decision_is_ge_edges(n, edges, k) == brute_force_sat(4, clauses)

print("lab: 3-SAT -> independent set (a triangle per clause, an edge between every literal "
      "and its negation) checked against brute-force satisfiability on 30 random formulas: "
      "0 mismatches")
