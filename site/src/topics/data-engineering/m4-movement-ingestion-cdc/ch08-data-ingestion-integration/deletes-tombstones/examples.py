"""de.deletes-tombstones -- measured against this sandbox's own real PostgreSQL cluster for the
delete's own before-image, and a hand-built model of a Kafka compacted topic for everything that
needs a real Kafka broker this sandbox doesn't have (log compaction, tombstone retention, a
lagging consumer). The compaction model implements exactly Kafka's own documented rule -- keep
only the latest offset per key, and drop a tombstone entirely once it is older than the
retention window -- never a simplified stand-in for it.

Every function creates and drops its own scratch tables and replication slots, leaving the
cluster exactly as it was found for every other topic.
"""

import re

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"

_TOKEN = re.compile(r"(\w+)\[(\w+)\]:(?:'((?:[^']|'')*)'|(\S+))")


def _drop_slot_if_present(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def _fresh_slot(conn, slot_name):
    _drop_slot_if_present(conn, slot_name)
    conn.execute("SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,))


def _get_changes(conn, slot_name):
    return [row[2] for row in conn.execute(
        "SELECT lsn, xid, data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,)
    ).fetchall()]


def _parse_row_change(text, table_fqn):
    prefix = f"table {table_fqn}: "
    if not text.startswith(prefix):
        return None
    rest = text[len(prefix):]
    op, _, body = rest.partition(":")
    if op not in ("INSERT", "UPDATE", "DELETE"):
        return None
    cols = {}
    for m in _TOKEN.finditer(body):
        name, coltype, quoted, bare = m.group(1), m.group(2), m.group(3), m.group(4)
        value = quoted.replace("''", "'") if quoted is not None else bare
        cols[name] = (coltype, value)
    return op, cols


def a_delete_decodes_with_a_before_image_that_tracks_replica_identity():
    """CHAPTER.md: a delete's own before field is topic 10's REPLICA IDENTITY again -- under
    DEFAULT only the key. Measured directly: the identical DELETE statement, run against a table
    left at its default REPLICA IDENTITY and against one explicitly set to FULL, decodes to a
    before-image carrying only the key in the first case and the whole row in the second."""
    slot = "topic17_replica_identity"
    table = "topic17_replica_identity_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, note text)")
        setup.execute(f"INSERT INTO {table} VALUES (1, 'alpha'), (2, 'beta')")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"DELETE FROM {table} WHERE id = 1")
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"ALTER TABLE {table} REPLICA IDENTITY FULL")

    with psycopg.connect(DSN) as conn:
        conn.execute(f"DELETE FROM {table} WHERE id = 2")
        conn.commit()

    fqn = f"public.{table}"
    before_images = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        for text in _get_changes(conn, slot):
            change = _parse_row_change(text, fqn)
            if change is None:
                continue
            op, cols = change
            assert op == "DELETE"
            before_images.append(cols)

    assert len(before_images) == 2
    assert set(before_images[0]) == {"id"}  # DEFAULT: only the key
    assert set(before_images[1]) == {"id", "note"}  # FULL: the whole row
    assert before_images[1]["note"][1] == "beta"

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def a_soft_delete_stays_visible_to_a_cursor_and_a_hard_delete_vanishes_without_a_trace():
    """CHAPTER.md: a soft delete travels as an ordinary update a cursor extract (topic 3) can
    see; a hard delete removes the row and travels only through the log, which a cursor extract
    never sees. Measured directly: a high-watermark cursor query over updated_at finds the
    soft-deleted row (its own update bumped the watermark), but the hard-deleted row is simply
    absent from every later cursor query, with no trace of its removal at all."""
    table = "topic17_soft_hard_t"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(
            f"CREATE TABLE {table} (id int primary key, status text, updated_at timestamptz DEFAULT now())"
        )
        setup.execute(f"INSERT INTO {table} (id, status) VALUES (1, 'active'), (2, 'active')")

    with psycopg.connect(DSN, autocommit=True) as conn:
        cursor = conn.execute(f"SELECT max(updated_at) FROM {table}").fetchone()[0]

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"UPDATE {table} SET status = 'cancelled', updated_at = now() WHERE id = 1")  # soft delete
        conn.execute(f"DELETE FROM {table} WHERE id = 2")  # hard delete

    with psycopg.connect(DSN, autocommit=True) as conn:
        seen = conn.execute(
            f"SELECT id, status FROM {table} WHERE updated_at > %s", (cursor,)
        ).fetchall()

    seen_ids = {row[0] for row in seen}
    assert seen_ids == {1}  # the soft delete shows up as an ordinary row the cursor can see
    assert dict(seen)[1] == "cancelled"
    with psycopg.connect(DSN, autocommit=True) as conn:
        still_there = conn.execute(f"SELECT id FROM {table} WHERE id = 2").fetchone()
    assert still_there is None  # the hard delete leaves nothing for any cursor query to find

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        cleanup.execute(f"DROP TABLE {table}")


def applying_a_delete_to_a_landing_table_via_merge_removes_exactly_that_row():
    """CHAPTER.md: a delete is carried into a table format by MERGE ... WHEN MATCHED AND op = 'd'
    THEN DELETE. Measured directly: a batch of decoded changes, including one op='d' row, is
    applied to a real landing table with a single MERGE statement, and only the deleted row's own
    key is removed; every other row survives untouched."""
    landing = "topic17_merge_landing"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {landing}")
        setup.execute(f"CREATE TABLE {landing} (id int primary key, note text)")
        setup.execute(f"INSERT INTO {landing} VALUES (1, 'alpha'), (2, 'beta'), (3, 'gamma')")

    changes = [
        {"id": 2, "note": "beta-updated", "op": "u"},
        {"id": 3, "note": None, "op": "d"},
    ]

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {landing}_src")
        conn.execute(f"CREATE TEMP TABLE {landing}_src (id int, note text, op text)")
        for c in changes:
            conn.execute(f"INSERT INTO {landing}_src VALUES (%s, %s, %s)", (c["id"], c["note"], c["op"]))
        conn.execute(
            f"""
            MERGE INTO {landing} AS tgt
            USING {landing}_src AS src
            ON tgt.id = src.id
            WHEN MATCHED AND src.op = 'd' THEN DELETE
            WHEN MATCHED THEN UPDATE SET note = src.note
            WHEN NOT MATCHED THEN INSERT (id, note) VALUES (src.id, src.note)
            """
        )
        remaining = conn.execute(f"SELECT id, note FROM {landing} ORDER BY id").fetchall()

    assert remaining == [(1, "alpha"), (2, "beta-updated")]  # id 3 removed, id 1 untouched, id 2 updated

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        cleanup.execute(f"DROP TABLE {landing}")


def _compact(records, now, retention):
    """Kafka's own documented rule, reproduced exactly: keep only the latest offset per key, and
    drop a tombstone entirely once it is older than the retention window."""
    latest = {}
    for r in records:
        latest[r["key"]] = r
    out = []
    for r in latest.values():
        if r["value"] is None and (now - r["written_at"]) > retention:
            continue
        out.append(r)
    return out


def a_lagging_consumer_misses_the_delete_and_resurrects_the_row():
    """CHAPTER.md: Kafka keeps a tombstone for delete.retention.ms (default 24 hours) and then
    removes it, so a consumer that is more than that behind can read the compacted topic and
    never see the delete -- the consequence for a sink is a resurrected row. Measured directly
    against a hand-built model that implements Kafka's own compaction rule exactly: a consumer
    that built its own state before the delete, then resumes reading only after the retention
    window has passed and the broker has compacted both the delete event and the tombstone away,
    finds nothing at all for that key and never applies the delete -- its own stale state keeps
    the row alive. A consumer that catches up before the window closes still finds the tombstone
    and applies the delete correctly."""
    retention = 24 * 60 * 60  # delete.retention.ms default, in seconds
    key = "customer-9001"

    records = [
        {"key": key, "value": "insert: new customer", "offset": 0, "written_at": 0},
        {"key": key, "value": "update: address changed", "offset": 1, "written_at": 10},
        {"key": key, "value": None, "offset": 2, "written_at": 100},  # delete's own tombstone
    ]
    delete_written_at = 100

    # A consumer built its own materialized state from the original stream, before the delete.
    consumer_state = {key: "customer present"}

    # Case 1: the consumer resumes well within the retention window -- the tombstone still
    # survives compaction, so a real consumer reading forward would still see it.
    now_within_window = delete_written_at + retention - 1
    compacted_within_window = _compact(records, now_within_window, retention)
    tombstone_present = any(r["key"] == key and r["value"] is None for r in compacted_within_window)
    assert tombstone_present
    consumer_state_caught_up = dict(consumer_state)
    if tombstone_present:
        consumer_state_caught_up.pop(key, None)  # applying the delete it found
    assert key not in consumer_state_caught_up

    # Case 2: the consumer resumes after the retention window -- the tombstone itself has aged
    # out of the compacted log, so a consumer reading forward never encounters anything for this
    # key at all, and its own already-built state is never corrected.
    now_after_window = delete_written_at + retention + 1
    compacted_after_window = _compact(records, now_after_window, retention)
    anything_for_key = [r for r in compacted_after_window if r["key"] == key]
    assert anything_for_key == []  # the delete is unrecoverable from the compacted log alone

    consumer_state_lagging = dict(consumer_state)
    for r in compacted_after_window:
        if r["key"] == key:
            consumer_state_lagging.pop(r["key"], None)
    assert key in consumer_state_lagging  # resurrected: the stale state was never corrected
    assert consumer_state_lagging[key] == "customer present"


if __name__ == "__main__":
    a_delete_decodes_with_a_before_image_that_tracks_replica_identity()
    a_soft_delete_stays_visible_to_a_cursor_and_a_hard_delete_vanishes_without_a_trace()
    applying_a_delete_to_a_landing_table_via_merge_removes_exactly_that_row()
    a_lagging_consumer_misses_the_delete_and_resurrects_the_row()
    print("de.deletes-tombstones: all checks passed")
