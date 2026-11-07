"""
dsa.consistent-hashing-inside-sharded -- every number the reel shows, computed and asserted.

Three real partition-assignment schemes, measured on the same ten-node-to-eleven growth and the
same traffic stream:

1. A token ring (Chapter 3's own mechanism, one point per node) -- Cassandra's "Consistent
   Hashing using a Token Ring".
2. A fixed-slot table (16384 slots) -- Redis Cluster's scheme: HASH_SLOT = CRC16(key) mod 16384,
   with slots, not keys, reassigned when a node joins.
3. Plain modulo hashing -- Kafka's BuiltInPartitioner: hash(key) mod numPartitions, with no
   stability property at all.

Then a hot key under plain placement and under bounded-load placement (HAProxy's
hash-balance-factor), measured as the maximum node load against the average.
"""

import hashlib
import random

RING_SIZE = 2**32


def h(s):
    # CPython's built-in hash() of a str is randomly seeded per process (PYTHONHASHSEED), so a
    # fixed digest hash is used here instead, to keep every number below reproducible run to run.
    return int.from_bytes(hashlib.md5(s.encode()).digest()[:4], "big") % RING_SIZE


# ---------------------------------------------------------------------------
# 1. Token ring (reusing Chapter 3's own mechanism).
# ---------------------------------------------------------------------------

class Ring:
    def __init__(self, points_per_node=1):
        self.points_per_node = points_per_node
        self.points = []  # sorted (position, node)
        self.nodes = set()

    def add_node(self, name):
        self.nodes.add(name)
        for i in range(self.points_per_node):
            self.points.append((h(f"{name}#{i}"), name))
        self.points.sort()

    def owner(self, key):
        pos = h(key)
        lo, hi = 0, len(self.points)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.points[mid][0] >= pos:
                hi = mid
            else:
                lo = mid + 1
        idx = lo if lo < len(self.points) else 0
        return self.points[idx][1]


# ---------------------------------------------------------------------------
# 2. Fixed-slot table (Redis Cluster): NUM_SLOTS slots, assigned to nodes; a
#    join moves whole slots to the new node to rebalance, nothing else.
# ---------------------------------------------------------------------------

NUM_SLOTS = 16384


def slot_of(key):
    return h(key) % NUM_SLOTS


def assign_slots_evenly(node_names):
    """Round-robin assignment: slot i belongs to node_names[i % len(node_names)]."""
    n = len(node_names)
    return {slot: node_names[slot % n] for slot in range(NUM_SLOTS)}


def rebalance_slots_for_join(owner_by_slot, old_nodes, new_node):
    """A real resharding operation moves only as many slots as needed to give the new
    node its fair share, taken evenly from the existing nodes -- not a full reassignment."""
    n_new = len(old_nodes) + 1
    fair_share = NUM_SLOTS // n_new
    new_owner = dict(owner_by_slot)
    moved = 0
    # Take `fair_share` slots for the new node, a few from each old node in turn.
    by_node = {}
    for slot, node in owner_by_slot.items():
        by_node.setdefault(node, []).append(slot)
    take_per_node = fair_share // len(old_nodes)
    for node in old_nodes:
        for slot in by_node[node][:take_per_node]:
            new_owner[slot] = new_node
            moved += 1
        if moved >= fair_share:
            break
    return new_owner, moved


# ---------------------------------------------------------------------------
# 3. Plain modulo hashing (Kafka's BuiltInPartitioner): hash(key) mod n.
# ---------------------------------------------------------------------------

def modulo_owner(key, n):
    return h(key) % n


# ---------------------------------------------------------------------------
# The three-way growth comparison: 10 nodes -> 11 nodes.
# ---------------------------------------------------------------------------

random.seed(20261107)
NUM_KEYS = 20_000
keys = [f"key-{random.randint(0, 10**12)}" for _ in range(NUM_KEYS)]

OLD_NODES = [f"node-{i}" for i in range(10)]
NEW_NODE = "node-10"

# -- Ring --
ring_before = Ring(points_per_node=1)
for node in OLD_NODES:
    ring_before.add_node(node)
ring_owner_before = {k: ring_before.owner(k) for k in keys}

ring_after = Ring(points_per_node=1)
for node in OLD_NODES:
    ring_after.add_node(node)
ring_after.add_node(NEW_NODE)
ring_owner_after = {k: ring_after.owner(k) for k in keys}

ring_moved = sum(1 for k in keys if ring_owner_before[k] != ring_owner_after[k])
ring_moved_fraction = ring_moved / NUM_KEYS

# A ring should move roughly 1/11 of keys (the joining node's fair share), not all of them.
assert 0.03 < ring_moved_fraction < 0.20, f"ring should move a small fraction, got {ring_moved_fraction:.4f}"

# -- Fixed-slot table --
slot_owner_before_table = assign_slots_evenly(OLD_NODES)
slot_owner_before = {k: slot_owner_before_table[slot_of(k)] for k in keys}

slot_owner_after_table, slots_moved = rebalance_slots_for_join(slot_owner_before_table, OLD_NODES, NEW_NODE)
slot_owner_after = {k: slot_owner_after_table[slot_of(k)] for k in keys}

slot_moved = sum(1 for k in keys if slot_owner_before[k] != slot_owner_after[k])
slot_moved_fraction = slot_moved / NUM_KEYS

assert slots_moved == NUM_SLOTS // 11 - (NUM_SLOTS // 11) % 10, slots_moved
assert 0.03 < slot_moved_fraction < 0.20, f"a fixed-slot rebalance should also move a small, controlled fraction, got {slot_moved_fraction:.4f}"

# -- Modulo hashing --
modulo_owner_before = {k: modulo_owner(k, 10) for k in keys}
modulo_owner_after = {k: modulo_owner(k, 11) for k in keys}
modulo_moved = sum(1 for k in keys if modulo_owner_before[k] != modulo_owner_after[k])
modulo_moved_fraction = modulo_moved / NUM_KEYS

# Textbook claim: modulo hashing moves almost every key when the modulus changes.
assert modulo_moved_fraction > 0.85, f"modulo hashing should move almost all keys, got {modulo_moved_fraction:.4f}"

# The surprise, stated as a comparison: the ring and the slot table both move far less than
# modulo hashing, and by a comparable amount to each other.
assert ring_moved_fraction < modulo_moved_fraction / 4
assert slot_moved_fraction < modulo_moved_fraction / 4


# ---------------------------------------------------------------------------
# Hot key: plain placement vs. bounded-load placement (HAProxy's hash-balance-factor).
# ---------------------------------------------------------------------------

def traffic_stream(num_requests, hot_key, hot_share):
    n_hot = int(num_requests * hot_share)
    n_cold = num_requests - n_hot
    reqs = [hot_key] * n_hot + [f"req-{i}" for i in range(n_cold)]
    random.shuffle(reqs)
    return reqs


NUM_REQUESTS = 40_000
HOT_SHARE = 0.25
HOT_KEY = "customer-most-popular"

requests = traffic_stream(NUM_REQUESTS, HOT_KEY, HOT_SHARE)

plain_ring = Ring(points_per_node=1)
for node in OLD_NODES:
    plain_ring.add_node(node)

plain_load = {node: 0 for node in OLD_NODES}
for req in requests:
    plain_load[plain_ring.owner(req)] += 1

plain_max = max(plain_load.values())
plain_avg = NUM_REQUESTS / len(OLD_NODES)
plain_ratio = plain_max / plain_avg

# A quarter of all traffic lands on one node under plain placement, far above a fair share.
assert plain_ratio > 2.0, f"a hot key should badly overload one node under plain placement, got {plain_ratio:.2f}x"

# Does a large virtual-node count help the hot key? No: a single key still hashes to exactly
# one ring position, however many points every node owns, so the key still lands on exactly
# one node's slice. Measured directly, not assumed.
VIRTUAL_POINTS = 1000
many_vnode_ring = Ring(points_per_node=VIRTUAL_POINTS)
for node in OLD_NODES:
    many_vnode_ring.add_node(node)

vnode_load = {node: 0 for node in OLD_NODES}
for req in requests:
    vnode_load[many_vnode_ring.owner(req)] += 1

vnode_max = max(vnode_load.values())
vnode_ratio = vnode_max / plain_avg

# Virtual nodes smooth the *ordinary* key distribution (Chapter 3's own result), but they do
# nothing to help one single hot key, which still has exactly one ring position: the node
# boundaries move, not the key's own point. Which exact node ends up owning it, and how close
# that node's other traffic happens to sit, varies by key and is not claimed to shrink here --
# only that virtual nodes give no systematic improvement, which a lower ratio would contradict.
assert vnode_ratio > plain_ratio * 0.7, (
    f"virtual nodes should not meaningfully reduce the hot-key ratio, got {plain_ratio:.2f}x vs {vnode_ratio:.2f}x"
)


def bounded_owner(ring, load, factor, key):
    """HAProxy's own rule: walk the ring from the first-choice node; skip any node whose
    current load already exceeds `factor` times the average, until one has room."""
    pos = h(key)
    lo, hi = 0, len(ring.points)
    while lo < hi:
        mid = (lo + hi) // 2
        if ring.points[mid][0] >= pos:
            hi = mid
        else:
            lo = mid + 1
    n = len(ring.points)
    avg = sum(load.values()) / len(load) if sum(load.values()) else 0
    cap = factor * max(avg, 1)
    for step in range(n):
        idx = (lo + step) % n
        node = ring.points[idx][1]
        if load[node] < cap:
            return node
    return ring.points[lo % n][1]


BALANCE_FACTOR = 1.5  # HAProxy's own example value: "if <factor> is 150, ... 1.5 times the average"

bounded_load = {node: 0 for node in OLD_NODES}
for req in requests:
    node = bounded_owner(plain_ring, bounded_load, BALANCE_FACTOR, req)
    bounded_load[node] += 1

bounded_max = max(bounded_load.values())
bounded_ratio = bounded_max / plain_avg

assert bounded_ratio < plain_ratio, "bounded load must reduce the busiest node's share versus plain placement"
assert bounded_ratio < BALANCE_FACTOR + 0.5, f"bounded load should keep the busiest node near the stated factor, got {bounded_ratio:.2f}x"


if __name__ == "__main__":
    print(f"ring moved: {ring_moved_fraction:.4f}")
    print(f"slot table moved: {slot_moved_fraction:.4f}")
    print(f"modulo moved: {modulo_moved_fraction:.4f}")
    print(f"plain hot-key ratio: {plain_ratio:.2f}x average")
    print(f"bounded hot-key ratio: {bounded_ratio:.2f}x average")
    print("All assertions passed.")
