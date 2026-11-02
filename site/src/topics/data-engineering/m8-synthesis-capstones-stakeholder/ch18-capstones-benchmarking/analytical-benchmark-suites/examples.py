"""
Analytical benchmark suites, demonstrated on this sandbox's own Postgres.

Two mechanisms:
  1. A small, disclosed-scale join-order-sensitive query over a correlated schema, in the spirit
     of the Join Order Benchmark: joining two tables in full before a selective filter narrows
     them is measurably slower than filtering first and joining only what survives.
  2. Publishing the chapter lab's three artifacts -- topic one's steady-state harness, topic
     two's closed-loop/constant-rate generator, and topic three's seeded data generator -- as one
     committed bundle, re-run end to end from this single script.
"""
import random
import subprocess
import sys
import time
from pathlib import Path

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="postgres", dbname="benchmark_demo")

CHAPTER_DIR = Path(__file__).resolve().parent.parent
CHAPTER_LAB_TOPICS = [
    "warmup-steady-state-measurement",
    "latency-percentiles-histogram-aggregation",
    "representative-data-workload-skew",
]


def connect():
    return psycopg2.connect(**DSN)


def build_join_demo(seed=1, n_transactions=50000, items_per_transaction=5):
    """A small correlated schema: three countries, three currencies, a deterministic
    country-to-currency mapping (as in topic three), a transactions table, and a line-items table
    several times larger. Disclosed scale: a few hundred thousand rows, nowhere near an industry
    suite's own scale."""
    rng = random.Random(seed)
    countries = ["US", "DE", "IN"]
    currency_for = {"US": "USD", "DE": "EUR", "IN": "INR"}

    conn = connect()
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS jo_items, jo_transactions;")
        cur.execute(
            """CREATE TABLE jo_transactions (
                 id SERIAL PRIMARY KEY,
                 country TEXT NOT NULL,
                 currency TEXT NOT NULL,
                 amount NUMERIC NOT NULL
               );"""
        )
        tx_rows = []
        for _ in range(n_transactions):
            country = rng.choice(countries)
            tx_rows.append((country, currency_for[country], round(rng.uniform(5, 500), 2)))
        cur.executemany("INSERT INTO jo_transactions (country, currency, amount) VALUES (%s, %s, %s);", tx_rows)
        cur.execute(
            """CREATE TABLE jo_items (
                 id SERIAL PRIMARY KEY,
                 transaction_id INTEGER NOT NULL,
                 item_amount NUMERIC NOT NULL
               );"""
        )
        item_rows = []
        for tx_id in range(1, n_transactions + 1):
            for _ in range(items_per_transaction):
                item_rows.append((tx_id, round(rng.uniform(1, 100), 2)))
        cur.executemany("INSERT INTO jo_items (transaction_id, item_amount) VALUES (%s, %s);", item_rows)
        cur.execute("CREATE INDEX jo_transactions_country_currency_idx ON jo_transactions (country, currency);")
        cur.execute("CREATE INDEX jo_items_transaction_id_idx ON jo_items (transaction_id);")
    conn.commit()
    cur2 = conn.cursor()
    cur2.execute("ANALYZE jo_transactions; ANALYZE jo_items;")
    conn.commit()
    conn.close()


def run_join_filter_first(materialize):
    """Filters jo_transactions down to US/USD transactions before joining jo_items, as a
    MATERIALIZED CTE fence that forces the filter to run first when materialize is true."""
    conn = connect()
    with conn.cursor() as cur:
        fence = "MATERIALIZED" if materialize else "NOT MATERIALIZED"
        cur.execute(
            f"""
            WITH filtered AS {fence} (
                SELECT id FROM jo_transactions WHERE country = 'US' AND currency = 'USD'
            )
            SELECT count(*) FROM jo_items i JOIN filtered f ON i.transaction_id = f.id;
            """
        )
        start = time.perf_counter()
        cur.execute(
            f"""
            WITH filtered AS {fence} (
                SELECT id FROM jo_transactions WHERE country = 'US' AND currency = 'USD'
            )
            SELECT count(*) FROM jo_items i JOIN filtered f ON i.transaction_id = f.id;
            """
        )
        cur.fetchall()
        latency = (time.perf_counter() - start) * 1000.0
    conn.close()
    return latency


def run_join_unfiltered_first():
    """Joins jo_items against jo_transactions in full before the filter is applied, fenced with a
    MATERIALIZED CTE so the join cannot be reordered past the filter -- the deliberately bad join
    order a query optimizer is supposed to avoid."""
    conn = connect()
    with conn.cursor() as cur:
        start = time.perf_counter()
        cur.execute(
            """
            WITH joined AS MATERIALIZED (
                SELECT i.id AS item_id, t.country, t.currency
                FROM jo_items i JOIN jo_transactions t ON i.transaction_id = t.id
            )
            SELECT count(*) FROM joined WHERE country = 'US' AND currency = 'USD';
            """
        )
        cur.fetchall()
        latency = (time.perf_counter() - start) * 1000.0
    conn.close()
    return latency


def join_order_demo():
    """Compares a deliberately bad join order (joining everything, then filtering) against
    filtering first, then joining only what survives -- the same choice a query optimizer's own
    join-ordering decision makes, in the spirit of the Join Order Benchmark's own subject."""
    build_join_demo()
    bad_order = [run_join_unfiltered_first() for _ in range(5)]
    good_order = [run_join_filter_first(materialize=True) for _ in range(5)]
    return sum(bad_order) / len(bad_order), sum(good_order) / len(good_order)


def run_chapter_lab_artifact():
    """Re-runs the chapter lab's other three topics' own examples.py, one command, as proof the
    chapter's three artifacts (harness, generator, and this topic's own baseline) are genuinely
    committed and reproducible together, not three disconnected one-off scripts."""
    results = {}
    for topic_folder in CHAPTER_LAB_TOPICS:
        script = CHAPTER_DIR / topic_folder / "examples.py"
        completed = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(script.parent),
            capture_output=True,
            text=True,
            timeout=120,
        )
        results[topic_folder] = completed.returncode
    return results


def run():
    bad_mean, good_mean = join_order_demo()
    print(f"join-then-filter (bad order): {bad_mean:.2f} ms mean; filter-then-join (good order): {good_mean:.2f} ms mean")
    assert bad_mean > good_mean * 1.5, "joining before filtering should be measurably slower than filtering before joining"

    print("re-running the chapter lab's other three topics as this topic's own published artifact:")
    lab_results = run_chapter_lab_artifact()
    for topic_folder, returncode in lab_results.items():
        print(f"  {topic_folder}: exit code {returncode}")
    assert all(code == 0 for code in lab_results.values()), "every committed chapter-lab script should re-run clean end to end"

    print("a small, disclosed-scale join-order demonstration, published alongside the chapter's own harness and generator")


if __name__ == "__main__":
    run()
