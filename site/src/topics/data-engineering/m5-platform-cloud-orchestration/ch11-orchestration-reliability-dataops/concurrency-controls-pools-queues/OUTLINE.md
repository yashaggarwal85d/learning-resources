# Outline: Concurrency controls: pools, queues, priorities

## Reel steps (9)

1. **Hook.** The shop's JDBC extractor has no pool at all. The day a backfill (topic 3) and a dynamic fan-out (topic 4) land on the same hour, forty extraction tasks hit the production database at once and it falls over.
2. **Reveal: a pool, run for real.** A 2-slot pool protecting that same source. Ten mapped tasks compete for it in one run — never more than two running at once, for the whole run, read straight from the metadata database.
3. **Predict: who gets the scarce slot first?** Two of those ten tasks are marked higher priority. Does the scheduler hand them a slot first, or does it just run whichever task happened to queue first?
4. **Reveal: priority weight, measured.** Both high-priority instances start and finish before any low-priority instance even begins — exact timestamps, read from the same run.
5. **Reveal: queue-to-worker routing (sourced).** A different mechanism for a different problem: routing specific tasks to specific worker pools entirely, by queue name — a Celery/Kubernetes-executor feature this sandbox's LocalExecutor doesn't exercise, quoted precisely from Airflow's own docs.
6. **Predict: what happens if high-priority work never stops arriving?** If new high-priority tasks kept landing in the pool faster than slots freed, what happens to the low-priority ones already waiting?
7. **Reveal: starvation is the same mechanism, just unbounded.** Priority weight that always favors the same class of work can mean a low-priority task waits indefinitely — the fairness problem a reservation or round-robin policy exists to bound.
8. **Recap.** A pool caps concurrency independent of worker capacity. Priority weight decides who gets a freed slot first. Multi-team deployments (experimental since 3.2) extend isolation to pools themselves.
9. **Prove it.** The shop's fragile source now has its 2-slot pool. A new backfill and a new fan-out land on the same hour again. Does the source go down this time?

## Learning outcomes

Configure a pool to cap concurrency against a fragile source and prove it holds under fan-out; use priority weights to resolve contention for a scarce slot predictably; explain starvation as an unbounded version of the same mechanism; state what multi-team deployments add and their current maturity.

## Claims (for FACT-CHECK.md)

1. A pool limits execution parallelism on an arbitrary set of tasks, independent of worker capacity (Pools doc).
2. As pool slots free up, queued tasks start running based on priority weight (Pools doc).
3. `priority_weight` defaults to 1; larger numbers mean higher priority (Priority Weights doc).
4. This topic's own real demo: with a 2-slot pool and ten competing mapped tasks (two at priority_weight=10, eight at priority_weight=1), both high-priority instances ran first, and the pool never exceeded 2 concurrently running instances across the entire run (measured).
5. Queue-to-worker routing lets specific tasks run only on workers listening to a matching queue — a CeleryExecutor/KubernetesExecutor mechanism, not demonstrated against this sandbox's LocalExecutor (Celery Executor doc, disclosed as sourced not operated).
6. Airflow 3.2 introduces multi-team support (isolated Dags, connections, variables, pools and executors per team) and states it is experimental (Release Notes).
7. Starvation (a low-priority task waiting indefinitely while higher-priority work keeps arriving) is the unbounded extension of the exact priority-weight mechanism measured in claim 4, not independently reproduced as a true indefinite-wait scenario in this session — disclosed as a reasoned extension.

## Concept ledger

**Introduces:** `pool-slot-concurrency-control`, `priority-weight-scheduling`, `starvation-fairness-tradeoff`.
**Uses:** `de.dynamic-task-mapping-fan` (topic 4), `ch8.database-extraction-without-hurting`, `de.orchestrator-architecture-scheduler` (topic 1).
**Declared:** none beyond topic 4.

## Bridge / handoff

**Bridge:** "Fan-out can produce thousands of task instances that all want to run at once. This topic is what decides how many actually do, in what order, and how a fragile source is protected from being overrun by exactly the kind of fan-out the last topic showed."

**Handoff:** "A task waiting in a pool for a slot still occupies a worker process while it waits. Some tasks wait for hours, not seconds — for an external job, or a sensor polling an API. Holding a worker that whole time is wasteful, and there is a mechanism built specifically to avoid it."
