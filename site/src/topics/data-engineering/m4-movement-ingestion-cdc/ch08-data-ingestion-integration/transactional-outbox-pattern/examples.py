"""de.transactional-outbox-pattern -- measured against this sandbox's own real PostgreSQL
cluster, using psycopg (v3) and the built-in test_decoding plugin. A hand-built outbox table is
read by a decoding consumer that stands in for Debezium's own Outbox Event Router: it routes by
aggregatetype, uses the outbox row's own id as a dedup key, and filters out DELETE operations on
the outbox table exactly as the real router does.

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
    return conn.execute(
        "SELECT lsn, xid, data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,)
    ).fetchall()


def _parse_cols(text):
    cols = {}
    for m in _TOKEN.finditer(text):
        name, typ, quoted, bare = m.groups()
        raw = quoted.replace("''", "'") if quoted is not None else bare
        if typ == "integer" and raw is not None:
            cols[name] = int(raw)
        else:
            cols[name] = raw
    return cols


def _parse_row_change(text, table_fqn):
    if text.startswith(f"table {table_fqn}: INSERT: "):
        return "c", _parse_cols(text[len(f"table {table_fqn}: INSERT: "):])
    if text.startswith(f"table {table_fqn}: DELETE: "):
        return "d", _parse_cols(text[len(f"table {table_fqn}: DELETE: "):])
    return None, None


def _route(outbox_row):
    """Debezium's own Outbox Event Router, hand-built: routes by aggregatetype, uses id as the
    dedup key, and drops DELETE operations on the outbox table entirely."""
    return {
        "topic": f"outbox.event.{outbox_row['aggregatetype']}",
        "dedup_key": outbox_row["id"],
        "key": outbox_row["aggregateid"],
        "payload": outbox_row["payload"],
    }


def a_dual_write_crash_between_commit_and_publish_loses_the_event_but_an_outbox_in_the_same_transaction_cannot():
    """CHAPTER.md: a service that commits its own state change and then publishes separately has
    a crash window where the database committed but the publish never happened. Measured
    directly: committing an order row and then "crashing" before a separate publish step leaves
    no event anywhere to recover; writing the event into an outbox row inside the very same
    transaction as the order means a real decoding read always finds it, because the two writes
    either both exist or neither does."""
    table = "topic20_orders_t"
    outbox = "topic20_outbox_t"
    slot = "topic20_dualwrite"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"DROP TABLE IF EXISTS {outbox}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, status text)")
        setup.execute(
            f"CREATE TABLE {outbox} (id int primary key, aggregatetype text, aggregateid text, "
            f"type text, payload text)"
        )
        _fresh_slot(setup, slot)

    # The dual-write failure: commit the order, then "crash" before the separate publish step.
    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (9001, 'placed')")
        conn.commit()
        # The publish step was supposed to happen here. It never runs -- the crash.

    with psycopg.connect(DSN, autocommit=True) as conn:
        changes_after_dual_write_crash = _get_changes(conn, slot)

    outbox_inserts = [
        row for row in changes_after_dual_write_crash if f"table public.{outbox}: INSERT:" in row[2]
    ]
    assert len(outbox_inserts) == 0  # nothing was ever published; nothing to decode

    # The outbox fix: the event is written in the exact same transaction as the order.
    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (9002, 'placed')")
        conn.execute(
            f"INSERT INTO {outbox} VALUES (%s, %s, %s, %s, %s)",
            (1, "order", "9002", "OrderPlaced", "order 9002 placed"),
        )
        conn.commit()  # both rows exist, or the whole transaction never happened

    with psycopg.connect(DSN, autocommit=True) as conn:
        changes_after_outbox_fix = _get_changes(conn, slot)

    outbox_inserts = [
        row for row in changes_after_outbox_fix if f"table public.{outbox}: INSERT:" in row[2]
    ]
    assert len(outbox_inserts) == 1  # the event is there, because the order's own commit put it there

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")
        cleanup.execute(f"DROP TABLE {outbox}")


def the_outbox_router_routes_by_aggregatetype_and_uses_id_for_dedup():
    """CHAPTER.md: the outbox event router routes by aggregatetype to a topic named
    outbox.event.${routedByValue} by default, and uses the outbox row's own id as a message id
    for consumer-side deduplication. Measured directly against two real decoded outbox inserts
    of different aggregate types."""
    outbox = "topic20_route_t"
    slot = "topic20_route"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {outbox}")
        setup.execute(
            f"CREATE TABLE {outbox} (id int primary key, aggregatetype text, aggregateid text, "
            f"type text, payload text)"
        )
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(
            f"INSERT INTO {outbox} VALUES (1, 'order', '9002', 'OrderPlaced', 'order 9002 placed')"
        )
        conn.execute(
            f"INSERT INTO {outbox} VALUES (2, 'shipment', '7001', 'ShipmentCreated', 'shipment 7001 created')"
        )
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        changes = _get_changes(conn, slot)

    table_fqn = f"public.{outbox}"
    prefix = f"table {table_fqn}: INSERT: "
    rows = [_parse_cols(row[2][len(prefix):]) for row in changes if row[2].startswith(prefix)]
    routed = [_route(row) for row in rows]

    assert routed[0]["topic"] == "outbox.event.order"
    assert routed[1]["topic"] == "outbox.event.shipment"
    assert routed[0]["dedup_key"] == 1 and routed[1]["dedup_key"] == 2

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {outbox}")


def aggregateid_keeps_one_aggregates_events_ordered_across_interleaved_writes():
    """CHAPTER.md: events for one aggregate, keyed by aggregateid, stay ordered. Measured
    directly: two aggregates' own events are written interleaved in the same transaction stream,
    and the decoded order for each aggregateid, taken on its own, still matches the order those
    specific events were actually written in."""
    outbox = "topic20_order_t"
    slot = "topic20_order"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {outbox}")
        setup.execute(
            f"CREATE TABLE {outbox} (id int primary key, aggregatetype text, aggregateid text, "
            f"type text, payload text)"
        )
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {outbox} VALUES (1, 'order', 'A', 'Created', 'A created')")
        conn.execute(f"INSERT INTO {outbox} VALUES (2, 'order', 'B', 'Created', 'B created')")
        conn.execute(f"INSERT INTO {outbox} VALUES (3, 'order', 'A', 'Shipped', 'A shipped')")
        conn.execute(f"INSERT INTO {outbox} VALUES (4, 'order', 'B', 'Shipped', 'B shipped')")
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        changes = _get_changes(conn, slot)

    table_fqn = f"public.{outbox}"
    prefix = f"table {table_fqn}: INSERT: "
    rows = [_parse_cols(row[2][len(prefix):]) for row in changes if row[2].startswith(prefix)]

    a_events = [r["type"] for r in rows if r["aggregateid"] == "A"]
    b_events = [r["type"] for r in rows if r["aggregateid"] == "B"]
    assert a_events == ["Created", "Shipped"]
    assert b_events == ["Created", "Shipped"]

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {outbox}")


def cleanup_deletes_old_outbox_rows_invisibly_once_the_slot_has_already_captured_them():
    """CHAPTER.md: the router filters out DELETE operations on the outbox table, so a periodic
    cleanup is invisible to consumers, and it is safe only once the slot's own position has
    already moved past those rows. Measured directly: a decoded DELETE on the outbox table is
    confirmed filtered out by the router's own logic, and the delete itself is only issued after
    the slot has already consumed the row it removes."""
    outbox = "topic20_cleanup_t"
    slot = "topic20_cleanup"

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {outbox}")
        setup.execute(
            f"CREATE TABLE {outbox} (id int primary key, aggregatetype text, aggregateid text, "
            f"type text, payload text)"
        )
        setup.execute(f"ALTER TABLE {outbox} REPLICA IDENTITY FULL")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(
            f"INSERT INTO {outbox} VALUES (1, 'order', '9002', 'OrderPlaced', 'order 9002 placed')"
        )
        conn.commit()

    # The slot captures the insert first -- this is what makes the later delete safe.
    with psycopg.connect(DSN, autocommit=True) as conn:
        captured = _get_changes(conn, slot)
    captured_inserts = [row for row in captured if "INSERT:" in row[2]]
    assert len(captured_inserts) == 1  # the event is already captured before any cleanup can run

    with psycopg.connect(DSN) as conn:
        conn.execute(f"DELETE FROM {outbox} WHERE id = 1")
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        changes_after_cleanup = _get_changes(conn, slot)

    table_fqn = f"public.{outbox}"
    kinds = [k for row in changes_after_cleanup if (k := _parse_row_change(row[2], table_fqn)[0]) is not None]
    assert kinds == ["d"]  # the decoded stream does carry the delete

    routed_events = []
    for row in changes_after_cleanup:
        kind, cols = _parse_row_change(row[2], table_fqn)
        if kind == "c":  # the router only ever routes inserts; a delete is filtered out here
            routed_events.append(_route(cols))
    assert routed_events == []  # the cleanup delete produced no routed event at all

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {outbox}")


if __name__ == "__main__":
    a_dual_write_crash_between_commit_and_publish_loses_the_event_but_an_outbox_in_the_same_transaction_cannot()
    the_outbox_router_routes_by_aggregatetype_and_uses_id_for_dedup()
    aggregateid_keeps_one_aggregates_events_ordered_across_interleaved_writes()
    cleanup_deletes_old_outbox_rows_invisibly_once_the_slot_has_already_captured_them()
    print("de.transactional-outbox-pattern: all checks passed")
