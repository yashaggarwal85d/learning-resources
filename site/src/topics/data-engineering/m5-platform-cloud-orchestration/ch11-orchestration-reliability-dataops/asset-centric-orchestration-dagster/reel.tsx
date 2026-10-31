import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real experiments against a live Dagster 1.13.28 install: the shop's orders pipeline as
// an asset graph vs. an Airflow TaskFlow DAG, counted for dependency-wiring lines; an asset check
// materialized with a planted bad row then again fixed; and the asset graph's own transitive
// lineage, asked for with zero extra tooling (examples.py, airflow_equivalent.py, FACT-CHECK.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The team hand-keeps a spreadsheet of which table feeds which, and nobody fully trusts
          it. Dagster answers the same question by asking the asset itself what it depends on.
        </>
      ),
      duration: 4.8,
      fig: 'a hand-kept lineage spreadsheet vs. asking the asset itself.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the same pipeline, two shapes, measured',
      body: (
        <>
          The shop's three-stage orders pipeline, written both ways: as a Dagster asset graph and
          as an Airflow TaskFlow DAG. Counting only the lines that wire one stage's output to the
          next stage's input, for real, from both files.
        </>
      ),
      duration: 4.8,
      fig: 'same pipeline, two shapes. dependency lines counted for real.',
      Visual: S.RevealWiringMeasured,
    },
    {
      title: 'Predict: does a failing check stop the pipeline?',
      body: (
        <>
          A planted bad row — a negative order amount — sits in the data. An asset check attached
          to the pipeline's middle stage is built to catch it. Does catching it stop the run?
        </>
      ),
      duration: 2.8,
      fig: 'does a failing check stop the rest of the pipeline?',
      predict: {
        options: [
          { label: 'The check failing halts the rest of the run' },
          { label: 'The run still succeeds -- the check only reports the failure', correct: true },
        ],
        explain: (
          <>
            An asset check is a report on the asset, not a gate the asset has to pass to exist. In
            this minimal pipeline, materializing fct_orders doesn't wait on the check's verdict.
          </>
        ),
      },
      Visual: S.PredictCheckBlocks,
    },
    {
      title: 'Reveal: an asset check, run live',
      body: (
        <>
          The three-asset pipeline, materialized for real with the bad row intact: the check fails
          and reports exactly one bad row, while the run itself still succeeds. Fixed and
          re-materialized, the same check passes.
        </>
      ),
      duration: 4.8,
      fig: 'an asset check, run live, with a bad row planted.',
      takeaway: "A failing check doesn't stop a pipeline. It reports on the asset, not a gate in front of it.",
      Visual: S.RevealCheckLive,
    },
    {
      title: "Predict: does Dagster need separate lineage tooling?",
      body: (
        <>
          fct_orders depends on stg_orders, which depends on raw_orders. Nothing in this pipeline
          built or updated a lineage graph on the side. Can the system still answer what feeds it?
        </>
      ),
      duration: 2.8,
      fig: 'does a lineage graph need separate tooling to maintain?',
      predict: {
        options: [
          { label: 'A separate lineage tool has to be built and kept in sync' },
          { label: "The asset graph already is the lineage graph", correct: true },
        ],
        explain: (
          <>
            The dependencies were declared once, on the assets themselves. Asking the asset graph
            for an asset's transitive upstream is asking the same structure that already exists.
          </>
        ),
      },
      Visual: S.PredictLineageTooling,
    },
    {
      title: 'Reveal: lineage, asked for rather than hand-maintained',
      body: (
        <>
          Asked directly: fct_orders's own transitive upstream. The asset graph answers raw_orders
          and stg_orders, with no lineage tool built, run, or kept in sync separately.
        </>
      ),
      duration: 4.8,
      fig: 'lineage, asked for rather than hand-maintained.',
      takeaway: "Lineage isn't a separate system here. It's the same dependency graph the pipeline already declared.",
      Visual: S.RevealLineageFree,
    },
    {
      title: 'Reveal: Components, the dg CLI, and where this fits poorly',
      body: (
        <>
          Dagster's packaging and scaffolding layer, Components and the dg CLI, has reached GA
          status per Dagster's own release notes. But sending an email or calling a payment API
          has no data product to name -- the asset model fits that kind of work poorly, by design.
        </>
      ),
      duration: 4.8,
      fig: 'components and dg, now ga. where the model fits poorly.',
      Visual: S.RevealComponentsAndLimits,
    },
    {
      title: 'Recap',
      body: (
        <>
          A task graph's nodes are actions. An asset graph's nodes are the data products
          themselves, and a lineage graph falls out of that for free -- but not every job is a
          data product, and the model doesn't try to pretend otherwise.
        </>
      ),
      duration: 4.8,
      fig: 'task graphs wire actions. asset graphs wire data products.',
      takeaway: "The asset graph isn't a prettier task graph. It's a different answer to what the nodes even are.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A fourth asset joins the pipeline, declaring its own dependency on fct_orders. Does
          deriving its lineage need anything built that the first three assets didn't already have?
        </>
      ),
      duration: 2.8,
      fig: 'add a fourth stage. does deriving lineage change?',
      predict: {
        options: [
          { label: "The lineage tooling has to be extended for the new stage" },
          { label: "Nothing changes -- the new asset's own declared dependency is enough", correct: true },
        ],
        explain: (
          <>
            The mechanism doesn't scale with how many stages exist. Every asset declares its own
            upstream once, and the graph derived from those declarations grows automatically.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
