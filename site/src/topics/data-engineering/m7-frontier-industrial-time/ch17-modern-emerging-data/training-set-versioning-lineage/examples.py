"""Real experiments against this sandbox's own Postgres cluster (learnshop database) and local
file content hashing: snapshot-pinning a training set so it survives a source-table mutation,
DVC-style content-addressable identity for files, a small experiment-tracker stand-in that links
a dataset digest to a code version and a metric, and label-version drift — retraining on the same
feature snapshot under two different label definitions.
"""

import hashlib
import random

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SEED = 20261030
N_CUSTOMERS = 1500


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _reset_schema(cur):
    cur.execute("DROP TABLE IF EXISTS t17v_orders, t17v_snapshot_v1")
    cur.execute(
        "CREATE TABLE t17v_orders ("
        "customer_id INT PRIMARY KEY, orders_last_30d INT NOT NULL, "
        "days_since_last_order INT NOT NULL, churned_30d BOOLEAN NOT NULL)"
    )


def _seed_orders(cur, rng, n=N_CUSTOMERS):
    rows = [
        (cid, rng.randint(0, 10), rng.randint(0, 90), rng.random() < 0.15)
        for cid in range(1, n + 1)
    ]
    cur.executemany(
        "INSERT INTO t17v_orders (customer_id, orders_last_30d, days_since_last_order, churned_30d) "
        "VALUES (%s, %s, %s, %s)",
        rows,
    )


def take_snapshot(cur):
    """The reproducible alternative to "the current table": a named, immutable copy, the same
    role Iceberg's tags or a lakeFS commit play for a lake-scale table."""
    cur.execute("DROP TABLE IF EXISTS t17v_snapshot_v1")
    cur.execute("CREATE TABLE t17v_snapshot_v1 AS SELECT * FROM t17v_orders")


def mutate_source_table(cur, rng):
    """Simulates compaction/a later ETL run changing the live table after the snapshot was taken —
    the exact scenario that broke the hook's six-month-old, unreproducible dataset."""
    cur.execute("UPDATE t17v_orders SET orders_last_30d = orders_last_30d + 1 WHERE customer_id <= 200")
    cur.execute("DELETE FROM t17v_orders WHERE customer_id > 1400")


def query_current_table(cur):
    cur.execute("SELECT customer_id, orders_last_30d, days_since_last_order, churned_30d FROM t17v_orders ORDER BY customer_id")
    return cur.fetchall()


def query_pinned_snapshot(cur):
    cur.execute("SELECT customer_id, orders_last_30d, days_since_last_order, churned_30d FROM t17v_snapshot_v1 ORDER BY customer_id")
    return cur.fetchall()


def content_hash(data: bytes) -> str:
    """DVC's own mechanism: a file's identity is a hash of its contents, not its name or path."""
    return hashlib.md5(data).hexdigest()


def dvc_dedup_check():
    """Two files with identical content but different names hash identically (DVC's claimed
    dedup); one differing byte changes the hash."""
    file_a = b"customer_id,orders_last_30d\n1,4\n2,0\n"
    file_b_same_content = file_a  # a differently-named file with byte-identical content
    file_c_one_byte_different = file_a[:-2] + b"1\n"

    hash_a = content_hash(file_a)
    hash_b = content_hash(file_b_same_content)
    hash_c = content_hash(file_c_one_byte_different)
    return hash_a, hash_b, hash_c


class ExperimentTracker:
    """A minimal stand-in for MLflow 3's LoggedModel: links a dataset digest, a code version and
    a metric, and supports searching by dataset digest — the two capabilities this topic's
    claims 7-9 describe."""

    def __init__(self):
        self.logged_models = []

    def log_model(self, name, dataset_digest, code_version, metric):
        self.logged_models.append(
            {"name": name, "dataset_digest": dataset_digest, "code_version": code_version, "metric": metric}
        )

    def search_by_dataset_digest(self, digest):
        return [m for m in self.logged_models if m["dataset_digest"] == digest]


def label_under_definition(days_since_last_order, window_days):
    """A label definition: "churned" if no order within `window_days`. Changing the window is a
    label-version change, not a feature change."""
    return days_since_last_order > window_days


def label_version_drift_check(cur):
    """Same feature snapshot, two label definitions (a 30-day window and a 45-day window) — shows
    the fraction of rows whose label flips purely from the label definition changing, with the
    underlying features held fixed."""
    cur.execute("SELECT customer_id, days_since_last_order FROM t17v_snapshot_v1 ORDER BY customer_id")
    rows = cur.fetchall()
    flipped = sum(
        1
        for _cid, days in rows
        if label_under_definition(days, 30) != label_under_definition(days, 45)
    )
    return flipped, len(rows)


def run():
    rng = random.Random(SEED)
    conn = connect()
    cur = conn.cursor()
    _reset_schema(cur)
    _seed_orders(cur, rng)

    take_snapshot(cur)
    before_current = query_current_table(cur)
    before_snapshot = query_pinned_snapshot(cur)
    assert before_current == before_snapshot, "right after snapshotting, both views must agree"

    mutate_source_table(cur, rng)
    after_current = query_current_table(cur)
    after_snapshot = query_pinned_snapshot(cur)

    print(f"rows differ between current table and its own earlier state: {before_current != after_current}")
    print(f"rows differ between pinned snapshot and its own earlier state: {before_snapshot != after_snapshot}")
    assert before_current != after_current, "the live table must have actually changed after the mutation"
    assert before_snapshot == after_snapshot, "a pinned snapshot must be unaffected by a later mutation to the live table"

    hash_a, hash_b, hash_c = dvc_dedup_check()
    print(f"content hash, identical files: {hash_a == hash_b} ({hash_a[:8]}... == {hash_b[:8]}...)")
    print(f"content hash, one byte changed: {hash_a != hash_c} ({hash_a[:8]}... != {hash_c[:8]}...)")
    assert hash_a == hash_b, "two files with identical content must hash identically"
    assert hash_a != hash_c, "a single differing byte must change the hash"

    tracker = ExperimentTracker()
    tracker.log_model("churn-model-v3", dataset_digest=hash_a, code_version="git:ab12cd3", metric=0.81)
    tracker.log_model("churn-model-v4", dataset_digest=hash_c, code_version="git:ef45gh6", metric=0.78)
    found = tracker.search_by_dataset_digest(hash_a)
    print(f"experiment tracker search by dataset digest: {len(found)} model(s) found, name={found[0]['name'] if found else None}")
    assert len(found) == 1 and found[0]["name"] == "churn-model-v3", "searching by dataset digest must return the exact run that used it"

    flipped, total = label_version_drift_check(cur)
    flip_rate = flipped / total
    print(f"labels that flip purely from the label-definition change (30d vs 45d window): {flipped}/{total} ({flip_rate:.1%})")
    assert flip_rate > 0.01, "a 15-day change in the churn window should flip a nontrivial, nonzero share of labels"

    cur.close()
    conn.close()
    print("all assertions passed")


if __name__ == "__main__":
    run()
