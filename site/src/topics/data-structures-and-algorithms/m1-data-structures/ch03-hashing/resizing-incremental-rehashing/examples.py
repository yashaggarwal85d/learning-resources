"""Every number this topic's reel puts on screen is computed here, never asserted from Redis's own
cited numbers alone.

Two real hash tables are built from scratch, both growing by doubling, differing only in HOW they
pay for rehashing when the table is full: one rehashes every existing entry in one single insert
(the textbook "doubling" answer); the other spreads the same total rehashing work across many
operations, a bounded number of buckets at a time, exactly as Redis's own dict.c describes its own
incremental migration. Both run the identical insert sequence, so any difference measured below is
purely about WHEN the same total work gets paid, not how much of it there is.
"""

import random

INITIAL_CAPACITY = 8
LOAD_FACTOR = 0.75  # trigger a resize once the table is this full
STEP_K = 4  # incremental migration's own bound: buckets moved per operation


def h(key):
    return hash(key) & 0xFFFFFFFFFFFFFFFF


class DoublingTable:
    """Doubles capacity and rehashes every entry in a single insert, all at once."""

    def __init__(self):
        self.capacity = INITIAL_CAPACITY
        self.buckets = [[] for _ in range(self.capacity)]
        self.count = 0

    def insert(self, key):
        cost = 1  # the ordinary cost of placing one key
        idx = h(key) % self.capacity
        if key not in self.buckets[idx]:
            self.buckets[idx].append(key)
            self.count += 1
        if self.count > self.capacity * LOAD_FACTOR:
            old_buckets, old_capacity = self.buckets, self.capacity
            self.capacity = old_capacity * 2
            self.buckets = [[] for _ in range(self.capacity)]
            moved = 0
            for bucket in old_buckets:
                for existing_key in bucket:
                    self.buckets[h(existing_key) % self.capacity].append(existing_key)
                    moved += 1
            cost += moved
        return cost


class IncrementalTable:
    """Keeps an old and a new table live during a resize, migrating STEP_K buckets per operation,
    piggybacked on ordinary inserts -- Redis dict.c's own design, not a background thread."""

    def __init__(self):
        self.capacity = INITIAL_CAPACITY
        self.buckets = [[] for _ in range(self.capacity)]
        self.count = 0
        self.old_buckets = None
        self.old_capacity = 0
        self.migrate_idx = 0
        self.migrating_ops = 0  # operations spent with both tables live, measured honestly

    def _migration_step(self):
        cost = 0
        steps_left = STEP_K
        while steps_left > 0 and self.migrate_idx < self.old_capacity:
            bucket = self.old_buckets[self.migrate_idx]
            for existing_key in bucket:
                self.buckets[h(existing_key) % self.capacity].append(existing_key)
                cost += 1
            self.migrate_idx += 1
            steps_left -= 1
        if self.migrate_idx >= self.old_capacity:
            self.old_buckets = None
            self.old_capacity = 0
            self.migrate_idx = 0
        return cost

    def insert(self, key):
        cost = 0
        if self.old_buckets is not None:
            cost += self._migration_step()
            self.migrating_ops += 1
        idx = h(key) % self.capacity
        if key not in self.buckets[idx]:
            self.buckets[idx].append(key)
            self.count += 1
        cost += 1
        if self.old_buckets is None and self.count > self.capacity * LOAD_FACTOR:
            self.old_buckets, self.old_capacity = self.buckets, self.capacity
            self.capacity = self.old_capacity * 2
            self.buckets = [[] for _ in range(self.capacity)]
            self.migrate_idx = 0
        return cost


random.seed(20261023)
N = 4000
keys = [f"req-{random.randint(0, 10**9)}" for _ in range(N)]

doubling = DoublingTable()
incremental = IncrementalTable()
doubling_costs = [doubling.insert(k) for k in keys]
incremental_costs = [incremental.insert(k) for k in keys]

max_doubling = max(doubling_costs)
max_incremental = max(incremental_costs)
total_doubling = sum(doubling_costs)
total_incremental = sum(incremental_costs)

print(f"{N} inserts, two resize strategies, identical key sequence:")
print(f"  doubling:    worst single insert cost = {max_doubling}, total work = {total_doubling}")
print(f"  incremental: worst single insert cost = {max_incremental}, total work = {total_incremental}")
print(f"  doubling's worst insert costs {max_doubling / max_incremental:.1f}x incremental's worst insert")

# The real asymmetry: doubling's worst single insert must scale with the table size at the moment
# it resizes (it rehashes every existing entry at once); incremental's worst single insert stays
# bounded by STEP_K's own cap, no matter how large the table ever gets.
assert max_doubling > 10 * max_incremental, (
    "doubling's worst single insert should be far larger than incremental's bounded worst insert"
)
assert max_incremental <= 3 * STEP_K, (
    f"incremental's worst single insert ({max_incremental}) should stay within a small multiple "
    f"of STEP_K ({STEP_K}) -- a bucket may hold more than one key, but it can't grow unbounded"
)

# Both strategies do the same total rehashing work across the same sequence of resizes (same
# growth schedule, same threshold) -- what differs is the schedule they pay it on, not the amount.
# A small gap is expected if the sequence ends mid-migration (incremental hasn't finished moving
# the last resize's entries yet); it must stay far smaller than either strategy's own total.
gap = abs(total_doubling - total_incremental)
print(f"  gap between the two totals: {gap} (expected only if the run ends mid-migration)")
assert gap < 0.05 * total_doubling, (
    f"both strategies should move almost the same total number of entries overall: "
    f"doubling={total_doubling}, incremental={total_incremental}, gap={gap}"
)

# The real memory trade-off: how many operations does each strategy hold both tables live for?
# Doubling holds them only for the one triggering insert itself; incremental holds them for every
# operation until migration finishes -- a genuinely longer, sustained window, not a momentary one.
print(f"\n  incremental held both tables live across {incremental.migrating_ops} operations total")
print("  doubling holds both tables live for exactly 1 operation, each time it resizes")
assert incremental.migrating_ops > 50, (
    "incremental migration should hold both tables live across many operations, not a handful"
)

if __name__ == "__main__":
    print("\nAll checks passed.")
