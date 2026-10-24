Last verified against these sources: 23 October 2026. Real hands-on lab (`lab/shop_dbt/`,
`examples.py`). Expert sign-off: pending.

- dbt Labs, "Configure incremental models": [docs.getdbt.com](https://docs.getdbt.com/docs/build/incremental-models). is_incremental(), --full-refresh, on_schema_change.
- dbt Labs, "About incremental strategy": [docs.getdbt.com](https://docs.getdbt.com/docs/build/incremental-strategy). append, delete+insert, merge, insert_overwrite, microbatch.
- dbt Labs, "About microbatch incremental models": [docs.getdbt.com](https://docs.getdbt.com/docs/build/incremental-microbatch). event_time, batch_size, per-batch processing.
- dbt Labs, "Add snapshots to your DAG": [docs.getdbt.com](https://docs.getdbt.com/docs/build/snapshots). Type-two SCD, timestamp and check strategies.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=incremental-models-snapshots-dbt:%20).
