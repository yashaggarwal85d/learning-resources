import math
import random


# --- The sum DAG: n = 16 numbers summed by a balanced binary tree of additions. ---
# Work T1 = number of internal (addition) nodes = n - 1. Span T-infinity = depth of the tree
# = log2(n). The same 15 additions, redrawn as a left-to-right chain, has span equal to work:
# nothing runs in parallel no matter how many workers are available.

N_LEAVES = 16
TREE_WORK = N_LEAVES - 1
TREE_SPAN = int(math.log2(N_LEAVES))
TREE_PARALLELISM = TREE_WORK / TREE_SPAN
assert TREE_WORK == 15
assert TREE_SPAN == 4
assert TREE_PARALLELISM == 3.75

CHAIN_WORK = N_LEAVES - 1
CHAIN_SPAN = N_LEAVES - 1
CHAIN_PARALLELISM = CHAIN_WORK / CHAIN_SPAN
assert CHAIN_WORK == 15
assert CHAIN_SPAN == 15
assert CHAIN_PARALLELISM == 1.0


def build_balanced_tree_dag(n_leaves):
    """Returns (nodes, children) for a full binary tree of additions over n_leaves values.
    Nodes 0..n_leaves-1 are leaves (no work). Nodes n_leaves.. are additions, each depending
    on exactly two earlier nodes. Returns the id of the root (final sum)."""
    assert n_leaves & (n_leaves - 1) == 0, "n_leaves must be a power of two"
    level = list(range(n_leaves))
    children = {i: () for i in level}
    next_id = n_leaves
    while len(level) > 1:
        new_level = []
        for i in range(0, len(level), 2):
            a, b = level[i], level[i + 1]
            children[next_id] = (a, b)
            new_level.append(next_id)
            next_id += 1
        level = new_level
    return children, level[0]


def greedy_schedule_steps(children, root, p):
    """Simulates a greedy schedule (never idle while a ready task exists) on p processors.
    Returns the number of time steps to finish every addition node."""
    done = {node for node, kids in children.items() if not kids}  # leaves are free from the start
    pending_children_count = {node: len(kids) for node, kids in children.items() if kids}
    remaining = set(pending_children_count)
    ready = [node for node in remaining if all(c in done for c in children[node])]
    steps = 0
    while remaining:
        steps += 1
        batch = ready[:p]
        ready = ready[p:]
        newly_done = []
        for node in batch:
            done.add(node)
            remaining.discard(node)
            newly_done.append(node)
        for node, kids in children.items():
            if node in remaining and node not in ready and all(c in done for c in kids):
                ready.append(node)
    return steps


TREE_CHILDREN, TREE_ROOT = build_balanced_tree_dag(N_LEAVES)

# Brent's bound, both forms the sources state, against the real greedy-scheduled step count.
PROCESSOR_COUNTS = (1, 2, 4, 8, 16)
BRENT_TABLE = {}
for p in PROCESSOR_COUNTS:
    sharp = TREE_SPAN + (TREE_WORK - TREE_SPAN) / p         # T-infinity + (T1 - T-infinity) / p
    loose = TREE_WORK / p + TREE_SPAN                        # T1 / p + T-infinity
    real_steps = greedy_schedule_steps(TREE_CHILDREN, TREE_ROOT, p)
    lower_bound = max(TREE_WORK / p, TREE_SPAN)
    assert real_steps <= sharp + 1e-9
    assert real_steps >= lower_bound - 1e-9
    BRENT_TABLE[p] = {"sharp": sharp, "loose": loose, "real": real_steps}

assert round(BRENT_TABLE[1]["sharp"], 2) == 15.0
assert round(BRENT_TABLE[2]["sharp"], 2) == 9.5
assert round(BRENT_TABLE[4]["sharp"], 2) == 6.75
assert round(BRENT_TABLE[8]["sharp"], 2) == 5.38 or round(BRENT_TABLE[8]["sharp"], 3) == 5.375
assert round(BRENT_TABLE[16]["sharp"], 2) == 4.69
assert round(BRENT_TABLE[1]["loose"], 2) == 19.0
assert round(BRENT_TABLE[2]["loose"], 2) == 11.5
assert round(BRENT_TABLE[4]["loose"], 2) == 7.75
assert round(BRENT_TABLE[8]["loose"], 3) == 5.875
assert round(BRENT_TABLE[16]["loose"], 2) == 4.94
assert BRENT_TABLE[1]["real"] == 15
assert BRENT_TABLE[16]["real"] == TREE_SPAN  # at full parallelism the span itself is reached


# --- A sort's span: parallel merge sort with a sequential merge. ---
# T-infinity(n) = T-infinity(n/2) + Theta(n) (the sequential merge dominates); work stays
# Theta(n log n) because each level still does Theta(n) total work across all its merges.
# Read off the recurrence (Chapter 1's own tool), not simulated as a node-level DAG: the merge
# cost is modelled as exactly n (one pass over the merged output).

def merge_sort_span(n):
    if n <= 1:
        return 0
    return merge_sort_span(n // 2) + n


def merge_sort_work(n):
    if n <= 1:
        return 0
    return 2 * merge_sort_work(n // 2) + n


SORT_SIZES = [2 ** k for k in range(1, 17)]  # up to n = 65536
SORT_SPANS = {n: merge_sort_span(n) for n in SORT_SIZES}
SORT_WORKS = {n: merge_sort_work(n) for n in SORT_SIZES}

# Span grows linearly in n (doubling n roughly doubles the span, the signature of Theta(n),
# not Theta(n log n), which would more than double): check the ratio converges to 2.
span_doubling_ratios = [SORT_SPANS[SORT_SIZES[i + 1]] / SORT_SPANS[SORT_SIZES[i]] for i in range(len(SORT_SIZES) - 1)]
assert all(abs(r - 2.0) < 0.01 for r in span_doubling_ratios[-5:])

# Work grows faster than linearly: the doubling ratio exceeds 2 and keeps growing slowly,
# the signature of the extra log factor. No constant ratio is asserted, only that it exceeds 2
# and that work vastly outgrows span as n grows.
work_doubling_ratios = [SORT_WORKS[SORT_SIZES[i + 1]] / SORT_WORKS[SORT_SIZES[i]] for i in range(len(SORT_SIZES) - 1)]
assert all(r > 2.0 for r in work_doubling_ratios[-5:])
# Parallelism (work / span) itself grows with n, unboundedly, unlike the sequential merge's
# fixed Theta(n) span alone would suggest.
SORT_PARALLELISM = {n: SORT_WORKS[n] / SORT_SPANS[n] for n in SORT_SIZES if n > 1}
assert SORT_PARALLELISM[256] < SORT_PARALLELISM[4096] < SORT_PARALLELISM[65536]
assert round(SORT_PARALLELISM[65536], 1) == 8.0


# --- A discrete-event simulation of randomized work stealing. ---
# Each of p workers owns a deque of ready tasks. An idle worker becomes a thief: it picks a
# victim uniformly at random and removes the task at the *top* of that victim's deque (the
# owner itself works from the *bottom*, matching the owner-pushes-pops-bottom /
# thief-steals-top rule the sources state). This is a simplified discrete-time rendition of
# that protocol on the same balanced-tree sum DAG, scaled up to a bigger tree so steals are
# worth counting.

def simulate_work_stealing(n_leaves, p, seed):
    rng = random.Random(seed)
    children, root = build_balanced_tree_dag(n_leaves)
    done = set(range(n_leaves))
    pending = {node: len(kids) for node, kids in children.items() if kids}
    parent_of = {}
    for node, kids in children.items():
        for c in kids:
            parent_of[c] = node

    deques = [[] for _ in range(p)]
    # Seed: distribute the first-ready tasks (both children are leaves) round robin.
    first_ready = [node for node, kids in children.items() if kids and all(c < n_leaves for c in kids)]
    for i, node in enumerate(first_ready):
        deques[i % p].append(node)

    remaining = set(pending)
    steps = 0
    steal_attempts = 0
    successful_steals = 0

    def enable_parent(node):
        parent = parent_of.get(node)
        if parent is None:
            return None
        pending[parent] -= 1
        if pending[parent] == 0:
            return parent
        return None

    while remaining:
        steps += 1
        progressed = False
        for w in range(p):
            if not deques[w]:
                # Thief: try one random victim this step.
                steal_attempts += 1
                victim = rng.randrange(p)
                if victim != w and deques[victim]:
                    task = deques[victim].pop(0)  # steal from the top (front)
                    deques[w].append(task)
                    successful_steals += 1
            if deques[w]:
                task = deques[w].pop()  # the owner works from the bottom (end of the list)
                done.add(task)
                remaining.discard(task)
                progressed = True
                newly_ready = enable_parent(task)
                if newly_ready is not None:
                    deques[w].append(newly_ready)
        if not progressed and remaining:
            # Nobody had work and no steal landed this step; try again next step.
            continue

    return {"steps": steps, "steal_attempts": steal_attempts, "successful_steals": successful_steals, "work": n_leaves - 1}


STEAL_LEAVES = 2 ** 14  # a bigger tree than the teaching example, so steals are worth counting
STEAL_RESULTS = {}
for p in (1, 2, 4, 8, 16):
    r = simulate_work_stealing(STEAL_LEAVES, p, seed=42)
    span = int(math.log2(STEAL_LEAVES))
    bound = r["work"] / p + span
    # The theorem bounds the *expected* time at T1/P + O(T-infinity), not a hard T1/P + T-infinity
    # ceiling like the idealized greedy schedule above: this simulation's thieves spend a whole
    # step on each failed steal attempt, so it is honestly slower than the idealized bound by a
    # bounded constant factor, not equal to or under it.
    assert r["steps"] <= 3 * bound
    STEAL_RESULTS[p] = r

# Steals grow with p (more thieves competing for less work per worker), not with the work
# itself: the steal count at p = 16 is a small fraction of the work, never a large one.
assert STEAL_RESULTS[1]["successful_steals"] == 0  # one worker has nobody to steal from
steal_fractions = [STEAL_RESULTS[p]["successful_steals"] / STEAL_RESULTS[p]["work"] for p in (2, 4, 8, 16)]
assert steal_fractions == sorted(steal_fractions)  # the steal fraction rises with p
assert steal_fractions[-1] < 0.25  # but stays a small fraction of the total work, even at p = 16


if __name__ == "__main__":
    print("Balanced tree: work", TREE_WORK, "span", TREE_SPAN, "parallelism", TREE_PARALLELISM)
    print("Left-to-right chain: work", CHAIN_WORK, "span", CHAIN_SPAN, "parallelism", CHAIN_PARALLELISM)
    for p in PROCESSOR_COUNTS:
        row = BRENT_TABLE[p]
        print(f"p={p}: sharp bound {row['sharp']:.3f}, loose bound {row['loose']:.3f}, real steps {row['real']}")
    print("Merge sort span doubling ratios (last 5):", [round(r, 3) for r in span_doubling_ratios[-5:]])
    print("Merge sort work doubling ratios (last 5):", [round(r, 3) for r in work_doubling_ratios[-5:]])
    for p, r in STEAL_RESULTS.items():
        print(f"work stealing p={p}: steps {r['steps']}, successful steals {r['successful_steals']}, steal attempts {r['steal_attempts']}")
