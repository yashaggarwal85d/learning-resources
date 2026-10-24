"""
Real measurements against this sandbox's own PostgreSQL 16 cluster (database `learnshop`),
reading pg_control_checkpoint() and pg_stat_wal directly rather than diagram an abstraction.

The ARIES-style analysis/redo/undo contrast is sourced from Postgres's own WAL documentation
and the ARIES paper's own citation (quoted and discussed in SOURCES.md and FACT-CHECK.md)
rather than reproduced as a live measurement: this sandbox has no second engine running
ARIES-style undo-pass recovery to measure directly, and Postgres's own recovery path never
performs an undo pass to time.
"""

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")

N_ROWS = 2000
N_ROUNDS = 10


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    return conn, cur


def _redo_lsn(cur):
    cur.execute("SELECT redo_lsn FROM pg_control_checkpoint()")
    (lsn,) = cur.fetchone()
    return lsn


def _current_lsn(cur):
    cur.execute("SELECT pg_current_wal_lsn()")
    (lsn,) = cur.fetchone()
    return lsn


def _wal_fpi(cur):
    cur.execute("SELECT pg_stat_force_next_flush()")
    cur.execute("SELECT wal_fpi FROM pg_stat_wal")
    (fpi,) = cur.fetchone()
    return fpi


def _lsn_gap_bytes(cur, from_lsn, to_lsn):
    cur.execute("SELECT %s::pg_lsn - %s::pg_lsn", (to_lsn, from_lsn))
    (gap,) = cur.fetchone()
    return int(gap)


def _make_table(cur, name):
    cur.execute(f"DROP TABLE IF EXISTS {name}")
    cur.execute(f"CREATE TABLE {name} (id int PRIMARY KEY, payload text) WITH (autovacuum_enabled = off)")
    cur.execute(f"INSERT INTO {name} SELECT g, repeat('x', 200) FROM generate_series(1, {N_ROWS}) g")
    cur.execute(f"CHECKPOINT")


def frequent_checkpoints_bound_replay_distance_but_cost_more_fpi(cur):
    _make_table(cur, "ckpt_frequent")

    fpi_before = _wal_fpi(cur)
    for _ in range(N_ROUNDS):
        cur.execute("UPDATE ckpt_frequent SET payload = payload")
        cur.execute("CHECKPOINT")
    fpi_after_rounds = _wal_fpi(cur)
    fpi_total = fpi_after_rounds - fpi_before

    redo_lsn_after_rounds = _redo_lsn(cur)
    cur.execute("UPDATE ckpt_frequent SET payload = payload")
    current_lsn = _current_lsn(cur)
    replay_gap = _lsn_gap_bytes(cur, redo_lsn_after_rounds, current_lsn)

    cur.execute("DROP TABLE ckpt_frequent")
    return fpi_total, replay_gap


def infrequent_checkpoints_cost_less_fpi_but_widen_replay_distance(cur):
    _make_table(cur, "ckpt_infrequent")

    checkpoint_lsn = _redo_lsn(cur)
    fpi_before = _wal_fpi(cur)
    for _ in range(N_ROUNDS):
        cur.execute("UPDATE ckpt_infrequent SET payload = payload")
    fpi_after_rounds = _wal_fpi(cur)
    fpi_total = fpi_after_rounds - fpi_before

    cur.execute("UPDATE ckpt_infrequent SET payload = payload")
    current_lsn = _current_lsn(cur)
    replay_gap = _lsn_gap_bytes(cur, checkpoint_lsn, current_lsn)

    cur.execute("DROP TABLE ckpt_infrequent")
    return fpi_total, replay_gap


def main():
    conn, cur = connect()
    try:
        fpi_frequent, gap_frequent = frequent_checkpoints_bound_replay_distance_but_cost_more_fpi(cur)
        fpi_infrequent, gap_infrequent = infrequent_checkpoints_cost_less_fpi_but_widen_replay_distance(cur)

        print(f"frequent checkpoints:   {fpi_frequent} full-page images, {gap_frequent} bytes to replay after the last checkpoint")
        print(f"infrequent checkpoints: {fpi_infrequent} full-page images, {gap_infrequent} bytes to replay after the last checkpoint")

        assert fpi_frequent > fpi_infrequent, (
            f"expected frequent checkpoints to cost more full-page images, got {fpi_frequent} (frequent) vs {fpi_infrequent} (infrequent)"
        )
        assert gap_infrequent > gap_frequent, (
            f"expected infrequent checkpoints to widen the real replay distance, got {gap_infrequent} (infrequent) vs {gap_frequent} (frequent)"
        )
        # The trade-off is structural, not marginal: an order of magnitude in each direction
        # for this workload's own real, measured numbers.
        assert fpi_frequent >= fpi_infrequent * (N_ROUNDS * 0.5), f"expected the fpi gap to scale with N_ROUNDS, got {fpi_frequent} vs {fpi_infrequent}"
        assert gap_infrequent >= gap_frequent * (N_ROUNDS * 0.5), f"expected the replay-distance gap to scale with N_ROUNDS, got {gap_infrequent} vs {gap_frequent}"
    finally:
        cur.close()
        conn.close()
    print("checkpoints-crash-recovery examples: all checks pass")


if __name__ == "__main__":
    main()
