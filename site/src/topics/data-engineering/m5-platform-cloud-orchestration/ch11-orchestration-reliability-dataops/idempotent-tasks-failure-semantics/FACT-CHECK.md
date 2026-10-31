# Fact-check — de.idempotent-tasks-failure-semantics

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source text in `sources/`, or from this topic's own executed `examples.py`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Task-instance states include `upstream_failed` (an upstream task failed and the trigger rule needed it) and `up_for_retry` (failed, retries remain, will be rescheduled). | Confirmed | Airflow 3.3.2 "Tasks" docs, quoted verbatim. |
| 2 | `execution_timeout` bounds every task's runtime (including sensors) and raises `AirflowTaskTimeout` if breached. | Confirmed | Same source, quoted verbatim. |
| 3 | Airflow's default retry behaviour is a fixed count and delay regardless of error type; a retry policy customises per-exception behaviour without changing task code. | Confirmed | Same source, quoted verbatim. |
| 4 | A "zombie task" is a task instance stuck in a running state despite its worker being gone; Airflow finds these periodically via a missed heartbeat and marks them failed or retries them. | Confirmed | Same source, quoted verbatim. |
| 5 | The documented local reproduction of a heartbeat timeout sets three scheduler config values and runs a long task. | Confirmed, not independently reproduced live | Same source, quoted verbatim. Tried to reproduce live: `airflow standalone` failed in this sandbox with a subprocess `PATH` error spawning its own sub-processes (the `StandaloneCommand`'s internal `subprocess.Popen(["airflow", ...])` call does not inherit this session's modified `PATH`). A persistent multi-process scheduler deployment was out of reach within this session's time; the claim is sourced and quoted, not independently timed. Disclosed in `post-notes.md` and `coverage.json`. |
| 6 | The default trigger rule is `all_success`; a task with no overridden rule becomes `upstream_failed`, not merely skipped, when a needed upstream task has failed. | Confirmed | Airflow 3.3.2 "Dags" docs, quoted verbatim. |
| 7 | `trigger_rule="one_failed"` runs a task specifically because at least one upstream task failed, without waiting for every upstream task to finish. | Confirmed | Same source, quoted verbatim. |
| 8 | An overwrite-keyed-by-interval write run twice leaves the same row count (3); an append-keyed write run twice doubles it (6). | Confirmed, executed | `examples.py: demonstrate_idempotent_vs_append`, run locally; exact counts asserted and printed. |
| 9 | A real three-task Airflow DAG (`a_fails` with no retries, `b_default_rule` on the default trigger rule, `c_one_failed_rule` on `trigger_rule="one_failed"`), run with `airflow dags test trigger_rule_demo 2026-01-01` against Apache Airflow 3.3.2, ends with exactly `a_fails: failed`, `b_default_rule: upstream_failed`, `c_one_failed_rule: success`. | Confirmed, executed | `examples.py: run_trigger_rule_demo`, run against this sandbox's own PostgreSQL-backed Airflow metadata DB; states read back directly from the `task_instance` table and asserted. |

## Currency check

- Both Airflow pages resolved from the `stable` alias to 3.3.2 at fetch time (30 Oct 2026), matching the version actually installed and run (`airflow version` -> `3.3.2`). No version mismatch.

## Red-team notes

- Tried the tempting wrong framing that `upstream_failed` is just a form of "skipped": Airflow's own task-states list keeps them as two distinct terminal states (`skipped` is for branching/LatestOnly; `upstream_failed` is specifically "the Trigger Rule says we needed it"), and the executed demo confirms `b_default_rule` lands on `upstream_failed`, never `skipped`, since no branching operator is involved. Step 5's `explain` text and `post-notes.md` both make this distinction explicit.
- Tried to break the idempotency demo by writing to the same file handle across both "runs" instead of two separate `open()` calls — the append mode's doubling held either way, confirming the result is about write mode, not an artifact of how the file handle is managed between runs.
- Checked whether `a_fails`'s zero `retries` setting could itself mask a retry-related issue: with `retries=0`, Airflow fails the task immediately on its first failure rather than entering `up_for_retry`, which is the deliberate, disclosed choice here — the demo is about trigger-rule propagation, not retry timing, and `up_for_retry` itself is sourced from the documentation (claim 1), not independently demonstrated in this topic's own executed example.
