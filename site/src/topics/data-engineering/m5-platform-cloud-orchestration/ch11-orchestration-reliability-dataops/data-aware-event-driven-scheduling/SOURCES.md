# Sources

## Asset-Aware Scheduling

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/authoring-and-scheduling/asset-scheduling.html
Version: Apache Airflow 3.3.2 documentation

> Because the schedule parameter is a list, Dags can require multiple assets. Airflow schedules a Dag after all assets the Dag consumes have been updated at least once since the last time the Dag ran:

> If one asset is updated multiple times before all consumed assets update, the downstream Dag still only runs once, as shown in this illustration:

> Asset-based scheduling triggered by other Dags (internal event-driven scheduling) does not cover all use cases. Often you also need to trigger Dags from external events such as system signals, messages, or real-time data changes.

> External systems can push asset events into Airflow using the REST API.

> An AssetWatcher monitors an external source such as a queue or storage system. When a relevant event occurs, it updates the corresponding asset and triggers Dag execution.

> Only triggers that inherit from BaseEventTrigger are compatible, to avoid infinite rescheduling scenarios.

## Asset Definitions

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/authoring-and-scheduling/assets.html
Version: Apache Airflow 3.3.2 documentation

> Changed in version 3.0: The concept was previously called "Dataset".

> An Airflow asset is a logical grouping of data. Upstream producer tasks can update assets, and asset updates contribute to scheduling downstream consumer Dags.

> Pre-determined partitioning — the partition key is worked out before the task runs, using the timetable's schedule cadence and partition mappers to match upstream keys to downstream keys and trigger partition-based Dag runs.

> Runtime partitioning — the partition key is deferred to task runtime: the producing task records key(s) via outlet_events[self].add_partitions(...).

> default_partition_mapper is used for every upstream asset unless you override it via partition_mapper_config.

## Event-driven scheduling

URL: https://airflow.apache.org/docs/apache-airflow/3.3.2/authoring-and-scheduling/event-scheduling.html
Version: Apache Airflow 3.3.2 documentation

> The AssetWatcher class plays a crucial role in this mechanism. It monitors an external event source, such as a message queue, and triggers an asset update when a relevant event occurs.

> As opposed to all triggers that inherit from BaseTrigger, only a subset that inherit from BaseEventTrigger are compatible.

> Snapshot-at-fan-out: the set of subscribers that must resolve a given event is frozen at the moment the event is broadcast. A subscriber that joins after the event was dispatched is not added to that event's pending set.

> Triggerer restart: resolution state lives in memory only. After a triggerer restart, the broker redelivers messages that were never advanced. Subscribers must therefore be idempotent.

> Triggers that re-subscribe later join as late subscribers (outside the snapshot of any already-broadcast event), so they may miss events committed in the window between the first subscription and their own.

> A failure can therefore cause duplicate delivery but never a lost event; idempotent subscribers absorb the duplicates.

## Declarative Automation (Dagster Docs)

URL: https://docs.dagster.io/guides/automate/declarative-automation/
Version: Dagster Docs, Latest (1.13.28)

> The AutomationCondition.eager condition allows you to automatically update an asset whenever any of its dependencies are updated. This is used to ensure that whenever upstream changes happen, they are automatically propagated downstream.

> If any upstream partitions have not been materialized, the downstream asset will not be requested.

> The AutomationCondition.on_missing condition will execute a missing asset partition when all upstream partitions of the asset are available. This is typically used to manage dependencies between partitioned assets, where partitions should fill in as soon as upstream data is available.

## Asset freshness policies (Dagster Docs)

URL: https://docs.dagster.io/guides/observe/asset-freshness-policies
Version: Dagster Docs, Latest (1.13.28)

> Freshness policies help you understand which of your assets have materialized recently and which ones are running behind - a key component of asset health. Freshness policies also communicate expectations for data freshness, allowing downstream asset consumers to determine how often assets are expected to be updated.

> For example, freshness policies can help identify stale assets caused by:

> A time window freshness policy is useful when you expect an asset to have new data or be recalculated with some frequency. An asset that does not meet this condition will be considered failing its freshness policy.

> A cron freshness policy is useful when you expect an asset to have new data or be recalculated on a known schedule.
