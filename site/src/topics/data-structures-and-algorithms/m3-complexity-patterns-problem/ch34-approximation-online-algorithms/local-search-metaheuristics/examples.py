"""Local search and metaheuristics: every number this topic shows on screen, computed and
asserted here. Three searches (2-opt local search, simulated annealing, a genetic algorithm)
run on the same small travelling-salesman instance, checked against its true optimum found
by exact dynamic programming (the Held-Karp algorithm) over all subsets of the twelve points.
Then the real PostgreSQL numbers behind its genetic query optimiser (GEQO): the default
geqo_threshold, the twelve-table join-order count it triggers on, and the default
from_collapse_limit, all read from the PostgreSQL 18 documentation (see SOURCES.md)."""

import math
import random

# --- The travelling-salesman instance: twelve points in four loose clusters -------------

def make_points(seed, n):
    rng = random.Random(seed)
    centers = [(10, 10), (90, 10), (10, 90), (90, 90)]
    pts = []
    for i in range(n):
        cx, cy = centers[i % len(centers)]
        pts.append((cx + rng.uniform(-8, 8), cy + rng.uniform(-8, 8)))
    return pts


N = 12
POINTS = make_points(seed=3, n=N)


def dist(a, b):
    return math.hypot(POINTS[a][0] - POINTS[b][0], POINTS[a][1] - POINTS[b][1])


def tour_length(tour):
    return sum(dist(tour[i], tour[(i + 1) % len(tour)]) for i in range(len(tour)))


# --- The exact optimum: Held-Karp dynamic programming over all subsets ------------------

def exact_optimum(n):
    full = 1 << n
    dp = [[math.inf] * n for _ in range(full)]
    dp[1][0] = 0.0
    for mask in range(full):
        if not (mask & 1):
            continue
        for u in range(n):
            if not (mask & (1 << u)) or dp[mask][u] == math.inf:
                continue
            du = dp[mask][u]
            for v in range(n):
                if mask & (1 << v):
                    continue
                nmask = mask | (1 << v)
                nd = du + dist(u, v)
                if nd < dp[nmask][v]:
                    dp[nmask][v] = nd
    full_mask = full - 1
    return min(dp[full_mask][u] + dist(u, 0) for u in range(1, n))


OPT = exact_optimum(N)
assert round(OPT, 2) == 344.19, OPT

# --- 2-opt: remove two edges, reconnect reversing the segment between them --------------

def two_opt(tour):
    tour = tour[:]
    n = len(tour)
    improved = True
    while improved:
        improved = False
        for i in range(n - 1):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                a, b = tour[i], tour[i + 1]
                c, d = tour[j], tour[(j + 1) % n]
                if dist(a, b) + dist(c, d) > dist(a, c) + dist(b, d) + 1e-9:
                    tour[i + 1:j + 1] = reversed(tour[i + 1:j + 1])
                    improved = True
    return tour


def run_two_opt_trials(count, seed):
    rng = random.Random(seed)
    lengths = []
    for _ in range(count):
        tour = list(range(N))
        rng.shuffle(tour)
        local = two_opt(tour)
        lengths.append(tour_length(local))
    return lengths


TWO_OPT_LENGTHS = run_two_opt_trials(100, seed=11)
TWO_OPT_BEST = min(TWO_OPT_LENGTHS)
TWO_OPT_WORST = max(TWO_OPT_LENGTHS)
TWO_OPT_FRAC_OPTIMAL = sum(1 for L in TWO_OPT_LENGTHS if abs(L - OPT) < 1e-6) / len(TWO_OPT_LENGTHS)

assert round(TWO_OPT_BEST, 2) == round(OPT, 2)
assert TWO_OPT_WORST > OPT + 1.0
assert round(TWO_OPT_FRAC_OPTIMAL, 2) == 0.45

# --- Simulated annealing: accept a worse move with probability exp(-(e'-e)/T) -----------

def simulated_annealing(start_tour, t0, alpha, steps, rng):
    n = len(start_tour)
    current = start_tour[:]
    current_len = tour_length(current)
    best, best_len = current[:], current_len
    t = t0
    for _ in range(steps):
        i, j = sorted(rng.sample(range(n), 2))
        if j - i < 1:
            continue
        candidate = current[:]
        candidate[i:j + 1] = reversed(candidate[i:j + 1])
        candidate_len = tour_length(candidate)
        delta = candidate_len - current_len
        if delta < 0 or rng.random() < math.exp(-delta / t):
            current, current_len = candidate, candidate_len
            if current_len < best_len:
                best, best_len = current[:], current_len
        t *= alpha
    return best_len


def run_annealing_trials(count, seed):
    rng = random.Random(seed)
    lengths = []
    for _ in range(count):
        tour = list(range(N))
        rng.shuffle(tour)
        lengths.append(simulated_annealing(tour, t0=100.0, alpha=0.995, steps=2000, rng=rng))
    return lengths


ANNEALING_LENGTHS = run_annealing_trials(100, seed=21)
ANNEALING_FRAC_OPTIMAL = sum(1 for L in ANNEALING_LENGTHS if abs(L - OPT) < 1e-6) / len(ANNEALING_LENGTHS)
ANNEALING_MEAN = sum(ANNEALING_LENGTHS) / len(ANNEALING_LENGTHS)
TWO_OPT_MEAN = sum(TWO_OPT_LENGTHS) / len(TWO_OPT_LENGTHS)

assert round(ANNEALING_FRAC_OPTIMAL, 2) == 0.97
assert ANNEALING_MEAN < TWO_OPT_MEAN

# --- A genetic algorithm: population, order crossover, swap mutation --------------------

def order_crossover(parent_a, parent_b, rng):
    n = len(parent_a)
    lo, hi = sorted(rng.sample(range(n), 2))
    child = [None] * n
    child[lo:hi + 1] = parent_a[lo:hi + 1]
    fill = [gene for gene in parent_b if gene not in child[lo:hi + 1]]
    idx = 0
    for i in range(n):
        if child[i] is None:
            child[i] = fill[idx]
            idx += 1
    return child


def genetic_algorithm(n, pop_size, generations, mutation_rate, rng):
    population = []
    for _ in range(pop_size):
        tour = list(range(n))
        rng.shuffle(tour)
        population.append(tour)
    best_len = math.inf
    for _ in range(generations):
        fitness = [tour_length(t) for t in population]
        gen_best = min(fitness)
        if gen_best < best_len:
            best_len = gen_best
        next_gen = []
        while len(next_gen) < pop_size:
            i1, i2, i3 = rng.sample(range(pop_size), 3)
            parent_a = population[i1] if fitness[i1] < fitness[i2] else population[i2]
            i4, i5, i6 = rng.sample(range(pop_size), 3)
            parent_b = population[i4] if fitness[i4] < fitness[i5] else population[i5]
            child = order_crossover(parent_a, parent_b, rng)
            if rng.random() < mutation_rate:
                a, b = rng.sample(range(n), 2)
                child[a], child[b] = child[b], child[a]
            next_gen.append(child)
        population = next_gen
    return best_len


def run_genetic_trials(count, seed):
    rng = random.Random(seed)
    lengths = []
    for _ in range(count):
        lengths.append(genetic_algorithm(N, pop_size=50, generations=100, mutation_rate=0.1, rng=rng))
    return lengths


GENETIC_LENGTHS = run_genetic_trials(100, seed=31)
GENETIC_FRAC_OPTIMAL = sum(1 for L in GENETIC_LENGTHS if abs(L - OPT) < 1e-6) / len(GENETIC_LENGTHS)
GENETIC_WORST = max(GENETIC_LENGTHS)
GENETIC_MEAN = sum(GENETIC_LENGTHS) / len(GENETIC_LENGTHS)

assert round(GENETIC_FRAC_OPTIMAL, 2) == 0.43
assert GENETIC_MEAN > TWO_OPT_MEAN
assert GENETIC_WORST > TWO_OPT_WORST

# Simulated annealing (97% optimal, lower mean) beats both plain 2-opt (45% optimal) and
# this genetic algorithm (43% optimal, worse mean and worse worst case) on this instance.
# That ranking is a fact about this instance and this genetic algorithm's own settings, not
# a general law: the topic states the measured ranking and does not claim annealing always
# wins, matching PostgreSQL's own documented caveat that its genetic planner's quality is
# settings-dependent.

# --- The real PostgreSQL numbers behind GEQO --------------------------------------------

GEQO_THRESHOLD = 12
FROM_COLLAPSE_LIMIT = 8
TWELVE_TABLE_LEFT_DEEP_ORDERS = math.factorial(GEQO_THRESHOLD)

assert TWELVE_TABLE_LEFT_DEEP_ORDERS == 479_001_600

if __name__ == "__main__":
    print(f"exact optimum tour length: {OPT:.2f}")
    print(f"2-opt over 100 random starts: best {TWO_OPT_BEST:.2f}, worst {TWO_OPT_WORST:.2f}, "
          f"mean {TWO_OPT_MEAN:.2f}, fraction optimal {TWO_OPT_FRAC_OPTIMAL:.0%}")
    print(f"simulated annealing over 100 runs: mean {ANNEALING_MEAN:.2f}, "
          f"fraction optimal {ANNEALING_FRAC_OPTIMAL:.0%}")
    print(f"genetic algorithm over 100 runs: mean {GENETIC_MEAN:.2f}, worst {GENETIC_WORST:.2f}, "
          f"fraction optimal {GENETIC_FRAC_OPTIMAL:.0%}")
    print(f"geqo_threshold default: {GEQO_THRESHOLD}, "
          f"left-deep join orders at that size: {TWELVE_TABLE_LEFT_DEEP_ORDERS:,}")
    print(f"from_collapse_limit default: {FROM_COLLAPSE_LIMIT}")
    print("All assertions passed.")
