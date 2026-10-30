"""Three real experiments against this sandbox's own Postgres cluster: a primary on port 5432
and a real streaming-replication standby this topic's own setup built on port 5434 (a second,
genuinely separate data directory and postmaster, not a mock). `pg_wal_replay_pause()` and
`pg_wal_replay_resume()` on the standby create a real, controllable lag window — the standby
really does stop applying WAL while paused, and really does catch up once resumed — rather than
relying on a timing race to make the lag visible. Multi-node leader-kill failover timing needs a
second real host this sandbox doesn't have; that is disclosed as sourced-only in SOURCES.md,
following the chapter's own honest-gap pattern."""

import time

import psycopg2

PRIMARY_DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
STANDBY_DSN = dict(host="127.0.0.1", port=5434, dbname="learnshop", user="postgres", password="postgres")


def connect(dsn):
    conn = psycopg2.connect(**dsn)
    conn.autocommit = True
    return conn


def _setup_table(cur):
    cur.execute("DROP TABLE IF EXISTS t19_orders")
    cur.execute("CREATE TABLE t19_orders (id SERIAL PRIMARY KEY, status TEXT NOT NULL)")


def read_your_writes_breaks_on_a_paused_replica():
    """Pause the standby's WAL replay (a real, measurable stop: the standby keeps receiving WAL
    over the network but stops applying it). Write a new order on the primary and commit it.
    Read the same table on the paused standby: the row the client itself just wrote is missing,
    because the standby's visible state is frozen at the moment of the pause. This is read-your-writes
    broken, reproduced as an actual query result, not asserted from a timing guess."""
    primary = connect(PRIMARY_DSN)
    pcur = primary.cursor()
    _setup_table(pcur)

    standby = connect(STANDBY_DSN)
    scur = standby.cursor()
    scur.execute("SELECT pg_wal_replay_pause()")

    pcur.execute("INSERT INTO t19_orders (status) VALUES ('placed') RETURNING id")
    (new_id,) = pcur.fetchone()

    scur.execute("SELECT count(*) FROM t19_orders WHERE id = %s", (new_id,))
    (count_while_paused,) = scur.fetchone()

    scur.execute("SELECT pg_wal_replay_pause()")  # harmless no-op if already paused; confirms state
    standby.close()
    primary.close()
    assert count_while_paused == 0, "expected the just-written row to be invisible on a paused replica"
    return new_id, count_while_paused


def lsn_token_fixes_read_your_writes():
    """Repeat the identical write. This time capture the primary's LSN at commit as a token,
    resume the standby, and poll the standby's own replay position until it has reached or passed
    that token before issuing the read -- the real LSN-token fix the syllabus names, not a sleep
    guessed to be long enough."""
    primary = connect(PRIMARY_DSN)
    pcur = primary.cursor()

    standby = connect(STANDBY_DSN)
    scur = standby.cursor()
    scur.execute("SELECT pg_wal_replay_pause()")

    pcur.execute("INSERT INTO t19_orders (status) VALUES ('placed') RETURNING id")
    (new_id,) = pcur.fetchone()
    pcur.execute("SELECT pg_current_wal_lsn()")
    (token_lsn,) = pcur.fetchone()

    scur.execute("SELECT count(*) FROM t19_orders WHERE id = %s", (new_id,))
    (count_before_resume,) = scur.fetchone()
    assert count_before_resume == 0, "sanity check: still paused, row should still be invisible"

    scur.execute("SELECT pg_wal_replay_resume()")

    deadline = time.monotonic() + 10
    caught_up = False
    while time.monotonic() < deadline:
        scur.execute("SELECT pg_last_wal_replay_lsn() >= %s::pg_lsn", (token_lsn,))
        (caught_up,) = scur.fetchone()
        if caught_up:
            break
        time.sleep(0.05)
    assert caught_up, "standby never reached the write's LSN within the deadline"

    scur.execute("SELECT count(*) FROM t19_orders WHERE id = %s", (new_id,))
    (count_after_token_wait,) = scur.fetchone()
    standby.close()
    primary.close()
    assert count_after_token_wait == 1, "expected the write to be visible once the LSN token's position was reached"
    return new_id, count_after_token_wait


def measure_real_replication_lag_under_write_load(num_rows=2000):
    """Write a batch of rows to the primary as fast as the connection allows, then measure the
    real lag Postgres's own pg_stat_replication reports for the standby: write_lag, flush_lag and
    replay_lag, each a real interval this server computed, not a value this script invents."""
    primary = connect(PRIMARY_DSN)
    pcur = primary.cursor()

    for i in range(num_rows):
        pcur.execute("INSERT INTO t19_orders (status) VALUES (%s)", (f"bulk-{i}",))

    pcur.execute(
        "SELECT write_lag, flush_lag, replay_lag FROM pg_stat_replication WHERE application_name != 'standby_slot_backup'"
    )
    row = pcur.fetchone()
    primary.close()
    return row  # (write_lag, flush_lag, replay_lag) as real pg intervals (may be None if caught up instantly)


def single_replica_session_cannot_violate_monotonic_reads():
    """With exactly one replica in a session's path, reads from it are monotonic by construction:
    replay only ever moves a replica's visible state forward, so a second read on the same
    connection can never see less than the first. Demonstrate this directly: read, pause replay,
    read again on the same connection, and confirm the second read's row count never drops below
    the first's. A real monotonic-reads *violation* needs a session bounced between two replicas
    with independently varying lag -- a second-replica scenario named and sourced, not built here,
    since one replica cannot produce the anomaly it's meant to illustrate."""
    standby = connect(STANDBY_DSN)
    scur = standby.cursor()
    scur.execute("SELECT pg_wal_replay_resume()")  # ensure not left paused from an earlier run
    time.sleep(0.2)
    scur.execute("SELECT count(*) FROM t19_orders")
    (first_count,) = scur.fetchone()

    scur.execute("SELECT pg_wal_replay_pause()")
    scur.execute("SELECT count(*) FROM t19_orders")
    (second_count,) = scur.fetchone()
    scur.execute("SELECT pg_wal_replay_resume()")
    standby.close()
    assert second_count >= first_count, "a single replica's reads should never move backward"
    return first_count, second_count


def consistent_prefix_reads_hold_through_a_single_replicas_replay():
    """Write two causally dependent rows (order_placed, then order_shipped referencing it) while
    the standby is paused, resume replay, and poll until both are visible. Consistent-prefix reads
    forbid seeing an effect without its cause in the same order writes actually committed; a single
    standby replaying one WAL stream in commit order can never violate this, so the experiment is
    the trivial-but-real case this sandbox can produce: it checks shipped is never visible without
    placed, across 20 repeated poll intervals while replay catches up from a pause."""
    primary = connect(PRIMARY_DSN)
    pcur = primary.cursor()

    standby = connect(STANDBY_DSN)
    scur = standby.cursor()
    scur.execute("SELECT pg_wal_replay_pause()")

    pcur.execute("INSERT INTO t19_orders (status) VALUES ('placed') RETURNING id")
    (placed_id,) = pcur.fetchone()
    pcur.execute("INSERT INTO t19_orders (status) VALUES ('shipped') RETURNING id")
    (shipped_id,) = pcur.fetchone()

    scur.execute("SELECT pg_wal_replay_resume()")

    violations = 0
    for _ in range(20):
        scur.execute("SELECT count(*) FROM t19_orders WHERE id = %s", (placed_id,))
        (placed_visible,) = scur.fetchone()
        scur.execute("SELECT count(*) FROM t19_orders WHERE id = %s", (shipped_id,))
        (shipped_visible,) = scur.fetchone()
        if shipped_visible and not placed_visible:
            violations += 1
        time.sleep(0.02)
    standby.close()
    primary.close()
    assert violations == 0, "a single replica replaying one WAL stream showed shipped before placed"
    return violations


def main():
    read_your_writes_breaks_on_a_paused_replica()
    lsn_token_fixes_read_your_writes()
    lag = measure_real_replication_lag_under_write_load()
    single_replica_session_cannot_violate_monotonic_reads()
    consistent_prefix_reads_hold_through_a_single_replicas_replay()
    print(f"measured replication lag under load: write_lag={lag[0]}, flush_lag={lag[1]}, replay_lag={lag[2]}")
    print("replication-lag-session-guarantees examples: all checks pass")


if __name__ == "__main__":
    main()
