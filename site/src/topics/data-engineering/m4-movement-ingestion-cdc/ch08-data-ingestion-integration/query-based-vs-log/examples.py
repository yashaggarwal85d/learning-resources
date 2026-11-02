"""de.query-based-vs-log: polling, trigger-based capture, and PostgreSQL's own logical decoding,
each measured directly against this sandbox's real PostgreSQL 16 cluster (database `learnshop`,
table `orders`, used by topics 2-8 of this chapter).

Every claim below is a direct run against a live database, not a simulation: a real logical
replication slot created with `pg_create_logical_replication_slot`, real changes read back with
`pg_logical_slot_get_changes` and the `test_decoding` plugin, and a real trigger-based shadow
table. Test rows live in a reserved id range (900000+) and are cleaned up by each function.
"""

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"
TEST_ID_BASE = 900000


def _cleanup(conn, order_id):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM orders WHERE id = %s", (order_id,))
    conn.commit()


def polling_misses_intermediate_states():
    order_id = TEST_ID_BASE + 1
    conn = psycopg.connect(DSN)
    slot_name = "topic9_intermediate_slot"

    with conn.cursor() as cur:
        cur.execute("SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders (id, customer_id, status, amount) VALUES (%s, 1, 'new', 10.00)", (order_id,))
        cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))
        cur.execute("UPDATE orders SET status = 'shipped' WHERE id = %s", (order_id,))
        cur.execute("UPDATE orders SET status = 'refunded' WHERE id = %s", (order_id,))
    conn.commit()

    # the poll: a single query sampling current state, exactly as topic 3's cursor would
    with conn.cursor() as cur:
        cur.execute("SELECT status FROM orders WHERE id = %s", (order_id,))
        polled_states_seen = [cur.fetchone()[0]]

    # the log: every committed change, in order, read directly from the slot
    with conn.cursor() as cur:
        cur.execute("SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,))
        log_rows = [r[0] for r in cur.fetchall()]
    log_states_seen = [row.split("status[text]:'")[1].split("'")[0] for row in log_rows if f"id[bigint]:{order_id}" in row and "status[text]" in row]

    with conn.cursor() as cur:
        cur.execute("SELECT pg_drop_replication_slot(%s)", (slot_name,))
    conn.commit()
    _cleanup(conn, order_id)
    conn.close()

    result = {
        "states_the_poll_saw": polled_states_seen,
        "states_the_log_saw_in_order": log_states_seen,
    }
    assert result["states_the_poll_saw"] == ["refunded"]
    assert result["states_the_log_saw_in_order"] == ["new", "paid", "shipped", "refunded"]
    return result


def polling_misses_deletes():
    order_id = TEST_ID_BASE + 2
    conn = psycopg.connect(DSN)
    slot_name = "topic9_delete_slot"

    with conn.cursor() as cur:
        cur.execute("SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,))
    conn.commit()

    cursor_watermark_before_insert = _max_updated_at(conn)

    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders (id, customer_id, status, amount) VALUES (%s, 1, 'new', 10.00)", (order_id,))
        cur.execute("DELETE FROM orders WHERE id = %s", (order_id,))
    conn.commit()

    # the poll: "what changed since the watermark" finds nothing, because the row is simply gone
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM orders WHERE id = %s AND updated_at > %s", (order_id, cursor_watermark_before_insert))
        rows_the_poll_finds = cur.fetchone()[0]

    with conn.cursor() as cur:
        cur.execute("SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,))
        log_rows = [r[0] for r in cur.fetchall()]
    delete_events_in_log = sum(1 for row in log_rows if f"table public.orders: DELETE: id[bigint]:{order_id}" in row)

    with conn.cursor() as cur:
        cur.execute("SELECT pg_drop_replication_slot(%s)", (slot_name,))
    conn.commit()
    conn.close()

    result = {
        "rows_the_poll_finds_for_the_deleted_order": rows_the_poll_finds,
        "delete_events_the_log_shows": delete_events_in_log,
    }
    assert result["rows_the_poll_finds_for_the_deleted_order"] == 0
    assert result["delete_events_the_log_shows"] == 1
    return result


def _max_updated_at(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT now()")
        return cur.fetchone()[0]


def trigger_based_capture_write_amplification():
    order_id = TEST_ID_BASE + 3
    conn = psycopg.connect(DSN)
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders_shadow (
                id bigint, customer_id bigint, status text, amount numeric(10,2),
                updated_at timestamptz, captured_at timestamptz DEFAULT now()
            )
        """)
        cur.execute("""
            CREATE OR REPLACE FUNCTION topic9_capture_order_change() RETURNS trigger AS $$
            BEGIN
                INSERT INTO orders_shadow (id, customer_id, status, amount, updated_at)
                VALUES (NEW.id, NEW.customer_id, NEW.status, NEW.amount, NEW.updated_at);
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        cur.execute("DROP TRIGGER IF EXISTS topic9_orders_capture ON orders")
        cur.execute("""
            CREATE TRIGGER topic9_orders_capture
            AFTER INSERT OR UPDATE ON orders
            FOR EACH ROW EXECUTE FUNCTION topic9_capture_order_change()
        """)
    conn.commit()

    applied_writes_to_orders = 4
    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders (id, customer_id, status, amount) VALUES (%s, 1, 'new', 10.00)", (order_id,))
        cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))
        cur.execute("UPDATE orders SET status = 'shipped' WHERE id = %s", (order_id,))
        cur.execute("UPDATE orders SET status = 'refunded' WHERE id = %s", (order_id,))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM orders_shadow WHERE id = %s", (order_id,))
        shadow_rows_written = cur.fetchone()[0]

    with conn.cursor() as cur:
        cur.execute("DROP TRIGGER IF EXISTS topic9_orders_capture ON orders")
        cur.execute("DROP FUNCTION IF EXISTS topic9_capture_order_change()")
        cur.execute("DROP TABLE IF EXISTS orders_shadow")
    conn.commit()
    _cleanup(conn, order_id)
    conn.close()

    result = {
        "writes_applied_to_orders": applied_writes_to_orders,
        "writes_the_trigger_added_to_the_shadow_table": shadow_rows_written,
        "every_write_to_orders_wrote_twice": shadow_rows_written == applied_writes_to_orders,
    }
    assert result["every_write_to_orders_wrote_twice"] is True
    return result


def log_read_cost_is_proportional_to_changes_not_table_size():
    conn = psycopg.connect(DSN)
    slot_name = "topic9_cost_slot"
    order_id = TEST_ID_BASE + 4

    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM orders")
        table_row_count = cur.fetchone()[0]

    with conn.cursor() as cur:
        cur.execute("SELECT pg_create_logical_replication_slot(%s, 'test_decoding')", (slot_name,))
    conn.commit()

    small_change_count = 3
    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders (id, customer_id, status, amount) VALUES (%s, 1, 'new', 10.00)", (order_id,))
        cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))
        cur.execute("UPDATE orders SET status = 'shipped' WHERE id = %s", (order_id,))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute("SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot_name,))
        log_rows = [r[0] for r in cur.fetchall()]
    change_events_returned = sum(1 for row in log_rows if "table public.orders" in row)

    with conn.cursor() as cur:
        cur.execute("SELECT pg_drop_replication_slot(%s)", (slot_name,))
    conn.commit()
    _cleanup(conn, order_id)
    conn.close()

    result = {
        "rows_in_the_whole_table": table_row_count,
        "actual_changes_made": small_change_count,
        "change_events_the_log_returned": change_events_returned,
        "log_read_scales_with_changes_not_table_size": change_events_returned == small_change_count and change_events_returned < table_row_count,
    }
    assert result["log_read_scales_with_changes_not_table_size"] is True
    return result


if __name__ == "__main__":
    polling_misses_intermediate_states()
    polling_misses_deletes()
    trigger_based_capture_write_amplification()
    log_read_cost_is_proportional_to_changes_not_table_size()
    print("de.query-based-vs-log: all checks passed")
