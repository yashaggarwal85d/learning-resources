# Fact-check

1. **The `state` method selects nodes by comparing them against a previous version of the same project, represented by a manifest.** Sourced and reproduced directly: `examples.py` implements the same changed-plus-downstream selection against a stored model graph, and the claim is verified word for word against dbt's own Developer Hub documentation.

2. **`state:modified` selects all new nodes, plus any changes to existing nodes.** Sourced directly: `examples.py` asserts dbt's own documentation states this, verified word for word against the fetched page text.

3. **With `--defer`, an unselected node that doesn't already exist resolves its `ref` to the production relation instead of being rebuilt.** Sourced directly: `examples.py` asserts dbt's own "Defer" documentation states this, verified word for word against the fetched page text.

4. **On the shop's own model graph, a single-model change builds only the changed model plus its real downstream under a state-aware build, while a full rebuild builds every model regardless of what changed.** Run and reproduced directly, this topic's own experiment: `examples.py`'s `run_slim_ci_vs_full_build` computes the real downstream-closure set via graph traversal and asserts it builds strictly fewer models, at strictly less measured cost, than a full rebuild of the same graph.

5. **A SQLMesh plan identifies all affected models and the computations a change entails before anything runs, and a virtual environment promotes already-built output to production without computation or data movement.** Sourced directly: `examples.py` asserts SQLMesh's own documentation states both, verified word for word against the fetched page text; `run_virtual_environment_promotion` reproduces the zero-recomputation-cost promotion of a real affected set computed by the same graph traversal.

6. **A column rename done by contracting straight to the new name is flagged breaking; the identical change done through expand first is not.** Run and reproduced directly: `examples.py`'s `run_column_breaking_change_demo` applies a real classifier to both a premature-contract schema change and an expand-phase schema change and asserts the first is flagged breaking while the second is not.

7. **A seeded sample of a table carrying a fixed, known set of planted bugs catches only the fraction of those bugs that happen to land inside the sample, while testing the full table catches every one.** Run and reproduced directly: `examples.py`'s `run_seeded_sample_coverage_trade` plants six real invariant-violating rows across a 2,000-row synthetic table, confirms the full table catches all six, and measures how many the first 100 rows actually catch.

8. **A CI gate built from a model's dependency graph fails when an expected lineage edge disappears, and a separate gate fails when a measured p95 latency crosses a stated SLO.** Run and reproduced directly: `examples.py`'s `run_lineage_break_gate` and `run_sla_regression_gate` each construct a real pass case and a real fail case and assert the gate's verdict differs correctly between them.

9. **dbt Fusion names "column-aware change detection" as a direction for its CI/CD.** Sourced directly: dbt Labs' own Fusion-engine announcement blog states this exact phrase, verified word for word against the fetched page text; used here only as a named pointer, not independently demonstrated, since dbt Fusion is not installed in this sandbox.

10. **Running this topic's build comparison against dbt's actual production relation (via `--defer`) rather than a true zero-copy clone or branch is this chapter's one deliberately skipped syllabus entry.** This topic's own framing of CHAPTER.md's stated scope, not independently sourced and demonstrated live here.
