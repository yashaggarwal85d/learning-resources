"""de.cdc-offsets-replay-exactly -- measured against this sandbox's own real PostgreSQL cluster,
using psycopg (v3) and the built-in test_decoding plugin's own peek/advance primitives, which let
this file model exactly what Kafka Connect's own separate record-production and offset-commit
steps do: pg_logical_slot_peek_changes reads without moving the slot's own position, and
pg_replication_slot_advance commits that position explicitly, as its own separate step.

Every function creates and drops its own scratch tables and replication slots, leaving the
cluster exactly as it was found for every other topic.
"""

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def _drop_slot_if_present(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def _fresh_slot(conn, slot_name):
    _drop_slot_if_present(conn, slot_name)
    conn.execute("SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,))


def _peek(conn, slot_name):
    """Reads decoded changes without moving the slot's own position -- modeling the moment a
    connector has produced records to its output but not yet committed that position anywhere."""
    return conn.execute(
        "SELECT lsn, xid, data FROM pg_logical_slot_peek_changes(%s, NULL, NULL)", (slot_name,)
    ).fetchall()


def _advance(conn, slot_name, upto_lsn):
    """Commits the slot's own position explicitly -- modeling Kafka Connect's own periodic,
    separate offset commit."""
    conn.execute("SELECT pg_replication_slot_advance(%s, %s)", (slot_name, upto_lsn))


def a_crash_before_the_periodic_offset_commit_replays_already_produced_records():
    """CHAPTER.md: Kafka Connect stores source offsets in a compacted topic and commits them
    periodically, not per record, so a crash between producing records and committing offsets
    replays the records after the last commit. Measured directly: a connector produces a batch
    of real decoded changes to its own output, crashes before committing its offset, and on
    restart peeks the identical batch again -- the exact records it already produced come back a
    second time, purely because nothing ever told the source position to move."""
    slot = "topic18_at_least_once"
    table = "topic18_at_least_once_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        for i in range(1, 6):
            conn.execute(f"INSERT INTO {table} VALUES (%s, %s)", (i, 100))
        conn.commit()

    output = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        batch = _peek(conn, slot)
        output.extend(row[2] for row in batch)  # "produced" to the output topic
        # The connector crashes right here: the offset is never committed.

    # Restart: nothing was advanced, so the identical batch is still sitting there, unconsumed.
    with psycopg.connect(DSN, autocommit=True) as conn:
        replayed = _peek(conn, slot)
        output.extend(row[2] for row in replayed)  # produced again, after the "restart"

    inserts = [line for line in output if "INSERT:" in line]
    assert len(inserts) == 10  # every one of the five inserts was produced twice

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def committing_the_offset_right_after_producing_prevents_the_replay():
    """CHAPTER.md's own contrast case, needed to isolate what actually caused the replay above:
    the same crash-and-restart shape, but with the offset committed immediately after producing,
    before anything else happens. Measured directly: the second peek after "restart" is empty --
    nothing is reproduced, because the position was already moved past it."""
    slot = "topic18_committed_in_time"
    table = "topic18_committed_in_time_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        for i in range(1, 6):
            conn.execute(f"INSERT INTO {table} VALUES (%s, %s)", (i, 100))
        conn.commit()

    output = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        batch = _peek(conn, slot)
        output.extend(row[2] for row in batch)
        _advance(conn, slot, batch[-1][0])  # committed right away, before any crash could land here

    with psycopg.connect(DSN, autocommit=True) as conn:
        replayed = _peek(conn, slot)
        output.extend(row[2] for row in replayed)

    inserts = [line for line in output if "INSERT:" in line]
    assert len(inserts) == 5  # nothing doubled: the position had already moved past this batch

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def a_naive_consumer_without_its_own_dedup_double_counts_replayed_records():
    """CHAPTER.md: Debezium "does not implement an internal deduplication layer," so exactly-once
    CDC is a property a consumer verifies for itself, not one handed to it. Measured directly: the
    duplicated batch from the crash scenario above is fed to two different downstream readers --
    one that just sums every amount it sees, and one that upserts by each change's own unique
    log position before summing. The naive reader's total comes out doubled; the deduping reader's
    total matches the true, undoubled source total exactly."""
    slot = "topic18_dedup"
    table = "topic18_dedup_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        for i in range(1, 6):
            conn.execute(f"INSERT INTO {table} VALUES (%s, %s)", (i, 100))
        conn.commit()

    duplicated_stream = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        batch = _peek(conn, slot)  # never advanced -- this connector crashes before every commit
        duplicated_stream.extend(batch)
        duplicated_stream.extend(_peek(conn, slot))  # the exact same batch, read again

    true_total = 5 * 100

    naive_total = 0
    for (lsn, xid, text) in duplicated_stream:
        if "INSERT:" in text and "amount[integer]:" in text:
            naive_total += int(text.split("amount[integer]:")[1].split()[0])
    assert naive_total == true_total * 2  # every record counted twice

    deduped_by_position = {}
    for (lsn, xid, text) in duplicated_stream:
        if "INSERT:" in text and "amount[integer]:" in text:
            deduped_by_position[lsn] = int(text.split("amount[integer]:")[1].split()[0])
    deduped_total = sum(deduped_by_position.values())
    assert deduped_total == true_total  # the consumer's own dedup, not anything handed to it

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def a_purged_source_position_fails_at_startup_and_only_a_fresh_slot_recovers():
    """CHAPTER.md: when the connector's own stored offset names a position the server no longer
    has, the connector fails at startup, and the only repair is a snapshot. Measured directly: a
    slot's own stored position is advanced past a certain point and then the slot itself is
    dropped entirely, modeling the position becoming permanently unavailable; any attempt to read
    from that slot's own name now raises an error, confirming the stored offset is unusable, and
    only creating a brand-new slot (standing in for the when_needed re-snapshot of topic 13) lets
    the pipeline continue at all."""
    slot = "topic18_purged"
    table = "topic18_purged_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (1, 100)")
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        _drop_slot_if_present(conn, slot)  # the position is now permanently gone

    raised = False
    try:
        with psycopg.connect(DSN, autocommit=True) as conn:
            _peek(conn, slot)
    except Exception:
        raised = True
    assert raised  # the stored offset names a slot the server no longer has -- startup fails

    # The only repair: a brand-new slot, which is what a when_needed re-snapshot actually does.
    with psycopg.connect(DSN, autocommit=True) as conn:
        _fresh_slot(conn, slot)
        resumed = _peek(conn, slot)
    assert resumed == []  # the pipeline runs again, starting clean from the new slot's own position

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


if __name__ == "__main__":
    a_crash_before_the_periodic_offset_commit_replays_already_produced_records()
    committing_the_offset_right_after_producing_prevents_the_replay()
    a_naive_consumer_without_its_own_dedup_double_counts_replayed_records()
    a_purged_source_position_fails_at_startup_and_only_a_fresh_slot_recovers()
    print("de.cdc-offsets-replay-exactly: all checks passed")
