"""Every number this topic's reel puts on screen is computed here, never assumed from memory of
how an order-statistic tree is supposed to behave.

The red-black tree class is the identical one topic 24 built (copied verbatim, not re-derived),
now augmented with one extra field per node: its own subtree's size. Three things are measured
directly: that inserting a key only ever needs to increment the sizes on the root-to-leaf path it
followed; that a single rotation, isolated from any fixup chain, only ever recomputes the size of
the two nodes incident to the rotated edge; and that a select query's and a rank query's
comparison counts stay tied to the tree's own height, never a flat scan.
"""

import random

RED = "red"
BLACK = "black"


class Node:
    __slots__ = ("key", "color", "left", "right", "parent", "size")

    def __init__(self, key=None, color=BLACK):
        self.key = key
        self.color = color
        self.left = None
        self.right = None
        self.parent = None
        self.size = 0


class RedBlackTree:
    """Copied from topic 24's examples.py (the identical red-black tree), augmented with a `size`
    field: size[x] = size[left[x]] + size[right[x]] + 1 (MIT 6.046J Lecture 11)."""

    def __init__(self):
        self.NIL = Node(color=BLACK)
        self.NIL.left = self.NIL.right = self.NIL.parent = self.NIL
        self.NIL.size = 0
        self.root = self.NIL
        self.rotation_count = 0

    def _resize(self, x):
        x.size = x.left.size + x.right.size + 1

    def _left_rotate(self, x):
        """A rotation relinks x and y only -- their sizes are the only two recomputed here
        (csce750 lecture notes: 'Each rotation changes the size for only two nodes')."""
        self.rotation_count += 1
        y = x.right
        x.right = y.left
        if y.left is not self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y
        self._resize(x)
        self._resize(y)

    def _right_rotate(self, x):
        self.rotation_count += 1
        y = x.left
        x.left = y.right
        if y.right is not self.NIL:
            y.right.parent = x
        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
        y.right = x
        x.parent = y
        self._resize(x)
        self._resize(y)

    def insert(self, key):
        z = Node(key, RED)
        z.left = z.right = self.NIL
        z.size = 1
        y, x = self.NIL, self.root
        path = []
        while x is not self.NIL:
            path.append(x)
            y = x
            x = x.left if z.key < x.key else x.right
        z.parent = y
        if y is self.NIL:
            self.root = z
        elif z.key < y.key:
            y.left = z
        else:
            y.right = z
        for node in path:
            node.size += 1
        self._insert_fixup(z)

    def _insert_fixup(self, z):
        while z.parent.color == RED:
            if z.parent is z.parent.parent.left:
                uncle = z.parent.parent.right
                if uncle.color == RED:
                    z.parent.color = BLACK
                    uncle.color = BLACK
                    z.parent.parent.color = RED
                    z = z.parent.parent
                else:
                    if z is z.parent.right:
                        z = z.parent
                        self._left_rotate(z)
                    z.parent.color = BLACK
                    z.parent.parent.color = RED
                    self._right_rotate(z.parent.parent)
            else:
                uncle = z.parent.parent.left
                if uncle.color == RED:
                    z.parent.color = BLACK
                    uncle.color = BLACK
                    z.parent.parent.color = RED
                    z = z.parent.parent
                else:
                    if z is z.parent.left:
                        z = z.parent
                        self._right_rotate(z)
                    z.parent.color = BLACK
                    z.parent.parent.color = RED
                    self._left_rotate(z.parent.parent)
        self.root.color = BLACK

    def _transplant(self, u, v):
        if u.parent is self.NIL:
            self.root = v
        elif u is u.parent.left:
            u.parent.left = v
        else:
            u.parent.right = v
        v.parent = u.parent

    def _minimum(self, x):
        while x.left is not self.NIL:
            x = x.left
        return x

    def delete(self, key):
        z = self.root
        while z is not self.NIL and z.key != key:
            z = z.left if key < z.key else z.right
        if z is self.NIL:
            raise KeyError(key)

        y = z
        y_original_color = y.color
        if z.left is self.NIL:
            x = z.right
            self._transplant(z, z.right)
        elif z.right is self.NIL:
            x = z.left
            self._transplant(z, z.left)
        else:
            y = self._minimum(z.right)
            y_original_color = y.color
            x = y.right
            if y.parent is z:
                x.parent = y
            else:
                self._transplant(y, y.right)
                y.right = z.right
                y.right.parent = y
            self._transplant(z, y)
            y.left = z.left
            y.left.parent = y
            y.color = z.color

        if y_original_color == BLACK:
            self._delete_fixup(x)

        # Sizes are fixed by a correctness-only bottom-up recompute from the root (not claimed or
        # measured as an O(1)-per-rotation bound -- that claim is isolated and tested separately,
        # below, on a single raw rotation). Delete's own structural changes (transplants, a
        # possible successor swap) touch more than one rotation's worth of pointers, so a full,
        # honest recompute is used here rather than a hand-rolled partial one.
        self._recompute_all_sizes()

    def _recompute_all_sizes(self):
        def walk(node):
            if node is self.NIL:
                return
            walk(node.left)
            walk(node.right)
            self._resize(node)

        walk(self.root)

    def _delete_fixup(self, x):
        while x is not self.root and x.color == BLACK:
            if x is x.parent.left:
                sibling = x.parent.right
                if sibling.color == RED:
                    sibling.color = BLACK
                    x.parent.color = RED
                    self._left_rotate(x.parent)
                    sibling = x.parent.right
                if sibling.left.color == BLACK and sibling.right.color == BLACK:
                    sibling.color = RED
                    x = x.parent
                else:
                    if sibling.right.color == BLACK:
                        sibling.left.color = BLACK
                        sibling.color = RED
                        self._right_rotate(sibling)
                        sibling = x.parent.right
                    sibling.color = x.parent.color
                    x.parent.color = BLACK
                    sibling.right.color = BLACK
                    self._left_rotate(x.parent)
                    x = self.root
            else:
                sibling = x.parent.left
                if sibling.color == RED:
                    sibling.color = BLACK
                    x.parent.color = RED
                    self._right_rotate(x.parent)
                    sibling = x.parent.left
                if sibling.right.color == BLACK and sibling.left.color == BLACK:
                    sibling.color = RED
                    x = x.parent
                else:
                    if sibling.left.color == BLACK:
                        sibling.right.color = BLACK
                        sibling.color = RED
                        self._left_rotate(sibling)
                        sibling = x.parent.left
                    sibling.color = x.parent.color
                    x.parent.color = BLACK
                    sibling.left.color = BLACK
                    self._right_rotate(x.parent)
                    x = self.root
        x.color = BLACK

    def in_order(self):
        result = []

        def walk(node):
            if node is self.NIL:
                return
            walk(node.left)
            result.append(node.key)
            walk(node.right)

        walk(self.root)
        return result

    def validate_sizes(self):
        """Raises if any node's size disagrees with its two children's sizes plus one."""

        def check(node):
            if node is self.NIL:
                return
            expected = node.left.size + node.right.size + 1
            assert node.size == expected, f"node {node.key}: size {node.size}, expected {expected}"
            check(node.left)
            check(node.right)

        check(self.root)
        return True

    def os_select(self, i):
        """OS-SELECT: the i-th smallest key (1-indexed), counting comparisons as it walks down."""
        comparisons = 0
        node = self.root
        while True:
            comparisons += 1
            rank = node.left.size + 1
            if i == rank:
                return node.key, comparisons
            elif i < rank:
                node = node.left
            else:
                i -= rank
                node = node.right

    def os_rank(self, key):
        """OS-RANK: key's rank (1-indexed), climbing from the node to the root, counting steps."""
        node = self.root
        while node.key != key:
            node = node.left if key < node.key else node.right
        rank = node.left.size + 1
        steps = 1
        while node is not self.root:
            parent = node.parent
            steps += 1
            if node is parent.right:
                rank += parent.left.size + 1
            node = parent
        return rank, steps

    def height(self):
        def h(node):
            if node is self.NIL:
                return 0
            return 1 + max(h(node.left), h(node.right))

        return h(self.root)


random.seed(20261023)

# --- The identical key set topic 24 used, reproduced bit-for-bit, inserted in sorted order -------

NUM_KEYS = 200
keys = random.sample(range(1, 10**6), NUM_KEYS)
deleted = random.sample(keys, 40)

tree = RedBlackTree()
for k in sorted(keys):
    tree.insert(k)
    tree.validate_sizes()

tree_height = tree.height()
print(f"{NUM_KEYS}-key augmented red-black tree, sorted insertion order: height {tree_height}")

# --- Select and rank: comparison counts measured against the tree's actual height ----------------

sorted_keys = sorted(keys)
sample_ranks = [1, 50, 100, 150, 200]
max_select_comparisons = 0
for r in sample_ranks:
    found_key, comparisons = tree.os_select(r)
    assert found_key == sorted_keys[r - 1], f"OS-SELECT({r}) must return the {r}-th smallest key"
    max_select_comparisons = max(max_select_comparisons, comparisons)

sample_keys = [sorted_keys[0], sorted_keys[49], sorted_keys[99], sorted_keys[149], sorted_keys[-1]]
max_rank_steps = 0
for idx, k in zip([1, 50, 100, 150, 200], sample_keys):
    found_rank, steps = tree.os_rank(k)
    assert found_rank == idx, f"OS-RANK must find rank {idx} for this key, not {found_rank}"
    max_rank_steps = max(max_rank_steps, steps)

print(f"OS-SELECT: largest comparison count across {len(sample_ranks)} queries: {max_select_comparisons} (tree height: {tree_height})")
print(f"OS-RANK: largest climb length across {len(sample_keys)} queries: {max_rank_steps} (tree height: {tree_height})")

assert max_select_comparisons <= tree_height, "a select query must never need more comparisons than the tree's height"
assert max_rank_steps <= tree_height, "a rank query must never need more climb steps than the tree's height"

# --- Insert: only the root-to-leaf path's sizes change, measured directly on a fresh tree --------

fresh = RedBlackTree()
for k in sorted_keys[:50]:
    fresh.insert(k)

# Snapshot every live node's size, insert one more key, and verify every size that changed sits on
# the root-to-new-leaf comparison path (the path the insert itself just walked).
def all_nodes(t):
    result = []

    def walk(node):
        if node is t.NIL:
            return
        result.append(node)
        walk(node.left)
        walk(node.right)

    walk(t.root)
    return result


before = {n.key: n.size for n in all_nodes(fresh)}
new_key = sorted_keys[50]
path_keys = []
node = fresh.root
while node is not fresh.NIL:
    path_keys.append(node.key)
    node = node.left if new_key < node.key else node.right

fresh.insert(new_key)
after = {n.key: n.size for n in all_nodes(fresh) if n.key != new_key}
changed = [k for k in before if before[k] != after.get(k, before[k])]

print(f"\ninserting one key into a {len(before)}-node tree: {len(changed)} existing node(s) changed size")
assert set(changed).issubset(set(path_keys)), "only nodes on the root-to-leaf insertion path should change size"

# --- Rotation: isolated from any fixup chain, exactly two sizes are recomputed ------------------

single = RedBlackTree()
for k in [50, 30, 70, 20, 40, 60, 80]:
    single.insert(k)

before_sizes = {n.key: n.size for n in all_nodes(single)}
pivot = single.root.left  # rotate around the left child of the root directly, bypassing fixup
single._left_rotate(pivot)
after_sizes = {n.key: n.size for n in all_nodes(single)}

changed_by_rotation = [k for k in before_sizes if before_sizes[k] != after_sizes.get(k)]
print(f"a single, isolated rotation: {len(changed_by_rotation)} node(s) had their size recomputed")
assert len(changed_by_rotation) == 2, f"a rotation must recompute exactly two sizes, not {len(changed_by_rotation)}"
assert single.in_order() == sorted([50, 30, 70, 20, 40, 60, 80]), "a rotation must never change the in-order sequence"

if __name__ == "__main__":
    print("\nAll checks passed.")
