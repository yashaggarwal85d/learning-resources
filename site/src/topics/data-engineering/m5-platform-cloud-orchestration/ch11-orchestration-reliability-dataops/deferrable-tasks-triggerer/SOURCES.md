# Sources

## Deferrable Operators & Triggers

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/authoring-and-scheduling/deferring.html
Version: Apache Airflow 3.3.2 documentation

> Standard Operators and Sensors take up a full worker slot for the entire time they are running, even if they are idle. For example, if you only have 100 worker slots available to run tasks, and you have 100 Dags waiting on a sensor that's currently running but idle, then you cannot run anything else - even though your entire Airflow cluster is essentially idle.

> When it has nothing to do but wait, an operator can suspend itself and free up the worker for other processes by deferring. When an operator defers, execution moves to the triggerer, where the trigger specified by the operator will run.

> During the deferred phase of execution, since work has been offloaded to the triggerer, the task no longer occupies a worker slot, and you have more free workload capacity. By default, tasks in a deferred state don't occupy pool slots.

> Triggers are small, asynchronous pieces of Python code designed to run in a single Python process. Because they are asynchronous, they can all co-exist efficiently in the triggerer Airflow component.

> __init__ and serialize are written as a pair. The trigger is instantiated once when it is submitted by the operator as part of its deferral request, then serialized and re-instantiated on any triggerer process that runs the trigger.

> We encourage you to avoid any kind of persistent state in a trigger. Triggers should get everything they need from their __init__, so they can be serialized and moved around freely.

> Triggers are designed to work in a high availability (HA) architecture. If you want to run a high availability setup, run multiple copies of triggerer on multiple hosts.

> Depending on how much work the triggers are doing, you can fit hundreds to tens of thousands of triggers on a single triggerer host. By default, every triggerer has a capacity of 1000 triggers that it can try to run at once. You can change the number of triggers that can run simultaneously with the --capacity argument. If you have more triggers trying to run than you have capacity across all of your triggerer processes, some triggers will be delayed from running until others have completed.

> A Triggerer will select only [triggerer] max_trigger_to_select_per_loop triggers per loop to avoid starving other Triggerers in HA deployments. It is recommended to set this value significantly lower than [triggerer] capacity to help keep the load balanced across Triggerers. Currently, the default value of max_trigger_to_select_per_loop is 50, while the default capacity is 1000.

> According to benchmarks, two Triggerers can still claim 1,000 triggers within one second while maintaining an almost even load distribution with the default settings.

> mode='reschedule' is a parameter specific to the BaseSensorOperator in Airflow, it allows the sensor to reschedule itself if the condition is not met.

## Sensors

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/core-concepts/sensors.html
Version: Apache Airflow 3.3.2 documentation

> poke (default): The Sensor takes up a worker slot for its entire runtime

> reschedule: The Sensor takes up a worker slot only when it is checking, and sleeps for a set duration between checks

> The poke and reschedule modes can be configured directly when you instantiate the sensor; generally, the trade-off between them is latency. Something that is checking every second should be in poke mode, while something that is checking every minute should be in reschedule mode.

## Release Notes

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/release_notes.html
Version: Apache Airflow 3.3.2 documentation

> Airflow 3.1 introduces Human-in-the-Loop (HITL) functionality that enables workflows to pause and wait for human decision-making.

> HITL tasks pause execution in a deferred state while waiting for human input via the Airflow UI.

> Add awaiting_input task state for Human-in-the-Loop, running off the triggerer (#68028)

> Deadline Alerts provide proactive monitoring for DAG execution by automatically triggering notifications when time thresholds are exceeded.

> Deadline Alerts are experimental in 3.1 and may change in future versions based on user feedback.
