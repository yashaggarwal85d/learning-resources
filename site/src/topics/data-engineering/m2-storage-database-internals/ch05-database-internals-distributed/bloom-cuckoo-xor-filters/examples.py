"""de.bloom-cuckoo-xor-filters — executable evidence.

Builds a real Bloom filter from scratch (bit array, double hashing for k independent-enough hash
positions), sizes it from a target false-positive rate and key count using the real sizing
formula Wikipedia's own article on the structure gives, inserts a real set of member keys, and
measures the real false-positive rate against a disjoint set of held-out non-member keys — then
compares that measured rate directly against the formula's own predicted rate. Cuckoo and xor
filters are sourced and named, not separately built, since this topic's own scope is sizing and
measuring the Bloom filter family's base case; what cuckoo and xor/ribbon filters trade is a
documented, quoted fact (SOURCES.md), not something this sandbox needs its own cuckoo/xor
implementation to re-demonstrate.
"""

import hashlib
import math


class BloomFilter:
    def __init__(self, n_bits, n_hashes):
        self.n_bits = n_bits
        self.n_hashes = n_hashes
        self.bits = bytearray((n_bits + 7) // 8)

    def _positions(self, key):
        # double hashing: two independent digests combined to derive k positions, the same
        # real technique production Bloom filters use to avoid k separate hash computations.
        data = key.encode("utf-8")
        h1 = int.from_bytes(hashlib.sha256(data).digest()[:8], "big")
        h2 = int.from_bytes(hashlib.sha256(data + b"salt").digest()[:8], "big")
        for i in range(self.n_hashes):
            yield (h1 + i * h2) % self.n_bits

    def add(self, key):
        for pos in self._positions(key):
            self.bits[pos // 8] |= 1 << (pos % 8)

    def __contains__(self, key):
        for pos in self._positions(key):
            if not (self.bits[pos // 8] & (1 << (pos % 8))):
                return False
        return True


def size_bloom_filter(n_keys, target_fp_rate):
    """The real sizing formula: bits needed, and the optimal hash count, for a target rate."""
    n_bits = math.ceil(-(n_keys * math.log(target_fp_rate)) / (math.log(2) ** 2))
    n_hashes = max(1, round((n_bits / n_keys) * math.log(2)))
    return n_bits, n_hashes


def theoretical_fp_rate(n_bits, n_hashes, n_keys):
    return (1 - math.exp(-n_hashes * n_keys / n_bits)) ** n_hashes


def measure_bloom_filter(n_keys=20_000, target_fp_rate=0.01, n_test=200_000, seed=1234567):
    n_bits, n_hashes = size_bloom_filter(n_keys, target_fp_rate)
    bits_per_key = n_bits / n_keys

    member_keys = [f"key-{seed}-{i}" for i in range(n_keys)]
    bf = BloomFilter(n_bits, n_hashes)
    for key in member_keys:
        bf.add(key)

    # held-out, disjoint from every member key by construction (different prefix, same seed space)
    held_out_keys = [f"absent-{seed}-{i}" for i in range(n_test)]
    assert set(held_out_keys).isdisjoint(member_keys)

    false_positives = sum(1 for key in held_out_keys if key in bf)
    measured_fp_rate = false_positives / n_test
    predicted_fp_rate = theoretical_fp_rate(n_bits, n_hashes, n_keys)

    for key in member_keys[:500]:
        assert key in bf  # a Bloom filter must never produce a false negative

    return {
        "n_bits": n_bits,
        "n_hashes": n_hashes,
        "bits_per_key": bits_per_key,
        "measured_fp_rate": measured_fp_rate,
        "predicted_fp_rate": predicted_fp_rate,
        "false_positives": false_positives,
        "n_test": n_test,
    }


def run():
    result = measure_bloom_filter()
    print(
        f"Sized for a target 1% false-positive rate over {20_000} keys: "
        f"{result['n_bits']} bits, {result['n_hashes']} hash positions "
        f"({result['bits_per_key']:.2f} bits per key)."
    )
    print(
        f"Measured false-positive rate over {result['n_test']} disjoint held-out keys: "
        f"{result['measured_fp_rate']:.4%} ({result['false_positives']} false positives) "
        f"vs. the formula's own predicted rate: {result['predicted_fp_rate']:.4%}."
    )
    # the measured rate should track the predicted rate closely at this many trials
    assert abs(result["measured_fp_rate"] - result["predicted_fp_rate"]) < 0.004

    # no false negatives, ever, regardless of target rate or key count
    small = measure_bloom_filter(n_keys=500, target_fp_rate=0.1, n_test=1_000, seed=999)
    print(
        f"At a looser 10% target over 500 keys: measured {small['measured_fp_rate']:.4%} vs. "
        f"predicted {small['predicted_fp_rate']:.4%}; every one of the first 500 inserted keys "
        f"was still found present."
    )


if __name__ == "__main__":
    run()
