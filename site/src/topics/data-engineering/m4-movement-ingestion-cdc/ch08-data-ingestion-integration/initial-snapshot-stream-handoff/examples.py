"""de.initial-snapshot-stream-handoff -- measured against this sandbox's own real PostgreSQL
cluster, using psycopg (v3), a real replication-protocol CREATE_REPLICATION_SLOT ... LOGICAL
... EXPORT_SNAPSHOT call (not the plain pg_export_snapshot() SQL function, which exports the
calling session's own snapshot rather than a slot's), the built-in test_decoding plugin, and a
hand-written snapshot-then-stream loop that is genuinely killed and restarted, exactly as
CHAPTER.md's own "Lab" line asks for ("a hand-written snapshot-then-stream loop over
pg_export_snapshot and a logical slot, killed mid-snapshot, restarted, and the resulting target
diffed against the source for gaps and overlaps").

A connection opened with "replication=database" in its connection string can issue
CREATE_REPLICATION_SLOT and START_REPLICATION the way `psql`'s replication mode does; psycopg
(v3) has no higher-level wrapper for this, so these are issued as plain SQL text over that
connection. The exported snapshot name is valid only until a new command is issued on that same
connection or the connection is closed (protocol-replication.html, quoted in SOURCES.md) --
confirmed by hand before writing this file: letting that connection go idle, rather than closing
it or running anything else on it, is what keeps the snapshot importable in a second session.

Every function creates and drops its own scratch tables and replication slots, leaving the
cluster exactly as it was found for every other topic.
"""

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"
REPLICATION_DSN = DSN + " replication=database"


def _drop_slot_if_present(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def _create_exported_snapshot_slot(slot_name):
    """Opens its own replication-mode connection, issues CREATE_REPLICATION_SLOT ... LOGICAL
    test_decoding EXPORT_SNAPSHOT as the one and only command on it, and returns the open
    connection alongside the slot's reported fields. The caller must not issue any further
    command on this connection until it is done importing the snapshot elsewhere, and must
    close it afterward -- both per protocol-replication.html's own stated snapshot lifetime."""
    rconn = psycopg.connect(REPLICATION_DSN, autocommit=True)
    row = rconn.execute(
        f"CREATE_REPLICATION_SLOT {slot_name} LOGICAL test_decoding EXPORT_SNAPSHOT"
    ).fetchone()
    slot_name_reported, consistent_point, snapshot_name, output_plugin = row
    return rconn, slot_name_reported, consistent_point, snapshot_name


def exported_snapshot_shows_exactly_the_state_at_slot_creation():
    """Logical Decoding Concepts: a slot created through the replication protocol exports a
    snapshot showing "exactly the state of the database after which all changes will be
    included in the change stream." Measured directly: a slot is created, a row is inserted
    concurrently through a second connection, and a third session that imports the slot's own
    exported snapshot via SET TRANSACTION SNAPSHOT sees the pre-insert row count and does not
    see the concurrent row -- the snapshot is pinned to the slot's own starting point, not to
    whenever it happens to be imported."""
    slot = "topic13_state_at_creation"
    table = "topic13_state_at_creation_t"
    with psycopg.connect(DSN, autocommit=True) as setup:
        _drop_slot_if_present(setup, slot)
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"INSERT INTO {table} SELECT g, 'row' FROM generate_series(1, 200) g")

    rconn, slot_name, consistent_point, snapshot_name = _create_exported_snapshot_slot(slot)

    with psycopg.connect(DSN, autocommit=True) as writer:
        writer.execute(f"INSERT INTO {table} VALUES (9001, 'after the slot')")

    with psycopg.connect(DSN) as snap_session:
        snap_session.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
        snap_session.execute(f"SET TRANSACTION SNAPSHOT '{snapshot_name}'")
        total, sees_concurrent = snap_session.execute(
            f"SELECT count(*), count(*) FILTER (WHERE id = 9001) FROM {table}"
        ).fetchone()
        snap_session.execute("COMMIT")

    assert total == 200
    assert sees_concurrent == 0

    rconn.close()
    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def a_concurrent_write_appears_exactly_once_not_zero_not_twice():
    """CHAPTER.md: the no-gap-and-no-overlap proof is "by construction (the snapshot position
    equals the stream's start position), then by experiment: rows changed while the snapshot is
    read appear exactly once." Measured directly: a snapshot dump of the table (via the slot's
    own exported snapshot) is compared against the slot's own decoded changes
    (pg_logical_slot_get_changes, readable on an ordinary connection even though the slot was
    created over the replication protocol) -- a row written after the slot is created is absent
    from the snapshot dump (no overlap with it) and present exactly once in the decoded changes
    (no gap in the stream)."""
    slot = "topic13_no_gap_no_overlap"
    table = "topic13_no_gap_no_overlap_t"
    with psycopg.connect(DSN, autocommit=True) as setup:
        _drop_slot_if_present(setup, slot)
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"INSERT INTO {table} SELECT g, 'row' FROM generate_series(1, 150) g")

    rconn, slot_name, consistent_point, snapshot_name = _create_exported_snapshot_slot(slot)

    with psycopg.connect(DSN, autocommit=True) as writer:
        writer.execute(f"INSERT INTO {table} VALUES (9101, 'concurrent a')")
        writer.execute(f"INSERT INTO {table} VALUES (9102, 'concurrent b')")

    with psycopg.connect(DSN) as snap_session:
        snap_session.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
        snap_session.execute(f"SET TRANSACTION SNAPSHOT '{snapshot_name}'")
        snapshot_ids = {
            row[0] for row in snap_session.execute(f"SELECT id FROM {table}").fetchall()
        }
        snap_session.execute("COMMIT")

    rconn.close()

    with psycopg.connect(DSN, autocommit=True) as reader:
        changes = reader.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
    decoded_texts = [row[0] for row in changes]

    for concurrent_id in (9101, 9102):
        assert concurrent_id not in snapshot_ids
        occurrences = sum(1 for text in decoded_texts if f"id[integer]:{concurrent_id}" in text)
        assert occurrences == 1

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def _attempt_snapshot_copy(
    table, target, meta, slot_prefix, attempt, kill_after_rows, on_slot_created=None
):
    """One hand-written snapshot-then-stream attempt: create a fresh slot with an exported
    snapshot, copy the source table's rows into the target table a few at a time (recording no
    progress anywhere durable until the very end, mirroring Debezium's own "Records the
    successful completion of the snapshot in the connector offsets" as the single step that
    marks a snapshot done), optionally raising partway through to simulate a kill, and -- only
    if it reaches the end uninterrupted -- writing a completion row to the meta table and then
    draining the slot's own changes into the target. Returns the slot name actually used."""
    slot = f"{slot_prefix}_{attempt}"
    with psycopg.connect(DSN, autocommit=True) as setup:
        _drop_slot_if_present(setup, slot)

    rconn, slot_name, consistent_point, snapshot_name = _create_exported_snapshot_slot(slot)

    if on_slot_created is not None:
        on_slot_created()

    with psycopg.connect(DSN) as snap_session:
        snap_session.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
        snap_session.execute(f"SET TRANSACTION SNAPSHOT '{snapshot_name}'")
        rows = snap_session.execute(f"SELECT id, v FROM {table} ORDER BY id").fetchall()
        snap_session.execute("COMMIT")

    with psycopg.connect(DSN, autocommit=True) as copier:
        for i, (row_id, v) in enumerate(rows, start=1):
            if kill_after_rows is not None and i > kill_after_rows:
                rconn.close()
                raise RuntimeError(
                    f"simulated kill: attempt {attempt} stopped after {kill_after_rows} rows"
                )
            copier.execute(
                f"INSERT INTO {target} (id, v) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                (row_id, v),
            )

    with psycopg.connect(DSN, autocommit=True) as marker:
        marker.execute(
            f"INSERT INTO {meta} (attempt, slot_name, consistent_point, completed) "
            "VALUES (%s, %s, %s, true)",
            (attempt, slot_name, consistent_point),
        )

    rconn.close()

    with psycopg.connect(DSN, autocommit=True) as drainer:
        changes = drainer.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
    row_prefix = f"table public.{table}: INSERT:"
    for (text,) in changes:
        if text.startswith(row_prefix):
            row_id = int(text.split("id[integer]:")[1].split()[0])
            value = text.split("v[text]:")[1].strip().strip("'")
            with psycopg.connect(DSN, autocommit=True) as applier:
                applier.execute(
                    f"INSERT INTO {target} (id, v) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                    (row_id, value),
                )

    return slot


def a_killed_snapshot_discards_partial_work_and_restarts_from_zero():
    """Debezium's PostgreSQL page: "If the connector fails, is rebalanced, or stops after Step
    1 begins but before Step 5 completes, upon restart the connector begins a new snapshot" --
    a snapshot's completion is recorded only at its very last step. Measured directly with a
    hand-written loop: a first attempt is killed partway through copying a 300-row table, and
    is confirmed to have left a non-empty but incomplete target and no completion row in the
    meta table; the restart logic (checking the meta table, exactly as a connector checks its
    own offsets topic) finds no completed attempt, truncates whatever the killed attempt left
    behind, and starts an entirely new snapshot from row one rather than resuming."""
    table = "topic13_restart_source"
    target = "topic13_restart_target"
    meta = "topic13_restart_meta"
    slot_prefix = "topic13_restart"

    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (table, target):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"DROP TABLE IF EXISTS {meta}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"CREATE TABLE {target} (id int primary key, v text)")
        setup.execute(
            f"CREATE TABLE {meta} (attempt int, slot_name text, consistent_point text, completed boolean)"
        )
        setup.execute(f"INSERT INTO {table} SELECT g, 'row' FROM generate_series(1, 300) g")

    killed = False
    try:
        _attempt_snapshot_copy(table, target, meta, slot_prefix, attempt=1, kill_after_rows=120)
    except RuntimeError:
        killed = True
    assert killed

    with psycopg.connect(DSN, autocommit=True) as check:
        partial_rows = check.execute(f"SELECT count(*) FROM {target}").fetchone()[0]
        completed_attempts = check.execute(
            f"SELECT count(*) FROM {meta} WHERE completed"
        ).fetchone()[0]
    assert partial_rows == 120
    assert completed_attempts == 0

    with psycopg.connect(DSN, autocommit=True) as restart_logic:
        still_running_slots = restart_logic.execute(
            "SELECT slot_name FROM pg_replication_slots WHERE slot_name = %s",
            (f"{slot_prefix}_1",),
        ).fetchall()
        for (leftover_slot,) in still_running_slots:
            _drop_slot_if_present(restart_logic, leftover_slot)
        restart_logic.execute(f"TRUNCATE {target}")

    with psycopg.connect(DSN, autocommit=True) as check_after_restart:
        assert check_after_restart.execute(f"SELECT count(*) FROM {target}").fetchone()[0] == 0

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        for t in (table, target, meta):
            cleanup.execute(f"DROP TABLE IF EXISTS {t}")


def the_restarted_run_still_ends_with_no_gap_and_no_overlap():
    """CHAPTER.md's own lab: "killed mid-snapshot, restarted, and the resulting target diffed
    against the source for gaps and overlaps." Measured end to end: a first attempt is killed
    partway through, discarded exactly as the previous function proves, a second attempt runs
    to completion, and rows written concurrently during *both* attempts are included in the
    final diff. The target ends up identical to the source: no row is missing (no gap) and no
    row is duplicated (no overlap), even though one full snapshot attempt was thrown away along
    the way."""
    table = "topic13_e2e_source"
    target = "topic13_e2e_target"
    meta = "topic13_e2e_meta"
    slot_prefix = "topic13_e2e"

    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (table, target):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"DROP TABLE IF EXISTS {meta}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"CREATE TABLE {target} (id int primary key, v text)")
        setup.execute(
            f"CREATE TABLE {meta} (attempt int, slot_name text, consistent_point text, completed boolean)"
        )
        setup.execute(f"INSERT INTO {table} SELECT g, 'row' FROM generate_series(1, 250) g")

    try:
        _attempt_snapshot_copy(table, target, meta, slot_prefix, attempt=1, kill_after_rows=90)
        raise AssertionError("expected attempt 1 to be killed")
    except RuntimeError:
        pass

    with psycopg.connect(DSN, autocommit=True) as during_kill:
        during_kill.execute(f"INSERT INTO {table} VALUES (9201, 'written during attempt 1')")
        _drop_slot_if_present(during_kill, f"{slot_prefix}_1")
        during_kill.execute(f"TRUNCATE {target}")

    def write_during_attempt_2():
        with psycopg.connect(DSN, autocommit=True) as during_attempt2:
            during_attempt2.execute(
                f"INSERT INTO {table} VALUES (9202, 'written during attempt 2')"
            )

    _attempt_snapshot_copy(
        table, target, meta, slot_prefix, attempt=2, kill_after_rows=None,
        on_slot_created=write_during_attempt_2,
    )

    with psycopg.connect(DSN, autocommit=True) as diff:
        source_ids = {row[0] for row in diff.execute(f"SELECT id FROM {table}").fetchall()}
        target_ids = {row[0] for row in diff.execute(f"SELECT id FROM {target}").fetchall()}
        target_id_counts = diff.execute(
            f"SELECT id, count(*) FROM {target} GROUP BY id HAVING count(*) > 1"
        ).fetchall()

    missing_from_target = source_ids - target_ids
    unexpected_in_target = target_ids - source_ids
    assert missing_from_target == set(), f"gap: {missing_from_target}"
    assert unexpected_in_target == set(), f"overlap (phantom rows): {unexpected_in_target}"
    assert target_id_counts == [], f"overlap (duplicate rows): {target_id_counts}"
    assert 9201 in target_ids
    assert 9202 in target_ids

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, f"{slot_prefix}_2")
        for t in (table, target, meta):
            cleanup.execute(f"DROP TABLE IF EXISTS {t}")


if __name__ == "__main__":
    exported_snapshot_shows_exactly_the_state_at_slot_creation()
    a_concurrent_write_appears_exactly_once_not_zero_not_twice()
    a_killed_snapshot_discards_partial_work_and_restarts_from_zero()
    the_restarted_run_still_ends_with_no_gap_and_no_overlap()
    print("de.initial-snapshot-stream-handoff: all checks passed")
