"""Every number this topic's reel puts on screen is computed here, never quoted from either cited
analysis (the MIT lecture's uniform-hashing bound, or Knuth's own displacement result) alone.

Two open-addressed tables are built, sharing the same base hash (Python's own hash(), the same
real, well-spread hash topic 16 established as production-real) and differing only in their probe
step: linear probing steps by 1 each time; double hashing steps by a second, independent hash of
the key. Both are measured head to head, same keys, same table size, same load factors.

A second, separate demonstration builds the one correctness subtlety this topic names: deleting an
entry from the middle of a linear-probing run can't simply empty its slot, because a later find()
passing through would stop at the empty slot and miss entries placed beyond it. Two real answers
are built and each verified: a tombstone (the slot stays occupied forever, but find() knows to keep
probing past it), and cluster-rehash deletion (Sedgewick's own algs4 approach -- remove the entry,
then reinsert every later entry in the same run), which fixes the slot immediately instead.
"""

import random
import statistics

M = 2003  # prime table size: double hashing's step is automatically coprime to a prime modulus
EMPTY = None
TOMBSTONE = object()


def h1(key) -> int:
    return hash(key) % M


def h2(key) -> int:
    # a second, independent hash of the same key -- never 0, so the probe sequence always advances
    return 1 + (hash((key, "step")) % (M - 1))


class ProbeTable:
    """An open-addressed table with a swappable probe step: linear (step=1) or double hashing
    (step=h2(key)). No deletion here -- deletion's own correctness subtlety is demonstrated
    separately below, on its own small table."""

    def __init__(self, double: bool):
        self.double = double
        self.slots: list = [EMPTY] * M

    def insert(self, key) -> int:
        """Inserts key, returning the number of probes it took."""
        base = h1(key)
        step = h2(key) if self.double else 1
        for i in range(M):
            idx = (base + i * step) % M
            if self.slots[idx] is EMPTY:
                self.slots[idx] = key
                return i + 1
        raise RuntimeError("table full")


# --- Average probes per successful search, linear probing vs. double hashing, at three alphas ---
# Under no deletions, the number of probes an insertion takes is exactly the number of probes a
# later successful search for that same key will take (same probe sequence, same slots occupied).

ALPHAS = (0.5, 0.75, 0.9)
random.seed(20261023)
PROBE_RESULTS = {}
for alpha in ALPHAS:
    n = round(alpha * M)
    keys = [f"req-{random.randint(0, 10**9)}" for _ in range(n)]
    linear_probes = []
    double_probes = []
    linear_table = ProbeTable(double=False)
    double_table = ProbeTable(double=True)
    for k in keys:
        linear_probes.append(linear_table.insert(k))
        double_probes.append(double_table.insert(k))
    PROBE_RESULTS[alpha] = {
        "n": n,
        "linear_avg": statistics.mean(linear_probes),
        "double_avg": statistics.mean(double_probes),
    }
    # Linear probing's own clustering must make it measurably worse than double hashing at the
    # same alpha -- the real claim this topic teaches, not assumed.
    assert PROBE_RESULTS[alpha]["linear_avg"] > PROBE_RESULTS[alpha]["double_avg"], (
        f"alpha={alpha}: linear probing's average ({PROBE_RESULTS[alpha]['linear_avg']:.2f}) "
        f"should exceed double hashing's ({PROBE_RESULTS[alpha]['double_avg']:.2f})"
    )
    # Double hashing should track the uniform-hashing bound 1/(1-alpha) reasonably closely.
    uniform_bound = 1 / (1 - alpha)
    assert PROBE_RESULTS[alpha]["double_avg"] < uniform_bound * 1.5, (
        f"alpha={alpha}: double hashing's average ({PROBE_RESULTS[alpha]['double_avg']:.2f}) "
        f"should stay reasonably close to the uniform-hashing bound ({uniform_bound:.2f})"
    )

for alpha in ALPHAS:
    r = PROBE_RESULTS[alpha]
    print(
        f"alpha = {alpha:4.2f}  (n={r['n']:4d}, m={M}):  "
        f"linear avg probes = {r['linear_avg']:.2f}   double-hash avg probes = {r['double_avg']:.2f}"
    )

# Primary clustering specifically: as alpha rises, linear probing's average should pull further
# ahead of double hashing's (the gap widens, not just the raw numbers rising together).
low_gap = PROBE_RESULTS[ALPHAS[0]]["linear_avg"] - PROBE_RESULTS[ALPHAS[0]]["double_avg"]
high_gap = PROBE_RESULTS[ALPHAS[-1]]["linear_avg"] - PROBE_RESULTS[ALPHAS[-1]]["double_avg"]
assert high_gap > low_gap, "the linear-vs-double gap must widen as alpha rises -- that widening is primary clustering"

print(f"\nthe linear-vs-double-hashing gap widens from {low_gap:.2f} probes (alpha={ALPHAS[0]}) to {high_gap:.2f} probes (alpha={ALPHAS[-1]}) -- primary clustering getting worse, measured")

# --- Deletion: a tombstone vs. cluster-rehash, both verified correct on the same run ------------
# A small table, a handful of keys forced into one run by a constant step (so there's an actual
# run to delete from the middle of), one deletion from the middle, then every surviving key in the
# run is confirmed still findable -- under each deletion strategy separately.

SMALL_M = 11
RUN_KEYS = [f"k{i}" for i in range(6)]  # six keys, all forced into the same run


def fixed_start(_key) -> int:
    return 3  # every key in RUN_KEYS starts probing at the same slot, building one run


def build_run() -> list:
    slots = [EMPTY] * SMALL_M
    for key in RUN_KEYS:
        idx = fixed_start(key)
        for i in range(SMALL_M):
            probe = (idx + i) % SMALL_M
            if slots[probe] is EMPTY:
                slots[probe] = key
                break
    return slots


def find_skip_tombstones(slots, key, start) -> bool:
    for i in range(SMALL_M):
        probe = (start + i) % SMALL_M
        if slots[probe] is EMPTY:
            return False
        if slots[probe] is not TOMBSTONE and slots[probe] == key:
            return True
    return False


# Tombstone deletion: delete RUN_KEYS[2] (the middle of the run), leave a tombstone, confirm every
# other key in the run is still findable (the tombstone must NOT stop the probe sequence).
tomb_slots = build_run()
deleted_key = RUN_KEYS[2]
deleted_idx = tomb_slots.index(deleted_key)
tomb_slots[deleted_idx] = TOMBSTONE
tombstone_survivors_found = all(
    find_skip_tombstones(tomb_slots, k, fixed_start(k)) for k in RUN_KEYS if k != deleted_key
)
assert tombstone_survivors_found, "every surviving key in the run must still be findable past a tombstone"
assert tomb_slots.count(TOMBSTONE) == 1, "the deleted slot must stay occupied by a tombstone, not emptied"

# Cluster-rehash deletion: same run, same deletion -- but instead of a tombstone, remove the entry
# and reinsert every later entry in the same run (Sedgewick's own algs4 approach), immediately
# fixing the slot. Confirm the same survivors are still findable with a plain "stop at empty" find
# (no tombstone-skipping needed at all).


def find_plain(slots, key, start) -> bool:
    for i in range(SMALL_M):
        probe = (start + i) % SMALL_M
        if slots[probe] is EMPTY:
            return False
        if slots[probe] == key:
            return True
    return False


rehash_slots = build_run()
idx = rehash_slots.index(deleted_key)
rehash_slots[idx] = EMPTY
probe = (idx + 1) % SMALL_M
while rehash_slots[probe] is not EMPTY:
    key_to_rehash = rehash_slots[probe]
    rehash_slots[probe] = EMPTY
    start = fixed_start(key_to_rehash)
    for i in range(SMALL_M):
        candidate = (start + i) % SMALL_M
        if rehash_slots[candidate] is EMPTY:
            rehash_slots[candidate] = key_to_rehash
            break
    probe = (probe + 1) % SMALL_M

rehash_survivors_found = all(
    find_plain(rehash_slots, k, fixed_start(k)) for k in RUN_KEYS if k != deleted_key
)
assert rehash_survivors_found, "every surviving key in the run must still be findable after cluster-rehash"
assert deleted_key not in rehash_slots, "the deleted key must be gone entirely, not left as a tombstone"

print(f"\ntombstone deletion: deleted '{deleted_key}' mid-run, slot stays occupied by a marker, all {len(RUN_KEYS) - 1} survivors still found")
print(f"cluster-rehash deletion: deleted '{deleted_key}' mid-run, slot freed immediately, all {len(RUN_KEYS) - 1} survivors still found")

if __name__ == "__main__":
    print("\nAll checks passed.")
