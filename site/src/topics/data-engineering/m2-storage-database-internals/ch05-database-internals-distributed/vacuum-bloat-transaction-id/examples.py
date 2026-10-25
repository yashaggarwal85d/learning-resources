import time
import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
N_ROWS = 300


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn, conn.cursor()


def wait_for(cur, query, params, predicate, timeout=6.0, interval=0.3):
    """pg_stat_user_tables is refreshed asynchronously by the stats collector, not synchronously
    by the DML that changed it, so reading it right after an UPDATE/DELETE/VACUUM can see a stale
    value for up to a second or two. Poll until the real value satisfies predicate."""
    deadline = time.time() + timeout
    value = None
    while time.time() < deadline:
        cur.execute(query, params)
        value = cur.fetchone()[0]
        if predicate(value):
            return value
        time.sleep(interval)
    return value


def hot_updates_skip_the_index(cur):
    cur.execute("DROP TABLE IF EXISTS idx_demo")
    cur.execute("CREATE TABLE idx_demo (id serial PRIMARY KEY, indexed_val int, plain_val int)")
    cur.execute("CREATE INDEX idx_demo_indexed_val_idx ON idx_demo (indexed_val)")
    cur.execute("INSERT INTO idx_demo (indexed_val, plain_val) SELECT 0, 0 FROM generate_series(1, %s)", (N_ROWS,))
    cur.execute("VACUUM idx_demo")

    def index_size():
        cur.execute("SELECT pg_relation_size('idx_demo_indexed_val_idx')")
        return cur.fetchone()[0]

    base_size = index_size()

    for i in range(N_ROWS):
        cur.execute("UPDATE idx_demo SET plain_val = %s WHERE id = %s", (i, i + 1))
    after_hot_size = index_size()

    for i in range(N_ROWS):
        cur.execute("UPDATE idx_demo SET indexed_val = %s WHERE id = %s", (i + 1000, i + 1))
    after_nonhot_size = index_size()

    assert after_hot_size == base_size, (
        f"{N_ROWS} updates to an unindexed column should leave the index's own size unchanged, "
        f"got {base_size} -> {after_hot_size}"
    )
    assert after_nonhot_size > after_hot_size, (
        f"{N_ROWS} updates to the indexed column should grow the index, got {after_hot_size} -> {after_nonhot_size}"
    )

    print(
        f"index size before any update: {base_size} bytes\n"
        f"after {N_ROWS} updates to an unindexed column (HOT-eligible): {after_hot_size} bytes, unchanged\n"
        f"after {N_ROWS} updates to the indexed column (not HOT-eligible): {after_nonhot_size} bytes"
    )
    return base_size, after_hot_size, after_nonhot_size


def dead_tuples_reclaimed_by_vacuum(cur):
    cur.execute("DROP TABLE IF EXISTS dead_tuple_demo")
    cur.execute("CREATE TABLE dead_tuple_demo (id serial PRIMARY KEY, val int)")
    cur.execute("INSERT INTO dead_tuple_demo (val) SELECT 0 FROM generate_series(1, %s)", (N_ROWS,))
    cur.execute("VACUUM dead_tuple_demo")

    dead_query = "SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'dead_tuple_demo'"
    baseline = wait_for(cur, dead_query, (), lambda v: v == 0)
    assert baseline == 0, f"a freshly vacuumed table should report 0 dead tuples, got {baseline}"

    cur.execute("DELETE FROM dead_tuple_demo WHERE id <= %s", (N_ROWS // 2,))
    after_delete = wait_for(cur, dead_query, (), lambda v: v is not None and v > 0)
    assert after_delete >= N_ROWS // 2 - 5, f"deleting half the rows should leave ~{N_ROWS // 2} dead tuples, got {after_delete}"

    cur.execute("VACUUM dead_tuple_demo")
    after_vacuum = wait_for(cur, dead_query, (), lambda v: v == 0)
    assert after_vacuum == 0, f"VACUUM should reclaim the dead tuples it just created, got {after_vacuum}"

    print(
        f"dead tuples after deleting {N_ROWS // 2} of {N_ROWS} rows: {after_delete}\n"
        f"dead tuples after VACUUM: {after_vacuum}"
    )
    return after_delete, after_vacuum


def xmin_horizon_pins_the_cleanup():
    conn_a, cur_a = connect()
    conn_a.autocommit = False
    conn_b, cur_b = connect()
    conn_c, cur_c = connect()

    cur_c.execute("DROP TABLE IF EXISTS bloat_demo")
    cur_c.execute("CREATE TABLE bloat_demo (id serial PRIMARY KEY, val int)")
    cur_c.execute("INSERT INTO bloat_demo (val) SELECT 0 FROM generate_series(1, 200)")
    cur_c.execute("VACUUM bloat_demo")

    dead_query = "SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'bloat_demo'"

    def size():
        cur_c.execute("SELECT pg_total_relation_size('bloat_demo')")
        return cur_c.fetchone()[0]

    baseline_dead = wait_for(cur_c, dead_query, (), lambda v: v == 0)
    baseline_size = size()

    cur_a.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
    cur_a.execute("SELECT count(*) FROM bloat_demo")  # pins transaction A's snapshot, hence its xmin horizon

    for i in range(600):
        cur_b.execute("UPDATE bloat_demo SET val = %s WHERE id = %s", (i, (i % 200) + 1))

    cur_c.execute("VACUUM bloat_demo")  # A's open snapshot may still need the old versions: nothing to reclaim
    pinned_dead = wait_for(cur_c, dead_query, (), lambda v: v is not None and v > 0)
    pinned_size = size()

    cur_a.execute("COMMIT")
    conn_a.close()

    cur_c.execute("VACUUM bloat_demo")
    released_dead = wait_for(cur_c, dead_query, (), lambda v: v == 0)
    released_size = size()

    conn_b.close()
    conn_c.close()

    assert pinned_dead > 0, f"VACUUM should be unable to reclaim anything while A is still open, got {pinned_dead}"
    assert pinned_size >= baseline_size, f"the table should not shrink while A is open, got {pinned_size} vs {baseline_size}"
    assert released_dead == 0, f"VACUUM after releasing A should reclaim everything, got {released_dead}"

    print(
        f"baseline: {baseline_dead} dead tuples, {baseline_size} bytes\n"
        f"600 updates run while a transaction is held open, then VACUUM: {pinned_dead} dead tuples still unreclaimed, {pinned_size} bytes\n"
        f"after releasing that transaction and vacuuming again: {released_dead} dead tuples, {released_size} bytes"
    )
    return baseline_dead, baseline_size, pinned_dead, pinned_size, released_dead, released_size


def freezing_advances_relfrozenxid(cur):
    cur.execute("DROP TABLE IF EXISTS freeze_demo")
    cur.execute("CREATE TABLE freeze_demo (id serial PRIMARY KEY, val int)")
    cur.execute("INSERT INTO freeze_demo (val) SELECT 0 FROM generate_series(1, 50)")

    def age():
        cur.execute("SELECT age(relfrozenxid) FROM pg_class WHERE relname = 'freeze_demo'")
        return cur.fetchone()[0]

    age_before = age()
    cur.execute("VACUUM FREEZE freeze_demo")
    age_after = age()

    assert age_after < age_before, f"VACUUM FREEZE should advance relfrozenxid (lower its age), got {age_before} -> {age_after}"
    assert age_after <= 1, f"a table just frozen should have an age of 0 or 1, got {age_after}"

    print(f"age(relfrozenxid) before VACUUM FREEZE: {age_before}, right after: {age_after}")
    return age_before, age_after


def main():
    conn, cur = connect()
    hot_updates_skip_the_index(cur)
    dead_tuples_reclaimed_by_vacuum(cur)
    freezing_advances_relfrozenxid(cur)
    conn.close()

    xmin_horizon_pins_the_cleanup()

    print("vacuum-bloat-transaction-id examples: all checks pass")


if __name__ == "__main__":
    main()
