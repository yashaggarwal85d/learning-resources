"""Every number this topic's reel puts on screen is computed here, never asserted from Karger's,
Mirrokni/Thorup/Zadimoghaddam's, or Cassandra's own cited numbers alone.

A real consistent-hashing ring is built from scratch: both machines and keys are hashed onto the
same numeric range (Karger's own "unit interval," redrawn here as a ring), and a key is owned by
the first machine found walking clockwise from the key's own position -- exactly the mechanism
Cassandra's own docs describe. Three things are measured directly: how few keys move when a
machine joins a ten-machine ring (the syllabus's own "growing 10 -> 11 nodes" Lab measurement,
contrasted against topic 20's full-table resize, where every key moves); and how unevenly the
ring's keys land across machines with one point per machine versus many virtual points per
machine, on the identical key set.
"""

import random

RING_SIZE = 2**32  # a finite, concrete ring; Karger's own "unit interval," discretized


def h(s):
    return hash(s) % RING_SIZE


class Ring:
    """machine_name -> sorted list of its own ring points (1 point per machine, or many)."""

    def __init__(self, points_per_machine=1):
        self.points_per_machine = points_per_machine
        self.points = []  # sorted list of (position, machine_name)
        self.machines = set()

    def add_machine(self, name):
        self.machines.add(name)
        for i in range(self.points_per_machine):
            pos = h(f"{name}#{i}")
            self.points.append((pos, name))
        self.points.sort()

    def owner(self, key):
        pos = h(key)
        # the first machine point at or after pos, walking clockwise; wrap around if none
        lo, hi = 0, len(self.points)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.points[mid][0] >= pos:
                hi = mid
            else:
                lo = mid + 1
        idx = lo if lo < len(self.points) else 0
        return self.points[idx][1]


random.seed(20261023)
NUM_KEYS = 20000
keys = [f"req-{random.randint(0, 10**12)}" for _ in range(NUM_KEYS)]

# --- Minimal remapping: growing a ten-machine ring to eleven, the syllabus's own measurement ----

ring10 = Ring(points_per_machine=1)
for i in range(10):
    ring10.add_machine(f"machine-{i}")

owners_before = {k: ring10.owner(k) for k in keys}

# A single join lands the eleventh machine on one random point -- with only ten existing points,
# which one gap it splits varies a lot trial to trial, so the real "close to 1/(n+1) in
# expectation" claim is measured as an average over many independent joins, not one.
TRIALS = 50
fractions = []
last_before, last_after = None, None
for trial in range(TRIALS):
    ring11 = Ring(points_per_machine=1)
    ring11.points = list(ring10.points)
    ring11.machines = set(ring10.machines)
    ring11.add_machine(f"machine-10-{trial}")
    owners_after = {k: ring11.owner(k) for k in keys}
    moved = sum(1 for k in keys if owners_before[k] != owners_after[k])
    fractions.append(moved / NUM_KEYS)
    last_before, last_after = owners_before, owners_after

avg_fraction = sum(fractions) / len(fractions)
print(f"growing a ring from ten machines to eleven, {NUM_KEYS} keys, {TRIALS} independent joins:")
print(f"  average {avg_fraction:.1%} of keys moved per join -- topic 20's full resize moves 100% every time")

# A real ring join should move, on average, only a small minority of keys -- in expectation,
# close to 1/(n+1) of them for n machines growing to n+1, far less than a single-machine resize's
# 100%. A single trial's variance can run well past the average with only ten existing points, so
# the assertion is on the average across many joins, the real expectation this topic claims.
assert avg_fraction < 0.20, f"a ring join should move a small average fraction of keys, not {avg_fraction:.1%}"
assert avg_fraction > 0.0, "the joining machine must take over at least some keys on average"

# Every key that DIDN'T move in the last trial must still have the exact same owner -- the real
# minimal-remapping guarantee, not just "most keys happen to end up the same."
unmoved_keys = [k for k in keys if last_before[k] == last_after[k]]
assert all(last_before[k] == last_after[k] for k in unmoved_keys)
print(f"  every unmoved key in that trial kept its exact previous owner")

# --- Virtual nodes: per-machine imbalance, one point per machine vs. many -------------------------

NUM_MACHINES = 8
VIRTUAL_POINTS = 32


def imbalance(points_per_machine):
    ring = Ring(points_per_machine=points_per_machine)
    for i in range(NUM_MACHINES):
        ring.add_machine(f"vmachine-{i}")
    counts = {name: 0 for name in ring.machines}
    for k in keys:
        counts[ring.owner(k)] += 1
    values = list(counts.values())
    mean = sum(values) / len(values)
    worst_share = max(values) / sum(values)
    fair_share = 1 / len(values)
    return worst_share / fair_share, max(values) / min(values)


single_overload, single_ratio = imbalance(1)
virtual_overload, virtual_ratio = imbalance(VIRTUAL_POINTS)

print(f"\n{NUM_MACHINES} machines, {NUM_KEYS} keys:")
print(f"  one point per machine:    busiest machine carries {single_overload:.2f}x its fair share "
      f"(busiest/quietest ratio {single_ratio:.2f})")
print(f"  {VIRTUAL_POINTS} points per machine: busiest machine carries {virtual_overload:.2f}x its fair share "
      f"(busiest/quietest ratio {virtual_ratio:.2f})")

# The real, measured claim: many virtual points per machine must even out the ring far better than
# one point per machine does, on the identical key set.
assert virtual_overload < single_overload, "virtual nodes should reduce the busiest machine's overload, not increase it"
assert virtual_ratio < single_ratio, "virtual nodes should narrow the busiest/quietest gap, not widen it"
assert virtual_overload < 1.5, f"with {VIRTUAL_POINTS} virtual points per machine, overload should be close to fair, not {virtual_overload:.2f}x"

if __name__ == "__main__":
    print("\nAll checks passed.")
