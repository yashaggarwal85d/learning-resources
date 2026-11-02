"""
Latency percentiles and histogram aggregation, demonstrated on this sandbox's own Postgres.

Four mechanisms:
  1. A rare, large stall barely moves the mean while the tail percentiles move sharply.
  2. The full percentile ladder (p50, p95, p99, p99.9, max) reported together.
  3. Merging two hosts' latency samples into one combined distribution versus naively
     averaging their separately-computed percentiles -- the two disagree.
  4. Fan-out tail amplification, derived from first principles and reproduced by
     Monte Carlo simulation.
  5. The chapter lab's core: a closed-loop generator and a constant-rate generator run
     at the same offered load against the shop's query, with an injected stall, showing
     the closed-loop generator hide exactly the samples the constant-rate generator reports.
"""
import math
import random
import statistics
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="postgres", dbname="benchmark_demo")
N_CUSTOMERS = 2000


def connect():
    return psycopg2.connect(**DSN)


def percentile(sorted_values, p):
    """Nearest-rank percentile, p in [0, 100]: the smallest value at or above which
    p percent of the observations fall, the convention monitoring systems report."""
    if not sorted_values:
        return 0.0
    n = len(sorted_values)
    rank = max(1, math.ceil((p / 100.0) * n))
    return sorted_values[min(rank, n) - 1]


def percentile_ladder(latencies):
    s = sorted(latencies)
    return {
        "p50": percentile(s, 50),
        "p95": percentile(s, 95),
        "p99": percentile(s, 99),
        "p999": percentile(s, 99.9),
        "max": s[-1],
    }


def order_lookup_once(cur, customer_id):
    start = time.perf_counter()
    cur.execute(
        "SELECT id, amount, placed_at FROM orders WHERE customer_id = %s ORDER BY placed_at DESC LIMIT 20;",
        (customer_id,),
    )
    cur.fetchall()
    return (time.perf_counter() - start) * 1000.0


def mean_vs_tail_demo(n_requests=500, stall_index=250, stall_seconds=2.0):
    """Runs n_requests order-lookup queries, injecting one large stall partway through,
    and reports the mean alongside the full percentile ladder."""
    conn = connect()
    rng = random.Random(11)
    latencies = []
    with conn.cursor() as cur:
        for i in range(n_requests):
            if i == stall_index:
                start = time.perf_counter()
                cur.execute("SELECT pg_sleep(%s);", (stall_seconds,))
                latencies.append((time.perf_counter() - start) * 1000.0)
            else:
                latencies.append(order_lookup_once(cur, rng.randint(1, N_CUSTOMERS)))
    conn.close()
    return latencies


def two_hosts_histogram_merge():
    """Runs two genuinely different query shapes against the same Postgres, standing in
    for two hosts with different latency profiles, then compares each host's own p99
    (naively averaged) against the true p99 of their merged, combined samples."""
    conn = connect()
    rng = random.Random(23)
    host_a = []  # a fast, simple indexed point lookup
    host_b = []  # a heavier range scan across many customers at once
    with conn.cursor() as cur:
        for _ in range(300):
            host_a.append(order_lookup_once(cur, rng.randint(1, N_CUSTOMERS)))
        for _ in range(300):
            low = rng.randint(1, N_CUSTOMERS - 50)
            start = time.perf_counter()
            cur.execute(
                "SELECT customer_id, count(*), avg(amount) FROM orders WHERE customer_id BETWEEN %s AND %s GROUP BY customer_id;",
                (low, low + 50),
            )
            cur.fetchall()
            host_b.append((time.perf_counter() - start) * 1000.0)
    conn.close()

    host_a_p99 = percentile(sorted(host_a), 99)
    host_b_p99 = percentile(sorted(host_b), 99)
    naive_average_p99 = statistics.fmean([host_a_p99, host_b_p99])

    merged = sorted(host_a + host_b)
    true_merged_p99 = percentile(merged, 99)

    return {
        "host_a_p99": host_a_p99,
        "host_b_p99": host_b_p99,
        "naive_average_p99": naive_average_p99,
        "true_merged_p99": true_merged_p99,
    }


def fanout_tail_amplification(n_shards=100, per_shard_tail_rate=0.01, trials=20000):
    """Derives the probability that a fan-out request touching n_shards independent
    shards hits at least one shard's own tail event, then reproduces it by simulation."""
    derived_probability = 1 - (1 - per_shard_tail_rate) ** n_shards

    rng = random.Random(5)
    hits = 0
    for _ in range(trials):
        if any(rng.random() < per_shard_tail_rate for _ in range(n_shards)):
            hits += 1
    measured_probability = hits / trials

    return derived_probability, measured_probability


def closed_loop_vs_constant_rate(n_requests=120, rate_hz=30, stall_index=60, stall_seconds=2.0):
    """The chapter lab's core: two load generators at the same offered load against the
    shop's query, with a stall injected at the same point in each run. Closed-loop sends
    the next request only once the previous response arrives, so it can never be "behind
    schedule" by construction; constant-rate keeps a fixed schedule and measures each
    request's latency from its own intended send time, so a stall's backlog shows up in
    every request still queued behind it -- the Coordinated Omission effect wrk2's own
    documentation describes."""
    interval = 1.0 / rate_hz
    rng = random.Random(31)

    conn = connect()
    closed_loop_latencies = []
    with conn.cursor() as cur:
        for i in range(n_requests):
            if i == stall_index:
                start = time.perf_counter()
                cur.execute("SELECT pg_sleep(%s);", (stall_seconds,))
                cur.fetchall()
                closed_loop_latencies.append((time.perf_counter() - start) * 1000.0)
            else:
                closed_loop_latencies.append(order_lookup_once(cur, rng.randint(1, N_CUSTOMERS)))
    conn.close()

    rng = random.Random(31)  # same sequence of customer ids as the closed-loop run
    conn = connect()
    constant_rate_latencies = []
    next_due = time.perf_counter()
    with conn.cursor() as cur:
        for i in range(n_requests):
            now = time.perf_counter()
            if now < next_due:
                time.sleep(next_due - now)
            scheduled_send_time = next_due
            if i == stall_index:
                cur.execute("SELECT pg_sleep(%s);", (stall_seconds,))
                cur.fetchall()
            else:
                cur.execute(
                    "SELECT id, amount, placed_at FROM orders WHERE customer_id = %s ORDER BY placed_at DESC LIMIT 20;",
                    (rng.randint(1, N_CUSTOMERS),),
                )
                cur.fetchall()
            completed = time.perf_counter()
            constant_rate_latencies.append((completed - scheduled_send_time) * 1000.0)
            next_due += interval
    conn.close()

    closed_loop_p99 = percentile(sorted(closed_loop_latencies), 99)
    constant_rate_p99 = percentile(sorted(constant_rate_latencies), 99)
    return closed_loop_p99, constant_rate_p99


def run():
    latencies = mean_vs_tail_demo()
    baseline = [l for i, l in enumerate(latencies) if i != 250]
    mean_ms = statistics.fmean(latencies)
    baseline_mean_ms = statistics.fmean(baseline)
    ladder = percentile_ladder(latencies)
    print(f"mean latency: {mean_ms:.2f} ms (baseline without the stall: {baseline_mean_ms:.2f} ms)")
    print(
        f"percentile ladder: p50={ladder['p50']:.2f}ms p95={ladder['p95']:.2f}ms "
        f"p99={ladder['p99']:.2f}ms p999={ladder['p999']:.2f}ms max={ladder['max']:.2f}ms"
    )
    assert mean_ms - baseline_mean_ms < 10.0, "a single rare stall should barely move the mean"
    assert ladder["p999"] > 500.0, "p99.9 should capture the injected multi-second stall directly"
    assert ladder["p95"] < 10.0, "p95 should stay near the untouched baseline, far below the stall"

    hist = two_hosts_histogram_merge()
    print(
        f"host A p99={hist['host_a_p99']:.2f}ms, host B p99={hist['host_b_p99']:.2f}ms, "
        f"naive average={hist['naive_average_p99']:.2f}ms, true merged p99={hist['true_merged_p99']:.2f}ms"
    )
    disagreement_ms = abs(hist["naive_average_p99"] - hist["true_merged_p99"])
    disagreement_share = disagreement_ms / hist["true_merged_p99"]
    assert disagreement_share > 0.1, "naively averaging two hosts' percentiles should disagree meaningfully with the true merged percentile"

    derived, measured = fanout_tail_amplification()
    print(
        f"fan-out tail amplification: derived probability={derived:.3f}, "
        f"measured over simulated trials={measured:.3f}"
    )
    assert abs(derived - measured) < 0.03, "the simulation should reproduce the derived probability closely"
    assert derived > 0.5, "a hundred-shard fan-out should hit at least one shard's own tail more often than not"

    closed_loop_p99, constant_rate_p99 = closed_loop_vs_constant_rate()
    print(
        f"chapter lab: closed-loop p99={closed_loop_p99:.2f}ms, constant-rate p99={constant_rate_p99:.2f}ms"
    )
    assert constant_rate_p99 > closed_loop_p99, \
        "the constant-rate generator should report a higher, more honest p99 than the closed-loop generator hides"

    print("closed-loop hides the stall's backlog; constant-rate reports it, as published")


if __name__ == "__main__":
    run()
