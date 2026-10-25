import threading
import time

import psycopg2
import psycopg2.errors

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    return conn


def _setup_rows():
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS lock_demo")
    scur.execute("CREATE TABLE lock_demo (id INTEGER PRIMARY KEY, v TEXT)")
    scur.execute("INSERT INTO lock_demo (id, v) VALUES (1, 'a'), (2, 'b')")
    setup.commit()
    setup.close()


def deadlock_detected_and_aborted():
    """A real deadlock, reproduced against this sandbox's own Postgres: T1 locks row 1, T2 locks
    row 2, then each tries to lock the other's row, forming a real cyclic wait. Postgres's own
    deadlock monitor detects the cycle and aborts one side with a genuine DeadlockDetected error,
    measured at roughly deadlock_timeout's own default wait (about one second) before firing."""
    _setup_rows()

    both_locked_own = threading.Barrier(2)
    results = {}

    def t1():
        conn = connect()
        cur = conn.cursor()
        cur.execute("SELECT v FROM lock_demo WHERE id = 1 FOR UPDATE")
        both_locked_own.wait()
        start = time.perf_counter()
        try:
            cur.execute("SELECT v FROM lock_demo WHERE id = 2 FOR UPDATE")
            conn.commit()
            results["t1_outcome"] = "committed"
        except psycopg2.errors.DeadlockDetected:
            conn.rollback()
            results["t1_outcome"] = "deadlock_detected"
            results["t1_wait_seconds"] = time.perf_counter() - start
        conn.close()

    def t2():
        conn = connect()
        cur = conn.cursor()
        cur.execute("SELECT v FROM lock_demo WHERE id = 2 FOR UPDATE")
        both_locked_own.wait()
        start = time.perf_counter()
        try:
            cur.execute("SELECT v FROM lock_demo WHERE id = 1 FOR UPDATE")
            conn.commit()
            results["t2_outcome"] = "committed"
        except psycopg2.errors.DeadlockDetected:
            conn.rollback()
            results["t2_outcome"] = "deadlock_detected"
            results["t2_wait_seconds"] = time.perf_counter() - start
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    outcomes = sorted([results["t1_outcome"], results["t2_outcome"]])
    assert outcomes == ["committed", "deadlock_detected"], f"expected exactly one commit and one real deadlock detection, got {results}"
    wait = results.get("t1_wait_seconds") or results.get("t2_wait_seconds")
    assert wait >= 0.8, f"expected the deadlock to be caught near deadlock_timeout's own default (~1s), got {wait:.3f}s"
    print(f"deadlock: {results['t1_outcome']} / {results['t2_outcome']}, real cyclic wait caught after {wait:.3f}s — matching deadlock_timeout's own default")
    return results


def consistent_lock_order_avoids_deadlock(rounds=5):
    """The exact same two-row contention as above, but with both transactions acquiring their
    locks in the same order (row 1 before row 2) every time — PostgreSQL's own documented best
    defense against deadlocks. Run for real, repeatedly: zero deadlocks, every round."""
    deadlocks = 0

    for _ in range(rounds):
        _setup_rows()
        first_has_row1 = threading.Event()

        def holder():
            conn = connect()
            cur = conn.cursor()
            cur.execute("SELECT v FROM lock_demo WHERE id = 1 FOR UPDATE")
            first_has_row1.set()
            time.sleep(0.05)
            cur.execute("SELECT v FROM lock_demo WHERE id = 2 FOR UPDATE")
            conn.commit()
            conn.close()

        def waiter():
            first_has_row1.wait()
            conn = connect()
            cur = conn.cursor()
            try:
                cur.execute("SELECT v FROM lock_demo WHERE id = 1 FOR UPDATE")  # same order: waits, never deadlocks
                cur.execute("SELECT v FROM lock_demo WHERE id = 2 FOR UPDATE")
                conn.commit()
            except psycopg2.errors.DeadlockDetected:
                conn.rollback()
                nonlocal_deadlocks.append(1)
            conn.close()

        nonlocal_deadlocks = []
        th1, th2 = threading.Thread(target=holder), threading.Thread(target=waiter)
        th1.start(); th2.start()
        th1.join(); th2.join()
        deadlocks += len(nonlocal_deadlocks)

    assert deadlocks == 0, f"expected zero deadlocks across {rounds} rounds with a consistent lock order, got {deadlocks}"
    print(f"consistent lock order: {rounds} of {rounds} rounds completed with zero deadlocks — the same contention, the opposite outcome")
    return deadlocks, rounds


def access_exclusive_blocks_even_reads():
    """A long-held ACCESS EXCLUSIVE lock — the level most ALTER TABLE and DDL statements acquire
    — genuinely blocks even a plain SELECT on the same table, measured directly: a real migration
    hazard, not a theoretical one."""
    _setup_rows()

    ddl_started = threading.Event()
    results = {}

    def ddl_session():
        conn = connect()
        cur = conn.cursor()
        cur.execute("LOCK TABLE lock_demo IN ACCESS EXCLUSIVE MODE")
        ddl_started.set()
        time.sleep(0.3)
        conn.commit()
        conn.close()

    def reader_session():
        ddl_started.wait()
        conn = connect()
        cur = conn.cursor()
        start = time.perf_counter()
        cur.execute("SELECT v FROM lock_demo WHERE id = 1")  # blocks: only ACCESS EXCLUSIVE blocks a plain SELECT
        results["wait_seconds"] = time.perf_counter() - start
        conn.commit()
        conn.close()

    th1, th2 = threading.Thread(target=ddl_session), threading.Thread(target=reader_session)
    th1.start(); th2.start()
    th1.join(); th2.join()

    assert results["wait_seconds"] >= 0.25, f"expected the read to block for roughly the DDL session's own hold time, got {results['wait_seconds']:.3f}s"
    print(f"ACCESS EXCLUSIVE: a plain SELECT blocked for {results['wait_seconds']:.3f}s behind a held DDL-level lock — real, measured")
    return results["wait_seconds"]


def main():
    deadlock_detected_and_aborted()
    consistent_lock_order_avoids_deadlock()
    access_exclusive_blocks_even_reads()
    print("locking-deadlocks-lock-escalation examples: all checks pass")


if __name__ == "__main__":
    main()
