"""
Warm-up and steady-state measurement, demonstrated on this sandbox's own Postgres.

Three mechanisms, kept distinct:
  1. Cold page cache / buffer pool: restart the Postgres cluster, then measure the
     order-lookup query's latency from the very first request.
  2. A steady-state detector: a sliding window of recent latencies whose relative
     spread (a coefficient-of-variation stand-in) must fall below a threshold before
     the run is declared "warmed up" -- adapted from Georges et al.'s CoV convention
     at wall-clock-latency scale, not copied at the paper's own iteration-count scale.
  3. Repeated trials with a confidence interval, and cold-cache vs. hot-cache reported
     as two separate, labeled numbers rather than one blended average.
"""
import math
import random
import statistics
import subprocess
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="postgres", dbname="benchmark_demo")
N_CUSTOMERS = 2000
N_ORDERS = 60000
REQUESTS_PER_TRIAL = 60
TRIALS = 5
WINDOW = 8
MEAN_CHANGE_THRESHOLD = 0.12


def connect():
    return psycopg2.connect(**DSN)


def build_schema_and_data():
    conn = connect()
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS orders;")
        cur.execute(
            """CREATE TABLE orders (
                 id SERIAL PRIMARY KEY,
                 customer_id INTEGER NOT NULL,
                 amount NUMERIC NOT NULL,
                 placed_at TIMESTAMP NOT NULL DEFAULT now()
               );"""
        )
        cur.execute("CREATE INDEX orders_customer_id_idx ON orders (customer_id);")
    conn.commit()
    rng = random.Random(7)
    with conn.cursor() as cur:
        rows = [
            (rng.randint(1, N_CUSTOMERS), round(rng.uniform(5, 500), 2))
            for _ in range(N_ORDERS)
        ]
        cur.executemany("INSERT INTO orders (customer_id, amount) VALUES (%s, %s);", rows)
    conn.commit()
    conn.close()


def restart_postgres():
    """Restarts the cluster so shared_buffers starts empty for the next trial."""
    subprocess.run(
        ["sudo", "-n", "pg_ctlcluster", "16", "main", "restart"],
        check=True, capture_output=True, text=True,
    )
    time.sleep(1.0)
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        try:
            connect().close()
            return
        except psycopg2.OperationalError:
            time.sleep(0.3)
    raise RuntimeError("Postgres did not come back up after restart")


def order_lookup_latencies(n_requests, rng):
    """Runs the shop's order-lookup query n_requests times, returning per-request
    latency in milliseconds. Each request looks up a different customer at random
    (coordinated-omission-free: this is a simple serial loop, not a load generator;
    topic 2 is where generator choice itself becomes the subject)."""
    conn = connect()
    latencies = []
    with conn.cursor() as cur:
        for _ in range(n_requests):
            customer_id = rng.randint(1, N_CUSTOMERS)
            start = time.perf_counter()
            cur.execute(
                "SELECT id, amount, placed_at FROM orders WHERE customer_id = %s ORDER BY placed_at DESC LIMIT 20;",
                (customer_id,),
            )
            cur.fetchall()
            latencies.append((time.perf_counter() - start) * 1000.0)
    conn.close()
    return latencies


def coefficient_of_variation(values):
    mean = statistics.fmean(values)
    if mean == 0:
        return 0.0
    return statistics.pstdev(values) / mean


def detect_steady_state(latencies, window=WINDOW, threshold=MEAN_CHANGE_THRESHOLD):
    """Returns the index at which the trailing window's mean stops moving by more
    than `threshold` (a relative change) from the previous window's mean, and stays
    that way for the rest of the run -- the sliding-window adaptation of Georges et
    al.'s steady-state detection step (there: a coefficient-of-variation threshold
    across benchmark iterations; here: a relative change between consecutive
    windows of wall-clock request latency, a different unit at a different scale)."""
    windows = [
        statistics.fmean(latencies[i:i + window])
        for i in range(0, len(latencies) - window + 1)
    ]
    consecutive_stable = 0
    for i in range(1, len(windows)):
        prior, current = windows[i - 1], windows[i]
        relative_change = abs(current - prior) / prior if prior else 0.0
        if relative_change < threshold:
            consecutive_stable += 1
            if consecutive_stable >= 3:
                return (i - consecutive_stable + 1) + window - 1
        else:
            consecutive_stable = 0
    return None


def confidence_interval_95(values):
    """A 95% confidence interval across repeated-trial means (Georges et al.'s
    step 4, at this topic's own wall-clock-latency scale)."""
    n = len(values)
    mean = statistics.fmean(values)
    if n < 2:
        return mean, 0.0
    stderr = statistics.stdev(values) / math.sqrt(n)
    margin = 1.96 * stderr
    return mean, margin


def run_one_trial(rng):
    restart_postgres()
    latencies = order_lookup_latencies(REQUESTS_PER_TRIAL, rng)
    steady_index = detect_steady_state(latencies)
    cold_window = latencies[:WINDOW]
    hot_window = latencies[steady_index:] if steady_index is not None else latencies[-WINDOW:]
    return {
        "latencies": latencies,
        "steady_index": steady_index,
        "cold_mean": statistics.fmean(cold_window),
        "hot_mean": statistics.fmean(hot_window),
    }


def result_cache_analog_effect():
    """Restarts Postgres (so the table's data pages start out on disk, not in
    shared_buffers), then runs one heavy, whole-table aggregate query -- the kind
    a dashboard's result cache would ordinarily absorb -- for the first time, then
    five more times in the same warm session. The first run pays to pull every
    page off disk into shared_buffers; the repeats read the now-cached pages --
    the 'empty result caches' cause, distinct from the per-request cold-start
    effect above, which restart_postgres() + a fresh session isolates on its own."""
    restart_postgres()
    conn = connect()
    query = "SELECT customer_id, count(*), sum(amount), avg(amount) FROM orders GROUP BY customer_id ORDER BY sum(amount) DESC LIMIT 50;"
    with conn.cursor() as cur:
        start = time.perf_counter()
        cur.execute(query)
        cur.fetchall()
        first_run_ms = (time.perf_counter() - start) * 1000.0
        timings = []
        for _ in range(5):
            start = time.perf_counter()
            cur.execute(query)
            cur.fetchall()
            timings.append((time.perf_counter() - start) * 1000.0)
    conn.close()
    return first_run_ms, statistics.fmean(timings)


def run():
    build_schema_and_data()
    print(f"seeded {N_ORDERS} orders across {N_CUSTOMERS} customers")

    rng = random.Random(42)
    trials = [run_one_trial(rng) for _ in range(TRIALS)]

    first_trial = trials[0]
    assert first_trial["steady_index"] is not None, "steady state was never detected within the trial"
    assert first_trial["cold_mean"] > first_trial["hot_mean"], \
        "the cold window should be slower than the steady-state window"
    cold_to_hot_ratio = first_trial["cold_mean"] / first_trial["hot_mean"]
    print(
        f"trial 1: first {WINDOW} requests averaged {first_trial['cold_mean']:.2f} ms; "
        f"steady state detected at request {first_trial['steady_index']}, "
        f"steady-state window averaged {first_trial['hot_mean']:.2f} ms "
        f"({cold_to_hot_ratio:.2f}x slower cold)"
    )

    hot_means = [t["hot_mean"] for t in trials]
    mean, margin = confidence_interval_95(hot_means)
    print(
        f"across {TRIALS} independent trials (each its own cold restart), "
        f"steady-state mean = {mean:.2f} ms ± {margin:.2f} ms (95% CI)"
    )
    assert margin >= 0.0

    cold_means = [t["cold_mean"] for t in trials]
    cold_mean_overall = statistics.fmean(cold_means)
    print(
        f"cold-cache result (reported separately, never averaged into the number above): "
        f"{cold_mean_overall:.2f} ms across {TRIALS} trials' first windows"
    )
    assert cold_mean_overall > mean, "the cold-cache number must be reported as the slower, separate figure"

    first_run_ms, warm_repeat_mean = result_cache_analog_effect()
    print(
        f"result-cache analog (fresh restart, one heavy aggregate query): first run "
        f"took {first_run_ms:.2f} ms pulling pages off disk; five warm repeats averaged "
        f"{warm_repeat_mean:.2f} ms from shared_buffers"
    )
    assert first_run_ms > warm_repeat_mean, \
        "the first, disk-reading run of the aggregate should be slower than the warm repeats"

    print("cold-start effect and the same-session repeat effect are reported as two distinct causes, not blended")


if __name__ == "__main__":
    run()
