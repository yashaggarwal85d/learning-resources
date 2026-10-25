import psycopg2
import psycopg2.extensions

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    return conn


def atomicity_all_or_nothing():
    """The classic transfer example (ACID wiki, Examples -> Atomicity): a CHECK constraint
    requires A + B = 100. A transaction that updates A but fails before updating B must leave
    neither change in place, not just the first one."""
    conn = connect()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS acidtest")
    cur.execute("CREATE TABLE acidtest (a INTEGER, b INTEGER, CHECK (a + b = 100))")
    cur.execute("INSERT INTO acidtest (a, b) VALUES (40, 60)")
    conn.commit()

    try:
        cur.execute("UPDATE acidtest SET a = a - 10")  # a=30, b=60: 30+60=90, breaks the invariant
        cur.execute("UPDATE acidtest SET b = b - 10")  # never reached: the first statement's own error aborts the transaction
        conn.commit()
    except psycopg2.Error:
        conn.rollback()

    cur2 = conn.cursor()
    cur2.execute("SELECT a, b FROM acidtest")
    a, b = cur2.fetchone()
    assert (a, b) == (40, 60), f"expected the pre-transaction row (40, 60) untouched, got ({a}, {b})"
    print(f"atomicity: the failed transfer left the row at ({a}, {b}) — neither statement's own change survived")
    conn.close()
    return a, b


def consistency_engine_vs_application():
    """The engine enforces only the rules it was told about (Consistency (database systems),
    Wikipedia): a declared CHECK constraint blocks a violating transaction, but an invariant the
    schema never declared is not caught by the engine at all — only application code could."""
    conn = connect()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS inventory")
    cur.execute("CREATE TABLE inventory (sku TEXT PRIMARY KEY, reserved INTEGER, on_hand INTEGER, CHECK (on_hand >= 0))")
    cur.execute("INSERT INTO inventory (sku, reserved, on_hand) VALUES ('widget', 3, 10)")
    conn.commit()

    # A declared rule (on_hand >= 0): the engine itself blocks the violation.
    engine_blocked = False
    try:
        cur.execute("UPDATE inventory SET on_hand = on_hand - 20 WHERE sku = 'widget'")
        conn.commit()
    except psycopg2.Error:
        conn.rollback()
        engine_blocked = True
    assert engine_blocked, "expected the declared CHECK (on_hand >= 0) to block this update"

    # An undeclared rule (reserved must never exceed on_hand: a real business invariant, never
    # written as a CHECK): the engine has no idea this rule exists, so it commits without complaint.
    cur.execute("UPDATE inventory SET reserved = reserved + 50 WHERE sku = 'widget'")
    conn.commit()
    cur.execute("SELECT reserved, on_hand FROM inventory WHERE sku = 'widget'")
    reserved, on_hand = cur.fetchone()
    assert reserved > on_hand, f"expected the undeclared invariant to be silently broken, got reserved={reserved}, on_hand={on_hand}"
    # Deterministic on this workload (confirmed across repeated runs): pin the exact numbers too.
    assert reserved == 53, f"expected reserved to reach exactly 53, got {reserved}"
    assert on_hand == 10, f"expected on_hand to stay at exactly 10, got {on_hand}"

    print(f"consistency: the declared rule was enforced by the engine; the undeclared one (reserved={reserved} > on_hand={on_hand}) was not — only the application ever knew it existed")
    conn.close()
    return engine_blocked, reserved, on_hand


def isolation_snapshot_vs_repeatable():
    """The identical interleaving, measured under two real isolation levels (PostgreSQL
    Transaction Isolation docs): Read Committed re-reads a changed row within the same
    transaction (a nonrepeatable read); Repeatable Read keeps the first snapshot throughout."""
    setup = connect()
    cur = setup.cursor()
    cur.execute("DROP TABLE IF EXISTS balance")
    cur.execute("CREATE TABLE balance (id INTEGER PRIMARY KEY, amount INTEGER)")
    cur.execute("INSERT INTO balance (id, amount) VALUES (1, 100)")
    setup.commit()
    setup.close()

    def interleaved_reread(isolation_level):
        reader = connect()
        reader.set_session(isolation_level=isolation_level)
        rcur = reader.cursor()
        rcur.execute("SELECT amount FROM balance WHERE id = 1")
        first = rcur.fetchone()[0]

        writer = connect()
        wcur = writer.cursor()
        wcur.execute("UPDATE balance SET amount = amount + 10 WHERE id = 1")
        writer.commit()
        writer.close()

        rcur.execute("SELECT amount FROM balance WHERE id = 1")
        second = rcur.fetchone()[0]
        reader.commit()
        reader.close()
        return first, second

    rc_first, rc_second = interleaved_reread(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
    assert rc_first == 100, f"expected the first read to be 100, got {rc_first}"
    assert rc_second == 110, f"expected Read Committed to see the committed update mid-transaction (110), got {rc_second}"

    # Reset for a clean second run of the identical interleaving.
    reset = connect()
    rcur = reset.cursor()
    rcur.execute("UPDATE balance SET amount = 100 WHERE id = 1")
    reset.commit()
    reset.close()

    rr_first, rr_second = interleaved_reread(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
    assert rr_first == 100 and rr_second == 100, f"expected Repeatable Read to keep its own snapshot throughout, got {rr_first} then {rr_second}"

    print(f"isolation: Read Committed re-read the row and saw {rc_first} then {rc_second}; Repeatable Read's own snapshot stayed at {rr_first} then {rr_second}")
    return (rc_first, rc_second), (rr_first, rr_second)


def durability_committed_is_logged_and_visible():
    """A proxy for durability in this sandbox (no safe way to kill the real server mid-write):
    a commit advances the server's own WAL position (the real mechanism durability is built on,
    per the ACID wiki's own Implementation section), and the committed row is visible to a brand
    new connection, not just the one that wrote it."""
    conn = connect()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS durability_demo")
    cur.execute("CREATE TABLE durability_demo (id INTEGER PRIMARY KEY, note TEXT)")
    conn.commit()

    cur.execute("SELECT pg_current_wal_lsn()")
    wal_before = cur.fetchone()[0]
    cur.execute("INSERT INTO durability_demo (id, note) VALUES (1, 'committed')")
    conn.commit()
    cur.execute("SELECT pg_current_wal_lsn()")
    wal_after = cur.fetchone()[0]
    assert wal_after != wal_before, "expected the commit to advance the WAL position"
    conn.close()

    fresh = connect()
    fcur = fresh.cursor()
    fcur.execute("SELECT note FROM durability_demo WHERE id = 1")
    note = fcur.fetchone()[0]
    fresh.close()
    assert note == "committed", f"expected a brand new connection to see the committed row, got {note!r}"

    print(f"durability: the commit advanced the WAL from {wal_before} to {wal_after}, and a fresh connection still reads {note!r}")
    return wal_before, wal_after, note


def main():
    atomicity_all_or_nothing()
    consistency_engine_vs_application()
    isolation_snapshot_vs_repeatable()
    durability_committed_is_logged_and_visible()
    print("acid-guarantees-precisely-stated examples: all checks pass")


if __name__ == "__main__":
    main()
