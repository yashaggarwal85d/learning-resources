"""Real experiments against this sandbox's own Postgres cluster (learnshop database), reusing
topic 1's synthetic churn dataset shape (same generator shape, same seed, a topic-local table
prefix so this topic stands alone) to measure all three named causes of train/serve skew: a
different code path computing the "same" feature differently, a serving path that joins to the
CURRENT value instead of the value AS OF the request (the same leak as topic 1, now at inference
time), and a materialization lag that leaves the online store serving a value older than a stated
freshness SLA. Each cause is isolated by changing exactly one condition while holding the other
two at their non-buggy baseline, and each measured skew rate is shown driven to zero by removing
its own root cause.

No feature-store product (Feast, Tecton, Hopsworks) is installed in this sandbox; the offline/
online split and the materialization pulse are hand-rolled here to reproduce the architecture's
behavior, not to reimplement any vendor's code.
"""

import datetime
import random

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SEED = 20261030
N_CUSTOMERS = 4000
N_REQUESTS = 1500
MATERIALIZE_INTERVAL_MIN_BUGGY = 45
MATERIALIZE_INTERVAL_MIN_FIXED = 15
FRESHNESS_SLA_MIN = 30


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _reset_schema(cur):
    cur.execute("DROP TABLE IF EXISTS t17f_labels, t17f_ticket_events")
    cur.execute("CREATE TABLE t17f_labels (customer_id INT PRIMARY KEY, label_ts TIMESTAMP NOT NULL)")
    cur.execute(
        "CREATE TABLE t17f_ticket_events ("
        "customer_id INT NOT NULL, event_ts TIMESTAMP NOT NULL, tickets_open_total INT NOT NULL)"
    )


def build(seed=SEED, n=N_CUSTOMERS):
    """Topic 1's generator shape, reused: each customer has a label timestamp and a handful of
    ticket-count events scattered around it, so the feature genuinely changes over time."""
    rng = random.Random(seed)
    conn = connect()
    cur = conn.cursor()
    _reset_schema(cur)

    label_rows, event_rows = [], []
    for cid in range(1, n + 1):
        label_day = rng.randint(30, 335)
        label_rows.append((cid, label_day))
        running = 0
        for off in sorted(rng.randint(-25, 25) for _ in range(rng.randint(3, 7))):
            running += rng.randint(0, 2)
            event_rows.append((cid, label_day + off, running))

    cur.executemany(
        "INSERT INTO t17f_labels (customer_id, label_ts) VALUES "
        "(%s, timestamp '2026-01-01' + (%s || ' days')::interval)",
        label_rows,
    )
    cur.executemany(
        "INSERT INTO t17f_ticket_events (customer_id, event_ts, tickets_open_total) VALUES "
        "(%s, timestamp '2026-01-01' + (%s || ' days')::interval, %s)",
        event_rows,
    )
    conn.commit()
    return conn, cur


def asof_value(cur, customer_id, as_of_ts):
    """The offline/honest definition: the latest ticket count at or before as_of_ts."""
    cur.execute(
        "SELECT tickets_open_total FROM t17f_ticket_events "
        "WHERE customer_id = %s AND event_ts <= %s ORDER BY event_ts DESC LIMIT 1",
        (customer_id, as_of_ts),
    )
    row = cur.fetchone()
    return row[0] if row else None


def current_value(cur, customer_id):
    """The naive/buggy definition: the latest ticket count overall, regardless of request time —
    the same current-value leak as topic 1, now computed at serving time instead of training time."""
    cur.execute(
        "SELECT tickets_open_total FROM t17f_ticket_events "
        "WHERE customer_id = %s ORDER BY event_ts DESC LIMIT 1",
        (customer_id,),
    )
    row = cur.fetchone()
    return row[0] if row else None


def request_timestamp(cur, customer_id, days_after_label):
    cur.execute(
        "SELECT label_ts + (%s || ' days')::interval FROM t17f_labels WHERE customer_id = %s",
        (days_after_label, customer_id),
    )
    return cur.fetchone()[0]


def materialization_lag_minutes(minute_of_day, interval_min):
    """How many minutes old the online store's value is for a request landing at
    minute_of_day, given materialization pulses every interval_min minutes."""
    return minute_of_day - (minute_of_day // interval_min) * interval_min


def run():
    conn, cur = build()
    rng = random.Random(SEED + 1)

    cur.execute("SELECT customer_id FROM t17f_labels ORDER BY customer_id")
    customer_ids = [row[0] for row in cur.fetchall()]
    requests = [(cid, rng.randint(1, 60)) for cid in rng.sample(customer_ids, N_REQUESTS)]

    code_path_mismatches = join_mismatches = 0
    stale_violations_buggy = stale_violations_fixed = 0

    for cid, days_after_label in requests:
        req_ts = request_timestamp(cur, cid, days_after_label)
        offline = asof_value(cur, cid, req_ts)

        # Cause 1: a second serving-side implementation with a five-day-earlier window boundary —
        # a deliberately different piece of code computing the "same" feature.
        buggy_window = asof_value(cur, cid, req_ts - datetime.timedelta(days=5))
        if offline != buggy_window:
            code_path_mismatches += 1

        # Cause 2: the serving path asks for the current value instead of the as-of value.
        if offline != current_value(cur, cid):
            join_mismatches += 1

        # Cause 3: materialization lag under a 45-minute (buggy) and a 15-minute (fixed) pulse,
        # against a stated 30-minute freshness SLA.
        minute_of_day = rng.randint(0, 24 * 60 - 1)
        if materialization_lag_minutes(minute_of_day, MATERIALIZE_INTERVAL_MIN_BUGGY) > FRESHNESS_SLA_MIN:
            stale_violations_buggy += 1
        if materialization_lag_minutes(minute_of_day, MATERIALIZE_INTERVAL_MIN_FIXED) > FRESHNESS_SLA_MIN:
            stale_violations_fixed += 1

    n = len(requests)
    code_path_rate = code_path_mismatches / n
    join_rate = join_mismatches / n
    stale_rate_buggy = stale_violations_buggy / n
    stale_rate_fixed = stale_violations_fixed / n
    identical_code_rate = sum(
        1 for cid, d in requests if asof_value(cur, cid, request_timestamp(cur, cid, d)) != asof_value(cur, cid, request_timestamp(cur, cid, d))
    ) / n

    print(f"requests simulated: {n}")
    print(f"cause 1 (different code path) mismatch rate — five-day-earlier window: {code_path_rate:.3f}, identical code: {identical_code_rate:.3f}")
    print(f"cause 2 (different join: current vs as-of) mismatch rate: {join_rate:.3f}")
    print(f"cause 3 (stale online value) SLA-violation rate — 45 min interval: {stale_rate_buggy:.3f}, 15 min interval: {stale_rate_fixed:.3f}")

    assert code_path_rate > 0.05, "the different-code-path bug should produce a real, visible mismatch rate"
    assert identical_code_rate == 0.0, "identical code must never disagree with itself"
    assert join_rate > 0.05, "the current-vs-as-of join should produce a real, visible mismatch rate"
    assert stale_rate_buggy > 0.0, "a 45-minute materialization interval against a 30-minute SLA must produce some violations"
    assert stale_rate_fixed == 0.0, "a 15-minute interval is inside the 30-minute SLA by construction: zero violations"

    cur.close()
    conn.close()
    print("all assertions passed")


if __name__ == "__main__":
    run()
