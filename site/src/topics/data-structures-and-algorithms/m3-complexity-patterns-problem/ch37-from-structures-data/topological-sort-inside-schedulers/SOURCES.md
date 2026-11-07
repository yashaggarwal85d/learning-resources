# Sources — Topological sort inside schedulers

## Priority Weights (Apache Airflow documentation)

URL: https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/priority-weight.html
Version: fetched 2026-11-07, Airflow 3.4.0 docs

> priority_weight defines priorities in the executor queue. The default priority_weight is 1, and can be
> bumped to any integer; larger numbers mean higher priority.

> By default, Airflow's weighting method is downstream.

> The effective weight of the task is the aggregate sum of all
> downstream descendants. As a result, upstream tasks will have
> higher weight and will be scheduled more aggressively when
> using positive weight values.

Contents (for the coverage map): the default `priority_weight` of 1, the `downstream` rule as
Airflow's default weighting method, and its own description of the rule as a sum over
descendants.

## priority_strategy.py (Apache Airflow, `main` branch)

URL: https://raw.githubusercontent.com/apache/airflow/main/airflow-core/src/airflow/task/priority_strategy.py
Version: fetched 2026-11-07, `main` branch HEAD at fetch time

> class _DownstreamPriorityWeightStrategy(PriorityWeightStrategy):
> """Priority weight strategy that uses the sum of the priority weights of all downstream tasks."""
>
> def get_weight(self, ti: TaskInstance) -> int:
> if TYPE_CHECKING:
> assert ti.task
> dag = ti.task.get_dag()
> if dag is None:
> return ti.task.priority_weight
> return ti.task.priority_weight + sum(
> dag.task_dict[task_id].priority_weight
> for task_id in ti.task.get_flat_relative_ids(upstream=False)
> )

Contents (for the coverage map): the exact `downstream` rule implementation — a task's own
`priority_weight` plus the `priority_weight` of every id in `get_flat_relative_ids(upstream=False)`.
This is the "own weight plus count of descendants" rule the topic's `examples.py` reuses
(with every task's own weight at 1, matching the default).

## airflow_shared/dagnode/node.py (Apache Airflow, `main` branch)

URL: https://raw.githubusercontent.com/apache/airflow/main/shared/dagnode/src/airflow_shared/dagnode/node.py
Version: fetched 2026-11-07, `main` branch HEAD at fetch time

> def get_flat_relative_ids(self, *, upstream: bool = False, depth: int | None = None) -> set[str]:
> """
> Get a flat set of relative IDs, upstream or downstream.
>
> Will recurse each relative found in the direction specified.

Contents (for the coverage map): `get_flat_relative_ids` returns a `set[str]`, so a descendant
reachable by two different paths is counted once in the `downstream` rule's sum, not once per
path — the fact the topic's fan-out-versus-chain example depends on.

## airflow_shared/dagnode/cycle.py (Apache Airflow, `main` branch)

URL: https://raw.githubusercontent.com/apache/airflow/main/shared/dagnode/src/airflow_shared/dagnode/cycle.py
Version: fetched 2026-11-07, `main` branch HEAD at fetch time

> def detect_cycle(node_ids: Iterable[str], downstream_of: Callable[[str], Iterable[str]]) -> str | None:
> """
> Search the graph for a cycle, following downstream edges only.

> :param node_ids: Every node in the graph, so that disconnected components are covered too.
> :param downstream_of: Returns the ids directly downstream of the given node id.
> :return: The id of the node whose downstream edge closes a cycle, or None when acyclic.
> """

> # Iterative rather than recursive: Python's stack depth limit is easily
> # reached by a graph with long chains.

> for downstream_id in downstream_of(current_id):
> if visited[downstream_id] == _IN_PROGRESS:
> return current_id

Contents (for the coverage map): `detect_cycle` is an iterative three-colour DFS (`_NEW`,
`_IN_PROGRESS`, `_DONE`), chosen over a recursive one for Python's stack-depth limit on long
chains, and it returns the id of the one node whose edge closes the cycle.

## task-sdk dag.py (Apache Airflow, `main` branch)

URL: https://raw.githubusercontent.com/apache/airflow/main/task-sdk/src/airflow/sdk/definitions/dag.py
Version: fetched 2026-11-07, `main` branch HEAD at fetch time

> def check_cycle(self) -> None:
> """
> Check to see if there are any cycles in the Dag.

> :raises AirflowDagCycleException: If cycle is found in the Dag.
> """
> task_dict = self.task_dict
> faulty_task_id = detect_cycle(task_dict, lambda tid: task_dict[tid].get_direct_relative_ids())
> if faulty_task_id is not None:
> raise AirflowDagCycleException(
> f"Cycle detected in Dag: {self.dag_id}. Faulty task: {faulty_task_id}"
> )

Contents (for the coverage map): the Dag's own `check_cycle`, called when the Dag is loaded
(before any task runs), raises `AirflowDagCycleException` naming the one faulty task that
`detect_cycle` returned.

## utils/dag_cycle_tester.py (Apache Airflow, `main` branch)

URL: https://raw.githubusercontent.com/apache/airflow/main/airflow-core/src/airflow/utils/dag_cycle_tester.py
Version: fetched 2026-11-07, `main` branch HEAD at fetch time

> `airflow.utils.dag_cycle_tester` module is deprecated and will be removed in a future release." "Please use `dag.check_cycle()` method instead.

> .. deprecated:: 3.1.0
> This function is deprecated. Use `dag.check_cycle()` method instead.

Contents (for the coverage map): the older cycle-check module is deprecated since Airflow
3.1.0 in favour of `dag.check_cycle()`, which is the method the topic cites throughout.

## scheduler_job_runner.py (Apache Airflow, `main` branch) — read, not quotable through the fetch tool

URL: https://raw.githubusercontent.com/apache/airflow/main/airflow-core/src/airflow/jobs/scheduler_job_runner.py
Version: read directly (`curl`) 2026-11-07, `main` branch HEAD at fetch time, line 1099 of 4698

The project's `scripts/sources.mjs` fetch tool strips any `<...>` span from fetched text and,
because its regex allows the span to cross lines, it can delete large stretches of a
Python/C++ source between an unrelated `<` and a later unrelated `>`; this file's fetched copy
(`sources/airflow-scheduler-job-runner.txt`, 3736 lines) is missing real content that a direct
`curl` of the same URL (4698 lines) has, including the line below. The fact is read directly
against the raw source and cited by exact line number rather than quoted through
`sources.mjs check`, which would re-fetch and validate against the same corrupted copy:

Line 1099 of the query that selects schedulable task instances reads, verbatim from the
directly-fetched file:

```
.order_by(-TI.priority_weight, DR.logical_date, TI.region_index)
```

Contents (for the coverage map): the scheduler's own candidate-task query orders by
`-priority_weight` first (highest weight first), then by DAG run logical date, then by
region index — the ready-priority-queue selection the topic's `schedule()` mirrors.

## Multiprocessor scheduling (Wikipedia)

URL: https://en.wikipedia.org/wiki/Multiprocessor_scheduling
Version: fetched 2026-11-07

> Any list scheduling algorithm (an algorithm that processes the jobs in an arbitrary fixed
> order, and schedules each job to the first available machine) is a

(the 2 − 1/m bound that follows this line renders as stripped MathML on the fetched page; its
value is re-derived directly in `examples.py` and checked there against the measured makespans
of both weighting rules on the chapter's own DAG, not against a brute-force optimum, since the
DAG's own critical path already is a lower bound on any schedule.)

> Graham, Ron L. (1969-03-01). "Bounds on Multiprocessing Timing Anomalies". SIAM Journal on
> Applied Mathematics. 17 (2): 416–429. doi:10.1137/0117039. ISSN 0036-1399.

Contents (for the coverage map): Graham's list-scheduling bound, makespan ≤ (2 − 1/m)·optimal,
for any ready-queue order under a fixed worker count m, and its 1969 citation.
