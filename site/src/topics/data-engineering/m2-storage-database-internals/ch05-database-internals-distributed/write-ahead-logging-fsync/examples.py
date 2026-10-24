import psycopg2
import threading

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    return conn, cur


def lsn_is_a_monotonic_byte_offset(cur):
    cur.execute("DROP TABLE IF EXISTS lsn_demo")
    cur.execute("CREATE TABLE lsn_demo (id int, payload text)")
    cur.execute("INSERT INTO lsn_demo VALUES (1, 'x')")
    cur.execute("SELECT pg_current_wal_lsn()")
    (before,) = cur.fetchone()
    cur.execute("UPDATE lsn_demo SET payload = 'y' WHERE id = 1")
    cur.execute("SELECT pg_current_wal_lsn()")
    (after,) = cur.fetchone()
    cur.execute("SELECT pg_current_wal_lsn() - %s::pg_lsn", (before,))
    (byte_gap,) = cur.fetchone()
    cur.execute("DROP TABLE lsn_demo")
    assert after != before, "the LSN didn't move at all after a real write"
    assert byte_gap > 0, f"expected a positive byte gap, got {byte_gap}"
    return before, after, int(byte_gap)


def wal_sync_method_matches_the_documented_linux_default(cur):
    cur.execute("SHOW wal_sync_method")
    (method,) = cur.fetchone()
    assert method == "fdatasync", f"expected the documented Linux default of fdatasync, got {method}"
    return method


def full_page_write_triggers_on_first_modification_after_checkpoint(cur):
    cur.execute("SHOW full_page_writes")
    (fpw,) = cur.fetchone()
    assert fpw == "on", f"expected full_page_writes on (the default), got {fpw}"
    cur.execute("DROP TABLE IF EXISTS fpw_demo")
    cur.execute("CREATE TABLE fpw_demo (id int, payload text)")
    cur.execute("INSERT INTO fpw_demo VALUES (1, 'x')")
    cur.execute("CHECKPOINT")
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT wal_fpi FROM pg_stat_wal")
    (before,) = cur.fetchone()
    cur.execute("UPDATE fpw_demo SET payload = 'y' WHERE id = 1")
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT wal_fpi FROM pg_stat_wal")
    (after,) = cur.fetchone()
    cur.execute("UPDATE fpw_demo SET payload = 'z' WHERE id = 1")
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT wal_fpi FROM pg_stat_wal")
    (after_second,) = cur.fetchone()
    cur.execute("DROP TABLE fpw_demo")
    assert after - before == 1, f"expected exactly one full-page image on the first change after a checkpoint, got {after - before}"
    assert after_second == after, f"expected no full-page image on a second change to the same page, got {after_second - after} more"
    return before, after, after_second


def _gc_worker(dsn, n):
    conn = psycopg2.connect(**dsn)
    conn.autocommit = False
    cur = conn.cursor()
    for _ in range(n):
        cur.execute("INSERT INTO gc_demo (payload) VALUES ('x')")
        conn.commit()
    cur.close()
    conn.close()


def _run_concurrent_commits(cur, n_threads, n_each):
    cur.execute("SELECT pg_stat_reset_shared('wal')")
    threads = [threading.Thread(target=_gc_worker, args=(DSN, n_each)) for _ in range(n_threads)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT wal_sync FROM pg_stat_wal")
    (wal_sync,) = cur.fetchone()
    return wal_sync


def group_commit_reduces_wal_syncs_under_concurrent_load(cur):
    cur.execute("DROP TABLE IF EXISTS gc_demo")
    cur.execute("CREATE TABLE gc_demo (id serial, payload text)")
    n_threads, n_each = 8, 50
    total_commits = n_threads * n_each
    try:
        cur.execute("ALTER SYSTEM SET commit_delay = 0")
        cur.execute("SELECT pg_reload_conf()")
        syncs_no_delay = _run_concurrent_commits(cur, n_threads, n_each)

        cur.execute("ALTER SYSTEM SET commit_delay = 20000")
        cur.execute("ALTER SYSTEM SET commit_siblings = 0")
        cur.execute("SELECT pg_reload_conf()")
        syncs_with_delay = _run_concurrent_commits(cur, n_threads, n_each)
    finally:
        cur.execute("ALTER SYSTEM RESET commit_delay")
        cur.execute("ALTER SYSTEM RESET commit_siblings")
        cur.execute("SELECT pg_reload_conf()")
        cur.execute("DROP TABLE gc_demo")
    assert syncs_with_delay < syncs_no_delay, (
        f"expected commit_delay to reduce wal_sync calls, got {syncs_with_delay} (delay) vs {syncs_no_delay} (no delay)"
    )
    assert syncs_with_delay < total_commits, f"expected fewer syncs than commits, got {syncs_with_delay} of {total_commits}"
    return syncs_no_delay, syncs_with_delay, total_commits


def main():
    conn, cur = connect()
    try:
        before, after, byte_gap = lsn_is_a_monotonic_byte_offset(cur)
        method = wal_sync_method_matches_the_documented_linux_default(cur)
        fpi_before, fpi_after, fpi_after_second = full_page_write_triggers_on_first_modification_after_checkpoint(cur)
        syncs_no_delay, syncs_with_delay, total_commits = group_commit_reduces_wal_syncs_under_concurrent_load(cur)
        print(f"LSN: {before} -> {after}, {byte_gap} bytes")
        print(f"wal_sync_method: {method}")
        print(f"wal_fpi: {fpi_before} -> {fpi_after} -> {fpi_after_second} (one full-page image, then none)")
        print(f"group commit: {total_commits} commits, {syncs_no_delay} syncs (no delay) vs {syncs_with_delay} syncs (with delay)")
    finally:
        cur.close()
        conn.close()
    print("write-ahead-logging-fsync examples: all checks pass")


if __name__ == "__main__":
    main()
