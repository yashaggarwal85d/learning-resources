# Before you watch

- **Deferrable task** — an operator that can suspend itself mid-run, handing its worker slot back, and resume later when a trigger fires.
- **Triggerer** — the separate Airflow process that runs the asynchronous triggers deferred tasks hand off to.
- **Poke mode** — a sensor's default idle-wait style: hold the worker, check on a fixed interval, release only on success or timeout.
- **Reschedule mode** — a sensor option that releases the worker between checks but still polls on a timer; different from deferring.
- **Trigger serialization** — writing a trigger's own setup state to the database so it can be re-instantiated on any triggerer process.
- **Human-in-the-loop (HITL) operator** — an Airflow 3.1 feature that pauses a task in a deferred state to wait for a person's decision via the UI.
- **Deadline alert** — an Airflow 3.1 feature that fires a callback when a DAG run exceeds a time threshold.
