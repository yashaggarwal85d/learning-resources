# Fact-check: Data intervals, catchup and backfills

1. **A Dag run's logical date is the start of its data interval, not its execution time.**
   Confirmed. Dag Runs doc: "The 'logical date' ... denotes the start of the data interval, not when the [Dag run actually executes]." Measured directly (examples.py `demonstrate_logical_date_vs_data_interval`): a daily run's `data_interval` is `start=2026-01-01 00:00:00, end=2026-01-02 00:00:00`, and `run_after` (when it actually executes) is `2026-01-02 00:00:00`.

2. **Airflow 3 defaults `catchup` to off; the scheduler creates a run only for the latest interval unless `catchup=True`.**
   Confirmed. Dag Runs doc: "By default, Dag runs that have not been run since the last data interval are not created by the scheduler upon activation of a Dag (Airflow config scheduler.catchup_by_default=False). The scheduler creates a Dag run only for the latest interval." Measured directly (examples.py `demonstrate_catchup_default`): with the same start date and the same "now," `catchup=True` scheduled the DAG's first interval (2026-01-01); `catchup=False` jumped straight to 2026-10-29, the most recent completed interval.

3. **`airflow backfill create --max-active-runs N` bounds concurrent backfill Dag runs, independent of the Dag's own `max_active_runs`.**
   Confirmed. Backfill doc: "You can set max_active_runs on a backfill and it will control how many Dag runs in the backfill can run concurrently. Backfill max_active_runs is applied independently the Dag max_active_runs setting." Measured directly: see claim 5.

4. **The default reprocess behaviour (`none`) never creates a new run for a logical date that already has one, regardless of its state.**
   Confirmed. Backfill doc: "none - if there's already a run for this logical date, do not create another, no matter the state." Used as this topic's "Prove it" answer.

5. **This topic's own real backfill demo never exceeded 2 concurrently-running Dag runs with `--max-active-runs 2`.**
   Confirmed, independently reproduced live in this session. Ran a real Apache Airflow 3.3.2 scheduler, dag-processor and API server against this sandbox's own PostgreSQL metadata database (`AIRFLOW_HOME=/tmp/airflow_home3`). `airflow backfill create --dag-id backfill_demo_dag --from-date 2026-01-01 --to-date 2026-01-10 --max-active-runs 2` created 10 Dag runs; polling `dag_run.state` repeatedly showed exactly 2 `running` at a time, the rest `queued` until a slot freed, until all 10 reached `success`.
   Setup note: `airflow standalone` (used in topic 2) failed in this sandbox on an internal subprocess PATH issue; running `airflow scheduler`, `airflow dag-processor` and `airflow api-server` directly as separate background processes, with `AIRFLOW__CORE__EXECUTION_API_SERVER_URL` pointed at the API server, avoided it and let tasks actually execute (Airflow 3's Task SDK talks to the scheduler over that API, not directly to the database).

6. **Killing the scheduler mid-backfill and restarting it resumes without re-running completed Dag runs.**
   Confirmed, independently reproduced live in this session. Re-ran the same 10-run backfill; once `psql` showed 6 runs `success`, 2 `running`, 2 `queued`, the scheduler process was killed (`kill -9`). The frozen state was re-read and confirmed unchanged (no scheduler running). Restarting `airflow scheduler` against the same metadata database: all 10 runs reached `success`; the six already-`success` runs kept their original `start_date` timestamps (from before the kill), and only the four unfinished runs got new `start_date` timestamps after the restart — proof the restart didn't redo them, only continued the unfinished ones.

7. **Dagster's default backfill launches one separate run per partition; a `BackfillPolicy.single_run()` asset gets one run covering a whole partition range.**
   Confirmed, sourced and quoted, not independently run (this topic's live environment is Apache Airflow, not Dagster; Dagster's docs are quoted directly rather than operated). Backfilling data doc: "By default, if you launch a backfill that covers N partitions, Dagster will launch N separate runs, one for each partition... Dagster supports backfills that execute as a single run that covers a range of partitions."

8. **Airflow automatically detects a partitioned Dag's timetable and interprets `--from-date`/`--to-date` as a partition-date range, one Dag run per partition.**
   Confirmed, sourced and quoted, not independently run (this topic's live demo uses a plain cron-scheduled Dag, not a `CronPartitionTimetable` Dag; building and backfilling a partitioned Dag is its own undertaking disclosed as out of scope here). Backfill doc: "Airflow automatically detects whether the Dag is partitioned and interprets the date range as a partition-date range accordingly — one Dag run is created per partition within the window."

9. **The blast-radius estimate is a reasoned calculation, not a live-measured production incident.**
   Disclosed, not a live measurement. `examples.py: estimate_blast_radius` multiplies Chapter 8 topic 2's own extractor shape (24 requests/day, one per hour-partition) by the number of days in a 5-year range, against a stated source budget (20 requests/min) — a calculation anyone can redo with their own source's real numbers, not a reproduction of an actual outage. Stated as such in post-notes.md.
