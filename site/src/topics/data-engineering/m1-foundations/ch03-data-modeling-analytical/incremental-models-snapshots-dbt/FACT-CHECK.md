# Fact-check — de.incremental-models-snapshots-dbt

| # | Claim | Status | Basis |
|---|---|---|---|
| 1 | `is_incremental()` powers incremental materializations, true only under specific conditions | Confirmed | SOURCES.md, "Configure incremental models" |
| 2 | `--full-refresh` drops and rebuilds the target table for all time | Confirmed | SOURCES.md, same page |
| 3 | No `on_schema_change` behavior backfills old records for a newly added column | Confirmed | SOURCES.md, same page |
| 4 | The default `on_schema_change` is `ignore` | Confirmed | SOURCES.md, same page |
| 5 | `append` inserts without updating or deleting, and can duplicate rows | Confirmed | SOURCES.md, "About incremental strategy" |
| 6 | `delete+insert` deletes matching `unique_key` rows, then inserts | Confirmed | SOURCES.md, same page |
| 7 | `merge` inserts new keys and updates existing ones (SCD1-like) | Confirmed | SOURCES.md, same page |
| 8 | `insert_overwrite` replaces whole partitions, built for partitioned warehouses | Confirmed | SOURCES.md, same page |
| 9 | `microbatch` splits large time-series data into time-based batches | Confirmed | SOURCES.md, "About microbatch incremental models" |
| 10 | Snapshots implement type-2 SCD over mutable source tables | Confirmed | SOURCES.md, "Add snapshots to your DAG" |
| 11 | The timestamp strategy uses `updated_at` to detect a changed row | Confirmed | SOURCES.md, same page |
| 12 | The check strategy compares `check_cols` values instead of a timestamp | Confirmed | SOURCES.md, same page |
| 13 | The timestamp strategy is more robust to schema evolution than check | Confirmed | SOURCES.md, same page |

## Lab claims (executed, not just sourced)

- **`insert_overwrite` is not supported by the DuckDB adapter used in this lab.** Checked
  directly in `dbt/adapters/duckdb/impl.py`'s `DUCKDB_BASE_INCREMENTAL_STRATEGIES` constant
  (`["append", "delete+insert"]`, extended with `merge`/`microbatch`) — confirmed by reading the
  installed package's own source, not assumed from the docs alone.
- **A late-arriving correction, dated in the past, is missed by a high-water-mark filter no
  matter the lookback window.** Order 1's status correction (`updated_at` bumped to a date in
  January while the table's high-water mark was already in February) was missed by both
  `delete+insert` and `merge` (with a one-day lookback) on a real `dbt build` run, and only
  picked up by `dbt run --full-refresh` on those models. `examples.py` reproduces the same
  filter logic independently and gets the identical result.
- **The three-stage schema-change demonstration is a real, reproduced sequence**, not a single
  assertion: default `ignore` silently drops the new column entirely (confirmed by a real
  binder error when querying for it afterward); `append_new_columns` adds the column via a real
  `ALTER TABLE` but leaves every pre-existing row `NULL`; `--full-refresh` backfills every row.
  All three stages were actually run against the real DuckDB target in this session.
- **The timestamp and check snapshot strategies produce genuinely different `dbt_valid_from`
  values for the same real change**, confirmed by running both snapshot types twice (before and
  after customer 1's region changed) and reading `dbt_valid_from`/`dbt_valid_to` directly from
  the resulting tables: the timestamp snapshot recorded the data's own stated change time; the
  check snapshot recorded dbt's own run time, since no `updated_at` was configured for it.
- **`fct_orders_microbatch`'s first build split into two hundred ninety-six real batches**
  (one per day from `begin` to the run date), and a real warning appeared that its upstream
  (`stg_orders`) lacks its own `event_time`, so dbt can't auto-filter it and does a full scan
  per batch — confirmed from the actual `dbt build` output, not inferred.

## Red-team analysis of the predicts

- **Predict 1:** the wrong answer ("a wider lookback window always catches a late correction")
  is directly refuted — no lookback helps when the correction's own timestamp is in the past
  relative to the table's current high-water mark, confirmed by the real missed-correction
  result above.
- **Predict 2:** the wrong answer ("a schema change just works, or fails loudly") is refuted by
  the real three-stage result — the default behavior is neither: it silently succeeds while
  dropping the new column, with no error and no warning.
- **Predict 3:** the wrong answer ("a snapshot's valid-from time is always the real-world change
  time") is refuted by the real check-strategy result, which stamps dbt's own run time instead
  when no `updated_at` is configured.
