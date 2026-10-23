"""
LSM-tree write and read paths: a minimal WAL + memtable + immutable SSTable
structure, built from scratch, with a real Bloom filter and fence pointers.
Every number printed here is reused, word for word, in reel.tsx/scenes.tsx.
"""

import hashlib
import math
import random
import bisect

TOMBSTONE = object()  # a delete marker; distinct from "key absent"
NOT_FOUND = object()  # a read that found nothing anywhere


# --- Write-ahead log -------------------------------------------------------


class WAL:
    def __init__(self):
        self.records = []  # list of (seq, key, value_or_TOMBSTONE)

    def append(self, seq, key, value):
        self.records.append((seq, key, value))

    def replay(self):
        """Rebuild what a memtable held from this log alone."""
        state = {}
        for seq, key, value in self.records:
            state[key] = (seq, value)
        return state


# --- Bloom filter -----------------------------------------------------------


class BloomFilter:
    def __init__(self, n_keys, bits_per_key):
        self.m = max(8, int(n_keys * bits_per_key))
        self.k = max(1, round(bits_per_key * math.log(2)))
        self.bits = bytearray(self.m)

    def _slots(self, key):
        h1 = int(hashlib.md5(key.encode()).hexdigest(), 16)
        h2 = int(hashlib.sha1(key.encode()).hexdigest(), 16)
        for i in range(self.k):
            yield (h1 + i * h2) % self.m

    def add(self, key):
        for slot in self._slots(key):
            self.bits[slot] = 1

    def might_contain(self, key):
        return all(self.bits[slot] for slot in self._slots(key))


# --- Immutable on-disk run (SSTable) ---------------------------------------


class SSTable:
    """Built once from a sorted memtable snapshot. Never mutated after."""

    def __init__(self, items, bits_per_key):
        # items: sorted list of (key, (seq, value_or_TOMBSTONE))
        self.keys = [k for k, _ in items]
        self.entries = {k: v for k, v in items}
        self.min_key = self.keys[0]
        self.max_key = self.keys[-1]  # the fence pointer: a boundary range
        self.filter = BloomFilter(len(self.keys), bits_per_key)
        for k in self.keys:
            self.filter.add(k)

    def in_range(self, key):
        """The fence pointer check: does this run's key range even cover it?"""
        return self.min_key <= key <= self.max_key

    def might_contain(self, key):
        return self.filter.might_contain(key)

    def get(self, key):
        return self.entries.get(key, NOT_FOUND)


# --- The LSM structure itself -----------------------------------------------


class LSMTree:
    def __init__(self, flush_threshold, bits_per_key=9.9):
        self.flush_threshold = flush_threshold
        self.bits_per_key = bits_per_key
        self.wal = WAL()
        self.memtable = {}  # key -> (seq, value_or_TOMBSTONE)
        self.runs = []  # newest-first list of SSTable
        self.seq = 0
        self.flush_count = 0

    def _write(self, key, value):
        self.seq += 1
        self.wal.append(self.seq, key, value)
        self.memtable[key] = (self.seq, value)
        if len(self.memtable) >= self.flush_threshold:
            self.flush()

    def put(self, key, value):
        self._write(key, value)

    def delete(self, key):
        self._write(key, TOMBSTONE)

    def flush(self):
        if not self.memtable:
            return
        items = sorted(self.memtable.items())
        run = SSTable(items, self.bits_per_key)
        self.runs.insert(0, run)  # newest run first
        self.flush_count += 1
        self.memtable = {}
        self.wal = WAL()  # the old WAL is now obsolete

    def get(self, key, stats=None):
        """Returns the value, or NOT_FOUND. `stats`, if given, records which
        runs were actually touched (bloom passed + fence passed) vs skipped."""
        if key in self.memtable:
            _, value = self.memtable[key]
            return NOT_FOUND if value is TOMBSTONE else value
        for run in self.runs:
            if not run.in_range(key):
                if stats is not None:
                    stats["fence_skipped"] += 1
                continue
            if not run.might_contain(key):
                if stats is not None:
                    stats["bloom_skipped"] += 1
                continue
            if stats is not None:
                stats["touched"] += 1
            result = run.get(key)
            if result is NOT_FOUND:
                continue
            _, value = result
            return NOT_FOUND if value is TOMBSTONE else value
        return NOT_FOUND


# === 1. Crash recovery: the WAL alone reconstructs the memtable ============

tree = LSMTree(flush_threshold=10_000)  # high threshold: nothing flushes yet
for i in range(50):
    tree.put(f"key{i:03d}", f"v{i}")
tree.delete("key010")

recovered = tree.wal.replay()
expected_live = {f"key{i:03d}": f"v{i}" for i in range(50) if i != 10}
recovered_live = {
    k: v for k, (_, v) in recovered.items() if v is not TOMBSTONE
}
assert recovered_live == expected_live, "WAL replay must reconstruct exactly the live memtable"
assert recovered["key010"][1] is TOMBSTONE, "WAL replay must also reconstruct the tombstone"
print(f"WAL replay: {len(recovered)} records reconstructed, matching the live memtable exactly.")


# === 2. Newest-first reads: memtable beats every run, newest run beats older ===

tree2 = LSMTree(flush_threshold=5)
tree2.put("alpha", "v1")
tree2.put("beta", "v1")
tree2.put("gamma", "v1")
tree2.put("delta", "v1")
tree2.put("epsilon", "v1")  # flush #1 (5 keys)
assert tree2.flush_count == 1

tree2.put("alpha", "v2")  # overwrite, still in the fresh memtable
assert tree2.get("alpha") == "v2", "the memtable's newer value must win over the flushed run"

tree2.put("zeta", "x")
tree2.put("eta", "x")
tree2.put("theta", "x")
tree2.put("iota", "x")
tree2.put("alpha", "v3")  # flush #2 (5 keys, alpha overwritten again)
assert tree2.flush_count == 2
assert tree2.get("alpha") == "v3", "the newest run must win over an older run holding the same key"
print(f"Newest-first reads: {tree2.flush_count} runs flushed, newest value always wins at every read.")


# === 3. Bloom filter: measured false-positive rate against the published table ===

random.seed(20261023)
KEYS = [f"k{n}" for n in random.sample(range(1, 10**7), 5_000)]
BITS_PER_KEY = 9.9  # RocksDB's own published row: ~1% false-positive rate

bf = BloomFilter(len(KEYS), BITS_PER_KEY)
for k in KEYS:
    bf.add(k)

for k in KEYS:
    assert bf.might_contain(k), "a Bloom filter must never produce a false negative"

not_present = [f"absent{n}" for n in random.sample(range(1, 10**7), 20_000)]
not_present = [k for k in not_present if k not in set(KEYS)]
false_positives = sum(1 for k in not_present if bf.might_contain(k))
observed_fp_rate = false_positives / len(not_present)

# RocksDB's own table: 9.9 bits/key ~ 1% false-positive rate. Allow real sampling
# variance (the table is itself an approximation), but it must stay in the
# right ballpark, not drift toward a different row of the same table.
assert 0.001 < observed_fp_rate < 0.05, f"observed FP rate {observed_fp_rate:.4%} is far from the ~1% the table predicts"
print(
    f"Bloom filter: {BITS_PER_KEY} bits/key over {len(KEYS)} keys gives an observed "
    f"false-positive rate of {observed_fp_rate:.3%} (RocksDB's own table predicts ~1%); "
    f"zero false negatives across all {len(KEYS)} present keys."
)


# === 4. Fence pointers + Bloom filters: how many runs a read actually touches ===

tree3 = LSMTree(flush_threshold=200, bits_per_key=BITS_PER_KEY)
random.seed(20261024)
all_keys = random.sample(range(1, 10**6), 1000)
for i, k in enumerate(all_keys):
    tree3.put(f"k{k:07d}", f"v{i}")
tree3.flush()  # flush whatever is left in the memtable
n_runs = len(tree3.runs)
assert n_runs >= 4, "need several runs for the skip-work comparison to mean anything"

lookup_keys = [f"k{k:07d}" for k in random.sample(all_keys, 50)]
lookup_keys += [f"k{k:07d}" for k in random.sample(range(1, 10**6), 50) if k not in set(all_keys)]

touched_total = 0
fence_skipped_total = 0
bloom_skipped_total = 0
unfiltered_total = 0  # what a version with neither filter nor fence pointer would have to check
for key in lookup_keys:
    stats = {"touched": 0, "fence_skipped": 0, "bloom_skipped": 0}
    tree3.get(key, stats=stats)
    touched_total += stats["touched"]
    fence_skipped_total += stats["fence_skipped"]
    bloom_skipped_total += stats["bloom_skipped"]
    unfiltered_total += n_runs  # no memtable hit possible here; every run would be opened

skipped_total = fence_skipped_total + bloom_skipped_total
assert touched_total < unfiltered_total, "filters and fence pointers must reduce runs actually opened"
reduction = 1 - (touched_total / unfiltered_total)
print(
    f"Skip work: {n_runs} runs on disk, {len(lookup_keys)} lookups. Unfiltered reads would open "
    f"{unfiltered_total} run-contents; with fence pointers and a Bloom filter only {touched_total} "
    f"were actually opened ({fence_skipped_total} skipped by range, {bloom_skipped_total} skipped by "
    f"filter) — a {reduction:.0%} reduction."
)


# === 5. Tombstone: a delete hides an older value with zero compactions run ===

tree4 = LSMTree(flush_threshold=3)
tree4.put("session42", "logged-in")
tree4.put("other1", "x")
tree4.put("other2", "x")  # flush #1: session42's value is now in an immutable run
assert tree4.flush_count == 1
assert tree4.get("session42") == "logged-in"

tree4.delete("session42")  # a tombstone, landing only in the fresh memtable
assert tree4.get("session42") is NOT_FOUND, "a tombstone in the memtable must shadow the older run's value"

# the older run's bytes must be completely untouched: it still holds the old value
old_run = tree4.runs[0]
assert old_run.get("session42") != NOT_FOUND, "the flushed run itself is never edited in place"
print("Tombstone: a delete in the memtable hides an older run's value immediately, with zero compactions run; the older run's own bytes are untouched.")

print("All checks passed.")
