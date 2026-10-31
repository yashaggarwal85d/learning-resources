# References

- Temporal Documentation, "Temporal Workflow": https://docs.temporal.io/workflows
- Temporal Documentation, "Event History": https://docs.temporal.io/encyclopedia/event-history
- Temporal Documentation, "What is a Temporal Worker?": https://docs.temporal.io/workers
- Temporal Documentation, "Worker Versioning": https://docs.temporal.io/production-deployment/worker-deployments/worker-versioning
- Temporal Blog, "Announcing GA for Worker Versioning and Public Preview for Upgrade on Continue-as-New": https://temporal.io/blog/ga-worker-versioning-public-preview-upgrade-on-continue-as-new
- Temporal Documentation, "Saga Pattern": https://docs.temporal.io/design-patterns/saga-pattern
- Temporal Documentation, "Evaluate Temporal": https://docs.temporal.io/evaluate
- Prefect Docs, "Introduction" (reused from topic 9's own fetch): https://docs.prefect.io/v3/get-started/index

Last verified: 2026-10-31. Expert sign-off: pending.

Software versions actually run in this sandbox: Apache Airflow 3.3.2 (scheduler, triggerer, dag-processor, api-server; LocalExecutor; PostgreSQL 16 metadata DB) -- the two sensor experiments in `examples.py` are real runs against this install. Temporal CLI dev server: downloaded but could not be executed (blocked by this session's own sandbox execution policy); every Temporal claim is sourced only, verified word for word against the fetched source text.
