<section data-section="outcomes">

## Outcomes

By the end of this topic you can: distinguish a run's logical date from its execution time and explain why catchup matters; trigger a real Airflow 3 scheduler-managed backfill with bounded concurrency and show it resumes after a kill without redoing finished work; contrast Airflow's per-run backfill model against Dagster's per-partition/single-run choice; estimate a long backfill's blast radius on a rate-limited source.

</section>

<section data-section="internals">

## Internals

Airflow's data interval is the unit every date in the system is defined relative to: "All dates in Airflow are tied to the data interval concept in some way. The 'logical date'... denotes the start of the data interval, not when the [Dag run actually executes]" (Dag Runs doc). A daily Dag's run "for" 2026-01-01 therefore owns `[2026-01-01, 2026-01-02)` and is only scheduled to run after that interval closes — confirmed in this topic's own measurement by calling Airflow's `CronDataIntervalTimetable.next_dagrun_info` directly and reading its `data_interval` and `run_after` fields.

Catchup is a scheduling decision, not a throughput one: "If you set catchup=True in the Dag, the scheduler will kick off a Dag Run for any data interval that has not been run since the last data interval... then you will want to turn catchup off, which is the default setting." This topic's own measurement confirms it precisely: with `catchup=True`, the first scheduled interval was the Dag's actual start date; with `catchup=False`, it was "now's" most recently completed interval, skipping everything in between.

`airflow backfill create` is a Airflow-3-era, API/UI-driven operation with its own concurrency knob (`--max-active-runs`, independent of the Dag's own setting) and its own reprocessing policy (`none`/`failed`/`completed`, controlling what happens when a run already exists for a date). Both are measured directly in this topic's lab, not just quoted.

</section>

<section data-section="lab">

## Lab

Four experiments. The first two are executed directly in `examples.py`; the third is a real multi-process Airflow run, documented in full in `FACT-CHECK.md` (claims 5 and 6) because it needs long-running daemons rather than a single script:

1. **Logical date vs data interval**, read straight from `CronDataIntervalTimetable.next_dagrun_info`.
2. **Catchup on vs off**, same timetable, same start date, same "now" — different first scheduled interval.
3. **A real scheduler-managed backfill**: `airflow backfill create --dag-id backfill_demo_dag --from-date 2026-01-01 --to-date 2026-01-10 --max-active-runs 2`, run against a real Apache Airflow 3.3.2 scheduler, dag-processor and API server, backed by this sandbox's own PostgreSQL metadata database. Polling `dag_run.state` showed never more than 2 runs `running` at once. The scheduler process was then killed (`kill -9`) with 6 runs `success`, 2 `running`, 2 `queued`; restarting it brought all 10 to `success`, with the original 6 keeping their pre-kill `start_date` and only the remaining 4 getting new ones — the resumed backfill, not a restarted one.
4. **Blast radius**, a calculation from Chapter 8 topic 2's own extractor shape (24 requests/day) and a stated source budget (20 requests/min): a 5-year backfill spends roughly 36.5 hours of that budget on history alone.

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file; run `airflow scheduler`, `airflow dag-processor` and `airflow api-server` as separate processes against a migrated PostgreSQL database, with `AIRFLOW__CORE__EXECUTION_API_SERVER_URL` pointed at the API server; then `airflow backfill create ...` and watch `dag_run.state` in `psql`.

</section>

<section data-section="production">

## Production

A backfill that looks "free" because it's bounded and resumable can still be the most expensive thing a shared source sees all week — bounded concurrency protects the scheduler's own state, not the source's request budget. The blast-radius estimate in this topic's lab is exactly the number a production team should compute before kicking off a multi-year backfill: how many requests, at what rate, against what the source can actually sustain alongside its normal load.

</section>

<section data-section="frontier">

## Frontier

Dagster's `BackfillPolicy.single_run()` trades per-partition retryability for efficiency: one query covers a whole partition range, avoiding the overhead of launching a separate run per partition, at the cost of losing independent retry per partition if that one run fails partway through. Named here as the production-grade version of the per-partition/single-run trade-off this topic's reveal introduces, not demonstrated step by step against a running Dagster install.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A backfill re-runs a fixed number of tasks over a fixed range, decided before it starts. Many pipelines need the number of tasks itself to depend on the data actually seen at run time — one task per file, one per partition, discovered rather than planned. That dynamic fan-out is the next topic.

</section>
