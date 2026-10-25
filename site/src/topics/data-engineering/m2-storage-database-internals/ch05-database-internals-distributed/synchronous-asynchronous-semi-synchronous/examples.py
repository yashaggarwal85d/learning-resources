"""One real experiment against this sandbox's own Postgres cluster. This sandbox has no second
host, so it can't run a real primary/replica pair — but synchronous_commit is the exact same
acknowledgement-wait mechanism the PostgreSQL documentation describes for synchronous replication
(topic's own quoted claim: "each commit of a write transaction will wait until confirmation is
received that the commit has been written... to disk"), applied locally to the write-ahead log
instead of to a remote standby. Measuring its real cost here is a genuine, honest stand-in for the
same underlying wait a synchronous replica would add; the multi-host failover/lost-commit claims
themselves stay sourced directly from the documentation (see FACT-CHECK.md)."""

import time

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")

ROWS = 200


def connect(synchronous_commit: str):
    conn = psycopg2.connect(**DSN)
    conn.autocommit = False
    cur = conn.cursor()
    cur.execute(f"SET synchronous_commit = {synchronous_commit}")
    return conn


def _setup():
    setup = connect("on")
    cur = setup.cursor()
    cur.execute("DROP TABLE IF EXISTS sync_demo")
    cur.execute("CREATE TABLE sync_demo (id SERIAL PRIMARY KEY, v INTEGER)")
    setup.commit()
    setup.close()


def _timed_commits(synchronous_commit: str) -> float:
    conn = connect(synchronous_commit)
    cur = conn.cursor()
    start = time.perf_counter()
    for i in range(ROWS):
        cur.execute("INSERT INTO sync_demo (v) VALUES (%s)", (i,))
        conn.commit()
    elapsed = time.perf_counter() - start
    conn.close()
    return elapsed


def synchronous_commit_costs_latency():
    """synchronous_commit = on makes each commit wait for its own WAL record to be confirmed
    written to durable storage before returning — the same wait the documentation describes for a
    synchronous standby, just against local disk instead of a remote one. synchronous_commit = off
    lets the commit return immediately, the same local analogue of asynchronous replication's own
    no-wait acknowledgement. This measures the real, local cost of that wait, over the identical
    number of real commits run each way, against this sandbox's own Postgres cluster."""
    _setup()

    off_seconds = _timed_commits("off")
    on_seconds = _timed_commits("on")

    print(f"synchronous_commit = off: {ROWS} commits in {off_seconds:.3f}s ({1000 * off_seconds / ROWS:.2f}ms/commit)")
    print(f"synchronous_commit = on:  {ROWS} commits in {on_seconds:.3f}s ({1000 * on_seconds / ROWS:.2f}ms/commit)")

    assert on_seconds > off_seconds * 1.2, (
        f"expected waiting for confirmation (on) to cost measurably more than not waiting (off), "
        f"got on={on_seconds:.3f}s vs off={off_seconds:.3f}s"
    )
    print("synchronous_commit: waiting for confirmation measurably costs real commit latency")
    return off_seconds, on_seconds


def main():
    synchronous_commit_costs_latency()
    print("synchronous-asynchronous-semi-synchronous examples: all checks pass")


if __name__ == "__main__":
    main()
