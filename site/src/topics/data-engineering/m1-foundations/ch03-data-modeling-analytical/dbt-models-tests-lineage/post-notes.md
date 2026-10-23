<section data-section="outcomes">

## Outcomes

A dbt model is a plain select statement, wrapped in DDL/DML dbt generates for the configured
warehouse. Dependencies between models exist only through `ref()` — this topic's own lab
proved it twice: once by reading the real build's own manifest for a correct DAG, and once by
deliberately skipping `ref()` for a plain table name and watching the build fail with a
race-condition missing-table error under concurrent threads. A Jinja macro defined once changes
behavior everywhere it's called, with no per-caller copy to re-edit. A failing data test is not
a report — it's a hard stop on every model that depends on it, confirmed by a deliberately
introduced bad row and a real `SKIP` on every downstream model and the exposure. A unit test
validates modeling logic on fabricated inputs alone, isolated from any real data. dbt's
generated docs expose that same proven dependency graph, now browsable; dbt Mesh extends the
same ideas (contracts, versions, access levels) across multiple projects, named and sourced here
without being built hands-on, since it needs a second project and an Enterprise plan.

</section>

<section data-section="lab">

## Lab

Real hands-on lab (`lab/shop_dbt/`, `examples.py`): a dbt-core project against a local DuckDB
target, seeded from three CSVs, with a Jinja macro, thirteen data tests, one unit test, and one
exposure, all actually run (`dbt seed`, `dbt build`, `dbt docs generate`). `lab/README.md` has
the exact commands and output, including the deliberately introduced failing test and the
ref()-skipping model that lost a real scheduling race.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that writes a hardcoded table name "just this once" because `ref()` feels like
overhead for a quick join.** It can work for months by coincidence of build order, then fail
the moment someone adds threads, reorders models, or runs on a schema dbt doesn't control —
exactly this topic's own Prove-It scenario.

**A team that treats a failing data test as a dashboard to check later instead of a build
gate.** By the time anyone looks at the dashboard, every model downstream of the failing test
has already been skipped for one or more runs, silently leaving stale data in production tables
that nothing flags as stale.

</section>

<section data-section="frontier">

## Frontier

dbt Mesh's own governance features (model contracts, versions, access levels, cross-project
refs) solve the organizational version of problems this topic solves inside one project —
named and sourced from dbt's own documentation, but not built hands-on here, since cross-project
`ref()` requires an Enterprise or Enterprise+ plan and a genuinely separate second project. The
dbt Fusion engine and SQLMesh are both marked `*(skipped)*` in this chapter's own syllabus and
are not covered.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every model built here assumed a full rebuild was an acceptable way to materialize it. Next:
dbt's own practical answer to a dimension that needs history kept and a fact table too large to
rebuild from scratch every run — incremental models and snapshots.

</section>
