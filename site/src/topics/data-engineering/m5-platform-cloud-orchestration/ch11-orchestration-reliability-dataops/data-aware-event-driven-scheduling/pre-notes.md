# Before you watch

- **Asset** — Airflow's data-aware scheduling unit (called Dataset through 2.x, renamed in 3.0); a DAG scheduled on one or more assets runs when they're updated rather than on a clock.
- **Asset event** — a signal that an asset was updated, carrying the Dag run that produced it.
- **AssetWatcher** — a component that can watch an external message queue and turn its messages into asset events.
- **Partition mapper** — a translator between an upstream asset's partitioning scheme and a downstream one.
- **Declarative automation condition** — Dagster's way of stating when an asset should run, rather than wiring up an explicit trigger.
- **Freshness policy** — Dagster's promise about how current an asset's data must stay, enforced separately from what updates it.
- **Thundering herd** — many downstream consumers all reacting to the same upstream event at once.
