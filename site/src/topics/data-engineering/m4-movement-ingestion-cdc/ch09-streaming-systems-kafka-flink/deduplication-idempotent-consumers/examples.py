"""Toy models for de.deduplication-idempotent-consumers: a TTL-bounded dedup store that really
forgets an id once its window passes (and stops deduplicating a late redelivery beyond that
window), a small real Bloom filter that really trades a measured false-positive rate for memory
that doesn't grow with the id count, and deterministic-id derivation propagating through a second
processing stage. Standalone simulation (per EIP's Idempotent Receiver pattern, GCP Pub/Sub's and
Stripe's own docs, SOURCES.md); the Bloom filter's false-positive rate is measured directly from
this run, not cited from any source."""

import hashlib


class TTLDedupStore:
    """Remembers an event id only for a bounded window; a redelivery outside the window is no
    longer recognized as a duplicate — a stated, deliberate trade-off, not a bug."""

    def __init__(self, ttl):
        self.ttl = ttl
        self._seen = {}  # event_id -> last_seen_clock

    def process(self, event_id, clock):
        self._evict_expired(clock)
        if event_id in self._seen:
            self._seen[event_id] = clock
            return "duplicate"
        self._seen[event_id] = clock
        return "new"

    def _evict_expired(self, clock):
        expired = [eid for eid, seen in self._seen.items() if clock - seen > self.ttl]
        for eid in expired:
            del self._seen[eid]


class TinyBloomFilter:
    """A real, small Bloom filter: a bit array and a handful of hash functions. False positives
    are measured directly from this run, not assumed."""

    def __init__(self, size, num_hashes):
        self.size = size
        self.num_hashes = num_hashes
        self.bits = [False] * size

    def _positions(self, item):
        for i in range(self.num_hashes):
            digest = hashlib.sha256(f"{i}:{item}".encode()).hexdigest()
            yield int(digest, 16) % self.size

    def add(self, item):
        for pos in self._positions(item):
            self.bits[pos] = True

    def might_contain(self, item):
        return all(self.bits[pos] for pos in self._positions(item))


def deterministic_id(*parts):
    """A derived event's id, computed the same way every time from its own inputs — lets the
    next consumer downstream deduplicate it the same way."""
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:16]


def run():
    # A TTL-bounded dedup store: a duplicate inside the window is caught; the same id outside
    # the window is treated as new again, a deliberate, bounded trade-off, not a failure.
    store = TTLDedupStore(ttl=10)
    assert store.process("evt-1", clock=0) == "new"
    assert store.process("evt-1", clock=5) == "duplicate"  # inside the window
    assert store.process("evt-1", clock=25) == "new"  # outside the window — no longer remembered

    # A Bloom filter: every id actually inserted is always found (no false negatives ever).
    inserted = [f"evt-{i}" for i in range(500)]
    bf = TinyBloomFilter(size=4000, num_hashes=4)
    for eid in inserted:
        bf.add(eid)
    assert all(bf.might_contain(eid) for eid in inserted)  # zero false negatives, always

    # Measure the real false-positive rate against ids that were never inserted.
    never_inserted = [f"never-{i}" for i in range(5000)]
    false_positives = sum(1 for eid in never_inserted if bf.might_contain(eid))
    false_positive_rate = false_positives / len(never_inserted)
    assert 0 < false_positive_rate < 0.05  # small, nonzero, and bounded — a real measured cost

    # A derived event's id is computed the same way every time from its own inputs, letting a
    # second processing stage deduplicate it exactly the way the first stage deduplicates raw
    # events — the same mechanism, propagated one hop further.
    derived_a = deterministic_id("order-42", "shipped")
    derived_b = deterministic_id("order-42", "shipped")  # recomputed from the same inputs
    derived_c = deterministic_id("order-43", "shipped")  # genuinely different input
    assert derived_a == derived_b
    assert derived_a != derived_c

    downstream_store = TTLDedupStore(ttl=10)
    assert downstream_store.process(derived_a, clock=0) == "new"
    assert downstream_store.process(derived_b, clock=1) == "duplicate"  # same derived id, caught

    print("dedup inside window:", store.process("evt-1", clock=26))
    print("Bloom filter false-positive rate on 5000 unseen ids:", false_positive_rate)
    print("derived id stable across recomputation:", derived_a == derived_b)
    print("downstream dedup catches the recomputed derived id:", downstream_store.process(derived_a, clock=2))


if __name__ == "__main__":
    run()
