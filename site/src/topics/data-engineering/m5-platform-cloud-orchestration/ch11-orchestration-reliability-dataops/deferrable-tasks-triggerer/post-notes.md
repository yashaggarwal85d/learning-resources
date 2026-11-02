<section data-section="outcomes">

## Outcomes

By the end of this topic you can: choose poke, reschedule, or deferrable mode for a given sensor and justify it by worker-slot-hours; explain why the triggerer scales independently of workers; name the real failure mode in trigger serialization and why it's worse than a crash; name the two Airflow 3.1 features that reuse the same deferral mechanism.

</section>

<section data-section="internals">

## Internals

`mode='reschedule'` and `deferrable=True` solve the same idle-wait problem by different means, and the two are easy to conflate. Reschedule is a `BaseSensorOperator` built-in: "it allows the sensor to reschedule itself if the condition is not met," releasing the worker only between fixed-interval checks. Deferring is different in kind, not degree — the operator hands execution to a trigger running in a wholly separate process, and "the task no longer occupies a worker slot" for the entire wait, not just the gaps between checks.

Trigger serialization is the part that fails quietly. Airflow's own docs describe the contract plainly: `__init__` and `serialize` are meant to be written as a pair, and triggers should avoid "any kind of persistent state" so they "can be serialized and moved around freely." This topic's own measured round trip shows what happens when that contract is violated: a live `threading.Lock`, serialized through Airflow's `BaseSerialization` and read back, becomes a plain string. No exception at serialize time — the corruption is silent, and the break only surfaces the next time something tries to use the object as the real thing.

</section>

<section data-section="lab">

## Lab

Two experiments, run against a real Apache Airflow 3.3.2 install (scheduler, triggerer, dag-processor and API server as separate processes, PostgreSQL metadata database):

The same `TimeDeltaSensor`, same fifteen-second wait, same four-task cap, run twelve times with `deferrable=False` and twelve times with `deferrable=True`. Reading each task's own attempt log (the `::group::Pre Execute` / `Pausing task as DEFERRED` / resume lines): the poke run held a worker for the full wait on every task, 61.87 worker-seconds total. The deferred run cost 3.03 worker-seconds total for the identical twelve waits — a 95.1% reduction — while taking longer in real wall-clock time (196.74s vs 61.87s), because freeing the worker costs a round trip through the scheduler and triggerer that holding it does not.

A live `threading.Lock`, passed through `airflow.serialization.serialized_objects.BaseSerialization.serialize()` and `.deserialize()` directly: serialization raised nothing, and the object that came back was a `str`, not a `Lock`. Calling `.acquire()` on it raised `AttributeError: 'str' object has no attribute 'acquire'` — the failure that was deferred, literally, to the moment of use.

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file; run `airflow scheduler`, `airflow triggerer`, `airflow dag-processor` and `airflow api-server` as separate processes against a migrated PostgreSQL database, pointing the Task SDK's execution API URL at the API server; a DAG with twelve `TimeDeltaSensor` tasks per mode, `max_active_tasks` capped; read `logs/dag_id=.../task_id=.../attempt=1.log` for the defer/resume timestamps.

</section>

<section data-section="production">

## Production

Choosing a wait mode is a worker-slot-hours decision, not a latency one: poke mode is simplest and fine for short, frequent checks; reschedule trades a little latency for freeing the worker between checks on a fixed interval; deferring goes furthest, freeing the worker for the entire wait, at the cost of needing a deferrable-aware operator and running at least one triggerer process. The trigger-serialization trap matters operationally because it doesn't announce itself — a custom trigger that captures a live connection or a lock will work perfectly in a single long-lived process and only break the first time a triggerer restarts, an HA reschedule happens, or the trigger is read back from the database days later.

</section>

<section data-section="frontier">

## Frontier

Airflow 3.1 introduced two features that lean on this exact deferral mechanism rather than inventing new machinery: Human-in-the-loop operators, which "pause execution in a deferred state while waiting for human input via the Airflow UI" — a later changelog entry confirms the task state this adds, `awaiting_input`, is explicitly described as "running off the triggerer" — and Deadline Alerts, which fire a callback "when time thresholds are exceeded," both shipped in the same 3.1.0 release and both marked experimental at the time.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A deferred task still waits for something specific it already knows to watch for — a timer, a file, an API response. Some pipelines need the opposite: a run triggered not by a clock or a known wait, but by data itself becoming freshly available somewhere else.

</section>
