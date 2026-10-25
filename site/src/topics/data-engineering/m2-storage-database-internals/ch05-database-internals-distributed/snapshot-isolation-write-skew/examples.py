import threading
import time

import psycopg2
import psycopg2.errors

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect(isolation_level=None):
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    if isolation_level:
        conn.set_session(isolation_level=isolation_level)
    return conn


def repeatable_read_prevents_read_skew():
    """Topic 11's own A5A read-skew scenario, rerun under REPEATABLE READ (snapshot isolation)
    instead of Read Committed: T1's two reads inside one transaction now both come from the same
    snapshot taken at the transaction's own start, so T2's committed update is invisible to
    either read — the inconsistent pair from topic 11 can no longer appear."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS si_read_skew_demo")
    scur.execute("CREATE TABLE si_read_skew_demo (k TEXT PRIMARY KEY, v INTEGER)")
    scur.execute("INSERT INTO si_read_skew_demo (k, v) VALUES ('x', 50), ('y', 50)")
    setup.commit()
    setup.close()

    t1_read_x = threading.Event()
    t2_committed = threading.Event()
    results = {}

    def t1():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
        cur = conn.cursor()
        cur.execute("SELECT v FROM si_read_skew_demo WHERE k = 'x'")
        results["x"] = cur.fetchone()[0]  # 50, from the snapshot taken here
        t1_read_x.set()
        t2_committed.wait()
        cur.execute("SELECT v FROM si_read_skew_demo WHERE k = 'y'")
        results["y"] = cur.fetchone()[0]  # still 50: the same snapshot, T2's commit is invisible
        conn.commit()
        conn.close()

    def t2():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
        cur = conn.cursor()
        t1_read_x.wait()
        cur.execute("UPDATE si_read_skew_demo SET v = 80 WHERE k = 'x'")
        cur.execute("UPDATE si_read_skew_demo SET v = 80 WHERE k = 'y'")
        conn.commit()
        t2_committed.set()
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    assert results["x"] == 50, f"expected T1's first read of x to stay 50, got {results['x']}"
    assert results["y"] == 50, f"expected T1's second read of y to still see the pre-T2 snapshot (50), got {results['y']}"
    assert results["x"] == results["y"], "expected a consistent pair (x == y): snapshot isolation prevents read skew"
    print(f"read skew under REPEATABLE READ: T1's own two reads saw x={results['x']}, y={results['y']} — the same consistent snapshot both times, the anomaly prevented")
    return results["x"], results["y"]


def repeatable_read_write_write_conflict_first_committer_wins():
    """SI's own conflict rule, stated directly by the PostgreSQL docs: two REPEATABLE READ
    transactions both update the same row from the same snapshot. The first to commit succeeds;
    the second gets a real serialization failure (psycopg2.errors.SerializationFailure) rather
    than silently overwriting the first committer's change — the structural difference from
    topic 11's lost update under Read Committed, where the second writer's overwrite went
    through silently."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS si_conflict_demo")
    scur.execute("CREATE TABLE si_conflict_demo (id INTEGER PRIMARY KEY, balance INTEGER)")
    scur.execute("INSERT INTO si_conflict_demo (id, balance) VALUES (1, 100)")
    setup.commit()
    setup.close()

    both_read = threading.Barrier(2)
    t1_committed = threading.Event()
    results = {}

    def t1():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
        cur = conn.cursor()
        cur.execute("SELECT balance FROM si_conflict_demo WHERE id = 1")
        x = cur.fetchone()[0]  # 100
        both_read.wait()
        cur.execute("UPDATE si_conflict_demo SET balance = %s WHERE id = 1", (x + 10,))
        conn.commit()
        results["t1_committed_balance"] = x + 10
        t1_committed.set()
        conn.close()

    def t2():
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
        cur = conn.cursor()
        cur.execute("SELECT balance FROM si_conflict_demo WHERE id = 1")
        y = cur.fetchone()[0]  # 100, same snapshot as T1
        both_read.wait()
        t1_committed.wait()  # let T1 commit first, so T2's own write hits a changed row
        try:
            cur.execute("UPDATE si_conflict_demo SET balance = %s WHERE id = 1", (y + 20,))
            conn.commit()
            results["t2_outcome"] = "committed"
        except psycopg2.errors.SerializationFailure:
            conn.rollback()
            results["t2_outcome"] = "serialization_failure"
        conn.close()

    th1, th2 = threading.Thread(target=t1), threading.Thread(target=t2)
    th1.start(); th2.start()
    th1.join(); th2.join()

    check = connect()
    ccur = check.cursor()
    ccur.execute("SELECT balance FROM si_conflict_demo WHERE id = 1")
    final = ccur.fetchone()[0]
    check.close()

    assert results["t1_committed_balance"] == 110, f"expected T1 to commit balance 110, got {results['t1_committed_balance']}"
    assert results["t2_outcome"] == "serialization_failure", f"expected T2's own write-write conflict to abort, got {results['t2_outcome']}"
    assert final == 110, f"expected T1's committed 110 to stand, with T2 rolled back, got {final}"
    print(f"first-committer-wins: T1 committed balance {results['t1_committed_balance']}, T2's own conflicting write got a real {results['t2_outcome']} and rolled back — final balance {final}")
    return results["t1_committed_balance"], results["t2_outcome"], final


def write_skew_on_call_doctors():
    """The canonical write-skew pattern: a hospital rule says at least one doctor must stay
    on call. Both on-call doctors independently check the count (each sees 2), and since 2 - 1
    still satisfies the rule, each goes off call in their own disjoint row. Snapshot isolation
    has nothing to conflict on — the two updates touch different rows — so both commit, and the
    invariant (at least one doctor on call) ends up violated with zero doctors on call."""
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS on_call_doctors")
    scur.execute("CREATE TABLE on_call_doctors (doctor_id INTEGER PRIMARY KEY, on_call BOOLEAN)")
    scur.execute("INSERT INTO on_call_doctors (doctor_id, on_call) VALUES (1, TRUE), (2, TRUE)")
    setup.commit()
    setup.close()

    both_counted = threading.Barrier(2)
    results = {}

    def go_off_call(doctor_id, key):
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_REPEATABLE_READ)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM on_call_doctors WHERE on_call")
        on_call_count = cur.fetchone()[0]  # 2, from this transaction's own snapshot
        both_counted.wait()
        if on_call_count >= 2:  # "someone else is still on call, I can go"
            cur.execute("UPDATE on_call_doctors SET on_call = FALSE WHERE doctor_id = %s", (doctor_id,))
            conn.commit()
            results[key] = "went_off_call"
        else:
            conn.rollback()
            results[key] = "stayed_on_call"
        conn.close()

    th1 = threading.Thread(target=go_off_call, args=(1, "doctor_1"))
    th2 = threading.Thread(target=go_off_call, args=(2, "doctor_2"))
    th1.start(); th2.start()
    th1.join(); th2.join()

    check = connect()
    ccur = check.cursor()
    ccur.execute("SELECT COUNT(*) FROM on_call_doctors WHERE on_call")
    final_on_call = ccur.fetchone()[0]
    check.close()

    assert results["doctor_1"] == "went_off_call", f"expected doctor 1 to go off call, got {results['doctor_1']}"
    assert results["doctor_2"] == "went_off_call", f"expected doctor 2 to go off call, got {results['doctor_2']}"
    assert final_on_call == 0, f"expected the invariant (at least one doctor on call) to end up violated at 0, got {final_on_call}"
    print(f"write skew under REPEATABLE READ: both doctors read on_call_count=2, both committed 'went_off_call' — final doctors on call: {final_on_call}, the rule broken with no conflict ever detected")
    return final_on_call


def main():
    repeatable_read_prevents_read_skew()
    repeatable_read_write_write_conflict_first_committer_wins()
    write_skew_on_call_doctors()
    print("snapshot-isolation-write-skew examples: all checks pass")


if __name__ == "__main__":
    main()
