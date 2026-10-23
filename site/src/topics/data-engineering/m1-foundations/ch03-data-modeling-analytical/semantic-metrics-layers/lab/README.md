# Lab — semantic-metrics-layers

A minimal dbt project (`mf_shop/`) over the shop's own star schema, with three metrics declared
once in MetricFlow's own YAML format (`models/marts/_semantic_models.yml`): `revenue`,
`order_count`, and `average_order_value` (a ratio metric over the first two).

`examples.py` (one level up) reproduces this same schema with plain DuckDB and runs the exact
SQL MetricFlow compiled for two of these group-bys, so it needs no extra tooling to verify. To
reproduce the compilation step itself, MetricFlow has to be installed separately (it is not
part of this repo's own Python environment):

```
python3 -m venv /tmp/mf_venv
/tmp/mf_venv/bin/pip install "setuptools<70" wheel
/tmp/mf_venv/bin/pip install dbt-metricflow dbt-duckdb
```

(the `setuptools<70` pin works around a `halo` build failure against newer setuptools, as of
2026-10-22). Then, with a `profiles.yml` pointing `mf_shop`'s `dev` target at a local DuckDB
file:

```
cd mf_shop
dbt run                     # materializes the star schema + the required time-spine model
dbt parse                   # validates the semantic models and metrics
mf query --metrics revenue --group-by metric_time__month --explain
mf query --metrics revenue --group-by metric_time__day,product__category --explain
```

The first command compiles to a plain `GROUP BY` with no join; the second compiles to the same
metric with a `LEFT OUTER JOIN` to `dim_product` added automatically, from the entity MetricFlow
declares on `fact_orders` — one declared metric, two correct queries, exactly SOURCES.md's own
DRY claim demonstrated directly.
