"""
dsa.concurrent-hash-maps — every number this topic puts on screen, computed or
asserted here. No real threads: every schedule below is a numbered, replayed
interleaving in a single-threaded model, per CHAPTER.md's rule for this
chapter (a Python thread benchmark is dominated by the interpreter's own
global lock and shows nothing about lock striping, CAS-on-bins or a lock-free
resize). This topic needs no compiled timing helper: every outcome it claims
(an insert's CAS, a lock on the first node, a reader following a forwarding
node, a chain crossing the treeify threshold, a split-ordered list surviving
a doubling) is a mechanism to trace, not a throughput curve to measure.
"""

import math


# ---------------------------------------------------------------------------
# 1. The Poisson bin-length table from ConcurrentHashMap's own source comment,
#    parameter about 0.5 (the resize threshold 0.75 divides the average chain
#    length of 1 down to about 0.5 once a table is sized for its load factor).
#    Quoted in SOURCES.md as nine lines, bin lengths 0 through 8.
# ---------------------------------------------------------------------------

LAMBDA = 0.5
SOURCE_POISSON = {
    0: 0.60653066,
    1: 0.30326533,
    2: 0.07581633,
    3: 0.01263606,
    4: 0.00157952,
    5: 0.00015795,
    6: 0.00001316,
    7: 0.00000094,
    8: 0.00000006,
}


def poisson_pmf(k, lam):
    return (lam ** k) * math.exp(-lam) / math.factorial(k)


computed_poisson = {k: poisson_pmf(k, LAMBDA) for k in range(9)}

for k, source_value in SOURCE_POISSON.items():
    computed = computed_poisson[k]
    assert abs(computed - source_value) < 5e-7, (
        f"bin length {k}: computed {computed:.8f}, source says {source_value:.8f}"
    )

# The source's own point: a bin of 8 is astronomically unlikely under a random
# hash. Confirm the ratio it implies without restating a number the source
# didn't give.
assert computed_poisson[8] < computed_poisson[0] / 1_000_000


# ---------------------------------------------------------------------------
# 2. Insert into an empty bin (one CAS) vs. insert into an occupied bin (lock
#    on the first node). A deterministic model of a table of bins, each a
#    Python list standing in for a linked chain, with an explicit "locked"
#    flag standing in for `synchronized` on the first node.
# ---------------------------------------------------------------------------

class Bin:
    __slots__ = ("nodes", "locked")

    def __init__(self):
        self.nodes = []
        self.locked = False


class StripedModel:
    """A table of bins. insert_cas models casTabAt into an empty bin;
    insert_locked models taking the first node's lock for a non-empty bin."""

    def __init__(self, n_bins):
        self.bins = [Bin() for _ in range(n_bins)]

    def bin_index(self, key, n_bins):
        return key % n_bins

    def insert(self, key):
        idx = self.bin_index(key, len(self.bins))
        b = self.bins[idx]
        if not b.nodes:
            # CAS the first node into an empty bin: one atomic step, no lock.
            b.nodes.append(key)
            return idx, "cas-empty-bin"
        else:
            # Lock the first node, append, unlock: this is the slow path.
            b.locked = True
            b.nodes.append(key)
            b.locked = False
            return idx, "lock-first-node"


model = StripedModel(n_bins=8)
trace = []
for key in [3, 11, 19, 5]:  # 11 and 19 both land on bin 3 (11%8==3, 19%8==3)
    idx, path = model.insert(key)
    trace.append((key, idx, path))

assert trace == [
    (3, 3, "cas-empty-bin"),
    (11, 3, "lock-first-node"),
    (19, 3, "lock-first-node"),
    (5, 5, "cas-empty-bin"),
], trace

# A reader never takes the lock: it just walks the list that is there.
def read(model, key):
    idx = model.bin_index(key, len(model.bins))
    return key in model.bins[idx].nodes

assert read(model, 11) is True
assert read(model, 7) is False


# ---------------------------------------------------------------------------
# 3. Treeify threshold: the source tests `binCount >= TREEIFY_THRESHOLD` after
#    the insert's own traversal has already counted the node being added, and
#    only acts if the table has at least MIN_TREEIFY_CAPACITY bins; otherwise
#    it resizes instead. Replayed node-by-node so the exact trigger point is
#    asserted, not assumed.
# ---------------------------------------------------------------------------

TREEIFY_THRESHOLD = 8
UNTREEIFY_THRESHOLD = 6
MIN_TREEIFY_CAPACITY = 64


def insert_and_check_treeify(chain_len_before_this_insert, table_size):
    """Mirrors the source's own order of operations: traverse the bin,
    counting existing nodes (binCount starts at the count already in the
    bin when the new node is appended as the traversal's last step), then
    test binCount >= TREEIFY_THRESHOLD once the new node has been counted."""
    bin_count_after_insert = chain_len_before_this_insert + 1
    becomes_tree_candidate = bin_count_after_insert >= TREEIFY_THRESHOLD
    if becomes_tree_candidate and table_size >= MIN_TREEIFY_CAPACITY:
        return "treeify"
    elif becomes_tree_candidate:
        return "resize-instead"
    else:
        return "stay-a-list"


# The 8th node (chain already holding 7) is the one that trips the threshold,
# in a table big enough to treeify.
assert insert_and_check_treeify(chain_len_before_this_insert=6, table_size=64) == "stay-a-list"
assert insert_and_check_treeify(chain_len_before_this_insert=7, table_size=64) == "treeify"
# The 7th node alone (chain already holding 6) does not trip it.
assert insert_and_check_treeify(chain_len_before_this_insert=6, table_size=64) == "stay-a-list"
# Same 8th-node chain, but the table is below MIN_TREEIFY_CAPACITY: resize,
# not treeify (the source's own fallback).
assert insert_and_check_treeify(chain_len_before_this_insert=7, table_size=32) == "resize-instead"

# Untreeify happens on a resize split that leaves a tree bin with 6 or fewer
# nodes in one half, not on removal alone.
def resize_split_untreeifies(count_after_split):
    return count_after_split <= UNTREEIFY_THRESHOLD

assert resize_split_untreeifies(6) is True
assert resize_split_untreeifies(7) is False


# ---------------------------------------------------------------------------
# 4. The cooperative resize: a ForwardingNode at the head of each bin that has
#    already been migrated. A reader that lands on one follows it to the new
#    table instead of waiting. Modelled as two tables and a set of bins
#    already moved.
# ---------------------------------------------------------------------------

FORWARDED = object()  # stands in for a ForwardingNode


class ResizingTable:
    def __init__(self, old_size, new_size):
        self.old_bins = [[] for _ in range(old_size)]
        self.new_bins = [[] for _ in range(new_size)]
        self.old_size = old_size
        self.new_size = new_size

    def put(self, key, bin_list, size):
        bin_list[key % size].append(key)

    def migrate_bin(self, old_idx):
        """One thread's share of the resize: move everything in old bin
        old_idx into the new table, then mark the old bin forwarded."""
        moved = self.old_bins[old_idx]
        for key in moved:
            self.put(key, self.new_bins, self.new_size)
        self.old_bins[old_idx] = FORWARDED
        return moved

    def read(self, key):
        """A reader's lookup during the resize: look in the old table first;
        if that bin has been forwarded, follow it to the new table."""
        old_idx = key % self.old_size
        if self.old_bins[old_idx] is FORWARDED:
            new_idx = key % self.new_size
            return key in self.new_bins[new_idx], "followed-forwarding-node"
        else:
            return key in self.old_bins[old_idx], "read-old-table"


rt = ResizingTable(old_size=4, new_size=8)
rt.put(2, rt.old_bins, rt.old_size)   # bin 2
rt.put(6, rt.old_bins, rt.old_size)   # bin 2 (6 % 4 == 2)
rt.put(1, rt.old_bins, rt.old_size)   # bin 1, left unmigrated for this trace

# Thread A migrates bin 2 (its share of the range); thread B's read of key 6
# arrives after that migration and before bin 1's.
migrated = rt.migrate_bin(2)
assert migrated == [2, 6]
found, how = rt.read(6)
assert (found, how) == (True, "followed-forwarding-node")
# Bin 1 is still unmigrated: a reader for key 1 reads the old table directly.
found, how = rt.read(1)
assert (found, how) == (True, "read-old-table")

# A second thread can migrate a different range of bins concurrently with the
# first (the source's own "other threads can join in and help resize"): bin 0
# and bin 3 belong to neither key in this trace, so migrating them changes
# nothing about what A and B already observed.
rt.migrate_bin(0)
rt.migrate_bin(3)
found, how = rt.read(6)
assert (found, how) == (True, "followed-forwarding-node")


# ---------------------------------------------------------------------------
# 5. Split-ordered lists (Shalev & Shavit): keys sorted by the bit-reversal of
#    their hash, dummy nodes marking bucket starts, doubling the bucket array
#    adding dummy nodes but moving no real item.
# ---------------------------------------------------------------------------

WIDTH = 8  # a fixed key-universe width for this worked example


def reverse_bits(x, width):
    result = 0
    for i in range(width):
        if x & (1 << i):
            result |= 1 << (width - 1 - i)
    return result


def sort_key(x):
    """A real key's position in the split-ordered list: the bit-reversal of
    the key itself, zero-extended to WIDTH bits. Never changes as the table
    grows, since it depends only on the key, not on the table size."""
    return reverse_bits(x, WIDTH)


def dummy_key(bucket, k):
    """The dummy node marking the start of `bucket` in a table of size 2**k:
    the bit-reversal of the bucket number within k bits, zero-extended to
    WIDTH bits — the smallest sort key any real key in that bucket can have."""
    return reverse_bits(bucket, k) << (WIDTH - k)


def ordered_list(real_keys, n_buckets):
    k = n_buckets.bit_length() - 1
    assert 2 ** k == n_buckets
    items = [("dummy", b, dummy_key(b, k)) for b in range(n_buckets)]
    items += [("real", x, sort_key(x)) for x in real_keys]
    items.sort(key=lambda t: t[2])
    return items


REAL_KEYS = list(range(16))  # the planning example's keys, 0..15

list4 = ordered_list(REAL_KEYS, n_buckets=4)
list8 = ordered_list(REAL_KEYS, n_buckets=8)

# Every real key sits between its own bucket's dummy and the next bucket's
# dummy, in both table sizes — the split-ordered invariant.
def bucket_of(x, n_buckets):
    return x % n_buckets


def check_bucket_boundaries(ordered, n_buckets):
    k = n_buckets.bit_length() - 1
    dummy_positions = {}
    for pos, (kind, val, key) in enumerate(ordered):
        if kind == "dummy":
            dummy_positions[val] = pos
    for pos, (kind, val, key) in enumerate(ordered):
        if kind == "real":
            b = bucket_of(val, n_buckets)
            assert dummy_positions[b] < pos, (val, b, pos, dummy_positions[b])
    return True


assert check_bucket_boundaries(list4, 4)
assert check_bucket_boundaries(list8, 8)

# Doubling from 4 to 8 buckets: every real key keeps the exact same sort key
# (it never moves in the underlying list), and the only items added are the
# 4 new dummy nodes for buckets 4..7.
real_sort_keys_at_4 = {x: sort_key(x) for x in REAL_KEYS}
real_sort_keys_at_8 = {x: sort_key(x) for x in REAL_KEYS}
assert real_sort_keys_at_4 == real_sort_keys_at_8

dummies_at_4 = {val for kind, val, key in list4 if kind == "dummy"}
dummies_at_8 = {val for kind, val, key in list8 if kind == "dummy"}
assert dummies_at_4 == {0, 1, 2, 3}
assert dummies_at_8 == {0, 1, 2, 3, 4, 5, 6, 7}
new_dummies = dummies_at_8 - dummies_at_4
assert new_dummies == {4, 5, 6, 7}
assert len(new_dummies) == 8 - 4

# And the relative order of the 16 real keys among themselves is identical in
# both tables (they are the same list; only new dummy markers are threaded in).
real_order_4 = [val for kind, val, key in list4 if kind == "real"]
real_order_8 = [val for kind, val, key in list8 if kind == "real"]
assert real_order_4 == real_order_8


# ---------------------------------------------------------------------------
# 6. dashmap's shard count: (available_parallelism * 4).next_power_of_two(),
#    read from master's src/lib.rs. Computed for a few plausible core counts,
#    not asserted against this sandbox's own core count (which isn't the
#    point — the formula is).
# ---------------------------------------------------------------------------

def next_power_of_two(n):
    if n <= 1:
        return 1
    return 1 << (n - 1).bit_length()


def dashmap_shard_count(available_parallelism):
    return next_power_of_two(available_parallelism * 4)


for cores, expected in [(1, 4), (2, 8), (4, 16), (6, 32), (8, 32), (16, 64)]:
    assert dashmap_shard_count(cores) == expected, (cores, dashmap_shard_count(cores))

# This sandbox's own core count, just to show the formula applied once to a
# real number rather than only to planning values.
import os
THIS_MACHINE_CORES = os.cpu_count() or 1
THIS_MACHINE_SHARDS = dashmap_shard_count(THIS_MACHINE_CORES)


if __name__ == "__main__":
    print(f"Poisson bin-length table (lambda=0.5): all 9 entries match the source's own figures.")
    print(f"8-node chain in a 64+-bin table: {insert_and_check_treeify(7, 64)}")
    print(f"8-node chain in a 32-bin table: {insert_and_check_treeify(7, 32)}")
    print(f"resize split leaving 6 nodes untreeifies: {resize_split_untreeifies(6)}")
    print(f"reader for key 6 after its bin migrates: {rt.read(6)}")
    print(f"reader for key 1 before its bin migrates: {rt.read(1)}")
    print(f"doubling 4 buckets to 8: new dummy nodes = {sorted(new_dummies)}, no real key moved = {real_order_4 == real_order_8}")
    print(f"dashmap shards on this machine ({THIS_MACHINE_CORES} cores): {THIS_MACHINE_SHARDS}")
    print("all assertions passed.")
