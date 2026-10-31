Last verified: 30 October 2026. Expert sign-off: pending. Three real measured experiments run in
this sandbox (`examples.py`, against this sandbox's own Postgres cluster, reusing topic 1's churn
dataset shape): a different-code-path skew rate, a different-join skew rate, and a materialization
freshness-SLA violation rate under two different intervals.

- Feast documentation, "Offline store" and "Online store" (v0.63-branch): [docs.feast.dev](https://docs.feast.dev/v0.63-branch/getting-started/components/offline-store). The offline/online split, materialization and the "latest value only" guarantee, quoted directly.
- Hopsworks documentation, "Features and Feature Groups": [docs.hopsworks.ai](https://docs.hopsworks.ai/latest/concepts/fs/feature_group/fg_overview). A second, independent vendor's identical offline/online split, quoted directly.
- Databricks Blog, "Tecton is Joining Databricks to Power Real-Time Data for Personalized AI Agents" (August 22, 2025): [databricks.com](https://www.databricks.com/blog/tecton-joining-databricks-power-real-time-data-personalized-ai-agents). The acquisition's own date and stated purpose, quoted directly.
- This course's own topic 1, "Point-in-time correct training data" (`de.point-time-correct-training`, held): the as-of join, temporal leakage and feature TTLs, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=feature-stores-online-offline:%20).
