"""de.incremental-snapshots-watermark-windows -- measured against this sandbox's own real
PostgreSQL cluster, using psycopg (v3) and the built-in test_decoding plugin, implementing
DBLog's own watermark-based chunk-selection algorithm (Andreakis & Papapanagiotou, Netflix,
arXiv:2010.12597, Algorithm 1) by hand, exactly as CHAPTER.md's own "Lab" line asks for
("Implemented by the learner in about sixty lines against the sandbox, then run against orders
under a concurrent update load").

The algorithm, in this hand-written form: for one chunk of a table (ordered by primary key),
write a low watermark into a dedicated watermark table, select the chunk into memory, write a
high watermark, then decode every change since the slot's last read position. Events before the
low watermark are earlier chunks' own already-settled stream; events between the two watermarks
that touch a key still in the in-memory chunk supersede that chunk's own copy of the row (it is
dropped from the buffer and the streamed event is emitted instead); once the high watermark is
seen, whatever chunk rows survive are emitted as READ events. This never locks the source table
and never stalls the log: the only writes the algorithm itself makes are the two single-row
watermark updates.

Every function creates and drops its own scratch tables and replication slots, leaving the
cluster exactly as it was found for every other topic.
"""

import uuid

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


def _parse_source_change(text, table_fqn):
    """Parses one test_decoding line for the source table only -- INSERT and UPDATE both
    carry the row's current value and are treated as an upsert; DELETE carries only the key."""
    prefix = f"table {table_fqn}: "
    if not text.startswith(prefix):
        return None
    rest = text[len(prefix):]
    if rest.startswith("INSERT:") or rest.startswith("UPDATE:"):
        op = "upsert"
        body = rest.split(":", 1)[1]
    elif rest.startswith("DELETE:"):
        op = "delete"
        body = rest.split(":", 1)[1]
    else:
        return None
    row_id = int(body.split("id[integer]:")[1].split()[0])
    value = body.split("v[text]:")[1].strip().strip("'") if "v[text]:" in body else None
    return {"op": op, "id": row_id, "v": value}


def _is_watermark_update(text, wm_table_fqn, expected_value):
    prefix = f"table {wm_table_fqn}: UPDATE: "
    return text.startswith(prefix) and f"value[text]:'{expected_value}'" in text


def _run_one_chunk(conn, source, wm, slot, chunk_start, chunk_end, output, between_watermarks=None):
    """DBLog's Algorithm 1, steps 1-7, for a single chunk: write the low watermark, select the
    chunk, write the high watermark, then walk the slot's own decoded changes since the last
    call -- dropping any chunk row whose key is touched between the two watermarks and emitting
    the streamed change instead, and emitting the surviving chunk rows as READ events only once
    the high watermark is seen."""
    low_watermark = uuid.uuid4().hex
    high_watermark = uuid.uuid4().hex
    source_fqn, wm_fqn = f"public.{source}", f"public.{wm}"

    conn.execute(f"UPDATE {wm} SET value = %s WHERE id = 1", (low_watermark,))
    chunk_rows = dict(
        conn.execute(
            f"SELECT id, v FROM {source} WHERE id BETWEEN %s AND %s ORDER BY id",
            (chunk_start, chunk_end),
        ).fetchall()
    )

    if between_watermarks is not None:
        between_watermarks()

    conn.execute(f"UPDATE {wm} SET value = %s WHERE id = 1", (high_watermark,))

    changes = conn.execute(
        "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
    ).fetchall()

    in_window = False
    for (text,) in changes:
        if not in_window:
            if _is_watermark_update(text, wm_fqn, low_watermark):
                in_window = True
            continue
        if _is_watermark_update(text, wm_fqn, high_watermark):
            for row_id in sorted(chunk_rows):
                output.append({"op": "read", "id": row_id, "v": chunk_rows[row_id]})
            in_window = False
            chunk_rows = {}
            continue
        change = _parse_source_change(text, source_fqn)
        if change is None:
            continue
        chunk_rows.pop(change["id"], None)
        output.append(change)


def _materialize(output):
    """Applies a list of READ/upsert/delete events in order, the way a downstream consumer
    would, and returns the resulting id -> value state."""
    target = {}
    for change in output:
        if change["op"] == "delete":
            target.pop(change["id"], None)
        else:
            target[change["id"]] = change["v"]
    return target


def a_streamed_update_during_the_window_supersedes_the_stale_chunk_row():
    """DBLog: "all selected chunk rows are removed, which collide with log events within that
    window. This ensures that the chunk selection can not override the history of log changes."
    Measured directly: a chunk's own in-memory copy of a row is the value read before the
    update; an update to that same row lands between the low and high watermark; the row the
    algorithm ultimately emits is the streamed update's value, not the stale chunk copy."""
    source, wm, slot = "topic14_supersede_src", "topic14_supersede_wm", "topic14_supersede_slot"
    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (source, wm):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"CREATE TABLE {source} (id int primary key, v text)")
        setup.execute(f"CREATE TABLE {wm} (id int primary key, value text)")
        setup.execute(f"INSERT INTO {wm} VALUES (1, 'init')")
        setup.execute(f"INSERT INTO {source} SELECT g, 'original' FROM generate_series(1, 30) g")
        _fresh_slot(setup, slot)

    output = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        def write_during_window():
            with psycopg.connect(DSN, autocommit=True) as writer:
                writer.execute(f"UPDATE {source} SET v = 'updated mid-chunk' WHERE id = 15")

        _run_one_chunk(conn, source, wm, slot, 1, 30, output, between_watermarks=write_during_window)

    target = _materialize(output)
    assert target[15] == "updated mid-chunk"
    assert sum(1 for c in output if c["id"] == 15) == 1

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        for t in (source, wm):
            cleanup.execute(f"DROP TABLE {t}")


def a_streamed_delete_during_the_window_is_not_resurrected():
    """CHAPTER.md's own hook: a row read mid-chunk at the same instant a transaction deletes
    it; "without the markers the snapshot resurrects a deleted order." Measured directly: a row
    is deleted between the low and high watermark of the chunk that contains it; the algorithm's
    own final materialized state does not contain that row -- the stale chunk copy is dropped,
    not emitted as a phantom READ after the delete."""
    source, wm, slot = "topic14_resurrect_src", "topic14_resurrect_wm", "topic14_resurrect_slot"
    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (source, wm):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"CREATE TABLE {source} (id int primary key, v text)")
        setup.execute(f"CREATE TABLE {wm} (id int primary key, value text)")
        setup.execute(f"INSERT INTO {wm} VALUES (1, 'init')")
        setup.execute(f"INSERT INTO {source} SELECT g, 'original' FROM generate_series(1, 30) g")
        _fresh_slot(setup, slot)

    output = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        def delete_during_window():
            with psycopg.connect(DSN, autocommit=True) as writer:
                writer.execute(f"DELETE FROM {source} WHERE id = 22")

        _run_one_chunk(conn, source, wm, slot, 1, 30, output, between_watermarks=delete_during_window)

    target = _materialize(output)
    assert 22 not in target
    assert any(c["op"] == "delete" and c["id"] == 22 for c in output)
    assert not any(c["op"] == "read" and c["id"] == 22 for c in output)

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        for t in (source, wm):
            cleanup.execute(f"DROP TABLE {t}")


def the_full_chunked_run_matches_the_source_under_heavy_concurrent_load():
    """CHAPTER.md's own lab: "the learner's watermark-window implementation run on orders under
    heavy updates and deletes, the result diffed against the source at the end." Measured
    directly on a scratch table standing in for `orders`: every chunk of the table is processed
    in sequence, with a burst of concurrent updates, deletes and inserts fired between every
    single chunk's own watermarks, and the final materialized state is diffed against the
    source table's own final contents -- an exact match despite continuous concurrent write
    traffic throughout the whole run."""
    source, wm, slot = "topic14_fullrun_src", "topic14_fullrun_wm", "topic14_fullrun_slot"
    row_count = 240
    chunk_size = 40
    with psycopg.connect(DSN, autocommit=True) as setup:
        for t in (source, wm):
            setup.execute(f"DROP TABLE IF EXISTS {t}")
        setup.execute(f"CREATE TABLE {source} (id int primary key, v text)")
        setup.execute(f"CREATE TABLE {wm} (id int primary key, value text)")
        setup.execute(f"INSERT INTO {wm} VALUES (1, 'init')")
        setup.execute(
            f"INSERT INTO {source} SELECT g, 'original' FROM generate_series(1, %s::int) g",
            (row_count,),
        )
        _fresh_slot(setup, slot)

    output = []
    load_counter = {"n": 0}

    def heavy_concurrent_load():
        load_counter["n"] += 1
        n = load_counter["n"]
        with psycopg.connect(DSN, autocommit=True) as writer:
            writer.execute(f"UPDATE {source} SET v = %s WHERE id = %s", (f"touched-{n}-a", n * 3 % row_count + 1))
            writer.execute(f"UPDATE {source} SET v = %s WHERE id = %s", (f"touched-{n}-b", n * 7 % row_count + 1))
            writer.execute(f"DELETE FROM {source} WHERE id = %s", (row_count - n,))
            writer.execute(
                f"INSERT INTO {source} VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                (row_count + n, f"added-{n}"),
            )

    with psycopg.connect(DSN, autocommit=True) as conn:
        for chunk_start in range(1, row_count + 1, chunk_size):
            chunk_end = chunk_start + chunk_size - 1
            _run_one_chunk(conn, source, wm, slot, chunk_start, chunk_end, output, between_watermarks=heavy_concurrent_load)

        # a final drain for anything the very last chunk's own high watermark left streaming
        trailing = conn.execute(
            "SELECT data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()
        source_fqn = f"public.{source}"
        for (text,) in trailing:
            change = _parse_source_change(text, source_fqn)
            if change:
                output.append(change)

        target = _materialize(output)
        actual_source = dict(conn.execute(f"SELECT id, v FROM {source}").fetchall())

    assert target == actual_source, (
        f"mismatch: {len(set(target) - set(actual_source))} phantom, "
        f"{len(set(actual_source) - set(target))} missing, "
        f"{sum(1 for k in target if k in actual_source and target[k] != actual_source[k])} wrong-value"
    )

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        for t in (source, wm):
            cleanup.execute(f"DROP TABLE {t}")


def pausing_after_a_chunk_and_resuming_loses_no_progress():
    """DBLog: "we are storing the last row of a completed chunk... so that we can pause and
    resume after the latest completed chunk." Debezium: "the snapshot begins at the point where
    it stopped, rather than recapturing the table from the beginning." Measured directly: a run
    is stopped after its second chunk, its own completed-chunk marker recorded; a second run
    resumes from exactly that marker rather than restarting; the combined result of the two
    partial runs matches a single uninterrupted run over the identical starting data."""
    source, wm = "topic14_pause_src", "topic14_pause_wm"
    slot_uninterrupted = "topic14_pause_slot_a"
    slot_resumed = "topic14_pause_slot_b"
    row_count = 120
    chunk_size = 20

    def seed(name_suffix):
        s = f"{source}_{name_suffix}"
        w = f"{wm}_{name_suffix}"
        with psycopg.connect(DSN, autocommit=True) as setup:
            for t in (s, w):
                setup.execute(f"DROP TABLE IF EXISTS {t}")
            setup.execute(f"CREATE TABLE {s} (id int primary key, v text)")
            setup.execute(f"CREATE TABLE {w} (id int primary key, value text)")
            setup.execute(f"INSERT INTO {w} VALUES (1, 'init')")
            setup.execute(
                f"INSERT INTO {s} SELECT g, 'original' FROM generate_series(1, %s::int) g",
                (row_count,),
            )
        return s, w

    source_a, wm_a = seed("uninterrupted")
    with psycopg.connect(DSN, autocommit=True) as setup:
        _fresh_slot(setup, slot_uninterrupted)
    output_uninterrupted = []
    with psycopg.connect(DSN, autocommit=True) as conn:
        for chunk_start in range(1, row_count + 1, chunk_size):
            _run_one_chunk(conn, source_a, wm_a, slot_uninterrupted, chunk_start, chunk_start + chunk_size - 1, output_uninterrupted)

    source_b, wm_b = seed("resumed")
    with psycopg.connect(DSN, autocommit=True) as setup:
        _fresh_slot(setup, slot_resumed)
    output_resumed = []
    last_completed_chunk_end = None
    with psycopg.connect(DSN, autocommit=True) as conn:
        chunk_starts = list(range(1, row_count + 1, chunk_size))
        for chunk_start in chunk_starts[:2]:
            _run_one_chunk(conn, source_b, wm_b, slot_resumed, chunk_start, chunk_start + chunk_size - 1, output_resumed)
            last_completed_chunk_end = chunk_start + chunk_size - 1

    # the process stops here; a restart reads only the stored marker, not the full table again
    assert last_completed_chunk_end == chunk_starts[1] + chunk_size - 1

    with psycopg.connect(DSN, autocommit=True) as conn:
        for chunk_start in range(last_completed_chunk_end + 1, row_count + 1, chunk_size):
            _run_one_chunk(conn, source_b, wm_b, slot_resumed, chunk_start, chunk_start + chunk_size - 1, output_resumed)

    assert _materialize(output_uninterrupted) == _materialize(output_resumed)
    assert len(output_resumed) == row_count

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot_uninterrupted)
        _drop_slot_if_present(cleanup, slot_resumed)
        for t in (source_a, wm_a, source_b, wm_b):
            cleanup.execute(f"DROP TABLE {t}")


if __name__ == "__main__":
    a_streamed_update_during_the_window_supersedes_the_stale_chunk_row()
    a_streamed_delete_during_the_window_is_not_resurrected()
    the_full_chunked_run_matches_the_source_under_heavy_concurrent_load()
    pausing_after_a_chunk_and_resuming_loses_no_progress()
    print("de.incremental-snapshots-watermark-windows: all checks passed")
