# Before you watch

- **Durable execution** — a model where a long-running workflow's progress is recovered from a durably stored history of what already happened, rather than from a running process's own memory.
- **Event-sourced replay** — resuming a workflow by re-running its code against a recorded, ordered log of past events, so it reaches the same state it was in before a crash or pause.
- **Saga** — a sequence of local transactions across multiple systems, each with a compensating action that undoes it if a later step fails.
- **Human-in-the-loop** — a workflow step that waits on a person's decision rather than a machine finishing work, often for hours or days.
- **Hybrid orchestration** — a design where a batch task graph or asset graph hands off one long, human-paced step to a durable-execution workflow, instead of modeling the whole wait itself.
- **Worker** — the process that polls for work and runs a workflow's or activity's code, in both Airflow's and Temporal's sense of the word.
- **Reschedule mode** (recap, topic six) — a sensor that releases its worker between checks instead of occupying it the whole time it waits.
