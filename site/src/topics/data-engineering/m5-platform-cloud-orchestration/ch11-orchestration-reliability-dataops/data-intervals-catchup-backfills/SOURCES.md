## Dag Runs

URL: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html
Version: Apache Airflow 3.3.2 documentation

> Each Dag run in Airflow has an assigned “data interval” that represents the time
> range it operates in.

> The “logical date” (also called execution_date in Airflow versions prior to 2.2)
> of a Dag run, for example, denotes the start of the data interval, not when the

> By default, Dag runs that have not been run since the last data interval are not created by the scheduler upon activation of a Dag ( Airflow config scheduler.catchup_by_default=False). The scheduler creates a Dag run only for the latest interval.

> If you set catchup=True in the Dag, the scheduler will kick off a Dag Run for any data interval that has not been run since the last data interval (or has been cleared). This concept is called Catchup.

> then you will want to turn catchup off, which is the default setting or can be done explicitly by setting catchup=False in the Dag definition, if the default config has been changed for your Airflow environment.

Note: the page states Airflow's config name is `scheduler.catchup_by_default`, defaulting to `False` — the Airflow 3 behaviour this topic's clause calls "catchup, off by default in Airflow 3."

## Backfill

URL: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html
Version: Apache Airflow 3.3.2 documentation

> Backfill is when you create runs for past dates of a Dag. Airflow provides a mechanism
> to do this through the CLI and REST API. You provide a Dag, a start date, and an end date,
> and Airflow will create runs in the range according to the Dag’s schedule.

> There are three options for reprocessing behavior:

> none - if there’s already a run for this logical date, do not create another, no matter the state

> You can set max_active_runs on a backfill and it will control how many Dag runs in
> the backfill can run concurrently. Backfill max_active_runs is applied independently
> the Dag max_active_runs setting.

> For Dags that use a partition-based timetable (e.g. CronPartitionTimetable),
> the same --from-date / --to-date flags are used for all backfills.
> Airflow automatically detects whether the Dag is partitioned and interprets
> the date range as a partition-date range accordingly — one Dag run is created
> per partition within the window.

## Backfilling data (Dagster Docs)

URL: https://docs.dagster.io/concepts/partitions-schedules-sensors/backfills
Version: Dagster Docs, Latest (1.12.8)

> Backfilling is the process of running partitions for assets that either don't exist or updating existing records. Dagster supports backfills for each partition or a subset of partitions.

> By default, if you launch a backfill that covers N partitions, Dagster will launch N separate runs, one for each partition. This approach can help avoid overwhelming Dagster or resources with large amounts of data. However, if you're using a parallel-processing engine like Spark and Snowflake, you often don't need Dagster to help with parallelism, so splitting up the backfill into multiple runs just adds extra overhead.

> Dagster supports backfills that execute as a single run that covers a range of partitions, such as executing a backfill as a single Snowflake query. After the run completes, Dagster will track that all the partitions have been filled.

Note: this topic's own backfill-resumability and bounded-concurrency demonstration (examples.py, FACT-CHECK.md) runs Airflow's `airflow backfill create --max-active-runs` for real against a live scheduler, dag-processor, API server and PostgreSQL metadata database — killed mid-way and restarted, read back from the database directly.
