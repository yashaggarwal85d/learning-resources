# Real hands-on lab (CHAPTER.md: "built hands-on against a local DuckDB target"). `lab/shop_dbt/`
# is a real dbt-core project (dbt-core + dbt-duckdb): `dbt seed`, `dbt build` (5 models, 13 data
# tests, 1 unit test, 1 exposure), and `dbt docs generate` were all run for real, by hand, in this
# session — see `lab/README.md` for the actual commands and output, including a failing
# `relationships` data test deliberately introduced and shown to block every downstream model.
#
# This check reproduces the same seed data and the same model SQL directly in DuckDB (no dbt
# runtime needed to run this check) and verifies three things against the real dbt run's own
# numbers, copied from `lab/README.md`: the Jinja macro's cents-to-dollars conversion, the joined
# fact table, and the aggregated mart. It also checks `lab/manifest-dag.json`, a frozen snapshot
# of `target/manifest.json`'s own `depends_on` field written by the real `dbt build` above, so the
# DAG shown in the reel is read from dbt's own output, not hand-drawn.

import json
import os

import duckdb

LAB_DIR = os.path.join(os.path.dirname(__file__), "lab")


def build_schema(con):
    con.execute("""
        create table raw_customers (customer_id integer, customer_name varchar, region varchar)
    """)
    con.execute("""
        insert into raw_customers values
            (1, 'Ravi Shah', 'north'),
            (2, 'Mina Cole', 'south'),
            (3, 'Tomas Reyes', 'east'),
            (4, 'Aiko Tanaka', 'west'),
            (5, 'Lena Fischer', 'north')
    """)
    con.execute("""
        create table raw_products (product_id integer, product_name varchar, category varchar)
    """)
    con.execute("""
        insert into raw_products values
            (10, 'Steel Water Bottle', 'housewares'),
            (11, 'Canvas Tote', 'accessories'),
            (12, 'Desk Lamp', 'electronics'),
            (13, 'Notebook Set', 'stationery')
    """)
    con.execute("""
        create table raw_orders (
            order_id integer, customer_id integer, product_id integer, order_date date,
            quantity integer, amount_cents integer, status varchar
        )
    """)
    con.execute("""
        insert into raw_orders values
            (1, 1, 10, '2026-01-03', 2, 2998, 'completed'),
            (2, 2, 11, '2026-01-05', 1, 1899, 'completed'),
            (3, 3, 12, '2026-01-10', 1, 4599, 'completed'),
            (4, 1, 13, '2026-01-12', 3, 1797, 'completed'),
            (5, 4, 10, '2026-01-15', 1, 1499, 'cancelled'),
            (6, 2, 12, '2026-02-01', 2, 9198, 'completed'),
            (7, 5, 11, '2026-02-03', 1, 1899, 'completed'),
            (8, 3, 13, '2026-02-10', 4, 2396, 'completed'),
            (9, 1, 12, '2026-02-14', 1, 4599, 'completed'),
            (10, 4, 11, '2026-02-20', 2, 3798, 'completed')
    """)


def cents_to_dollars_sql(column):
    # The same expression lab/shop_dbt/macros/cents_to_dollars.sql renders for a model that calls
    # {{ cents_to_dollars('amount_cents') }} with its default decimals=2.
    return f"round(({column}) / 100.0, 2)"


def check():
    con = duckdb.connect()
    build_schema(con)

    stg_orders = con.execute(f"""
        select order_id, customer_id, product_id, order_date, quantity,
               {cents_to_dollars_sql('amount_cents')} as amount_dollars, status
        from raw_orders
    """).fetchall()

    by_id = {row[0]: row[5] for row in stg_orders}
    assert by_id[1] == 29.98, "macro-derived dollar amount for order 1 doesn't match the real dbt run"
    assert by_id[6] == 91.98, "macro-derived dollar amount for order 6 doesn't match the real dbt run"
    assert by_id[9] == 45.99, "macro-derived dollar amount for order 9 doesn't match the real dbt run"

    con.execute("""
        create table stg_orders as
        select order_id, customer_id, product_id, order_date, quantity,
    """ + cents_to_dollars_sql("amount_cents") + """ as amount_dollars, status
        from raw_orders
    """)

    fct_orders = con.execute("""
        select o.order_id, o.customer_id, o.product_id, o.amount_dollars, o.status,
               c.region, p.category
        from stg_orders o
        left join raw_customers c on o.customer_id = c.customer_id
        left join raw_products p on o.product_id = p.product_id
    """).fetchall()
    assert len(fct_orders) == 10, "fct_orders should have exactly one row per seeded order"

    mart = con.execute("""
        select c.region, round(sum(o.amount_dollars), 2) as total_revenue, count(*) as order_count
        from stg_orders o
        left join raw_customers c on o.customer_id = c.customer_id
        where o.status = 'completed'
        group by c.region
        order by c.region
    """).fetchall()

    expected_mart = [
        ("east", 69.95, 2),
        ("north", 112.93, 4),
        ("south", 110.97, 2),
        ("west", 37.98, 1),
    ]
    assert mart == expected_mart, (
        f"mart_revenue_by_region doesn't match the real dbt build's own output: {mart} != {expected_mart}"
    )

    con.close()

    with open(os.path.join(LAB_DIR, "manifest-dag.json")) as f:
        dag = json.load(f)

    assert set(dag["fct_orders"]) == {"stg_orders", "stg_customers", "stg_products"}, (
        "fct_orders should depend on exactly the three staging models it ref()s"
    )
    assert dag["mart_revenue_by_region"] == ["fct_orders"], (
        "mart_revenue_by_region should depend on exactly fct_orders"
    )
    for staging_model, raw_seed in [
        ("stg_orders", "raw_orders"),
        ("stg_customers", "raw_customers"),
        ("stg_products", "raw_products"),
    ]:
        assert dag[staging_model] == [raw_seed], (
            f"{staging_model} should depend on exactly its own seed, {raw_seed}"
        )

    print("dbt-models-tests-lineage examples: all numbers check out")


if __name__ == "__main__":
    check()
