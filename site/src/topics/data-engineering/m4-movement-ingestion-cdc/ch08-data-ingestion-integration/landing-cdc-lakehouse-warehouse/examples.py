"""de.landing-cdc-lakehouse-warehouse -- measured against this sandbox's own real PostgreSQL
cluster for the change stream (psycopg v3, a real logical replication slot, the built-in
test_decoding plugin, exactly the pattern topics 10-19 of this chapter use directly), landed
into a real DuckDB database for the table side.

CHAPTER.md's own "Lab" line: "the change stream of topic 13's snapshot-and-stream loop landed
by append-then-MERGE and by streaming upsert (on Chapter 6's table-format library if live, else
on DuckDB, disclosed)... The full Postgres, Debezium, Kafka, Iceberg chain is sourced-only
without a JVM and broker; the Postgres-to-table half is run." Chapter 6's own table-format ids
(`merge-statement`, `lakehouse-merge-rewrite`) are introduced by a live topic
(`de.merge-upsert-concurrent-writers`) that itself runs on SQLite, not a real lakehouse table
format (Iceberg/Paimon) -- this sandbox has no JVM and no `pyiceberg`, confirmed by a direct
import check before writing this file. So this topic's own landing lab runs on a real DuckDB
database instead, disclosed here and in SOURCES.md/REVIEW.md: DuckDB's own MERGE INTO statement
(real DuckDB 2.x syntax, run for real, not simulated) stands in for a lakehouse's periodic
MERGE, and a hand-built data-file/delete-marker pair of tables stands in for a merge-on-read
table's own file layout, since no actual Iceberg/Paimon delete-file format is available here.

Every function creates and drops its own scratch Postgres tables and replication slots, and its
own scratch DuckDB tables, leaving both engines exactly as found for every other topic.
"""

import psycopg
import duckdb

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def _drop_slot_if_present(conn, slot_name):
    conn.execute(
        "SELECT pg_drop_replication_slot(%s) FROM pg_replication_slots WHERE slot_name = %s",
        (slot_name, slot_name),
    )


def _lsn_to_int(lsn_text):
    """Postgres prints a pg_lsn as 'HEX/HEX' (protocol-replication.html's own examples use this
    form). Converted to a single comparable integer -- the ordering this topic's own landing
    logic sorts and compares by, never by when an event happened to arrive."""
    hi, lo = lsn_text.split("/")
    return (int(hi, 16) << 32) + int(lo, 16)


def _produce_change_stream(table, slot, ops):
    """Creates a scratch Postgres table, applies a real sequence of (op, key, value) tuples to
    it (op is 'insert', 'update' or 'delete'), and decodes the resulting change stream through a
    real logical replication slot. Returns a list of (lsn_int, op, key, value) in true commit
    (LSN) order -- the order the source itself produced them in, which this topic's own lab
    deliberately feeds to the lander out of that order to prove the LSN tiebreak."""
    with psycopg.connect(DSN, autocommit=True) as setup:
        _drop_slot_if_present(setup, slot)
        setup.execute(f"DROP TABLE IF EXISTS {table}")
        setup.execute(f"CREATE TABLE {table} (id int primary key, v text)")
        setup.execute(f"ALTER TABLE {table} REPLICA IDENTITY FULL")
        setup.execute(
            f"SELECT pg_create_logical_replication_slot('{slot}', 'test_decoding')"
        )

    with psycopg.connect(DSN, autocommit=True) as writer:
        for op, key, value in ops:
            if op == "insert":
                writer.execute(f"INSERT INTO {table} VALUES (%s, %s)", (key, value))
            elif op == "update":
                writer.execute(f"UPDATE {table} SET v = %s WHERE id = %s", (value, key))
            elif op == "delete":
                writer.execute(f"DELETE FROM {table} WHERE id = %s", (key,))

    with psycopg.connect(DSN, autocommit=True) as reader:
        rows = reader.execute(
            "SELECT lsn, data FROM pg_logical_slot_get_changes(%s, NULL, NULL)", (slot,)
        ).fetchall()

    row_prefix = f"table public.{table}: "
    events = []
    for lsn_text, text in rows:
        if not text.startswith(row_prefix):
            continue  # skip BEGIN/COMMIT lines, which are not table-change rows
        body = text[len(row_prefix):]
        if body.startswith("INSERT: "):
            key = int(body.split("id[integer]:")[1].split()[0])
            value = body.split("v[text]:")[1].strip().strip("'")
            events.append((_lsn_to_int(lsn_text), "insert", key, value))
        elif body.startswith("UPDATE: "):
            # REPLICA IDENTITY FULL prints "old-key: ... new-tuple: id[integer]:K v[text]:'V'";
            # the row's new state is the part after "new-tuple: ", not the old-key part.
            new_tuple = body.split("new-tuple: ")[1]
            key = int(new_tuple.split("id[integer]:")[1].split()[0])
            value = new_tuple.split("v[text]:")[1].strip().strip("'")
            events.append((_lsn_to_int(lsn_text), "update", key, value))
        elif body.startswith("DELETE: "):
            key = int(body.split("id[integer]:")[1].split()[0])
            events.append((_lsn_to_int(lsn_text), "delete", key, None))

    with psycopg.connect(DSN, autocommit=True) as cleanup:
        _drop_slot_if_present(cleanup, slot)
        cleanup.execute(f"DROP TABLE {table}")

    return events


def append_then_periodic_merge_lands_the_real_change_stream_in_a_current_state_table():
    """CHAPTER.md: "land every change event in an append-only table..., then every N minutes
    MERGE the latest change per key into the current-state table." Measured directly: a real
    change stream (two inserts, one update, one delete) is appended into a DuckDB append-only
    raw table exactly as decoded, then a real DuckDB MERGE INTO statement -- picking, per key,
    the row with the greatest LSN, matching CHAPTER.md's own tiebreak -- lands the current-state
    table. The result is checked against the source table's own final rows."""
    events = _produce_change_stream(
        "topic22_raw",
        "topic22_append_merge_slot",
        [
            ("insert", 1, "a"),
            ("insert", 2, "b"),
            ("update", 1, "a-updated"),
            ("delete", 2, None),
        ],
    )
    assert len(events) == 4

    con = duckdb.connect()
    con.execute("CREATE TABLE raw_log (lsn BIGINT, op TEXT, key INT, value TEXT)")
    con.execute("CREATE TABLE current_state (key INT PRIMARY KEY, value TEXT, lsn BIGINT)")
    con.executemany("INSERT INTO raw_log VALUES (?, ?, ?, ?)", events)

    con.execute(
        """
        MERGE INTO current_state AS t
        USING (
            SELECT key, value, op, lsn FROM (
                SELECT *, row_number() OVER (PARTITION BY key ORDER BY lsn DESC) AS rn
                FROM raw_log
            ) WHERE rn = 1
        ) AS s
        ON t.key = s.key
        WHEN MATCHED AND s.op = 'delete' THEN DELETE
        WHEN MATCHED AND s.lsn > t.lsn THEN UPDATE SET value = s.value, lsn = s.lsn
        WHEN NOT MATCHED AND s.op != 'delete' THEN INSERT VALUES (s.key, s.value, s.lsn)
        """
    )

    result = con.execute("SELECT key, value FROM current_state ORDER BY key").fetchall()
    assert result == [(1, "a-updated")], result
    con.close()


def streaming_upserts_write_a_delete_marker_and_a_data_file_and_read_merges_them_until_compaction():
    """CHAPTER.md: "write each change as a delete file and a data file... so the table is
    current within seconds, at the price of read-time merging until compaction." Measured
    directly: each event is written as a new row into a data-file table plus, for an update or
    delete, a delete-marker row naming the specific prior (key, lsn) it supersedes -- read-time
    merging (a query that excludes superseded rows via an anti-join) sees the correct current
    value immediately after each write, with zero wait for any periodic job. A real compaction
    step then physically rewrites the data-file table to drop every superseded row and empties
    the delete-marker table, after which the same read-time merge and a plain scan agree."""
    events = _produce_change_stream(
        "topic22_mor",
        "topic22_mor_slot",
        [
            ("insert", 1, "a"),
            ("insert", 2, "b"),
            ("update", 1, "a-updated"),
        ],
    )
    assert len(events) == 3

    con = duckdb.connect()
    con.execute("CREATE TABLE data_files (lsn BIGINT, key INT, value TEXT)")
    con.execute("CREATE TABLE delete_markers (superseded_key INT, superseded_lsn BIGINT)")

    seen_lsn_for_key = {}
    for lsn, op, key, value in events:
        if op == "update" and key in seen_lsn_for_key:
            con.execute(
                "INSERT INTO delete_markers VALUES (?, ?)", (key, seen_lsn_for_key[key])
            )
        if op != "delete":
            con.execute("INSERT INTO data_files VALUES (?, ?, ?)", (lsn, key, value))
            seen_lsn_for_key[key] = lsn

        current = con.execute(
            """
            SELECT d.key, d.value FROM data_files d
            LEFT JOIN delete_markers m ON d.key = m.superseded_key AND d.lsn = m.superseded_lsn
            WHERE m.superseded_key IS NULL AND d.key = ?
            """,
            (key,),
        ).fetchall()
        if op != "delete":
            assert current == [(key, value)], f"read-time merge saw stale value: {current}"

    pre_compaction_rows = con.execute("SELECT count(*) FROM data_files").fetchone()[0]
    assert pre_compaction_rows == 3  # two inserts plus one superseded insert still on disk

    con.execute(
        """
        CREATE TABLE compacted AS
        SELECT d.key, d.value FROM data_files d
        LEFT JOIN delete_markers m ON d.key = m.superseded_key AND d.lsn = m.superseded_lsn
        WHERE m.superseded_key IS NULL
        """
    )
    con.execute("DROP TABLE data_files")
    con.execute("ALTER TABLE compacted RENAME TO data_files")
    con.execute("DELETE FROM delete_markers")

    post_compaction_rows = con.execute("SELECT count(*) FROM data_files").fetchone()[0]
    assert post_compaction_rows == 2, "compaction must rewrite away the superseded row"
    plain_scan = con.execute("SELECT key, value FROM data_files ORDER BY key").fetchall()
    assert plain_scan == [(1, "a-updated"), (2, "b")]
    con.close()


def the_merge_takes_the_winner_by_lsn_so_replaying_the_same_events_in_reverse_still_converges():
    """CHAPTER.md: "within a key the winner of two changes is the one with the greater source
    position (LSN)... never the later arrival... an older event never overwrites a newer row
    (shown with a replay in reverse order giving the same answer)." Measured directly: the same
    four real decoded events are fed to a fresh LSN-ordered MERGE twice -- once in their true,
    ascending-LSN order and once in deliberately reversed order -- and both runs converge on the
    identical final table, because the MERGE's own WHEN MATCHED clause compares LSNs rather than
    trusting arrival order. A third run that merges naively by arrival order, with no LSN
    comparison, is shown to land the wrong (older) value whenever the reversed order is fed to
    it -- exactly the Hook's own failure."""
    events = _produce_change_stream(
        "topic22_convergence",
        "topic22_convergence_slot",
        [
            ("insert", 1, "v1"),
            ("update", 1, "v2"),
            ("update", 1, "v3"),
        ],
    )
    assert len(events) == 3
    reversed_events = list(reversed(events))

    def land_with_lsn_tiebreak(ordered_events):
        con = duckdb.connect()
        con.execute("CREATE TABLE current_state (key INT PRIMARY KEY, value TEXT, lsn BIGINT)")
        for lsn, op, key, value in ordered_events:
            con.execute(
                """
                MERGE INTO current_state AS t
                USING (SELECT ? AS key, ? AS value, ? AS lsn) AS s
                ON t.key = s.key
                WHEN MATCHED AND s.lsn > t.lsn THEN UPDATE SET value = s.value, lsn = s.lsn
                WHEN NOT MATCHED THEN INSERT VALUES (s.key, s.value, s.lsn)
                """,
                (key, value, lsn),
            )
        result = con.execute("SELECT key, value FROM current_state").fetchall()
        con.close()
        return result

    forward_result = land_with_lsn_tiebreak(events)
    reversed_result = land_with_lsn_tiebreak(reversed_events)
    assert forward_result == [(1, "v3")]
    assert reversed_result == [(1, "v3")]
    assert forward_result == reversed_result

    def land_naively_by_arrival_order(ordered_events):
        con = duckdb.connect()
        con.execute("CREATE TABLE current_state (key INT PRIMARY KEY, value TEXT)")
        for _lsn, op, key, value in ordered_events:
            con.execute(
                """
                MERGE INTO current_state AS t
                USING (SELECT ? AS key, ? AS value) AS s
                ON t.key = s.key
                WHEN MATCHED THEN UPDATE SET value = s.value
                WHEN NOT MATCHED THEN INSERT VALUES (s.key, s.value)
                """,
                (key, value),
            )
        result = con.execute("SELECT key, value FROM current_state").fetchall()
        con.close()
        return result

    naive_reversed_result = land_naively_by_arrival_order(reversed_events)
    assert naive_reversed_result == [(1, "v1")], naive_reversed_result
    assert naive_reversed_result != forward_result


def a_high_update_rate_produces_proportionally_more_superseded_rows_for_compaction_to_rewrite():
    """CHAPTER.md: "a table whose rows change many times a day produces delete files or
    rewritten files in proportion to update rate... the break-even between the two strategies
    measured on the shop's orders at two update rates." Measured directly: the same 20 keys are
    each updated once (low update rate) and the same 20 keys are each updated 5 times (high
    update rate); the streaming-upsert (merge-on-read) landing's own pre-compaction row count
    grows proportionally with the update count, so compaction has proportionally more superseded
    rows to rewrite away, while the append-then-periodic-merge landing's own current-state table
    always ends at exactly 20 rows regardless of update rate -- only its append-only raw log
    grows with update count, never the table a read actually scans."""

    def measure(update_count_per_key):
        ops = []
        for key in range(1, 21):
            ops.append(("insert", key, "v0"))
            for i in range(1, update_count_per_key + 1):
                ops.append(("update", key, f"v{i}"))
        events = _produce_change_stream(
            f"topic22_rate_{update_count_per_key}",
            f"topic22_rate_slot_{update_count_per_key}",
            ops,
        )

        con = duckdb.connect()
        con.execute("CREATE TABLE raw_log (lsn BIGINT, op TEXT, key INT, value TEXT)")
        con.execute("CREATE TABLE current_state (key INT PRIMARY KEY, value TEXT, lsn BIGINT)")
        con.execute("CREATE TABLE data_files (lsn BIGINT, key INT, value TEXT)")
        con.executemany("INSERT INTO raw_log VALUES (?, ?, ?, ?)", events)
        con.executemany(
            "INSERT INTO data_files VALUES (?, ?, ?)",
            [(lsn, key, value) for lsn, op, key, value in events],
        )

        con.execute(
            """
            MERGE INTO current_state AS t
            USING (
                SELECT key, value, lsn FROM (
                    SELECT *, row_number() OVER (PARTITION BY key ORDER BY lsn DESC) AS rn
                    FROM raw_log
                ) WHERE rn = 1
            ) AS s
            ON t.key = s.key
            WHEN MATCHED AND s.lsn > t.lsn THEN UPDATE SET value = s.value, lsn = s.lsn
            WHEN NOT MATCHED THEN INSERT VALUES (s.key, s.value, s.lsn)
            """
        )
        current_state_rows = con.execute("SELECT count(*) FROM current_state").fetchone()[0]
        data_file_rows_before_compaction = con.execute(
            "SELECT count(*) FROM data_files"
        ).fetchone()[0]
        superseded_rows = data_file_rows_before_compaction - current_state_rows
        con.close()
        return current_state_rows, superseded_rows

    low_current, low_superseded = measure(update_count_per_key=1)
    high_current, high_superseded = measure(update_count_per_key=5)

    assert low_current == 20 and high_current == 20, "final key count never depends on rate"
    assert low_superseded == 20  # 20 keys x 1 update each = 20 superseded inserts
    assert high_superseded == 100  # 20 keys x 5 updates each = 100 superseded rows
    assert high_superseded == 5 * low_superseded, "compaction cost scales with update rate"


if __name__ == "__main__":
    append_then_periodic_merge_lands_the_real_change_stream_in_a_current_state_table()
    streaming_upserts_write_a_delete_marker_and_a_data_file_and_read_merges_them_until_compaction()
    the_merge_takes_the_winner_by_lsn_so_replaying_the_same_events_in_reverse_still_converges()
    a_high_update_rate_produces_proportionally_more_superseded_rows_for_compaction_to_rewrite()
    print("de.landing-cdc-lakehouse-warehouse: all checks passed")
