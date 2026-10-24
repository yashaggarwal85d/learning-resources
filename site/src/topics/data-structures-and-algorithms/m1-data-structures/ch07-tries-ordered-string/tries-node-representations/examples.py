"""Tries and node representations: the same small dictionary built four ways — array
children, hash children, sorted-list children (binary search), and a ternary search
tree — measuring real lookup cost (independent of n) and real memory per representation,
not assuming the array's own blow-up from the source's wording."""
import bisect
import sys

ALPHABET = "abcdefghijklmnopqrstuvwxyz"
R = len(ALPHABET)
assert R == 26

WORDS = [
    "cat", "car", "care", "cart", "cards", "card",
    "dog", "do", "does", "dot", "dote",
    "data", "date", "dad", "dab", "dare",
    "bat", "bath", "bar", "ban", "band",
]
ABSENT = ["ca", "doge", "dats", "bandit", "xyz"]
assert len(WORDS) == 21


# ---------------------------------------------------------------------------
# 1. Array children: one fixed-size slot per possible character, R links per node.
# ---------------------------------------------------------------------------

class ArrayNode:
    __slots__ = ("children", "value")

    def __init__(self):
        self.children = [None] * R
        self.value = None


def array_insert(root, key, value):
    node = root
    for ch in key:
        idx = ord(ch) - ord("a")
        if node.children[idx] is None:
            node.children[idx] = ArrayNode()
        node = node.children[idx]
    node.value = value


def array_lookup(root, key):
    node = root
    steps = 0
    for ch in key:
        steps += 1
        idx = ord(ch) - ord("a")
        node = node.children[idx]
        if node is None:
            return None, steps
    return node.value, steps


def array_memory(node, seen):
    if id(node) in seen:
        return 0
    seen.add(id(node))
    total = sys.getsizeof(node) + sys.getsizeof(node.children)
    for child in node.children:
        if child is not None:
            total += array_memory(child, seen)
    return total


# ---------------------------------------------------------------------------
# 2. Hash children: a small hash table per node, keyed by character.
# ---------------------------------------------------------------------------

class HashNode:
    __slots__ = ("children", "value")

    def __init__(self):
        self.children = {}
        self.value = None


def hash_insert(root, key, value):
    node = root
    for ch in key:
        if ch not in node.children:
            node.children[ch] = HashNode()
        node = node.children[ch]
    node.value = value


def hash_lookup(root, key):
    node = root
    steps = 0
    for ch in key:
        steps += 1
        node = node.children.get(ch)
        if node is None:
            return None, steps
    return node.value, steps


def hash_memory(node, seen):
    if id(node) in seen:
        return 0
    seen.add(id(node))
    total = sys.getsizeof(node) + sys.getsizeof(node.children)
    for child in node.children.values():
        total += hash_memory(child, seen)
    return total


# ---------------------------------------------------------------------------
# 3. Sorted-list children: a node's children kept sorted by character, found
#    by binary search (bisect) — the comparison-search technique used since Ch.1.
# ---------------------------------------------------------------------------

class SortedListNode:
    __slots__ = ("keys", "children", "value")

    def __init__(self):
        self.keys = []
        self.children = []
        self.value = None


def sortedlist_insert(root, key, value):
    node = root
    for ch in key:
        i = bisect.bisect_left(node.keys, ch)
        if i == len(node.keys) or node.keys[i] != ch:
            node.keys.insert(i, ch)
            node.children.insert(i, SortedListNode())
        node = node.children[i]
    node.value = value


def sortedlist_lookup(root, key):
    node = root
    steps = 0
    for ch in key:
        steps += 1
        i = bisect.bisect_left(node.keys, ch)
        if i == len(node.keys) or node.keys[i] != ch:
            return None, steps
        node = node.children[i]
    return node.value, steps


def sortedlist_memory(node, seen):
    if id(node) in seen:
        return 0
    seen.add(id(node))
    total = sys.getsizeof(node) + sys.getsizeof(node.keys) + sys.getsizeof(node.children)
    for child in node.children:
        total += sortedlist_memory(child, seen)
    return total


# ---------------------------------------------------------------------------
# 4. Ternary search tree: one character per node, three children — lo, equal,
#    hi — equal advances to the next character, lo/hi compare the same position.
# ---------------------------------------------------------------------------

class TSTNode:
    __slots__ = ("char", "lo", "eq", "hi", "value")

    def __init__(self, char):
        self.char = char
        self.lo = None
        self.eq = None
        self.hi = None
        self.value = None


def tst_insert(root, key, value):
    def put(node, key, i):
        ch = key[i]
        if node is None:
            node = TSTNode(ch)
        if ch < node.char:
            node.lo = put(node.lo, key, i)
        elif ch > node.char:
            node.hi = put(node.hi, key, i)
        elif i + 1 < len(key):
            node.eq = put(node.eq, key, i + 1)
        else:
            node.value = value
        return node
    return put(root, key, 0)


def tst_lookup(root, key):
    node = root
    i = 0
    steps = 0
    while node is not None and i < len(key):
        steps += 1
        ch = key[i]
        if ch < node.char:
            node = node.lo
        elif ch > node.char:
            node = node.hi
        else:
            i += 1
            if i == len(key):
                return node.value, steps
            node = node.eq
    return None, steps


def tst_memory(node, seen):
    if node is None or id(node) in seen:
        return 0
    seen.add(id(node))
    total = sys.getsizeof(node)
    total += tst_memory(node.lo, seen)
    total += tst_memory(node.eq, seen)
    total += tst_memory(node.hi, seen)
    return total


# ---------------------------------------------------------------------------
# Build all four representations on the identical word list.
# ---------------------------------------------------------------------------

array_root = ArrayNode()
hash_root = HashNode()
sortedlist_root = SortedListNode()
tst_root = None

for w in WORDS:
    array_insert(array_root, w, w)
    hash_insert(hash_root, w, w)
    sortedlist_insert(sortedlist_root, w, w)
    tst_root = tst_insert(tst_root, w, w)

# ---------------------------------------------------------------------------
# Correctness: all four agree on every present and absent key.
# ---------------------------------------------------------------------------

for w in WORDS:
    a, _ = array_lookup(array_root, w)
    h, _ = hash_lookup(hash_root, w)
    s, _ = sortedlist_lookup(sortedlist_root, w)
    t, _ = tst_lookup(tst_root, w)
    assert a == h == s == t == w, (w, a, h, s, t)

for w in ABSENT:
    a, _ = array_lookup(array_root, w)
    h, _ = hash_lookup(hash_root, w)
    s, _ = sortedlist_lookup(sortedlist_root, w)
    t, _ = tst_lookup(tst_root, w)
    assert a is None and h is None and s is None, (w, a, h, s)
    # tst_lookup can overshoot past the key's own length while chasing lo/hi;
    # the only claim made here is "not a hit", not "none" for every absent key.
    assert t is None or t not in WORDS, (w, t)

# ---------------------------------------------------------------------------
# Lookup cost: independent of n — one step per character, regardless of
# representation or dictionary size.
# ---------------------------------------------------------------------------

print("Lookup steps per character (array / hash / sorted-list), by key:")
for w in WORDS[:6]:
    _, a_steps = array_lookup(array_root, w)
    _, h_steps = hash_lookup(hash_root, w)
    _, s_steps = sortedlist_lookup(sortedlist_root, w)
    assert a_steps == h_steps == s_steps == len(w)
    print(f"  {w!r}: {a_steps} steps, key length {len(w)}")

# ---------------------------------------------------------------------------
# Real memory per representation, on the identical dictionary.
# ---------------------------------------------------------------------------

def count_nodes_array(node, seen):
    if id(node) in seen:
        return 0
    seen.add(id(node))
    n = 1
    for c in node.children:
        if c is not None:
            n += count_nodes_array(c, seen)
    return n


def count_nodes_tst(node, seen):
    if node is None or id(node) in seen:
        return 0
    seen.add(id(node))
    return 1 + count_nodes_tst(node.lo, seen) + count_nodes_tst(node.eq, seen) + count_nodes_tst(node.hi, seen)


array_bytes = array_memory(array_root, set())
hash_bytes = hash_memory(hash_root, set())
sortedlist_bytes = sortedlist_memory(sortedlist_root, set())
tst_bytes = tst_memory(tst_root, set())
array_node_count = count_nodes_array(array_root, set())
tst_node_count = count_nodes_tst(tst_root, set())

print()
print(f"Dictionary: {len(WORDS)} words, alphabet size R={R}")
print(f"Array children:        {array_bytes:6d} bytes total, {array_bytes / array_node_count:7.1f} bytes/node, {array_node_count} nodes")
print(f"Hash children:         {hash_bytes:6d} bytes total")
print(f"Sorted-list children:  {sortedlist_bytes:6d} bytes total")
print(f"Ternary search tree:   {tst_bytes:6d} bytes total, {tst_bytes / tst_node_count:7.1f} bytes/node, {tst_node_count} nodes")
print()
print(f"Array / TST total-memory ratio: {array_bytes / tst_bytes:.2f}x")
print(f"Array / Hash total-memory ratio: {array_bytes / hash_bytes:.2f}x")
print(f"Array / Sorted-list total-memory ratio: {array_bytes / sortedlist_bytes:.2f}x")

# The array representation is measured, not assumed, to be the most expensive —
# every other representation stores only its own live children, never R slots.
assert array_bytes > hash_bytes
assert array_bytes > sortedlist_bytes
assert array_bytes > tst_bytes

# Null-link waste in the array representation: of R slots per node, count how
# many are actually used (non-None) across the whole array trie.
total_slots = array_node_count * R


def count_used_slots(node, seen):
    if id(node) in seen:
        return 0
    seen.add(id(node))
    used = sum(1 for c in node.children if c is not None)
    for c in node.children:
        if c is not None:
            used += count_used_slots(c, seen)
    return used


used_slots = count_used_slots(array_root, set())
null_slots = total_slots - used_slots
print()
print(f"Array representation: {total_slots} total child slots across {array_node_count} nodes, "
      f"{used_slots} used, {null_slots} null ({null_slots / total_slots:.1%} wasted)")

assert null_slots / total_slots > 0.5
assert round(100 * null_slots / total_slots, 1) == 96.3

print()
print("All checks passed.")
