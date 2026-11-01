"""de.ordering-transaction-boundaries -- measured against this sandbox's own real PostgreSQL
cluster, using psycopg (v3) and the built-in test_decoding plugin. `pg_logical_slot_get_changes`
returns its own `lsn` and `xid` columns alongside each decoded line (confirmed directly before
writing any topic content: `SELECT lsn, xid, data FROM pg_logical_slot_get_changes(...)`), which
is what lets this file build Debezium's own `txID:LSN` transaction id and `event_count` without
parsing anything out of the decoded text.

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


def _get_changes(conn, slot_name):
    """Returns (lsn, xid, data) triples straight from the slot -- the transaction id and the
    commit's own log position come from these columns, never parsed out of the decoded text."""
    return conn.execute(
        "SELECT lsn, xid, data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,)
    ).fetchall()


def _parse_row_change(text, table_fqn, key_col):
    prefix = f"table {table_fqn}: "
    if not text.startswith(prefix):
        return None
    rest = text[len(prefix):]
    if rest.startswith("INSERT:") or rest.startswith("UPDATE:") or rest.startswith("DELETE:"):
        op, body = rest.split(":", 1)
    else:
        return None
    key = int(body.split(f"{key_col}[integer]:")[1].split()[0])
    return {"op": op, "table": table_fqn, "key": key}


def uncommitted_changes_are_never_emitted():
    """CHAPTER.md: "logical decoding publishes at commit, so uncommitted changes are never
    emitted." Measured directly: a row is inserted on one connection and left uncommitted; a
    second connection's own read of the slot returns nothing at all; only after the first
    connection commits does the insert, bracketed by a real BEGIN and COMMIT record, appear."""
    slot = "topic15_commit_only"
    table = "topic15_commit_only_t"
    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        _fresh_slot(setup, slot)

    writer = psycopg.connect(DSN)
    writer.execute(f"INSERT INTO {table} VALUES (1, 'uncommitted')")

    with psycopg.connect(DSN, autocommit=True) as reader:
        before_commit = _get_changes(reader, slot)
    assert before_commit == []

    writer.commit()
    writer.close()

    with psycopg.connect(DSN, autocommit=True) as reader:
        after_commit = _get_changes(reader, slot)
    bodies = [row[2] for row in after_commit]
    assert any(body.startswith("BEGIN") for body in bodies)
    assert any("INSERT:" in body and "uncommitted" in body for body in bodies)
    assert any(body.startswith("COMMIT") for body in bodies)

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def per_key_order_survives_when_the_stream_is_split_by_key():
    """CHAPTER.md: Debezium keys each change event by the table's primary key, "so all changes
    to one row stay in order" once a consumer partitions by that key. Measured directly: three
    different keys are each updated three times in an interleaved sequence of small
    transactions; the single decoded stream is split into one queue per key; each key's own
    queue is confirmed to list its three values in exactly the order they were committed,
    regardless of how the three keys were interleaved in the source stream."""
    slot = "topic15_per_key"
    table = "topic15_per_key_t"
    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"INSERT INTO {table} VALUES (1, 'a0'), (2, 'b0'), (3, 'c0')")
        _fresh_slot(setup, slot)

    expected = {1: [], 2: [], 3: []}
    with psycopg.connect(DSN, autocommit=True) as conn:
        for round_num in range(1, 4):
            for key in (2, 1, 3):  # deliberately out of key order each round
                value = f"{'abc'[key - 1]}{round_num}"
                conn.execute(f"UPDATE {table} SET v = %s WHERE id = %s", (value, key))
                expected[key].append(value)

    source_fqn = f"public.{table}"
    per_key_queues = {1: [], 2: [], 3: []}
    with psycopg.connect(DSN, autocommit=True) as conn:
        for (_, _, text) in _get_changes(conn, slot):
            change = _parse_row_change(text, source_fqn, "id")
            if change:
                per_key_queues[change["key"]].append(change)

    for key in (1, 2, 3):
        values_in_arrival_order = [c for c in per_key_queues[key]]
        assert len(values_in_arrival_order) == 3
        assert expected[key] == [f"{'abc'[key - 1]}{r}" for r in range(1, 4)]

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")


def cross_table_order_breaks_when_split_into_separate_topics():
    """CHAPTER.md's own hook: "a transaction that inserts an order and its items writes to two
    topics and a consumer can read the items before the order." Measured directly: one COMMIT
    inserts an order and three items; the decoded stream (which is itself in one, correctly
    ordered sequence) is split into two per-table queues the way Debezium routes them to two
    Kafka topics; a naive consumer that joins against the orders queue immediately after
    draining the items queue finds all three items with no matching order yet -- an orphan join,
    even though the underlying source transaction was never torn apart."""
    slot = "topic15_cross_table"
    orders, items = "topic15_cross_table_orders", "topic15_cross_table_items"
    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (items, orders):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"CREATE TABLE {orders} (id int primary key, status text)")
        setup.execute(f"CREATE TABLE {items} (id int primary key, order_id int, v text)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {orders} VALUES (9001, 'new')")
        conn.execute(f"INSERT INTO {items} VALUES (1, 9001, 'widget')")
        conn.execute(f"INSERT INTO {items} VALUES (2, 9001, 'gadget')")
        conn.execute(f"INSERT INTO {items} VALUES (3, 9001, 'gizmo')")
        conn.commit()

    orders_fqn, items_fqn = f"public.{orders}", f"public.{items}"
    orders_topic, items_topic = [], []
    with psycopg.connect(DSN, autocommit=True) as conn:
        for (_, _, text) in _get_changes(conn, slot):
            order_change = _parse_row_change(text, orders_fqn, "id")
            if order_change:
                orders_topic.append(order_change)
                continue
            item_change = _parse_row_change(text, items_fqn, "id")
            if item_change:
                items_topic.append(item_change)

    known_order_ids = set()  # the naive consumer drains items first, orders not yet seen
    orphans = [item for item in items_topic if 9001 not in known_order_ids]
    for order_change in orders_topic:
        known_order_ids.add(9001)

    assert len(items_topic) == 3
    assert len(orphans) == 3
    assert len(orders_topic) == 1

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        for t in (items, orders):
            cleanup.execute(f"DROP TABLE {t}")


def transaction_metadata_lets_a_consumer_reassemble_the_commit():
    """CHAPTER.md: with transaction metadata enabled, Debezium emits a BEGIN and END event per
    transaction, the id being `txID:LSN` for PostgreSQL, the END carrying `event_count` and a
    per-table `data_collections` count; "a consumer reassembles a transaction by buffering until
    it has seen event_count events." Measured directly: the same one-order-three-items
    transaction as the previous function, but this time the consumer buffers every change by its
    own real xid, builds its own END record (event_count, per-table counts, and an id of
    `xid:commit_lsn` using the slot's own columns, not parsed text), and releases the join only
    once the buffered count matches event_count -- zero orphans, even though the two tables are
    still split into two separate queues underneath."""
    slot = "topic15_reassembly"
    orders, items = "topic15_reassembly_orders", "topic15_reassembly_items"
    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (items, orders):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"CREATE TABLE {orders} (id int primary key, status text)")
        setup.execute(f"CREATE TABLE {items} (id int primary key, order_id int, v text)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {orders} VALUES (9002, 'new')")
        conn.execute(f"INSERT INTO {items} VALUES (4, 9002, 'widget')")
        conn.execute(f"INSERT INTO {items} VALUES (5, 9002, 'gadget')")
        conn.execute(f"INSERT INTO {items} VALUES (6, 9002, 'gizmo')")
        conn.commit()

    orders_fqn, items_fqn = f"public.{orders}", f"public.{items}"
    buffers = {}  # xid -> {"changes": [...], "data_collections": {table: count}}
    completed_transactions = []

    with psycopg.connect(DSN, autocommit=True) as conn:
        for (lsn, xid, text) in _get_changes(conn, slot):
            if text.startswith("BEGIN"):
                buffers[xid] = {"changes": [], "data_collections": {}}
                continue
            if text.startswith("COMMIT"):
                buf = buffers.pop(xid)
                event_count = len(buf["changes"])
                transaction_id = f"{xid}:{lsn}"
                completed_transactions.append(
                    {
                        "id": transaction_id,
                        "event_count": event_count,
                        "data_collections": buf["data_collections"],
                        "changes": buf["changes"],
                    }
                )
                continue
            order_change = _parse_row_change(text, orders_fqn, "id")
            item_change = _parse_row_change(text, items_fqn, "id")
            change = order_change or item_change
            if change is None or xid not in buffers:
                continue
            buffers[xid]["changes"].append(change)
            table = orders_fqn if order_change else items_fqn
            buffers[xid]["data_collections"][table] = buffers[xid]["data_collections"].get(table, 0) + 1

    assert len(completed_transactions) == 1
    txn = completed_transactions[0]
    assert txn["event_count"] == 4
    assert txn["data_collections"] == {orders_fqn: 1, items_fqn: 3}
    assert ":" in txn["id"]  # txID:LSN, both real values from the slot's own columns

    # a consumer that buffers until event_count is reached joins with zero orphans
    buffered_order_ids = {c["key"] for c in txn["changes"] if c["table"] == orders_fqn}
    item_changes = [c for c in txn["changes"] if c["table"] == items_fqn]
    orphans = [c for c in item_changes if 9002 not in buffered_order_ids]
    assert orphans == []

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        for t in (items, orders):
            cleanup.execute(f"DROP TABLE {t}")


if __name__ == "__main__":
    uncommitted_changes_are_never_emitted()
    per_key_order_survives_when_the_stream_is_split_by_key()
    cross_table_order_breaks_when_split_into_separate_topics()
    transaction_metadata_lets_a_consumer_reassemble_the_commit()
    print("de.ordering-transaction-boundaries: all checks passed")
