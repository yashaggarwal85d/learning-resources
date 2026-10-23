import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real hands-on lab (lab/shop_dbt/, examples.py): a real dbt-core project, built and run
// against a local DuckDB target — seeds, ref()-chained models, a Jinja macro, data tests, a
// unit test, an exposure, and generated docs/lineage. No literal digits appear anywhere in
// this reel.
const reel: Reel = {
  steps: [
    {
      title: 'A model file with no CREATE TABLE anywhere in it',
      body: (
        <>
          A dbt model file is one select statement. No CREATE TABLE, no target schema name, no
          database connection string anywhere in it. How does that become a real table?
        </>
      ),
      duration: 4.8,
      fig: 'one select statement — no CREATE TABLE, no schema name, no connection string',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: what a model actually is, quoted directly',
      body: (
        <>
          A SQL model is a select statement. dbt wraps it in whatever DDL or DML the configured
          warehouse needs — that wrapping is dbt's own job, not the model author's.
        </>
      ),
      duration: 4.8,
      fig: 'a select statement — dbt wraps it in the warehouse\'s own DDL and DML',
      Visual: S.RevealModelQuote,
    },
    {
      title: 'Predict: does writing a table name directly also create a dependency dbt can see?',
      body: (
        <>
          One model selects from another by writing its table name directly, the plain way.
          Does that also tell dbt which model has to build first?
        </>
      ),
      duration: 2.8,
      fig: 'one model selects another by its table name — does dbt see that as a dependency?',
      predict: {
        options: [
          { label: 'Yes — dbt can read any SQL and work out the dependency itself' },
          { label: "No — dbt only sees a dependency through ref()", correct: true },
        ],
        explain: (
          <>
            No. A literal table name is invisible to dbt's own dependency graph — only the
            ref() function registers a dependency at all.
          </>
        ),
      },
      Visual: S.PredictTableName,
    },
    {
      title: 'Reveal: the lab — ref(), not table names',
      body: (
        <>
          The lab's own fact model joins three staging models, every single one of them
          through ref() — never once writing out a literal table name.
        </>
      ),
      duration: 4.8,
      fig: "the lab's fact model — three joins, every one of them through ref()",
      Visual: S.RevealLabRef,
    },
    {
      title: "Reveal: the lab — the DAG, read from dbt's own manifest",
      body: (
        <>
          After a real build, dbt's own manifest lists exactly which model depends on which —
          read directly from that file, not drawn by hand.
        </>
      ),
      duration: 4.8,
      fig: "the DAG — read from dbt's own manifest after a real build, not hand-drawn",
      takeaway: "ref() is what lets dbt compute build order and the dependency graph; a table name is invisible to both.",
      Visual: S.RevealDag,
    },
    {
      title: 'Predict: does changing a macro require editing every model that calls it?',
      body: (
        <>
          One Jinja macro converts cents to dollars, called from inside one model's own SQL.
          Does changing that macro's own logic mean editing every model that calls it?
        </>
      ),
      duration: 2.8,
      fig: "one macro, called from one model's SQL — change it everywhere it's called?",
      predict: {
        options: [
          { label: 'Yes — every caller has its own copy of the logic, baked in' },
          { label: "No — the macro's own body changes, every caller changes with it", correct: true },
        ],
        explain: (
          <>
            No. The macro is defined once; every model calling it compiles against whatever
            that macro's own body currently says, with no separate copy anywhere.
          </>
        ),
      },
      Visual: S.PredictMacroEdit,
    },
    {
      title: "Reveal: the macro, quoted directly; the lab's own macro",
      body: (
        <>
          Pieces of code that can be reused multiple times, extremely useful for logic that
          would otherwise repeat across models — exactly what the lab's own cents-to-dollars
          conversion is for.
        </>
      ),
      duration: 4.8,
      fig: 'reused code, not repeated — the lab\'s own cents-to-dollars macro, called once',
      takeaway: "A macro moves repeated logic to one place; every caller inherits a change to it for free.",
      Visual: S.RevealMacroQuote,
    },
    {
      title: 'Predict: does dbt still build on top of data that fails a test?',
      body: (
        <>
          A data test on one staging model fails — a row pointing at a customer that doesn't
          exist. Does dbt still go ahead and build everything downstream of it?
        </>
      ),
      duration: 2.8,
      fig: "a failing data test, one bad row — does dbt still build what's downstream?",
      predict: {
        options: [
          { label: 'Yes — it builds everything and just reports the failure afterward' },
          { label: "No — everything downstream of the failing test gets skipped", correct: true },
        ],
        explain: (
          <>
            No. Dbt skips every model and every test that depends on the one that just failed,
            rather than building on top of data already known to be wrong.
          </>
        ),
      },
      Visual: S.PredictFailBlocks,
    },
    {
      title: 'Reveal: the lab — a failing data test actually blocking downstream models',
      body: (
        <>
          A dangling customer id was deliberately introduced, a built-in relationships test
          caught it, and every model and the exposure depending on it were skipped — not
          built, not even attempted.
        </>
      ),
      duration: 4.8,
      fig: 'a dangling id, a failing relationships test — everything downstream skipped, nothing built',
      takeaway: "A dbt test failure isn't just a report — on the models that depend on it, it's a hard stop.",
      Visual: S.RevealTestBlocks,
    },
    {
      title: 'Reveal: the unit test, run in isolation, no seeded data touched',
      body: (
        <>
          Validating modeling logic on small, fixed inputs before materializing the full model
          in production — the lab's own unit test runs that way, against fabricated rows alone.
        </>
      ),
      duration: 4.8,
      fig: 'fixed, fabricated rows — the macro\'s own logic checked before any real data loads',
      Visual: S.RevealUnitTest,
    },
    {
      title: "Reveal: docs and lineage; dbt Mesh, named and sourced",
      body: (
        <>
          The documentation dbt generates includes the project's own model code, its DAG, and
          every column's own tests — the same graph already proven real, now browsable. Across
          projects, dbt Mesh adds contracts, versions and access levels, named here and quoted
          directly rather than built by hand.
        </>
      ),
      duration: 4.8,
      fig: "generated docs — model code, the DAG, column tests; dbt Mesh named across projects",
      Visual: S.RevealDocsMesh,
    },
    {
      title: 'Recap',
      body: (
        <>
          ref() is the only thing dbt's dependency graph actually sees. A macro, defined once,
          changes everywhere it's called. A failing test blocks everything built on top of it.
          Docs and lineage are that same proven graph, made browsable.
        </>
      ),
      duration: 4.8,
      fig: 'ref() is the only dependency dbt sees; one macro; one failing test, a hard stop; the same graph, browsable',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A brand-new model joins two existing ones, but writes out their table names directly
          instead of calling ref() on either. Built with several threads at once, what actually
          happens, and when?
        </>
      ),
      duration: 2.8,
      fig: 'a new model, table names instead of ref(), built with several threads at once — what happens?',
      predict: {
        options: [
          { label: 'It builds fine — the tables already exist in the database either way' },
          { label: 'It can fail at build time, racing against the models it never declared a dependency on', correct: true },
        ],
        explain: (
          <>
            It can fail. With no ref() call, dbt has no edge to schedule it after its real
            dependencies — it can run concurrently with them and lose the race, failing with a
            missing-table error even though the exact same query, written through ref(), builds
            cleanly every time.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
