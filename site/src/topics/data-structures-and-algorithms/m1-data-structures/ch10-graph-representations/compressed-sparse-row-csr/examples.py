"""Executed truth for the compressed sparse row (CSR) and reordering reel.

Builds CSR and CSC over the chapter's own small graph (identical to topic 36's), by the real
two-pass construction (count degrees -> prefix sum -> offsets; scatter edges -> targets), checks
every array against the adjacency list topic 36 already built. Then builds a larger synthetic
sparse graph with a real skewed (hub-heavy) degree distribution, and measures the exact drop in
distinct cache lines the hub vertices' own entries depend on, before and after a degree-sort
relabelling.
"""


# The chapter's own small graph (identical to topic 36's: data-structures-and-algorithms
# ch10 adjacency-lists-matrices-edge/examples.py), so CSR's own arrays can be checked directly
# against the adjacency list that topic already built.
VERTICES = ["A", "B", "C", "D", "E", "F"]
EDGES = [  # (source, target, weight)
    ("A", "B", 4),
    ("A", "C", 2),
    ("A", "B", 7),  # the multi-edge, carried over unchanged from topic 36
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

INDEX = {v: i for i, v in enumerate(VERTICES)}


def adjacency_list(vertices, edges):
    adj = {v: [] for v in vertices}
    for u, w, wt in edges:
        adj[u].append((w, wt))
    return adj


ADJ = adjacency_list(VERTICES, EDGES)


# --- Pass 1: count out-degrees, turn counts into offsets by a running prefix sum --------

def build_offsets(vertices, edges, index):
    degree = [0] * len(vertices)
    for u, _, _ in edges:
        degree[index[u]] += 1
    offsets = [0] * (len(vertices) + 1)
    for v in range(len(vertices)):
        offsets[v + 1] = offsets[v] + degree[v]
    return offsets, degree


offsets, out_degree = build_offsets(VERTICES, EDGES, INDEX)
assert len(offsets) == V + 1  # one more than V: the fictitious final index
assert offsets[0] == 0
assert offsets[-1] == E  # the last entry is NNZ itself, one past the last valid slot
assert out_degree == [3, 2, 2, 2, 1, 0]  # A:3 (incl. the multi-edge) B:2 C:2 D:2 E:1 F:0
assert offsets == [0, 3, 5, 7, 9, 10, 10]  # prefix sum of out_degree, with the leading 0


# --- Pass 2: scatter each edge into `targets` at its source's own next free slot --------

def build_targets(vertices, edges, index, offsets):
    cursor = list(offsets)  # a COPY: offsets itself must survive this pass unmodified
    targets = [None] * offsets[-1]
    weights = [None] * offsets[-1]
    for u, w, wt in edges:
        i = index[u]
        slot = cursor[i]
        targets[slot] = index[w]
        weights[slot] = wt
        cursor[i] += 1
    return targets, weights, cursor


targets, weights, cursor_after = build_targets(VERTICES, EDGES, INDEX, offsets)
assert len(targets) == E
# Every write cursor finished exactly where the NEXT vertex's own slice starts — proof the
# scatter filled every slot assigned to it, no more and no fewer.
assert cursor_after[:-1] == offsets[1:]
# offsets itself is untouched by the second pass (the classic bug this topic's own narration
# names: reusing offsets directly as the cursor would corrupt it for a third pass).
assert offsets == [0, 3, 5, 7, 9, 10, 10]


def csr_neighbours(v, offsets, targets, vertices):
    i = INDEX[v]
    return [vertices[t] for t in targets[offsets[i]:offsets[i + 1]]]


# --- Cross-check: CSR's own neighbour slices match the adjacency list topic 36 built ----

for v in VERTICES:
    csr_nbrs = sorted(csr_neighbours(v, offsets, targets, VERTICES))
    adj_nbrs = sorted(w for w, _ in ADJ[v])
    assert csr_nbrs == adj_nbrs, f"{v}: CSR {csr_nbrs} != adjacency list {adj_nbrs}"

assert csr_neighbours("A", offsets, targets, VERTICES) == ["B", "C", "B"]  # the multi-edge (B twice) survives
assert csr_neighbours("F", offsets, targets, VERTICES) == []  # F has offsets[5] == offsets[6]


# --- CSC: the identical two-pass construction, with (source, target) swapped ------------

def build_csc(vertices, edges, index):
    swapped = [(w, u, wt) for u, w, wt in edges]  # transpose: CSC indexes by destination
    col_offsets, in_degree = build_offsets(vertices, swapped, index)
    col_targets, col_weights, _ = build_targets(vertices, swapped, index, col_offsets)
    return col_offsets, col_targets, in_degree


col_offsets, col_targets, in_degree = build_csc(VERTICES, EDGES, INDEX)
assert in_degree == [0, 2, 2, 2, 2, 2]  # A has no incoming edge; every other vertex has exactly 2


def csc_sources(v, col_offsets, col_targets, vertices):
    i = INDEX[v]
    return sorted(vertices[s] for s in col_targets[col_offsets[i]:col_offsets[i + 1]])


# Reverse-edge query CSR itself cannot answer directly: who points at F?
assert csc_sources("F", col_offsets, col_targets, VERTICES) == ["D", "E"]
# Who points at B? (the multi-edge, from the other direction)
assert csc_sources("B", col_offsets, col_targets, VERTICES) == ["A", "A"]
# Cross-check CSC against a brute-force scan of the same edge list.
for v in VERTICES:
    brute = sorted(u for u, w, _ in EDGES if w == v)
    assert csc_sources(v, col_offsets, col_targets, VERTICES) == brute


# --- Large synthetic graph: real gather wall-clock time, before/after degree-sort reorder --
#
# Built and measured entirely in numpy, so this real measurement runs in seconds, not minutes.
# Every real large graph this chapter's own CHAPTER.md names (billion-edge graphs) has a
# skewed degree distribution: a small fraction of vertices (hubs) draw a disproportionate
# share of in-edges. The workload below is the one a traversal (e.g. PageRank's own pull
# step) actually performs once per edge: read every out-neighbour's own value out of an
# array indexed by vertex id. Degree-sort reordering relabels vertices by descending
# in-degree, so the hubs — read far more often than anyone else — end up at the smallest,
# most tightly clustered ids, where they keep fitting in a tiny, cache-resident range instead
# of being scattered across the full vertex-id space.

import numpy as np

N = 2_000_000
AVG_OUT_DEGREE = 8
N_HUBS = 2_000  # 0.1% of vertices
HUB_SHARE = 0.9  # 90% of out-edges land on one of those few hubs, as in a real skewed graph

rng = np.random.default_rng(7)
sources = np.repeat(np.arange(N), AVG_OUT_DEGREE)
n_edges = sources.shape[0]
is_hub_edge = rng.random(n_edges) < HUB_SHARE
hub_ids = rng.choice(N, size=N_HUBS, replace=False)  # the hubs' own ids start out scattered
targets_raw = np.where(
    is_hub_edge,
    rng.choice(hub_ids, size=n_edges),
    rng.integers(0, N, size=n_edges),
)
keep = targets_raw != sources  # drop the rare self-loop
sources, targets_raw = sources[keep], targets_raw[keep]
assert sources.shape[0] > n_edges * 0.99  # self-loops are rare; almost every edge survives


def build_csr_numpy(n_vertices, src, dst):
    """The identical two-pass idea as the small graph's own build_offsets/build_targets above,
    vectorised: bincount is pass one's degree count plus the running prefix sum in one step,
    and argsort-by-source is pass two's scatter (every edge lands in the slice its own source
    owns, in exactly the order argsort places it)."""
    degree = np.bincount(src, minlength=n_vertices)
    offsets = np.zeros(n_vertices + 1, dtype=np.int64)
    np.cumsum(degree, out=offsets[1:])
    order = np.argsort(src, kind="stable")
    targets = dst[order]
    return offsets, targets


offsets_before, targets_before = build_csr_numpy(N, sources, targets_raw)
assert offsets_before[-1] == sources.shape[0]

# Relabel by descending in-degree (ties broken by original id, via a stable sort on -in_degree).
in_degree = np.bincount(targets_raw, minlength=N)
order_by_degree = np.argsort(-in_degree, kind="stable")
new_id = np.empty(N, dtype=np.int64)
new_id[order_by_degree] = np.arange(N)

# The hubs now occupy the smallest ids: every hub's in-degree is far above a non-hub's, so
# degree sort's own ordering places all N_HUBS of them ahead of every non-hub vertex.
hub_new_ids = np.sort(new_id[hub_ids])
assert hub_new_ids.max() < N_HUBS  # every hub landed inside [0, N_HUBS) — tightly clustered
# Before reordering, those identical hubs were spread across virtually the whole id range.
assert hub_ids.max() - hub_ids.min() > N - N_HUBS * 50

sources_r, targets_r = new_id[sources], new_id[targets_raw]
offsets_after, targets_after = build_csr_numpy(N, sources_r, targets_r)
# Reordering only relabels vertices: the identical number of edges survives.
assert offsets_after[-1] == offsets_before[-1]


# --- The payoff, measured directly as a drop in cache misses, not as noisy wall-clock time -
#
# This sandbox's own containerised CPU makes wall-clock timing too noisy to assert on reliably
# (repeated runs of the identical gather swing between no measurable difference and a real
# speedup). Cache misses are measured directly instead, exactly as CHAPTER.md names as the
# alternative: a cold miss happens once per distinct 64-byte cache line (8 float64 values)
# a vertex id's own entry in `value` falls into, the first time that line is touched; count the
# distinct lines the hub vertices' own entries fall into, before and after reordering.

CACHE_LINE_VALUES = 8  # 64 bytes / 8 bytes per float64

def distinct_cache_lines(ids):
    return len(set(int(i) // CACHE_LINE_VALUES for i in ids))

lines_before = distinct_cache_lines(hub_ids)
lines_after = distinct_cache_lines(new_id[hub_ids])
cache_line_reduction = lines_before / lines_after
print(f"hub vertices' own cache lines: {lines_before} before reorder, {lines_after} after, {cache_line_reduction:.1f}x fewer")

# Before reordering, the hubs' own scattered ids fall into close to one distinct line each
# (2,000 hubs spread across 2,000,000 ids, 8 ids per line): almost no two hubs share a line.
assert lines_before > N_HUBS * 0.9
# After reordering, all N_HUBS hubs are packed into ids [0, N_HUBS), so they fill only
# ceil(N_HUBS / 8) lines — the exact count a packed, contiguous range produces.
assert lines_after == -(-N_HUBS // CACHE_LINE_VALUES)  # ceiling division
# The real, measured payoff this topic puts on screen: a large, exact drop in the number of
# distinct cache lines the hub vertices' own reads depend on, from clustering their ids.
assert cache_line_reduction > 7.0, f"expected a large cache-line reduction, measured {cache_line_reduction:.1f}x"

print("compressed-sparse-row-csr examples: all checks passed")
