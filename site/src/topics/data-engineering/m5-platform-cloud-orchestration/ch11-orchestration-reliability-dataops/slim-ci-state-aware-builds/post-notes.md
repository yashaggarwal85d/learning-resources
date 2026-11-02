<section data-section="outcomes">

## Outcomes

By the end of this topic you can: configure `state:modified`+`--defer` (or SQLMesh's plan/virtual-environment equivalent) and measure the CI-time saving against a full rebuild; explain column-level breaking-change detection and connect it to expand/contract; run CI against seeded synthetic data and quantify the coverage trade; describe a CI gate that fails on broken lineage or a measured SLA regression.

</section>

<section data-section="internals">

## Internals

dbt's own documentation defines the state method precisely: it "selects nodes by comparing them against a previous version of the same project, which is represented by a manifest," and `state:modified` covers "all new nodes, plus any changes to existing nodes." `--defer`'s own safety property is deliberately conservative, not automatic: dbt only resolves an unselected node's `ref` to production "if it doesn't exist" locally -- a model you actually built and are testing locally is never silently swapped out for a stale production copy. SQLMesh's own documentation describes a parallel but mechanically different idea: a plan "identifies all affected models and the computations a change entails" before anything runs, and once verified, a virtual environment "promotes views and tables from non-production to production, but without computation or data movement." The two mechanisms -- selective rebuilding and promotion of already-built output -- solve the same problem from different directions, and a single project could in principle use both rather than choosing between them.

</section>

<section data-section="lab">

## Lab

On the shop's own model graph, a single-model change (`stg_orders`) run through `state:modified`+`--defer` builds only that model and its real downstream, a real measured fraction of a full rebuild's cost. A parallel SQLMesh-style demo shows the same affected set promoted to production at zero recomputation cost, versus what rebuilding it would have cost. A column-level classifier catches the exact premature-contract mistake the prior chapter topic warned about: renaming a column straight to its new name is flagged breaking, while the identical change done through expand first is not. A seeded 100-row sample of a 2,000-row table carrying six planted bugs catches only the fraction of those bugs that happen to land inside it, measured directly rather than assumed. Finally, two CI gates run against the same model graph: one fails when an expected lineage edge silently disappears, and a separate one fails when a measured p95 latency crosses a stated SLO, before any change carrying that regression could reach production.

</section>

<section data-section="production">

## Production

The hook's real lesson is that "safe" and "exhaustive" are not the same property. A full rebuild is sufficient for safety, but testing only what a change could actually reach is just as safe and a great deal cheaper -- the two state-aware mechanisms in this topic exist because that smaller, equally safe set turns out to be identifiable in advance.

</section>

<section data-section="frontier">

## Frontier

dbt Fusion's own announcement names "column-aware change detection" as a direction for its CI/CD, a pointer this topic doesn't independently demonstrate since dbt Fusion isn't installed in this sandbox; the toy classifier in `examples.py` reproduces the idea, not the tool itself. This topic's state-aware build also deliberately runs against dbt's actual production relation via `--defer`, not a true zero-copy clone or branch -- that mechanism remains this chapter's one skipped syllabus entry. Contract enforcement specifically, as its own dedicated CI gate, is the chapter's next and final topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Slim CI proves a change is safe before it merges. The next topic is proving it stays safe at the moment it actually reaches production -- a different kind of safety, checked at deploy time rather than PR time.

</section>
