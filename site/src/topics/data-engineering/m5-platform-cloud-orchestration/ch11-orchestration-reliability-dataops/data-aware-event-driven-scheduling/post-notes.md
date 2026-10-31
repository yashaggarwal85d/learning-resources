<section data-section="outcomes">

## Outcomes

By the end of this topic you can: schedule a Dag on an asset update instead of a clock and explain the fan-out that produces; wire an AssetWatcher to an external queue, in principle; use a partition mapper across two differently-partitioned assets; name the mitigation for a missed or duplicated asset event and its documented limits.

</section>

<section data-section="internals">

## Internals

Airflow supports two shapes of event-driven scheduling, and they sit at different layers. Push-based scheduling uses the REST API directly: "External systems can push asset events into Airflow using the REST API," and Airflow tracks a DAG's partial progress toward a multi-asset schedule as "queued asset events" until every required asset has updated. Pull-based scheduling goes the other way: an `AssetWatcher` "monitors an external source such as a queue or storage system" and turns what it sees into the same kind of asset event. Both end up at the same scheduling primitive — only the direction of the connection differs.

Not every trigger can back event-driven scheduling. Airflow restricts it to triggers inheriting from `BaseEventTrigger`, specifically "to avoid infinite rescheduling scenarios" — a trigger built for polling (the deferrable-task mechanism from the previous topic) is a different contract from one built to represent a single external event.

</section>

<section data-section="lab">

## Lab

Two experiments, run against a real Apache Airflow 3.3.2 install (scheduler, triggerer, dag-processor and API server as separate processes, PostgreSQL metadata database):

One producer Dag updating a single asset, with six separate consumer Dags each scheduled on that one asset. Reading `airflow dags list-runs` for all six consumers after one trigger of the producer: every consumer's run was created within 17 microseconds of the others — the thundering herd, measured directly rather than asserted.

Airflow's own `StartOfHourMapper` partition mapper (`airflow.partition_mappers.temporal`), called live via its `to_downstream()` method on four real timestamps: three landing inside the same hour (`09:00:00`, `09:14:59`, `09:45:00`) all translated to the identical downstream key (`...T09`); the fourth, one second past the hour boundary, translated to a different one (`...T10`).

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file; one Dag with `outlets=[asset]`, six Dags each with `schedule=[asset]`; trigger the producer and poll `airflow dags list-runs <consumer_dag_id>` for each consumer's `logical_date`; separately, `from airflow.partition_mappers.temporal import StartOfHourMapper; StartOfHourMapper().to_downstream(key)` needs no DAG run at all.

</section>

<section data-section="production">

## Production

Choosing data-driven over time-based scheduling is a bet that the upstream event will actually arrive, exactly once, in a reasonable time — and this topic's own sourced material shows that bet isn't free: Airflow's own docs describe a triggerer restart redelivering unconfirmed messages, and a late-rejoining subscriber missing events committed before it rejoined, with a documented, explicitly "best-effort" mitigation rather than a guarantee. A thundering herd is the second sharp edge, and it's structural rather than a bug: nothing in the asset-scheduling mechanism staggers reactions, so a popular asset updating once can mean dozens of Dags competing for compute at the exact same instant — this topic's own measurement showed six consumers firing within seventeen millionths of a second of each other, and the mechanism gives no reason to expect that number to behave differently at eleven, or at a hundred.

</section>

<section data-section="frontier">

## Frontier

Dagster's declarative automation conditions reframe the same problem as a condition to evaluate rather than a trigger to fire: `AutomationCondition.eager()` propagates an update to everything downstream automatically, and `AutomationCondition.on_missing()` fills in a missing partition the moment every upstream partition it needs is available. Freshness policies are a separate, newer promise layered on top — not "when should this run" but "how current must this data stay to be trusted," with Dagster's own docs noting the feature is "under active development" with "feature gaps" still expected.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in this section has treated the Dag, and its tasks, as the unit the orchestrator schedules. Dagster's model asks whether the Dag is even the right unit to think in, or whether the data products themselves — the assets — should be the thing the system is built around.

</section>
