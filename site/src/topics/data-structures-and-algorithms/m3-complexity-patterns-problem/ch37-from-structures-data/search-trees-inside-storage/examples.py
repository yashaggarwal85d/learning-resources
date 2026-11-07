"""
dsa.search-trees-inside-storage — every number the reel shows, computed and asserted here.

Three measurements, one shared keyed store (sorted integer keys, sized for a B+-tree of
height 3 and an LSM tree of four levels, as Chapter 5's own sizing table does):

1. A B+-tree leaf entry is (key, heap TID): logical duplicates are made unique by the TID,
   sorted in ascending TID order, and a leaf page full of duplicates is split lopsided
   (PostgreSQL nbtree/README).
2. An LSM internal key is (user key, sequence number), ordered by user key ascending then
   sequence number DESCENDING, so the newest version of a key sorts first and a snapshot
   read is a seek (RocksDB db/dbformat.h).
3. A filter block is itself paged: a top-level index over filter partitions, each loaded on
   demand, because one filter block can dwarf a data block (RocksDB wiki, Partitioned
   Index/Filters). The reel's bar chart is the block-read count for four point-lookup cases.
"""

import math


# ---------------------------------------------------------------------------
# 1. B+-tree: (key, heap TID) entries, ascending-TID duplicate splits.
# ---------------------------------------------------------------------------

FANOUT = 8  # keys per leaf page, chosen so a few thousand keys give height 3.


class BPlusLeaf:
    def __init__(self, capacity):
        self.capacity = capacity
        self.entries = []  # list of (key, tid), kept sorted by (key, tid)

    def insert(self, key, tid):
        self.entries.append((key, tid))
        self.entries.sort()

    def is_full(self):
        return len(self.entries) > self.capacity

    def split_ascending_tid(self):
        """PostgreSQL's fallback for a leaf packed with duplicates: assume ascending TID
        insertion order and leave the left half mostly full, the right mostly empty."""
        n = len(self.entries)
        # Every entry shares one key (the duplicate-packed case the README describes).
        # The split point is pushed to the right: left keeps capacity-ish entries, right
        # keeps the remainder the next insert would have overflowed into.
        left_count = self.capacity
        left = self.entries[:left_count]
        right = self.entries[left_count:]
        return left, right


def build_height_3_tree(num_keys, fanout=FANOUT):
    """How many keys does a uniform B+-tree need to reach height 3 (root, one internal
    level, leaves) at this fanout? height = ceil(log_fanout(num_keys / fanout)) + 1 roughly;
    simulate directly by counting levels a sorted bulk load produces."""
    leaves = math.ceil(num_keys / fanout)
    level = leaves
    height = 1  # the leaf level counts as height 1
    while level > 1:
        level = math.ceil(level / fanout)
        height += 1
    return height


# Pick a key count that gives height 3 at this fanout.
NUM_KEYS = 180
height = build_height_3_tree(NUM_KEYS)
assert height == 3, f"expected height 3, got {height} for {NUM_KEYS} keys at fanout {FANOUT}"

# A customer_id with many duplicate order rows: five orders for the same customer, heap
# TIDs assigned in ascending insertion order (the common case the README's fallback assumes).
DUP_KEY = 4001
tids = [(0, i) for i in range(5)]  # (page, offset) heap TIDs, ascending
leaf = BPlusLeaf(capacity=4)
for tid in tids:
    leaf.insert(DUP_KEY, tid)

assert leaf.entries == sorted(leaf.entries), "entries must be unique and sorted by (key, TID)"
assert len(set(leaf.entries)) == 5, "the TID makes every duplicate entry unique"

assert leaf.is_full()
left, right = leaf.split_ascending_tid()
assert len(left) == 4 and len(right) == 1, (
    "ascending-TID split leaves the left page mostly full and the right mostly empty: "
    f"got left={len(left)}, right={len(right)}"
)
LEFT_FULL_FRACTION = len(left) / leaf.capacity
RIGHT_FULL_FRACTION = len(right) / leaf.capacity
assert LEFT_FULL_FRACTION == 1.0
assert RIGHT_FULL_FRACTION == 0.25


# ---------------------------------------------------------------------------
# 2. LSM internal key: (user key, sequence number) ordered user-key-asc, seq-desc.
# ---------------------------------------------------------------------------

def internal_key_order(a, b):
    """RocksDB's comparator: user key ascending, then sequence number descending."""
    (ukey_a, seq_a), (ukey_b, seq_b) = a, b
    if ukey_a != ukey_b:
        return -1 if ukey_a < ukey_b else 1
    if seq_a != seq_b:
        return -1 if seq_a > seq_b else 1  # higher sequence sorts first
    return 0


def sort_internal_keys(keys):
    import functools
    return sorted(keys, key=functools.cmp_to_key(internal_key_order))


# One user key written three times (seq 10, 20, 30) plus a tombstone at seq 40.
USER_KEY = "order:4001:status"
writes = [
    (USER_KEY, 10, "placed"),
    (USER_KEY, 20, "shipped"),
    (USER_KEY, 30, "delivered"),
    (USER_KEY, 40, None),  # None marks a tombstone (delete)
]
keyed = [((w[0], w[1]), w[2]) for w in writes]
ordered = sort_internal_keys([k for k, _ in keyed])

assert ordered == [
    (USER_KEY, 40), (USER_KEY, 30), (USER_KEY, 20), (USER_KEY, 10)
], f"expected newest-sequence-first order, got {ordered}"

# A snapshot read at seq 25 must land on the first entry whose sequence <= 25: "shipped" (seq 20).
value_by_seq = {w[1]: w[2] for w in writes}


def snapshot_read(seq_order, snapshot_seq):
    for ukey, seq in seq_order:
        if seq <= snapshot_seq:
            return value_by_seq[seq]
    return None


SNAPSHOT_SEQ = 25
snapshot_value = snapshot_read(ordered, SNAPSHOT_SEQ)
assert snapshot_value == "shipped", f"snapshot read at seq 25 should see 'shipped', got {snapshot_value}"

# A read with no snapshot constraint (the live read) sees the newest entry, including the tombstone.
LIVE_SEQ = 1_000_000
live_value = snapshot_read(ordered, LIVE_SEQ)
assert live_value is None, "the live read must see the tombstone (deleted) ahead of every earlier version"

# Four levels: L0..L3, sized by a constant per-level growth factor (Chapter 5's own sizing).
GROWTH = 10
LEVEL_SIZES_MB = [4]
while len(LEVEL_SIZES_MB) < 4:
    LEVEL_SIZES_MB.append(LEVEL_SIZES_MB[-1] * GROWTH)
assert LEVEL_SIZES_MB == [4, 40, 400, 4000]
NUM_LEVELS = len(LEVEL_SIZES_MB)
assert NUM_LEVELS == 4


# ---------------------------------------------------------------------------
# 3. A filter block is itself paged: block-read counts for four point-lookup cases.
# ---------------------------------------------------------------------------

DATA_BLOCK_KB = 4
FILTER_BLOCK_MB = 5
FILTER_TO_DATA_BLOCK_RATIO = (FILTER_BLOCK_MB * 1024) / DATA_BLOCK_KB
assert FILTER_TO_DATA_BLOCK_RATIO == 1280.0, FILTER_TO_DATA_BLOCK_RATIO
# "occupying the space that could otherwise be used to cache 1000s of data blocks"
assert FILTER_TO_DATA_BLOCK_RATIO > 1000

TOP_LEVEL_INDEX_FRACTION = 0.01  # "0.1-1% of index/filter size" (upper end, stated as such)
TOP_LEVEL_INDEX_MB = FILTER_BLOCK_MB * TOP_LEVEL_INDEX_FRACTION
assert round(TOP_LEVEL_INDEX_MB, 3) == 0.05


class BlockCounter:
    """Counts block reads for one point lookup under four filter configurations."""

    def __init__(self):
        self.reads = {}

    def count(self, name, index_read, filter_read, data_read):
        self.reads[name] = index_read + filter_read + data_read
        return self.reads[name]


bc = BlockCounter()

# Case A: the key is present (a hit). Always one index-block read and one data-block read;
# a filter, whole or partitioned, never saves anything on a hit because the row still has to
# be fetched to return it.
HIT = bc.count("hit", index_read=1, filter_read=0, data_read=1)
assert HIT == 2

# Case B: the key is absent, no filter at all. The engine must still read the data block to
# find out the key is not there: one index read, one wasted data read.
MISS_NO_FILTER = bc.count("miss_no_filter", index_read=1, filter_read=0, data_read=1)
assert MISS_NO_FILTER == 2

# Case C: the key is absent, one whole filter block per SST, already cached. The filter
# check happens in memory (no extra block read) and correctly rejects the key: no data read.
MISS_WHOLE_FILTER_CACHED = bc.count("miss_whole_filter_cached", index_read=1, filter_read=0, data_read=0)
assert MISS_WHOLE_FILTER_CACHED == 1

# Case D: the key is absent, partitioned filter, top-level index cached but the one filter
# partition covering this key is NOT cached: one extra read to load that partition, then the
# in-memory check correctly rejects the key. This is the wiki page's own stated cost: "one
# extra I/O when the top-level index is not cached" generalizes to one extra I/O whenever the
# needed partition (top-level or leaf) must be loaded; here it is the leaf partition.
MISS_PARTITIONED_FILTER_NOT_CACHED = bc.count(
    "miss_partitioned_filter_not_cached", index_read=1, filter_read=1, data_read=0
)
assert MISS_PARTITIONED_FILTER_NOT_CACHED == 2

assert bc.reads["hit"] == bc.reads["miss_no_filter"] == 2
assert bc.reads["miss_whole_filter_cached"] == 1
assert bc.reads["miss_partitioned_filter_not_cached"] == 2
# The surprising number the reel states: a cached whole filter is strictly better than a
# partitioned filter whose one needed partition is not cached, which costs exactly as much
# as having no filter at all for this one lookup — the price of not holding a 5 MB block.
assert (
    bc.reads["miss_partitioned_filter_not_cached"] == bc.reads["miss_no_filter"]
), "an uncached filter partition costs the same one extra read as having no filter at all"


if __name__ == "__main__":
    print("height:", height)
    print("duplicate split: left", len(left), "right", len(right))
    print("snapshot (seq 25):", snapshot_value)
    print("live read:", live_value)
    print("level sizes MB:", LEVEL_SIZES_MB)
    print("filter/data block ratio:", FILTER_TO_DATA_BLOCK_RATIO)
    print("top-level index MB:", TOP_LEVEL_INDEX_MB)
    print("block reads:", bc.reads)
    print("All assertions passed.")
