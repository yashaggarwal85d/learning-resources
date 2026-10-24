import threading

import psycopg2
import psycopg2.errors

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect(isolation_level=None):
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    if isolation_level:
        conn.set_session(isolation_level=isolation_level)
    return conn


def _setup_doctors(n):
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS serializable_doctors")
    scur.execute("CREATE TABLE serializable_doctors (doctor_id INTEGER PRIMARY KEY, on_call BOOLEAN)")
    for i in range(n):
        scur.execute("INSERT INTO serializable_doctors (doctor_id, on_call) VALUES (%s, TRUE)", (i,))
    setup.commit()
    setup.close()


def serializable_catches_write_skew_doctors():
    """Topic 12's own on-call doctors scenario, rerun under SERIALIZABLE instead of REPEATABLE
    READ: the exact same two disjoint-row updates, off the exact same shared count, now produces
    a real serialization failure for one of the two transactions — SSI's own dangerous-structure
    detection (Tin -> Tpivot -> Tout, two adjacent rw-conflicts) catching write skew where
    ordinary snapshot isolation let it straight through."""
    _setup_doctors(2)

    both_counted = threading.Barrier(2)
    results = {}

    def go_off_call(doctor_id, key):
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM serializable_doctors WHERE on_call")
        on_call_count = cur.fetchone()[0]  # 2, from this transaction's own snapshot
        both_counted.wait()
        try:
            if on_call_count >= 2:
                cur.execute("UPDATE serializable_doctors SET on_call = FALSE WHERE doctor_id = %s", (doctor_id,))
            conn.commit()
            results[key] = "committed"
        except psycopg2.errors.SerializationFailure:
            conn.rollback()
            results[key] = "serialization_failure"
        conn.close()

    th1 = threading.Thread(target=go_off_call, args=(0, "doctor_1"))
    th2 = threading.Thread(target=go_off_call, args=(1, "doctor_2"))
    th1.start(); th2.start()
    th1.join(); th2.join()

    outcomes = sorted(results.values())
    assert outcomes == ["committed", "serialization_failure"], f"expected exactly one commit and one serialization failure, got {results}"
    print(f"SERIALIZABLE doctors: {results['doctor_1']}, {results['doctor_2']} — exactly one of the two caught, where REPEATABLE READ let both through")
    return results


def retry_until_success():
    """The mandatory retry loop PostgreSQL's own docs describe directly: a transaction that gets
    SQLSTATE 40001 (serialization failure) aborts and retries from the beginning. On retry, the
    doctor sees the real, current on-call count (now 1, since the other doctor's own commit
    already landed) and correctly stays on call — the invariant holds, with no anomaly."""
    _setup_doctors(2)

    # Doctor 0 commits first and goes off call, exactly as in the function above.
    first = connect(psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE)
    fcur = first.cursor()
    fcur.execute("SELECT COUNT(*) FROM serializable_doctors WHERE on_call")
    fcur.fetchone()
    fcur.execute("UPDATE serializable_doctors SET on_call = FALSE WHERE doctor_id = 0")
    first.commit()
    first.close()

    attempts = 0
    while True:
        attempts += 1
        conn = connect(psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM serializable_doctors WHERE on_call")
        on_call_count = cur.fetchone()[0]
        try:
            if on_call_count >= 2:
                cur.execute("UPDATE serializable_doctors SET on_call = FALSE WHERE doctor_id = 1")
            conn.commit()
            break
        except psycopg2.errors.SerializationFailure:
            conn.rollback()
        finally:
            conn.close()

    check = connect()
    ccur = check.cursor()
    ccur.execute("SELECT COUNT(*) FROM serializable_doctors WHERE on_call")
    final_on_call = ccur.fetchone()[0]
    check.close()

    assert attempts == 1, f"expected doctor 2's own retry loop to succeed on its first real attempt once it reads the post-commit state, got {attempts} attempts"
    assert final_on_call == 1, f"expected the invariant (at least one doctor on call) to hold, got {final_on_call}"
    print(f"retry loop: doctor 2's own attempt read the real post-commit count and correctly stayed on call — final doctors on call: {final_on_call}, the invariant held")
    return attempts, final_on_call


def abort_rate_rises_with_contention():
    """The same write-skew-shaped contention (every transaction reads every row, writes only its
    own), scaled from two concurrent transactions to six, each forced via threading.Barrier onto
    the exact same starting snapshot. More concurrent transactions sharing one invariant means
    more rw-conflict edges for SSI to find a dangerous structure in, and a higher real abort rate."""

    def run_round(n):
        _setup_doctors(n)
        barrier = threading.Barrier(n)
        outcomes = {}

        def attempt(doctor_id):
            conn = connect(psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM serializable_doctors WHERE on_call")
            cur.fetchone()
            barrier.wait()
            try:
                cur.execute("UPDATE serializable_doctors SET on_call = FALSE WHERE doctor_id = %s", (doctor_id,))
                conn.commit()
                outcomes[doctor_id] = "committed"
            except psycopg2.errors.SerializationFailure:
                conn.rollback()
                outcomes[doctor_id] = "serialization_failure"
            conn.close()

        threads = [threading.Thread(target=attempt, args=(i,)) for i in range(n)]
        for th in threads:
            th.start()
        for th in threads:
            th.join()
        aborted = sum(1 for v in outcomes.values() if v == "serialization_failure")
        return aborted, n

    low_aborted, low_n = run_round(2)
    high_aborted, high_n = run_round(6)
    low_rate = low_aborted / low_n
    high_rate = high_aborted / high_n

    assert low_aborted == 1, f"expected exactly one abort among two transactions competing on every row, got {low_aborted}"
    assert high_aborted >= 3, f"expected at least half of six transactions competing on every row to abort, got {high_aborted}"
    assert high_rate > low_rate, f"expected abort rate to rise with contention, got low={low_rate:.2f} high={high_rate:.2f}"
    print(f"contention: {low_aborted} of {low_n} aborted ({low_rate:.0%}); {high_aborted} of {high_n} aborted ({high_rate:.0%}) — a real, measured rise")
    return low_rate, high_rate


def main():
    serializable_catches_write_skew_doctors()
    retry_until_success()
    abort_rate_rises_with_contention()
    print("serializability-strict-2pl-versus examples: all checks pass")


if __name__ == "__main__":
    main()
