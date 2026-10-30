# Outline: Orchestrator architecture: scheduler, executor, metadata DB (`de.orchestrator-architecture-scheduler`)

## Learning outcomes
1. Name which of the scheduler, executor, Dag processor or metadata DB a given symptom points to.
2. Choose Local, Celery or Kubernetes executor for a given scale and justify it.
3. Explain, and show with a real two-process demo, how two schedulers coordinate safely through the metadata DB with `SELECT ... FOR UPDATE SKIP LOCKED`.
4. Predict and measure where DAG-parsing cost becomes the ceiling as a deployment's DAG-file count grows.

## Reel steps and storyboard

1. **Hook.** fig: a team doubles DAG files from a few hundred to thousands and scheduler latency doesn't double, it falls off a cliff. Visual: two `Row`s (label/value), "dag file count" -> "doubled", "scheduler loop latency" -> "not yet revealed" (focus colour). Beat: both rows ease in staggered. Final frame: the unrevealed cliff is the open question.
2. **Reveal: the three required parts.** fig: a minimal Airflow install needs a scheduler (the executor runs inside it, not separately), a Dag processor, an API server and a metadata DB. Visual: four `Row`s naming each required component and its one-line role, easing in in sequence. Final frame: four labelled rows, all lit.
3. **Reveal: executors, three shapes.** fig: Local (same process), Celery (a worker pool via a broker), Kubernetes (one pod per task). Visual: three `Row`s, each with the executor name and its one distinguishing property (same process / broker + pool / one pod each). Takeaway: none yet (reveal, not a close).
4. **Predict: two schedulers, one metadata DB — does a task ever get scheduled twice?** Within the first four steps (required). Options: "yes, eventually one wins but duplicates happen on the way" / "no — SKIP LOCKED means at most one claims any given row" (correct). Explain: the row lock is held only long enough to claim the row, so a second scheduler's SELECT simply skips it.
5. **Reveal: HA via row locks, measured.** fig: two real scheduler-loop threads against this sandbox's own Postgres claim ten real rows with `SKIP LOCKED`, zero double-claims. Visual: `Row`s for "two schedulers, ten tasks" -> "split, zero overlap" (focus). Takeaway 1: a lock held only for the claim, not the whole task, is what lets two schedulers share one queue without ever stepping on each other.
6. **Reveal: DAG-parsing cost, measured.** fig: the real DagBag benchmark at 100, 1,000 and 5,000 synthetic DAG files — parse time rises in close to direct proportion to file count. Visual: three `Row`s, file count -> parse time (in words: "a few hundred milliseconds" / "about two seconds" / "about ten seconds"). Takeaway 2: parsing cost isn't a fixed tax paid once — it scales with every file in the deployment, measured directly, not assumed.
7. **Reveal: the metadata DB as the real ceiling.** fig: every state transition (each DAG, each task instance) is a write the metadata DB must absorb, which saturates before the scheduler's own CPU does; Airflow 2 reaching end of life (April 2026) as a fact the learner should carry forward. Visual: `Row`s "scheduler CPU" -> "mostly idle" / "metadata DB" -> "straining" (focus, second colour). Takeaway 3: the component that looks busiest in a dashboard (the scheduler process) is usually not the one actually limiting throughput.
8. **Recap.** fig: four parts, three executor shapes, one coordination trick, one real cost curve. Visual: four short `Row`s summarizing architecture / executors / row locks / parsing cost.
9. **Prove it.** predict step. Scenario: a team's DAG count grows from a few hundred to several thousand files overnight after a migration; nothing in the DAGs themselves changed. Options: "the scheduler process itself needs more CPU" / "parsing cost and metadata-DB writes grow with file count, so that's the first thing to profile" (correct). Explain: ties back to steps 6-7's measured result.

## Engagement arc
- Hook on step 1 (the latency cliff).
- Predict within the first four steps (step 4, the SKIP LOCKED question).
- Surprising number: parse time scaling almost linearly to ten seconds at 5,000 files, measured directly, not estimated.
- Three takeaways (steps 5, 6, 7).
- Recap (step 8) and a second predict, "Prove it" (step 9).

## Narrator's line of thought, beyond the description
- Step 2: she doesn't just list the four parts — she points out the detail an engineer new to Airflow 3 gets wrong: the executor isn't a fifth box, it's a *setting* on the scheduler, and that's exactly why swapping LocalExecutor for CeleryExecutor doesn't change what code looks like, only where it runs.
- Step 4 (predict): before revealing, she asks the learner to notice that a lock held for the whole task would defeat the purpose — the trick is holding it only for the instant of claiming.
- Step 6: she flags the thing the raw numbers could mislead on — parse time growing with file count is not the same claim as "more DAGs means a slower scheduler loop in general"; it's specifically the Dag processor's own parsing pass, re-paid on every cycle unless the Dag bundle is versioned.
- Step 7: she names the intuition trap directly — a dashboard showing low scheduler CPU looks healthy, and that's precisely when the metadata DB is usually the thing actually gating throughput.

## Post-notes headings
- Outcomes (recap of the four learning outcomes).
- Internals: the Task Execution API / Task SDK boundary (workers never touch the metadata DB directly), the Dag bundle versioning note from the overview page (local-disk bundles can let the Dag processor and workers see different versions of a Dag until both catch up), and the HA-coordination SQL in full.
- Lab: the DagBag-parsing benchmark methodology and the SKIP LOCKED demo, both reproducible from `examples.py`.
- Production: the two-scheduler SKIP LOCKED mechanism as it is used for Airflow's own real HA scheduler deployments.
- Frontier: the Edge executor for workers outside the cluster network, named and sourced only.
- Where this goes next: idempotent tasks and the retry that the executor triggers on failure (topic 2).

## Examples to execute and what they assert
- `measure_dag_parsing_cost`: DagBag parse time at 100/1,000/5,000 DAG files strictly increasing; per-file ms stays in a sane 1-10 ms band at every scale (asserted).
- `demonstrate_skip_locked_coordination`: two scheduler threads claim exactly 10 rows total with zero duplicate claims (asserted).

## Bridge and handoff
- Bridge (from the chapter's assumed Ch.9/10 handoff): restated in reel.tsx/registry as "Chapters 1 through 10 built pipelines that are each correct on their own... This chapter opens with that architecture."
- Handoff: "The executor's job is to run a task and the scheduler's job is to retry it if it fails. That retry is only safe if running the task twice does no harm" -> topic 2.

## Concept ledger
- Introduces: `orchestrator-architecture-scheduler`, `executor-model-comparison`, `ha-scheduler-row-locks`.
- Uses: `ch9.partitioned-log-model` (placeholder, Chapter 9 not yet published), `ch1.process-model` (Chapter 1 §1.2).
- Declared: basic familiarity with cron and DAGs.

## Claims list (claim -> source)
1. A minimal Airflow install needs scheduler, Dag processor, API server, metadata DB -> Airflow 3.3.2 Architecture Overview, "Required components".
2. The executor is a configuration property of the scheduler, not a separate component -> same source.
3. The Dag processor is mandatory and always a standalone process in Airflow 3 -> same source, "Separate Dag processing architecture".
4. Workers talk to Airflow through the Execution API / Task SDK, never touching the metadata DB directly -> same source, "Task execution architecture".
5. `SKIP LOCKED` lets concurrent consumers split rows from a queue-like table without contention, at the cost of an inconsistent view unsuitable for general-purpose reads -> PostgreSQL `SELECT` documentation, `FOR UPDATE` clause.
6. Airflow 2's final minor (2.11.2) reaches EOL/Terminated 22 Apr 2026; Airflow 3 first released 22 Apr 2025 -> Airflow 3.3.2 "Supported versions" (Version Life Cycle table).
7. DAG-parsing cost grows with DAG file count (measured on this sandbox: ~1.5-2 ms/file from 100 to 5,000 files) -> this topic's own `examples.py`, executed.
8. Two concurrent schedulers can split a shared queue table with zero double-claims using `SKIP LOCKED` (measured: 10/10 unique claims across two threads) -> this topic's own `examples.py`, executed.
