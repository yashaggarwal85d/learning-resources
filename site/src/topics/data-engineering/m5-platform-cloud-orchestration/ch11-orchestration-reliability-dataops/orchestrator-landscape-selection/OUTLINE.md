# Outline: Orchestrator landscape and selection

## Engagement arc

1. **Hook** — a team picks Airflow "because everyone uses it" and spends more engineer-hours a year on scheduler HA and metadata-DB care than the pipelines took to write; a Step Functions Express workflow would have fit their actual job shape for a fraction of the operational cost.
2. **Reveal: the grid, named** — four axes a workload gets placed on: data-awareness (topics 7-8), operational burden (self-run vs. managed, topic 1's architecture as a staffing cost), ecosystem, cloud coupling.
3. **Predict: which axis does the hook's team get wrong?** — before naming it, ask which of the four axes the hook's mistake actually sits on.
4. **Reveal: Standard vs. Express, with real numbers** — AWS's own two serverless state-machine types: a year-long exactly-once workflow vs. a five-minute at-least-once one, priced and billed differently.
5. **Predict: does a serverless state machine need its own fan-out primitive?** — before the reveal, ask whether Step Functions has anything like topic 4's dynamic task mapping.
6. **Reveal: Distributed Map, sourced** — 10,000 parallel child workflow executions as a managed primitive, each with its own execution history, contrasted against topic 4's Airflow mapped tasks.
7. **Reveal: the rest of the field, named** — Dagster and Prefect 3 (Python-native, dynamic), Kestra (YAML-declarative), Netflix Maestro (sourced, not independently runnable), Lakeflow Jobs (the renamed Databricks Workflows), Azure/Fabric Data Factory, Google Workflows -- each placed on the same grid.
8. **Recap** — four axes, not one "best" tool; the hook's team optimized for none of them, just familiarity.
9. **Prove it** — a different workload (short, high-volume, no custom operators): does the same grid point to the same tool as the hook's shop, or somewhere else?

## Deep dives

- **Internals**: Standard vs. Express execution semantics (exactly-once vs. at-least-once vs. at-most-once for synchronous Express), the Retry/Catch fields' ErrorEquals/IntervalSeconds/BackoffRate mechanics, Distributed Map's child-workflow isolation.
- **Frontier**: the managed-vs-self-run spectrum applied specifically to orchestrators (MWAA, MWAA Serverless, Cloud Composer, Astronomer as Airflow's own managed tier), and cloud coupling as the axis that's hardest to walk back.
