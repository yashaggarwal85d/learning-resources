"""de.cache-patterns-eviction-policies — executable evidence.

Builds a write-behind data-loss demonstration (the hook's own failure, reproduced as a real
in-memory simulation) and a real, measured hit-rate comparison between plain LRU and a simplified
frequency-aware admission policy (an admission filter in front of LRU, the same idea Caffeine's
own W-TinyLFU uses) over a skewed (Zipfian) access pattern.
"""

import random
from collections import OrderedDict, Counter

random.seed(7)


class WriteBehindCache:
    """A minimal write-behind cache: a write updates the cache immediately and queues the
    backing-store write; the queue only drains on an explicit flush, reproducing the real risk
    Coherence's own docs name: the cache is the system-of-record until the queue is written."""

    def __init__(self):
        self.cache = {}
        self.queue = []
        self.backing_store = {}

    def write(self, key, value):
        self.cache[key] = value
        self.queue.append((key, value))

    def flush(self):
        for key, value in self.queue:
            self.backing_store[key] = value
        self.queue = []

    def crash_before_flush(self):
        """Simulates the hook: the node dies with queued writes never reaching the backing store."""
        lost = list(self.queue)
        self.cache = {}
        self.queue = []
        return lost


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.store = OrderedDict()

    def get(self, key):
        if key not in self.store:
            return None
        self.store.move_to_end(key)
        return self.store[key]

    def put(self, key, value):
        if key in self.store:
            self.store.move_to_end(key)
        self.store[key] = value
        if len(self.store) > self.capacity:
            self.store.popitem(last=False)


class AdmissionFilteredLRU:
    """A simplified admission-plus-eviction policy: a frequency counter (the course's own stand-in
    for Caffeine's frequency sketch) must see a key at least ADMIT_THRESHOLD times before it is
    even allowed into the LRU's main cache, so a long tail of one-hit-wonders never displaces a
    key that recurs."""

    ADMIT_THRESHOLD = 5

    def __init__(self, capacity):
        self.lru = LRUCache(capacity)
        self.frequency = Counter()

    def get(self, key):
        self.frequency[key] += 1
        return self.lru.get(key)

    def put(self, key, value):
        if self.frequency[key] >= self.ADMIT_THRESHOLD:
            self.lru.put(key, value)


def zipfian_keys(n_requests, n_keys, skew=1.0):
    weights = [1.0 / (rank ** skew) for rank in range(1, n_keys + 1)]
    total = sum(weights)
    probs = [w / total for w in weights]
    keys = list(range(n_keys))
    return random.choices(keys, weights=probs, k=n_requests)


def measure_hit_rate(cache_factory, requests, capacity):
    cache = cache_factory(capacity)
    hits = 0
    for key in requests:
        if cache.get(key) is not None:
            hits += 1
        else:
            cache.put(key, f"value-{key}")
    return hits / len(requests)


def run():
    wb = WriteBehindCache()
    wb.write("order-42", "shipped")
    lost = wb.crash_before_flush()
    print(f"Write-behind: {len(lost)} write(s) acknowledged to the application but never reached the backing store: {lost}")
    assert lost == [("order-42", "shipped")]
    assert wb.backing_store == {}

    requests = zipfian_keys(n_requests=30000, n_keys=10000, skew=1.0)
    capacity = 100

    lru_hit_rate = measure_hit_rate(LRUCache, requests, capacity)
    admission_hit_rate = measure_hit_rate(AdmissionFilteredLRU, requests, capacity)
    print(f"\nPlain LRU hit rate: {lru_hit_rate:.3f}")
    print(f"Admission-filtered LRU hit rate: {admission_hit_rate:.3f}")

    assert admission_hit_rate > lru_hit_rate + 0.05


if __name__ == "__main__":
    run()
