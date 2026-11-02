Last verified: 2 November 2026. No real Trino cluster runs in this sandbox (no Docker daemon
available); `examples.py` models four of Trino's own documented mechanisms -- coordinator/worker
task scheduling, dynamic filtering, cost-based join build-side selection, and TASK-retry spooling
-- with real, executed Python and real threading over real in-memory data, not Trino's own code.
Every architectural claim is a word-for-word quote from Trino's own current documentation or the
Trino project's/Meta's own announcements.

- Trino, "Trino concepts": [trino.io](https://trino.io/docs/current/overview/concepts.html). Fetched 2026-11-02.
- Trino, "Dynamic filtering": [trino.io](https://trino.io/docs/current/admin/dynamic-filtering.html). Fetched 2026-11-02.
- Trino, "Cost-based optimizations": [trino.io](https://trino.io/docs/current/optimizer/cost-based-optimizations.html). Fetched 2026-11-02.
- Trino, "Iceberg connector": [trino.io](https://trino.io/docs/current/connector/iceberg.html). Fetched 2026-11-02.
- Trino, "Fault-tolerant execution": [trino.io](https://trino.io/docs/current/admin/fault-tolerant-execution.html). Fetched 2026-11-02.
- Trino project, "We're rebranding PrestoSQL as Trino": [trino.io](https://trino.io/blog/2020/12/27/announcing-trino). Fetched 2026-11-02.
- Meta Engineering, "Introducing Velox: An open source unified execution engine": [engineering.fb.com](https://engineering.fb.com/2023/03/09/open-source/velox-open-source-execution-engine/). Fetched 2026-11-02.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=trino-federated-mpp-execution:%20).
