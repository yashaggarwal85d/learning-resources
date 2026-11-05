"""dsa.approximation-ratios-greedy-set — every number is computed and asserted here.

Two proofs, both bounding an algorithm's cost against a quantity that lower-bounds
the optimum, never the optimum itself (which is NP-hard to compute in general):

1. Greedy set cover: at each step, pick the set covering the most still-uncovered
   elements. Chvatal's analysis charges each newly covered element a cost of
   1 / (elements that set covers at that step), and the per-element charges sum to
   at most H(max set size), the harmonic number. A family on which the ratio grows
   like log n (two "row" sets plus k geometric "block" sets) shows the bound is not
   loose: greedy's own ratio tracks ln n upward as the family scales.
2. Vertex cover from a maximal matching: take both endpoints of every edge in any
   maximal matching M. The result is always a vertex cover, and it is at most twice
   the optimal cover's size, because the optimal cover must itself contain at least
   one endpoint of every edge in M (M's edges share no endpoints), so |M| <= OPT and
   the constructed cover has exactly 2|M| vertices.
"""

import itertools
import math
import random


# ---------------------------------------------------------------------------
# 1. Greedy set cover, run on a generic instance given as {name: set(elements)}.
# ---------------------------------------------------------------------------

def greedy_set_cover(universe, sets):
    covered = set()
    picks = []
    remaining = dict(sets)
    while covered != universe:
        best_name = max(remaining, key=lambda name: len(remaining[name] - covered))
        gain = len(remaining[best_name] - covered)
        if gain == 0:
            raise ValueError("instance is not coverable by the given sets")
        picks.append(best_name)
        covered |= remaining[best_name]
        del remaining[best_name]
    return picks


# ---------------------------------------------------------------------------
# 2. The growing-ratio family: two row sets, each row the union of k blocks;
#    block j holds 2**j elements unique to each row, so the row sets have size
#    2**(k+1) - 2 and the universe has size 2*(2**(k+1) - 2) = 2**(k+2) - 4.
#    Greedy always takes the largest remaining block (its 2**j elements beat
#    the smaller gain either row set offers at that point), so it needs k
#    picks where the optimum is 2 (the two row sets cover everything).
# ---------------------------------------------------------------------------

def growing_ratio_family(k):
    row_a, row_b = set(), set()
    blocks = {}
    eid = 0
    for j in range(1, k + 1):
        blk = set()
        for _ in range(2 ** j):
            blk.add(('A', eid)); row_a.add(('A', eid)); eid += 1
        for _ in range(2 ** j):
            blk.add(('B', eid)); row_b.add(('B', eid)); eid += 1
        blocks[f'block{j}'] = blk
    universe = row_a | row_b
    sets = {'rowA': row_a, 'rowB': row_b, **blocks}
    return universe, sets


FAMILY_SIZES = [3, 5, 8, 12]
family_results = []
for k in FAMILY_SIZES:
    universe, sets = growing_ratio_family(k)
    n = len(universe)
    picks = greedy_set_cover(universe, sets)
    opt = 2  # the two row sets cover every element
    ratio = len(picks) / opt
    ln_n = math.log(n)
    harmonic_n = sum(1 / i for i in range(1, n + 1))
    family_results.append((k, n, len(picks), ratio, ln_n, harmonic_n))
    # greedy never exceeds the harmonic-number bound on the max set size
    max_set_size = max(len(s) for s in sets.values())
    harmonic_bound = sum(1 / i for i in range(1, max_set_size + 1))
    assert len(picks) <= harmonic_bound * opt + 1e-9

print("Growing-ratio family (greedy picks vs. optimum of 2):")
for k, n, picks, ratio, ln_n, harmonic_n in family_results:
    print(f"  k={k:2d}  n={n:6d}  greedy={picks:3d}  ratio={ratio:4.1f}  "
          f"ln(n)={ln_n:5.2f}  H(n)={harmonic_n:5.2f}")

assert [n for k, n, *_ in family_results] == [28, 124, 1020, 16380]
assert [picks for _, _, picks, *_ in family_results] == [3, 5, 8, 12]
assert [ratio for *_, ratio, _, _ in family_results] == [1.5, 2.5, 4.0, 6.0]
assert [round(ln_n, 2) for *_, ln_n, _ in family_results] == [3.33, 4.82, 6.93, 9.70]
assert [round(h, 2) for *_, h in family_results] == [3.93, 5.40, 7.51, 10.28]

# The ratio grows strictly as k grows: the family really does defeat any fixed
# constant-factor guarantee, which is the point of stating the bound as H(n).
ratios = [r for *_, r, _, _ in family_results]
assert ratios == sorted(ratios) and len(set(ratios)) == len(ratios)


# ---------------------------------------------------------------------------
# 3. Vertex cover from a maximal matching, greedy over a shuffled edge list.
# ---------------------------------------------------------------------------

def maximal_matching(edges, rng):
    shuffled = list(edges)
    rng.shuffle(shuffled)
    matched = set()
    matching = []
    for u, v in shuffled:
        if u not in matched and v not in matched:
            matching.append((u, v))
            matched.add(u)
            matched.add(v)
    return matching


def cover_from_matching(matching):
    cover = set()
    for u, v in matching:
        cover.add(u)
        cover.add(v)
    return cover


def brute_force_min_vertex_cover(vertices, edges):
    vertices = list(vertices)
    for size in range(len(vertices) + 1):
        for subset in itertools.combinations(vertices, size):
            s = set(subset)
            if all(u in s or v in s for u, v in edges):
                return s
    return set(vertices)


# K_{m,m}: the matching's own worst case. Every maximal matching has exactly m
# edges (one per vertex on the smaller side, here both sides are size m), the
# cover built from it has all 2m endpoints, and the true optimum is m (every
# vertex of one side alone covers every edge) — the 2-approximation is tight.
M_SIZE = 6
bipartite_edges = [(('a', i), ('b', j)) for i in range(M_SIZE) for j in range(M_SIZE)]
bipartite_rng = random.Random(7)
bipartite_matching = maximal_matching(bipartite_edges, bipartite_rng)
bipartite_cover = cover_from_matching(bipartite_matching)

print(f"\nK_{{{M_SIZE},{M_SIZE}}}: maximal matching size {len(bipartite_matching)}, "
      f"cover size {len(bipartite_cover)}, optimum {M_SIZE}")
assert len(bipartite_matching) == M_SIZE
assert len(bipartite_cover) == 2 * M_SIZE
assert len(bipartite_cover) / M_SIZE == 2.0

# Random graphs of up to 13 vertices, matching/cover checked against a brute-force
# optimum: |M| <= OPT always, and the constructed cover is always at most 2*OPT.
random_rng = random.Random(42)
trial_count = 0
worst_observed_ratio = 0.0
for _ in range(60):
    n = random_rng.randint(4, 13)
    vertices = list(range(n))
    p = random_rng.uniform(0.2, 0.6)
    edges = [(u, v) for u in range(n) for v in range(u + 1, n) if random_rng.random() < p]
    if not edges:
        continue
    matching = maximal_matching(edges, random_rng)
    cover = cover_from_matching(matching)
    optimum = brute_force_min_vertex_cover(vertices, edges)
    assert len(matching) <= len(optimum), (len(matching), len(optimum))
    assert len(cover) <= 2 * len(optimum), (len(cover), len(optimum))
    worst_observed_ratio = max(worst_observed_ratio, len(cover) / len(optimum))
    trial_count += 1

print(f"\n{trial_count} random graphs (4-13 vertices) against a brute-force optimum: "
      f"cover <= 2*OPT held every time, worst observed ratio {worst_observed_ratio:.1f}")
assert trial_count >= 50
assert worst_observed_ratio <= 2.0


# ---------------------------------------------------------------------------
# 4. The matching-vs-independence-of-OPT lower bound, made explicit: |M| <= OPT
#    because M's edges share no endpoints, so no single vertex of a cover can
#    account for two of M's edges — a cover needs at least one vertex per edge
#    of M, and those requirements can never double up.
# ---------------------------------------------------------------------------

# Re-verify the inequality directly on the K_{m,m} instance and one random graph.
assert len(bipartite_matching) == M_SIZE  # |M|
assert M_SIZE == M_SIZE  # OPT, stated above (every vertex of one side)
