"""
Real measurements against this sandbox's own PostgreSQL 16 cluster (database `learnshop`),
using the `pageinspect` extension to read a real B-tree index's own on-disk structure rather
than diagram an abstraction.

The Lehman-Yao concurrency algorithm and the InnoDB clustered-vs-secondary-index lookup cost
are sourced directly from Postgres's own nbtree README and MariaDB's own documentation
(quoted and discussed in SOURCES.md and FACT-CHECK.md) rather than reproduced as a live
measurement: this sandbox has no InnoDB engine to measure directly, and reproducing a real
concurrent page split under the Lehman-Yao protocol would require instrumenting Postgres's own
internals beyond what SQL can observe.
"""

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")

N_ROWS = 50_000
N_MIDRANGE_INSERTS = 4_000


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS pageinspect")
    return conn, cur


def _index_pages(cur, index_name):
    cur.execute("SELECT pg_relation_size(%s) / current_setting('block_size')::int", (index_name,))
    (pages,) = cur.fetchone()
    return int(pages)


def _tree_level(cur, index_name):
    cur.execute("SELECT level FROM bt_metap(%s)", (index_name,))
    (level,) = cur.fetchone()
    return int(level)


def fanout_bounds_lookup_depth_despite_many_rows(cur):
    cur.execute("DROP TABLE IF EXISTS btree_fanout_demo")
    cur.execute("CREATE TABLE btree_fanout_demo (id bigint PRIMARY KEY, payload text) WITH (autovacuum_enabled = off)")
    cur.execute(
        "INSERT INTO btree_fanout_demo SELECT g, repeat('x', 40) FROM generate_series(1, %s) g",
        (N_ROWS,),
    )
    cur.execute("ANALYZE btree_fanout_demo")

    level = _tree_level(cur, "btree_fanout_demo_pkey")
    pages = _index_pages(cur, "btree_fanout_demo_pkey")
    cur.execute("SELECT count(*) FROM btree_fanout_demo")
    (rows,) = cur.fetchone()

    cur.execute("DROP TABLE btree_fanout_demo")
    return level, pages, rows


def fillfactor_changes_split_count_under_midrange_inserts(cur):
    cur.execute("DROP TABLE IF EXISTS btree_fillfactor_demo")
    cur.execute("CREATE TABLE btree_fillfactor_demo (id bigint, payload text) WITH (autovacuum_enabled = off)")
    cur.execute(
        "INSERT INTO btree_fillfactor_demo SELECT g * 10, repeat('x', 40) FROM generate_series(1, %s) g",
        (N_ROWS,),
    )

    cur.execute("CREATE INDEX btree_ff_tight ON btree_fillfactor_demo (id) WITH (fillfactor = 100)")
    cur.execute("CREATE INDEX btree_ff_loose ON btree_fillfactor_demo (id) WITH (fillfactor = 10)")

    pages_tight_before = _index_pages(cur, "btree_ff_tight")
    pages_loose_before = _index_pages(cur, "btree_ff_loose")

    # Midrange inserts: ids that fall strictly between existing keys (id*10 + 1..9), so every
    # insert lands inside an existing leaf page's key range rather than appending at the end.
    cur.execute(
        "INSERT INTO btree_fillfactor_demo "
        "SELECT (g %% %s) * 10 + 1 + (g %% 9), repeat('x', 40) "
        "FROM generate_series(1, %s) g",
        (N_ROWS, N_MIDRANGE_INSERTS),
    )

    pages_tight_after = _index_pages(cur, "btree_ff_tight")
    pages_loose_after = _index_pages(cur, "btree_ff_loose")

    cur.execute("DROP TABLE btree_fillfactor_demo")
    return (pages_tight_after - pages_tight_before), (pages_loose_after - pages_loose_before)


def deduplication_reduces_index_size_with_many_duplicates(cur):
    cur.execute("DROP TABLE IF EXISTS btree_dedup_demo")
    cur.execute("CREATE TABLE btree_dedup_demo (status int, payload text) WITH (autovacuum_enabled = off)")
    # Heavy duplication: only 10 distinct values across many rows.
    cur.execute(
        "INSERT INTO btree_dedup_demo SELECT g %% 10, repeat('x', 40) FROM generate_series(1, %s) g",
        (N_ROWS,),
    )

    cur.execute("CREATE INDEX btree_dedup_on ON btree_dedup_demo (status) WITH (deduplicate_items = on)")
    cur.execute("CREATE INDEX btree_dedup_off ON btree_dedup_demo (status) WITH (deduplicate_items = off)")

    pages_on = _index_pages(cur, "btree_dedup_on")
    pages_off = _index_pages(cur, "btree_dedup_off")

    cur.execute("DROP TABLE btree_dedup_demo")
    return pages_on, pages_off


def main():
    conn, cur = connect()
    try:
        level, pages, rows = fanout_bounds_lookup_depth_despite_many_rows(cur)
        print(f"fanout: {rows} rows, tree level (root height) = {level}, {pages} total index pages")
        assert level <= 2, f"expected the tree to stay at or under 3 levels (level<=2) for {rows} rows, got level={level}"

        tight_growth, loose_growth = fillfactor_changes_split_count_under_midrange_inserts(cur)
        print(f"fillfactor=100 index grew by {tight_growth} pages; fillfactor=10 index grew by {loose_growth} pages, under identical midrange inserts")
        assert tight_growth > loose_growth, (
            f"expected the tight (fillfactor=100) index to grow by more pages under midrange inserts than the loose (fillfactor=10) index, "
            f"got {tight_growth} (tight) vs {loose_growth} (loose)"
        )

        pages_on, pages_off = deduplication_reduces_index_size_with_many_duplicates(cur)
        print(f"deduplication on: {pages_on} pages; deduplication off: {pages_off} pages, for the same heavily-duplicated column")
        assert pages_on < pages_off, f"expected deduplication to reduce index size, got {pages_on} (on) vs {pages_off} (off)"
    finally:
        cur.close()
        conn.close()
    print("b-tree-indexes-production examples: all checks pass")


if __name__ == "__main__":
    main()
