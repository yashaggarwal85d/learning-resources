# Sources: Idempotent tasks and failure semantics (`de.idempotent-tasks-failure-semantics`)

## Airflow 3.3.2 — Tasks

URL: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html
Version: Airflow 3.3.2 documentation (fetched 30 Oct 2026; installed and run locally at the same version)

> upstream_failed: An upstream task failed and the Trigger Rule says we needed it

> up_for_retry: The task failed, but has retry attempts left and will be rescheduled.

> If you want a task to have a maximum runtime, set its execution_timeout attribute to a datetime.timedelta value
> that is the maximum permissible runtime. This applies to all Airflow tasks, including sensors. execution_timeout controls the
> maximum time allowed for every execution. If execution_timeout is breached, the task times out and
> AirflowTaskTimeout is raised.

> By default, Airflow retries failed tasks with a fixed count and delay regardless of the error type.
> A retry policy lets you configure per-exception retry behaviour as a parameter on any task or operator,
> without modifying task code.

> No system runs perfectly, and task instances are expected to die once in a while.

> TaskInstances may get stuck in a running state despite their associated jobs being inactive
> (for example if the TaskInstance's worker ran out of memory). Such tasks were formerly known as zombie tasks. Airflow will find these
> periodically, clean them up, and mark the TaskInstance as failed or retry it if it has available retries. The TaskInstance's heartbeat can timeout for
> many reasons, including:

> export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_SEC=600
> export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_TIMEOUT=2
> export AIRFLOW__SCHEDULER__TASK_INSTANCE_HEARTBEAT_TIMEOUT_DETECTION_INTERVAL=5

Contents:
1. Task-instance states include `upstream_failed` (a task skipped because the Trigger Rule needed an upstream task that failed) and `up_for_retry` (failed with retry attempts remaining, will be rescheduled).
2. `execution_timeout` bounds every task's runtime and raises `AirflowTaskTimeout` when breached.
3. Airflow's default retry behaviour is a fixed count and delay regardless of error type; a retry policy customises per-exception behaviour.
4. A "zombie task" (the former name for a task instance stuck `running` despite its worker being gone) is detected by the scheduler via a missed heartbeat, then marked failed or retried.
5. Airflow's own documented, reproducible recipe for triggering a heartbeat timeout locally uses three scheduler config values (`TASK_INSTANCE_HEARTBEAT_SEC`, `_TIMEOUT`, `_TIMEOUT_DETECTION_INTERVAL`) plus a long-running task.

## Airflow 3.3.2 — Dags (Trigger Rules)

URL: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html
Version: Airflow 3.3.2 documentation (fetched 30 Oct 2026)

> Trigger Rules - set the conditions under which a Dag will run a task

> However, this is just the default behaviour, and you can control it using the trigger_rule argument to a Task. The options for trigger_rule are:

> all_success (default): All upstream tasks have succeeded

> one_failed: At least one upstream task has failed (does not wait for all upstream tasks to be done)

Contents:
1. Trigger rules set the conditions under which a task runs, relative to its upstream tasks' states.
2. The default trigger rule is `all_success`; a task with no overridden rule becomes `upstream_failed` (not merely skipped) when an upstream task it needed has failed.
3. `one_failed` is an explicit override that runs a task specifically because an upstream task failed, without waiting for every upstream task to finish.

Note: the syllabus clause "idempotency through deterministic, interval-keyed outputs (partition overwrite, not append)" is a design pattern demonstrated directly in `examples.py` (not quoted from an external source), reusing the general "exactly-once effect" recipe already sourced in Chapter 8 topic 6 (`de.idempotent-resumable-extraction`).
