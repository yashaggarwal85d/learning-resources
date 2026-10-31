"""Bloom filters and the false-positive math: the structure, the rate formula, the optimal
number of hash functions, the space lower bound, the two-hash probe trick, and the one thing
the structure cannot do (delete).

Every number the reel shows is computed or asserted here, not assumed.
"""
import hashlib
import math
import random


def _hash64(*parts):
    """A real, well-mixed 64-bit hash (SHA-256 truncated), not Python's built-in
    hash(): a quick check during development found that combining small ints with
    strings through hash()'s tuple mixing leaves visible correlation across probes
    of the same key, inflating the measured false-positive rate several times over
    the formula's prediction. SHA-256 removes that artifact."""
    digest = hashlib.sha256("|".join(str(p) for p in parts).encode()).digest()
    return int.from_bytes(digest[:8], "little")


# ---------------------------------------------------------------------------
# The structure itself: k hash functions over m bits, each a real 64-bit hash
# salted with an integer index to stand in for k independent hash functions.
# ---------------------------------------------------------------------------
class BloomFilter:
    def __init__(self, m_bits, k_hashes, seed=0):
        self.m = m_bits
        self.k = k_hashes
        self.bits = bytearray((m_bits + 7) // 8)
        self.seed = seed

    def _positions(self, key):
        for i in range(self.k):
            h = _hash64(self.seed, i, key)
            yield h % self.m

    def add(self, key):
        for pos in self._positions(key):
            self.bits[pos // 8] |= 1 << (pos % 8)

    def __contains__(self, key):
        for pos in self._positions(key):
            if not (self.bits[pos // 8] & (1 << (pos % 8))):
                return False
        return True

    def clear_key(self, key):
        """No delete operation exists on a real Bloom filter -- this directly clears
        one key's k bits to demonstrate why that would be unsafe (false negatives)."""
        for pos in self._positions(key):
            self.bits[pos // 8] &= ~(1 << (pos % 8))

    def fill_fraction(self):
        ones = sum(bin(b).count("1") for b in self.bits)
        return ones / self.m


# ---------------------------------------------------------------------------
# LevelDB's own construction: k = bits_per_key * 0.69, clamped to 1..30,
# truncated (not rounded). Reproduced from util/bloom.cc (SOURCES.md).
# ---------------------------------------------------------------------------
def leveldb_k(bits_per_key):
    k = int(bits_per_key * 0.69)
    if k < 1:
        k = 1
    if k > 30:
        k = 30
    return k


def optimal_k(bits_per_key):
    """k = (m/n) ln 2, rounded to the nearest integer (Chapter 5 topic 28's convention)."""
    return round(bits_per_key * math.log(2))


def formula_rate(bits_per_key, k):
    """f = (1 - e^{-kn/m})^k, with n/m = 1/bits_per_key."""
    return (1 - math.exp(-k / bits_per_key)) ** k


# ---------------------------------------------------------------------------
# Running example: one LSM run's key set, the size Chapter 5 topic 28 used
# a filter for. Kept small enough that examples.py runs fast, per CHAPTER.md.
# ---------------------------------------------------------------------------
N_KEYS = 200_000
rng = random.Random(7)
KEYS = [f"key-{i}" for i in range(N_KEYS)]
ABSENT_KEYS = [f"absent-{i}" for i in range(N_KEYS)]


def build_filter(bits_per_key, k, seed=0):
    m = N_KEYS * bits_per_key
    bf = BloomFilter(m, k, seed=seed)
    for key in KEYS:
        bf.add(key)
    return bf


def measure_false_positive_rate(bf, probe_keys):
    hits = sum(1 for key in probe_keys if key in bf)
    return hits / len(probe_keys)


# ---------------------------------------------------------------------------
# 1. Rate against bits per key, at the rounded optimum k for each.
# ---------------------------------------------------------------------------
print("rate against bits per key (formula vs. measured, k = round((m/n) ln 2)):")
rate_table = []
for bits_per_key in (8, 10, 12, 16, 20):
    k = optimal_k(bits_per_key)
    bf = build_filter(bits_per_key, k, seed=1)
    measured = measure_false_positive_rate(bf, ABSENT_KEYS)
    predicted = formula_rate(bits_per_key, k)
    rate_table.append((bits_per_key, k, predicted, measured))
    print(
        f"  {bits_per_key:2d} bits/key -> k={k}, formula {predicted*100:.3f}%, "
        f"measured {measured*100:.3f}%"
    )

# Each measured rate must land near its own formula value -- the approximation
# is "very close, within O(1/m)" per the Broder-Mitzenmacher survey, not exact.
for bits_per_key, k, predicted, measured in rate_table:
    assert abs(measured - predicted) < predicted * 0.5 + 0.002, (
        f"measured rate at {bits_per_key} bits/key drifted too far from the formula"
    )

# ---------------------------------------------------------------------------
# 2. The optimum is flat: at 10 bits/key, rate for several values of k.
# ---------------------------------------------------------------------------
print("\nthe optimum is flat, at 10 bits per key:")
flat_bits_per_key = 10
flat_table = []
for k in (1, 2, 4, 6, 7, 8, 10, 14):
    bf = build_filter(flat_bits_per_key, k, seed=2)
    measured = measure_false_positive_rate(bf, ABSENT_KEYS)
    predicted = formula_rate(flat_bits_per_key, k)
    flat_table.append((k, predicted, measured))
    print(f"  k={k:2d}: formula {predicted*100:.2f}%, measured {measured*100:.2f}%")

best_k = min(flat_table, key=lambda row: row[1])[0]
assert best_k in (6, 7, 8), "the formula's minimum should fall near k=7 at 10 bits/key"
k6_rate = next(p for k, p, m in flat_table if k == 6)[0] if False else None
rates_by_k = {k: p for k, p, m in flat_table}
assert abs(rates_by_k[6] - rates_by_k[7]) / rates_by_k[7] < 0.1, (
    "k=6 and k=7 should be within about 10% of each other -- the valley is flat"
)
assert abs(rates_by_k[8] - rates_by_k[7]) / rates_by_k[7] < 0.1, (
    "k=8 and k=7 should be within about 10% of each other -- the valley is flat"
)

# ---------------------------------------------------------------------------
# 3. The fill at the optimum: about half the bits are one.
# ---------------------------------------------------------------------------
optimum_bf = build_filter(10, optimal_k(10), seed=3)
fill = optimum_bf.fill_fraction()
print(f"\nfill fraction at the optimum (10 bits/key, k={optimal_k(10)}): {fill:.3f}")
assert 0.45 < fill < 0.55, "about half the bits should be set at the optimal k"

# ---------------------------------------------------------------------------
# 4. The space lower bound: m >= n log2(1/eps); Bloom pays ~1.44x that.
# ---------------------------------------------------------------------------
print("\nthe bound, bits per key needed at a target rate:")
bound_table = []
for eps in (0.01, 1e-6):
    lower_bound_bits = math.log2(1 / eps)
    bloom_bits = lower_bound_bits * math.log2(math.e)
    bound_table.append((eps, lower_bound_bits, bloom_bits))
    print(
        f"  eps={eps}: lower bound {lower_bound_bits:.2f} bits/key, "
        f"Bloom needs {bloom_bits:.2f} bits/key"
    )

ratio = bound_table[0][2] / bound_table[0][1]
assert abs(ratio - math.log2(math.e)) < 1e-9, "the Bloom/bound ratio must be exactly log2(e)"
assert abs(ratio - 1.4427) < 0.001, "that ratio is about 1.44"

# halving eps costs exactly log2(e) more bits/key, for both the bound and Bloom
bits_at_1pct = math.log2(1 / 0.01)
bits_at_half_pct = math.log2(1 / 0.005)
assert abs((bits_at_half_pct - bits_at_1pct) - 1.0) < 1e-9, (
    "halving eps costs exactly one more bit/key at the information-theoretic bound"
)

# ---------------------------------------------------------------------------
# 5. Derived probes (two hashes simulating k) vs. k independent hashes.
# ---------------------------------------------------------------------------
class DerivedProbeBloomFilter:
    """Kirsch-Mitzenmacher: g_i(x) = h1(x) + i*h2(x) mod m, from only two hash values."""

    def __init__(self, m_bits, k_hashes, seed=0):
        self.m = m_bits
        self.k = k_hashes
        self.bits = bytearray((m_bits + 7) // 8)
        self.seed = seed

    def _positions(self, key):
        h1 = _hash64(self.seed, "h1", key)
        h2 = _hash64(self.seed, "h2", key)
        for i in range(self.k):
            yield (h1 + i * h2) % self.m

    def add(self, key):
        for pos in self._positions(key):
            self.bits[pos // 8] |= 1 << (pos % 8)

    def __contains__(self, key):
        for pos in self._positions(key):
            if not (self.bits[pos // 8] & (1 << (pos % 8))):
                return False
        return True


def build_derived_filter(bits_per_key, k, seed=0):
    m = N_KEYS * bits_per_key
    bf = DerivedProbeBloomFilter(m, k, seed=seed)
    for key in KEYS:
        bf.add(key)
    return bf

independent_bf = build_filter(10, 7, seed=4)
derived_bf = build_derived_filter(10, 7, seed=4)
independent_rate = measure_false_positive_rate(independent_bf, ABSENT_KEYS)
derived_rate = measure_false_positive_rate(derived_bf, ABSENT_KEYS)
print(
    f"\nderived probes vs. independent hashes at 10 bits/key, k=7: "
    f"independent {independent_rate*100:.3f}%, derived {derived_rate*100:.3f}%"
)
assert abs(independent_rate - derived_rate) < 0.004, (
    "the two-hash derived scheme should agree with independent hashes within sampling noise"
)

# ---------------------------------------------------------------------------
# 6. The deletion failure: clearing one key's bits can falsely clear another
#    present key's bits too, by search on a small filter (not hand-picked).
# ---------------------------------------------------------------------------
def find_deletion_failure():
    small_bf = BloomFilter(m_bits=24, k_hashes=3, seed=9)
    inserted = []
    for i in range(50):
        key = f"small-{i}"
        small_bf.add(key)
        inserted.append(key)
        if len(inserted) < 2:
            continue
        victim = inserted[0]
        target = inserted[-1]
        trial = BloomFilter(m_bits=24, k_hashes=3, seed=9)
        for k in inserted:
            trial.add(k)
        trial.clear_key(victim)
        if target != victim and target not in trial:
            return victim, target, list(inserted)
    return None


deletion_failure = find_deletion_failure()
print(f"\ndeletion failure found: {deletion_failure is not None}")
assert deletion_failure is not None, "a deletion failure must be found by search"
victim, target, inserted_set = deletion_failure
print(f"  clearing '{victim}' turns '{target}' from present to absent (false negative)")

# ---------------------------------------------------------------------------
# 7. Chapter 5 topic 28 reconciliation: 9.9 bits/key, k=7, lands near 1%.
# ---------------------------------------------------------------------------
reconciliation_bits_per_key = 9.9
reconciliation_k = optimal_k(reconciliation_bits_per_key)
reconciliation_rate = formula_rate(reconciliation_bits_per_key, reconciliation_k)
print(
    f"\nChapter 5 reconciliation: {reconciliation_bits_per_key} bits/key -> "
    f"k={reconciliation_k}, formula rate {reconciliation_rate*100:.2f}% "
    f"(RocksDB's published row: about 1%)"
)
assert reconciliation_k == 7, "9.9 bits/key should round to k=7, matching topic 28"
assert 0.005 < reconciliation_rate < 0.015, "the formula rate should land near RocksDB's 1% row"

# ---------------------------------------------------------------------------
# 8. LevelDB's truncated k vs. the rounded optimum, at 10 bits/key.
# ---------------------------------------------------------------------------
leveldb_k10 = leveldb_k(10)
rounded_k10 = optimal_k(10)
print(
    f"\nLevelDB's truncated k at 10 bits/key: {leveldb_k10} "
    f"(int(10*0.69)={int(10*0.69)}); topic 28's rounded k: {rounded_k10}"
)
assert leveldb_k10 == 6
assert rounded_k10 == 7

print("\nall assertions passed.")
