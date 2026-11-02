"""de.cache-consistency-invalidation — executable evidence.

Reproduces the real delete-after-write race against a cache-aside layer, with the exact
interleaving where a reader's own stale read lands in the cache after a writer's delete — and
then reproduces the lease fix (Nishtala et al.'s own mechanism) that closes it. This topic also
hosts the chapter lab's other two legs (CHAPTER.md's own Lab field): single-flight coalescing and
early expiration, both measured against a simulated hot key under many concurrent readers, since
the syllabus's own stampede topic that would otherwise teach them is skipped.
"""

import itertools

database = {}
cache = {}


def thundering_herd(n_readers, backing_fetch):
    """The unprotected baseline: every concurrent reader misses the cache (already expired) and
    goes straight to the backing store, one fetch each — the database spike the chapter's own
    lab measures before any protection is added."""
    fetches = 0
    for _ in range(n_readers):
        backing_fetch()
        fetches += 1
    return fetches


class SingleFlightCache:
    """A cache-aside layer with single-flight coalescing: concurrent misses for the same key
    share one in-flight backing-store fetch instead of each triggering their own."""

    def __init__(self, backing_fetch):
        self.store = {}
        self.backing_fetch = backing_fetch
        self.in_flight = {}  # key -> the single shared result once fetched this round
        self.fetch_count = 0

    def get(self, key):
        if key in self.store:
            return self.store[key]
        if key not in self.in_flight:
            self.fetch_count += 1
            self.in_flight[key] = self.backing_fetch()
        return self.in_flight[key]

    def settle_round(self, key):
        """All concurrent misses for this round have now been served from the one shared fetch;
        the result is written back to the cache and the in-flight marker is cleared."""
        self.store[key] = self.in_flight.pop(key)


def early_expiration_probability(now, ttl, beta=1.0):
    """XFetch-style probabilistic early expiration: as a key's remaining TTL shrinks, the chance
    any one reader treats it as already expired (and refreshes it early) rises smoothly, instead
    of every reader expiring it at the exact same instant."""
    remaining = ttl - now
    if remaining <= 0:
        return 1.0
    return pow(2.718281828, -beta * remaining)


def reset(key, value):
    database.clear()
    cache.clear()
    database[key] = value


def race_without_leases(key):
    """The exact interleaving the hook describes: a reader misses, starts a slow read of the old
    value, a writer updates the database and deletes the cache key, and only then does the
    reader's own stale write-back land — reinstating the stale value with nothing left to correct
    it."""
    stale_value = database[key]  # the reader's slow read, captured before the writer's update
    database[key] = "v2"  # the writer updates the database
    cache.pop(key, None)  # the writer deletes the cache key, per Memcache's own design
    cache[key] = stale_value  # the reader's stale write-back lands after the delete
    return cache[key]


class LeaseCache:
    """A minimal reproduction of Memcache's own lease mechanism: a cache miss hands out a lease
    token bound to that key; a later delete for the same key invalidates any outstanding lease,
    so a stale set carrying an old token is rejected rather than stored."""

    def __init__(self):
        self.store = {}
        self.leases = {}
        self._next_token = itertools.count(1)

    def get_or_lease(self, key):
        if key in self.store:
            return self.store[key], None
        token = next(self._next_token)
        self.leases[key] = token
        return None, token

    def set_with_lease(self, key, value, token):
        if self.leases.get(key) != token:
            return False  # the token was invalidated by a delete since it was issued
        self.store[key] = value
        return True

    def delete(self, key):
        self.store.pop(key, None)
        self.leases.pop(key, None)  # invalidates any outstanding lease for this key


def race_with_leases(key, initial_value, new_value):
    lease_cache = LeaseCache()
    lease_cache.store[key] = initial_value
    lease_cache.delete(key)  # simulate the key already being cold, as in the hook
    _, reader_token = lease_cache.get_or_lease(key)  # reader's miss hands out a lease
    database[key] = new_value  # writer updates the database
    lease_cache.delete(key)  # writer's delete invalidates the reader's own lease token
    accepted = lease_cache.set_with_lease(key, initial_value, reader_token)  # reader's stale write-back
    return accepted, lease_cache.store.get(key)


def run():
    reset("user:42:name", "Alice")
    result = race_without_leases("user:42:name")
    print(f"Without leases, the cache ends up holding: {result!r} (the database has: {database['user:42:name']!r})")
    assert result == "Alice"  # the stale value won the race
    assert database["user:42:name"] == "v2"
    assert result != database["user:42:name"]

    accepted, final = race_with_leases("user:42:name", "Alice", "Bob")
    print(f"\nWith leases, the reader's stale write-back was accepted: {accepted} — cache now holds: {final!r}")
    assert accepted is False  # the stale write-back was rejected
    assert final is None  # the cache stays cold instead of holding the stale value

    n_readers = 50
    herd_fetches = thundering_herd(n_readers, lambda: "value")
    print(f"\nUnprotected: {n_readers} concurrent readers on an expired key caused {herd_fetches} backing-store fetches.")
    assert herd_fetches == n_readers

    sf_cache = SingleFlightCache(lambda: "value")
    for _ in range(n_readers):
        sf_cache.get("hot-key")
    sf_cache.settle_round("hot-key")
    print(f"Single-flight coalescing: the same {n_readers} readers caused {sf_cache.fetch_count} backing-store fetch(es).")
    assert sf_cache.fetch_count == 1

    probabilities = [early_expiration_probability(now=t, ttl=100) for t in range(90, 100)]
    far_from_expiry = sum(probabilities[:3])
    close_to_expiry = sum(probabilities[-3:])
    print(f"Early expiration: refresh probability far from expiry sums to {far_from_expiry:.4f}; close to expiry, {close_to_expiry:.4f}.")
    assert close_to_expiry > far_from_expiry
    assert all(0.0 < p < 1.0 for p in probabilities)  # smooth, never an all-at-once cliff at exact expiry


if __name__ == "__main__":
    run()
