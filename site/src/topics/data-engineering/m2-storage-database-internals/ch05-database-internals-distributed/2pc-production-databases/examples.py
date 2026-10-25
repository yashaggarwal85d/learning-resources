"""Two real experiments against this sandbox's own Postgres cluster, using PREPARE TRANSACTION —
Postgres's own XA-style two-phase commit primitive (topic 14's row-level locking background;
topic 15's own FOR UPDATE mechanism underlies the second experiment here). max_prepared_transactions
is set to 16 on this sandbox's server specifically to run these (it defaults to 0, disabled). The
PostgreSQL documentation's own crash-durability claim for a prepared transaction — committable "even
if a database crash occurs" — is sourced from the docs directly in SOURCES.md and FACT-CHECK.md
rather than reproduced here by restarting this sandbox's shared server; both experiments below are
real, measured runs that don't touch the server process itself."""

import threading
import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    return conn


def _setup_rows():
    setup = connect()
    scur = setup.cursor()
    scur.execute("DROP TABLE IF EXISTS twopc_demo")
    scur.execute("CREATE TABLE twopc_demo (id INTEGER PRIMARY KEY, v TEXT)")
    scur.execute("INSERT INTO twopc_demo (id, v) VALUES (1, 'before')")
    setup.commit()
    setup.close()


def prepared_transaction_commits_from_a_separate_session():
    """PREPARE TRANSACTION ends the issuing session's own transaction (the PostgreSQL documentation's
    own comparison to ROLLBACK: "there is no active current transaction, and the effects of the
    prepared transaction are no longer visible"). This prepares one real transaction, confirms from a
    second session that the change is invisible and the transaction is listed as prepared, then
    commits it from a third session — never the one that prepared it — and confirms the change is
    now visible everywhere."""
    _setup_rows()

    preparer = connect()
    pc = preparer.cursor()
    pc.execute("UPDATE twopc_demo SET v = 'prepared, not yet committed' WHERE id = 1")
    pc.execute("PREPARE TRANSACTION 'topic16_demo'")
    preparer.close()

    before = connect()
    bc = before.cursor()
    bc.execute("SELECT gid FROM pg_prepared_xacts WHERE gid = 'topic16_demo'")
    assert bc.fetchone() is not None, "expected the prepared transaction listed from a separate session"
    bc.execute("SELECT v FROM twopc_demo WHERE id = 1")
    (v_before,) = bc.fetchone()
    assert v_before == "before", f"expected the prepared change invisible before commit, got {v_before!r}"
    before.commit()
    before.close()

    committer = connect()
    committer.autocommit = True
    cc = committer.cursor()
    cc.execute("COMMIT PREPARED 'topic16_demo'")
    committer.close()

    verify = connect()
    vc = verify.cursor()
    vc.execute("SELECT v FROM twopc_demo WHERE id = 1")
    (v_after,) = vc.fetchone()
    assert v_after == "prepared, not yet committed", f"expected the committed change visible, got {v_after!r}"
    verify.commit()
    verify.close()
    print("prepared transaction: invisible to other sessions until committed from a separate session")


def prepared_transaction_holds_its_locks():
    """A prepared transaction keeps whatever locks it held (the PostgreSQL documentation's own
    warning). This prepares one transaction that has updated a row, then measures how long a
    second, concurrent writer blocks on that same row until the prepared transaction is finally
    resolved from a third session."""
    _setup_rows()

    preparer = connect()
    pc = preparer.cursor()
    pc.execute("UPDATE twopc_demo SET v = 'held by the prepared transaction' WHERE id = 1")
    pc.execute("PREPARE TRANSACTION 'topic16_lock_demo'")
    preparer.close()

    results = {}

    def waiter():
        conn = connect()
        cur = conn.cursor()
        start = time.perf_counter()
        cur.execute("UPDATE twopc_demo SET v = 'from the waiting session' WHERE id = 1")
        results["wait_seconds"] = time.perf_counter() - start
        conn.commit()
        conn.close()

    th = threading.Thread(target=waiter)
    th.start()
    time.sleep(0.3)

    resolver = connect()
    resolver.autocommit = True
    rc = resolver.cursor()
    rc.execute("ROLLBACK PREPARED 'topic16_lock_demo'")
    resolver.close()

    th.join()
    assert results["wait_seconds"] >= 0.25, (
        f"expected the waiting session to block for roughly the prepared transaction's own hold "
        f"time, got {results['wait_seconds']:.3f}s"
    )
    print(
        f"prepared transaction: a concurrent writer blocked for {results['wait_seconds']:.3f}s "
        f"until the prepared transaction was resolved from a separate session"
    )
    return results["wait_seconds"]


def main():
    prepared_transaction_commits_from_a_separate_session()
    prepared_transaction_holds_its_locks()
    print("2pc-production-databases examples: all checks pass")


if __name__ == "__main__":
    main()
