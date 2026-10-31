"""de.replication-slot-wal-retention -- measured against this sandbox's own real PostgreSQL
cluster, using psycopg (v3), the built-in test_decoding plugin, and a real
`ALTER SYSTEM SET max_slot_wal_keep_size` reload, exactly as CHAPTER.md's own "Lab" line asks
for ("hosts the stalled-consumer leg of the 8.2 lab directly on the sandbox's PostgreSQL").

Every function creates and drops its own scratch table and replication slot, and the
max_slot_wal_keep_size change is reset to its original -1 (unlimited) at the end of the
function that makes it, so the cluster is left exactly as it was found for every other topic.
"""

import time

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


def _drop_slot_if_present(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def _retained_bytes(conn, slot_name):
    row = conn.execute(
        "SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) FROM pg_replication_slots "
        "WHERE slot_name = %s",
        (slot_name,),
    ).fetchone()
    return row[0]


def a_stalled_slot_pins_growing_wal():
    """PostgreSQL's own caution: slots "persist across crashes and know nothing about the
    state of their consumer(s)" and prevent removal of required WAL even with no connection,
    which "consumes storage." Measured directly: a slot with no reader, under a real write
    load, has its retained-WAL gap grow -- not estimated, read from pg_replication_slots
    before and after."""
    slot = "topic12_stalled"
    table = "topic12_stalled_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, payload text)")
        _fresh_slot(conn, slot)

        before = _retained_bytes(conn, slot)

        conn.execute(
            f"INSERT INTO {table} SELECT g, repeat('x', 2000) FROM generate_series(1, 500) g"
        )
        conn.execute("CHECKPOINT")

        after = _retained_bytes(conn, slot)

        assert after > before

        _drop_slot_if_present(conn, slot)
        conn.execute(f"DROP TABLE {table}")


def a_consumer_that_periodically_confirms_bounds_the_gap():
    """CHAPTER.md: heartbeats let a connector "confirm progress," demonstrated "with a
    hand-written consumer that mimics the connector's confirm behaviour." Measured directly: a
    stalled slot's retained-WAL gap grows across a batch of writes; the identical batch split
    into smaller pieces, each confirmed by a real pg_logical_slot_get_changes call before the
    next piece, leaves the gap far smaller at the end -- the same mechanism a heartbeat buys a
    connector that would otherwise go a long time between confirmations."""
    slot_a = "topic12_no_confirm"
    slot_b = "topic12_confirms"
    table_a = "topic12_gap_a"
    table_b = "topic12_gap_b"
    rows_per_batch = 400
    batches = 5

    with psycopg.connect(DSN, autocommit=True) as conn:
        for table in (table_a, table_b):
            conn.execute(f"DROP TABLE IF EXISTS {table}")
            conn.execute(f"CREATE TABLE {table} (id int primary key, payload text)")
        _fresh_slot(conn, slot_a)
        _fresh_slot(conn, slot_b)

        for i in range(batches):
            start = i * rows_per_batch + 1
            end = start + rows_per_batch - 1
            conn.execute(
                f"INSERT INTO {table_a} SELECT g, repeat('x', 2000) FROM generate_series(%s::int, %s::int) g",
                (start, end),
            )
        conn.execute("CHECKPOINT")
        never_confirmed_gap = _retained_bytes(conn, slot_a)

        for i in range(batches):
            start = i * rows_per_batch + 1
            end = start + rows_per_batch - 1
            conn.execute(
                f"INSERT INTO {table_b} SELECT g, repeat('x', 2000) FROM generate_series(%s::int, %s::int) g",
                (start, end),
            )
            conn.execute(
                "SELECT pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_b,)
            )
            conn.execute("CHECKPOINT")
        periodically_confirmed_gap = _retained_bytes(conn, slot_b)

        assert periodically_confirmed_gap < never_confirmed_gap

        for slot in (slot_a, slot_b):
            _drop_slot_if_present(conn, slot)
        for table in (table_a, table_b):
            conn.execute(f"DROP TABLE {table}")


def max_slot_wal_keep_size_trades_disk_for_a_lost_stream():
    """PostgreSQL docs: wal_status moves reserved, extended, unreserved, lost; "a lost slot is
    unusable and the consumer must re-snapshot." Measured directly: with
    max_slot_wal_keep_size set to a small real value, a stalled slot's own wal_status is read
    before and after enough write volume to exceed it, and reading from the slot afterward
    raises PostgreSQL's own invalidation error, not a simulated one."""
    slot = "topic12_safety_valve"
    table = "topic12_safety_valve_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        original = conn.execute("SHOW max_slot_wal_keep_size").fetchone()[0]
        assert original == "-1"

        conn.execute("ALTER SYSTEM SET max_slot_wal_keep_size = '1MB'")
        conn.execute("SELECT pg_reload_conf()")
        time.sleep(0.2)

    try:
        with psycopg.connect(DSN, autocommit=True) as conn:
            assert conn.execute("SHOW max_slot_wal_keep_size").fetchone()[0] == "1MB"

            conn.execute(f"DROP TABLE IF EXISTS {table}")
            conn.execute(f"CREATE TABLE {table} (id int primary key, payload text)")
            _fresh_slot(conn, slot)

            status_before = conn.execute(
                "SELECT wal_status FROM pg_replication_slots WHERE slot_name = %s", (slot,)
            ).fetchone()[0]
            assert status_before == "reserved"

            status_after = status_before
            rows_written = 0
            while status_after != "lost" and rows_written < 400000:
                conn.execute(
                    f"INSERT INTO {table} SELECT g, repeat('z', 4000) FROM "
                    f"generate_series(%s::int, %s::int) g",
                    (rows_written + 1, rows_written + 20000),
                )
                rows_written += 20000
                conn.execute("CHECKPOINT")
                status_after = conn.execute(
                    "SELECT wal_status FROM pg_replication_slots WHERE slot_name = %s", (slot,)
                ).fetchone()[0]

            assert status_after == "lost"

            raised = False
            try:
                conn.execute(
                    "SELECT pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
                )
            except psycopg.errors.Error as exc:
                raised = True
                assert "invalidated" in str(exc) or "can no longer get changes" in str(exc)
            assert raised

            _drop_slot_if_present(conn, slot)
            conn.execute(f"DROP TABLE {table}")
    finally:
        with psycopg.connect(DSN, autocommit=True) as conn:
            conn.execute("ALTER SYSTEM RESET max_slot_wal_keep_size")
            conn.execute("SELECT pg_reload_conf()")
            time.sleep(0.2)
        with psycopg.connect(DSN, autocommit=True) as conn:
            restored = conn.execute("SHOW max_slot_wal_keep_size").fetchone()[0]
            assert restored == "-1"


def the_lag_query_reads_two_separate_gaps():
    """CHAPTER.md: monitoring slot lag reads pg_current_wal_lsn() minus restart_lsn and minus
    confirmed_flush_lsn, via pg_wal_lsn_diff, and the active column. Measured directly: both
    gaps are non-negative, and the restart_lsn gap is at least as large as the
    confirmed_flush_lsn gap, since restart_lsn can only lag behind or match
    confirmed_flush_lsn, never lead it. inactive_since is a PostgreSQL 17 addition, confirmed
    absent on this sandbox's PostgreSQL 16 server the same way topic 10 confirmed the
    failover/synced columns absent."""
    slot = "topic12_lag"
    table = "topic12_lag_t"
    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        _fresh_slot(conn, slot)
        conn.execute(f"INSERT INTO {table} VALUES (1, 'a')")
        conn.execute("SELECT pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,))
        conn.execute(f"INSERT INTO {table} VALUES (2, 'b')")

        row = conn.execute(
            "SELECT "
            "pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS restart_gap, "
            "pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn) AS confirmed_gap, "
            "active "
            "FROM pg_replication_slots WHERE slot_name = %s",
            (slot,),
        ).fetchone()
        restart_gap, confirmed_gap, active = row

        assert restart_gap >= 0
        assert confirmed_gap >= 0
        assert restart_gap >= confirmed_gap
        assert active is False

        _drop_slot_if_present(conn, slot)
        conn.execute(f"DROP TABLE {table}")


if __name__ == "__main__":
    a_stalled_slot_pins_growing_wal()
    a_consumer_that_periodically_confirms_bounds_the_gap()
    max_slot_wal_keep_size_trades_disk_for_a_lost_stream()
    the_lag_query_reads_two_separate_gaps()
    print("de.replication-slot-wal-retention: all checks passed")
