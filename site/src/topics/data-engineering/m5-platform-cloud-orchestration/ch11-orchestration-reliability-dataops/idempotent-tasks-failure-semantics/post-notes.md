<section data-section="outcomes">

## Outcomes

By the end of this topic you can: explain why a retried task may mean "ran twice," not "ran once"; design a task whose output is safe to re-run by keying it to its data interval and overwriting rather than appending; classify an error as retryable or not and configure backoff/timeout accordingly; trace `upstream_failed` through a real trigger-rule DAG, run end to end.

</section>

<section data-section="internals">

## Internals

Airflow's own task-instance state machine lists `upstream_failed` ("An upstream task failed and the Trigger Rule says we needed it") and `up_for_retry` ("The task failed, but has retry attempts left and will be rescheduled") as two of its named states — distinct from `skipped`, which comes from branching or `LatestOnly` logic, not from a trigger rule evaluating a failed upstream task. This topic's own executed demo (`examples.py: run_trigger_rule_demo`) lands on exactly `upstream_failed` for the default-rule task, never `skipped`, because no branching operator is involved.

Retry policies let different exceptions get different treatment in one declared policy: a `RetryRule` maps an exception (or a string path to one) to an action — `RETRY` (optionally with its own delay, still bounded by the task's overall `retries` count), `FAIL` (skip remaining retries entirely), or `DEFAULT` (fall through to the standard count/delay). Airflow's own documentation is explicit that without a custom policy, "Airflow retries failed tasks with a fixed count and delay regardless of the error type" — the blanket behaviour this topic's predict step asks the learner to question.

The documented local reproduction of a heartbeat timeout, quoted in full from Airflow's own docs:

```
export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_SEC=600
export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_TIMEOUT=2
export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_TIMEOUT_DETECTION_INTERVAL=5
```

paired with a long-running task (the docs use a ten-minute `sleep`). This session tried to run it live via `airflow standalone`, which failed in this sandbox on an internal `subprocess.Popen(["airflow", ...])` call that doesn't inherit this session's modified `PATH` — a sandbox-specific friction, not a documentation gap. The mechanism is sourced and quoted precisely rather than independently re-timed; see `FACT-CHECK.md` claim 5.

</section>

<section data-section="lab">

## Lab

Two experiments, both executed in this sandbox (`examples.py`):

1. **Overwrite vs append, as a retry's two possible shapes.** The same three-row batch, written twice (simulating "the original run, then a retry of the same task instance"), once to a file keyed by interval and overwritten, once appended. Measured: overwrite stays at 3 rows; append reaches 6.
2. **Trigger rules, for real.** A three-task Airflow DAG (`a_fails` with no retries, `b_default_rule`, `c_one_failed_rule`) run with `airflow dags test trigger_rule_demo 2026-01-01` against a real Apache Airflow 3.3.2 install and this sandbox's own PostgreSQL metadata DB. Final states, read back from the `task_instance` table: `a_fails: failed`, `b_default_rule: upstream_failed`, `c_one_failed_rule: success`.

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file, point `AIRFLOW__DATABASE__SQL_ALCHEMY_CONN` at a migrated PostgreSQL database, then `python examples.py`.

</section>

<section data-section="production">

## Production

"At-least-once execution plus an idempotent write" is the only honest way to describe what a retry actually guarantees end to end — Airflow itself never promises exactly-once task execution, only that a failed, retryable task will be rescheduled. Treating a retry as a correctness mechanism on its own, without an idempotent write underneath it, is exactly the failure mode this topic's hook describes: a doubled row count with no error anywhere in the logs.

</section>

<section data-section="frontier">

## Frontier

Custom retry policies (`ExceptionRetryPolicy`, `RetryRule`, `RetryAction`) let a task's retry behaviour vary by exception type in one declared object, reusable across tasks and even across mapped-task instances. Named here as the production-grade version of the retryable/non-retryable distinction this topic's predict step introduces, not demonstrated step by step.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An idempotent task is safe to re-run for one interval. A backfill re-runs it for every interval across years of history — the same safety property, at a scale where it also becomes a risk to whatever source or warehouse absorbs that much repeated work. The next topic is exactly that scale.

</section>
