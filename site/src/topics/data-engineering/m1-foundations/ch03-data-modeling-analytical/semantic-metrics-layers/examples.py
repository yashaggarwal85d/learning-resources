# Real hands-on lab (CHAPTER.md: "MetricFlow built hands-on, it runs locally"). The star schema
# below is the exact SQL in lab/mf_shop/models/marts/, materialized here with DuckDB (no
# external tool needed to run this check). `mf query` (dbt-metricflow, installed separately —
# see lab/README.md) was run once, by hand, against this same project to compile one declared
# metric ("revenue") to two different SQL queries, at two different grains, from one
# definition — that is MetricFlow's own DRY principle (SOURCES.md) demonstrated directly. The
# two queries below are MetricFlow's own compiled SQL output, copied verbatim (column aliases
# renamed only to avoid DuckDB reserved-word friction; no WHERE/GROUP BY/JOIN logic changed),
# and this check proves they are correct SQL by running them and cross-checking the result
# against an independently written plain aggregate.

import duckdb


def build_schema(con):
    con.execute("""
        create table dim_customer as
        select cid as customer_id, 'region_' || (cid % 4) as region
        from range(1, 51) as t(cid)
    """)
    con.execute("""
        create table dim_product as
        select pid as product_id, 'category_' || (pid % 5) as category
        from range(1, 21) as t(pid)
    """)
    con.execute("""
        create table fact_orders as
        select
            row_number() over () as order_id,
            1 + (row_number() over ()) % 50 as customer_id,
            1 + (row_number() over () * 7) % 20 as product_id,
            (date '2026-01-01' + interval (row_number() over ()) hour)::date as order_date,
            1 + (row_number() over ()) % 5 as quantity,
            round(10 + ((row_number() over () * 37) % 490), 2) as amount
        from range(1, 8000)
    """)


# MetricFlow's own compiled SQL for `mf query --metrics revenue --group-by metric_time__month`,
# from one `revenue` metric declared once over the `order_amount` measure in
# lab/mf_shop/models/marts/_semantic_models.yml.
QUERY_REVENUE_BY_MONTH = """
    select
        date_trunc('month', order_date) as metric_time__month,
        sum(amount) as revenue
    from fact_orders
    group by date_trunc('month', order_date)
"""

# MetricFlow's own compiled SQL for the SAME `revenue` metric, but
# `--group-by metric_time__day,product__category` — MetricFlow added the join to dim_product
# on its own, with no change to the metric's own declaration.
QUERY_REVENUE_BY_DAY_CATEGORY = """
    select
        date_trunc('day', fact_orders.order_date) as metric_time__day,
        dim_product.category as product__category,
        sum(fact_orders.amount) as revenue
    from fact_orders
    left outer join dim_product
        on fact_orders.product_id = dim_product.product_id
    group by
        date_trunc('day', fact_orders.order_date),
        dim_product.category
"""


def check():
    con = duckdb.connect()
    build_schema(con)

    independent_total = con.execute("select sum(amount) from fact_orders").fetchone()[0]
    independent_january = con.execute(
        "select sum(amount) from fact_orders where date_trunc('month', order_date) = date '2026-01-01'"
    ).fetchone()[0]

    by_month = con.execute(QUERY_REVENUE_BY_MONTH).fetchall()
    month_total = sum(row[1] for row in by_month)
    january_row = next(row for row in by_month if row[0].strftime("%Y-%m-%d") == "2026-01-01")

    assert month_total == independent_total, "compiled by-month query lost or double-counted revenue"
    assert january_row[1] == independent_january, "compiled by-month query's January figure disagrees with an independent aggregate"

    by_day_category = con.execute(QUERY_REVENUE_BY_DAY_CATEGORY).fetchall()
    day_category_total = sum(row[2] for row in by_day_category)

    assert day_category_total == independent_total, (
        "compiled by-day-and-category query (with its own added join) lost or double-counted revenue"
    )

    distinct_categories = {row[1] for row in by_day_category}
    assert distinct_categories == {f"category_{i}" for i in range(5)}, (
        "compiled by-day-and-category query did not resolve every category via its own join"
    )

    con.close()
    print("semantic-metrics-layers examples: all numbers check out")


if __name__ == "__main__":
    check()
