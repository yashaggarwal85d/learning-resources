# Real measurements against this sandbox's own PostgreSQL 16 cluster (started on demand), database
# `learnshop`, table `orders` (50,000 rows: 2,000 with low ids 1-2000, and 48,000 clustered into the
# high range 1,000,001-1,048,000 — a skewed key, exactly the shape a recent burst of orders leaves
# behind). Every number here is a direct measurement: a real parallel range read against the real
# skew, a real exported-and-imported `REPEATABLE READ` snapshot checked against a real concurrent
# insert, a real `COPY TO` against a real row-by-row `SELECT`, and real `pg_stat_user_tables.n_dead_tup`
# counts around a real long-held transaction and real `VACUUM` runs.

import time

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def parallel_range_extraction(num_partitions, lower_bound, upper_bound):
    """Spark's JDBC source: partitionColumn bounds set the stride, not a row filter — rows
    outside [lowerBound, upperBound) fall into the first or last partition. A clustered, skewed
    key (orders.id, almost all values near 1,048,000) sends nearly every row into one partition
    no matter how many partitions are configured."""
    stride = (upper_bound - lower_bound) // num_partitions
    conn = psycopg.connect(DSN)
    counts = []
    for i in range(num_partitions):
        lo = lower_bound + i * stride
        hi = upper_bound if i == num_partitions - 1 else lower_bound + (i + 1) * stride
        if i == 0:
            row = conn.execute("select count(*) from orders where id < %s", (hi,)).fetchone()
        elif i == num_partitions - 1:
            row = conn.execute("select count(*) from orders where id >= %s", (lo,)).fetchone()
        else:
            row = conn.execute(
                "select count(*) from orders where id >= %s and id < %s", (lo, hi)
            ).fetchone()
        counts.append(row[0])
    conn.close()
    return counts


def consistent_snapshot_export():
    """One REPEATABLE READ transaction exports its snapshot with pg_export_snapshot(); a second
    connection imports it with SET TRANSACTION SNAPSHOT and must see the same row count even
    after a third, fully separate connection commits a new row in between."""
    exporter = psycopg.connect(DSN)
    exporter.execute("begin transaction isolation level repeatable read")
    snapshot_id = exporter.execute("select pg_export_snapshot()").fetchone()[0]
    exporter_count = exporter.execute("select count(*) from orders").fetchone()[0]

    writer = psycopg.connect(DSN)
    writer.execute(
        "insert into orders (id, customer_id, status, amount) values (999999, 1, 'completed', 10.00)"
    )
    writer.commit()
    writer.close()

    importer = psycopg.connect(DSN)
    importer.execute("begin transaction isolation level repeatable read")
    importer.execute(f"set transaction snapshot '{snapshot_id}'")
    importer_count = importer.execute("select count(*) from orders").fetchone()[0]
    importer.commit()
    importer.close()
    exporter.commit()
    exporter.close()

    fresh = psycopg.connect(DSN)
    fresh_count = fresh.execute("select count(*) from orders").fetchone()[0]
    fresh.execute("delete from orders where id = 999999")
    fresh.commit()
    fresh.close()

    return {
        "exporter_sees": exporter_count,
        "importer_sees_same_snapshot": importer_count,
        "fresh_connection_after_commit": fresh_count,
    }


def copy_vs_select_throughput(trials=5):
    """A real COPY TO against a real row-by-row SELECT fetchall over the same 50,000 rows, the
    best of several trials each (both paths are fast enough here that OS page-cache noise can
    dominate a single trial)."""
    conn = psycopg.connect(DSN)

    select_times = []
    row_count = 0
    for _ in range(trials):
        t0 = time.perf_counter()
        rows = conn.execute(
            "select id, customer_id, status, amount, updated_at from orders order by id"
        ).fetchall()
        select_times.append(time.perf_counter() - t0)
        row_count = len(rows)

    copy_times = []
    for _ in range(trials):
        t0 = time.perf_counter()
        with conn.cursor().copy("copy orders to stdout") as copy:
            for _data in copy:
                pass
        copy_times.append(time.perf_counter() - t0)
    conn.rollback()
    conn.close()

    select_seconds = min(select_times)
    copy_seconds = min(copy_times)
    return {
        "row_count": row_count,
        "select_seconds": select_seconds,
        "copy_seconds": copy_seconds,
        "select_slower_by_factor": select_seconds / copy_seconds,
    }


def _dead_tuples():
    conn = psycopg.connect(DSN)
    n = conn.execute(
        "select n_dead_tup from pg_stat_user_tables where relname = 'orders'"
    ).fetchone()[0]
    conn.close()
    return n


def long_extract_blocks_vacuum():
    """A long-running REPEATABLE READ extract pins the xmin horizon (Chapter 5 topic 7's
    mechanism). While it's open, 10,000 rows get updated (old row versions become dead tuples),
    and a real VACUUM run during the open extract reclaims none of them — only after the extract
    commits does the next VACUUM bring the count back to zero."""
    settle = psycopg.connect(DSN, autocommit=True)
    settle.execute("vacuum orders")  # clear any dead tuples left by an earlier run in this script
    settle.close()
    before = _dead_tuples()

    extractor = psycopg.connect(DSN)
    extractor.execute("begin transaction isolation level repeatable read")
    extractor.execute("select count(*) from orders")  # establishes the snapshot

    writer = psycopg.connect(DSN)
    writer.execute(
        "update orders set amount = amount + 1 where id between 1000000 and 1010000"
    )
    writer.commit()
    writer.close()
    time.sleep(0.5)

    after_update = _dead_tuples()

    vacuum_while_open = psycopg.connect(DSN, autocommit=True)
    vacuum_while_open.execute("vacuum orders")
    vacuum_while_open.close()
    after_vacuum_while_extract_open = _dead_tuples()

    extractor.commit()
    extractor.close()

    vacuum_after_commit = psycopg.connect(DSN, autocommit=True)
    vacuum_after_commit.execute("vacuum orders")
    vacuum_after_commit.close()
    after_vacuum_after_commit = _dead_tuples()

    return {
        "before": before,
        "after_update": after_update,
        "after_vacuum_while_extract_still_open": after_vacuum_while_extract_open,
        "after_extract_commits_and_vacuum_runs_again": after_vacuum_after_commit,
    }


def check():
    counts = parallel_range_extraction(16, 1, 1050000)
    assert len(counts) == 16
    assert sum(counts) == 50000
    assert counts[0] == 2000  # the 2,000 low ids all land in the first partition
    assert counts[-1] == 48000  # the 48,000 clustered high ids all land in the last partition
    assert sum(counts[1:-1]) == 0  # fourteen of sixteen partitions do no work at all

    snap = consistent_snapshot_export()
    assert snap["exporter_sees"] == 50000
    assert snap["importer_sees_same_snapshot"] == 50000  # unaffected by the concurrent insert
    assert snap["fresh_connection_after_commit"] == 50001  # a later connection does see it

    throughput = copy_vs_select_throughput()
    assert throughput["row_count"] == 50000
    assert throughput["select_slower_by_factor"] > 1.2  # COPY is the faster bulk path, measured, best of several trials

    vacuum = long_extract_blocks_vacuum()
    assert vacuum["before"] == 0
    assert vacuum["after_update"] == 10000  # the 10,000 rows with id 1,000,001-1,010,000 just updated
    assert vacuum["after_vacuum_while_extract_still_open"] == vacuum["after_update"]  # VACUUM reclaims nothing while the extract's snapshot pins the horizon
    assert vacuum["after_extract_commits_and_vacuum_runs_again"] == 0  # reclaimed once nothing needs the old versions


if __name__ == "__main__":
    check()
    print("de.database-extraction-without-hurting: all checks passed")
