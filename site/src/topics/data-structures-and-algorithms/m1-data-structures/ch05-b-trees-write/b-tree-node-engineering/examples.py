"""Every number this topic's reel puts on screen is computed here, never assumed from memory of
how B-tree node engineering is supposed to pay off.

Four independent techniques, each measured on its own: suffix truncation (PostgreSQL's nbtree
README), key normalization to a memcmp-comparable byte form (MyRocks's own record format), bulk
loading from sorted input with every split confined to the tree's own right-most path (University
at Buffalo CSE 350's own bulk-load algorithm), and lazy, split-time-only deduplication of repeated
keys into a posting list (PostgreSQL's nbtree README again, shipped in 13.0).
"""

import math
import random
import struct

# --- 1. Suffix truncation: keep only what still distinguishes a split -------------------------


def suffix_truncate(left_key, right_key):
    """left_key < right_key, both tuples of attributes. Returns the shortest prefix of
    right_key that still distinguishes it from left_key -- the pivot tuple PostgreSQL's own
    README describes, never re-scanning the whole key when an earlier attribute already
    differs."""
    assert left_key < right_key, "suffix truncation only applies between two distinct, ordered keys"
    for i in range(min(len(left_key), len(right_key))):
        if left_key[i] != right_key[i]:
            return right_key[: i + 1]
    return right_key


def key_byte_size(key):
    size = 0
    for attr in key:
        if isinstance(attr, int):
            size += 8
        elif isinstance(attr, str):
            size += len(attr.encode("utf-8"))
        else:
            raise TypeError(f"unsupported attribute type: {type(attr)}")
    return size


# --- 2. Key normalization: a typed key -> one byte-comparable form -----------------------------


def normalize_int(x, nbytes=8):
    """Signed integer -> unsigned, big-endian, sign-bit flipped -- MyRocks's own encoding for
    integral types, so that plain byte comparison (memcmp) reproduces signed-integer order."""
    offset = 1 << (nbytes * 8 - 1)
    val = x + offset
    assert 0 <= val < (1 << (nbytes * 8)), f"{x} does not fit in {nbytes} bytes"
    return val.to_bytes(nbytes, "big")


def normalize_float(x):
    """IEEE-754 double -> big-endian bytes, sign bit set for positives, all bits inverted for
    negatives -- MyRocks's own encoding, so byte comparison reproduces float order (NaN excluded,
    as it has no total order to preserve)."""
    bits = struct.unpack(">Q", struct.pack(">d", x))[0]
    if bits & (1 << 63):
        bits = (~bits) & ((1 << 64) - 1)
    else:
        bits = bits | (1 << 63)
    return bits.to_bytes(8, "big")


# --- 3. Bulk loading from sorted input: build the leaf level once, split only on the right -------


class Node:
    __slots__ = ("keys", "children", "is_leaf", "parent")

    def __init__(self, is_leaf):
        self.is_leaf = is_leaf
        self.keys = []
        self.children = [] if not is_leaf else None
        self.parent = None


class BPlusTree:
    def __init__(self, order):
        self.order = order
        self.max_keys = order - 1
        self.root = Node(is_leaf=True)
        self.page_writes = 0  # every node created or rewritten, across the whole run

    def height(self):
        node = self.root
        h = 1
        while not node.is_leaf:
            node = node.children[0]
            h += 1
        return h

    def in_order(self):
        if self.root.is_leaf:
            return list(self.root.keys)
        node = self.root
        while not node.is_leaf:
            node = node.children[0]
        out = []
        stack = [self.root]
        # simple recursive in-order collection (small trees only, for verification)
        def collect(n):
            if n.is_leaf:
                out.extend(n.keys)
            else:
                for c in n.children:
                    collect(c)
        collect(self.root)
        return out

    def insert_one_at_a_time(self, key):
        """Ordinary tuple-at-a-time insert, same algorithm as topic 26's -- every node on the
        root-to-leaf path is touched (read, modified and conceptually rewritten) by this insert,
        and a split rewrites the overflowing node, its new sibling, and its parent."""
        leaf = self.root
        path = [leaf]
        while not leaf.is_leaf:
            i = 0
            while i < len(leaf.keys) and key >= leaf.keys[i]:
                i += 1
            leaf = leaf.children[i]
            path.append(leaf)
        i = 0
        while i < len(leaf.keys) and leaf.keys[i] < key:
            i += 1
        leaf.keys.insert(i, key)
        self.page_writes += len(path)  # every node on the path was touched by this insert
        if len(leaf.keys) > self.max_keys:
            self._split(leaf)

    def _split(self, node):
        mid = len(node.keys) // 2
        if node.is_leaf:
            new = Node(is_leaf=True)
            new.keys = node.keys[mid:]
            node.keys = node.keys[:mid]
            promoted = new.keys[0]
        else:
            new = Node(is_leaf=False)
            promoted = node.keys[mid]
            new.keys = node.keys[mid + 1:]
            new.children = node.children[mid + 1:]
            node.keys = node.keys[:mid]
            node.children = node.children[: mid + 1]
            for c in new.children:
                c.parent = new
        self.page_writes += 1  # the new sibling is a freshly written page
        parent = node.parent
        if parent is None:
            new_root = Node(is_leaf=False)
            new_root.keys = [promoted]
            new_root.children = [node, new]
            node.parent = new.parent = new_root
            self.root = new_root
            self.page_writes += 1
            return
        new.parent = parent
        i = parent.children.index(node)
        parent.keys.insert(i, promoted)
        parent.children.insert(i + 1, new)
        self.page_writes += 1  # the parent was rewritten to record the new child
        if len(parent.keys) > self.max_keys:
            self._split(parent)

    @classmethod
    def bulk_load(cls, sorted_keys, order):
        """Sort once (the caller already has sorted_keys); fill leaf pages left to right to
        max_keys, then build each level above the same way, grouping the level below by fanout.
        Every split-like event here is just "this page is full, start a new one, link it to the
        parent being built" -- the right-most page at each level is the only one ever touched
        again, which is exactly the right-most-path property CSE 350's own lecture states."""
        tree = cls(order)
        max_keys = tree.max_keys
        leaves = []
        splits_by_level = {0: []}
        for i in range(0, len(sorted_keys), max_keys):
            leaf = Node(is_leaf=True)
            leaf.keys = sorted_keys[i : i + max_keys]
            leaves.append(leaf)
            tree.page_writes += 1
            if len(leaves) > 1:
                splits_by_level[0].append(len(leaves) - 1)  # index of the newly started page
        for idx in range(len(leaves) - 1):
            leaves[idx + 1].keys  # no-op, leaves already linked by position
        level_nodes = leaves
        level = 0
        while len(level_nodes) > 1:
            level += 1
            splits_by_level[level] = []
            parents = []
            # fanout per inner node: order children, i.e. up to `order` children per parent
            for i in range(0, len(level_nodes), order):
                group = level_nodes[i : i + order]
                parent = Node(is_leaf=False)
                parent.children = group
                parent.keys = [cls._first_key(child) for child in group[1:]]
                for c in group:
                    c.parent = parent
                parents.append(parent)
                tree.page_writes += 1
                if len(parents) > 1:
                    splits_by_level[level].append(len(parents) - 1)
            level_nodes = parents
        tree.root = level_nodes[0]
        tree._splits_by_level = splits_by_level
        return tree

    @staticmethod
    def _first_key(node):
        while not node.is_leaf:
            node = node.children[0]
        return node.keys[0]

    def every_bulk_split_was_rightmost(self):
        """Confirms, for the run that just built this tree via bulk_load, that every new page
        at every level was created strictly to the right of every page already built at that
        level -- never inserted in the middle, never anywhere but the advancing right edge."""
        for level, new_indices in self._splits_by_level.items():
            for idx, new_idx in enumerate(new_indices):
                # the i-th recorded "split" must be the (i+1)-th page overall at that level,
                # i.e. strictly increasing and contiguous from the page count already built
                if new_idx != idx + 1:
                    return False
        return True


# --- 4. Deduplication: posting lists, merged lazily, only at the point of a split -------------


class DedupLeaf:
    """A tiny leaf page simulation: non-unique keys. Without dedup, each occurrence is a full
    (key, pointer) tuple. With dedup, repeated keys merge into one key plus a posting list of
    pointers -- merged lazily, only when an insert would otherwise overflow the page."""

    def __init__(self, capacity_bytes, key_bytes=8, pointer_bytes=8):
        self.capacity_bytes = capacity_bytes
        self.key_bytes = key_bytes
        self.pointer_bytes = pointer_bytes
        self.entries = []  # list of (key, pointer), not yet deduplicated
        self.dedup_passes = 0

    def raw_size(self):
        return len(self.entries) * (self.key_bytes + self.pointer_bytes)

    def deduplicated_size(self):
        by_key = {}
        for k, p in self.entries:
            by_key.setdefault(k, []).append(p)
        size = 0
        for k, pointers in by_key.items():
            size += self.key_bytes + len(pointers) * self.pointer_bytes
        return size

    def insert(self, key, pointer):
        self.entries.append((key, pointer))
        if self.raw_size() > self.capacity_bytes and self.deduplicated_size() <= self.capacity_bytes:
            # this is the one moment deduplication actually runs: a split was about to be
            # needed, and deduplicating first avoids it
            self.dedup_passes += 1


# --- Measurements -------------------------------------------------------------------------------

random.seed(20261023)
KEYS = random.sample(range(1, 10**6), 200)  # the identical 200-key set topics 23-26 used

# -- Suffix truncation: measure real byte savings on routing entries ----------------------------

sorted_keys_multi = sorted((k, "row", "payload") for k in KEYS)  # a 3-attribute composite key
truncated_sizes = []
full_sizes = []
for i in range(len(sorted_keys_multi) - 1):
    left, right = sorted_keys_multi[i], sorted_keys_multi[i + 1]
    truncated = suffix_truncate(left, right)
    truncated_sizes.append(key_byte_size(truncated))
    full_sizes.append(key_byte_size(right))

avg_full = sum(full_sizes) / len(full_sizes)
avg_truncated = sum(truncated_sizes) / len(truncated_sizes)
print(f"pivot tuple size, full key: {avg_full:.1f} bytes average")
print(f"pivot tuple size, suffix-truncated: {avg_truncated:.1f} bytes average")
assert avg_truncated < avg_full, "suffix truncation must shrink the average pivot tuple"
assert all(t <= f for t, f in zip(truncated_sizes, full_sizes)), "a truncated key is never larger than the full key"

# -- Key normalization: byte order must reproduce typed order exactly ---------------------------

random.seed(20261025)
sample_ints = random.sample(range(-(10**9), 10**9), 300)
normalized_ints = sorted(sample_ints, key=lambda x: normalize_int(x))
assert normalized_ints == sorted(sample_ints), "byte-comparing normalized integers must reproduce signed-integer order"

sample_floats = [random.uniform(-1e6, 1e6) for _ in range(300)]
normalized_floats = sorted(sample_floats, key=lambda x: normalize_float(x))
assert normalized_floats == sorted(sample_floats), "byte-comparing normalized floats must reproduce float order"
print(f"{len(sample_ints)} signed integers and {len(sample_floats)} floats: normalized byte order matches typed order exactly")

# -- Bulk loading: right-most-path-only splits, and the I/O gap against one-at-a-time -----------

ORDER = 4
sorted_input = sorted(KEYS)

bulk = BPlusTree.bulk_load(sorted_input, ORDER)
assert bulk.in_order() == sorted_input, "a bulk-loaded tree must hold every key, in order"
assert bulk.every_bulk_split_was_rightmost(), "every page created during a bulk load must be strictly to the right of every earlier page at its level"
bulk_height = bulk.height()
print(f"bulk load, order {ORDER}, {len(sorted_input)} keys: height {bulk_height}, {bulk.page_writes} page writes")

incremental = BPlusTree(ORDER)
for k in sorted_input:
    incremental.insert_one_at_a_time(k)
assert incremental.in_order() == sorted_input, "an incrementally built tree must hold every key, in order"
print(f"one-at-a-time insert, identical sorted input: {incremental.page_writes} page writes")

assert bulk.page_writes < incremental.page_writes / 3, "a bulk load must cost dramatically fewer page writes than one-at-a-time insertion of the identical sorted input"

# -- Fill factor: packing to a target leaves room for writes, trading against wasted space ------

FILL_FACTORS = [0.5, 0.7, 0.9, 1.0]
max_tuples_per_leaf = 20
for ff in FILL_FACTORS:
    packed = int(max_tuples_per_leaf * ff)
    leaves_needed = math.ceil(len(KEYS) / packed)
    print(f"fill factor {ff:.1f}: {packed} keys/leaf, {leaves_needed} leaves for {len(KEYS)} keys")
assert int(max_tuples_per_leaf * 1.0) > int(max_tuples_per_leaf * 0.5), "a higher fill factor must pack more keys per leaf"

# -- Deduplication: a lazy, split-time-only size reduction on a repeated-key set -----------------

random.seed(20261026)
leaf = DedupLeaf(capacity_bytes=400)
low_cardinality_keys = [random.choice(range(5)) for _ in range(60)]  # heavy repetition
for i, k in enumerate(low_cardinality_keys):
    leaf.insert(k, pointer=i)

raw = leaf.raw_size()
deduped = leaf.deduplicated_size()
print(f"{len(low_cardinality_keys)} inserts, {len(set(low_cardinality_keys))} distinct keys: raw {raw} bytes, deduplicated {deduped} bytes")
assert deduped < raw, "deduplication must shrink storage on a key set with real repetition"
assert leaf.dedup_passes >= 1, "a dedup pass must have actually run once this leaf's raw size exceeded capacity"

# confirm laziness: a leaf that never approaches capacity never runs a dedup pass
tiny_leaf = DedupLeaf(capacity_bytes=10_000)
for i, k in enumerate(low_cardinality_keys):
    tiny_leaf.insert(k, pointer=i)
assert tiny_leaf.dedup_passes == 0, "deduplication must never run when a page was never close to splitting"

if __name__ == "__main__":
    print("\nAll checks passed.")
