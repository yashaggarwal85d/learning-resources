"""
Reproduces the shape of a managed zero-ETL integration (AWS DynamoDB-to-Redshift's own documented
cadence: an initial full export, then a fixed incremental window using the source's own
incremental-export mechanism, gated by a point-in-time-recovery-style prerequisite) against this
sandbox's own Postgres. Not the managed service itself (CHAPTER.md): Postgres's logical
replication slot stands in for DynamoDB's incremental exports, and wal_level=logical stands in for
DynamoDB's point-in-time recovery requirement.
"""

import re
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="postgres", dbname="zeroetl_demo")
SLOT = "zeroetl_demo_slot"


def connect():
    return psycopg2.connect(**DSN)


def check_prerequisite(conn):
    """Postgres's analog to DynamoDB's point-in-time-recovery requirement: continuous WAL
    retention at the level logical decoding needs. Without it, the integration cannot start."""
    with conn.cursor() as cur:
        cur.execute("SHOW wal_level;")
        (level,) = cur.fetchone()
    return level == "logical"


def reset(conn):
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS orders, mirror_orders;")
        cur.execute(
            """
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                amount NUMERIC NOT NULL,
                flagged_fraud BOOLEAN NOT NULL DEFAULT FALSE
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE mirror_orders (
                id INTEGER PRIMARY KEY,
                amount NUMERIC NOT NULL,
                flagged_fraud BOOLEAN NOT NULL
            );
            """
        )
        cur.execute(f"SELECT 1 FROM pg_replication_slots WHERE slot_name = '{SLOT}';")
        if cur.fetchone():
            cur.execute(f"SELECT pg_drop_replication_slot('{SLOT}');")
    conn.commit()
    with conn.cursor() as cur:
        cur.execute(f"SELECT pg_create_logical_replication_slot('{SLOT}', 'test_decoding');")
    conn.commit()


def seed_initial_orders(conn, n):
    with conn.cursor() as cur:
        for i in range(n):
            cur.execute("INSERT INTO orders (amount) VALUES (%s);", (100 + i,))
    conn.commit()


def initial_full_export(conn):
    """The documented first step: 'the integration exports the full DynamoDB table to populate
    the Amazon Redshift database' (SOURCES.md). Modeled here as a plain full copy."""
    with conn.cursor() as cur:
        cur.execute("SELECT id, amount, flagged_fraud FROM orders ORDER BY id;")
        rows = cur.fetchall()
        for row in rows:
            cur.execute(
                "INSERT INTO mirror_orders (id, amount, flagged_fraud) VALUES (%s, %s, %s);", row
            )
    conn.commit()
    return len(rows)


_INSERT_RE = re.compile(
    r"table public\.orders: INSERT: id\[integer\]:(\d+) amount\[numeric\]:(\S+) "
    r"flagged_fraud\[boolean\]:(true|false)"
)


def incremental_pulse(conn):
    """One cycle of the documented incremental window ('every 15-30 minutes using DynamoDB
    incremental exports'). Pulls everything written since the last pulse from the replication
    slot and applies it to the mirror, modeling the cursor DynamoDB's own incremental export
    advances on each cycle."""
    applied = 0
    with conn.cursor() as cur:
        cur.execute(f"SELECT data FROM pg_logical_slot_get_changes('{SLOT}', NULL, NULL);")
        for (line,) in cur.fetchall():
            m = _INSERT_RE.search(line)
            if not m:
                continue
            row_id, amount, flagged = int(m.group(1)), m.group(2), m.group(3) == "true"
            cur.execute(
                """
                INSERT INTO mirror_orders (id, amount, flagged_fraud) VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount,
                    flagged_fraud = EXCLUDED.flagged_fraud;
                """,
                (row_id, amount, flagged),
            )
            applied += 1
    conn.commit()
    return applied


def establish_cdc_start_position(conn):
    """Drains whatever the replication slot buffered during the initial full export's own seed
    writes, without re-applying them (the full export already covered them). This is the same
    coordination a real managed integration performs between its initial snapshot and the
    position its incremental mechanism starts reading from."""
    with conn.cursor() as cur:
        cur.execute(f"SELECT data FROM pg_logical_slot_get_changes('{SLOT}', NULL, NULL);")
        cur.fetchall()
    conn.commit()


def mirror_has(conn, order_id):
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM mirror_orders WHERE id = %s;", (order_id,))
        return cur.fetchone() is not None


def insert_fraud_order(conn, amount):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO orders (amount, flagged_fraud) VALUES (%s, TRUE) RETURNING id;", (amount,)
        )
        (new_id,) = cur.fetchone()
    conn.commit()
    return new_id


def run():
    conn = connect()

    # 1. Prerequisite gate, same shape as DynamoDB's point-in-time-recovery requirement.
    assert check_prerequisite(conn), "wal_level must be 'logical' before the integration can start"

    reset(conn)

    # 2. Seed a source table and run the documented initial full export.
    seed_initial_orders(conn, 20)
    exported = initial_full_export(conn)
    assert exported == 20
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM mirror_orders;")
        (mirror_count,) = cur.fetchone()
    assert mirror_count == 20
    establish_cdc_start_position(conn)

    # 3. A new, fraudulent order lands on the source right after the initial export, inside the
    #    incremental window, before any incremental pulse has run.
    fraud_id = insert_fraud_order(conn, 9999)
    assert not mirror_has(conn, fraud_id), (
        "the fraud order must be invisible in the mirror until the next incremental pulse — "
        "this is the documented window's own gap, not a bug"
    )

    # 4. One incremental pulse — the documented 15-30 minute cycle, compressed to a single call
    #    here since this sandbox cannot wait real minutes, but the mechanism (drain the
    #    replication slot, apply what's new) is the real one DynamoDB's own incremental exports
    #    use in shape.
    applied = incremental_pulse(conn)
    assert applied == 1
    assert mirror_has(conn, fraud_id), "after a pulse, the mirror must have caught up"

    # 5. A second order arrives, then a second pulse catches it too — the cadence repeats.
    second_id = insert_fraud_order(conn, 500)
    assert not mirror_has(conn, second_id)
    applied_2 = incremental_pulse(conn)
    assert applied_2 == 1
    assert mirror_has(conn, second_id)

    # 6. The arithmetic behind the Prove It step: a documented 15-30 minute window cannot
    #    reliably meet a stated freshness requirement that falls inside its own range.
    window_low, window_high = 15, 30
    required_freshness = 20
    worst_case_meets_requirement = window_high <= required_freshness
    assert not worst_case_meets_requirement, (
        "a twenty-minute requirement is not reliably met by a window whose documented worst case "
        "is thirty minutes"
    )

    print(f"initial full export: {exported} orders")
    print(f"fraud order {fraud_id} invisible in mirror until the next pulse")
    print(f"after one incremental pulse: {applied} change(s) applied, mirror caught up")
    print(f"after a second cycle: {applied_2} change(s) applied, mirror caught up again")
    print(
        f"documented window {window_low}-{window_high} min vs. a {required_freshness} min "
        f"requirement: worst case meets it? {worst_case_meets_requirement}"
    )

    with conn.cursor() as cur:
        cur.execute(f"SELECT pg_drop_replication_slot('{SLOT}');")
        cur.execute("DROP TABLE orders, mirror_orders;")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    run()
