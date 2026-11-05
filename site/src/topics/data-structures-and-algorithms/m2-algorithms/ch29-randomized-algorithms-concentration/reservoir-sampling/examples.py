import math
import random


def algorithm_r(stream, k, rng):
    reservoir = []
    draws = 0
    for i, item in enumerate(stream, start=1):
        if i <= k:
            reservoir.append(item)
        else:
            draws += 1
            j = rng.randrange(i)  # uniform in [0, i)
            if j < k:
                reservoir[j] = item
    return reservoir, draws


# Exactness: n = 10, k = 3, each item should enter the sample with probability 0.3.
def reservoir_inclusion_frequencies(n, k, runs, rng):
    counts = [0] * n
    for _ in range(runs):
        sample, _ = algorithm_r(range(n), k, rng)
        for item in sample:
            counts[item] += 1
    return [c / runs for c in counts]

rng = random.Random(11)
FREQS_10_3 = reservoir_inclusion_frequencies(10, 3, 100_000, rng)
assert all(0.29 <= f <= 0.31 for f in FREQS_10_3)
assert round(min(FREQS_10_3), 3) >= 0.295 and round(max(FREQS_10_3), 3) <= 0.305


def algorithm_l(stream_len, k, rng):
    """Li's skip-based reservoir sampling. Returns (reservoir indices placeholder, draws)."""
    reservoir = list(range(min(k, stream_len)))
    draws = 0
    if stream_len <= k:
        return reservoir, draws
    W = math.exp(math.log(rng.random()) / k)
    draws += 1
    i = k
    while i < stream_len:
        draws += 1
        skip = math.floor(math.log(rng.random()) / math.log(1 - W))
        draws += 1
        i = i + skip + 1
        if i < stream_len:
            slot = rng.randrange(k)
            reservoir[slot] = i
            W = W * math.exp(math.log(rng.random()) / k)
            draws += 1
    return reservoir, draws


rng2 = random.Random(100)
N_BIG, K_BIG = 1_000_000, 100
_, R_DRAWS = algorithm_r(range(N_BIG), K_BIG, rng2)
assert R_DRAWS == N_BIG - K_BIG
assert R_DRAWS == 999900

rng3 = random.Random(100)
_, L_DRAWS = algorithm_l(N_BIG, K_BIG, rng3)
LI_BOUND = round(K_BIG * (1 + math.log(N_BIG / K_BIG)))
assert LI_BOUND == 1021
assert L_DRAWS < R_DRAWS
# Algorithm L's measured draw count is the builder's own to report (CHAPTER.md: "the constant
# is the builder's to measure"), checked only against the right order of magnitude here.
assert L_DRAWS < 20 * LI_BOUND


# Weighted sampling (Efraimidis-Spirakis / "A-ES"): key = u^(1/w), keep the k largest keys.
def weighted_sample_once(weights, k, rng):
    keys = [rng.random() ** (1.0 / w) for w in weights]
    order = sorted(range(len(weights)), key=lambda i: keys[i], reverse=True)
    return set(order[:k])


def weighted_inclusion_frequencies(weights, k, runs, rng):
    counts = [0] * len(weights)
    for _ in range(runs):
        for i in weighted_sample_once(weights, k, rng):
            counts[i] += 1
    return [c / runs for c in counts]

rng4 = random.Random(42)
WEIGHTS = [1, 1, 1, 1, 10]
WEIGHTED_FREQS = weighted_inclusion_frequencies(WEIGHTS, 2, 100_000, rng4)
HEAVY_FREQ = round(WEIGHTED_FREQS[4], 3)
LIGHT_FREQS = [round(f, 3) for f in WEIGHTED_FREQS[:4]]
assert 0.90 <= HEAVY_FREQ <= 0.96
assert all(0.24 <= f <= 0.29 for f in LIGHT_FREQS)
# Not 10/14 times k=2 (which isn't even a probability): the naive "weight share" guess.
NAIVE_WRONG_GUESS = round((10 / 14) * 2, 2)
assert NAIVE_WRONG_GUESS == 1.43  # > 1, so it cannot be a probability


# Merging two uniform reservoirs: draw each of k output slots from reservoir 1 with probability
# n1/(n1+n2), without replacement from the two reservoirs' own items.
def merge_reservoirs(r1, n1, r2, n2, k, rng):
    pool1, pool2 = list(r1), list(r2)
    out = []
    for _ in range(k):
        if rng.random() < n1 / (n1 + n2) and pool1:
            out.append(pool1.pop(rng.randrange(len(pool1))))
        elif pool2:
            out.append(pool2.pop(rng.randrange(len(pool2))))
        elif pool1:
            out.append(pool1.pop(rng.randrange(len(pool1))))
    return out


def merge_inclusion_frequencies(n1, n2, k, runs, rng):
    counts = [0] * (n1 + n2)
    for _ in range(runs):
        r1, _ = algorithm_r(range(n1), min(k, n1), rng)
        r2, _ = algorithm_r(range(n1, n1 + n2), min(k, n2), rng)
        merged = merge_reservoirs(r1, n1, r2, n2, k, rng)
        for item in merged:
            counts[item] += 1
    return [c / runs for c in counts]

rng5 = random.Random(7)
MERGE_FREQS = merge_inclusion_frequencies(7, 3, 3, 100_000, rng5)
assert all(0.27 <= f <= 0.33 for f in MERGE_FREQS)


if __name__ == "__main__":
    print("Inclusion frequencies (n=10, k=3):", [round(f, 3) for f in FREQS_10_3])
    print("Algorithm R draws:", R_DRAWS, "Algorithm L draws:", L_DRAWS, "Li's bound order:", LI_BOUND)
    print("Weighted sample: heavy", HEAVY_FREQ, "light", LIGHT_FREQS, "naive wrong guess", NAIVE_WRONG_GUESS)
    print("Merge inclusion frequencies:", [round(f, 3) for f in MERGE_FREQS])
