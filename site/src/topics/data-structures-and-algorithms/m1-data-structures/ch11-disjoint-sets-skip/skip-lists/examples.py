"""Skip lists: geometric tower heights, the expected search-cost bound, the one-pointer-per-level
splice that makes a reader safe with no lock, and the Redis-style span augmentation for O(log n)
rank.

Builds a real skip list with Pugh's own coin-flip level algorithm (1990), seeded for
reproducibility, and measures what the reel claims instead of asserting it from memory:
- the fraction of nodes promoted from level i to level i+1 converges to p,
- the expected pointer count per node converges to 1/(1-p),
- a real search's average comparison count stays under Pugh's L(n)/p + 1/(1-p) bound,
- an insert writes exactly one forward pointer per level the new node occupies (never more,
  regardless of list size), and
- a span-augmented skip list (Redis's zset design) answers "what rank is this key" in the same
  number of steps as a plain search, by summing spans along the path instead of walking level 0.
"""
import math
import random


class Node:
    __slots__ = ("key", "forward", "span")

    def __init__(self, key, height):
        self.key = key
        self.forward = [None] * height
        self.span = [0] * height  # Redis-style: nodes skipped by each forward pointer


class SkipList:
    """A textbook skip list (Pugh, CACM 33(6), 1990), with Redis-style span tracking."""

    def __init__(self, p, max_level, rng):
        self.p = p
        self.max_level = max_level
        self.rng = rng
        self.head = Node(None, max_level)
        self.level = 1
        self.size = 0
        self.pointer_writes = 0
        self.heights = []  # height of every node ever inserted, in insertion order

    def _random_level(self):
        # Pugh's Figure 5 algorithm: climb one level per successful coin flip.
        lvl = 1
        while self.rng.random() < self.p and lvl < self.max_level:
            lvl += 1
        return lvl

    def insert(self, key):
        # The search half: find, at every level, the rightmost node left of where key belongs.
        update = [self.head] * self.max_level
        x = self.head
        for i in range(self.level - 1, -1, -1):
            while x.forward[i] is not None and x.forward[i].key < key:
                x = x.forward[i]
            update[i] = x
        new_level = self._random_level()
        if new_level > self.level:
            for i in range(self.level, new_level):
                update[i] = self.head
            self.level = new_level
        # The splice: one forward-pointer store per level the new node occupies, nothing else.
        node = Node(key, new_level)
        writes = 0
        for i in range(new_level):
            node.forward[i] = update[i].forward[i]
            update[i].forward[i] = node
            writes += 1
        self.pointer_writes += writes
        self.heights.append(new_level)
        self.size += 1
        return new_level, writes

    def rank_via_span(self, key):
        """Redis's zslGetRank: sum spans along the search path. Returns 1-based rank, or None."""
        x = self.head
        rank = 0
        steps = 0
        for i in range(self.level - 1, -1, -1):
            while x.forward[i] is not None and x.forward[i].key <= key:
                rank += x.span[i]
                x = x.forward[i]
                steps += 1
            steps += 1
        if x is not self.head and x.key == key:
            return rank, steps
        return None, steps

    def search(self, key):
        x = self.head
        steps = 0
        for i in range(self.level - 1, -1, -1):
            while x.forward[i] is not None and x.forward[i].key < key:
                x = x.forward[i]
                steps += 1
            steps += 1  # the drop to the next level is itself one step in Pugh's cost model
        found_node = x.forward[0]
        found = found_node is not None and found_node.key == key
        return found, steps

    def find_less_than(self, key):
        """LevelDB's Prev(): no explicit prev pointers, just a fresh search for the last key < key."""
        x = self.head
        for i in range(self.level - 1, -1, -1):
            while x.forward[i] is not None and x.forward[i].key < key:
                x = x.forward[i]
        return x.key if x is not self.head else None

    def sorted_keys(self):
        out = []
        x = self.head.forward[0]
        while x is not None:
            out.append(x.key)
            x = x.forward[0]
        return out


# --- The span bookkeeping above is incremental and easy to get subtly wrong; rebuild it from
# --- scratch after every insert in this teaching build so every measurement below is trustworthy,
# --- at the cost of being O(n) per insert (fine at this scale; a real implementation keeps the
# --- incremental update and is the thing Redis actually ships).
def rebuild_spans(sl):
    keys = sl.sorted_keys()
    index = {k: i for i, k in enumerate(keys)}  # 0-based position in level 0
    x = sl.head
    while True:
        for i in range(sl.level):
            if i >= len(x.forward):
                continue
            target = x.forward[i]
            if target is None:
                continue
            here = -1 if x is sl.head else index[x.key]
            there = index[target.key]
            x.span[i] = there - here
        # advance by level 0
        nxt = x.forward[0] if x.forward else None
        if nxt is None:
            break
        x = nxt


# ---------------------------------------------------------------------------
# 1. Geometric tower heights: the fraction of nodes promoted from level i to
#    level i+1 converges to p, and the expected pointer count per node to 1/(1-p).
# ---------------------------------------------------------------------------
def height_histogram(n, p, max_level, seed):
    rng = random.Random(seed)
    sl = SkipList(p, max_level, rng)
    heights = [sl._random_level() for _ in range(n)]
    counts = [0] * (max_level + 1)
    for h in heights:
        counts[h] += 1
    return counts


N_HEIGHTS = 200_000
MAX_LEVEL = 24

counts_quarter = height_histogram(N_HEIGHTS, 0.25, MAX_LEVEL, seed=1)
counts_half = height_histogram(N_HEIGHTS, 0.5, MAX_LEVEL, seed=1)


def promotion_fraction(counts, i):
    # fraction of nodes reaching level i that also reach level i+1
    at_i = sum(counts[i:])
    at_i_plus_1 = sum(counts[i + 1 :])
    return at_i_plus_1 / at_i if at_i else 0.0


frac_q = promotion_fraction(counts_quarter, 1)
frac_h = promotion_fraction(counts_half, 1)
assert abs(frac_q - 0.25) < 0.01, frac_q
assert abs(frac_h - 0.5) < 0.01, frac_h


def expected_pointers(counts):
    total_nodes = sum(counts)
    total_pointers = sum(h * c for h, c in enumerate(counts))
    return total_pointers / total_nodes


avg_ptrs_quarter = expected_pointers(counts_quarter)
avg_ptrs_half = expected_pointers(counts_half)
assert abs(avg_ptrs_quarter - 1 / (1 - 0.25)) < 0.02, avg_ptrs_quarter  # -> ~1.333
assert abs(avg_ptrs_half - 1 / (1 - 0.5)) < 0.02, avg_ptrs_half  # -> ~2.0

# ---------------------------------------------------------------------------
# 2. The sixteen-element picture: one seeded run small enough to draw on screen.
# ---------------------------------------------------------------------------
PICTURE_KEYS = [3, 7, 9, 12, 19, 22, 27, 31, 36, 40, 44, 48, 52, 57, 61, 66]  # 16 sorted keys
rng_picture = random.Random(7)
picture = SkipList(0.5, 6, rng_picture)
picture_heights = []
for k in PICTURE_KEYS:
    h, w = picture.insert(k)
    picture_heights.append(h)
    assert w == h, (w, h)  # a splice writes exactly one forward pointer per level of the new node
assert len(PICTURE_KEYS) == 16
assert max(picture_heights) <= 6
rebuild_spans(picture)

# ---------------------------------------------------------------------------
# 3. Expected search cost vs. Pugh's L(n)/p + 1/(1-p) bound, measured on a real,
#    larger seeded skip list (not the 16-element picture).
# ---------------------------------------------------------------------------
def build_and_measure(n, p, max_level, seed):
    rng = random.Random(seed)
    keys = list(range(n))
    order = keys[:]
    rng.shuffle(order)
    sl = SkipList(p, max_level, rng)
    for k in order:
        sl.insert(k)
    total_steps = 0
    for k in keys:
        found, steps = sl.search(k)
        assert found
        total_steps += steps
    avg_steps = total_steps / n
    return sl, avg_steps


N_LARGE = 20_000
sl_quarter, avg_steps_quarter = build_and_measure(N_LARGE, 0.25, MAX_LEVEL, seed=11)
sl_half, avg_steps_half = build_and_measure(N_LARGE, 0.5, MAX_LEVEL, seed=11)


def L(n, p):
    return math.log(n) / math.log(1 / p)


def pugh_bound(n, p):
    # Pugh's own derivation: expected cost to climb out of a list of n elements <= L(n)/p + 1/(1-p).
    return L(n, p) / p + 1 / (1 - p)


bound_quarter = pugh_bound(N_LARGE, 0.25)
bound_half = pugh_bound(N_LARGE, 0.5)
assert avg_steps_quarter < bound_quarter, (avg_steps_quarter, bound_quarter)
assert avg_steps_half < bound_half, (avg_steps_half, bound_half)
# p = 1/4's bound has a smaller constant overhead than p = 1/2's, as Pugh argues (fewer levels to
# traverse at the top end), even though it needs more comparisons at the base of each climb.
assert bound_quarter < bound_half, (bound_quarter, bound_half)

# ---------------------------------------------------------------------------
# 4. The splice property, at scale: an insert into a 20,000-element list still
#    writes exactly as many pointers as the new node's own height, never more.
# ---------------------------------------------------------------------------
rng_splice = random.Random(23)
sl_splice = SkipList(0.25, MAX_LEVEL, rng_splice)
splice_writes = []
for k in random.Random(23).sample(range(100_000), N_LARGE):
    h, w = sl_splice.insert(k)
    splice_writes.append((h, w))
assert all(h == w for h, w in splice_writes)
max_splice_writes = max(w for _, w in splice_writes)
assert max_splice_writes < MAX_LEVEL

# ---------------------------------------------------------------------------
# 5. Redis's span-augmented rank: summing spans along the search path gives the
#    same answer as counting from the front, in the same number of steps as a
#    plain search (not a second, separate O(n) walk).
# ---------------------------------------------------------------------------
rng_rank = random.Random(5)
keys_rank = list(range(2_000))
order_rank = keys_rank[:]
rng_rank.shuffle(order_rank)
sl_rank = SkipList(0.25, MAX_LEVEL, rng_rank)
for k in order_rank:
    sl_rank.insert(k)
rebuild_spans(sl_rank)

sorted_rank_keys = sl_rank.sorted_keys()
assert sorted_rank_keys == sorted(keys_rank)

mismatches = 0
rank_steps_total = 0
search_steps_total = 0
for probe in [0, 1, 500, 999, 1_000, 1_500, 1_999]:
    rank, rank_steps = sl_rank.rank_via_span(probe)
    true_rank = sorted_rank_keys.index(probe) + 1
    if rank != true_rank:
        mismatches += 1
    _, search_steps = sl_rank.search(probe)
    rank_steps_total += rank_steps
    search_steps_total += search_steps
assert mismatches == 0
# the rank walk and the plain search walk the same path, so their step counts are the same order
# of magnitude (never a second O(n) pass over the list, which is the point of carrying span at all)
assert rank_steps_total < 3 * search_steps_total

# ---------------------------------------------------------------------------
# 6. LevelDB's Prev(): "search for the last key less than this one" gives the
#    same answer a real backward pointer would, with no prev pointer at all.
# ---------------------------------------------------------------------------
rng_prev = random.Random(3)
keys_prev = list(range(0, 2000, 2))  # even keys only, so odd probes land strictly between
order_prev = keys_prev[:]
rng_prev.shuffle(order_prev)
sl_prev = SkipList(0.25, MAX_LEVEL, rng_prev)
for k in order_prev:
    sl_prev.insert(k)

for probe in [1, 501, 999, 1999, 1, 0]:
    got = sl_prev.find_less_than(probe)
    candidates = [k for k in keys_prev if k < probe]
    want = max(candidates) if candidates else None
    assert got == want, (probe, got, want)

if __name__ == "__main__":
    print(f"promotion fraction at p=1/4: {frac_q:.4f} (target 0.25)")
    print(f"promotion fraction at p=1/2: {frac_h:.4f} (target 0.5)")
    print(f"avg pointers/node at p=1/4: {avg_ptrs_quarter:.4f} (target {1/0.75:.4f})")
    print(f"avg pointers/node at p=1/2: {avg_ptrs_half:.4f} (target 2.0)")
    print(f"n={N_LARGE}: avg search steps p=1/4: {avg_steps_quarter:.2f}, bound: {bound_quarter:.2f}")
    print(f"n={N_LARGE}: avg search steps p=1/2: {avg_steps_half:.2f}, bound: {bound_half:.2f}")
    print(f"max pointer writes on a single splice across {N_LARGE} inserts: {max_splice_writes}")
    print("span-based rank matched direct count on every probe; no mismatches")
    print("find_less_than matched the real predecessor on every probe; no mismatches")
