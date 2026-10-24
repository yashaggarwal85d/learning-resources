"""
Real measurements against this sandbox's own PostgreSQL cluster (database `learnshop`), using
the `pageinspect` extension to read a real heap page's own tuples directly, and two real
connections to observe snapshot isolation rather than diagram it.

InnoDB's and Oracle's own undo-log mechanics are sourced directly from their own documentation
(quoted and discussed in SOURCES.md and FACT-CHECK.md) rather than reproduced as a live
measurement: this sandbox has no InnoDB or Oracle engine to measure directly.
"""

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")

N_REPEATED_UPDATES = 2_000


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS pageinspect")
    return conn, cur


def update_creates_a_new_heap_tuple(cur):
    cur.execute("DROP TABLE IF EXISTS mvcc_tuple_demo")
    cur.execute("CREATE TABLE mvcc_tuple_demo (id int PRIMARY KEY, val text) WITH (autovacuum_enabled = off)")
    cur.execute("INSERT INTO mvcc_tuple_demo VALUES (1, 'before')")
    cur.execute("UPDATE mvcc_tuple_demo SET val = 'after' WHERE id = 1")

    cur.execute(
        "SELECT lp, t_xmin, t_xmax, t_ctid FROM heap_page_items(get_raw_page('mvcc_tuple_demo', 0)) "
        "WHERE t_xmin IS NOT NULL ORDER BY lp"
    )
    rows = cur.fetchall()
    cur.execute("DROP TABLE mvcc_tuple_demo")
    return rows


def repeated_updates_grow_the_table_before_reclaim(cur):
    # val is indexed and changes on every update, so Postgres's own HOT optimization (which can
    # reuse a page's own dead space in place when no indexed column changes) can't apply here:
    # every update must write a new heap tuple and a new index entry, exactly what this topic's
    # own claim is about. (HOT itself is the next topic's own subject, not retaught here.)
    cur.execute("DROP TABLE IF EXISTS mvcc_growth_demo")
    cur.execute("CREATE TABLE mvcc_growth_demo (id int PRIMARY KEY, val text) WITH (autovacuum_enabled = off)")
    cur.execute("CREATE INDEX mvcc_growth_val_idx ON mvcc_growth_demo (val)")
    cur.execute("INSERT INTO mvcc_growth_demo VALUES (1, 'v0')")

    cur.execute("SELECT pg_total_relation_size('mvcc_growth_demo') / current_setting('block_size')::int")
    (pages_before,) = cur.fetchone()

    for i in range(N_REPEATED_UPDATES):
        cur.execute("UPDATE mvcc_growth_demo SET val = %s WHERE id = 1", (f"v{i + 1}",))

    cur.execute("SELECT pg_total_relation_size('mvcc_growth_demo') / current_setting('block_size')::int")
    (pages_after,) = cur.fetchone()

    cur.execute("DROP TABLE mvcc_growth_demo")
    return int(pages_before), int(pages_after)


def concurrent_reader_is_never_blocked_by_a_committed_write():
    conn_a = psycopg2.connect(**DSN)
    conn_a.autocommit = False
    cur_a = conn_a.cursor()

    conn_b = psycopg2.connect(**DSN)
    conn_b.autocommit = True
    cur_b = conn_b.cursor()

    try:
        cur_b.execute("DROP TABLE IF EXISTS mvcc_snapshot_demo")
        cur_b.execute("CREATE TABLE mvcc_snapshot_demo (id int PRIMARY KEY, val text)")
        cur_b.execute("INSERT INTO mvcc_snapshot_demo VALUES (1, 'first')")

        cur_a.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
        cur_a.execute("SELECT val FROM mvcc_snapshot_demo WHERE id = 1")
        (read_before_concurrent_commit,) = cur_a.fetchone()

        # A second, independent connection updates and commits the same row while A's
        # transaction is still open.
        cur_b.execute("UPDATE mvcc_snapshot_demo SET val = 'second' WHERE id = 1")

        cur_a.execute("SELECT val FROM mvcc_snapshot_demo WHERE id = 1")
        (read_after_concurrent_commit,) = cur_a.fetchone()

        conn_a.commit()

        cur_a.execute("SELECT val FROM mvcc_snapshot_demo WHERE id = 1")
        (read_after_own_commit,) = cur_a.fetchone()
        conn_a.commit()  # close the new implicit transaction this last read opened, or it would block B's DROP below

        cur_b.execute("DROP TABLE mvcc_snapshot_demo")
        return read_before_concurrent_commit, read_after_concurrent_commit, read_after_own_commit
    finally:
        cur_a.close()
        conn_a.close()
        cur_b.close()
        conn_b.close()


def main():
    conn, cur = connect()
    try:
        rows = update_creates_a_new_heap_tuple(cur)
        print(f"after one UPDATE: {len(rows)} heap tuple(s) present on the page: {rows}")
        assert len(rows) == 2, f"expected exactly 2 heap tuples (old + new) on the page after one update, got {len(rows)}"
        (old_lp, old_xmin, old_xmax, old_ctid), (new_lp, new_xmin, new_xmax, new_ctid) = rows
        assert old_xmax == new_xmin, (
            f"expected the old tuple's xmax to equal the new tuple's xmin (the same updating transaction), "
            f"got old_xmax={old_xmax}, new_xmin={new_xmin}"
        )
        expected_ctid = f"(0,{new_lp})"
        assert old_ctid == expected_ctid, (
            f"expected the old tuple's own ctid to forward to the new tuple's own location {expected_ctid}, got {old_ctid}"
        )

        pages_before, pages_after = repeated_updates_grow_the_table_before_reclaim(cur)
        growth = pages_after - pages_before
        print(f"{N_REPEATED_UPDATES} indexed-column updates to one row, no vacuum: table+index grew from {pages_before} to {pages_after} pages (+{growth})")
        assert growth > 0, f"expected real page growth from {N_REPEATED_UPDATES} un-vacuumed, non-HOT updates, got {growth}"

        before, during, after = concurrent_reader_is_never_blocked_by_a_committed_write()
        print(f"open REPEATABLE READ transaction: read '{before}' before a concurrent commit, '{during}' after it (unblocked); '{after}' once its own snapshot is new")
        assert before == during == "first", f"expected the open transaction's reads to stay unchanged by the concurrent commit, got before={before!r}, during={during!r}"
        assert after == "second", f"expected a fresh snapshot after the open transaction's own commit to see the concurrent update, got {after!r}"
    finally:
        cur.close()
        conn.close()
    print("mvcc-append-versions-vs examples: all checks pass")


if __name__ == "__main__":
    main()
