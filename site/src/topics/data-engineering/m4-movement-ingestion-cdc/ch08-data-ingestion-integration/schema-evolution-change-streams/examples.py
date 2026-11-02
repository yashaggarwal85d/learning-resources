"""de.schema-evolution-change-streams -- measured against this sandbox's own real PostgreSQL
cluster, using psycopg (v3), the built-in test_decoding plugin, and a real DuckDB sink. Every
ALTER statement here runs in its own autocommit transaction so its own BEGIN/COMMIT pair in the
decoded stream can be inspected directly: confirmed before writing any content that an ALTER
produces an empty BEGIN/COMMIT with zero row events, since PostgreSQL's own logical decoding
carries no DDL event at all.

Every function creates and drops its own scratch tables, replication slots and DuckDB
connections, leaving the cluster exactly as it was found for every other topic.
"""

import re

import duckdb
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
    """Returns (op, {col: (type, value_str)}) for one decoded row-change line, or None for a
    BEGIN/COMMIT line or a line belonging to a different table. The column set and types come
    straight out of the decoded text itself, exactly as a real consumer would have to read them --
    never assumed from the table's own original shape."""
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


def adding_a_column_is_learned_only_from_the_next_row_event():
    """CHAPTER.md: PostgreSQL logical decoding does not carry DDL, so the connector learns a new
    column from the relation message on the first row event that uses it. Measured directly: the
    ALTER TABLE ... ADD COLUMN statement itself decodes to an empty BEGIN/COMMIT pair with zero
    row events -- confirming no DDL event exists at all -- and the new column appears for the
    first time only on the very next row event that actually carries it, never announced ahead of
    that moment."""
    slot = "topic16_add_column"
    table = "topic16_add_column_t"
    sink = duckdb.connect(":memory:")
    sink.execute(f"CREATE TABLE {table} (id INTEGER PRIMARY KEY, amount INTEGER)")

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (1, 1999)")
        conn.commit()

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN note text")

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (2, 2500, 'late add')")
        conn.commit()

    fqn = f"public.{table}"
    sink_columns = {"id", "amount"}
    saw_note_before_second_insert = False
    row_events = 0
    with psycopg.connect(DSN, autocommit=True) as conn:
        for text in _get_changes(conn, slot):
            change = _parse_row_change(text, fqn)
            if change is None:
                continue  # the ALTER's own transaction: a BEGIN/COMMIT with nothing inside it
            row_events += 1
            op, cols = change
            if row_events == 1:
                assert set(cols) == {"id", "amount"}
                sink.execute(f"INSERT INTO {table} VALUES (?, ?)", [int(cols["id"][1]), int(cols["amount"][1])])
            else:
                if "note" in cols:
                    saw_note_before_second_insert = True
                    sink_columns.add("note")
                    sink.execute(f"ALTER TABLE {table} ADD COLUMN note TEXT")
                    sink.execute(
                        f"INSERT INTO {table} VALUES (?, ?, ?)",
                        [int(cols["id"][1]), int(cols["amount"][1]), cols["note"][1]],
                    )

    assert row_events == 2
    assert saw_note_before_second_insert
    assert sink_columns == {"id", "amount", "note"}
    assert sink.execute(f"SELECT note FROM {table} WHERE id = 2").fetchone()[0] == "late add"

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")
    sink.close()


def a_dropped_column_leaves_the_sink_holding_an_unreachable_value():
    """CHAPTER.md: dropping a column is destructive downstream. Measured directly: a column is
    added, written once, and then dropped; every row event after the drop no longer carries that
    field at all, exactly like it never existed; a naive sink that only ever applies the columns a
    row event actually carries is left holding the old value forever, with no row event able to
    ever touch, clear or confirm it again."""
    slot = "topic16_drop_column"
    table = "topic16_drop_column_t"
    sink = duckdb.connect(":memory:")

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int, note text)")
        setup.execute(f"INSERT INTO {table} VALUES (1, 1999, 'original note')")
        _fresh_slot(setup, slot)
    sink.execute(f"CREATE TABLE {table} (id INTEGER PRIMARY KEY, amount INTEGER, note TEXT)")
    sink.execute(f"INSERT INTO {table} VALUES (1, 1999, 'original note')")

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"ALTER TABLE {table} DROP COLUMN note")

    with psycopg.connect(DSN) as conn:
        conn.execute(f"UPDATE {table} SET amount = 3000 WHERE id = 1")
        conn.commit()

    fqn = f"public.{table}"
    saw_update_without_note = False
    with psycopg.connect(DSN, autocommit=True) as conn:
        for text in _get_changes(conn, slot):
            change = _parse_row_change(text, fqn)
            if change is None:
                continue
            op, cols = change
            assert "note" not in cols
            saw_update_without_note = True
            sink.execute(f"UPDATE {table} SET amount = ? WHERE id = ?", [int(cols["amount"][1]), int(cols["id"][1])])

    assert saw_update_without_note
    row = sink.execute(f"SELECT amount, note FROM {table} WHERE id = 1").fetchone()
    assert row[0] == 3000  # the field the stream still carries did update
    assert row[1] == "original note"  # the dropped field is frozen forever at its last value

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")
    sink.close()


def a_widening_retype_round_trips_losslessly_at_an_updated_sink():
    """CHAPTER.md: a widening retype is the easy case a reader survives. Measured directly: an
    integer column is widened to a bigint that can hold a value no 32-bit integer ever could; the
    decoded stream shows the new type and the full value; a sink that widens its own column to
    match before writing stores that exact value with nothing lost."""
    slot = "topic16_widen"
    table = "topic16_widen_t"
    sink = duckdb.connect(":memory:")
    sink.execute(f"CREATE TABLE {table} (id INTEGER PRIMARY KEY, amount INTEGER)")

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    big_value = 9_000_000_000  # larger than any 32-bit integer column could ever hold

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"ALTER TABLE {table} ALTER COLUMN amount TYPE bigint")

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (1, %s)", (big_value,))
        conn.commit()

    fqn = f"public.{table}"
    seen_type = None
    with psycopg.connect(DSN, autocommit=True) as conn:
        for text in _get_changes(conn, slot):
            change = _parse_row_change(text, fqn)
            if change is None:
                continue
            op, cols = change
            seen_type = cols["amount"][0]
            sink.execute(f"ALTER TABLE {table} ALTER COLUMN amount SET DATA TYPE BIGINT")
            sink.execute(f"INSERT INTO {table} VALUES (?, ?)", [int(cols["id"][1]), int(cols["amount"][1])])

    assert seen_type == "bigint"
    assert sink.execute(f"SELECT amount FROM {table} WHERE id = 1").fetchone()[0] == big_value

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")
    sink.close()


def a_narrowing_retype_loses_precision_silently_at_an_unupdated_sink():
    """CHAPTER.md's own hook: a column retyped to carry fractional precision keeps streaming to a
    sink column that was never updated to match, and every fractional value is lost without any
    error at all. Measured directly: an integer column is retyped to numeric(12,2); the decoded
    stream shows the new type and a real fractional value; a sink deliberately left at its old
    integer type accepts the write and silently rounds the value away, with no exception raised
    anywhere."""
    slot = "topic16_narrow"
    table = "topic16_narrow_t"
    sink = duckdb.connect(":memory:")
    sink.execute(f"CREATE TABLE {table} (id INTEGER PRIMARY KEY, amount BIGINT)")  # left unupdated

    with psycopg.connect(DSN, autocommit=True) as setup:
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, amount int)")
        _fresh_slot(setup, slot)

    with psycopg.connect(DSN, autocommit=True) as conn:
        conn.execute(f"ALTER TABLE {table} ALTER COLUMN amount TYPE numeric(12,2)")

    with psycopg.connect(DSN) as conn:
        conn.execute(f"INSERT INTO {table} VALUES (1, 19.99)")
        conn.commit()

    fqn = f"public.{table}"
    seen_type = None
    seen_value = None
    with psycopg.connect(DSN, autocommit=True) as conn:
        for text in _get_changes(conn, slot):
            change = _parse_row_change(text, fqn)
            if change is None:
                continue
            op, cols = change
            seen_type, seen_value = cols["amount"]
            sink.execute(f"INSERT INTO {table} VALUES (?, ?)", [int(cols["id"][1]), float(seen_value)])

    assert seen_type == "numeric"
    assert seen_value == "19.99"
    stored = sink.execute(f"SELECT amount FROM {table} WHERE id = 1").fetchone()[0]
    assert stored == 20  # the fractional 19.99 is rounded away silently, with no error raised
    assert stored != float(seen_value)

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")
    sink.close()


if __name__ == "__main__":
    adding_a_column_is_learned_only_from_the_next_row_event()
    a_dropped_column_leaves_the_sink_holding_an_unreachable_value()
    a_widening_retype_round_trips_losslessly_at_an_updated_sink()
    a_narrowing_retype_loses_precision_silently_at_an_unupdated_sink()
    print("de.schema-evolution-change-streams: all checks passed")
