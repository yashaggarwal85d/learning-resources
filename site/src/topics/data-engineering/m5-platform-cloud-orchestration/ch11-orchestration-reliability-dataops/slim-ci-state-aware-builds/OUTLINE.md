# Outline: Slim CI and state-aware builds

1. **Hook** — a large dbt project's full CI run rebuilds every model on every PR, most of which nobody touched; a single-model change switched to `state:modified`+`--defer` builds only that model and its downstream, measurably faster.
2. **Predict: does testing a change safely require rebuilding the whole project?** A full rebuild is certainly safe. Is it the only way to be safe?
   - Answer: no — a selector that finds exactly the changed model plus everything downstream of it is just as safe, and builds far less.
3. **Reveal: `state:modified` + `--defer`** — compare against a stored manifest, select the changed node plus `+` downstream, defer everything else to its already-built production relation.
4. **Reveal: SQLMesh's virtual environment** — a plan previews exactly what would change; once verified, promotion repoints production at what's already built in dev, no recomputation.
5. **Predict: does a model's contract look unchanged if a column quietly changes?** A model's overall shape (name, grain) can stay the same while one column underneath it breaks.
   - Answer: no — a rename or type change on one column is breaking even when the model-level contract looks fine, and a straight-to-contract change (skipping expand/migrate) gets caught this way.
6. **Reveal: column-level breaking-change detection** — tied directly to the prior chapter topic's expand/contract discipline: a premature contract is flagged breaking, the same change done through expand is not.
7. **Reveal: CI on a seeded sample** — a small, fixed sample runs faster but only catches a fraction of planted bugs, measured directly, not assumed.
8. **Reveal: the lineage and SLA gate** — a CI gate that fails on a disappeared dependency or on a measured SLO breach, not only on a wrong value.
9. **Recap** — two state-aware build strategies, a column-level safety net, a quantified sampling tradeoff, and two extra ways a build can fail besides a wrong answer.
10. **Prove it** — run the shop's own model graph through both a full rebuild and `state:modified`+`--defer` on an identical single-model change and compare what actually gets built.

## Internals / Frontier
- Internals: why `--defer` only resolves to production for a node that doesn't already exist locally — it is deliberately conservative, never silently masking a model you actually meant to test.
- Frontier: dbt Fusion's own column-aware CI/CD is named only, not independently demonstrated (not installed in this sandbox); contract enforcement specifically, as its own CI gate, is the chapter's next and final topic.
