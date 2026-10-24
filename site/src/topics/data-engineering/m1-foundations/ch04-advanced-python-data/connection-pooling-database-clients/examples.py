# Real measurements against this sandbox's own PostgreSQL 16 cluster (started on demand) and two
# real PgBouncer 1.26.1 instances this topic configures directly: one in session-pooling mode
# (port 6432), one in transaction-pooling mode (port 6433), both against the same `learnshop`
# database. Every number here is a direct measurement: a real connection-setup cost, a real
# acquire-and-hold time fed into Little's Law's own worked-example arithmetic, a real prepared-
# statement failure reproduced deterministically (no flaky concurrency — simulated instead by a
# second client resetting the shared backend, which is exactly the mechanism transaction pooling
# exposes), a real server-side cursor fetching in batches, and real timings for three bulk-load
# paths (executemany, COPY, an Arrow-native ADBC driver) against the same table and data.

import os
import subprocess
import sys
import time

import psycopg

DSN_DIRECT = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"
DSN_SESSION_POOL = "host=127.0.0.1 port=6432 dbname=learnshop user=postgres password=postgres"
DSN_TXN_POOL = "host=127.0.0.1 port=6433 dbname=learnshop user=postgres password=postgres"


def connection_setup_cost(trials=20):
    """A real TCP+auth connect against this sandbox's own PostgreSQL cluster, timed directly,
    against reusing one already-open connection for the same trivial query."""
    fresh_times = []
    for _ in range(trials):
        t0 = time.perf_counter()
        conn = psycopg.connect(DSN_DIRECT)
        conn.execute("select 1").fetchone()
        fresh_times.append(time.perf_counter() - t0)
        conn.close()

    conn = psycopg.connect(DSN_DIRECT)
    reused_times = []
    for _ in range(trials):
        t0 = time.perf_counter()
        conn.execute("select 1").fetchone()
        reused_times.append(time.perf_counter() - t0)
    conn.close()

    avg_fresh = sum(fresh_times) / len(fresh_times)
    avg_reused = sum(reused_times) / len(reused_times)
    return {
        "avg_fresh_connect_and_query_seconds": avg_fresh,
        "avg_reused_connection_query_seconds": avg_reused,
        "fresh_is_slower": avg_fresh > avg_reused,
        "ratio": avg_fresh / avg_reused,
    }


def littles_law_pool_sizing(target_throughput_per_second=50, simulated_work_seconds=0.05):
    """Little's Law's own worked example (Ws = acquire-and-hold time, Ls = pool size, giving a
    no-queue throughput), reproduced with a measured Ws on this sandbox. A trivial query's own
    round trip here is near-instant (measured separately below) and would understate real
    acquire-and-hold time, so Ws is measured against a connection held for a disclosed,
    simulated amount of request-handling work (`pg_sleep`), the way a real request actually
    holds its connection while it does something, not just while the network round-trips."""
    conn = psycopg.connect(DSN_DIRECT)
    trials = 10
    holds = []
    for _ in range(trials):
        t0 = time.perf_counter()
        conn.execute("select pg_sleep(%s), 1", (simulated_work_seconds,)).fetchone()
        holds.append(time.perf_counter() - t0)
    conn.close()

    trivial_conn = psycopg.connect(DSN_DIRECT)
    trivial_holds = []
    for _ in range(trials):
        t0 = time.perf_counter()
        trivial_conn.execute("select 1").fetchone()
        trivial_holds.append(time.perf_counter() - t0)
    trivial_conn.close()

    measured_ws = sum(holds) / len(holds)
    measured_trivial_ws = sum(trivial_holds) / len(trivial_holds)
    required_pool_size = target_throughput_per_second * measured_ws
    return {
        "measured_ws_seconds": measured_ws,
        "measured_trivial_round_trip_seconds": measured_trivial_ws,
        "target_throughput_per_second": target_throughput_per_second,
        "required_pool_size_no_queueing": required_pool_size,
        "simulated_work_ws_much_larger_than_trivial_round_trip": measured_ws > measured_trivial_ws * 10,
    }


def prepared_statement_transaction_pooling_caveat():
    """The exact caveat PgBouncer's own docs describe for transaction pooling: a SQL-level
    PREPARE is forwarded straight to the one physical backend connection, and that backend can
    be handed to a different client's transaction before this client's next one. Reproduced here
    deterministically: client A prepares a statement and releases the (only) backend; a second
    client reuses that same backend and runs DISCARD ALL (exactly what a backend's session state
    is exposed to under transaction pooling); a third client then fails to EXECUTE it."""
    a = psycopg.connect(DSN_TXN_POOL, autocommit=False)
    pid_a = a.execute("select pg_backend_pid()").fetchone()[0]
    a.execute("PREPARE stmt_a AS SELECT $1::int")
    a.commit()
    a.close()

    b = psycopg.connect(DSN_TXN_POOL, autocommit=True)
    pid_b = b.execute("select pg_backend_pid()").fetchone()[0]
    b.execute("DISCARD ALL")
    b.close()

    c = psycopg.connect(DSN_TXN_POOL, autocommit=False)
    pid_c = c.execute("select pg_backend_pid()").fetchone()[0]
    failed = False
    error_message = None
    try:
        c.execute("EXECUTE stmt_a(5)")
    except psycopg.errors.InvalidSqlStatementName as e:
        failed = True
        error_message = str(e)
    c.rollback()
    c.close()

    return {
        "backend_pid_a": pid_a,
        "backend_pid_b": pid_b,
        "backend_pid_c": pid_c,
        "same_physical_backend_reused_throughout": pid_a == pid_b == pid_c,
        "execute_failed": failed,
        "error_message": error_message,
    }


def session_pooling_same_prepared_statement_survives():
    """The same exact pattern, over session pooling: the client's own connection keeps the same
    dedicated backend for as long as it stays connected, so its own prepared statement is still
    there for its own later transaction — contrasted directly against the transaction-pooling
    failure above."""
    conn = psycopg.connect(DSN_SESSION_POOL, autocommit=False)
    conn.execute("PREPARE stmt_b AS SELECT $1::int")
    conn.commit()
    result = conn.execute("EXECUTE stmt_b(7)").fetchone()
    conn.commit()
    conn.close()
    return {"executed_successfully": result == (7,)}


def server_side_cursor_batched_fetch(path_rows=50_000):
    """A server-side (named) cursor fetching a real result set in fixed-size batches, versus
    fetchall() pulling the whole thing into client memory at once — both against the identical
    query, measured by real peak client-process RSS in isolated subprocesses."""
    setup = psycopg.connect(DSN_DIRECT, autocommit=True)
    setup.execute("DROP TABLE IF EXISTS cursor_demo")
    setup.execute("CREATE TABLE cursor_demo (id serial, payload text)")
    setup.execute(
        "INSERT INTO cursor_demo (payload) SELECT repeat('x', 200) FROM generate_series(1, %s)",
        (path_rows,),
    )
    setup.close()

    fetchall_script = "/tmp/_pool_topic_fetchall_rss.py"
    with open(fetchall_script, "w") as f:
        f.write(
            f"""
import psycopg
conn = psycopg.connect({DSN_DIRECT!r})
rows = conn.execute("SELECT * FROM cursor_demo").fetchall()
n = len(rows)
with open("/proc/self/status") as f:
    for line in f:
        if line.startswith("VmRSS:"):
            print(n, int(line.split()[1]) / 1024)
            break
"""
        )
    server_cursor_script = "/tmp/_pool_topic_servercursor_rss.py"
    with open(server_cursor_script, "w") as f:
        f.write(
            f"""
import psycopg
conn = psycopg.connect({DSN_DIRECT!r})
n = 0
with conn.cursor(name="batched") as cur:
    cur.execute("SELECT * FROM cursor_demo")
    while True:
        batch = cur.fetchmany(1000)
        if not batch:
            break
        n += len(batch)
with open("/proc/self/status") as f:
    for line in f:
        if line.startswith("VmRSS:"):
            print(n, int(line.split()[1]) / 1024)
            break
"""
        )

    fetchall_out = subprocess.run(
        [sys.executable, fetchall_script], capture_output=True, text=True, check=True
    ).stdout.split()
    cursor_out = subprocess.run(
        [sys.executable, server_cursor_script], capture_output=True, text=True, check=True
    ).stdout.split()

    return {
        "rows": int(fetchall_out[0]),
        "fetchall_peak_rss_mb": float(fetchall_out[1]),
        "server_cursor_peak_rss_mb": float(cursor_out[1]),
        "server_cursor_rows_match": int(cursor_out[0]) == int(fetchall_out[0]),
        "server_cursor_peaked_lower": float(cursor_out[1]) < float(fetchall_out[1]),
    }


def bulk_load_comparison(n_rows=20_000):
    """The same rows, loaded three ways into the same table shape: executemany (row by row,
    parsed and planned on the server for each call), COPY (psycopg's own COPY protocol support),
    and the Arrow-native ADBC PostgreSQL driver's bulk ingestion — which, per its own
    documentation, executes queries with COPY internally rather than a separate wire path."""
    import pyarrow as pa
    from adbc_driver_postgresql import dbapi as adbc_dbapi

    rows = [(i, f"user-{i}", float(i) * 1.5) for i in range(n_rows)]

    conn = psycopg.connect(DSN_DIRECT, autocommit=True)
    conn.execute("DROP TABLE IF EXISTS bulk_executemany")
    conn.execute("CREATE TABLE bulk_executemany (id int, name text, amount float8)")
    conn.execute("DROP TABLE IF EXISTS bulk_copy")
    conn.execute("CREATE TABLE bulk_copy (id int, name text, amount float8)")
    conn.execute("DROP TABLE IF EXISTS bulk_adbc")
    conn.execute("CREATE TABLE bulk_adbc (id bigint, name text, amount double precision)")

    t0 = time.perf_counter()
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO bulk_executemany VALUES (%s, %s, %s)", rows)
    executemany_seconds = time.perf_counter() - t0

    t0 = time.perf_counter()
    with conn.cursor() as cur:
        with cur.copy("COPY bulk_copy (id, name, amount) FROM STDIN") as copy:
            for row in rows:
                copy.write_row(row)
    copy_seconds = time.perf_counter() - t0

    ids = pa.array([r[0] for r in rows], type=pa.int64())
    names = pa.array([r[1] for r in rows], type=pa.string())
    amounts = pa.array([r[2] for r in rows], type=pa.float64())
    table = pa.table({"id": ids, "name": names, "amount": amounts})

    adbc_conn = adbc_dbapi.connect("postgresql://postgres:postgres@127.0.0.1:5432/learnshop")
    t0 = time.perf_counter()
    with adbc_conn.cursor() as cur:
        cur.adbc_ingest("bulk_adbc", table, mode="append")
    adbc_conn.commit()
    adbc_seconds = time.perf_counter() - t0
    adbc_conn.close()

    counts = {}
    for name in ("bulk_executemany", "bulk_copy", "bulk_adbc"):
        counts[name] = conn.execute(f"SELECT count(*) FROM {name}").fetchone()[0]
    conn.close()

    return {
        "n_rows": n_rows,
        "executemany_seconds": executemany_seconds,
        "copy_seconds": copy_seconds,
        "adbc_seconds": adbc_seconds,
        "row_counts_match": counts["bulk_executemany"] == counts["bulk_copy"] == counts["bulk_adbc"] == n_rows,
        "copy_faster_than_executemany": copy_seconds < executemany_seconds,
        "adbc_much_faster_than_executemany": adbc_seconds < executemany_seconds / 3,
    }


if __name__ == "__main__":
    r1 = connection_setup_cost()
    assert r1["fresh_is_slower"] is True
    print("connection setup cost:", r1)

    r2 = littles_law_pool_sizing()
    assert r2["required_pool_size_no_queueing"] > 1
    assert r2["simulated_work_ws_much_larger_than_trivial_round_trip"] is True
    print("Little's Law pool sizing:", r2)

    r3 = prepared_statement_transaction_pooling_caveat()
    assert r3["same_physical_backend_reused_throughout"] is True
    assert r3["execute_failed"] is True
    print("transaction-pooling prepared-statement caveat:", r3)

    r4 = session_pooling_same_prepared_statement_survives()
    assert r4["executed_successfully"] is True
    print("session-pooling contrast:", r4)

    r5 = server_side_cursor_batched_fetch()
    assert r5["server_cursor_rows_match"] is True
    assert r5["server_cursor_peaked_lower"] is True
    print("server-side cursor vs. fetchall peak RSS:", r5)

    r6 = bulk_load_comparison()
    assert r6["row_counts_match"] is True
    assert r6["copy_faster_than_executemany"] is True
    assert r6["adbc_much_faster_than_executemany"] is True
    print("bulk load comparison:", r6)

    print("connection-pooling-database-clients examples: all numbers check out")
