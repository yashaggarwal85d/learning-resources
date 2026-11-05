"""
dsa.strongly-connected-components -- every number this topic puts on screen, computed or
asserted here. Tarjan's single-pass low-link algorithm and Kosaraju's two-pass algorithm,
run on the same graph and confirmed to find the identical partition into SCCs; the
condensation DAG, built and confirmed directly to be acyclic; 2-SAT solved by building an
implication graph and reading satisfiability off its SCCs.
"""

import sys
sys.setrecursionlimit(10_000)


# A graph with three strongly connected components, built so Tarjan's and Kosaraju's
# algorithms have something nontrivial to agree on:
#   SCC A = {0, 1, 2} (a 3-cycle)
#   SCC B = {3, 4} (a 2-cycle), reachable from A
#   SCC C = {5} (a singleton), reachable from B
SCC_ADJ = {
    0: [1],
    1: [2],
    2: [0, 3],
    3: [4],
    4: [3, 5],
    5: [],
}
SCC_N = 6


def normalize(components):
    return sorted(sorted(c) for c in components)


# ---------------------------------------------------------------------------
# 1. Tarjan's algorithm: a single DFS, maintaining a low-link value per vertex.
# ---------------------------------------------------------------------------

def tarjan_scc(adj, n):
    index_counter = [0]
    index = [None] * n
    lowlink = [None] * n
    on_stack = [False] * n
    stack = []
    result = []

    def strongconnect(v):
        index[v] = index_counter[0]
        lowlink[v] = index_counter[0]
        index_counter[0] += 1
        stack.append(v)
        on_stack[v] = True

        for w in adj[v]:
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

    for v in range(n):
        if index[v] is None:
            strongconnect(v)
    return result


# ---------------------------------------------------------------------------
# 2. Kosaraju's algorithm: finish order, transpose, DFS again in that order.
# ---------------------------------------------------------------------------

def transpose(adj, n):
    t = {v: [] for v in range(n)}
    for u in adj:
        for v in adj[u]:
            t[v].append(u)
    return t


def kosaraju_scc(adj, n):
    visited = [False] * n
    finish_order = []

    def visit(u):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                visit(v)
        finish_order.append(u)

    for s in range(n):
        if not visited[s]:
            visit(s)

    t = transpose(adj, n)
    assigned = [False] * n
    result = []

    def assign(u, component):
        assigned[u] = True
        component.append(u)
        for v in t[u]:
            if not assigned[v]:
                assign(v, component)

    for u in reversed(finish_order):
        if not assigned[u]:
            component = []
            assign(u, component)
            result.append(component)
    return result


tarjan_components = tarjan_scc(SCC_ADJ, SCC_N)
kosaraju_components = kosaraju_scc(SCC_ADJ, SCC_N)

assert normalize(tarjan_components) == normalize(kosaraju_components) == [[0, 1, 2], [3, 4], [5]], (
    normalize(tarjan_components), normalize(kosaraju_components)
)


# ---------------------------------------------------------------------------
# 3. The condensation graph: contract every SCC to a vertex, confirm acyclic directly.
# ---------------------------------------------------------------------------

def condensation(adj, components):
    comp_of = {}
    for i, comp in enumerate(components):
        for v in comp:
            comp_of[v] = i
    cond_adj = {i: set() for i in range(len(components))}
    for u in adj:
        for v in adj[u]:
            if comp_of[u] != comp_of[v]:
                cond_adj[comp_of[u]].add(comp_of[v])
    return {i: sorted(s) for i, s in cond_adj.items()}


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


cond_adj = condensation(SCC_ADJ, tarjan_components)
cond_n = len(tarjan_components)
assert not has_cycle_directed(cond_adj, cond_n), "condensation graph must be acyclic"


# ---------------------------------------------------------------------------
# 4. 2-SAT via SCCs: build the implication graph, decide satisfiability.
# ---------------------------------------------------------------------------

def lit(var, sign):
    # vertex 2*var for the variable true, 2*var+1 for its negation.
    return 2 * var if sign else 2 * var + 1


def neg(v):
    return v ^ 1


def build_implication_graph(n_vars, clauses):
    adj = {v: [] for v in range(2 * n_vars)}
    for (a_var, a_sign), (b_var, b_sign) in clauses:
        a, b = lit(a_var, a_sign), lit(b_var, b_sign)
        adj[neg(a)].append(b)
        adj[neg(b)].append(a)
    return adj


def two_sat_satisfiable(n_vars, clauses):
    adj = build_implication_graph(n_vars, clauses)
    components = tarjan_scc(adj, 2 * n_vars)
    comp_of = {}
    for i, comp in enumerate(components):
        for v in comp:
            comp_of[v] = i
    return all(comp_of[2 * var] != comp_of[2 * var + 1] for var in range(n_vars))


# Satisfiable instance: (x0 OR x1) AND (NOT x0 OR x1) AND (x0 OR NOT x1) -- x0=x1=True works.
SAT_CLAUSES = [
    ((0, True), (1, True)),
    ((0, False), (1, True)),
    ((0, True), (1, False)),
]
assert two_sat_satisfiable(2, SAT_CLAUSES) is True

# Unsatisfiable instance: (x0 OR x0) AND (NOT x0 OR NOT x0) forces x0 both true and false.
UNSAT_CLAUSES = [
    ((0, True), (0, True)),
    ((0, False), (0, False)),
]
assert two_sat_satisfiable(1, UNSAT_CLAUSES) is False


if __name__ == '__main__':
    print(f"Tarjan's SCCs: {normalize(tarjan_components)}")
    print(f"Kosaraju's SCCs: {normalize(kosaraju_components)}")
    print(f"Both algorithms agree: {normalize(tarjan_components) == normalize(kosaraju_components)}")
    print(f"Condensation graph adjacency: {cond_adj}")
    print(f"Condensation graph is acyclic: {not has_cycle_directed(cond_adj, cond_n)}")
    print(f"Satisfiable 2-SAT instance reports satisfiable: {two_sat_satisfiable(2, SAT_CLAUSES)}")
    print(f"Unsatisfiable 2-SAT instance reports unsatisfiable: {not two_sat_satisfiable(1, UNSAT_CLAUSES)}")
    print("strongly-connected-components examples: all checks passed")
