import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
# This sandbox also runs a second, real PostgreSQL 18 cluster (port 5433), which is where
# io_method and pg_stat_io's per-context I/O accounting actually exist.
DSN_PG18 = dict(host="127.0.0.1", port=5433, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS pg_buffercache")
    return conn, cur


def connect_pg18():
    conn = psycopg2.connect(**DSN_PG18)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'learnshop'")
    if not cur.fetchone():
        cur.execute("CREATE DATABASE learnshop")
        conn.close()
        conn = psycopg2.connect(**DSN_PG18)
        conn.autocommit = True
        cur = conn.cursor()
    return conn, cur


def small_table_stays_fully_resident(cur):
    cur.execute("DROP TABLE IF EXISTS hot_demo")
    cur.execute("CREATE TABLE hot_demo AS SELECT i AS id, repeat('x', 500) AS payload FROM generate_series(1, 4000) i")
    cur.execute("SELECT pg_relation_size('hot_demo') / current_setting('block_size')::int")
    (pages,) = cur.fetchone()
    assert pages > 50, f"hot_demo too small to be meaningful: {pages} pages"
    for _ in range(3):
        cur.execute("SELECT count(*) FROM hot_demo")
    cur.execute(
        "SELECT count(*) FROM pg_buffercache WHERE relfilenode = pg_relation_filenode('hot_demo')"
    )
    (resident,) = cur.fetchone()
    assert resident >= pages * 0.9, f"expected nearly all {pages} pages resident, got {resident}"
    return pages, resident


def repeated_access_raises_usage_count_to_the_cap(cur):
    cur.execute("SELECT max(usagecount) FROM pg_buffercache WHERE relfilenode = pg_relation_filenode('hot_demo')")
    (before,) = cur.fetchone()
    for _ in range(6):
        cur.execute("SELECT count(*) FROM hot_demo")
    cur.execute("SELECT max(usagecount) FROM pg_buffercache WHERE relfilenode = pg_relation_filenode('hot_demo')")
    (after,) = cur.fetchone()
    assert after >= before, f"usage count dropped: {before} -> {after}"
    assert after == 5, f"expected the usage count to reach the cap of 5, got {after}"
    return before, after


def sequential_scan_ring_bounds_a_bigger_tables_footprint(cur):
    # CREATE TABLE AS SELECT uses the 16MB bulk-write ring during the load itself (per the
    # buffer manager README), so the table never fully occupies the buffer pool even once.
    cur.execute("DROP TABLE IF EXISTS big_scan")
    cur.execute(
        "CREATE TABLE big_scan AS SELECT i AS id, repeat('y', 500) AS payload FROM generate_series(1, 400000) i"
    )
    cur.execute("SELECT pg_relation_size('big_scan') / current_setting('block_size')::int")
    (pages,) = cur.fetchone()
    assert pages > 20000, f"big_scan too small to force the ring strategy: {pages} pages"
    cur.execute("SELECT count(*) FROM big_scan")
    cur.execute(
        "SELECT count(*) FROM pg_buffercache WHERE relfilenode = pg_relation_filenode('big_scan')"
    )
    (resident,) = cur.fetchone()
    assert resident < pages * 0.15, f"expected a small ring footprint, got {resident} of {pages} pages resident"
    return pages, resident


def a_dirtied_buffer_is_cleaned_by_a_checkpoint(cur):
    cur.execute("UPDATE hot_demo SET payload = 'dirtied' WHERE id = 1")
    cur.execute(
        "SELECT isdirty FROM pg_buffercache b, hot_demo t"
        " WHERE b.relfilenode = pg_relation_filenode('hot_demo')"
        " AND b.relblocknumber = (t.ctid::text::point)[0]::int AND t.id = 1"
    )
    row = cur.fetchone()
    before = row[0] if row else None
    cur.execute("CHECKPOINT")
    cur.execute(
        "SELECT isdirty FROM pg_buffercache b, hot_demo t"
        " WHERE b.relfilenode = pg_relation_filenode('hot_demo')"
        " AND b.relblocknumber = (t.ctid::text::point)[0]::int AND t.id = 1"
    )
    row = cur.fetchone()
    after = row[0] if row else None
    assert before is True, f"expected the just-updated page to be dirty, got {before}"
    assert after is False, f"expected a checkpoint to clean the page, got {after}"
    return before, after


def buffer_hits_dominate_a_warm_tables_stats(cur):
    # A backend batches its own stats locally and only flushes them to shared memory
    # periodically; force an immediate flush so the very next read sees this transaction's work.
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT heap_blks_read, heap_blks_hit FROM pg_statio_user_tables WHERE relname = 'hot_demo'")
    read_before, hit_before = cur.fetchone()
    cur.execute("SELECT count(*) FROM hot_demo")
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT heap_blks_read, heap_blks_hit FROM pg_statio_user_tables WHERE relname = 'hot_demo'")
    read_after, hit_after = cur.fetchone()
    new_reads = read_after - read_before
    new_hits = hit_after - hit_before
    assert new_reads == 0, f"expected zero new disk reads for a resident table, got {new_reads}"
    assert new_hits > 0, f"expected new buffer hits, got {new_hits}"
    return new_reads, new_hits


def io_method_worker_issues_real_bulkread_io_on_pg18(cur18):
    cur18.execute("SHOW io_method")
    (io_method,) = cur18.fetchone()
    assert io_method == "worker", f"expected the default io_method of worker, got {io_method}"
    cur18.execute("DROP TABLE IF EXISTS aio_demo")
    cur18.execute(
        "CREATE TABLE aio_demo AS SELECT i AS id, repeat('z', 500) AS payload FROM generate_series(1, 400000) i"
    )
    cur18.execute("SELECT pg_stat_reset_shared('io')")
    cur18.execute("SELECT count(*) FROM aio_demo")
    cur18.execute("SELECT pg_stat_force_next_flush()")
    cur18.execute(
        "SELECT coalesce(sum(reads), 0), coalesce(sum(hits), 0) FROM pg_stat_io"
        " WHERE backend_type IN ('client backend', 'background worker') AND context = 'bulkread'"
    )
    reads, hits = cur18.fetchone()
    assert reads > 0 or hits > 0, "expected real I/O activity attributed to the bulkread context"
    return io_method, reads, hits


def main():
    conn, cur = connect()
    conn18, cur18 = connect_pg18()
    try:
        pages_hot, resident_hot = small_table_stays_fully_resident(cur)
        before_uc, after_uc = repeated_access_raises_usage_count_to_the_cap(cur)
        pages_big, resident_big = sequential_scan_ring_bounds_a_bigger_tables_footprint(cur)
        dirty_before, dirty_after = a_dirtied_buffer_is_cleaned_by_a_checkpoint(cur)
        new_reads, new_hits = buffer_hits_dominate_a_warm_tables_stats(cur)
        io_method, bulkread_reads, bulkread_hits = io_method_worker_issues_real_bulkread_io_on_pg18(cur18)
        print(f"hot_demo: {resident_hot}/{pages_hot} pages resident")
        print(f"usage count: {before_uc} -> {after_uc}")
        print(f"big_scan: {resident_big}/{pages_big} pages resident after a full scan (ring-bounded)")
        print(f"dirty before/after checkpoint: {dirty_before} -> {dirty_after}")
        print(f"warm scan: {new_reads} new disk reads, {new_hits} new buffer hits")
        print(f"PG18 io_method={io_method}: bulkread context reads={bulkread_reads} hits={bulkread_hits}")
    finally:
        for t in ("hot_demo", "big_scan"):
            cur.execute(f"DROP TABLE IF EXISTS {t}")
        cur.close()
        conn.close()
        cur18.execute("DROP TABLE IF EXISTS aio_demo")
        cur18.close()
        conn18.close()
    print("buffer-pool-page-replacement examples: all checks pass")


if __name__ == "__main__":
    main()
