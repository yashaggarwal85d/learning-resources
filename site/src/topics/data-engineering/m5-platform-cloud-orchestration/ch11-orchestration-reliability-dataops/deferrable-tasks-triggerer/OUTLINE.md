# Outline: Deferrable tasks and the triggerer

## Engagement arc

1. **Hook** — a hundred sensors in poke mode, each waiting up to six hours, quietly occupy a hundred worker slots for work that is almost entirely idle.
2. **Reveal: same sensor, worker occupancy measured** — the real experiment: twelve `TimeDeltaSensor` tasks, fifteen-second wait, poke vs deferrable, same four-task cap. Poke holds the worker for the whole wait; deferred frees it almost immediately.
3. **Predict: who's still holding a worker mid-wait?** — before the measured numbers land, ask which mode still occupies a worker slot ten seconds into the wait.
4. **Reveal: the triggerer, scaled separately** — the triggerer is its own process, scaled independently of workers and scheduler; it runs many lightweight coroutines in one process.
5. **Predict: what happens if a trigger holds something unpicklable?** — before the serialization reveal, ask what happens to a trigger whose `__init__` captures something that can't survive a round trip.
6. **Reveal: trigger serialization, corrupted not crashed** — the real experiment: a `threading.Lock` serialized through Airflow's own `BaseSerialization` comes back as a string. No error at serialize time — the break surfaces later, when something tries to use it.
7. **Reveal: triggerer saturation, sourced** — default capacity 1000 triggers per triggerer process, `max_trigger_to_select_per_loop` keeping HA deployments balanced; not independently reproduced here, but Airflow's own stated numbers.
8. **Recap** — pools bound concurrency; the triggerer gives back the worker itself while a task only waits.
9. **Prove it** — the hundred-sensor hook again: switch them to deferrable and ask whether worker-slot-hours actually drop by the measured ~95%.

## Deep dives

- **Internals**: `mode='reschedule'` vs `deferrable=True` — reschedule is a `BaseSensorOperator` built-in that re-polls on a timer; deferrable requires an operator that implements `execute()`/`execute_complete()` and hands off to a trigger.
- **Frontier**: Airflow 3.1's Human-in-the-Loop operators (`awaiting_input` task state, "running off the triggerer") and Deadline Alerts, both introduced in 3.1 and both reusing the same deferral mechanism rather than inventing new machinery.
