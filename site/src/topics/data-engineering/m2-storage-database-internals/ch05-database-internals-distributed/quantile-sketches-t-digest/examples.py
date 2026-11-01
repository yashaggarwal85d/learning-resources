"""de.quantile-sketches-t-digest — executable evidence.

Builds a real, mergeable quantile digest from scratch (centroids clustered by mean and count,
compressed to a bounded size, merged by combining and re-compressing — the same real mechanism
the t-digest paper names, SOURCES.md), and computes a real dataset's p99 three ways on the same
real, partitioned, heavy-tailed data: a naive average of per-partition p99 values, a single
sketch merged from per-partition digests, and the true exact value computed directly by sorting
every point. DDSketch's own relative-error construction and KLL's own rank-error construction are
sourced and named, not separately implemented, since this topic's own measurement is about
mergeability and the averaging-percentiles trap, not about re-deriving every sketch's own
internals.
"""

import random


class Digest:
    """A simplified, real t-digest-style structure: centroids clustered by mean and count."""

    def __init__(self, max_centroids=100):
        self.max_centroids = max_centroids
        self.centroids = []  # list of [mean, count]

    def add(self, value, count=1):
        self.centroids.append([value, count])
        if len(self.centroids) > self.max_centroids * 4:
            self._compress()

    def _compress(self):
        self.centroids.sort(key=lambda c: c[0])
        total = sum(c[1] for c in self.centroids)
        if total == 0:
            return
        target_size = max(1, total / self.max_centroids)
        merged = []
        running = 0.0
        for mean, count in self.centroids:
            if merged and running + count <= target_size:
                last_mean, last_count = merged[-1]
                new_count = last_count + count
                new_mean = (last_mean * last_count + mean * count) / new_count
                merged[-1] = [new_mean, new_count]
                running += count
            else:
                merged.append([mean, count])
                running = count
        self.centroids = merged

    def merge(self, other):
        combined = Digest(max_centroids=self.max_centroids)
        combined.centroids = [list(c) for c in self.centroids] + [list(c) for c in other.centroids]
        combined._compress()
        return combined

    def quantile(self, q):
        self._compress()
        total = sum(c[1] for c in self.centroids)
        if total == 0:
            return None
        target_rank = q * total
        cumulative = 0.0
        for mean, count in self.centroids:
            cumulative += count
            if cumulative >= target_rank:
                return mean
        return self.centroids[-1][0]


def heavy_tailed_dataset(n, seed):
    """A real, heavy-tailed latency-like distribution: lognormal, in milliseconds."""
    rng = random.Random(seed)
    return [rng.lognormvariate(mu=3.5, sigma=1.1) for _ in range(n)]


def true_quantile(values, q):
    ordered = sorted(values)
    index = min(len(ordered) - 1, int(q * len(ordered)))
    return ordered[index]


def measure_averaging_vs_merged(n_total=200_000, n_partitions=20, seed=777, q=0.99):
    values = heavy_tailed_dataset(n_total, seed)
    true_q = true_quantile(values, q)

    partition_size = n_total // n_partitions
    partitions = [values[i * partition_size:(i + 1) * partition_size] for i in range(n_partitions)]

    # one partition deliberately gets a real, extra burst of slow requests — the realistic case
    # a naive average hides and a merged sketch does not.
    rng = random.Random(seed + 1)
    partitions[0] = partitions[0] + [rng.lognormvariate(mu=6.5, sigma=0.3) for _ in range(500)]

    per_partition_quantiles = [true_quantile(p, q) for p in partitions]
    naive_average = sum(per_partition_quantiles) / len(per_partition_quantiles)

    digests = []
    for p in partitions:
        d = Digest(max_centroids=2000)
        for v in p:
            d.add(v)
        digests.append(d)

    merged = digests[0]
    for d in digests[1:]:
        merged = merged.merge(d)
    merged_estimate = merged.quantile(q)

    all_values = [v for p in partitions for v in p]
    true_global_q = true_quantile(all_values, q)

    return {
        "true_global_q": true_global_q,
        "naive_average": naive_average,
        "merged_estimate": merged_estimate,
        "naive_error_pct": abs(naive_average - true_global_q) / true_global_q * 100,
        "merged_error_pct": abs(merged_estimate - true_global_q) / true_global_q * 100,
    }


def run():
    r = measure_averaging_vs_merged()
    print(f"True global p99 (exact, sorted over all partitions): {r['true_global_q']:.1f} ms.")
    print(
        f"Naive average of per-partition p99 values: {r['naive_average']:.1f} ms "
        f"({r['naive_error_pct']:.1f}% off the true value)."
    )
    print(
        f"Single digest merged from per-partition digests: {r['merged_estimate']:.1f} ms "
        f"({r['merged_error_pct']:.1f}% off the true value)."
    )
    # the naive average must be measurably worse than the merged sketch against the true value
    assert r["naive_error_pct"] > r["merged_error_pct"] * 3
    assert r["merged_error_pct"] < 10


if __name__ == "__main__":
    run()
