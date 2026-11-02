# Fact-check: Concurrency controls: pools, queues, priorities

1. **A pool limits execution parallelism on an arbitrary set of tasks, independent of worker capacity.**
   Confirmed. Pools doc: "Some systems can get overwhelmed when too many processes hit them at the same time. Airflow pools can be used to limit the execution parallelism on arbitrary sets of tasks." Measured directly: see claim 4.

2. **As pool slots free up, queued tasks start running based on priority weight.**
   Confirmed. Pools doc: "Once capacity is reached, runnable tasks get queued... As slots free up, queued tasks start running based on the Priority Weights of the task and its descendants." Measured directly: see claim 4.

3. **`priority_weight` defaults to 1; larger numbers mean higher priority.**
   Confirmed. Priority Weights doc: "priority_weight defines priorities in the executor queue. The default priority_weight is 1, and can be bumped to any integer; larger numbers mean higher priority."

4. **This topic's own real demo: with a 2-slot pool and ten competing mapped tasks, both high-priority instances ran first, and the pool never exceeded 2 concurrently running instances.**
   Confirmed, independently reproduced live in this session. Ran a real Apache Airflow 3.3.2 scheduler, dag-processor and API server against this sandbox's own PostgreSQL metadata database. Created a pool `fragile_source_pool` with 2 slots (`airflow pools set fragile_source_pool 2 "..."`). Triggered `pool_demo_dag` (10 mapped task instances across two tasks sharing that pool: `extract_high`, 2 instances, `priority_weight=10`; `extract_low`, 8 instances, `priority_weight=1`). Reading `task_instance.start_date`/`end_date` back from the database: both `extract_high` instances started at roughly one second after trigger and finished by roughly five seconds; no `extract_low` instance started before roughly six seconds. Across the entire run, counting overlapping `[start_date, end_date)` intervals at every instant, the maximum number of instances running at once was exactly 2 — matching the pool's slot count precisely, never more, never fewer at saturation.

5. **Queue-to-worker routing lets specific tasks run only on workers listening to a matching queue — a CeleryExecutor/KubernetesExecutor mechanism.**
   Confirmed, sourced and quoted, not independently reproduced live (this topic's live demo runs on LocalExecutor, topic 1's established sandbox setup, which has no queue-to-worker routing concept at all — there is only one process pool). Celery Executor doc: "When using the CeleryExecutor, the Celery queues that tasks are sent to can be specified... Workers can listen to one or multiple queues of tasks... This worker will then only pick up tasks wired to the specified queue(s)."

6. **Airflow 3.2 introduces multi-team support and states it is experimental.**
   Confirmed. Release Notes: "Airflow 3.2 introduces multi-team support, allowing organizations to run multiple isolated teams within a single Airflow deployment. Each team can have its own Dags, connections, variables, pools, and executors... Multi-Team Deployments are experimental in 3.2.0 and may change in future versions based on user feedback."

7. **Starvation is the unbounded extension of the exact priority-weight mechanism measured in claim 4.**
   Disclosed, not independently reproduced as a true indefinite-wait scenario. This topic's measured demo (claim 4) shows priority weight correctly favoring higher-priority work for a scarce slot — a healthy, bounded version of the mechanism. The claim that a continuous stream of higher-priority arrivals could starve a waiting low-priority task indefinitely follows directly from that same mechanism with no reservation or fairness policy added, but was not run as its own experiment (doing so honestly needs an unbounded, continuously-triggering stream of high-priority work, which this session's single triggered run doesn't produce) — stated as a reasoned consequence in post-notes.md and the reel's predict step, not as a separately measured result.
