"""Every number this topic's reel puts on screen is computed here, never assumed from memory of
how a red-black tree is supposed to behave.

A real red-black tree is built from scratch (CLRS's own insert-fixup and delete-fixup, not the
left-leaning variant): five invariants checked after every single insert and delete, never just at
the end; the number of rotations any one insert or delete ever triggers, measured directly instead
of taken on faith; and the tree's height under the identical worst-case insertion order that made
topic 23's plain, unbalanced BST degrade to one long chain. A small, separate, minimal unbalanced
BST (just insert and height -- the full implementation lives in topic 23's own examples.py) recomputes
that degenerate case here, on the identical key set, so the side-by-side contrast is honest rather
than copied from a different topic's run.
"""

import math
import random

RED = "red"
BLACK = "black"


class Node:
    __slots__ = ("key", "color", "left", "right", "parent")

    def __init__(self, key=None, color=BLACK):
        self.key = key
        self.color = color
        self.left = None
        self.right = None
        self.parent = None


class RedBlackTree:
    def __init__(self):
        self.NIL = Node(color=BLACK)
        self.NIL.left = self.NIL.right = self.NIL.parent = self.NIL
        self.root = self.NIL
        self.rotation_count = 0

    def _left_rotate(self, x):
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

    def insert(self, key):
        """Insert `key`, fix up the invariants, and return the number of rotations this one
        insert triggered (CLRS's own bound: at most two)."""
        self.rotation_count = 0
        z = Node(key, RED)
        z.left = z.right = self.NIL
        y, x = self.NIL, self.root
        while x is not self.NIL:
            y = x
            x = x.left if z.key < x.key else x.right
        z.parent = y
        if y is self.NIL:
            self.root = z
        elif z.key < y.key:
            y.left = z
        else:
            y.right = z
        self._insert_fixup(z)
        return self.rotation_count

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
        """Delete `key`, fix up the invariants, and return the number of rotations this one
        delete triggered (CLRS's own bound: at most three)."""
        self.rotation_count = 0
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
        return self.rotation_count

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

    def height(self):
        def h(node):
            if node is self.NIL:
                return 0
            return 1 + max(h(node.left), h(node.right))

        return h(self.root)

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

    def check_invariants(self):
        """Raises if any of the five red-black invariants is violated anywhere in the tree."""
        assert self.root.color == BLACK, "the root must be black"

        def check_no_red_red(node):
            if node is self.NIL:
                return
            if node.color == RED:
                assert node.left.color == BLACK and node.right.color == BLACK, (
                    "a red node must not have a red child"
                )
            check_no_red_red(node.left)
            check_no_red_red(node.right)

        def black_height(node):
            if node is self.NIL:
                return 1
            lh = black_height(node.left)
            rh = black_height(node.right)
            assert lh == rh, "every path to a leaf must pass through the same number of black nodes"
            return lh + (1 if node.color == BLACK else 0)

        check_no_red_red(self.root)
        black_height(self.root)
        return True


class UnbalancedBST:
    """The minimal plain BST needed to recompute topic 23's degenerate case on the identical key
    set -- insert and height only. The full implementation (search, delete, in-order) lives in
    topic 23's own examples.py and is not re-derived here."""

    class _Node:
        __slots__ = ("key", "left", "right")

        def __init__(self, key):
            self.key = key
            self.left = None
            self.right = None

    def __init__(self):
        self.root = None

    def insert(self, key):
        if self.root is None:
            self.root = self._Node(key)
            return
        node = self.root
        while True:
            if key < node.key:
                if node.left is None:
                    node.left = self._Node(key)
                    return
                node = node.left
            else:
                if node.right is None:
                    node.right = self._Node(key)
                    return
                node = node.right

    def height(self):
        def h(node):
            if node is None:
                return 0
            return 1 + max(h(node.left), h(node.right))

        return h(self.root)


random.seed(20261023)

# --- The identical key set and delete set topic 23 used, reproduced bit-for-bit -----------------

NUM_KEYS = 200
keys = random.sample(range(1, 10**6), NUM_KEYS)
deleted = random.sample(keys, 40)

# --- Height under the adversarial, already-sorted insertion order that degraded topic 23's -------
# --- plain BST to one long chain of height 200, on the identical 200 keys -----------------------

degenerate = UnbalancedBST()
for k in sorted(keys):
    degenerate.insert(k)
degenerate_height = degenerate.height()
assert degenerate_height == NUM_KEYS, (
    f"the plain BST must degrade to height {NUM_KEYS} under sorted insertion, not {degenerate_height}"
)

rb_sorted = RedBlackTree()
for k in sorted(keys):
    rb_sorted.insert(k)
    rb_sorted.check_invariants()
rb_sorted_height = rb_sorted.height()

print(f"identical {NUM_KEYS} keys, sorted (worst-case) insertion order:")
print(f"  plain, unbalanced BST (topic 23's case, recomputed here): height {degenerate_height}")
print(f"  red-black tree: height {rb_sorted_height}")

expected_rb_bound = 2 * math.log2(NUM_KEYS + 1)
assert rb_sorted_height <= expected_rb_bound, (
    f"a red-black tree's height must stay within 2*log2(n+1), not {rb_sorted_height}"
)
assert rb_sorted_height < degenerate_height / 10, (
    "the red-black tree must be dramatically shorter than the degenerate plain BST on the same keys"
)

# --- Rotations per single insert and per single delete, measured across every operation ----------

rb = RedBlackTree()
max_insert_rotations = 0
for k in keys:
    r = rb.insert(k)
    rb.check_invariants()
    max_insert_rotations = max(max_insert_rotations, r)

max_insert_rotations_sorted = 0
rb_sorted_count = RedBlackTree()
for k in sorted(keys):
    r = rb_sorted_count.insert(k)
    max_insert_rotations_sorted = max(max_insert_rotations_sorted, r)

overall_max_insert_rotations = max(max_insert_rotations, max_insert_rotations_sorted)

max_delete_rotations = 0
for k in deleted:
    r = rb.delete(k)
    rb.check_invariants()
    max_delete_rotations = max(max_delete_rotations, r)

remaining = sorted(set(keys) - set(deleted))
assert rb.in_order() == remaining, "a red-black tree's in-order traversal must still yield every remaining key in sorted order"

print(f"\n{NUM_KEYS} inserts (random order) + {NUM_KEYS} inserts (sorted order): invariants held after every single one")
print(f"  largest number of rotations any one insert triggered: {overall_max_insert_rotations}")
print(f"{len(deleted)} deletes: invariants held after every single one")
print(f"  largest number of rotations any one delete triggered: {max_delete_rotations}")

assert overall_max_insert_rotations <= 2, f"an insert must never need more than two rotations, not {overall_max_insert_rotations}"
assert max_delete_rotations <= 3, f"a delete must never need more than three rotations, not {max_delete_rotations}"

if __name__ == "__main__":
    print("\nAll checks passed.")
