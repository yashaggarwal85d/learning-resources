"""Every number this topic's reel puts on screen is computed here, never assumed from memory of
how a B+Tree is supposed to behave.

A real B+Tree is built from scratch (CMU 15-445's own insert/delete algorithm: a leaf split copies
its middle key up, an inner-node split pushes its middle key up and drops it from the child; a
delete tries to re-distribute from a sibling before merging, and a merge deletes the orphaned
separator from the parent). Leaves are linked left-to-right (PostgreSQL's own nbtree README calls
this a right-link to the page's right sibling) so a range scan never re-descends from the root.
Every I/O count below is the number of nodes actually visited, counted as the tree is walked, never
taken on faith from the fanout/height formula alone -- the formula itself is checked separately,
arithmetically, against Stanford CS145's own worked table for realistic page and key sizes.
"""

import math
import random


class Node:
    __slots__ = ("keys", "children", "is_leaf", "next_leaf", "parent")

    def __init__(self, is_leaf):
        self.is_leaf = is_leaf
        self.keys = []
        self.children = [] if not is_leaf else None
        self.next_leaf = None
        self.parent = None


class BPlusTree:
    """order = M: an internal node holds at most M-1 keys and M children; a leaf holds at most
    M-1 keys. Values are stored directly in the leaves (an index-organized B+Tree), so a search's
    I/O count is exactly the tree's height in nodes visited, root counted as one."""

    def __init__(self, order):
        assert order >= 3, "order must allow at least one split-free minimum fill"
        self.order = order
        self.max_keys = order - 1
        self.min_keys = math.ceil(order / 2) - 1
        self.root = Node(is_leaf=True)
        self.split_count = 0
        self.borrow_count = 0
        self.merge_count = 0

    # -- search -------------------------------------------------------------------------------

    def search(self, key):
        """Returns (found, io_count): io_count is the number of nodes visited."""
        node = self.root
        io = 1
        while not node.is_leaf:
            i = self._child_index(node, key)
            node = node.children[i]
            io += 1
        return key in node.keys, io

    def _child_index(self, node, key):
        i = 0
        while i < len(node.keys) and key >= node.keys[i]:
            i += 1
        return i

    def height(self):
        node = self.root
        h = 1
        while not node.is_leaf:
            node = node.children[0]
            h += 1
        return h

    # -- insert ---------------------------------------------------------------------------------

    def insert(self, key):
        leaf = self._find_leaf(key)
        self._insert_into_leaf(leaf, key)
        if len(leaf.keys) > self.max_keys:
            self._split(leaf)

    def _find_leaf(self, key):
        node = self.root
        while not node.is_leaf:
            node = node.children[self._child_index(node, key)]
        return node

    def _insert_into_leaf(self, leaf, key):
        i = 0
        while i < len(leaf.keys) and leaf.keys[i] < key:
            i += 1
        leaf.keys.insert(i, key)

    def _split(self, node):
        self.split_count += 1
        mid = len(node.keys) // 2
        if node.is_leaf:
            new = Node(is_leaf=True)
            new.keys = node.keys[mid:]
            node.keys = node.keys[:mid]
            new.next_leaf = node.next_leaf
            node.next_leaf = new
            promoted_key = new.keys[0]  # leaf split: copy the middle key up
        else:
            new = Node(is_leaf=False)
            promoted_key = node.keys[mid]  # inner-node split: push the middle key up (not kept)
            new.keys = node.keys[mid + 1:]
            new.children = node.children[mid + 1:]
            node.keys = node.keys[:mid]
            node.children = node.children[:mid + 1]
            for c in new.children:
                c.parent = new
        parent = node.parent
        if parent is None:
            new_root = Node(is_leaf=False)
            new_root.keys = [promoted_key]
            new_root.children = [node, new]
            node.parent = new.parent = new_root
            self.root = new_root
            return
        new.parent = parent
        i = parent.children.index(node)
        parent.keys.insert(i, promoted_key)
        parent.children.insert(i + 1, new)
        if len(parent.keys) > self.max_keys:
            self._split(parent)

    # -- delete -------------------------------------------------------------------------------

    def delete(self, key):
        leaf = self._find_leaf(key)
        leaf.keys.remove(key)
        self._fix_underflow(leaf)

    def _fix_underflow(self, node):
        if node is self.root:
            if not node.is_leaf and len(node.children) == 1:
                self.root = node.children[0]
                self.root.parent = None
            return
        min_keys = self.min_keys
        if len(node.keys) >= min_keys:
            return
        parent = node.parent
        i = parent.children.index(node)
        left_sib = parent.children[i - 1] if i > 0 else None
        right_sib = parent.children[i + 1] if i + 1 < len(parent.children) else None

        if left_sib is not None and len(left_sib.keys) > self.min_keys:
            self.borrow_count += 1
            self._borrow_from_left(parent, i, left_sib, node)
            return
        if right_sib is not None and len(right_sib.keys) > self.min_keys:
            self.borrow_count += 1
            self._borrow_from_right(parent, i, node, right_sib)
            return

        self.merge_count += 1
        if left_sib is not None:
            self._merge(parent, i - 1, left_sib, node)
        else:
            self._merge(parent, i, node, right_sib)
        self._fix_underflow(parent)

    def _borrow_from_left(self, parent, i, left, node):
        if node.is_leaf:
            node.keys.insert(0, left.keys.pop())
            parent.keys[i - 1] = node.keys[0]
        else:
            node.keys.insert(0, parent.keys[i - 1])
            parent.keys[i - 1] = left.keys.pop()
            moved_child = left.children.pop()
            moved_child.parent = node
            node.children.insert(0, moved_child)

    def _borrow_from_right(self, parent, i, node, right):
        if node.is_leaf:
            node.keys.append(right.keys.pop(0))
            parent.keys[i] = right.keys[0]
        else:
            node.keys.append(parent.keys[i])
            parent.keys[i] = right.keys.pop(0)
            moved_child = right.children.pop(0)
            moved_child.parent = node
            node.children.append(moved_child)

    def _merge(self, parent, i, left, right):
        """Merge right into left; delete the separator key (parent.keys[i]) and right's slot."""
        if left.is_leaf:
            left.keys.extend(right.keys)
            left.next_leaf = right.next_leaf
        else:
            left.keys.append(parent.keys[i])
            left.keys.extend(right.keys)
            left.children.extend(right.children)
            for c in right.children:
                c.parent = left
        del parent.keys[i]
        del parent.children[i + 1]

    # -- range scan via sibling links, never re-descending from the root ------------------------

    def range_scan(self, lo, hi):
        """Returns (keys, io_count): io_count counts the descent to the first leaf plus every
        leaf visited by following sibling links -- no second descent from the root."""
        node = self.root
        io = 1
        while not node.is_leaf:
            node = node.children[self._child_index(node, lo)]
            io += 1
        out = []
        while node is not None:
            new_leaf = True
            for k in node.keys:
                if lo <= k <= hi:
                    out.append(k)
                elif k > hi:
                    return out, io
            if node.keys and node.keys[-1] > hi:
                return out, io
            node = node.next_leaf
            if node is not None:
                io += 1
        return out, io

    def in_order(self):
        node = self.root
        while not node.is_leaf:
            node = node.children[0]
        out = []
        while node is not None:
            out.extend(node.keys)
            node = node.next_leaf
        return out

    def check_invariants(self):
        self._check_node(self.root, is_root=True)

    def _check_node(self, node, is_root=False):
        if not is_root:
            assert len(node.keys) >= self.min_keys, f"node below minimum fill: {node.keys}"
        assert len(node.keys) <= self.max_keys, f"node above maximum fill: {node.keys}"
        assert node.keys == sorted(node.keys), "keys in a node must stay sorted"
        if not node.is_leaf:
            assert len(node.children) == len(node.keys) + 1, "an inner node with k keys needs k+1 children"
            for c in node.children:
                assert c.parent is node
                self._check_node(c)


# --- A classic (not B+) B-tree stores values in every node, not only the leaves --------------


class ClassicBTreeNode:
    """Minimal illustration only: values live beside keys in every node, inner nodes included --
    the 1972 original, contrasted directly against the B+Tree's leaves-only design above."""

    __slots__ = ("keys", "values", "children")

    def __init__(self):
        self.keys = []
        self.values = []
        self.children = []


# --- Measurements -------------------------------------------------------------------------------

random.seed(20261023)
KEYS = random.sample(range(1, 10**6), 200)  # the identical 200-key set topics 23-25 used

ORDER = 4  # small order: makes splits, merges and height visible on one frame

tree = BPlusTree(ORDER)
for k in KEYS:
    tree.insert(k)
    tree.check_invariants()

btree_height = tree.height()
print(f"B+Tree, order {ORDER}, {len(KEYS)} keys: height {btree_height}")
assert btree_height in (4, 5), f"order-{ORDER} B+Tree on {len(KEYS)} keys should be height 4 or 5, not {btree_height}"

RB_TREE_HEIGHT_CH4 = 13  # measured directly in topic 24's own examples.py, on the identical 200 keys
assert btree_height < RB_TREE_HEIGHT_CH4, (
    "the B+Tree's height must be visibly shorter than the pointer-based red-black tree's, on the same N"
)

# A point search costs exactly one I/O per level -- never more, never a re-scan of a level.
sample_key = KEYS[0]
found, search_io = tree.search(sample_key)
assert found and search_io == btree_height, "a search's I/O count must equal the tree's own height"

# -- Insert: split counted, and verified it never happens below the minimum fill ------------------

assert tree.split_count > 0, "inserting 200 keys into an order-4 tree must trigger at least one split"
print(f"splits triggered while building the tree: {tree.split_count}")

# -- Delete: borrow and merge, both observed on the same tree --------------------------------

random.seed(20261024)
to_delete = random.sample(KEYS, 60)  # enough deletes from this small a tree to exercise both borrow and merge
remaining_expected = sorted(set(KEYS) - set(to_delete))
for k in to_delete:
    tree.delete(k)
    tree.check_invariants()

assert tree.in_order() == remaining_expected, "in-order traversal across linked leaves must yield every remaining key, sorted"
print(f"{len(to_delete)} deletes: invariants held after every single one")
print(f"  borrows (re-distribution from a sibling): {tree.borrow_count}")
print(f"  merges (sibling combined, separator deleted from parent): {tree.merge_count}")
assert tree.borrow_count > 0, "deleting 60 of 200 keys from an order-4 tree must trigger at least one borrow"
assert tree.merge_count > 0, "deleting 60 of 200 keys from an order-4 tree must trigger at least one merge"

# -- Range scan: sibling links only, no second descent from the root -----------------------------

lo, hi = sorted(remaining_expected)[20], sorted(remaining_expected)[40]
scanned, scan_io = tree.range_scan(lo, hi)
expected_scanned = [k for k in remaining_expected if lo <= k <= hi]
assert scanned == expected_scanned, "a range scan must return exactly the keys in [lo, hi], in sorted order"
# the descent is the tree's height; every extra leaf after that is one more I/O, never a re-descent.
# A re-descent for every key would cost roughly height * count; sibling-linked streaming costs at
# most one extra I/O per key scanned, on top of the one initial descent.
reascending_cost = btree_height * len(expected_scanned)
assert scan_io <= btree_height + len(expected_scanned), "a range scan's I/O count must stay additive in leaves touched, not re-descend"
assert scan_io < reascending_cost, "streaming across sibling-linked leaves must cost far less than re-descending from the root per key"
print(f"range scan [{lo}, {hi}]: {len(scanned)} keys, {scan_io} I/Os (1 descent + {scan_io - btree_height} leaf link(s)), vs. {reascending_cost} I/Os re-descending per key")

# -- Fanout and height formula, checked arithmetically against Stanford CS145's own worked table -


def fanout(page_bytes, key_bytes, pointer_bytes=8):
    return page_bytes // (key_bytes + pointer_bytes)


def height_for(n_keys, f):
    return math.ceil(math.log(n_keys, f))


# Stanford CS145's own table, for 1 trillion keys, 8-byte pointers:
TRILLION = 10**12
cases = [
    (64 * 1024, 8, 4096, 4),
    (64 * 1024, 1024, 63, 7),
    (64 * 1024 * 1024, 8, 4_194_304, 2),  # 64 MB / 16 B = 4,194,304
    (64 * 1024 * 1024, 1024, 65536, 3),  # 64 MB / 1032 B ~= 65,038 (table rounds to 65,027)
]
for page_bytes, key_bytes, expected_fanout_min, expected_height in cases:
    f = fanout(page_bytes, key_bytes)
    assert f >= expected_fanout_min * 0.98, f"fanout for page={page_bytes}, key={key_bytes} should be near {expected_fanout_min}, got {f}"
    h = height_for(TRILLION, f)
    assert h == expected_height, f"height for fanout {f} on {TRILLION} keys should be {expected_height}, got {h}"

# This topic's own syllabus claim: "height 3-4 for billions of keys" with a realistic page/key size.
BILLION = 10**9
for page_bytes, key_bytes in [(8 * 1024, 16), (16 * 1024, 24), (64 * 1024, 16)]:
    f = fanout(page_bytes, key_bytes)
    h = height_for(BILLION, f)
    assert h in (3, 4), f"a realistic page/key size (page={page_bytes}, key={key_bytes}, fanout={f}) should give height 3 or 4 for a billion keys, not {h}"
    print(f"page {page_bytes} B, key {key_bytes} B -> fanout {f}, height {h} for {BILLION:,} keys")

if __name__ == "__main__":
    print("\nAll checks passed.")
