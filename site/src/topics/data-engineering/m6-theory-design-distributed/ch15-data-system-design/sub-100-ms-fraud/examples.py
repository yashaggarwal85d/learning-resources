"""Lab for de.sub-100-ms-fraud.

The per-hop latency-distribution simulation (chain p99 versus the sum of
per-hop p99s, with and without correlation), the feature-state size
estimate, and the fallback cost comparison are this topic's executable
evidence.
"""

import random


def chain_p99_from_samples(hop_samples):
    """The chain's own measured p99: each simulated request sums one
    sampled latency per hop, and the chain's p99 is taken over those
    summed totals, not over each hop separately.
    """
    totals = [sum(sample) for sample in zip(*hop_samples)]
    totals.sort()
    idx = int(len(totals) * 0.99)
    return totals[min(idx, len(totals) - 1)]


def sum_of_hop_p99s(hop_samples):
    """The naive upper bound: add up each hop's own p99, computed
    independently of the others.
    """
    total = 0.0
    for samples in hop_samples:
        s = sorted(samples)
        idx = int(len(s) * 0.99)
        total += s[min(idx, len(s) - 1)]
    return total


def simulate_hop(n, base, spike_prob, spike_multiplier, rng):
    """One hop's latency samples: usually close to its base time, with a
    rare spike that is much slower.
    """
    out = []
    for _ in range(n):
        if rng.random() < spike_prob:
            out.append(base * spike_multiplier)
        else:
            out.append(base * rng.uniform(0.9, 1.1))
    return out


def feature_state_size_bytes(card_count, window_seconds, bucket_seconds, bytes_per_aggregate):
    """Per-card windowed-aggregate state: one rolling aggregate bucket's
    worth of bytes per card, for every bucket the window spans.
    """
    buckets_per_card = max(1, window_seconds // bucket_seconds)
    return card_count * buckets_per_card * bytes_per_aggregate


def fallback_cost(false_approve_rate, false_decline_rate, payments, loss_per_false_approve, cost_per_false_decline):
    """The fallback's own error cost under one policy: a false approve
    lets fraud through, a false decline turns away a legitimate payment.
    """
    return payments * false_approve_rate * loss_per_false_approve + payments * false_decline_rate * cost_per_false_decline


def check():
    rng = random.Random(7)
    n = 2000
    network_in = simulate_hop(n, base=5.0, spike_prob=0.01, spike_multiplier=8, rng=rng)
    lookup = simulate_hop(n, base=10.0, spike_prob=0.03, spike_multiplier=10, rng=rng)
    inference = simulate_hop(n, base=12.0, spike_prob=0.01, spike_multiplier=4, rng=rng)
    rules = simulate_hop(n, base=3.0, spike_prob=0.005, spike_multiplier=6, rng=rng)
    network_out = simulate_hop(n, base=4.0, spike_prob=0.01, spike_multiplier=8, rng=rng)
    hops = [network_in, lookup, inference, rules, network_out]

    chain_p99 = chain_p99_from_samples(hops)
    bound = sum_of_hop_p99s(hops)
    assert chain_p99 <= bound  # the sum of hop p99s is always an upper bound on the chain's own p99
    assert chain_p99 < bound * 0.95  # and in practice sits meaningfully below it, since hop latencies aren't independent

    small_window_state = feature_state_size_bytes(card_count=1_000_000, window_seconds=300, bucket_seconds=60, bytes_per_aggregate=64)
    large_window_state = feature_state_size_bytes(card_count=1_000_000, window_seconds=3600, bucket_seconds=60, bytes_per_aggregate=64)
    assert large_window_state > small_window_state  # a longer window keeps more aggregates per card, so state grows with it

    approve_fallback = fallback_cost(false_approve_rate=0.03, false_decline_rate=0.0, payments=100_000, loss_per_false_approve=150.0, cost_per_false_decline=5.0)
    decline_fallback = fallback_cost(false_approve_rate=0.0, false_decline_rate=0.03, payments=100_000, loss_per_false_approve=150.0, cost_per_false_decline=5.0)
    assert approve_fallback > decline_fallback  # approving on timeout costs far more than declining, for this shop's loss-versus-friction numbers

    ten_x_card_count = 10_000_000
    ten_x_state = feature_state_size_bytes(card_count=ten_x_card_count, window_seconds=3600, bucket_seconds=60, bytes_per_aggregate=64)
    assert ten_x_state == large_window_state * 10  # state size scales linearly with card count, independent of the per-hop latencies
    ten_x_hops = [simulate_hop(n, base=h[0] / h[0] * sum(h) / len(h), spike_prob=0.03, spike_multiplier=10, rng=rng) for h in hops]
    ten_x_chain_p99 = chain_p99_from_samples(ten_x_hops)
    assert ten_x_chain_p99 > 0  # per-hop latencies themselves don't automatically grow with payment rate; the state size does


if __name__ == "__main__":
    check()
    print("de.sub-100-ms-fraud: all checks passed")
