"""Every number this topic's reel puts on screen is computed here, never asserted from Abseil's or
Go's own cited numbers alone.

A real group-probing table is built from scratch: the backing array is divided into groups of 16
slots (Abseil's own original width), each with a one-byte-per-slot control array -- either a
sentinel (empty/deleted) or the 7-bit H2 fingerprint of whichever key occupies that slot. H1 (the
rest of the hash) picks which group to start probing, exactly as Abseil's own design note
describes. Python has no raw SSE intrinsics, so the "one SIMD instruction" step is implemented
honestly as a single vectorized group-compare operation, counted as ONE unit of work regardless of
group width, and contrasted against a naive byte-by-byte scan of the same group, counted as one
unit of work PER BYTE -- the real asymmetry the hardware instruction collapses into one step.
"""

import random

GROUP_SIZE = 16
CTRL_EMPTY = 0x80  # sentinel: never equal to a real 7-bit H2 fingerprint (0-127)
NUM_GROUPS = 128  # 128 groups x 16 slots = 2048 total slots


def h1_h2(key):
    h = hash(key) & 0xFFFFFFFFFFFFFFFF
    h2 = h & 0x7F  # lower 7 bits, exactly as the Go Blog's own metadata layout describes
    h1 = h >> 7
    return h1, h2


class Group:
    __slots__ = ("ctrl", "keys")

    def __init__(self):
        self.ctrl = [CTRL_EMPTY] * GROUP_SIZE
        self.keys = [None] * GROUP_SIZE


class SwissTable:
    def __init__(self, num_groups=NUM_GROUPS):
        self.num_groups = num_groups
        self.groups = [Group() for _ in range(num_groups)]

    def insert(self, key) -> None:
        h1, h2 = h1_h2(key)
        gi = h1 % self.num_groups
        for _ in range(self.num_groups):
            g = self.groups[gi]
            for i in range(GROUP_SIZE):
                if g.ctrl[i] == CTRL_EMPTY:
                    g.ctrl[i] = h2
                    g.keys[i] = key
                    return
                if g.ctrl[i] == h2 and g.keys[i] == key:
                    return  # already present
            gi = (gi + 1) % self.num_groups
        raise RuntimeError("table full")

    def vectorized_find(self, key):
        """One 'group compare' = one unit of work, testing all 16 control bytes against h2 at
        once -- the real SIMD instruction's cost. Returns (found, group_compares, key_compares)."""
        h1, h2 = h1_h2(key)
        gi = h1 % self.num_groups
        group_compares = 0
        key_compares = 0
        for _ in range(self.num_groups):
            g = self.groups[gi]
            group_compares += 1  # the entire group's control bytes, tested in one instruction
            candidates = [i for i in range(GROUP_SIZE) if g.ctrl[i] == h2]
            for i in candidates:
                key_compares += 1
                if g.keys[i] == key:
                    return True, group_compares, key_compares
            if CTRL_EMPTY in g.ctrl:
                return False, group_compares, key_compares  # empty slot stops the probe
            gi = (gi + 1) % self.num_groups
        return False, group_compares, key_compares

    def naive_find(self, key):
        """One byte comparison = one unit of work, testing control bytes one at a time."""
        h1, h2 = h1_h2(key)
        gi = h1 % self.num_groups
        byte_compares = 0
        key_compares = 0
        for _ in range(self.num_groups):
            g = self.groups[gi]
            for i in range(GROUP_SIZE):
                byte_compares += 1
                if g.ctrl[i] == CTRL_EMPTY:
                    return False, byte_compares, key_compares
                if g.ctrl[i] == h2:
                    key_compares += 1
                    if g.keys[i] == key:
                        return True, byte_compares, key_compares
            gi = (gi + 1) % self.num_groups
        return False, byte_compares, key_compares


# --- Build a real table and measure group-compare vs. byte-compare cost on the same lookups -----

random.seed(20261023)
ALPHA = 0.5
N = round(ALPHA * NUM_GROUPS * GROUP_SIZE)
table = SwissTable()
present_keys = [f"req-{random.randint(0, 10**9)}" for _ in range(N)]
for k in present_keys:
    table.insert(k)

# Successful lookups: every present key, measuring both strategies' cost.
vec_group_total = 0
vec_key_total = 0
naive_byte_total = 0
naive_key_total = 0
for k in present_keys:
    found, gc, kc = table.vectorized_find(k)
    assert found, f"inserted key {k!r} must be found"
    vec_group_total += gc
    vec_key_total += kc
    found2, bc, kc2 = table.naive_find(k)
    assert found2, f"inserted key {k!r} must be found by the naive scan too"
    naive_byte_total += bc
    naive_key_total += kc2

vec_group_avg = vec_group_total / N
naive_byte_avg = naive_byte_total / N
print(f"successful lookups, n={N}, alpha={ALPHA}:")
print(f"  vectorized: {vec_group_avg:.2f} group-compares/lookup (= 1 instruction each)")
print(f"  naive scan: {naive_byte_avg:.2f} byte-compares/lookup")
print(f"  the naive scan does {naive_byte_avg / vec_group_avg:.1f}x the control-byte work per lookup")

# Measured, not assumed: because insertion fills each group front-to-back, a present key's slot is
# on average only partway into its (half-full, at alpha=0.5) group, so the naive scan's real
# average edge here is a few times, not GROUP_SIZE times -- the vectorized instruction is always
# charged for the whole group regardless of where the match sits, so it can only ever look *worse*
# on average than a scan that gets to stop the moment it hits the match.
assert naive_byte_avg > vec_group_avg, (
    "the naive byte-by-byte scan must still cost strictly more control-byte work than the "
    "vectorized group compare, even though both get to stop once the match is found"
)

# The GROUP_SIZE-times asymmetry the hardware instruction actually collapses shows up at the
# other end of the distribution: a lookup that must rule out every occupied slot in a packed
# group before concluding "not here." Built directly, not inferred from the averages above.
packed = SwissTable(num_groups=1)
packed_keys = [f"packed-{i}" for i in range(GROUP_SIZE - 1)]  # fill all but one slot
for k in packed_keys:
    packed.insert(k)
miss_found, miss_gc, miss_kc = packed.vectorized_find("not-in-the-table")
_, miss_bc, _ = packed.naive_find("not-in-the-table")
assert not miss_found
print(f"\na single near-full group ({GROUP_SIZE - 1}/{GROUP_SIZE} occupied), one miss lookup:")
print(f"  vectorized: {miss_gc} group-compare(s)")
print(f"  naive scan: {miss_bc} byte-compare(s)")
assert miss_bc == GROUP_SIZE, "a miss on a group with one empty slot must scan every slot to find it"
assert miss_gc == 1, "the vectorized compare is always exactly one instruction per group, win or lose"

# --- The 7-bit fingerprint's real false-positive rate --------------------------------------------
# A false positive: a slot's control byte matches the query's H2 by coincidence, forcing a real key
# comparison that then fails. Measured over many lookups for keys NOT in the table.

MISS_TRIALS = 20000
false_positives = 0
total_candidates_checked = 0
for _ in range(MISS_TRIALS):
    miss_key = f"absent-{random.randint(0, 10**9)}"
    found, gc, kc = table.vectorized_find(miss_key)
    assert not found, "a key never inserted must never be found"
    total_candidates_checked += kc
    false_positives += kc  # every key comparison on a miss lookup is, by definition, a false positive

measured_rate = false_positives / (MISS_TRIALS)  # false positives per lookup, not per candidate
h2_collision_chance = 1 / 128  # a 7-bit fingerprint: 1 collision chance in 128, PER OCCUPIED SLOT
# A miss lookup forces a false-H2-match key comparison once per occupied slot it probes before
# finding the empty slot that stops it, not once per group -- a group at this table's load factor
# holds ALPHA * GROUP_SIZE occupied slots on average, so the per-LOOKUP expectation scales with
# that count, not with the flat 1-in-128 per-slot odds alone.
expected_occupied_per_lookup = ALPHA * GROUP_SIZE
theoretical_rate = expected_occupied_per_lookup * h2_collision_chance
print(f"\n{MISS_TRIALS} lookups for keys never inserted:")
print(f"  {false_positives} forced a real key comparison that then failed (false H2 match)")
print(f"  measured false-positive rate: {measured_rate:.4f} per lookup")
print(f"  theoretical odds of a single-slot H2 collision: {h2_collision_chance:.4f}, over an "
      f"expected {expected_occupied_per_lookup:.0f} occupied slots probed per miss: "
      f"{theoretical_rate:.4f}")

assert 0 < measured_rate < theoretical_rate * 1.5, (
    f"measured false-positive rate {measured_rate:.4f} should stay in the right ballpark of "
    f"the theoretical {theoretical_rate:.4f} (occupied slots probed x 1/128), not wildly off"
)

if __name__ == "__main__":
    print("\nAll checks passed.")
