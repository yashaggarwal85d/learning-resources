# Outline: Idempotent tasks and failure semantics (`de.idempotent-tasks-failure-semantics`)

## Learning outcomes
1. Explain why a retried task may mean "ran twice," not "ran once," and reproduce a zombie task's failure mode from Airflow's own documented mechanism.
2. Design a task whose output is safe to re-run by keying it to its data interval and overwriting, not appending.
3. Classify an error as retryable or not, and configure backoff/timeout accordingly.
4. Trace `upstream_failed` through a real trigger-rule DAG, run end to end.

## Reel steps and storyboard
1. **Hook.** fig: a worker is killed mid-task; the retry doubles every row count. Visual: "worker" -> "killed mid-task" / "row count" -> "not yet revealed".
2. **Reveal: at-least-once, not exactly-once.** fig: Airflow retries a task whose first attempt may have already written output. Visual: rows for "retry" -> "may mean ran twice", "first attempt" -> "maybe already wrote".
3. **Reveal: overwrite vs append, measured.** fig: the real examples.py result — two runs, overwrite stays at three rows, append doubles to six. Visual: rows "overwrite, two runs" -> "three rows, correct" (focus), "append, two runs" -> "six rows, doubled".
4. **Predict (within first four steps): does the executor retry a data error the same way as a timeout?** Options: "yes, same backoff either way" / "no — a non-retryable error should fail fast, not waste the retry budget" (correct). Explain: `execution_timeout` and transient errors are retried; a malformed row is a data problem no retry fixes.
5. **Reveal: trigger rules, run for real.** fig: a real three-task DAG, one task fails on purpose, run with `airflow dags test` — the default-rule task becomes `upstream_failed`, the `one_failed`-rule task runs anyway. Visual: rows "a_fails" -> "failed", "b, default rule" -> "upstream_failed", "c, one_failed rule" -> "success" (focus). Takeaway 1: `upstream_failed` is a distinct state from "skipped" — it means the task never got the chance to run at all, by design.
6. **Reveal: zombies, by the book.** fig: Airflow's own documented heartbeat-timeout mechanism — a task instance stuck "running" while its worker is gone, found and marked failed or retried by a missed heartbeat. Visual: rows "worker" -> "dies silently", "heartbeat" -> "missed, timeout". Takeaway 2: the scheduler can only infer a worker is gone from a missed heartbeat — it can never be sure the task didn't already finish.
7. **Reveal: timeouts and the retry budget.** fig: `execution_timeout` bounds every task; retrying a non-retryable error wastes the budget while hiding the real problem. Visual: rows "execution_timeout breached" -> "task times out", "data error" -> "fails fast, no retry" (focus). Takeaway 3: a retry is only a safety net for transient failure — used on a data problem, it just delays the same failure.
8. **Recap.** fig: at-least-once retries, overwrite-not-append, trigger rules measured, timeouts and the retry budget.
9. **Prove it.** predict step. Scenario: a task instance has been "running" for six hours with no visible progress and no error in its log. Options: "it's definitely still working, leave it" / "check its heartbeat — it may be a zombie the scheduler hasn't caught yet" (correct).

## Engagement arc
Hook step 1; predict step 4 (within first four); surprising number: append doubling to six rows from an identical two-run retry that overwrite leaves untouched at three; three takeaways (5, 6, 7); recap (8); second predict "Prove it" (9).

## Narrator's line of thought, beyond the description
- Step 2: she names the trap directly — "retried" in a log line does not mean "ran once, then again"; it can mean the first attempt silently succeeded and only the *report* of success was lost.
- Step 5: she flags that `upstream_failed` is not "skipped" — a reader who conflates the two will misdiagnose a DAG run; this distinction is exactly what the real, executed demo proves.
- Step 6: she's honest about scope — this topic names and sources the zombie mechanism precisely from Airflow's own docs, but reproducing it live needs a persistent scheduler heartbeating over real wall time, which this session's sandbox couldn't run reliably; she says so rather than performing certainty she doesn't have.
- Step 7: she corrects the instinct to "just add more retries" — more retries on a non-retryable error is strictly worse, not neutral, because it delays visibility into a real problem.

## Post-notes headings
- Outcomes.
- Internals: task-instance state machine (full list from Airflow's own docs), retry policies (`ExceptionRetryPolicy`), the exact heartbeat-timeout reproduction recipe quoted in full.
- Lab: the idempotent-overwrite demo and the real trigger-rule DAG run, both reproducible from `examples.py`.
- Production: why "at-least-once execution + idempotent write" is the only honest way to describe what a retry guarantees.
- Frontier: custom retry policies (`RetryRule`, per-exception `RetryAction`).
- Where this goes next: backfills re-run this exact idempotency property across years of history (topic 3).

## Examples to execute and what they assert
- `demonstrate_idempotent_vs_append`: overwrite leaves 3 rows after two runs; append leaves 6 (asserted).
- `run_trigger_rule_demo`: real `airflow dags test` run; final states exactly `{a_fails: failed, b_default_rule: upstream_failed, c_one_failed_rule: success}` (asserted).

## Bridge and handoff
- Bridge: "The executor's job is to retry a failed task, but that retry is only safe if running the task twice does no harm. This topic is that property..." (answers topic 1's handoff).
- Handoff: "An idempotent task can safely be re-run for one interval. A backfill re-runs it for every interval across years of history..." -> topic 3.

## Concept ledger
- Introduces: `idempotent-tasks-failure-semantics`, `zombie-task-detection`, `trigger-rule-propagation`.
- Uses: `orchestrator-architecture-scheduler` (topic 1), `exactly-once-effect-recipe` and `deterministic-batch-id` (Chapter 8 topic 6, `de.idempotent-resumable-extraction`).
- Declared: none beyond topic 1.

## Claims list
1. Task states include `upstream_failed` and `up_for_retry` -> Airflow 3.3.2 "Tasks" docs.
2. `execution_timeout` bounds every task, raises `AirflowTaskTimeout` -> same source.
3. Default retry: fixed count/delay regardless of error type; a retry policy customises per exception -> same source.
4. A zombie task is a stuck-running TaskInstance whose worker is gone, found via missed heartbeat -> same source.
5. The documented local reproduction recipe uses three scheduler config values -> same source, quoted.
6. Default trigger rule is `all_success`; `one_failed` runs a task specifically because an upstream failed -> Airflow 3.3.2 "Dags" docs.
7. Overwrite-keyed-by-interval output is stable across two runs (3 rows); append-keyed doubles (6 rows) -> this topic's own `examples.py`, executed.
8. A real three-task DAG run with `airflow dags test` ends with exactly `{failed, upstream_failed, success}` -> this topic's own `examples.py`, executed against Airflow 3.3.2.
