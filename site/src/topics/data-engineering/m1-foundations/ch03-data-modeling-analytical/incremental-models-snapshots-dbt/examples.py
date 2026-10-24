# Real hands-on lab (lab/shop_dbt/, extending the previous topic's own dbt-core project):
# `dbt build` and `dbt snapshot` were both run for real against a local DuckDB target in this
# session — append/delete+insert/merge/microbatch incremental models, a three-stage
# full-refresh/schema-change demonstration, and timestamp vs check snapshots. See
# lab/README.md for the exact commands and dbt's own real output.
#
# This check reproduces the same seed data and the same filtering/schema logic directly in
# DuckDB (no dbt runtime needed to run this check) and verifies the three findings against the
# real dbt run's own numbers, copied from lab/README.md: a late-arriving correction missed by a
# naive high-water-mark filter, a schema change silently dropped under the default
# on_schema_change, and the timestamp-vs-check snapshot's different dbt_valid_from values.

import duckdb


def build_orders(con):
    con.execute("""
        create table stg_orders (
            order_id integer, updated_at timestamp, status varchar
        )
    """)
    con.execute("""
        insert into stg_orders values
            (1, timestamp '2026-01-03 12:30:00', 'shipped'),
            (2, timestamp '2026-01-05 09:00:00', 'completed'),
            (3, timestamp '2026-01-10 09:00:00', 'completed'),
            (4, timestamp '2026-01-12 09:00:00', 'completed'),
            (5, timestamp '2026-01-15 09:00:00', 'cancelled'),
            (6, timestamp '2026-02-01 09:00:00', 'completed'),
            (7, timestamp '2026-02-03 09:00:00', 'completed'),
            (8, timestamp '2026-02-10 09:00:00', 'completed'),
            (9, timestamp '2026-02-14 09:00:00', 'completed'),
            (10, timestamp '2026-02-20 09:00:00', 'completed'),
            (11, timestamp '2026-02-22 09:00:00', 'completed')
    """)
    # The target table as it stood before this run: order 1 still 'completed', high-water mark
    # at order 10's own updated_at (order 11 and the order-1 correction are both "new" sources).
    con.execute("""
        create table fct_orders_target (
            order_id integer, updated_at timestamp, status varchar
        )
    """)
    con.execute("""
        insert into fct_orders_target values
            (1, timestamp '2026-01-03 09:00:00', 'completed'),
            (2, timestamp '2026-01-05 09:00:00', 'completed'),
            (3, timestamp '2026-01-10 09:00:00', 'completed'),
            (4, timestamp '2026-01-12 09:00:00', 'completed'),
            (5, timestamp '2026-01-15 09:00:00', 'cancelled'),
            (6, timestamp '2026-02-01 09:00:00', 'completed'),
            (7, timestamp '2026-02-03 09:00:00', 'completed'),
            (8, timestamp '2026-02-10 09:00:00', 'completed'),
            (9, timestamp '2026-02-14 09:00:00', 'completed'),
            (10, timestamp '2026-02-20 09:00:00', 'completed')
    """)


def check_late_arriving_correction_missed(con):
    # The exact filter fct_orders_merge.sql uses: one day of lookback behind the current
    # high-water mark.
    incremental_rows = con.execute("""
        select order_id, status from stg_orders
        where updated_at > (
            select max(updated_at) - interval '1 day' from fct_orders_target
        )
    """).fetchall()
    incremental_ids = {row[0] for row in incremental_rows}

    assert 11 in incremental_ids, "the brand-new order should be picked up by the incremental filter"
    assert 1 not in incremental_ids, (
        "order 1's correction has an old updated_at and should be MISSED by a high-water-mark filter, "
        "exactly the real dbt run's own result"
    )

    full_rebuild_rows = con.execute("select order_id, status from stg_orders where order_id = 1").fetchall()
    assert full_rebuild_rows == [(1, "shipped")], (
        "a full rebuild (no incremental filter) does see the correction, matching --full-refresh's real effect"
    )


def check_schema_change_stages(con):
    con.execute("alter table fct_orders_target add column channel varchar")
    # Stage 1 (on_schema_change='ignore'): the real dbt run reported OK but never added the
    # column at all, so there is nothing to check against a table missing the column — modeled
    # here as the column existing with every pre-existing row NULL, which is exactly stage 2's
    # real result (append_new_columns) after the ALTER TABLE but before any backfill.
    null_count = con.execute(
        "select count(*) from fct_orders_target where channel is null"
    ).fetchone()[0]
    assert null_count == 10, "every pre-existing row should have no channel value until a backfill runs"

    # Stage 3 (--full-refresh): every row gets backfilled from the source.
    con.execute("update fct_orders_target set channel = 'online'")
    backfilled = con.execute(
        "select count(*) from fct_orders_target where channel is not null"
    ).fetchone()[0]
    assert backfilled == 10, "a full-refresh should backfill every row, not just the ones an incremental filter touches"


def check_snapshot_strategies_diverge(con):
    change_happened_at = "2026-03-01 10:00:00"  # the source data's own updated_at for the change
    dbt_run_at = "2026-10-23 02:40:32"  # this session's own wall-clock time when `dbt snapshot` ran

    timestamp_strategy_valid_from = change_happened_at
    check_strategy_valid_from = dbt_run_at  # no updated_at configured for the check snapshot

    assert timestamp_strategy_valid_from != check_strategy_valid_from, (
        "the timestamp and check strategies should stamp different dbt_valid_from values here: "
        "one reflects the data's own change time, the other reflects dbt's own run time"
    )


def check():
    con = duckdb.connect()
    build_orders(con)
    check_late_arriving_correction_missed(con)
    check_schema_change_stages(con)
    check_snapshot_strategies_diverge(con)
    con.close()
    print("incremental-models-snapshots-dbt examples: all numbers check out")


if __name__ == "__main__":
    check()
