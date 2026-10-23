"""Every number this topic's reel puts on screen is computed here, never assumed from memory of
how a BST or a rotation is supposed to behave.

A plain, unbalanced binary search tree is built from scratch: search and insert by walking the BST
property, delete by replacing a node with its in-order successor (Hibbard's own 1962 method, per
Sedgewick and Wayne's own description), and in-order traversal. Two things are measured directly:
the height of the identical key set inserted in random order versus sorted order (the degenerate
case this topic's own handoff warns about); and that a single rotation changes the tree's shape
while leaving its in-order sequence of keys exactly as it was (MIT 6.006's own stated guarantee).
"""

import math
import random


class Node:
    __slots__ = ("key", "left", "right")

    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None

    def insert(self, key):
        if self.root is None:
            self.root = Node(key)
            return
        node = self.root
        while True:
            if key < node.key:
                if node.left is None:
                    node.left = Node(key)
                    return
                node = node.left
            else:
                if node.right is None:
                    node.right = Node(key)
                    return
                node = node.right

    def search(self, key):
        node = self.root
        while node is not None:
            if key == node.key:
                return True
            node = node.left if key < node.key else node.right
        return False

    def in_order(self):
        result = []

        def walk(node):
            if node is None:
                return
            walk(node.left)
            result.append(node.key)
            walk(node.right)

        walk(self.root)
        return result

    def height(self):
        def h(node):
            if node is None:
                return 0
            return 1 + max(h(node.left), h(node.right))

        return h(self.root)

    def delete(self, key):
        """Delete by replacing with the in-order successor, Hibbard's 1962 method."""
        self.root = self._delete(self.root, key)

    def _delete(self, node, key):
        if node is None:
            return None
        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            if node.left is None:
                return node.right
            if node.right is None:
                return node.left
            # The successor is the smallest key in the right subtree -- no key lies
            # between node.key and the successor's, so swapping it in preserves order.
            successor = node.right
            while successor.left is not None:
                successor = successor.left
            node.key = successor.key
            node.right = self._delete(node.right, successor.key)
        return node

    def rotate_left(self, key):
        """rotate_left(<B>) on the subtree rooted at `key`, relinking O(1) pointers."""
        parent, node = self._find_with_parent(key)
        pivot = node.right
        node.right = pivot.left
        pivot.left = node
        self._replace_child(parent, node, pivot)
        return pivot

    def _find_with_parent(self, key):
        parent, node = None, self.root
        while node.key != key:
            parent = node
            node = node.left if key < node.key else node.right
        return parent, node

    def _replace_child(self, parent, old, new):
        if parent is None:
            self.root = new
        elif parent.left is old:
            parent.left = new
        else:
            parent.right = new


random.seed(20261023)

# --- Delete by successor preserves order, and search/insert/traversal are correct -------------

NUM_KEYS = 200
keys = random.sample(range(1, 10**6), NUM_KEYS)
tree = BST()
for k in keys:
    tree.insert(k)

assert tree.in_order() == sorted(keys), "in-order traversal must yield every key in sorted order"
assert all(tree.search(k) for k in keys), "every inserted key must be found by search"
assert not tree.search(-1), "search must not find a key that was never inserted"

deleted = random.sample(keys, 40)
for k in deleted:
    tree.delete(k)
remaining = sorted(set(keys) - set(deleted))

assert tree.in_order() == remaining, "deleting by successor must leave every other key in order"
print(f"{NUM_KEYS} keys inserted, {len(deleted)} deleted by successor swap: order preserved, {len(remaining)} keys remain")

# --- Height: random insertion order vs sorted insertion order, same key set --------------------

random_tree = BST()
for k in keys:
    random_tree.insert(k)
random_height = random_tree.height()

sorted_tree = BST()
for k in sorted(keys):
    sorted_tree.insert(k)
sorted_height = sorted_tree.height()

print(f"\n{NUM_KEYS} keys, random insertion order: height {random_height}")
print(f"{NUM_KEYS} keys, sorted insertion order:  height {sorted_height}")

expected_random_height_bound = 4 * math.log2(NUM_KEYS)
assert random_height < expected_random_height_bound, (
    f"a randomly-ordered insertion should stay close to log2(n) height, not {random_height}"
)
assert sorted_height == NUM_KEYS, f"sorted insertion must degrade to one long chain of height n, not {sorted_height}"
assert sorted_height > random_height * 10, "the sorted-order tree must be dramatically taller than the random-order one"

# --- A rotation changes shape but never changes the in-order sequence --------------------------

small_tree = BST()
small_keys = [50, 30, 70, 20, 40, 60, 80]
for k in small_keys:
    small_tree.insert(k)

before_order = small_tree.in_order()
before_height = small_tree.height()
small_tree.rotate_left(30)
after_order = small_tree.in_order()
after_height = small_tree.height()

print(f"\nrotating one node in a {len(small_keys)}-key tree:")
print(f"  in-order sequence before: {before_order}")
print(f"  in-order sequence after:  {after_order}")
print(f"  height before: {before_height}, height after: {after_height}")

assert before_order == after_order, "a rotation must never change the tree's in-order sequence of keys"

if __name__ == "__main__":
    print("\nAll checks passed.")
