"""de.analytical-serving-layers — executable evidence.

Runs against a real, in-process DuckDB engine: the same aggregate query measured directly
against a raw fact table versus a precomputed materialized table, and the real freshness gap a
materialized table carries until it is refreshed. A real-time OLAP store's own ingestion-time
rollup (Druid, Pinot, ClickHouse) is sourced and named, not separately run, since this sandbox
does not stand up one of those systems as its own service.
"""

import random
import time

import duckdb

N_ROWS = 40_000_000
N_REGIONS = 8


def build_raw_table(con):
    con.execute("DROP TABLE IF EXISTS sales")
    con.execute(
        "CREATE TABLE sales AS "
        "SELECT (random() * {n_regions})::INT AS region, random() * 1000 AS amount "
        "FROM range({n_rows})".format(n_regions=N_REGIONS, n_rows=N_ROWS)
    )


def cold_scan_query(con):
    start = time.perf_counter()
    result = con.execute("SELECT region, SUM(amount) FROM sales GROUP BY region ORDER BY region").fetchall()
    return result, time.perf_counter() - start


def build_materialized_table(con):
    con.execute("DROP TABLE IF EXISTS sales_by_region")
    con.execute("CREATE TABLE sales_by_region AS SELECT region, SUM(amount) AS total FROM sales GROUP BY region")


def materialized_query(con):
    start = time.perf_counter()
    result = con.execute("SELECT region, total FROM sales_by_region ORDER BY region").fetchall()
    return result, time.perf_counter() - start


def measure_speedup():
    con = duckdb.connect()
    build_raw_table(con)

    cold_result, cold_seconds = cold_scan_query(con)
    build_materialized_table(con)
    mat_result, mat_seconds = materialized_query(con)

    assert [round(v, 0) for _, v in cold_result] == [round(v, 0) for _, v in mat_result]
    speedup = cold_seconds / mat_seconds
    con.close()
    return cold_seconds, mat_seconds, speedup


def measure_freshness_gap():
    con = duckdb.connect()
    build_raw_table(con)
    build_materialized_table(con)

    before_total = con.execute("SELECT SUM(total) FROM sales_by_region").fetchone()[0]

    # a real write lands in the raw table
    con.execute(f"INSERT INTO sales VALUES ({random.randint(0, N_REGIONS - 1)}, 999999)")

    raw_total_after_write = con.execute("SELECT SUM(amount) FROM sales").fetchone()[0]
    materialized_total_before_refresh = con.execute("SELECT SUM(total) FROM sales_by_region").fetchone()[0]
    write_visible_in_raw = abs(raw_total_after_write - (before_total + 999999)) < 1
    write_visible_in_materialized_before_refresh = abs(materialized_total_before_refresh - (before_total + 999999)) < 1

    build_materialized_table(con)
    materialized_total_after_refresh = con.execute("SELECT SUM(total) FROM sales_by_region").fetchone()[0]
    write_visible_in_materialized_after_refresh = abs(materialized_total_after_refresh - (before_total + 999999)) < 1

    con.close()
    return write_visible_in_raw, write_visible_in_materialized_before_refresh, write_visible_in_materialized_after_refresh


def run():
    cold_seconds, mat_seconds, speedup = measure_speedup()
    print(f"Cold scan of the raw table: {cold_seconds:.4f}s. The precomputed materialized table: {mat_seconds:.4f}s.")
    print(f"Measured speedup: {speedup:.0f}x, for the identical answer.")
    assert speedup > 20  # a real, large, measured gap — not a marginal one

    visible_raw, visible_before, visible_after = measure_freshness_gap()
    print(f"\nA real write to the raw table: visible in the raw table immediately: {visible_raw}.")
    print(f"Visible in the materialized table before a refresh: {visible_before}.")
    print(f"Visible in the materialized table after a refresh: {visible_after}.")
    assert visible_raw is True
    assert visible_before is False  # the real, measured freshness gap
    assert visible_after is True


if __name__ == "__main__":
    run()
