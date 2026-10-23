# Lab — `shop_dbt`, a real dbt-core project

A small dbt-core project over a synthetic shop dataset, built and run against a local DuckDB
target. No cloud account, warehouse, or network access needed.

## Setup

```
python3 -m venv /tmp/dbt_venv
/tmp/dbt_venv/bin/pip install dbt-core dbt-duckdb
```

No packaging workaround was needed for `dbt-core`/`dbt-duckdb` (unlike `dbt-metricflow` in the
previous topic, which needed a `setuptools<70` pin for a `halo` wheel build failure).

`~/.dbt/profiles.yml`:

```yaml
shop_dbt:
  target: dev
  outputs:
    dev:
      type: duckdb
      path: /tmp/dbt_lab/shop_dbt/shop.duckdb
      threads: 4
```

## Project structure

- `seeds/raw_customers.csv`, `raw_products.csv`, `raw_orders.csv` — the raw input data, loaded
  by `dbt seed`. `raw_orders.csv` stores `amount_cents` (integer cents) deliberately, to give
  the Jinja macro below a real job to do.
- `macros/cents_to_dollars.sql` — a Jinja macro, `cents_to_dollars(column_name, decimals=2)`,
  used once in `stg_orders.sql` instead of repeating the same `round(x / 100.0, 2)` expression
  everywhere a dollar amount is derived.
- `models/staging/stg_customers.sql`, `stg_products.sql`, `stg_orders.sql` — one `select`
  statement each, each one depending on its seed via `{{ ref('raw_...') }}`.
- `models/marts/fct_orders.sql` — joins all three staging models via `ref()`, no hardcoded
  table names anywhere.
- `models/marts/mart_revenue_by_region.sql` — aggregates `fct_orders` by region, depending on it
  via `ref()`.
- `models/staging/_staging.yml`, `models/marts/_marts.yml` — data tests (`unique`, `not_null`,
  `relationships`, `accepted_values`) and one dbt-native unit test on `stg_orders`.
- `tests/assert_positive_amount.sql` — one singular data test: no order's `amount_dollars` is
  zero or negative.
- `models/exposures.yml` — one exposure, `regional_revenue_dashboard`, declared as depending on
  `mart_revenue_by_region`.

## Running it

```
export DBT_PROFILES_DIR=~/.dbt
cd lab/shop_dbt
dbt seed
dbt build
dbt docs generate
```

`dbt build` output, run for real in this session (`PASS=22 WARN=0 ERROR=0 SKIP=0 NO-OP=1
TOTAL=23`): 3 seeds load, 3 staging views and 2 mart tables build in dependency order, 13 data
tests and 1 unit test all pass, and the one exposure is a `NO-OP` (exposures declare a downstream
consumer; they don't build anything themselves).

### The DAG, read from the project's own manifest after a real build

```
fct_orders              <- stg_orders, stg_customers, stg_products
mart_revenue_by_region  <- fct_orders
stg_products             <- raw_products
stg_customers            <- raw_customers
stg_orders               <- raw_orders
```

This is `scripts/next-topic.mjs`-style exact output of parsing `target/manifest.json`'s
`depends_on.nodes` for every model node after `dbt build` — not a hand-drawn diagram. Every edge
traces back to a `{{ ref(...) }}` call in the model's own SQL.

### A failing data test actually blocking its downstream models

To prove dbt enforces the DAG rather than merely drawing it, `raw_orders.csv`'s row 5 was
edited to reference a `customer_id` of `99`, which does not exist in `raw_customers.csv`, then
`dbt seed && dbt build --select stg_orders+` was run again:

```
6 of 14 FAIL 1 relationships_stg_orders_customer_id__customer_id__ref_stg_customers_
8 of 14 SKIP relation main.fct_orders
12 of 14 SKIP relation main.mart_revenue_by_region
13 of 14 SKIP exposure regional_revenue_dashboard
Done. PASS=6 WARN=0 ERROR=1 SKIP=7 NO-OP=0 REUSED=0 TOTAL=14
```

The `relationships` test (one of dbt's four built-in generic data tests) failed, and dbt skipped
every downstream model and the exposure rather than building on top of bad data. The row was
then reverted to `customer_id: 4` and `dbt build` was re-run clean (`PASS=22`, `ERROR=0`).

### The unit test, run in isolation

```
dbt test --select test_type:unit
```

passes without touching the seeded data at all — `test_cents_to_dollars_conversion` feeds two
fixed input rows (999 cents, 100 cents) straight into `stg_orders`'s own compiled logic and
checks the output (9.99, 1.00), verifying the macro's rounding and the division by 100 before a
single row of real data is ever loaded.

### Prove it: a model that skips `ref()` and writes the table name directly

A fourth mart model was added temporarily, deliberately selecting from `main.stg_orders` by its
literal table name instead of `{{ ref('stg_orders') }}`:

```sql
select order_id, amount_dollars
from main.stg_orders
where amount_dollars > 20
```

Run with `dbt build --threads 8` against a fresh (deleted) database, this failed for real:

```
ERROR: in model bad_model_no_ref (models/marts/bad_model_no_ref.sql)
Runtime Error in model bad_model_no_ref (models/marts/bad_model_no_ref.sql)
Catalog Error: Table with name stg_orders does not exist!
Did you mean "raw_orders"?
```

Because the new model never calls `ref('stg_orders')`, dbt's dependency graph has no edge into
it at all — dbt scheduled it to run concurrently with `stg_orders` instead of after it, and it
lost the race. The model was removed again and `dbt build` re-run clean (`PASS=22`, `ERROR=0`).
This is the concrete version of the "Prove it" scenario in the reel: skipping `ref()` doesn't
just hide an edge from the lineage diagram, it can make the build itself non-deterministic.

### Docs and lineage

`dbt docs generate` writes `target/manifest.json` and `target/catalog.json` — the same
project-structure information (model SQL, dependency graph, every data test attached to a
column) that a browsable docs/lineage site is generated from, confirmed by directly reading
`manifest.json`'s `depends_on` field for each model above rather than opening the rendered site.
