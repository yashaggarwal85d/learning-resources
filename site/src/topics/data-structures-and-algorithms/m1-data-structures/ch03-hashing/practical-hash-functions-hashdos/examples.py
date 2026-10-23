"""Every number this topic's reel puts on screen is computed here, on whatever machine runs this
script — never quoted from a vendor's own benchmark (those numbers, from xxHash's and SipHash's own
tables, are cited in prose in references.md/post-notes.md, scoped to the vendor's own hardware).

Three tiers, benchmarked the same way on the same machine, all three C-accelerated so the
comparison measures the algorithms and not interpreter overhead:
  - zlib.crc32: a real, fast, non-cryptographic checksum (the "fast tier" stand-in for
    xxHash3/wyhash/FxHash).
  - Python's own hash() of a bytes object: CPython has used SipHash as its str/bytes hash since
    PEP 456, specifically to fix hash-flooding attacks, and randomly seeds it per process (the
    "keyed/PRF tier" — see SOURCES.md).
  - hashlib.sha256 (the "cryptographic tier").

A from-scratch pure-Python SipHash-2-4 reference implementation is also included, verified against
a published test vector, but used only to show the mechanism's real round structure (step 7's
diagram) — never for the speed benchmark. An early draft of this script benchmarked that pure-
Python implementation against the C-accelerated hashlib.sha256 and got SHA-256 "faster" than
SipHash, the wrong way round: that measured the interpreter, not the algorithms. See FACT-CHECK.md.

Then the actual HashDoS mechanism: a deliberately weak hash (sum of byte values mod table size,
never presented as a real library's choice), a from-scratch chained hash table built on it, and a
set of keys constructed by direct formula (not search) to all collide under that weak hash. Timed
against the same number of random keys, to measure the real slowdown. Finally, the same crafted
colliding keys run through the weak hash plus an unknown-to-the-attacker random per-process seed, to
measure how much they scatter — the real, honest scope of what a random seed buys (see FACT-CHECK.md
for why this script does not attempt to demonstrate the deeper timing/adaptive-query attack the
SipHash paper describes: that is a cited mathematical argument, not a system this topic builds).
"""

import hashlib
import random
import time
import zlib

MASK64 = (1 << 64) - 1

# --- SipHash-2-4: a from-scratch reference implementation ---------------------------------------
# The original SipHash parameters (c=2, d=4) the paper itself proposes and gives test vectors for.
# Rust's std HashMap currently defaults to the faster SipHash-1-3 variant (fewer compression
# rounds, same family); this topic benchmarks SipHash-2-4 because its test vector can be verified
# directly against the paper, and the paper's own claims (PRF strength, speed competitive with
# non-cryptographic hashes) are about this reference variant. Not for production use: no attempt is
# made at constant-time execution. It exists only to produce a real, measured relative timing
# number on this machine.


def _rotl(x: int, b: int) -> int:
    return ((x << b) | (x >> (64 - b))) & MASK64


def _sipround(v0, v1, v2, v3):
    v0 = (v0 + v1) & MASK64
    v1 = _rotl(v1, 13)
    v1 ^= v0
    v0 = _rotl(v0, 32)
    v2 = (v2 + v3) & MASK64
    v3 = _rotl(v3, 16)
    v3 ^= v2
    v0 = (v0 + v3) & MASK64
    v3 = _rotl(v3, 21)
    v3 ^= v0
    v2 = (v2 + v1) & MASK64
    v1 = _rotl(v1, 17)
    v1 ^= v2
    v2 = _rotl(v2, 32)
    return v0, v1, v2, v3


def siphash24(key: bytes, data: bytes) -> int:
    assert len(key) == 16, "SipHash takes a 128-bit key"
    k0 = int.from_bytes(key[0:8], "little")
    k1 = int.from_bytes(key[8:16], "little")
    v0 = k0 ^ 0x736F6D6570736575
    v1 = k1 ^ 0x646F72616E646F6D
    v2 = k0 ^ 0x6C7967656E657261
    v3 = k1 ^ 0x7465646279746573

    n = len(data)
    end = n - (n % 8)
    for i in range(0, end, 8):
        m = int.from_bytes(data[i : i + 8], "little")
        v3 ^= m
        for _ in range(2):  # c = 2
            (v0, v1, v2, v3) = _sipround(v0, v1, v2, v3)
        v0 ^= m

    tail = data[end:]
    last = bytes([n & 0xFF]) + tail + bytes(7 - len(tail))
    m = int.from_bytes(last, "little")
    v3 ^= m
    for _ in range(2):  # c = 2
        (v0, v1, v2, v3) = _sipround(v0, v1, v2, v3)
    v0 ^= m

    v2 ^= 0xFF
    for _ in range(4):  # d = 4
        (v0, v1, v2, v3) = _sipround(v0, v1, v2, v3)
    return (v0 ^ v1 ^ v2 ^ v3) & MASK64


# A fixed test vector from the SipHash reference implementation (key = bytes 0..15, input = empty)
# confirms this implementation matches the published algorithm, not just "a" ARX hash. It is used
# below only to show the mechanism's shape (step 7's pipeline diagram runs real round values from
# it) — NOT for the speed benchmark: a pure-Python loop timed against C-accelerated library
# functions would measure the interpreter, not the algorithms (an early draft of this script did
# exactly that and got SHA-256 "faster" than SipHash, the wrong way round — the fix below times
# three C-accelerated primitives against each other instead).
_TEST_KEY = bytes(range(16))
assert siphash24(_TEST_KEY, b"") == 0x726FDB47DD0E0E31, "siphash24 does not match the reference test vector"

# --- Benchmark harness: three C-accelerated primitives, real keys, real timing ------------------
# CPython's own hash() of a bytes/str object is exactly this topic's "keyed/PRF tier" in
# production: PEP 456 made SipHash the default hash for str and bytes specifically to fix hash-
# flooding DoS attacks (see SOURCES.md), and it is randomly seeded per process (PYTHONHASHSEED).
# zlib.crc32 stands in for the fast non-cryptographic tier (xxHash3/wyhash/FxHash); hashlib.sha256
# is the cryptographic tier. All three are C implementations, so this measures the algorithms, not
# interpreter overhead.

random.seed(20261022)
KEYS = [bytes(random.randint(0, 255) for _ in range(random.choice([8, 10, 12, 16]))) for _ in range(200_000)]


def bench(fn, keys, repeats=5):
    best = None
    for _ in range(repeats):
        start = time.perf_counter()
        for k in keys:
            fn(k)
        dt = time.perf_counter() - start
        best = dt if best is None else min(best, dt)
    return best / len(keys)  # seconds per key


t_fast = bench(zlib.crc32, KEYS)
t_keyed = bench(hash, KEYS)  # CPython's own str/bytes hash: SipHash-2-4, randomly seeded
t_crypto = bench(lambda k: hashlib.sha256(k).digest(), KEYS)

ns_fast = t_fast * 1e9
ns_keyed = t_keyed * 1e9
ns_crypto = t_crypto * 1e9
ratio_keyed_over_fast = ns_keyed / ns_fast
ratio_crypto_over_fast = ns_crypto / ns_fast

assert ns_crypto > ns_fast, "the cryptographic tier should be slower per key than the fast tier on this machine"

print(f"fast tier   (zlib.crc32):     {ns_fast:6.1f} ns/key")
print(f"keyed tier  (hash, SipHash):  {ns_keyed:6.1f} ns/key  ({ratio_keyed_over_fast:4.1f}x fast tier)")
print(f"crypto tier (hashlib.sha256): {ns_crypto:6.1f} ns/key  ({ratio_crypto_over_fast:4.1f}x fast tier)")

# --- The HashDoS mechanism: a deliberately weak hash and a chained table ------------------------

TABLE_SIZE = 256
KEY_LEN = 8
UNKEYED_COEFFS = (1,) * KEY_LEN  # the "public" hash: every byte weighted equally


def weak_hash(key: bytes, coeffs: tuple[int, ...] = UNKEYED_COEFFS, table_size: int = TABLE_SIZE) -> int:
    """Deliberately weak: the exact linear form the SipHash paper quotes as the Crosby-Wallach
    proposal, H(m0, m1, ...) = m0*k0 + m1*k1 + ..., with the public, unkeyed coefficients all 1
    (so it's just a byte sum) unless a per-process coefficient vector is supplied. Never a real
    library's choice."""
    return sum(b * c for b, c in zip(key, coeffs)) % table_size


class ChainedTable:
    def __init__(self, size: int, hash_fn):
        self.buckets: list[list[bytes]] = [[] for _ in range(size)]
        self.hash_fn = hash_fn

    def insert(self, key: bytes) -> None:
        self.buckets[self.hash_fn(key)].append(key)

    def lookup(self, key: bytes) -> int:
        """Walks the chain comparing each entry, exactly as a real chained lookup must; returns
        how many comparisons it took."""
        comparisons = 0
        for entry in self.buckets[self.hash_fn(key)]:
            comparisons += 1
            if entry == key:
                return comparisons
        return comparisons


N_FLOOD = 4_000

# Construct N_FLOOD keys that all collide under weak_hash (direct construction, not search): an
# 8-byte key whose first 7 bytes vary and whose last byte is chosen so the total byte sum is a
# fixed constant mod TABLE_SIZE.
TARGET_SUM_MOD = 17


def make_colliding_key(i: int) -> bytes:
    head = bytes([(i >> 8) & 0xFF, i & 0xFF, 0x41, 0x42, 0x43, 0x44])
    partial = sum(head)
    last = (TARGET_SUM_MOD - partial) % 256
    return head + bytes([last])


COLLIDING_KEYS = [make_colliding_key(i) for i in range(N_FLOOD)]
assert len({weak_hash(k) for k in COLLIDING_KEYS}) == 1, "every crafted key must land in the same bucket"

RANDOM_KEYS = [bytes(random.randint(0, 255) for _ in range(8)) for _ in range(N_FLOOD)]


def time_insert_and_lookup(keys: list[bytes], hash_fn) -> float:
    table = ChainedTable(TABLE_SIZE, hash_fn)
    start = time.perf_counter()
    for k in keys:
        table.insert(k)
    # one full lookup pass, which is where a flooded bucket actually hurts
    total = 0
    for k in keys:
        total += table.lookup(k)
    return time.perf_counter() - start


t_colliding = min(time_insert_and_lookup(COLLIDING_KEYS, weak_hash) for _ in range(3))
t_random = min(time_insert_and_lookup(RANDOM_KEYS, weak_hash) for _ in range(3))
flood_ratio = t_colliding / t_random

print(f"\n{N_FLOOD} colliding keys: {t_colliding * 1000:6.1f} ms")
print(f"{N_FLOOD} random keys:    {t_random * 1000:6.1f} ms")
print(f"flood ratio:            {flood_ratio:6.1f}x slower")

assert flood_ratio > 20, f"the crafted flood should be dramatically slower, got only {flood_ratio:.1f}x"

# --- What a per-process random key actually buys: scatter, not full safety ----------------------
# Keying this same linear hash family (per-process random coefficients, unknown to whoever built
# COLLIDING_KEYS against the public coefficients) is exactly the Crosby-Wallach proposal the
# SipHash paper critiques. It genuinely defeats *this* precomputed attack: the colliding keys were
# constructed to balance a sum with every coefficient equal to 1, so a different, unknown
# coefficient vector gives a different, effectively random-looking sum per key.

random.seed(20261022 + 1)
SECRET_COEFFS = tuple(random.randint(1, 255) for _ in range(KEY_LEN))  # unknown to "the attacker"
buckets_before = len({weak_hash(k) for k in COLLIDING_KEYS})
buckets_after = len({weak_hash(k, coeffs=SECRET_COEFFS) for k in COLLIDING_KEYS})
scatter_fraction = buckets_after / TABLE_SIZE

print(f"\ndistinct buckets before a per-process key: {buckets_before} of {TABLE_SIZE} possible")
print(f"distinct buckets after a per-process key:  {buckets_after} of {TABLE_SIZE} possible ({scatter_fraction:.0%} of the table)")

assert buckets_before == 1, "the whole point of the crafted flood is that it starts in one bucket"
assert buckets_after >= TABLE_SIZE * 0.9, "an unknown per-process key should spread the precomputed flood across nearly the whole table"

if __name__ == "__main__":
    print("\nAll checks passed.")
