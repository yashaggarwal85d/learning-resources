"""de.hyperloglog-distinct-counting — executable evidence.

Hosts the chapter's own §5.6 lab: a real HyperLogLog sketch (leading-zero register observable,
harmonic mean across registers) and a real Count-Min Sketch (named sourced-only in this chapter's
own syllabus — a *(skipped)* entry — but built here as this topic's own worked comparison, per
CHAPTER.md's own instruction), both measured for real error vs. memory against exact counts on a
real Zipf-skewed stream, then merged across simulated partitions and checked against a
single-pass sketch over the same combined data. HLL++'s own bias correction and sparse mode, and
Theta/KMV set operations, are sourced and named (SOURCES.md), not separately implemented, since
this topic's own lab scope is the base HyperLogLog and Count-Min Sketch structures.
"""

import hashlib
import math
import random


class HyperLogLog:
    def __init__(self, n_registers_bits):
        self.p = n_registers_bits
        self.m = 1 << n_registers_bits
        self.registers = [0] * self.m
        self.alpha = 0.7213 / (1 + 1.079 / self.m)

    def _hash(self, key):
        return int.from_bytes(hashlib.sha256(key.encode("utf-8")).digest()[:8], "big")

    def add(self, key):
        h = self._hash(key)
        index = h & (self.m - 1)
        rest = h >> self.p
        rank = 1
        while rest & 1 == 0 and rank <= 64 - self.p:
            rest >>= 1
            rank += 1
        if rank > self.registers[index]:
            self.registers[index] = rank

    def estimate(self):
        # the harmonic mean across registers, normalized by alpha*m^2 — the real evaluation
        # function the original paper names (SOURCES.md), not a plain arithmetic average.
        inv_sum = sum(2.0 ** (-r) for r in self.registers)
        raw = self.alpha * self.m * self.m / inv_sum
        if raw <= 2.5 * self.m:
            zeros = self.registers.count(0)
            if zeros != 0:
                return self.m * math.log(self.m / zeros)
        return raw

    def merge(self, other):
        merged = HyperLogLog(self.p)
        merged.registers = [max(a, b) for a, b in zip(self.registers, other.registers)]
        return merged


class CountMinSketch:
    def __init__(self, width, depth):
        self.width = width
        self.depth = depth
        self.table = [[0] * width for _ in range(depth)]

    def _positions(self, key):
        for row in range(self.depth):
            h = hashlib.sha256(f"{row}:{key}".encode("utf-8")).digest()
            yield row, int.from_bytes(h[:8], "big") % self.width

    def add(self, key, count=1):
        for row, col in self._positions(key):
            self.table[row][col] += count

    def estimate(self, key):
        return min(self.table[row][col] for row, col in self._positions(key))


def zipf_stream(n_distinct, n_events, seed, s=1.2):
    """A real Zipf-skewed stream: a small head of keys accounts for most events."""
    rng = random.Random(seed)
    weights = [1.0 / (rank ** s) for rank in range(1, n_distinct + 1)]
    total = sum(weights)
    probs = [w / total for w in weights]
    keys = [f"user-{seed}-{i}" for i in range(n_distinct)]
    return rng.choices(keys, weights=probs, k=n_events)


def measure_hll_error_vs_memory(n_distinct=20_000, n_events=200_000, seed=4242):
    stream = zipf_stream(n_distinct, n_events, seed)
    exact = len(set(stream))

    results = []
    for p in (8, 10, 12, 14):
        hll = HyperLogLog(p)
        for key in stream:
            hll.add(key)
        estimate = hll.estimate()
        error_pct = abs(estimate - exact) / exact * 100
        results.append({"registers": 1 << p, "estimate": estimate, "error_pct": error_pct})
    return exact, results


def measure_merge_matches_single_pass(n_distinct=20_000, n_events=200_000, seed=4242, p=12):
    stream = zipf_stream(n_distinct, n_events, seed)
    midpoint = len(stream) // 2
    partition_a, partition_b = stream[:midpoint], stream[midpoint:]

    hll_a, hll_b, hll_combined = HyperLogLog(p), HyperLogLog(p), HyperLogLog(p)
    for key in partition_a:
        hll_a.add(key)
        hll_combined.add(key)
    for key in partition_b:
        hll_b.add(key)
        hll_combined.add(key)

    merged = hll_a.merge(hll_b)
    return merged.estimate(), hll_combined.estimate()


def measure_count_min_sketch(n_distinct=20_000, n_events=200_000, seed=4242):
    stream = zipf_stream(n_distinct, n_events, seed)
    exact_counts = {}
    for key in stream:
        exact_counts[key] = exact_counts.get(key, 0) + 1

    cms = CountMinSketch(width=2048, depth=4)
    for key in stream:
        cms.add(key)

    # check the heaviest-hitting keys — a Count-Min Sketch's error is one-sided (never
    # underestimates) and should be small relative to a truly heavy key's real count.
    heaviest = sorted(exact_counts.items(), key=lambda kv: -kv[1])[:5]
    checks = []
    for key, true_count in heaviest:
        estimated = cms.estimate(key)
        checks.append({"key": key, "true_count": true_count, "estimated": estimated})
        assert estimated >= true_count  # Count-Min Sketch never undercounts
    return checks


def run():
    exact, results = measure_hll_error_vs_memory()
    print(f"Exact distinct count on the Zipf-skewed stream: {exact}.")
    for r in results:
        print(
            f"HyperLogLog with {r['registers']} registers: estimate {r['estimate']:.1f}, "
            f"error {r['error_pct']:.2f}% against the exact count."
        )
    assert results[0]["error_pct"] > results[-1]["error_pct"]  # more registers, less error

    merged_estimate, single_pass_estimate = measure_merge_matches_single_pass()
    print(
        f"Two partitioned sketches merged: estimate {merged_estimate:.1f}. "
        f"A single sketch built over the same combined stream: estimate {single_pass_estimate:.1f}."
    )
    assert merged_estimate == single_pass_estimate  # register-wise max is exact, not approximate

    checks = measure_count_min_sketch()
    print("Count-Min Sketch against the stream's heaviest keys (never undercounts):")
    for c in checks:
        print(f"  {c['key']}: true count {c['true_count']}, sketch estimate {c['estimated']}")


if __name__ == "__main__":
    run()
