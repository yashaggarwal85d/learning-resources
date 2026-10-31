# Outline: Data intervals, catchup and backfills

## Reel steps (9)

1. **Hook.** Someone kicks off a five-year backfill on a Friday afternoon "just to be safe." By evening the production JDBC source that normally serves a thousand queries a minute is timing out — the backfill is running the same parallel-range extract sized for one day, five years of times over.
2. **Reveal: logical date vs data interval, measured.** A daily run "for" 2026-01-01 owns the interval `[2026-01-01, 2026-01-02)` and only actually executes after 2026-01-02 — read straight from Airflow's own `CronDataIntervalTimetable`, not described.
3. **Reveal: catchup, off by default in Airflow 3, measured.** Same timetable, same start date, same "now": `catchup=True` schedules the very first missed interval; `catchup=False` (the default) jumps straight to the most recent completed one, skipping every interval between.
4. **Predict: same source, same budget?** A five-year backfill re-issues the exact same per-partition request pattern as a normal day's run, against the same rate-limited source. Does Airflow give a backfill its own separate request budget, or does it spend the production source's one?
5. **Reveal: scheduler-managed backfill, bounded concurrency, run for real.** `airflow backfill create --max-active-runs 2` against a real scheduler + dag-processor + API server + Postgres metadata database: never more than two Dag runs running at once, read back from `dag_run.state`.
6. **Reveal: kill it mid-way, restart, measured.** The scheduler is killed with six runs already `success`, two `running`, two `queued`. Restarting it: the six stay `success`, untouched; only the four unfinished runs execute.
7. **Reveal: Dagster's other shape.** Per-partition backfills (one run per partition, Dagster's own default) vs single-run backfills (`BackfillPolicy.single_run()`, one run materializing a whole partition range) — the same resumability-vs-efficiency trade a different orchestrator makes differently.
8. **Recap.** Logical date is the interval's start, not the run time. Catchup decides whether missed intervals get scheduled at all. A backfill is bounded and resumable, not an unbounded flood — but it still spends the same source budget history-sized.
9. **Prove it.** A day already shows `success`. You re-run a backfill over a range that includes it, with the default reprocess behaviour. Does it redo that day?

## Learning outcomes

Distinguish a run's logical date from its execution time and explain why catchup matters; trigger a real Airflow 3 scheduler-managed backfill with bounded concurrency and show it resumes after a kill without redoing finished work; contrast Airflow's per-run backfill model against Dagster's per-partition/single-run choice; estimate a long backfill's blast radius on a rate-limited source.

## Claims (for FACT-CHECK.md)

1. A Dag run's logical date is the start of its data interval, not its execution time (Dag Runs doc).
2. Airflow 3 defaults `catchup` to off (`scheduler.catchup_by_default=False`); the scheduler creates a run only for the latest interval unless `catchup=True` (Dag Runs doc).
3. `airflow backfill create --max-active-runs N` bounds how many backfill Dag runs can run concurrently, independent of the Dag's own `max_active_runs` (Backfill doc).
4. The default reprocess behaviour (`none`) never creates a new run for a logical date that already has one, regardless of its state (Backfill doc).
5. This topic's own real backfill demo: 10 daily runs backfilled with `--max-active-runs 2` never exceeded 2 concurrently-running Dag runs (measured).
6. This topic's own real kill/restart demo: killing the scheduler mid-backfill left completed runs `success` and in-flight ones `running`/`queued`; restarting it completed only the unfinished runs, never re-running the completed six (measured).
7. Dagster's default backfill launches one separate run per partition; a `BackfillPolicy.single_run()` asset instead gets one run covering a whole partition range (Dagster Backfilling docs).
8. Airflow automatically detects a partitioned Dag's timetable and interprets `--from-date`/`--to-date` as a partition-date range, creating one Dag run per partition (Backfill doc).
9. The blast-radius estimate (examples.py) is a reasoned calculation from Chapter 8 topic 2's own extractor shape (one request per hour-partition) and a stated source request budget, not a live-measured production incident — disclosed as such.

## Concept ledger

**Introduces:** `data-interval-semantics`, `resumable-backfill-design`, `backfill-blast-radius`.
**Uses:** `idempotent-tasks-failure-semantics` (topic 2), `ch8.database-extraction-without-hurting`, `ch9.partition-replay`.
**Declared:** none beyond topic 2.

## Bridge / handoff

**Bridge:** "An idempotent task is safe to re-run once. A backfill re-runs it across years of history, at a scale where the same safety property becomes a different kind of risk entirely: to the scheduler's own state, and to the source it reads from. This topic is both."

**Handoff:** "A backfill re-runs a fixed number of tasks over a fixed range. Many pipelines need the number of tasks itself to depend on the data — one task per file, one per partition, decided at run time. That is the next mechanism."
