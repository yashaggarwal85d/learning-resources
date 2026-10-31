"""Real experiments against this sandbox's own Postgres cluster (learnshop database), building
a synthetic churn training set two ways — a naive join to a feature's CURRENT value, and a
correct as-of join to its value AT THE LABEL'S OWN TIMESTAMP — and measuring the AUC gap the
naive join's temporal leakage produces. A second, independent engineered feature demonstrates
post-outcome leakage (a field only populated because the label already happened), which no join
timing can fix. A third experiment measures the as-of join's TTL edges: a label older than the
earliest feature row, and a label further from its nearest feature row than a stated TTL allows,
both of which must join to nothing, never to the nearest available value (Feast's own documented
behavior, reproduced here with hand-rolled SQL rather than Feast itself, which this sandbox does
not have installed).

AUC is computed by hand (rank-based: the probability a random positive outranks a random
negative) and the classifier is a single hand-rolled logistic regression trained by gradient
descent, so the whole experiment has no dependency beyond psycopg2 and Python's standard library.
"""

import math
import random

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SEED = 20261030
N_CUSTOMERS = 4000
TTL_DAYS = 14


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _reset_schema(cur):
    cur.execute("DROP TABLE IF EXISTS t17_labels, t17_ticket_events, t17_cancellation_reason")
    cur.execute(
        """
        CREATE TABLE t17_labels (
            customer_id INT PRIMARY KEY,
            label_ts    TIMESTAMP NOT NULL,
            churned     BOOLEAN NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE t17_ticket_events (
            customer_id INT NOT NULL,
            event_ts    TIMESTAMP NOT NULL,
            tickets_open_total INT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE t17_cancellation_reason (
            customer_id INT PRIMARY KEY,
            reason      TEXT NOT NULL,
            recorded_ts TIMESTAMP NOT NULL
        )
        """
    )


def generate_synthetic_churn_dataset(cur):
    """Build a dataset where the TRUE signal (a customer's ticket-opening rate BEFORE the label
    moment) is real but modest, and a SECOND, stronger burst of ticket-opening activity happens
    AFTER a churned customer's label moment (customers who churn often open a flurry of
    complaint/cancellation tickets right as or after they leave). The current-value feature
    picks up that post-label burst; the as-of feature does not. A separate, independent
    `t17_cancellation_reason` field is populated only for churned customers, after their label
    moment, modeling post-outcome leakage with no temporal dimension to exploit at all."""
    rng = random.Random(SEED)
    rows_labels, rows_events, rows_reason = [], [], []
    base_day = 0
    for cid in range(1, N_CUSTOMERS + 1):
        label_day = base_day + rng.randint(300, 400)
        churned = rng.random() < 0.3
        # True, pre-label signal: churners open slightly more tickets before leaving.
        pre_label_rate = rng.uniform(1.5, 3.5) if churned else rng.uniform(0.5, 2.0)
        pre_events = max(0, int(rng.gauss(pre_label_rate * 10, 2)))
        running_total = 0
        for i in range(pre_events):
            day = rng.uniform(label_day - 90, label_day - 1)
            running_total += 1
            rows_events.append((cid, day, running_total))
        if churned:
            # Post-label burst: the feature's CURRENT value (read any time after the label)
            # absorbs this, which a correct as-of join (as of label_day) never sees.
            post_events = rng.randint(4, 10)
            for i in range(post_events):
                day = rng.uniform(label_day, label_day + 20)
                running_total += 1
                rows_events.append((cid, day, running_total))
            rows_reason.append((cid, rng.choice(["price", "competitor", "no_longer_needed"]), label_day + rng.uniform(0.1, 5)))
        rows_labels.append((cid, label_day, churned))

    cur.executemany("INSERT INTO t17_labels (customer_id, label_ts, churned) VALUES (%s, to_timestamp(%s * 86400.0), %s)", rows_labels)
    cur.executemany(
        "INSERT INTO t17_ticket_events (customer_id, event_ts, tickets_open_total) VALUES (%s, to_timestamp(%s * 86400.0), %s)",
        rows_events,
    )
    cur.executemany(
        "INSERT INTO t17_cancellation_reason (customer_id, reason, recorded_ts) VALUES (%s, %s, to_timestamp(%s * 86400.0))",
        rows_reason,
    )
    return len(rows_labels), len(rows_events), len(rows_reason)


def build_naive_training_set(cur):
    """The naive join: for each label, take the feature's CURRENT (latest-ever) value — the bug
    this topic names, because "latest ever" includes ticket events recorded after the label."""
    cur.execute(
        """
        SELECT l.customer_id, l.churned,
               COALESCE((
                   SELECT e.tickets_open_total FROM t17_ticket_events e
                   WHERE e.customer_id = l.customer_id
                   ORDER BY e.event_ts DESC LIMIT 1
               ), 0) AS tickets_feature
        FROM t17_labels l
        """
    )
    return cur.fetchall()


def build_asof_training_set(cur, ttl_days=None):
    """The correct as-of join: for each label, take the feature's value AS OF the label's own
    timestamp — the latest ticket-event row at or before label_ts, optionally bounded by a TTL
    (Feast's own documented behavior: the TTL is relative to each label's own timestamp)."""
    ttl_clause = ""
    if ttl_days is not None:
        ttl_clause = f"AND e.event_ts >= l.label_ts - INTERVAL '{ttl_days} days'"
    cur.execute(
        f"""
        SELECT l.customer_id, l.churned,
               (
                   SELECT e.tickets_open_total FROM t17_ticket_events e
                   WHERE e.customer_id = l.customer_id
                     AND e.event_ts <= l.label_ts
                     {ttl_clause}
                   ORDER BY e.event_ts DESC LIMIT 1
               ) AS tickets_feature
        FROM t17_labels l
        """
    )
    return cur.fetchall()


def auc(rows):
    """Rank-based AUC: the probability a random positive's score outranks a random negative's,
    with ties counted as half a win. `rows` is a list of (score, label) pairs."""
    positives = [s for s, y in rows if y]
    negatives = [s for s, y in rows if not y]
    if not positives or not negatives:
        raise ValueError("need both classes present to compute AUC")
    wins = 0.0
    for p in positives:
        for n in negatives:
            if p > n:
                wins += 1
            elif p == n:
                wins += 0.5
    return wins / (len(positives) * len(negatives))


def logistic_fit_predict(train_rows, feature_index=2):
    """A single hand-rolled logistic regression (one feature plus bias), trained by batch
    gradient descent, scored on the SAME rows it trained on (this topic's own point is the join,
    not generalization — both training sets get the identical, simple model, so the AUC gap
    measures the join, not a modeling difference)."""
    xs = [float(r[feature_index]) if r[feature_index] is not None else 0.0 for r in train_rows]
    ys = [1.0 if r[1] else 0.0 for r in train_rows]
    mean_x = sum(xs) / len(xs)
    std_x = (sum((x - mean_x) ** 2 for x in xs) / len(xs)) ** 0.5 or 1.0
    xs_n = [(x - mean_x) / std_x for x in xs]

    w, b = 0.0, 0.0
    lr = 0.1
    for _ in range(2000):
        grad_w = grad_b = 0.0
        for x, y in zip(xs_n, ys):
            p = 1.0 / (1.0 + math.exp(-(w * x + b)))
            grad_w += (p - y) * x
            grad_b += p - y
        w -= lr * grad_w / len(xs_n)
        b -= lr * grad_b / len(xs_n)

    scores = [1.0 / (1.0 + math.exp(-(w * x + b))) for x in xs_n]
    return list(zip(scores, [bool(y) for y in ys]))


def naive_vs_asof_leakage():
    conn = connect()
    cur = conn.cursor()
    _reset_schema(cur)
    n_labels, n_events, n_reason = generate_synthetic_churn_dataset(cur)
    print(f"synthetic dataset: {n_labels} labels, {n_events} ticket events, {n_reason} cancellation-reason rows")

    naive_rows = build_naive_training_set(cur)
    asof_rows = build_asof_training_set(cur)

    naive_auc = auc(logistic_fit_predict(naive_rows))
    asof_auc = auc(logistic_fit_predict(asof_rows))
    print(f"naive join (current value):  AUC = {naive_auc:.3f}")
    print(f"as-of join (value at label): AUC = {asof_auc:.3f}")

    assert naive_auc > asof_auc + 0.05, (
        f"expected the naive join's temporal leakage to produce a measurably higher AUC than the "
        f"as-of join, got naive={naive_auc:.3f} as-of={asof_auc:.3f}"
    )

    conn.close()
    return naive_auc, asof_auc


def post_outcome_leakage_cannot_be_fixed_by_join_timing():
    """The cancellation-reason field is populated only for churned customers, strictly AFTER
    their label moment — there is no earlier 'as of' timestamp at which it held a real value, so
    even an as-of join as of the label's own moment sees nothing for it (every row is NULL as of
    the label, by construction: recorded_ts is always after label_ts). Demonstrated by querying
    it as-of the label and confirming it is null for every row, including churned ones, then
    showing the (correctly excluded) current-value version is a near-perfect, leaking predictor
    of the label by construction."""
    conn = connect()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT count(*) FROM t17_labels l
        JOIN t17_cancellation_reason r ON r.customer_id = l.customer_id
        WHERE r.recorded_ts <= l.label_ts
        """
    )
    (as_of_matches,) = cur.fetchone()
    print(f"cancellation-reason field, joined AS OF the label: {as_of_matches} rows have a real value")
    assert as_of_matches == 0, "expected the post-outcome field to be unavailable at the label's own moment for every row, got a nonzero match"

    cur.execute(
        """
        SELECT l.churned, (r.customer_id IS NOT NULL) AS has_reason
        FROM t17_labels l LEFT JOIN t17_cancellation_reason r ON r.customer_id = l.customer_id
        """
    )
    rows = cur.fetchall()
    churned_with_reason = sum(1 for churned, has_reason in rows if churned and has_reason)
    churned_total = sum(1 for churned, _ in rows if churned)
    not_churned_with_reason = sum(1 for churned, has_reason in rows if not churned and has_reason)
    print(f"current-value 'has a cancellation reason' feature: {churned_with_reason}/{churned_total} churned customers have one, "
          f"{not_churned_with_reason} non-churned customers do")
    assert churned_with_reason == churned_total, "expected every churned customer to have a reason recorded (by construction)"
    assert not_churned_with_reason == 0, "expected no non-churned customer to ever have a cancellation reason"

    conn.close()
    return as_of_matches, churned_with_reason, churned_total


def feature_ttl_edges():
    """Confirm the two documented TTL edge cases (Feast: "the first row ... was older than the
    earliest feature rows ... could not be joined" and "the last row ... was outside of the TTL
    window ... also couldn't be joined") against this sandbox's own data: a label with NO ticket
    event at or before it (too early) and a label whose nearest at-or-before event is older than
    TTL_DAYS (too stale) both join to NULL, never to the nearest value regardless of distance."""
    conn = connect()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS t17_ttl_probe")
    cur.execute(
        """
        CREATE TABLE t17_ttl_probe (customer_id INT PRIMARY KEY, label_ts TIMESTAMP NOT NULL)
        """
    )
    # Case A: a label before any ticket event exists for a fresh customer id.
    cur.execute("INSERT INTO t17_ttl_probe VALUES (999001, now() - INTERVAL '1000 days')")
    # Case B: a label 30 days after the only ticket event, with a 14-day TTL — outside the window.
    cur.execute("INSERT INTO t17_ttl_probe VALUES (999002, now())")
    cur.execute("INSERT INTO t17_ticket_events VALUES (999002, now() - INTERVAL '30 days', 1)")

    cur.execute(
        f"""
        SELECT p.customer_id,
               (SELECT e.tickets_open_total FROM t17_ticket_events e
                WHERE e.customer_id = p.customer_id AND e.event_ts <= p.label_ts
                  AND e.event_ts >= p.label_ts - INTERVAL '{TTL_DAYS} days'
                ORDER BY e.event_ts DESC LIMIT 1) AS tickets_feature
        FROM t17_ttl_probe p ORDER BY p.customer_id
        """
    )
    results = dict(cur.fetchall())
    print(f"too-early label (no feature row exists yet): joins to {results[999001]!r}")
    print(f"too-stale label (nearest row is 30d back, TTL is {TTL_DAYS}d): joins to {results[999002]!r}")
    assert results[999001] is None, "expected a label with no earlier feature row to join to null"
    assert results[999002] is None, "expected a label past the TTL window to join to null, not the nearest available value"

    cur.execute("DROP TABLE t17_ttl_probe")
    conn.close()
    return results


def main():
    naive_vs_asof_leakage()
    post_outcome_leakage_cannot_be_fixed_by_join_timing()
    feature_ttl_edges()
    print("point-time-correct-training examples: all checks pass")


if __name__ == "__main__":
    main()
