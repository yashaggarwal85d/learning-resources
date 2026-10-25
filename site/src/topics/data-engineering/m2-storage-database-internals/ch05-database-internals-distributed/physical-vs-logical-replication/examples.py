"""One real experiment against this sandbox's own Postgres cluster. This sandbox's server runs
with wal_level = replica (a postmaster-context setting; changing it to logical requires a server
restart this sandbox's own harness denies as a shared-resource-modifying action — see
FACT-CHECK.md's Problem Solving section), so a real logical replication slot can't be created
here. A physical replication slot can, under the exact same setting already in effect, and it
retains WAL by the identical mechanism the documentation describes for replication slots in
general (topic's own quoted claim: slots "ensure that the primary server does not remove WAL
segments until they have been received"). This measures that retention directly, real and
unconsumed, exactly the "stalled consumer" shape the chapter names; what a logical slot's own
consumer would see instead (decoded row changes, not raw bytes) stays sourced from the
documentation. PostgreSQL 17's own failover-safe logical slots, named in the reel, are themselves
sourced-only here too, since this sandbox's own cluster runs PostgreSQL 16."""

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SLOT = "t18_demo_slot"
ROWS = 3000


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _drop_slot_if_exists(cur):
    cur.execute("SELECT 1 FROM pg_replication_slots WHERE slot_name = %s", (SLOT,))
    if cur.fetchone():
        cur.execute("SELECT pg_drop_replication_slot(%s)", (SLOT,))


def stalled_slot_retains_wal_until_consumed():
    """Create a real replication slot, write real WAL-generating traffic with nothing ever
    consuming the slot, and measure the WAL this sandbox's own server is retaining on the
    slot's behalf — the real, measured shape of the WAL-retention outage the syllabus names.
    Then advance the slot as a real consumer would and confirm the retained WAL drops back to
    nothing."""
    conn = connect()
    cur = conn.cursor()
    _drop_slot_if_exists(cur)

    cur.execute("SELECT pg_create_physical_replication_slot(%s, true)", (SLOT,))

    cur.execute("DROP TABLE IF EXISTS t18_wal_demo")
    cur.execute("CREATE TABLE t18_wal_demo (id SERIAL PRIMARY KEY, v TEXT)")
    for _ in range(ROWS):
        cur.execute("INSERT INTO t18_wal_demo (v) VALUES (repeat('x', 2000))")

    cur.execute(
        "SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) FROM pg_replication_slots WHERE slot_name = %s",
        (SLOT,),
    )
    (retained_bytes,) = cur.fetchone()
    print(f"stalled slot, {ROWS} rows written, nothing consuming: {int(retained_bytes):,} bytes of WAL retained")
    assert retained_bytes > 1_000_000, f"expected a stalled slot to retain a real, substantial amount of WAL, got {retained_bytes} bytes"

    cur.execute("SELECT pg_replication_slot_advance(%s, pg_current_wal_lsn())", (SLOT,))
    cur.execute(
        "SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) FROM pg_replication_slots WHERE slot_name = %s",
        (SLOT,),
    )
    (after_consuming,) = cur.fetchone()
    print(f"same slot, consumer catches up to the current position: {int(after_consuming):,} bytes of WAL retained")
    assert after_consuming == 0, f"expected a caught-up slot to retain nothing, got {after_consuming} bytes"

    _drop_slot_if_exists(cur)
    cur.execute("DROP TABLE t18_wal_demo")
    conn.close()
    return int(retained_bytes), int(after_consuming)


def main():
    stalled_slot_retains_wal_until_consumed()
    print("physical-vs-logical-replication examples: all checks pass")


if __name__ == "__main__":
    main()
