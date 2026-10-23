"""LSM compaction and amplification: leveled vs. tiered compaction, measured.

Reuses the WAL/memtable/SSTable shape from dsa.lsm-tree-write-read (topic 28);
this topic picks up right where that one's examples.py stopped, at the point
where flushed runs start piling up and something has to compact them.
"""
import hashlib
import math
import random

# ---------------------------------------------------------------------------
# A real Bloom filter (same shape as topic 28's), reused for the Monkey check.
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Generate one workload: a stream of writes to a bounded key universe, so
# later writes overwrite earlier ones and obsolete copies accumulate.
# ---------------------------------------------------------------------------

def make_workload(num_writes, key_universe, flush_size, seed):
    rnd = random.Random(seed)
    ops = [(seq, f"key{rnd.randrange(key_universe):04d}") for seq in range(num_writes)]
    ground_truth = {}
    for seq, key in ops:
        ground_truth[key] = seq
    flushes = []
    for i in range(0, len(ops), flush_size):
        chunk = ops[i:i + flush_size]
        batch = {}
        for seq, key in chunk:
            batch[key] = seq
        flushes.append(batch)
    return flushes, ground_truth


# ---------------------------------------------------------------------------
# Leveled compaction: each level is exactly one non-overlapping sorted run.
# Flushing lands in level 0; a level over its target size merges down,
# rewriting the level below it in full.
# ---------------------------------------------------------------------------

def simulate_leveled(flushes, base_cap, fanout):
    levels = []
    write_units = 0
    for batch in flushes:
        write_units += len(batch)
        if not levels:
            levels.append({})
        levels[0] = {**levels[0], **batch}
        i = 0
        while i < len(levels) and len(levels[i]) > base_cap * (fanout ** i):
            if i + 1 >= len(levels):
                levels.append({})
            merged = {**levels[i + 1], **levels[i]}
            write_units += len(merged)
            levels[i] = {}
            levels[i + 1] = merged
            i += 1
    live = {}
    for level in reversed(levels):
        live.update(level)
    run_count = sum(1 for level in levels if level)
    stored_entries = sum(len(level) for level in levels)
    return write_units, run_count, stored_entries, live


# ---------------------------------------------------------------------------
# Tiered compaction: a tier accumulates several same-size runs, unmerged,
# until enough pile up to merge them all together into one run one tier down.
# ---------------------------------------------------------------------------

def simulate_tiered(flushes, runs_per_tier):
    tiers = []
    write_units = 0
    for batch in flushes:
        write_units += len(batch)
        if not tiers:
            tiers.append([])
        tiers[0].append(dict(batch))
        i = 0
        while i < len(tiers) and len(tiers[i]) >= runs_per_tier:
            merged = {}
            for run in tiers[i]:
                merged.update(run)
            write_units += len(merged)
            tiers[i] = []
            if i + 1 >= len(tiers):
                tiers.append([])
            tiers[i + 1].append(merged)
            i += 1
    live = {}
    for tier in reversed(tiers):
        for run in tier:
            live.update(run)
    run_count = sum(len(tier) for tier in tiers)
    stored_entries = sum(len(run) for tier in tiers for run in tier)
    return write_units, run_count, stored_entries, live


# ---------------------------------------------------------------------------
# 1 & 2. Run both policies over the identical workload; check correctness
#        (the live set either policy ends with must match the ground truth
#        of simply replaying every write in order) before trusting any
#        amplification number measured on top of it.
# ---------------------------------------------------------------------------

NUM_WRITES = 6000
KEY_UNIVERSE = 300
FLUSH_SIZE = 30

flushes, ground_truth = make_workload(NUM_WRITES, KEY_UNIVERSE, FLUSH_SIZE, seed=20261024)

leveled_write, leveled_runs, leveled_stored, leveled_live = simulate_leveled(
    flushes, base_cap=60, fanout=4,
)
tiered_write, tiered_runs, tiered_stored, tiered_live = simulate_tiered(
    flushes, runs_per_tier=4,
)

assert leveled_live == ground_truth, "leveled compaction must agree with replaying every write in order"
assert tiered_live == ground_truth, "tiered compaction must agree with replaying every write in order"
assert len(ground_truth) <= KEY_UNIVERSE

# ---------------------------------------------------------------------------
# 3. Measure write, read and space amplification for each policy on the
#    identical workload, and confirm the stated trade-off, not assume it.
# ---------------------------------------------------------------------------

live_count = len(ground_truth)

leveled_write_amp = leveled_write / NUM_WRITES
tiered_write_amp = tiered_write / NUM_WRITES

leveled_read_amp = leveled_runs
tiered_read_amp = tiered_runs

leveled_space_amp = leveled_stored / live_count
tiered_space_amp = tiered_stored / live_count

print("Leveled vs. tiered compaction, identical workload (6000 writes, 300 keys):")
print(f"  write amplification:  leveled {leveled_write_amp:.2f}x   tiered {tiered_write_amp:.2f}x")
print(f"  read amplification:   leveled {leveled_read_amp} run(s)   tiered {tiered_read_amp} run(s)")
print(f"  space amplification:  leveled {leveled_space_amp:.2f}x   tiered {tiered_space_amp:.2f}x")

assert leveled_read_amp < tiered_read_amp, "leveled must check fewer runs per read than tiered"
assert leveled_space_amp < tiered_space_amp, "leveled must waste less disk on stale copies than tiered"
assert tiered_write_amp < leveled_write_amp, "tiered must rewrite less data than leveled"

# ---------------------------------------------------------------------------
# 4. Monkey's per-level filter-sizing result: at the same total memory
#    budget, sizing each level's filter false-positive rate proportional to
#    that level's own size (not a uniform rate everywhere) lowers the summed
#    false-positive rate across levels. Measured with real, hash-based
#    Bloom filters and real probing, not the closed-form formula alone.
# ---------------------------------------------------------------------------

LEVEL_SIZES = [100, 400, 1600, 6400]
UNIFORM_BITS_PER_KEY = 10.0
TOTAL_BITS_BUDGET = UNIFORM_BITS_PER_KEY * sum(LEVEL_SIZES)

ln2_sq = math.log(2) ** 2
ln_c = (-TOTAL_BITS_BUDGET * ln2_sq - sum(n * math.log(n) for n in LEVEL_SIZES)) / sum(LEVEL_SIZES)
monkey_bits_per_key = []
for n in LEVEL_SIZES:
    fpr_target = math.exp(ln_c) * n
    bpk = -(math.log(fpr_target)) / ln2_sq
    monkey_bits_per_key.append(max(1.0, bpk))

monkey_total_bits = sum(n * bpk for n, bpk in zip(LEVEL_SIZES, monkey_bits_per_key))


def level_keys(n, tag):
    return [f"{tag}-{i:06d}" for i in range(n)]


def measure_fpr(n_keys, bits_per_key, probe_count, seed):
    rnd = random.Random(seed)
    bf = BloomFilter(n_keys, bits_per_key)
    present = level_keys(n_keys, "present")
    for key in present:
        bf.add(key)
    absent = [f"absent-{rnd.randrange(10_000_000):08d}" for _ in range(probe_count)]
    false_positives = sum(1 for key in absent if bf.might_contain(key))
    return false_positives / probe_count


uniform_fprs = [
    measure_fpr(n, UNIFORM_BITS_PER_KEY, probe_count=4000, seed=1000 + i)
    for i, n in enumerate(LEVEL_SIZES)
]
monkey_fprs = [
    measure_fpr(n, bpk, probe_count=4000, seed=2000 + i)
    for i, (n, bpk) in enumerate(zip(LEVEL_SIZES, monkey_bits_per_key))
]

uniform_sum = sum(uniform_fprs)
monkey_sum = sum(monkey_fprs)

print()
print("Monkey vs. uniform per-level Bloom filter sizing, same total memory:")
print(f"  total bits budget:   uniform {TOTAL_BITS_BUDGET:.0f}   monkey {monkey_total_bits:.0f}")
print(f"  summed false-positive rate across levels: uniform {uniform_sum:.4f}   monkey {monkey_sum:.4f}")

# ---------------------------------------------------------------------------
# 5. No single measured policy wins on all three amplification numbers at
#    once, on this real, identical workload — the chapter's own closing
#    claim, demonstrated, not only quoted from the RUM paper.
# ---------------------------------------------------------------------------

leveled_wins = [
    leveled_write_amp < tiered_write_amp,
    leveled_read_amp < tiered_read_amp,
    leveled_space_amp < tiered_space_amp,
]
tiered_wins = [not w for w in leveled_wins]

assert not all(leveled_wins), "leveled must not win on write amplification too"
assert not all(tiered_wins), "tiered must not win on read and space amplification too"
assert monkey_sum < uniform_sum, "Monkey's proportional-fpr allocation must beat uniform at equal memory"

print()
print("All checks passed.")
