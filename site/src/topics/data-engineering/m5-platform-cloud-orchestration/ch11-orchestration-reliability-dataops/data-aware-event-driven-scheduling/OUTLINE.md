# Outline: Data-aware and event-driven scheduling

## Engagement arc

1. **Hook** — the moment the shop's hourly `orders` asset updates, eleven downstream DAGs all fire within the same second.
2. **Reveal: one asset update, measured** — the real experiment: one producer DAG updates an asset, six consumer DAGs scheduled on it all create a run within microseconds of each other.
3. **Predict: does Airflow stagger them?** — before the reveal lands fully, ask whether Airflow spaces out the six runs or fires them together.
4. **Reveal: the asset model, renamed and extended** — the Dataset-to-Asset rename, `AssetWatcher`s pulling from external queues, partition-driven scheduling.
5. **Predict: what happens to an upstream key when granularities differ?** — before the mapper reveal, ask what an hourly-upstream, daily-downstream mismatch does.
6. **Reveal: a partition mapper, run live** — the real experiment: `StartOfHourMapper` translating four real timestamps, three collapsing into one downstream key.
7. **Reveal: Dagster's declarative version, sourced** — `AutomationCondition.eager` and `on_missing`, freshness policies, compared directly to Airflow's model.
8. **Recap** — data-driven reacts fast but needs reliable upstream events; time-based is predictable but can run on stale data; a thundering herd and a missed event are the two sharp edges of the data-driven choice.
9. **Prove it** — the hook's eleven DAGs again: does staggering or a fairness fix change the measured fan-out?

## Deep dives

- **Internals**: push-based (REST API) vs pull-based (`AssetWatcher`) event-driven scheduling; `BaseEventTrigger` as the compatibility boundary; queued asset events for a multi-asset schedule.
- **Frontier**: triggerer-restart semantics for shared-stream subscribers — snapshot-at-fan-out, the ack timeout, and `shared_stream_cohort_grace_period` as a best-effort (not complete) mitigation for a late-rejoining subscriber missing events.
