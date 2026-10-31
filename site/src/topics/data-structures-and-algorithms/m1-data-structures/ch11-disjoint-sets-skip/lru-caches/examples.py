"""LRU caches: an O(1) hash-map-plus-doubly-linked-list cache, the CLOCK approximation that trades
exact recency for a cheap hit, and Redis's sampled approximation, all replayed against the same
access trace and measured against each other's miss ratio.

Every number the reel shows is computed or asserted here, not assumed.
"""
import random


class Node:
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    """Hash map (key -> node) plus a doubly linked list in recency order, head = most recent."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head = Node()  # sentinel
        self.tail = Node()  # sentinel
        self.head.next = self.tail
        self.tail.prev = self.head
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.pointer_ops = 0  # pointer writes per get/put, to show O(1) directly

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
        self.pointer_ops += 2

    def _push_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
        self.pointer_ops += 4

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            self.misses += 1
            return None
        self.hits += 1
        self._unlink(node)
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self.map.get(key)
        if node is not None:
            node.value = value
            self._unlink(node)
            self._push_front(node)
            return
        node = Node(key, value)
        self.map[key] = node
        self._push_front(node)
        if len(self.map) > self.capacity:
            victim = self.tail.prev
            self._unlink(victim)
            del self.map[victim.key]
            self.evictions += 1

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


class ClockCache:
    """CLOCK: a circular array with a use bit per slot, approximating LRU with no reorder on hit."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.slots = [None] * capacity  # key, or None
        self.use_bit = [0] * capacity
        self.map = {}  # key -> slot index
        self.hand = 0
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.bit_ops = 0  # use-bit sets/clears, the cheap operation this policy relies on

    def get(self, key):
        if key in self.map:
            self.hits += 1
            self.use_bit[self.map[key]] = 1
            self.bit_ops += 1
            return True
        self.misses += 1
        return False

    def put(self, key):
        if key in self.map:
            self.use_bit[self.map[key]] = 1
            self.bit_ops += 1
            return
        if len(self.map) < self.capacity:
            slot = len(self.map)
        else:
            while self.use_bit[self.hand] == 1:
                self.use_bit[self.hand] = 0
                self.bit_ops += 1
                self.hand = (self.hand + 1) % self.capacity
            slot = self.hand
            if self.slots[slot] is not None:
                del self.map[self.slots[slot]]
                self.evictions += 1
            self.hand = (self.hand + 1) % self.capacity
        self.slots[slot] = key
        self.use_bit[slot] = 1
        self.map[key] = slot

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


class SampledLRU:
    """Redis's approximation: track a real last-access timestamp per key, but pick a victim by
    sampling a few random keys instead of maintaining any ordered structure at all."""

    def __init__(self, capacity, samples, rng):
        self.capacity = capacity
        self.samples = samples
        self.rng = rng
        self.map = {}  # key -> last access time
        self.clock = 0
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def get(self, key):
        self.clock += 1
        if key in self.map:
            self.hits += 1
            self.map[key] = self.clock
            return True
        self.misses += 1
        return False

    def put(self, key):
        self.clock += 1
        if key in self.map:
            self.map[key] = self.clock
            return
        if len(self.map) >= self.capacity:
            keys = list(self.map.keys())
            sample = self.rng.sample(keys, min(self.samples, len(keys)))
            victim = min(sample, key=lambda k: self.map[k])
            del self.map[victim]
            self.evictions += 1
        self.map[key] = self.clock

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


# ---------------------------------------------------------------------------
# 1. The trace: a dozen page accesses over a small capacity, exactly what the
#    reel draws by hand.
# ---------------------------------------------------------------------------
PICTURE_TRACE = ["A", "B", "C", "A", "D", "B", "E", "A", "C", "D", "B", "A"]
PICTURE_CAPACITY = 3

lru_picture = LRUCache(PICTURE_CAPACITY)
picture_log = []
for page in PICTURE_TRACE:
    hit = lru_picture.get(page) is not None
    if not hit:
        lru_picture.put(page, True)
    picture_log.append((page, hit))

assert len(PICTURE_TRACE) == 12
assert picture_log[0] == ("A", False)
assert picture_log[3] == ("A", True)  # A is still in a 3-capacity cache after B, C
assert picture_log[7][1] is False  # by the time A is asked for again here, it has been evicted

# ---------------------------------------------------------------------------
# 2. O(1), demonstrated directly: every get/put touches a small, fixed number
#    of pointers, regardless of how large the cache is.
# ---------------------------------------------------------------------------
def pointer_ops_are_constant(capacity, n_ops, seed):
    rng = random.Random(seed)
    cache = LRUCache(capacity)
    universe = list(range(capacity * 4))
    per_op_costs = []
    for _ in range(n_ops):
        key = rng.choice(universe)
        before = cache.pointer_ops
        if cache.get(key) is None:
            cache.put(key, True)
        per_op_costs.append(cache.pointer_ops - before)
    return per_op_costs


costs_small = pointer_ops_are_constant(capacity=100, n_ops=5_000, seed=1)
costs_large = pointer_ops_are_constant(capacity=50_000, n_ops=5_000, seed=1)
assert max(costs_small) <= 6
assert max(costs_large) <= 6
assert max(costs_small) == max(costs_large)  # same bound at 100 entries and at fifty thousand

# ---------------------------------------------------------------------------
# 3. A real access trace: a hot set reused constantly, long enough to give
#    every policy a fair measured miss ratio.
# ---------------------------------------------------------------------------
def make_trace(hot_size, n_ops, window, recency_bias, seed):
    """A trace with real temporal locality: most accesses revisit one of the last `window`
    distinct pages touched (recency_bias probability); the rest pick a fresh page uniformly from
    the whole hot set. This is what gives a recency-aware policy something to actually exploit --
    an i.i.d. uniform trace (every key equally likely every time) carries no recency signal at
    all, so every eviction policy converges to the same miss ratio on one (confirmed while
    building this: the first, uniform version of this trace made LRU, CLOCK and sampled LRU land
    within noise of each other, which is correct but not useful for teaching the difference)."""
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    trace = []
    recent = []
    for _ in range(n_ops):
        if recent and rng.random() < recency_bias:
            page = rng.choice(recent[-window:])
        else:
            page = rng.choice(hot)
        trace.append(page)
        recent.append(page)
    return trace


HOT_SIZE = 200
CAPACITY = 100
TRACE = make_trace(hot_size=HOT_SIZE, n_ops=50_000, window=80, recency_bias=0.85, seed=5)


def replay(cache_factory, trace):
    cache = cache_factory()
    is_clock = isinstance(cache, ClockCache)
    is_sampled = isinstance(cache, SampledLRU)
    for page in trace:
        if is_clock or is_sampled:
            hit = cache.get(page)
            if not hit:
                cache.put(page)
        else:
            hit = cache.get(page) is not None
            if not hit:
                cache.put(page, True)
    return cache


lru_result = replay(lambda: LRUCache(CAPACITY), TRACE)
clock_result = replay(lambda: ClockCache(CAPACITY), TRACE)
sampled_result = replay(lambda: SampledLRU(CAPACITY, samples=5, rng=random.Random(9)), TRACE)

lru_miss = lru_result.miss_ratio()
clock_miss = clock_result.miss_ratio()
sampled_miss = sampled_result.miss_ratio()

# A hot set of two hundred pages against a capacity of one hundred cannot all fit; exact LRU still
# does reasonably well because the access pattern (random.choices, not uniform-shuffle-then-cycle)
# concentrates reuse. CLOCK should land close to LRU (it approximates the same recency signal);
# sampled LRU, with no ordered structure at all, should be worse than both.
assert lru_miss < 0.9
assert abs(clock_miss - lru_miss) < 0.08
assert sampled_miss > lru_miss

# ---------------------------------------------------------------------------
# 4. The scan that flushes everything: a long run of pages touched exactly
#    once, longer than the cache, interleaved with the hot set.
# ---------------------------------------------------------------------------
def make_scan_trace(hot_size, hot_reuses, scan_len, seed):
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    warm_up = rng.choices(hot, k=hot_reuses)
    scan = [f"scan-{i}" for i in range(scan_len)]
    cooldown = rng.choices(hot, k=hot_reuses)
    return warm_up + scan + cooldown


SCAN_LEN = 500
scan_trace = make_scan_trace(hot_size=HOT_SIZE, hot_reuses=2_000, scan_len=SCAN_LEN, seed=13)

lru_scan = replay(lambda: LRUCache(CAPACITY), scan_trace)
clock_scan = replay(lambda: ClockCache(CAPACITY), scan_trace)

# Measure the hit rate on the FIRST probe_len accesses right after warm-up, with and without a
# scan in between. A full-length cooldown self-warms (repeated draws from a small hot set rebuild
# their own hits regardless of the scan, which is why an earlier version of this measurement
# showed almost no difference -- the scan's damage is only visible before that self-warming
# catches up, so this measures just the first probe, not the whole cooldown).
def probe_hit_rate(cache_factory, hot_size, warm_reuses, scan_len, probe_len, seed, with_scan):
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    warm_up = rng.choices(hot, k=warm_reuses)
    scan = [f"scan-{i}" for i in range(scan_len)] if with_scan else []
    probe = rng.choices(hot, k=probe_len)
    cache = cache_factory()
    is_clock = isinstance(cache, ClockCache)

    def step(page):
        if is_clock:
            hit = cache.get(page)
            if not hit:
                cache.put(page)
        else:
            hit = cache.get(page) is not None
            if not hit:
                cache.put(page, True)
        return hit

    for page in warm_up + scan:
        step(page)
    hits = sum(step(page) for page in probe)
    return hits / probe_len


PROBE_LEN = 300
no_scan_hit_lru = probe_hit_rate(lambda: LRUCache(CAPACITY), HOT_SIZE, 2_000, SCAN_LEN, PROBE_LEN, 13, with_scan=False)
after_scan_hit_lru = probe_hit_rate(lambda: LRUCache(CAPACITY), HOT_SIZE, 2_000, SCAN_LEN, PROBE_LEN, 13, with_scan=True)
no_scan_hit_clock = probe_hit_rate(lambda: ClockCache(CAPACITY), HOT_SIZE, 2_000, SCAN_LEN, PROBE_LEN, 13, with_scan=False)
after_scan_hit_clock = probe_hit_rate(lambda: ClockCache(CAPACITY), HOT_SIZE, 2_000, SCAN_LEN, PROBE_LEN, 13, with_scan=True)

# The scan (five hundred single-use pages, larger than the capacity) measurably drives the
# immediately-following hit rate down, under both recency-based policies, compared to the same
# probe with no scan in between.
assert after_scan_hit_lru < no_scan_hit_lru - 0.05
assert after_scan_hit_clock < no_scan_hit_clock - 0.05

if __name__ == "__main__":
    print(f"picture trace: {picture_log}")
    print(f"pointer ops per op, capacity 100: max {max(costs_small)}; capacity 50,000: max {max(costs_large)}")
    print(f"hot-set replay ({len(TRACE)} ops): LRU miss {lru_miss:.4f}, CLOCK miss {clock_miss:.4f}, sampled miss {sampled_miss:.4f}")
    print(f"probe hit rate, LRU: no scan {no_scan_hit_lru:.4f}, after scan {after_scan_hit_lru:.4f}")
    print(f"probe hit rate, CLOCK: no scan {no_scan_hit_clock:.4f}, after scan {after_scan_hit_clock:.4f}")
