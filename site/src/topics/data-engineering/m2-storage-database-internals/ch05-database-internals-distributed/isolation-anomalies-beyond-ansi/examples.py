import threading
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect(isolation_level=None):
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    if isolation_level:
        conn.set_session(isolation_level=isolation_level)
    return conn


def lost_update_under_read_committed():
    """P4 (Lost Update), Berenson et al.: T1 reads x, T2 updates x, T1 (based on its earlier
    read) updates x and commits, overwriting T2's committed change. A real two-transaction
    timeline, forced into this exact interleaving with threading.Barrier."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS lost_update_demo")
    scur.execute("CREATE TABLE lost_update_demo (id INTEGER PRIMARY KEY, balance INTEGER)")
    scur.execute("INSERT INTO lost_update_demo (id, balance) VALUES (1, 100)")
    setup.commit()
    setup.close()

    both_read = threading.Barrier(2)
    t1_committed = threading.Event()
    results = {}

    def t1():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        cur.execute("SELECT balance FROM lost_update_demo WHERE id = 1")
        x = cur.fetchone()[0]  # 100
        both_read.wait()
        cur.execute("UPDATE lost_update_demo SET balance = %s WHERE id = 1", (x + 10,))
        conn.commit()
        results["t1_wrote"] = x + 10
        t1_committed.set()
        conn.close()

    def t2():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        cur.execute("SELECT balance FROM lost_update_demo WHERE id = 1")
        y = cur.fetchone()[0]  # 100, the same stale read as T1
        both_read.wait()
        t1_committed.wait()  # let T1's own commit land first
        cur.execute("UPDATE lost_update_demo SET balance = %s WHERE id = 1", (y + 20,))
        conn.commit()
        results["t2_wrote"] = y + 20
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    check = connect()
    ccur = check.cursor()
    ccur.execute("SELECT balance FROM lost_update_demo WHERE id = 1")
    final = ccur.fetchone()[0]
    check.close()

    assert results["t1_wrote"] == 110, f"expected T1 to write 110, got {results['t1_wrote']}"
    assert results["t2_wrote"] == 120, f"expected T2 to write 120, got {results['t2_wrote']}"
    assert final == 120, f"expected the final balance to be T2's 120, losing T1's +10 entirely, got {final}"
    print(f"lost update: T1 wrote {results['t1_wrote']} (committed), T2 wrote {results['t2_wrote']} (committed) — final balance {final}, T1's +10 gone without a trace")
    return results["t1_wrote"], results["t2_wrote"], final


def read_skew_under_read_committed():
    """A5A (Read Skew), Berenson et al.: T1 reads x, then T2 updates x and y (keeping x = y) and
    commits, then T1 reads y and sees an inconsistent pair — a stale x paired with a fresh y."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS read_skew_demo")
    scur.execute("CREATE TABLE read_skew_demo (k TEXT PRIMARY KEY, v INTEGER)")
    scur.execute("INSERT INTO read_skew_demo (k, v) VALUES ('x', 50), ('y', 50)")
    setup.commit()
    setup.close()

    t1_read_x = threading.Event()
    t2_committed = threading.Event()
    results = {}

    def t1():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        cur.execute("SELECT v FROM read_skew_demo WHERE k = 'x'")
        results["x"] = cur.fetchone()[0]  # 50
        t1_read_x.set()
        t2_committed.wait()
        cur.execute("SELECT v FROM read_skew_demo WHERE k = 'y'")
        results["y"] = cur.fetchone()[0]  # 80, already updated by T2
        conn.commit()
        conn.close()

    def t2():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        t1_read_x.wait()
        cur.execute("UPDATE read_skew_demo SET v = 80 WHERE k = 'x'")
        cur.execute("UPDATE read_skew_demo SET v = 80 WHERE k = 'y'")
        conn.commit()
        t2_committed.set()
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    assert results["x"] == 50, f"expected T1's own read of x to stay at its original 50, got {results['x']}"
    assert results["y"] == 80, f"expected T1's own read of y to see T2's committed 80, got {results['y']}"
    assert results["x"] != results["y"], "expected T1 to see an inconsistent pair (x != y), proving read skew occurred"
    print(f"read skew: T1's own two reads inside one transaction saw x={results['x']}, y={results['y']} — a pair the invariant x=y forbids")
    return results["x"], results["y"]


def dirty_write_blocked_by_real_locking():
    """P0 (Dirty Write): ANSI SQL-92 only excludes this at its strictest (SERIALIZABLE) level,
    per Berenson et al. Real PostgreSQL row-level locking excludes it structurally at every
    isolation level: a second writer to the same row blocks until the first transaction ends."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS dirty_write_demo")
    scur.execute("CREATE TABLE dirty_write_demo (id INTEGER PRIMARY KEY, v TEXT)")
    scur.execute("INSERT INTO dirty_write_demo (id, v) VALUES (1, 'original')")
    setup.commit()
    setup.close()

    t1_wrote = threading.Event()
    t2_attempted = threading.Event()
    results = {}

    def t1():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        cur.execute("UPDATE dirty_write_demo SET v = 'from T1' WHERE id = 1")
        t1_wrote.set()
        t2_attempted.wait()
        time.sleep(0.3)  # keep the row locked long enough to observe T2 still blocked
        results["t2_blocked_while_t1_held_lock"] = not results.get("t2_done", False)
        conn.commit()
        conn.close()

    def t2():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED)
        cur = conn.cursor()
        t1_wrote.wait()
        t2_attempted.set()
        start = time.perf_counter()
        cur.execute("UPDATE dirty_write_demo SET v = 'from T2' WHERE id = 1")  # blocks on T1's row lock
        results["t2_wait_seconds"] = time.perf_counter() - start
        results["t2_done"] = True
        conn.commit()
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    assert results["t2_wait_seconds"] >= 0.25, f"expected T2's UPDATE to block for roughly T1's own hold time, got {results['t2_wait_seconds']:.3f}s"
    check = connect()
    ccur = check.cursor()
    ccur.execute("SELECT v FROM dirty_write_demo WHERE id = 1")
    final = ccur.fetchone()[0]
    check.close()
    assert final == "from T2", f"expected T2's own update to win once T1 released the row, got {final!r}"
    print(f"dirty write: T2's own UPDATE blocked for {results['t2_wait_seconds']:.3f}s on T1's row lock, then applied cleanly after T1 committed — final value {final!r}")
    return results["t2_wait_seconds"], final


def main():
    lost_update_under_read_committed()
    read_skew_under_read_committed()
    dirty_write_blocked_by_real_locking()
    print("isolation-anomalies-beyond-ansi examples: all checks pass")


if __name__ == "__main__":
    main()
