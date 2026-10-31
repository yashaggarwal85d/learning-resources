"""No live lab of its own (per CHAPTER.md): this topic's own trade-offs are computed directly,
each one a real simulation over real key distributions, not a diagram. A range-partitioned key
space really does concentrate writes where the ordered key space concentrates them (an
append-heavy, timestamp-ordered workload); a hash-partitioned key space really does spread the
same workload evenly. Naive modulo hashing really does remap almost every key when the node count
changes; consistent hashing with virtual nodes really does move only a small, bounded fraction.
"""

import hashlib
from collections import defaultdict


def _stable_hash(key: str) -> int:
    return int(hashlib.sha256(key.encode()).hexdigest(), 16)


# --- Range vs hash partitioning: a hot tail, demonstrated on a real timestamp-ordered workload. ---

def range_partitioning_concentrates_an_ordered_write_workload(num_keys=10_000, num_partitions=10, recent_window=500):
    # Timestamp-ordered keys (newest events keep arriving with the largest key) land in whichever
    # partition owns the current tail of the key space. Over the whole history, that's one roughly
    # even-sized partition per range -- the hot-tail problem isn't about the total, it's about
    # where *new* writes land right now: every one of the most recent writes hits the single
    # partition that currently owns the growing tail, while every older partition sees zero new
    # traffic at all.
    keys = [f"event-{i:08d}" for i in range(num_keys)]
    partition_width = num_keys // num_partitions
    writes_per_partition = defaultdict(int)
    for i, _key in enumerate(keys):
        partition = min(i // partition_width, num_partitions - 1)
        writes_per_partition[partition] += 1
    hottest = max(writes_per_partition.values())
    coldest = min(writes_per_partition.values())

    recent_keys = keys[-recent_window:]
    recent_partitions_touched = {min(i // partition_width, num_partitions - 1) for i in range(num_keys - recent_window, num_keys)}
    assert len(recent_partitions_touched) == 1, (
        f"expected every one of the most recent {recent_window} writes to land on a single tail partition, touched {len(recent_partitions_touched)}"
    )
    return hottest, coldest, recent_window, len(recent_partitions_touched)


def hash_partitioning_spreads_the_identical_workload(num_keys=10_000, num_partitions=10, recent_window=500):
    keys = [f"event-{i:08d}" for i in range(num_keys)]
    writes_per_partition = defaultdict(int)
    for key in keys:
        partition = _stable_hash(key) % num_partitions
        writes_per_partition[partition] += 1
    counts = list(writes_per_partition.values())
    hottest, coldest = max(counts), min(counts)
    # Even spread: no partition should hold much more than an even share of the keys.
    expected = num_keys / num_partitions
    assert hottest < expected * 1.25, f"expected roughly even spread, hottest partition got {hottest} vs expected {expected:.0f}"

    # The same recent window that concentrated on one partition under range partitioning spreads
    # across most partitions here, because consecutive timestamp-ordered keys hash to unrelated
    # buckets.
    recent_keys = keys[-recent_window:]
    recent_partitions_touched = {_stable_hash(key) % num_partitions for key in recent_keys}
    assert len(recent_partitions_touched) > num_partitions * 0.7, (
        f"expected the same recent window to spread across most partitions under hash partitioning, touched {len(recent_partitions_touched)}/{num_partitions}"
    )
    return hottest, coldest, len(recent_partitions_touched)


def hash_partitioning_cannot_do_an_efficient_range_scan(num_keys=10_000, num_partitions=10):
    # Scanning "events 100 through 200" under hash partitioning means touching every partition,
    # because consecutive keys hash to unrelated partitions -- there is no contiguous range to read.
    scan_keys = [f"event-{i:08d}" for i in range(100, 200)]
    touched_partitions = {_stable_hash(key) % num_partitions for key in scan_keys}
    assert len(touched_partitions) > num_partitions * 0.5, (
        f"expected a small ordered scan to touch most partitions under hash partitioning, touched {len(touched_partitions)}/{num_partitions}"
    )
    return len(touched_partitions)


# --- Naive modulo hashing vs consistent hashing: data movement on membership change. ---

def naive_modulo_hashing_remaps_almost_everything_on_resize(num_keys=10_000):
    keys = [f"key-{i}" for i in range(num_keys)]
    before = {key: _stable_hash(key) % 10 for key in keys}
    after = {key: _stable_hash(key) % 11 for key in keys}  # one node added
    remapped = sum(1 for key in keys if before[key] != after[key])
    remapped_fraction = remapped / num_keys
    assert remapped_fraction > 0.85, f"expected naive modulo hashing to remap nearly everything, got {remapped_fraction:.2%}"
    return remapped_fraction


class ConsistentHashRing:
    def __init__(self, nodes, virtual_nodes_per_node=100):
        self.ring: dict[int, str] = {}
        self.virtual_nodes_per_node = virtual_nodes_per_node
        for node in nodes:
            self._add_node(node)

    def _add_node(self, node: str):
        for v in range(self.virtual_nodes_per_node):
            token = _stable_hash(f"{node}#{v}")
            self.ring[token] = node

    def remove_node(self, node: str):
        for v in range(self.virtual_nodes_per_node):
            token = _stable_hash(f"{node}#{v}")
            del self.ring[token]

    def owner(self, key: str) -> str:
        token = _stable_hash(key)
        candidates = sorted(t for t in self.ring if t >= token)
        chosen = candidates[0] if candidates else min(self.ring)
        return self.ring[chosen]


def consistent_hashing_moves_only_a_small_fraction_on_resize(num_keys=10_000):
    nodes = [f"node-{i}" for i in range(10)]
    keys = [f"key-{i}" for i in range(num_keys)]
    ring = ConsistentHashRing(nodes)
    before = {key: ring.owner(key) for key in keys}

    ring._add_node("node-10")  # one node added, same virtual-node mechanism
    after = {key: ring.owner(key) for key in keys}

    remapped = sum(1 for key in keys if before[key] != after[key])
    remapped_fraction = remapped / num_keys
    # Adding the 11th of 11 nodes should move roughly 1/11 of the keys, not nearly all of them.
    assert remapped_fraction < 0.20, f"expected consistent hashing to move a small fraction, got {remapped_fraction:.2%}"
    return remapped_fraction


# --- Rendezvous (HRW) hashing: the same minimal-movement property, computed independently per client. ---

def rendezvous_hashing_also_moves_only_a_small_fraction_on_resize(num_keys=10_000):
    def hrw_owner(key: str, nodes: list[str]) -> str:
        # Each client computes this independently: no shared ring state needed.
        return max(nodes, key=lambda node: _stable_hash(f"{key}:{node}"))

    nodes_before = [f"node-{i}" for i in range(10)]
    nodes_after = nodes_before + ["node-10"]
    keys = [f"key-{i}" for i in range(num_keys)]

    before = {key: hrw_owner(key, nodes_before) for key in keys}
    after = {key: hrw_owner(key, nodes_after) for key in keys}

    remapped = sum(1 for key in keys if before[key] != after[key])
    remapped_fraction = remapped / num_keys
    assert remapped_fraction < 0.20, f"expected HRW to move a small fraction too, got {remapped_fraction:.2%}"
    return remapped_fraction


def main():
    hottest_range, coldest_range, recent_window, recent_touched_range = range_partitioning_concentrates_an_ordered_write_workload()
    hottest_hash, coldest_hash, recent_touched_hash = hash_partitioning_spreads_the_identical_workload()
    touched = hash_partitioning_cannot_do_an_efficient_range_scan()
    naive_remap = naive_modulo_hashing_remaps_almost_everything_on_resize()
    consistent_remap = consistent_hashing_moves_only_a_small_fraction_on_resize()
    hrw_remap = rendezvous_hashing_also_moves_only_a_small_fraction_on_resize()

    print(f"range partitioning: the most recent {recent_window} writes all landed on {recent_touched_range} partition (the tail)")
    print(f"hash partitioning, the same recent writes: spread across {recent_touched_hash} of 10 partitions")
    print(f"range partitioning totals over the whole run: hottest={hottest_range}, coldest={coldest_range}")
    print(f"hash partitioning totals over the whole run: hottest={hottest_hash}, coldest={coldest_hash}")
    print(f"hash partitioning range scan touched {touched} of 10 partitions")
    print(f"naive modulo hashing remapped {naive_remap:.1%} of keys on one node joining")
    print(f"consistent hashing remapped {consistent_remap:.1%} of keys on the same node joining")
    print(f"rendezvous (HRW) hashing remapped {hrw_remap:.1%} of keys on the same node joining")
    print("partitioning-schemes-range-hash examples: all checks pass")


if __name__ == "__main__":
    main()
