# Outline: Choosing DAG, asset or durable models

## Engagement arc

1. **Hook** — a five-day vendor-approval process, modelled as an Airflow sensor in poke-then-reschedule mode, survives for five days by luck; the one time a code deploy restarts the scheduler mid-wait, the approval state is silently lost and has to be redone by hand. The same process modelled as a Temporal workflow survives the identical restart, because its state was never held in a process's memory to begin with.
2. **Reveal: three shapes, named** — the batch DAG (topics 1-7: time- or asset-triggered, minutes to hours), the asset graph (topic 8: a data product, not an action), and durable execution (Temporal: code-first, event-sourced, days to months) — each already earned its place; this topic is about choosing among them.
3. **Predict: what property actually decides?** — before the reveal, ask which property of a workload points at durable execution rather than a longer-running DAG.
4. **Reveal: the decision rule** — task duration (minutes/hours vs. days/months), human-in-the-loop, whether the unit of work reads better as a data product than an action, and whether multi-system compensation (a saga) is needed.
5. **Predict: what does a hybrid design actually look like?** — before the reveal, ask how a batch orchestrator and a durable workflow can cooperate on one pipeline.
6. **Reveal: the hybrid handoff** — an Airflow DAG (or Dagster asset) that, at the point it needs a long-lived, human-paced step, triggers a Temporal workflow and polls or waits for its completion, rather than modelling the wait inside the batch orchestrator.
7. **Reveal: why the durable side survives, sourced** — Temporal's own documentation on Event History and replay: a crashed worker recreates a workflow's state from a durable, ordered log of what already happened, rather than from anything held in a process's memory.
8. **Recap** — three shapes, one decision rule, and a hybrid pattern for the common case where only part of a pipeline is long-lived.
9. **Prove it** — this session's own two real Airflow runs: the approval-gate sensor polling a file (state the metadata DB holds) survives a real scheduler restart; a second sensor polling an in-process counter does not, even though both use the identical `reschedule` mode.

## Deep dives

- **Internals**: Temporal's Event History and replay model (sourced only — the chapter's own rule for this section, since a multi-day workflow cannot be run end to end in one sandbox session); Worker Versioning reaching General Availability; the saga pattern's compensation-in-reverse-order shape.
- **Frontier**: Prefect 3's dynamic, Python-native flows as a fourth point of comparison (structure can depend on runtime values, unlike a statically-defined DAG); the chapter's own 11.2 lab (migrate the approval gate to Temporal, kill workers mid-approval, deploy a code change mid-flight, compare recovery time/code size/infrastructure cost) run as far as a local Temporal dev server allows, disclosed sourced-only where the sandbox's own execution policy blocks running the downloaded Temporal CLI binary.
