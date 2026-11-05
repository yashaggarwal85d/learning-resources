"""Max-flow min-cut and Ford-Fulkerson: the chapter's own six-vertex directed network
(the same six vertices as Chapter 19's graph, now read as a directed flow network, with
the A-B multi-edge combined into one pipe), the exact stuck-at-seven run and the exact
five-augmentation good run from CHAPTER.md's own planning table, the min cut read off the
final residual graph, a CLRS/SciPy cross-check network, and the Edmonds-Karp pathological
network's bad-path-count contrast.
"""

from collections import deque

# ---------------------------------------------------------------------------
# The chapter's own network: 6 vertices, A source, F sink. The A-B multi-edge
# from Chapter 19's undirected graph (weights 4 and 7) becomes one directed
# pipe of capacity 11.
# ---------------------------------------------------------------------------

VERTICES = ["A", "B", "C", "D", "E", "F"]
CAPACITY = {
    ("A", "B"): 11,  # 4 + 7, the combined multi-edge
    ("A", "C"): 2,
    ("B", "C"): 3,
    ("B", "D"): 5,
    ("C", "D"): 1,
    ("C", "E"): 6,
    ("D", "E"): 2,
    ("D", "F"): 8,
    ("E", "F"): 3,
}
SOURCE, SINK = "A", "F"


def build_adj(capacity):
    adj = {v: set() for v in VERTICES}
    for (u, v) in capacity:
        adj[u].add(v)
        adj[v].add(u)  # the residual graph needs the reverse edge too
    return adj


ADJ = build_adj(CAPACITY)


def residual_capacity(flow, u, v):
    """Forward residual c - f on a real edge, plus backward residual f on its reverse."""
    fwd = CAPACITY.get((u, v), 0) - flow.get((u, v), 0)
    back = flow.get((v, u), 0)
    return fwd + back


def forward_residual_only(flow, u, v):
    """The naive, no-undo view: only c - f on a real edge, never the backward residual."""
    if (u, v) not in CAPACITY:
        return 0
    return CAPACITY[(u, v)] - flow.get((u, v), 0)


def push_flow(flow, path, amount):
    for u, v in zip(path, path[1:]):
        if (u, v) in CAPACITY:
            flow[(u, v)] = flow.get((u, v), 0) + amount
        else:
            flow[(v, u)] = flow.get((v, u), 0) - amount  # crossing the reverse residual edge


def bottleneck(flow, path):
    return min(residual_capacity(flow, u, v) for u, v in zip(path, path[1:]))


def run_paths(paths):
    """Push each given path's own bottleneck amount in order, returning the flow
    dict and the running total after each augmentation.
    """
    flow = {}
    totals = []
    for path in paths:
        f = bottleneck(flow, path)
        assert f > 0, f"path {path} is not augmenting"
        push_flow(flow, path, f)
        totals.append((path, f, sum(flow.get((SOURCE, v), 0) for v in ADJ[SOURCE])
                       - sum(flow.get((v, SOURCE), 0) for v in ADJ[SOURCE])))
    return flow, totals


def flow_value(flow):
    out_s = sum(flow.get((SOURCE, v), 0) for v in ADJ[SOURCE])
    in_s = sum(flow.get((v, SOURCE), 0) for v in ADJ[SOURCE])
    return out_s - in_s


def check_conservation(flow):
    for v in VERTICES:
        if v in (SOURCE, SINK):
            continue
        inflow = sum(flow.get((u, v), 0) for u in VERTICES if (u, v) in CAPACITY)
        outflow = sum(flow.get((v, w), 0) for w in VERTICES if (v, w) in CAPACITY)
        assert inflow == outflow, (v, inflow, outflow)


def bfs_augmenting_path(flow, forward_only=False):
    """Any breadth-first search in the residual graph; forward_only=True restricts
    it to the naive no-undo view (real edges with spare capacity, never a backward
    residual edge), used to show the stuck run has no path left under that view.
    """
    rescap = forward_residual_only if forward_only else residual_capacity
    parent = {SOURCE: None}
    queue = deque([SOURCE])
    while queue:
        u = queue.popleft()
        if u == SINK:
            break
        for v in ADJ[u]:
            if v not in parent and rescap(flow, u, v) > 0:
                parent[v] = u
                queue.append(v)
    if SINK not in parent:
        return None
    path = [SINK]
    while path[-1] != SOURCE:
        path.append(parent[path[-1]])
    return list(reversed(path))


def min_cut_from_flow(flow):
    """The set S reachable from the source in the residual graph of a maximum flow."""
    S = {SOURCE}
    queue = deque([SOURCE])
    while queue:
        u = queue.popleft()
        for v in ADJ[u]:
            if v not in S and residual_capacity(flow, u, v) > 0:
                S.add(v)
                queue.append(v)
    T = set(VERTICES) - S
    cut_capacity = sum(c for (u, v), c in CAPACITY.items() if u in S and v in T)
    return S, T, cut_capacity


# ---------------------------------------------------------------------------
# The stuck greedy: CHAPTER.md's own four paths, a flow of 7 with no forward
# path left, but a residual-graph-aware search still finds a fifth path.
# ---------------------------------------------------------------------------

STUCK_PATHS = [
    ["A", "B", "D", "E", "F"],  # bottleneck 2
    ["A", "C", "E", "F"],       # bottleneck 1
    ["A", "C", "D", "F"],       # bottleneck 1
    ["A", "B", "D", "F"],       # bottleneck 3
]
stuck_flow, stuck_totals = run_paths(STUCK_PATHS)
check_conservation(stuck_flow)
assert [t for _, _, t in stuck_totals] == [2, 3, 4, 7]
assert flow_value(stuck_flow) == 7

# no purely-forward path remains: the naive, no-undo view really is stuck
assert bfs_augmenting_path(stuck_flow, forward_only=True) is None

# but the full residual graph still has a path, because 2 units pushed through
# D->E leave a backward residual edge E->D worth 2
rescue_path = bfs_augmenting_path(stuck_flow)
assert rescue_path == ["A", "B", "C", "E", "D", "F"]
rescue_residuals = [residual_capacity(stuck_flow, u, v) for u, v in zip(rescue_path, rescue_path[1:])]
assert rescue_residuals == [6, 3, 5, 2, 4]
assert bottleneck(stuck_flow, rescue_path) == 2
push_flow(stuck_flow, rescue_path, 2)
check_conservation(stuck_flow)
assert flow_value(stuck_flow) == 9
assert bfs_augmenting_path(stuck_flow) is None, "nine should be the true maximum"

# ---------------------------------------------------------------------------
# A good run: CHAPTER.md's own five-augmentation order reaching the same
# maximum directly, 2, 3, 4, 8, 9, the last crossing D->E in reverse.
# ---------------------------------------------------------------------------

GOOD_PATHS = [
    ["A", "C", "E", "F"],            # bottleneck 2
    ["A", "B", "D", "E", "F"],       # bottleneck 1
    ["A", "B", "C", "D", "F"],       # bottleneck 1
    ["A", "B", "D", "F"],            # bottleneck 4
    ["A", "B", "C", "E", "D", "F"],  # bottleneck 1, crosses D->E in reverse
]
good_flow, good_totals = run_paths(GOOD_PATHS)
check_conservation(good_flow)
assert [t for _, _, t in good_totals] == [2, 3, 4, 8, 9]
assert len(good_totals) == 5
assert flow_value(good_flow) == 9
assert bfs_augmenting_path(good_flow) is None

last_path, last_amount, _ = good_totals[-1]
assert ("E", "D") in list(zip(last_path, last_path[1:])), "the last augmentation must undo D->E"
assert good_flow[("D", "E")] == 0, "the undo should fully cancel the earlier D->E flow"

S, T, cut_capacity = min_cut_from_flow(good_flow)
assert S == {"A", "B", "C", "E"}
assert T == {"D", "F"}
assert cut_capacity == 9
assert cut_capacity == flow_value(good_flow), "max flow must equal min cut capacity"

# ---------------------------------------------------------------------------
# Cross-check: SciPy's own documented example (credited there to CLRS 2nd ed.,
# Ch. 26.1), independent of this chapter's own running example.
# ---------------------------------------------------------------------------

CLRS_VERTICES = [0, 1, 2, 3, 4, 5]
CLRS_MATRIX = [
    [0, 16, 13, 0, 0, 0],
    [0, 0, 10, 12, 0, 0],
    [0, 4, 0, 0, 14, 0],
    [0, 0, 9, 0, 0, 20],
    [0, 0, 0, 7, 0, 4],
    [0, 0, 0, 0, 0, 0],
]
CLRS_CAPACITY = {
    (i, j): CLRS_MATRIX[i][j]
    for i in CLRS_VERTICES
    for j in CLRS_VERTICES
    if CLRS_MATRIX[i][j] > 0
}


def clrs_adj(capacity):
    adj = {v: set() for v in CLRS_VERTICES}
    for (u, v) in capacity:
        adj[u].add(v)
        adj[v].add(u)
    return adj


def clrs_max_flow():
    adj = clrs_adj(CLRS_CAPACITY)
    flow = {}

    def rescap(u, v):
        return CLRS_CAPACITY.get((u, v), 0) - flow.get((u, v), 0) + flow.get((v, u), 0)

    def bfs_path():
        parent = {0: None}
        queue = deque([0])
        while queue:
            u = queue.popleft()
            if u == 5:
                break
            for v in adj[u]:
                if v not in parent and rescap(u, v) > 0:
                    parent[v] = u
                    queue.append(v)
        if 5 not in parent:
            return None
        path = [5]
        while path[-1] != 0:
            path.append(parent[path[-1]])
        return list(reversed(path))

    while True:
        path = bfs_path()
        if path is None:
            break
        f = min(rescap(u, v) for u, v in zip(path, path[1:]))
        for u, v in zip(path, path[1:]):
            if (u, v) in CLRS_CAPACITY:
                flow[(u, v)] = flow.get((u, v), 0) + f
            else:
                flow[(v, u)] = flow.get((v, u), 0) - f
    out_0 = sum(flow.get((0, v), 0) for v in adj[0])
    in_0 = sum(flow.get((v, 0), 0) for v in adj[0])
    return out_0 - in_0


assert clrs_max_flow() == 23

# ---------------------------------------------------------------------------
# Edmonds and Karp's own pathological network (Erickson's figure), scaled down
# so this script stays fast: the max flow is 2X, but an arbitrary-path
# Ford-Fulkerson can alternate between two 1-unit augmentations 2X times,
# while the shortest-augmenting-path (breadth-first) rule reaches 2X in only
# 2 iterations. The chapter's own hook cites X = one million (2,000,000
# augmentations on a 20-bit network); this script uses a much smaller X that
# still shows the same qualitative gap, per the established "the hook's own
# scale is never the measurement's own scale" pattern.
# ---------------------------------------------------------------------------

X = 2000
EK_CAPACITY = {
    ("s", "u"): X,
    ("s", "v"): X,
    ("u", "v"): 1,
    ("u", "t"): X,
    ("v", "t"): X,
}
EK_VERTICES = ["s", "u", "v", "t"]
EK_ADJ = {vtx: set() for vtx in EK_VERTICES}
for (a, b) in EK_CAPACITY:
    EK_ADJ[a].add(b)
    EK_ADJ[b].add(a)


def ek_rescap(flow, a, b):
    return EK_CAPACITY.get((a, b), 0) - flow.get((a, b), 0) + flow.get((b, a), 0)


def ek_push(flow, path, amount):
    for a, b in zip(path, path[1:]):
        if (a, b) in EK_CAPACITY:
            flow[(a, b)] = flow.get((a, b), 0) + amount
        else:
            flow[(b, a)] = flow.get((b, a), 0) - amount


def ek_bad_run():
    """Alternates s-u-v-t and s-v-u-t, each pushing exactly 1 unit: a valid but
    worst-case choice of augmenting path at every step (raw Ford-Fulkerson's
    own rule allows any augmenting path, fast or slow).
    """
    flow = {}
    augmentations = 0
    toggle = True
    while True:
        path = ["s", "u", "v", "t"] if toggle else ["s", "v", "u", "t"]
        f = min(ek_rescap(flow, a, b) for a, b in zip(path, path[1:]))
        if f <= 0:
            break
        ek_push(flow, path, f)
        augmentations += 1
        toggle = not toggle
    out_s = sum(flow.get(("s", w), 0) for w in EK_ADJ["s"])
    return out_s, augmentations


def ek_good_run():
    """Edmonds and Karp's own shortest-augmenting-path rule: s-u-t and s-v-t
    directly, each saturating in one step, never touching the u-v edge at all.
    """
    flow = {}
    augmentations = 0
    while True:
        parent = {"s": None}
        queue = deque(["s"])
        while queue:
            a = queue.popleft()
            if a == "t":
                break
            for b in EK_ADJ[a]:
                if b not in parent and ek_rescap(flow, a, b) > 0:
                    parent[b] = a
                    queue.append(b)
        if "t" not in parent:
            break
        path = ["t"]
        while path[-1] != "s":
            path.append(parent[path[-1]])
        path = list(reversed(path))
        f = min(ek_rescap(flow, a, b) for a, b in zip(path, path[1:]))
        ek_push(flow, path, f)
        augmentations += 1
    out_s = sum(flow.get(("s", w), 0) for w in EK_ADJ["s"])
    return out_s, augmentations


bad_value, bad_augmentations = ek_bad_run()
good_value, good_augmentations_ek = ek_good_run()
assert bad_value == 2 * X
assert good_value == 2 * X
assert bad_augmentations == 2 * X, bad_augmentations
assert good_augmentations_ek == 2, good_augmentations_ek

print("All max-flow min-cut examples verified.")
print(f"Chapter network: stuck-at-greedy reaches 7 then rescues to {flow_value(stuck_flow)}; "
      f"the five-step good run reaches {flow_value(good_flow)}.")
print(f"Min cut: S={sorted(S)}, T={sorted(T)}, capacity={cut_capacity}.")
print(f"CLRS/SciPy cross-check max flow: {clrs_max_flow()}.")
print(f"Edmonds-Karp pathological network at X={X}: bad rule takes {bad_augmentations} "
      f"augmentations, shortest-path rule takes {good_augmentations_ek}.")
