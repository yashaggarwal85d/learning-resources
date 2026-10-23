"""Every number this topic's reel puts on screen is computed here, never quoted from the cited
MIT lecture's own symbolic result (Theta(1 + alpha)) alone.

A chained table (bucket array + a real singly-linked chain per bucket, matching Chapter 2's own
linked-list structure) is built with Python's own hash() as the hash function -- the same real,
keyed/PRF-tier hash topic 16 established as production-real (CPython's own SipHash since PEP 456),
not a toy function invented for this demo.

A real measurement subtlety, caught before shipping: the AVERAGE chain length over all buckets is
n / m = alpha exactly, by simple counting, for ANY hash function at all, good or terrible -- so
measuring the average alone proves nothing about chaining actually depending on a well-spread
hash. What the cited result's "simple uniform hashing" assumption actually buys is that chains
stay close to that average instead of a few buckets hoarding everything, which is what this script
actually measures (longest chain relative to the average) and contrasts against the worst-case
section below, where the average is tiny but one chain holds every key.
"""

import random
import statistics


class Node:
    __slots__ = ("key", "next")

    def __init__(self, key, next=None):
        self.key = key
        self.next = next


class ChainedTable:
    """Bucket array of real singly-linked chains, exactly Chapter 2's own structure."""

    def __init__(self, m: int):
        self.m = m
        self.buckets = [None for _ in range(m)]

    def insert(self, key) -> None:
        i = hash(key) % self.m
        self.buckets[i] = Node(key, self.buckets[i])

    def chain_length(self, i: int) -> int:
        n = 0
        node = self.buckets[i]
        while node is not None:
            n += 1
            node = node.next
        return n

    def lengths(self) -> list[int]:
        return [self.chain_length(i) for i in range(self.m)]


# --- Average chain length is exactly alpha, by counting, whatever the hash -----------------------
# Every inserted key lives in exactly one bucket, so the average chain length over all m buckets
# is n / m = alpha, by simple counting -- true for ANY hash function, good or bad. That alone
# proves nothing about chaining actually being fast. What depends on the hash spreading keys well
# (the "simple uniform hashing" assumption the cited Theta(1 + alpha) result rests on) is whether
# chains stay close to that average instead of a few buckets hoarding most of the keys -- measured
# here as the longest chain relative to the average, contrasted with the worst case below.

M = 2000  # fixed bucket count
ALPHAS = (0.5, 0.75, 1.5)
MAX_FRACTION_OF_N = 0.05  # under a well-spread hash, no single bucket should hold more than this share of all keys

random.seed(20261023)
RESULTS = {}
for alpha in ALPHAS:
    n = round(alpha * M)
    keys = [f"req-{random.randint(0, 10**9)}" for _ in range(n)]
    table = ChainedTable(M)
    for k in keys:
        table.insert(k)
    lens = table.lengths()
    avg = statistics.mean(lens)
    mx = max(lens)
    assert abs(avg - alpha) < 1e-9, "average chain length must equal alpha exactly, by counting"
    RESULTS[alpha] = {"n": n, "avg": avg, "max": mx}
    assert mx < n * MAX_FRACTION_OF_N, f"alpha={alpha}: longest chain ({mx}) holds too large a share of all {n} keys for a well-behaved hash"

for alpha in ALPHAS:
    r = RESULTS[alpha]
    print(f"alpha = {alpha:4.2f}  (n={r['n']:5d}, m={M}):  avg chain length = {r['avg']:.3f} (= alpha, by counting)   longest bucket: {r['max']}")

# --- The worst case: every key forced into one bucket, Theta(n) -------------------------------

N_WORST = 500


def constant_hash(_key) -> int:
    return 0  # deliberately degenerate: every key collides, named as a worst case, never a real library's choice


worst_table = ChainedTable(M)
worst_table.m = M
worst_table.buckets = [None for _ in range(M)]
for i in range(N_WORST):
    key = f"k{i}"
    idx = constant_hash(key)
    worst_table.buckets[idx] = Node(key, worst_table.buckets[idx])

worst_length = worst_table.chain_length(0)
other_buckets_used = sum(1 for i in range(1, M) if worst_table.buckets[i] is not None)
worst_avg = N_WORST / M  # exactly alpha for this n, m -- same counting fact as above
worst_ratio = worst_length / worst_avg

print(f"\nworst case: {N_WORST} keys forced into one bucket -> chain length = {worst_length}")
print(f"other buckets touched: {other_buckets_used} (should be 0)")
print(f"longest chain is {worst_ratio:.0f}x the average ({worst_avg:.3f}) -- the average alone says nothing about this")

assert worst_length == N_WORST, "every key must land in the one forced bucket, giving a chain of exactly n"
assert other_buckets_used == 0, "the worst-case construction must not spill into any other bucket"
assert worst_ratio > 100, "the worst case's longest-chain-over-average ratio must dwarf the well-spread-hash ceiling above"

if __name__ == "__main__":
    print("\nAll checks passed.")
