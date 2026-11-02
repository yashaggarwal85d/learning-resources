<section data-section="outcomes">

## Outcomes

By the end of this topic you can: configure a pool to cap concurrency against a fragile source and prove it holds under fan-out; use priority weights to resolve contention for a scarce slot predictably; explain starvation as an unbounded version of the same mechanism; state what multi-team deployments add and their current maturity.

</section>

<section data-section="internals">

## Internals

A pool's slot count is a hard ceiling that applies "while the slots fill up," regardless of how many workers the deployment actually has: "Once capacity is reached, runnable tasks get queued and their state will show as such in the UI" (Pools doc). This is a genuinely separate control from worker capacity — a deployment with a hundred idle workers still can't run more than a pool's slot count of tasks assigned to that pool at once.

Priority weight resolves the queue that forms once a pool saturates: "As slots free up, queued tasks start running based on the Priority Weights of the task and its descendants." This topic's own measured run confirms the mechanism exactly as documented — both `priority_weight=10` instances claimed the pool's two slots the moment the run started, and every `priority_weight=1` instance waited until a higher-priority instance released its slot.

Queue-to-worker routing is a different axis entirely: pools bound *how many* tasks of a kind run at once; queues decide *which worker* runs a given task at all. It depends on an executor that has multiple worker processes to route between (CeleryExecutor, KubernetesExecutor) — a LocalExecutor deployment, like this topic's own live demo, has exactly one process pool and nothing to route to.

</section>

<section data-section="lab">

## Lab

One experiment, run against a real Apache Airflow 3.3.2 install, dag-processor, API server and this sandbox's own PostgreSQL metadata database:

A pool `fragile_source_pool` with 2 slots, protecting ten mapped task instances across two tasks in one Dag run: `extract_high` (2 instances, `priority_weight=10`) and `extract_low` (8 instances, `priority_weight=1`), all competing for the same pool at once. Reading `task_instance.start_date`/`end_date` back from the database: both high-priority instances started around one second after the trigger and finished by roughly five seconds in; the first low-priority instance didn't start until roughly six seconds in. Across the whole run, never more than 2 of the 10 instances were running at the same instant — the pool's slot count, held exactly.

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file; `airflow pools set <name> <slots> <description>`; assign tasks to that pool with `pool=` and stagger their `priority_weight`; run the scheduler, dag-processor and API server as separate processes against a migrated PostgreSQL database; trigger the Dag and poll `task_instance` in `psql`.

</section>

<section data-section="production">

## Production

A pool sized to a fragile source's own safe concurrency limit turns the previous topic's blast-radius risk into a bounded, controlled one: the same forty tasks a backfill-plus-fan-out collision can create still get created, but the source only ever sees as many at once as the pool allows. Priority weight then decides which of those forty matter most when the pool is the bottleneck — without it, a long queue of equally-weighted tasks runs in whatever order the scheduler happens to pick, which is not a decision anyone chose on purpose.

</section>

<section data-section="frontier">

## Frontier

Multi-team deployments, experimental since Airflow 3.2, extend this topic's isolation idea past a single pool: "Each team can have its own Dags, connections, variables, pools, and executors — enabling true resource and permission isolation without requiring separate Airflow instances per team." Named here as the direction this mechanism is heading, not demonstrated as mature — the release notes themselves flag it as subject to change based on feedback.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A task waiting in a pool for a slot still occupies a worker process the entire time it waits. For a task that waits seconds, that's fine. For a task waiting hours — an external job, a sensor polling an API — holding a worker that whole time is wasteful. The next topic is the mechanism built specifically to avoid that.

</section>
