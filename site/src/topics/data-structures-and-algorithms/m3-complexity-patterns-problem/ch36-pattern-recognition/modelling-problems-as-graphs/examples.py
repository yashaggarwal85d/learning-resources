import heapq
import itertools
import math
from collections import defaultdict, deque

# --- A word ladder: states are words, moves change one letter ---
# A small dictionary the builder writes itself (no external word list, none fetched or licensed).
LADDER_DICTIONARY = {
    "head", "heal", "teal", "tell", "tall", "tail",
    "heat", "hear", "bear", "beat", "best", "rest", "rust", "ruse", "rose", "nose",
    "cold", "bold", "bole", "hole", "hold", "held", "herd", "here", "hare", "bare",
    "care", "core", "bore", "bone", "bane", "band", "bend", "bond", "fond", "find",
    "fine", "wine", "vine", "dine", "mine", "mind", "mild", "wild", "word",
    "ward", "warm", "worm", "work", "fork", "form", "fort", "sort", "sore", "more",
    "mare", "mace", "race", "rice", "ride", "rode", "code", "cope", "cape", "tape",
}


def hamming_distance(a, b):
    return sum(x != y for x, y in zip(a, b))


def ladder_neighbors_naive(word, words):
    return {w for w in words if w != word and hamming_distance(w, word) == 1}


def shortest_ladder(start, target, words):
    if start not in words or target not in words:
        return None
    prev = {start: None}
    queue = deque([start])
    while queue:
        word = queue.popleft()
        if word == target:
            path = []
            cur = word
            while cur is not None:
                path.append(cur)
                cur = prev[cur]
            return list(reversed(path))
        for neighbor in ladder_neighbors_naive(word, words):
            if neighbor not in prev:
                prev[neighbor] = word
                queue.append(neighbor)
    return None


HEAD_TO_TAIL_LADDER = shortest_ladder("head", "tail", LADDER_DICTIONARY)
assert HEAD_TO_TAIL_LADDER == ["head", "heal", "teal", "tell", "tall", "tail"]
LADDER_STEPS = len(HEAD_TO_TAIL_LADDER) - 1
assert LADDER_STEPS == 5
HEAD_TAIL_HAMMING_DISTANCE = hamming_distance("head", "tail")
assert HEAD_TAIL_HAMMING_DISTANCE == 4
assert LADDER_STEPS >= HEAD_TAIL_HAMMING_DISTANCE


# --- The wildcard-bucket trick: edges found without being compared ---
def build_wildcard_buckets(words):
    buckets = defaultdict(list)
    for word in words:
        for i in range(len(word)):
            key = word[:i] + "_" + word[i + 1:]
            buckets[key].append(word)
    return buckets


def ladder_neighbors_by_bucket(word, buckets):
    found = set()
    for i in range(len(word)):
        key = word[:i] + "_" + word[i + 1:]
        for other in buckets[key]:
            if other != word:
                found.add(other)
    return found


FOUR_LETTER_WORDS = sorted(LADDER_DICTIONARY)
WILDCARD_BUCKETS = build_wildcard_buckets(FOUR_LETTER_WORDS)

NAIVE_EDGE_COUNT = sum(len(ladder_neighbors_naive(w, FOUR_LETTER_WORDS)) for w in FOUR_LETTER_WORDS)
BUCKET_EDGE_COUNT = sum(len(ladder_neighbors_by_bucket(w, WILDCARD_BUCKETS)) for w in FOUR_LETTER_WORDS)
assert NAIVE_EDGE_COUNT == BUCKET_EDGE_COUNT

for _word in FOUR_LETTER_WORDS:
    assert ladder_neighbors_naive(_word, FOUR_LETTER_WORDS) == ladder_neighbors_by_bucket(_word, WILDCARD_BUCKETS)


# --- An implicit graph: the 8-puzzle, never stored, generated on demand ---
EIGHT_PUZZLE_GOAL = (1, 2, 3, 4, 5, 6, 7, 8, 0)  # 0 is the blank
EIGHT_PUZZLE_SIDE = 3


def eight_puzzle_neighbors(state):
    blank = state.index(0)
    row, col = divmod(blank, EIGHT_PUZZLE_SIDE)
    for drow, dcol in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nrow, ncol = row + drow, col + dcol
        if 0 <= nrow < EIGHT_PUZZLE_SIDE and 0 <= ncol < EIGHT_PUZZLE_SIDE:
            neighbor_index = nrow * EIGHT_PUZZLE_SIDE + ncol
            new_state = list(state)
            new_state[blank], new_state[neighbor_index] = new_state[neighbor_index], new_state[blank]
            yield tuple(new_state)


def breadth_first_search_from_goal(goal, neighbor_fn):
    distances = {goal: 0}
    queue = deque([goal])
    while queue:
        state = queue.popleft()
        for neighbor in neighbor_fn(state):
            if neighbor not in distances:
                distances[neighbor] = distances[state] + 1
                queue.append(neighbor)
    return distances


EIGHT_PUZZLE_DISTANCES = breadth_first_search_from_goal(EIGHT_PUZZLE_GOAL, eight_puzzle_neighbors)
EIGHT_PUZZLE_REACHABLE_STATES = len(EIGHT_PUZZLE_DISTANCES)
assert EIGHT_PUZZLE_REACHABLE_STATES == 181_440
assert EIGHT_PUZZLE_REACHABLE_STATES == math.factorial(9) // 2
EIGHT_PUZZLE_MAX_DISTANCE = max(EIGHT_PUZZLE_DISTANCES.values())
assert EIGHT_PUZZLE_MAX_DISTANCE == 31

# The 15-puzzle's state count, by the identical argument (half of all permutations are reachable,
# the other half differing by one swap), computed directly, never enumerated: it is far too large.
FIFTEEN_PUZZLE_STATE_COUNT = math.factorial(16) // 2
assert FIFTEEN_PUZZLE_STATE_COUNT == 10_461_394_944_000


# --- A combination lock: states as four digits, moves turn one wheel one notch ---
LOCK_WHEELS = 4
LOCK_DIGITS = 10


def lock_states():
    return list(itertools.product(range(LOCK_DIGITS), repeat=LOCK_WHEELS))


def lock_neighbors(state):
    for i in range(LOCK_WHEELS):
        for delta in (-1, 1):
            new_state = list(state)
            new_state[i] = (new_state[i] + delta) % LOCK_DIGITS
            yield tuple(new_state)


LOCK_STATES = lock_states()
LOCK_STATE_COUNT = len(LOCK_STATES)
assert LOCK_STATE_COUNT == 10_000
LOCK_EDGE_COUNT = sum(len(list(lock_neighbors(s))) for s in LOCK_STATES)
assert LOCK_EDGE_COUNT == 80_000


def lock_shortest_path(start, target, forbidden):
    if start in forbidden or target in forbidden:
        return None
    distances = {start: 0}
    queue = deque([start])
    while queue:
        state = queue.popleft()
        if state == target:
            return distances[state]
        for neighbor in lock_neighbors(state):
            if neighbor not in distances and neighbor not in forbidden:
                distances[neighbor] = distances[state] + 1
                queue.append(neighbor)
    return None


LOCK_FORBIDDEN_CODES = {(1, 3, 3, 7), (6, 6, 6, 6), (0, 0, 0, 1)}
LOCK_SHORTEST_PATH = lock_shortest_path((0, 0, 0, 0), (1, 3, 3, 8), LOCK_FORBIDDEN_CODES)
assert LOCK_SHORTEST_PATH == 9


# --- A layered graph for a count constraint: "at most k discounts" ---
def layered_graph_size(vertex_count, edge_count, k):
    layered_vertices = (k + 1) * vertex_count
    layered_edges = round((2 * k + 1) * edge_count)
    return layered_vertices, layered_edges


RUNNING_EXAMPLE_VERTICES = 10 ** 5
RUNNING_EXAMPLE_EDGES = 3 * 10 ** 5
RUNNING_EXAMPLE_K = 3
LAYERED_VERTEX_COUNT, LAYERED_EDGE_COUNT = layered_graph_size(
    RUNNING_EXAMPLE_VERTICES, RUNNING_EXAMPLE_EDGES, RUNNING_EXAMPLE_K
)
assert LAYERED_VERTEX_COUNT == 400_000
assert LAYERED_EDGE_COUNT == 2_100_000


# A small hand-built road graph: a direct route with no discount (three edges, cost ten each),
# and a discounted detour (four edges, cost ten each, half price with a discount).
DISCOUNT_GRAPH_EDGES = [
    (0, 1, 10, False), (1, 2, 10, False), (2, 3, 10, False),
    (0, 4, 10, True), (4, 5, 10, True), (5, 6, 10, True), (6, 3, 10, True),
]
DISCOUNT_GRAPH_VERTEX_COUNT = 7


def layered_dijkstra(vertex_count, edges, k, source, target):
    adjacency = [[] for _ in range(vertex_count)]
    for u, v, cost, discounted in edges:
        adjacency[u].append((v, cost, discounted))
    start_state = (source, 0)
    distances = {start_state: 0}
    frontier = [(0, start_state)]
    while frontier:
        dist, (u, discounts_used) = heapq.heappop(frontier)
        if dist > distances.get((u, discounts_used), float("inf")):
            continue
        for v, cost, discounted in adjacency[u]:
            if discounted and discounts_used < k:
                new_dist, new_state = dist + cost / 2, (v, discounts_used + 1)
            else:
                new_dist, new_state = dist + cost, (v, discounts_used)
            if new_dist < distances.get(new_state, float("inf")):
                distances[new_state] = new_dist
                heapq.heappush(frontier, (new_dist, new_state))
    reachable = [distances[(target, used)] for used in range(k + 1) if (target, used) in distances]
    return min(reachable) if reachable else None


def discount_graph_bruteforce(vertex_count, edges, k, source, target):
    adjacency = [[] for _ in range(vertex_count)]
    for u, v, cost, discounted in edges:
        adjacency[u].append((v, cost, discounted))
    best = [float("inf")]

    def dfs(u, discounts_used, cost_so_far, visited):
        if u == target:
            best[0] = min(best[0], cost_so_far)
        for v, cost, discounted in adjacency[u]:
            if v in visited:
                continue
            if discounted and discounts_used < k:
                dfs(v, discounts_used + 1, cost_so_far + cost / 2, visited | {v})
            dfs(v, discounts_used, cost_so_far + cost, visited | {v})

    dfs(source, 0, 0, {source})
    return best[0] if best[0] < float("inf") else None


DISCOUNT_COST_BY_K = {}
for _k in range(5):
    measured = layered_dijkstra(DISCOUNT_GRAPH_VERTEX_COUNT, DISCOUNT_GRAPH_EDGES, _k, 0, 3)
    brute = discount_graph_bruteforce(DISCOUNT_GRAPH_VERTEX_COUNT, DISCOUNT_GRAPH_EDGES, _k, 0, 3)
    assert measured == brute
    DISCOUNT_COST_BY_K[_k] = measured

assert DISCOUNT_COST_BY_K[0] == 30
assert DISCOUNT_COST_BY_K[2] == 30
assert DISCOUNT_COST_BY_K[3] == 25.0
assert DISCOUNT_COST_BY_K[4] == 20.0
# the direct route is cheapest until there are enough discounts to make the detour pay off
assert DISCOUNT_COST_BY_K[2] > DISCOUNT_COST_BY_K[3]


if __name__ == "__main__":
    print("word ladder head to tail:", " -> ".join(HEAD_TO_TAIL_LADDER), f"({LADDER_STEPS} steps)")
    print("Hamming distance head/tail:", HEAD_TAIL_HAMMING_DISTANCE)
    print("naive edge count:", NAIVE_EDGE_COUNT, "bucket edge count:", BUCKET_EDGE_COUNT, "(identical neighbor sets)")
    print("8-puzzle reachable states:", EIGHT_PUZZLE_REACHABLE_STATES, "max distance:", EIGHT_PUZZLE_MAX_DISTANCE)
    print("15-puzzle state count (computed, never enumerated):", FIFTEEN_PUZZLE_STATE_COUNT)
    print("lock states:", LOCK_STATE_COUNT, "edges:", LOCK_EDGE_COUNT)
    print("lock shortest path avoiding forbidden codes:", LOCK_SHORTEST_PATH)
    print(f"layered graph at V={RUNNING_EXAMPLE_VERTICES}, E={RUNNING_EXAMPLE_EDGES}, k={RUNNING_EXAMPLE_K}:",
          LAYERED_VERTEX_COUNT, "vertices,", LAYERED_EDGE_COUNT, "edges")
    for k, cost in DISCOUNT_COST_BY_K.items():
        print(f"discount graph at k={k}: cheapest cost {cost}")
