# Sources — de.incremental-models-snapshots-dbt

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## dbt Developer Hub, "Configure incremental models"
URL: https://docs.getdbt.com/docs/build/incremental-models

> The is_incremental() macro powers incremental materializations. It will return True if all of the following conditions are met:

> To force dbt to rebuild the entire incremental model from scratch, use the --full-refresh flag on the command line. This flag will cause dbt to drop the existing target table in the database before rebuilding it for all-time.

> Note: None of the on_schema_change behaviors backfill values in old records for newly added columns. If you need to populate those values, we recommend running manual updates, or triggering a --full-refresh.

> This is the behavior of on_schema_change: ignore, which is set by default.

## dbt Developer Hub, "About incremental strategy"
URL: https://docs.getdbt.com/docs/build/incremental-strategy

> The append strategy is simple to implement and has low processing costs. It inserts selected records into the destination table without updating or deleting existing data.

> The delete+insert strategy deletes the data for the unique_key from the target table and then inserts the data for those with a unique_key, which may be less efficient for larger datasets.

> merge inserts records with a unique_key that don't exist yet in the destination table and updates records with keys that do exist — mirroring the logic of SCD1, where changes are overwritten rather than historically tracked.

> The insert_overwrite strategy is used to efficiently update partitioned tables by replacing entire partitions with new data, rather than merging or updating individual rows.

> microbatch is an incremental strategy designed for processing large time-series datasets by splitting the data into time-based batches (for example, daily or hourly). It supports parallel batch execution for faster runs.

## dbt Developer Hub, "Add snapshots to your DAG"
URL: https://docs.getdbt.com/docs/build/snapshots

> Snapshots implement type-2 Slowly Changing Dimensions over mutable source tables.

> The timestamp strategy uses an updated_at field to determine if a row has changed. If the configured updated_at column for a row is more recent than the last time the snapshot ran, then dbt will invalidate the old record and record the new one.

> The check strategy is useful for tables which do not have a reliable updated_at column. This strategy works by comparing a list of columns between their current and historical values.

> Less prone to errors when the table schema evolves over time (for example, if using the check strategy, you might need to update the check_cols configuration)

## dbt Developer Hub, "About microbatch incremental models"
URL: https://docs.getdbt.com/docs/build/incremental-microbatch

> It relies solely on a time column (event_time) to define time-based ranges for filtering.

> When dbt runs a microbatch model — whether for the first time, during incremental runs, or in specified backfills — it will split the processing into multiple queries (or "batches"), based on the event_time and batch_size you configure.

### Disclosure

`insert_overwrite` is one of dbt's own named built-in strategies (quoted above), but this
session's own DuckDB adapter does not support it at all: `dbt/adapters/duckdb/impl.py`'s own
`DUCKDB_BASE_INCREMENTAL_STRATEGIES` constant lists only `append` and `delete+insert`, extended
with `merge` and `microbatch` on a recent-enough DuckDB version — `insert_overwrite` is absent.
This was checked directly in the installed adapter's own source in this session, not assumed;
the four strategies that are supported were all built and run for real (`lab/README.md`).

Every other claim in this topic — the late-arriving-correction gap, the three-stage
schema-change demonstration, and the timestamp-vs-check snapshot divergence — was independently
executed in this session against the real dbt project, not merely read off these docs;
`lab/README.md` has the exact commands and dbt's own real output.
