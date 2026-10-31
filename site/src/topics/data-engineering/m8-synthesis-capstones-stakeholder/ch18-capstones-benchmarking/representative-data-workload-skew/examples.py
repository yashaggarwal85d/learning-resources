"""
Representative data and workload skew, demonstrated on this sandbox's own Postgres.

Four mechanisms:
  1. A uniform baseline dataset: every customer carries roughly the same number of
     orders, and the shop's order-lookup query shows no hot-key latency effect.
  2. A seeded Zipfian dataset (YCSB's own documented default distribution): a few
     customers carry a disproportionate share of all orders, and the identical query
     against one of those customers is measurably slower.
  3. Cross-column correlation breaking a cardinality estimator that assumes
     independence (Postgres's own documented planner assumption), contrasted against
     the same query shape over independent columns.
  4. An explicit scale factor and a seeded generator committed as a reusable,
     byte-reproducible artifact.
"""
import hashlib
import random
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="postgres", dbname="benchmark_demo")
N_CUSTOMERS = 2000
BASE_ROWS_PER_CUSTOMER = 30
SCALE_FACTOR = 1  # this topic's own declared multiple of BASE_ROWS_PER_CUSTOMER * N_CUSTOMERS


def connect():
    return psycopg2.connect(**DSN)


def zipfian_rank(rng, n_items, skew=1.3):
    """A seeded Zipfian-style sample over ranks 1..n_items: YCSB's own generator picks
    items so that rank 1 is dramatically more popular than the rest, following a power
    law. This is a simplified rejection-free approximation of the same documented shape,
    not YCSB's own exact algorithm."""
    weights_u = rng.random() ** skew
    rank = max(1, min(n_items, int(weights_u * n_items) + 1))
    return rank


def build_uniform_orders(seed):
    """Every customer gets roughly BASE_ROWS_PER_CUSTOMER * SCALE_FACTOR orders --
    the uniform toy dataset the syllabus warns hides hot keys."""
    rng = random.Random(seed)
    rows = []
    for customer_id in range(1, N_CUSTOMERS + 1):
        n = BASE_ROWS_PER_CUSTOMER * SCALE_FACTOR
        for _ in range(n):
            rows.append((customer_id, round(rng.uniform(5, 500), 2)))
    rng.shuffle(rows)
    return rows


def build_zipfian_orders(seed):
    """A seeded Zipfian generator (YCSB's own documented default shape) assigns each
    order to a customer so that a handful of customers carry a hugely disproportionate
    share of all orders -- the realistic shape uniform toy data hides."""
    rng = random.Random(seed)
    total_rows = N_CUSTOMERS * BASE_ROWS_PER_CUSTOMER * SCALE_FACTOR
    rows = []
    for _ in range(total_rows):
        customer_id = zipfian_rank(rng, N_CUSTOMERS)
        rows.append((customer_id, round(rng.uniform(5, 500), 2)))
    return rows


def load_orders(rows):
    conn = connect()
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS skew_orders;")
        cur.execute(
            """CREATE TABLE skew_orders (
                 id SERIAL PRIMARY KEY,
                 customer_id INTEGER NOT NULL,
                 amount NUMERIC NOT NULL,
                 placed_at TIMESTAMP NOT NULL DEFAULT now()
               );"""
        )
        cur.execute("CREATE INDEX skew_orders_customer_id_idx ON skew_orders (customer_id);")
        cur.executemany("INSERT INTO skew_orders (customer_id, amount) VALUES (%s, %s);", rows)
    conn.commit()
    conn.close()


def order_lookup_latency_ms(customer_id):
    conn = connect()
    with conn.cursor() as cur:
        start = time.perf_counter()
        cur.execute(
            "SELECT id, amount, placed_at FROM skew_orders WHERE customer_id = %s ORDER BY placed_at DESC LIMIT 20;",
            (customer_id,),
        )
        cur.fetchall()
        latency = (time.perf_counter() - start) * 1000.0
    conn.close()
    return latency


def order_count_for(customer_id):
    conn = connect()
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM skew_orders WHERE customer_id = %s;", (customer_id,))
        (n,) = cur.fetchone()
    conn.close()
    return n


def uniform_baseline_demo(seed=1):
    rows = build_uniform_orders(seed)
    load_orders(rows)
    rng = random.Random(seed + 1)
    sample_customers = rng.sample(range(1, N_CUSTOMERS + 1), 20)
    latencies = [order_lookup_latency_ms(c) for c in sample_customers]
    counts = [order_count_for(c) for c in sample_customers]
    return latencies, counts


def zipfian_hotkey_demo(seed=1):
    rows = build_zipfian_orders(seed)
    load_orders(rows)
    hottest_customer = 1  # rank 1 is, by construction, the most popular
    rng = random.Random(seed + 2)
    cold_customers = [c for c in rng.sample(range(500, N_CUSTOMERS + 1), 10)]
    hot_latency = order_lookup_latency_ms(hottest_customer)
    hot_count = order_count_for(hottest_customer)
    cold_latencies = [order_lookup_latency_ms(c) for c in cold_customers]
    cold_counts = [order_count_for(c) for c in cold_customers]
    return hot_latency, hot_count, cold_latencies, cold_counts


def correlated_vs_independent_cardinality():
    """Postgres's own planner assumes conditions on different columns are independent.
    A deterministic country-to-currency mapping breaks that assumption; an independently
    assigned pair does not."""
    conn = connect()
    rng = random.Random(9)
    countries = ["US", "DE", "IN"]
    currency_for = {"US": "USD", "DE": "EUR", "IN": "INR"}
    all_currencies = ["USD", "EUR", "INR"]

    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS correlated_pairs, independent_pairs;")
        cur.execute("CREATE TABLE correlated_pairs (country TEXT, currency TEXT);")
        cur.execute("CREATE TABLE independent_pairs (country TEXT, currency TEXT);")

        correlated_rows = [(c, currency_for[c]) for c in (rng.choice(countries) for _ in range(6000))]
        independent_rows = [(rng.choice(countries), rng.choice(all_currencies)) for _ in range(6000)]
        cur.executemany("INSERT INTO correlated_pairs (country, currency) VALUES (%s, %s);", correlated_rows)
        cur.executemany("INSERT INTO independent_pairs (country, currency) VALUES (%s, %s);", independent_rows)
        conn.commit()
        cur.execute("ANALYZE correlated_pairs;")
        cur.execute("ANALYZE independent_pairs;")

        def estimate_and_actual(table):
            cur.execute(f"EXPLAIN SELECT * FROM {table} WHERE country = 'US' AND currency = 'USD';")
            plan_line = cur.fetchone()[0]
            estimated = int(plan_line.split("rows=")[1].split(" ")[0])
            cur.execute(f"SELECT count(*) FROM {table} WHERE country = 'US' AND currency = 'USD';")
            actual = cur.fetchone()[0]
            return estimated, actual

        correlated_estimated, correlated_actual = estimate_and_actual("correlated_pairs")
        independent_estimated, independent_actual = estimate_and_actual("independent_pairs")
    conn.close()
    return correlated_estimated, correlated_actual, independent_estimated, independent_actual


def seeded_generator_reproducibility():
    rows_a = build_zipfian_orders(seed=77)
    rows_b = build_zipfian_orders(seed=77)
    digest_a = hashlib.sha256(repr(rows_a).encode()).hexdigest()
    digest_b = hashlib.sha256(repr(rows_b).encode()).hexdigest()
    return digest_a, digest_b


def run():
    uniform_latencies, uniform_counts = uniform_baseline_demo()
    uniform_count_spread = max(uniform_counts) - min(uniform_counts)
    uniform_latency_spread = max(uniform_latencies) - min(uniform_latencies)
    print(
        f"uniform baseline: order counts range {min(uniform_counts)}-{max(uniform_counts)} "
        f"(spread {uniform_count_spread}), latencies range {min(uniform_latencies):.2f}-"
        f"{max(uniform_latencies):.2f} ms (spread {uniform_latency_spread:.2f} ms)"
    )
    assert uniform_count_spread < BASE_ROWS_PER_CUSTOMER, "a uniform dataset should show no dramatic hot-key count"

    hot_latency, hot_count, cold_latencies, cold_counts = zipfian_hotkey_demo()
    cold_mean_latency = sum(cold_latencies) / len(cold_latencies)
    cold_mean_count = sum(cold_counts) / len(cold_counts)
    print(
        f"zipfian dataset: hottest customer has {hot_count} orders (latency {hot_latency:.2f} ms); "
        f"a typical cold customer has {cold_mean_count:.1f} orders on average (mean latency {cold_mean_latency:.2f} ms)"
    )
    assert hot_count > cold_mean_count * 5, "the hottest customer should carry a hugely disproportionate share of orders"
    assert hot_latency > cold_mean_latency, "querying the hot customer should take measurably longer"

    corr_est, corr_actual, indep_est, indep_actual = correlated_vs_independent_cardinality()
    corr_error = abs(corr_est - corr_actual) / corr_actual
    indep_error = abs(indep_est - indep_actual) / indep_actual
    print(
        f"correlated columns: planner estimated {corr_est} rows, actual {corr_actual} "
        f"(error {corr_error:.0%}); independent columns: estimated {indep_est}, actual {indep_actual} "
        f"(error {indep_error:.0%})"
    )
    assert corr_error > indep_error * 2, "the correlated pair's cardinality estimate should be far worse than the independent pair's"

    declared_rows = N_CUSTOMERS * BASE_ROWS_PER_CUSTOMER * SCALE_FACTOR
    print(f"declared scale factor: {SCALE_FACTOR} ({declared_rows} rows, following TPC's own scale-factor convention)")

    digest_a, digest_b = seeded_generator_reproducibility()
    print(f"seeded generator reproducibility: two runs from the same seed match: {digest_a == digest_b}")
    assert digest_a == digest_b, "the same seed must reproduce byte-identical data"

    print("uniform data hid the hot key and the correlation; the seeded generator reproduces both honestly")


if __name__ == "__main__":
    run()
