Last verified: 30 October 2026. Expert sign-off: pending. Four real measured experiments run in
this sandbox (`examples.py`, against this sandbox's own Postgres cluster and local file hashing): a
snapshot surviving a source-table mutation that a live query does not, a content-hash dedup/change
check standing in for DVC's cache, an experiment-tracker search by dataset digest, and a
label-version-drift measurement across two churn-window definitions.

- lakeFS documentation, "Internals": [docs.lakefs.io](https://docs.lakefs.io/concepts/internals/). Branches, commits, tags and the three-way merge algorithm, quoted directly.
- DVC documentation, "Internal Files": [dvc.org](https://dvc.org/doc/user-guide/project-structure/internal-files). The content-addressable cache and its MD5-based file identity, quoted directly.
- MLflow documentation, "MLflow 3.0 (Preview)": [mlflow.org](https://mlflow.org/docs/3.0.1/mlflow-3). The `LoggedModel` entity, quoted directly.
- Apache Iceberg documentation, "Branching and Tagging": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/branching/). Snapshot logs, branches and tags as named references, quoted directly.
- This course's own topic 3, "Inference logging and log-and-wait features" (`de.inference-logging-log-wait`, held): the logged rows this topic's examples build on, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=training-set-versioning-lineage:%20).
