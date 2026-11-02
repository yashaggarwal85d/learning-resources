# References

- dbt Developer Hub, "Node selection methods: state": https://docs.getdbt.com/reference/node-selection/methods
- dbt Developer Hub, "Defer": https://docs.getdbt.com/reference/node-selection/defer
- SQLMesh Documentation, "Overview": https://sqlmesh.readthedocs.io/en/stable/concepts/overview/
- dbt Labs Blog, "Get to know the new dbt Fusion engine and VS Code extension": https://www.getdbt.com/blog/get-to-know-the-new-dbt-fusion-engine-and-vs-code-extension

Last verified: 2026-10-31. Expert sign-off: pending.

Software run in this sandbox: Python 3 standard library for a real `state:modified`+`--defer`-style selector, a SQLMesh-style virtual-environment promotion, a column-level breaking-change classifier, a seeded-sample coverage-trade measurement, and a lineage/SLA CI-gate check, all run against a synthetic model graph modeled on the shop's own `orders` project. dbt and dbt Fusion are not installed in this sandbox; dbt's and SQLMesh's own documentation is quoted directly, and dbt Fusion's column-aware CI/CD is named only as a sourced pointer, not independently demonstrated. Every quote is verified word for word against the fetched source text.
