"""de.postgresql-logical-decoding-internals -- measured against this sandbox's own
real PostgreSQL cluster (database `learnshop`), using psycopg (v3) and the
built-in `test_decoding` output plugin, exactly as topic 9 did.

Every function creates its own scratch table and its own replication slot,
named so it cannot collide with any other topic's objects, and drops both at
the end, leaving the cluster exactly as it found it.
"""

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def _fresh_slot(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )
    conn.execute(
        "SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,)
    )


def _drop_slot(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def decoding_turns_wal_into_row_changes():
    """Logical decoding exposes one event per statement, in commit order,
    for an insert, an update and a delete -- the WAL's own records, decoded."""
    slot = "topic10_basic"
    table = "topic10_basic_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, status text)")
        _fresh_slot(conn, slot)

        conn.execute(f"INSERT INTO {table} VALUES (1, 'new')")
        conn.execute(f"UPDATE {table} SET status = 'paid' WHERE id = 1")
        conn.execute(f"DELETE FROM {table} WHERE id = 1")

        rows = conn.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
        changes = [r[0] for r in rows if not r[0].startswith(("BEGIN", "COMMIT"))]

        assert len(changes) == 3
        assert changes[0].startswith(f"table public.{table}: INSERT:")
        assert changes[1].startswith(f"table public.{table}: UPDATE:")
        assert changes[2].startswith(f"table public.{table}: DELETE:")

        _drop_slot(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def decoding_follows_commit_order_not_start_order():
    """Two transactions start in one order and commit in the other; the
    decoded stream follows commit order, matching the documentation's own
    "coherent, easy to understand format" claim about what decoding produces."""
    slot = "topic10_order"
    table = "topic10_order_t"
    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, note text)")
        _fresh_slot(setup, slot)

    conn_a = psycopg.connect(DSN)
    conn_b = psycopg.connect(DSN)
    conn_a.execute("BEGIN")
    conn_a.execute(f"INSERT INTO {table} VALUES (901, 'started-first')")
    conn_b.execute("BEGIN")
    conn_b.execute(f"INSERT INTO {table} VALUES (902, 'started-second')")
    conn_b.commit()
    conn_a.commit()
    conn_a.close()
    conn_b.close()

    with psycopg.connect(DSN, autocommit=True) as conn:
        rows = conn.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
        inserts = [r[0] for r in rows if "INSERT" in r[0]]

        assert len(inserts) == 2
        assert "902" in inserts[0] and "started-second" in inserts[0]
        assert "901" in inserts[1] and "started-first" in inserts[1]

        _drop_slot(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def before_image_depends_on_replica_identity():
    """The same primary-key update, decoded under three REPLICA IDENTITY
    settings, carries a different before-image each time: DEFAULT logs only
    the old primary-key columns, FULL logs every old column, NOTHING logs
    none of it -- exactly the documentation's own three behaviours."""
    slot = "topic10_identity"
    table = "topic10_identity_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, note text)")
        _fresh_slot(conn, slot)

        conn.execute(f"INSERT INTO {table} VALUES (1, 'a')")
        conn.execute(f"ALTER TABLE {table} REPLICA IDENTITY DEFAULT")
        conn.execute(f"UPDATE {table} SET id = 2 WHERE id = 1")

        conn.execute(f"INSERT INTO {table} VALUES (10, 'b')")
        conn.execute(f"ALTER TABLE {table} REPLICA IDENTITY FULL")
        conn.execute(f"UPDATE {table} SET id = 20 WHERE id = 10")

        conn.execute(f"INSERT INTO {table} VALUES (100, 'c')")
        conn.execute(f"ALTER TABLE {table} REPLICA IDENTITY NOTHING")
        conn.execute(f"UPDATE {table} SET id = 200 WHERE id = 100")

        rows = conn.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
        updates = [r[0] for r in rows if "UPDATE" in r[0]]
        assert len(updates) == 3
        default_update, full_update, nothing_update = updates

        assert "old-key:" in default_update
        assert "note" not in default_update.split("new-tuple:")[0]

        assert "old-key:" in full_update
        assert "note[text]:'b'" in full_update.split("new-tuple:")[0]

        assert "old-key:" not in nothing_update

        _drop_slot(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def peeking_is_repeatable_tolerating_repeats():
    """Peeking the slot twice without confirming returns the identical
    decoded output both times -- the measurable shadow of the real fact
    that a slot's position is persisted only at checkpoint, so a client
    must tolerate the same change being sent again."""
    slot = "topic10_peek"
    table = "topic10_peek_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        _fresh_slot(conn, slot)
        conn.execute(f"INSERT INTO {table} VALUES (1, 'once')")

        first_peek = conn.execute(
            "SELECT data FROM pg_logical_slot_peek_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
        second_peek = conn.execute(
            "SELECT data FROM pg_logical_slot_peek_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()

        assert first_peek == second_peek
        assert any("INSERT" in r[0] for r in first_peek)

        _drop_slot(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def confirming_advances_the_flush_point_but_not_the_restart_point():
    """Confirming consumption (a real get, not a peek) moves confirmed_flush_lsn
    forward; restart_lsn, the oldest WAL the server must still keep for this
    slot, does not move with it -- the gap between the two is what the server
    is retaining on the slot's behalf, read live from pg_replication_slots."""
    slot = "topic10_lsn"
    table = "topic10_lsn_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        _fresh_slot(conn, slot)
        conn.execute(f"INSERT INTO {table} VALUES (1, 'a')")

        before = conn.execute(
            "SELECT restart_lsn, confirmed_flush_lsn FROM pg_replication_slots WHERE slot_name = %s",
            (slot,),
        ).fetchone()

        conn.execute("SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,))

        after = conn.execute(
            "SELECT restart_lsn, confirmed_flush_lsn FROM pg_replication_slots WHERE slot_name = %s",
            (slot,),
        ).fetchone()

        assert after[1] > before[1]
        assert after[0] == before[0]
        assert after[0] <= after[1]

        _drop_slot(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def failover_slot_is_not_available_on_this_server():
    """PG17 added the `failover` argument to pg_create_logical_replication_slot
    and the `failover`/`synced` columns on pg_replication_slots; this sandbox
    runs PostgreSQL 16 (confirmed from server_version), so neither exists here
    and the failover-slot leg of the lab is sourced from the documentation,
    not measured, exactly as CHAPTER.md allows for the one-machine case."""
    with psycopg.connect(DSN, autocommit=True) as conn:
        version = conn.execute("SHOW server_version").fetchone()[0]
        assert version.startswith("16.")

        columns = {
            r[0]
            for r in conn.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'pg_replication_slots'"
            ).fetchall()
        }
        assert "failover" not in columns
        assert "synced" not in columns


if __name__ == "__main__":
    decoding_turns_wal_into_row_changes()
    decoding_follows_commit_order_not_start_order()
    before_image_depends_on_replica_identity()
    peeking_is_repeatable_tolerating_repeats()
    confirming_advances_the_flush_point_but_not_the_restart_point()
    failover_slot_is_not_available_on_this_server()
    print("de.postgresql-logical-decoding-internals: all checks passed")
