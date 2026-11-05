"""
dsa.bellman-ford-negative-cycles -- every number this topic puts on screen, computed or
asserted here. Bellman-Ford's own |V|-1 relaxation-round bound, confirmed to need every one
of those rounds on a graph built to delay convergence to the last round; negative-cycle
detection and extraction on a currency-arbitrage-shaped graph (this topic's own worked
example, built from the general negative-cycle mechanism Wikipedia's "Bellman-Ford algorithm"
article documents); the queue-based SPFA variant measured against plain Bellman-Ford, plus
an adversarial graph where SPFA's own relaxation count degrades back toward Bellman-Ford's.
"""

import math
from collections import deque


def bellman_ford(adj, n, source):
    # adj: {u: [(v, w), ...]}. Runs exactly n - 1 relaxation rounds, then one more to check
    # for a negative cycle. Returns (dist, rounds_until_no_change, has_negative_cycle).
    dist = [math.inf] * n
    dist[source] = 0
    edges = [(u, v, w) for u in adj for v, w in adj[u]]
    rounds_until_stable = None
    for round_i in range(1, n):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed and rounds_until_stable is None:
            rounds_until_stable = round_i
            break
    has_negative_cycle = False
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            has_negative_cycle = True
            break
    return dist, (rounds_until_stable if rounds_until_stable is not None else n - 1), has_negative_cycle


def brute_force_shortest_paths(adj, n, source):
    dist = [math.inf] * n
    dist[source] = 0
    for _ in range(n):
        for u in adj:
            for v, w in adj[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
    return dist


# A chain 0 -> 1 -> 2 -> 3 -> 4, each edge weight -1, source 0. The dict's own key order
# (3, 2, 1, 0, 4) makes the edge list visit each edge one step "ahead of" the vertex that
# can actually use it that round, so the correct distances only stabilise on the final
# permitted round (n - 1 = 4), not earlier -- Wikipedia's own "worst order" case.
WORST_ORDER_ADJ = {
    3: [(4, -1)],
    2: [(3, -1)],
    1: [(2, -1)],
    0: [(1, -1)],
    4: [],
}
WORST_ORDER_N = 5
worst_dist, worst_rounds, worst_has_cycle = bellman_ford(WORST_ORDER_ADJ, WORST_ORDER_N, 0)
brute_worst = brute_force_shortest_paths(WORST_ORDER_ADJ, WORST_ORDER_N, 0)
assert worst_dist == brute_worst == [0, -1, -2, -3, -4], worst_dist
assert not worst_has_cycle
assert worst_rounds == WORST_ORDER_N - 1, worst_rounds


# ---------------------------------------------------------------------------
# Negative-cycle detection and extraction: a currency-arbitrage-shaped graph.
# Vertices are currencies; an edge u -> v with weight w = -log(exchange_rate(u, v)) means
# converting 1 unit of u buys exchange_rate(u, v) units of v. A cycle whose total weight is
# negative is exactly a cycle whose exchange rates multiply to more than 1 -- a profitable
# arbitrage loop, since summing -log(rate) around the cycle being negative means the sum of
# log(rate) is positive, i.e. the product of the rates exceeds 1.
# ---------------------------------------------------------------------------

RATES = {
    ('USD', 'EUR'): 0.90,
    ('EUR', 'GBP'): 0.86,
    ('GBP', 'USD'): 1.31,   # round trip USD -> EUR -> GBP -> USD multiplies to 1.0146 > 1: profitable
}
CURRENCIES = ['USD', 'EUR', 'GBP']
IDX = {c: i for i, c in enumerate(CURRENCIES)}
ARBITRAGE_ADJ = {i: [] for i in range(len(CURRENCIES))}
for (a, b), rate in RATES.items():
    ARBITRAGE_ADJ[IDX[a]].append((IDX[b], -math.log(rate)))

round_trip_rate = RATES[('USD', 'EUR')] * RATES[('EUR', 'GBP')] * RATES[('GBP', 'USD')]
assert round_trip_rate > 1.0, round_trip_rate  # a genuine profitable arbitrage loop


def bellman_ford_with_predecessors(adj, n, source):
    dist = [math.inf] * n
    dist[source] = 0
    pred = [None] * n
    edges = [(u, v, w) for u in adj for v, w in adj[u]]
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pred[v] = u
    cycle_vertex = None
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            pred[v] = u
            cycle_vertex = v
            break
    return dist, pred, cycle_vertex


def extract_cycle(pred, start):
    # Follow predecessors until a vertex repeats -- that repeat marks a vertex on the cycle.
    visited = set()
    v = start
    while v not in visited:
        visited.add(v)
        v = pred[v]
    cycle = [v]
    u = pred[v]
    while u != v:
        cycle.append(u)
        u = pred[u]
    cycle.reverse()
    return cycle


arb_dist, arb_pred, arb_cycle_vertex = bellman_ford_with_predecessors(ARBITRAGE_ADJ, len(CURRENCIES), IDX['USD'])
assert arb_cycle_vertex is not None, "the profitable round trip must show up as a detected negative cycle"
arb_cycle = extract_cycle(arb_pred, arb_cycle_vertex)
arb_cycle_currencies = {CURRENCIES[i] for i in arb_cycle}
assert arb_cycle_currencies == {'USD', 'EUR', 'GBP'}, arb_cycle_currencies


# ---------------------------------------------------------------------------
# SPFA: a queue-driven variant that only re-relaxes a vertex's outgoing edges when that
# vertex's own distance has just improved, measured against plain Bellman-Ford's relaxation
# count on the same graph, then on an adversarial graph built to hit SPFA's own worst case.
# ---------------------------------------------------------------------------

def bellman_ford_count_relaxations(adj, n, source):
    dist = [math.inf] * n
    dist[source] = 0
    edges = [(u, v, w) for u in adj for v, w in adj[u]]
    relaxations = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            relaxations += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    return dist, relaxations


def spfa(adj, n, source):
    dist = [math.inf] * n
    dist[source] = 0
    in_queue = [False] * n
    q = deque([source])
    in_queue[source] = True
    relaxations = 0
    while q:
        u = q.popleft()
        in_queue[u] = False
        for v, w in adj[u]:
            relaxations += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if not in_queue[v]:
                    q.append(v)
                    in_queue[v] = True
    return dist, relaxations


# A favourable graph: a wide "star" where most vertices settle in round one and never need
# re-relaxing, so SPFA should do far fewer relaxations than plain Bellman-Ford's full sweeps.
STAR_ADJ = {0: [(i, i) for i in range(1, 8)]}
for i in range(1, 8):
    STAR_ADJ[i] = []
STAR_N = 8

bf_star_dist, bf_star_relax = bellman_ford_count_relaxations(STAR_ADJ, STAR_N, 0)
spfa_star_dist, spfa_star_relax = spfa(STAR_ADJ, STAR_N, 0)
assert bf_star_dist == spfa_star_dist == brute_force_shortest_paths(STAR_ADJ, STAR_N, 0)
assert spfa_star_relax < bf_star_relax, (spfa_star_relax, bf_star_relax)

# An adversarial chain of "diamonds": at each stage, the current vertex c has a direct edge
# to the next vertex (weight -1, listed first, looking fine at first) and a two-hop detour
# through d (weight -5, then -5 again, totalling -10 -- strictly better). Because the direct
# edge is relaxed first, the next vertex gets queued and dequeued with the bad distance,
# relaxing its own children before the detour's correction ever arrives and re-queues it. The
# rework compounds stage over stage: each stage's vertex ends up relaxed twice as often as the
# one before it, so SPFA's own relaxation count grows faster than Bellman-Ford's, eventually
# overtaking it outright -- exactly the "worst case degrades back to O(V*E)" Wikipedia states,
# demonstrated directly rather than merely cited.
def build_spfa_adversary(stages):
    adj = {0: []}
    next_id = 1
    c_prev = 0
    for _ in range(stages):
        d_i, c_i = next_id, next_id + 1
        next_id += 2
        adj[d_i] = []
        adj[c_i] = []
        adj[c_prev].append((c_i, -1))   # bad direct edge, relaxed first
        adj[c_prev].append((d_i, -5))   # head start on the better detour
        adj[d_i].append((c_i, -5))      # completes the strictly shorter two-hop path
        c_prev = c_i
    return adj, next_id


ADVERSARY_STAGES = 6
adversary_adj, adversary_n = build_spfa_adversary(ADVERSARY_STAGES)
bf_adv_dist, bf_adv_relax = bellman_ford_count_relaxations(adversary_adj, adversary_n, 0)
spfa_adv_dist, spfa_adv_relax = spfa(adversary_adj, adversary_n, 0)
assert bf_adv_dist == spfa_adv_dist == brute_force_shortest_paths(adversary_adj, adversary_n, 0)
assert spfa_adv_relax > bf_adv_relax, (spfa_adv_relax, bf_adv_relax)


if __name__ == '__main__':
    print(f"Worst-order graph: distances {worst_dist}, stabilised after {worst_rounds} of {WORST_ORDER_N - 1} possible rounds")
    print(f"Currency-arbitrage graph: USD->EUR->GBP->USD round trip multiplies rates to {round_trip_rate:.4f}")
    print(f"Negative cycle detected, extracted as: {arb_cycle_currencies}")
    print(f"Star graph: Bellman-Ford {bf_star_relax} relaxations, SPFA {spfa_star_relax} relaxations")
    print(f"Adversarial diamond chain ({ADVERSARY_STAGES} stages): Bellman-Ford {bf_adv_relax} relaxations, SPFA {spfa_adv_relax} relaxations")
    print("bellman-ford-negative-cycles examples: all checks passed")
