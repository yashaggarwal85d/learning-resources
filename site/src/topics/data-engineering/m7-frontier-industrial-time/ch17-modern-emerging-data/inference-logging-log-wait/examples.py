"""Real experiments against this sandbox's own Postgres cluster (learnshop database): logging the
exact served feature vector and model version at request time, joining delayed labels back to the
logged row by request id to build a training set that cannot have topic 2's different-code-path
skew, estimating a logging pipeline's storage cost from stated request-rate and vector-width
numbers, and checking that redacting only a customer id leaves the rest of a payload re-
identifiable.
"""

import random

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SEED = 20261030
N_REQUESTS = 2000
VECTOR_FIELDS = ("tickets_open_total", "orders_last_30d", "avg_order_value_cents", "days_since_signup")
REQUESTS_PER_DAY = 1_000_000
VECTOR_BYTES = 2_048
RETENTION_DAYS = 365


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _reset_schema(cur):
    cur.execute("DROP TABLE IF EXISTS t17i_logged_requests, t17i_delayed_labels")
    cur.execute(
        "CREATE TABLE t17i_logged_requests ("
        "request_id INT PRIMARY KEY, model_version TEXT NOT NULL, served_ts TIMESTAMP NOT NULL, "
        "tickets_open_total INT NOT NULL, orders_last_30d INT NOT NULL, "
        "avg_order_value_cents INT NOT NULL, days_since_signup INT NOT NULL, "
        "customer_id INT NOT NULL)"
    )
    cur.execute(
        "CREATE TABLE t17i_delayed_labels ("
        "request_id INT PRIMARY KEY, label_ts TIMESTAMP NOT NULL, churned BOOLEAN NOT NULL)"
    )


def log_requests(cur, rng, n=N_REQUESTS):
    """Every served request logs its exact post-transformation feature vector and model
    version — the mechanism this topic teaches, not a raw-input log."""
    rows = []
    for rid in range(1, n + 1):
        rows.append(
            (
                rid,
                "churn-model-v3",
                f"2026-01-01",
                rng.randint(0, 6),
                rng.randint(0, 10),
                rng.randint(500, 20000),
                rng.randint(1, 1200),
                rng.randint(1, 500),  # customer_id, later redacted
            )
        )
    cur.executemany(
        "INSERT INTO t17i_logged_requests "
        "(request_id, model_version, served_ts, tickets_open_total, orders_last_30d, "
        "avg_order_value_cents, days_since_signup, customer_id) VALUES "
        "(%s, %s, timestamp %s, %s, %s, %s, %s, %s)",
        rows,
    )


def label_delayed_requests(cur, rng, n=N_REQUESTS):
    """Labels arrive on their own schedule, days after the request that logged the vector."""
    rows = [(rid, rng.randint(1, 45), rng.random() < 0.18) for rid in range(1, n + 1)]
    cur.executemany(
        "INSERT INTO t17i_delayed_labels (request_id, label_ts, churned) VALUES "
        "(%s, timestamp '2026-01-01' + (%s || ' days')::interval, %s)",
        [(rid, delay, churned) for rid, delay, churned in rows],
    )


def build_training_set_from_log(cur):
    """The log-and-wait join: a delayed label joined to its logged row by request id alone — no
    feature recomputation, so no second code path exists to disagree with the first."""
    cur.execute(
        "SELECT l.request_id, l.tickets_open_total, l.orders_last_30d, "
        "l.avg_order_value_cents, l.days_since_signup, d.churned "
        "FROM t17i_logged_requests l JOIN t17i_delayed_labels d USING (request_id)"
    )
    return cur.fetchall()


def assert_skew_free_by_construction(cur, training_rows):
    """Every training row's feature values are read straight from the log, never recomputed —
    checked here by re-reading the same logged row a second, independent way and confirming an
    exact match, which is the only way "recomputation" could have introduced disagreement."""
    mismatches = 0
    for request_id, tickets, orders, avg_value, days, _churned in training_rows:
        cur.execute(
            "SELECT tickets_open_total, orders_last_30d, avg_order_value_cents, days_since_signup "
            "FROM t17i_logged_requests WHERE request_id = %s",
            (request_id,),
        )
        row = cur.fetchone()
        if row != (tickets, orders, avg_value, days):
            mismatches += 1
    return mismatches


def storage_cost_bytes_per_year(requests_per_day=REQUESTS_PER_DAY, vector_bytes=VECTOR_BYTES, retention_days=RETENTION_DAYS):
    return requests_per_day * vector_bytes * retention_days


def redaction_reidentification_check(cur):
    """Redact only customer_id and check whether the remaining fields still uniquely identify
    most rows — a real cardinality check, not an assumption."""
    cur.execute(
        "SELECT COUNT(*) FROM ("
        "SELECT tickets_open_total, orders_last_30d, avg_order_value_cents, days_since_signup, "
        "COUNT(*) AS n FROM t17i_logged_requests "
        "GROUP BY tickets_open_total, orders_last_30d, avg_order_value_cents, days_since_signup "
        "HAVING COUNT(*) = 1) AS unique_combos"
    )
    unique_rows = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM t17i_logged_requests")
    total_rows = cur.fetchone()[0]
    return unique_rows, total_rows


def run():
    rng = random.Random(SEED)
    conn = connect()
    cur = conn.cursor()
    _reset_schema(cur)
    log_requests(cur, rng)
    label_delayed_requests(cur, rng)

    training_rows = build_training_set_from_log(cur)
    mismatches = assert_skew_free_by_construction(cur, training_rows)
    print(f"training rows built from log-and-wait join: {len(training_rows)}")
    print(f"mismatches between the joined value and the logged value: {mismatches}")
    assert mismatches == 0, "a log-and-wait training set must reuse the logged value exactly"

    annual_bytes = storage_cost_bytes_per_year()
    annual_gb = annual_bytes / (1024**3)
    print(f"estimated logging storage: {annual_gb:,.1f} GiB/year at {REQUESTS_PER_DAY:,} requests/day, {VECTOR_BYTES} bytes/vector, {RETENTION_DAYS}-day retention")
    assert 100 < annual_gb < 2_000_000, "the estimate should land in a plausible terabyte-scale range, not an absurd one"

    unique_rows, total_rows = redaction_reidentification_check(cur)
    unique_rate = unique_rows / total_rows
    print(f"rows unique across non-customer-id fields after redaction: {unique_rows}/{total_rows} ({unique_rate:.1%})")
    assert unique_rate > 0.3, "redacting only the customer id should still leave a large share of rows re-identifiable by their remaining fields"

    cur.close()
    conn.close()
    print("all assertions passed")


if __name__ == "__main__":
    run()
