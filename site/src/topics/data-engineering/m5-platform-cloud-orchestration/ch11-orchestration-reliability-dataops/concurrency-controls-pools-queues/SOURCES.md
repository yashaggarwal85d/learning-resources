## Pools

URL: https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/pools.html
Version: Apache Airflow 3.3.2 documentation

> Some systems can get overwhelmed when too many processes hit them at the same time. Airflow pools can be used to
> limit the execution parallelism on arbitrary sets of tasks.

> Tasks will be scheduled as usual while the slots fill up. The number of slots occupied by a task can be configured by
> pool_slots (see section below). Once capacity is reached, runnable tasks get queued and their state will show as such in the UI.
> As slots free up, queued tasks start running based on the Priority Weights of the task and its
> descendants.

> Note that if tasks are not given a pool, they are assigned to a default pool default_pool, which is
> initialized with 128 slots and can be modified through the UI or CLI (but cannot be removed).

> Airflow tasks will each occupy a single pool slot by default, but they can be configured to occupy more with the pool_slots argument if required.

## Priority Weights

URL: https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/priority-weight.html
Version: Apache Airflow 3.3.2 documentation

> priority_weight defines priorities in the executor queue. The default priority_weight is 1, and can be
> bumped to any integer; larger numbers mean higher priority.

> The effective weight is the exact priority_weight specified
> without additional weighting.

> The priority_weight parameter can be used in conjunction with Pools.

## Celery Executor

URL: https://airflow.apache.org/docs/apache-airflow-providers-celery/stable/celery_executor.html
Version: apache-airflow-providers-celery documentation

> When using the CeleryExecutor, the Celery queues that tasks are sent to
> can be specified. queue is an attribute of BaseOperator, so any
> task can be assigned to any queue.

> Workers can listen to one or multiple queues of tasks. When a worker is
> started (using command airflow celery worker), a set of comma-delimited queue
> names (with no whitespace) can be given (e.g. airflow celery worker -q spark,quark).
> This worker will then only pick up tasks wired to the specified queue(s).

> This can be useful if you need specialized workers, either from a
> resource perspective (for say very lightweight tasks where one worker
> could take thousands of tasks without a problem), or from an environment
> perspective (you want a worker running from within the Spark cluster
> itself because it needs a very specific environment and security rights).

Note: this sandbox runs the LocalExecutor (topic 1's own established setup), which does not route by queue — queue-to-worker routing is specifically a CeleryExecutor/KubernetesExecutor mechanism, quoted here rather than operated live. This topic's own live demo (pools + priority weights) runs against LocalExecutor, where those two mechanisms are fully active.

## Release Notes

URL: https://airflow.apache.org/docs/apache-airflow/stable/release_notes.html
Version: Apache Airflow 3.3.2 documentation (Airflow 3.2.0 section)

> Airflow 3.2 introduces multi-team support, allowing organizations to run multiple isolated teams within a single Airflow deployment.
> Each team can have its own Dags, connections, variables, pools, and executors— enabling true resource and permission isolation without requiring separate Airflow instances per team.

> Multi-Team Deployments are experimental in 3.2.0 and may change in future versions based on
> user feedback.
