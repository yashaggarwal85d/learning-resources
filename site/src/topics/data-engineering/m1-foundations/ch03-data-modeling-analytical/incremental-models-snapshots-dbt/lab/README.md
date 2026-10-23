# Lab — incremental strategies and snapshots, extending `shop_dbt`

This extends the previous topic's own `shop_dbt` dbt-core project (same DuckDB setup, no new
packaging workaround). `seeds/raw_orders.csv` gained an `updated_at` column and, later, a
`channel` column; `seeds/raw_customers.csv` gained an `updated_at` column, both for the
scenarios below. Reproduce with:

```
export DBT_PROFILES_DIR=~/.dbt
cd lab/shop_dbt
dbt build
dbt snapshot
```

(`~/.dbt/profiles.yml` as in the previous topic, pointed at a fresh DuckDB file.) A fresh,
from-scratch run of this exact command sequence against an empty database was re-verified in
this session (`dbt build`: `PASS=29 WARN=0 ERROR=0 SKIP=0 NO-OP=1 TOTAL=30`; `dbt snapshot`:
`PASS=2`).

## The five named strategies, one model per strategy

`models/incremental/fct_orders_append.sql`, `_delete_insert.sql`, `_merge.sql`,
`_microbatch.sql` each materialize the same star-schema fact with a different
`incremental_strategy` config, run for real against this project.

**`insert_overwrite` is not on that list.** Checking `dbt-adapters`' own DuckDB adapter source
(`dbt/adapters/duckdb/impl.py`, `DUCKDB_BASE_INCREMENTAL_STRATEGIES`) shows DuckDB supports
`append`, `delete+insert`, `merge`, and `microbatch` only — not `insert_overwrite`, which is
built for partitioned warehouses like BigQuery and Spark. This is the real, concrete version of
the docs' own "Supported incremental strategies by adapter" caveat: the strategy that fits a
fact table's own update pattern also has to actually be supported by the adapter running it.

`fct_orders_microbatch.sql` (`event_time='order_date', batch_size='day', begin='2026-01-01'`)
split its first build into two hundred ninety-six separate per-day batches (one per day from
`begin` to the run date), each a small, independent `OK` — a real demonstration of what "splits
large time-series datasets into time-based batches" (SOURCES.md) looks like as actual build
output, not a diagram. A real warning also appeared: `stg_orders` (its direct parent) doesn't
configure its own `event_time`, so dbt can't auto-filter it and does a full scan on every batch —
exactly the condition the docs warn about.

## A late-arriving correction a naive incremental filter misses

`fct_orders_delete_insert.sql` and `fct_orders_merge.sql` both filter new/changed rows with
`where updated_at > (select max(updated_at) from {{ this }})` (`merge` adds a one-day
`lookback`). Order 1's own `status` was changed from `completed` to `shipped`, with its
`updated_at` bumped to `2026-01-03 12:30:00` — a date far in the table's own past, since that's
genuinely when the order was placed, not when the correction arrived.

Running `dbt build` picked up the brand-new order 11 correctly in all three strategies, but
**order 1's correction was missed by both `delete+insert` and `merge`** — its own `updated_at`
value sits far below the table's current high-water mark, so no lookback window, however wide,
reaches back to it. Only `dbt run --full-refresh` on those two models actually picked up the
correction. This is the concrete failure mode behind "late-data lookback": a lookback window
only helps when a correction's own timestamp is recent; a correction to an old record, dated as
of when it happened rather than when it arrived, needs a different mechanism (a load-time
column, or a full refresh) entirely.

## Full-refresh drift and schema-change handling, in three real stages

`fct_orders_schema_demo.sql` started without a `channel` column, built clean. `channel` was then
added to the source data and to the model's own `select`, and the same model was run three ways:

1. **Default `on_schema_change` (`ignore`).** The run reports `OK` — no error at all — but the
   new `channel` column is never added to the destination table. Querying it for `channel`
   fails with a binder error: the column genuinely doesn't exist in the materialized table,
   even though the model's own SQL now selects it. This is the literal, software behavior behind
   "ignore, which is set by default": the schema change is not reported, not refused, just
   silently dropped.
2. **`on_schema_change='append_new_columns'`.** The column is added via `ALTER TABLE`, but every
   row that existed before this run shows `channel = NULL` — only the row whose `updated_at`
   made it through the incremental filter got a real value. This matches the docs' own note,
   confirmed directly: "None of the on_schema_change behaviors backfill values in old records
   for newly added columns."
3. **`dbt run --full-refresh`.** Every row, old and new, gets `channel` correctly
   (`online`/`online`/.../`retail`) — the documented fallback for exactly this gap, run for
   real and confirmed row by row.

## Snapshots: timestamp vs check, confirmed by what they actually stamp

`customers_timestamp_snapshot` (`strategy='timestamp', updated_at='updated_at'`) and
`customers_check_snapshot` (`strategy='check', check_cols=['region']`) were both run twice:
once over the original data, once after customer 1's `region` changed from `north` to `south`
(with `updated_at` bumped to `2026-03-01 10:00:00` in the source).

The real difference the two strategies produce:

- **Timestamp snapshot**, customer 1: `dbt_valid_from`/`dbt_valid_to` for the new row are both
  `2026-03-01 10:00:00` — the data's own stated time of change.
- **Check snapshot**, customer 1: `dbt_valid_from` for the new row is the wall-clock time this
  session actually ran `dbt snapshot` — not any time stated in the source data at all, because
  no `updated_at` was configured for the check strategy here.

This is the real, concrete form of the docs' own stated reason "timestamp strategy ... is
recommended" — a check-strategy snapshot's own version boundaries record when dbt happened to
run, not when the real-world change happened, unless an `updated_at` is separately configured
for it too. This is dbt's own practical implementation of topic 13's SCD2 mechanism
(`dbt_valid_from`/`dbt_valid_to` are exactly the effective/expiry timestamp columns topic 13
built by hand with `MERGE`).
