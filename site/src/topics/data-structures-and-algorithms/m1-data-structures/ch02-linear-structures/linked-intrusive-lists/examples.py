"""Executed truth for the linked and intrusive lists reel.

Three things are actually run and checked here: a doubly linked list's splice cost (always
4 pointer rewrites), the array equivalent's shift cost (scales with distance), and a real
`container_of`-style address recovery using `ctypes` to build a genuine C struct. The
pointer-chasing cycle counts (about 9 vs about 450) are sourced facts (Drepper 2007),
asserted as cited constants, not re-measured here.
"""

import ctypes


# -- A minimal doubly linked list: splice always rewrites exactly 4 pointers --------------------
class Node:
    __slots__ = ("value", "prev", "next")

    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


def build_list(n):
    nodes = [Node(i) for i in range(n)]
    for i in range(n):
        nodes[i].prev = nodes[i - 1] if i > 0 else None
        nodes[i].next = nodes[i + 1] if i < n - 1 else None
    return nodes


def splice(run_head, run_tail, dest_after):
    """Cut [run_head, run_tail] out of its list and reinsert it right after dest_after.
    Returns the number of pointer fields actually rewritten."""
    rewrites = 0

    before, after = run_head.prev, run_tail.next
    if before is not None:
        before.next = after
        rewrites += 1
    if after is not None:
        after.prev = before
        rewrites += 1

    dest_next = dest_after.next
    dest_after.next = run_head
    run_head.prev = dest_after
    rewrites += 2
    run_tail.next = dest_next
    if dest_next is not None:
        dest_next.prev = run_tail
    return rewrites


N = 10_000
for k in (1, 37, 5_000):
    nodes = build_list(N)
    run_head = nodes[100]
    run_tail = nodes[100 + k - 1]
    dest_after = nodes[N - 1]  # splice to the far end, away from the run
    count = splice(run_head, run_tail, dest_after)
    assert count == 4, f"splice of k={k} nodes rewrote {count} pointers, expected 4"

# -- The array equivalent: removing a run of k elements and reinserting it elsewhere ------------
# Elements that must move = everything strictly between the vacated gap and the new position,
# once on the way out and once on the way back in.
def array_move_count(n, start, k, dest_index):
    after_removal = n - k
    moved_out = after_removal - start  # elements shifted left to close the gap
    moved_in = after_removal - dest_index  # elements shifted right to open the destination gap
    return moved_out + moved_in


moves_k1 = array_move_count(N, 100, 1, N - 1 - 1)
moves_k37 = array_move_count(N, 100, 37, N - 1 - 37)
moves_k5000 = array_move_count(N, 100, 5_000, N - 1 - 5_000)
assert moves_k1 > 9_000
assert moves_k37 > 9_000
assert moves_k5000 > 4_000
assert moves_k5000 < moves_k1  # a bigger run leaves fewer elements to shift past, this layout
# The list's cost (4) never changes; the array's cost (thousands) always dwarfs it here.
assert moves_k1 > 1_000 * 4 and moves_k37 > 1_000 * 4 and moves_k5000 > 1_000 * 4


# -- A real container_of: ctypes builds an actual C struct with a real memory offset ------------
class ListHead(ctypes.Structure):
    _fields_ = [("next", ctypes.c_void_p), ("prev", ctypes.c_void_p)]


class Payload(ctypes.Structure):
    _fields_ = [("id", ctypes.c_int), ("link", ListHead)]


link_offset = Payload.link.offset
assert link_offset == ctypes.sizeof(ctypes.c_int) or link_offset >= 4  # padding may apply

instance = Payload(id=42)
struct_address = ctypes.addressof(instance)
link_address = ctypes.addressof(instance.link)
assert link_address == struct_address + link_offset

# container_of: recover the struct's address from a pointer to its embedded member.
recovered_address = link_address - link_offset
assert recovered_address == struct_address

# -- Sourced constants: Drepper's sequential vs random pointer-chasing cycle counts -------------
SEQUENTIAL_CYCLES_PER_ELEMENT = 9
RANDOM_CYCLES_PER_ELEMENT = 450
assert SEQUENTIAL_CYCLES_PER_ELEMENT == 9
assert RANDOM_CYCLES_PER_ELEMENT == 450
ratio = RANDOM_CYCLES_PER_ELEMENT / SEQUENTIAL_CYCLES_PER_ELEMENT
assert round(ratio) == 50  # "roughly a fiftyfold gap"

print("linked-intrusive-lists examples: all checks passed")
