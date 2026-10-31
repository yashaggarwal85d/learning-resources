import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The dual-logic discrepancy, the reprocessing crossover, and the
// batch-layer threshold check are asserted in examples.py's own
// kappa_revenue(), lambda_batch_revenue(), dual_logic_discrepancy(),
// reprocessing_crossover_days() and batch_layer_earns_its_place(). The
// dual-logic-drift and unified-engine claims trace to Kreps's and
// Flink's own docs, quoted in SOURCES.md and checked step by step in
// FACT-CHECK.md. No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: two pipelines, two different answers",
      body: (
        <>
          The shop's revenue-by-product pipeline runs as a streaming job and a nightly batch
          job. For several days the two disagreed on one product, and nobody could say which
          number was right — the batch job treated post-midnight refunds differently.
        </>
      ),
      duration: 5.0,
      fig: "two numbers for the same metric, disagreeing, and nobody sure which is right",
      Visual: S.Hook,
    },
    {
      title: "Predict: when is ripping out the batch layer right?",
      body: (
        <>
          A colleague proposes a pure streaming design, no batch layer at all. When is that the
          right call, and when does it make the next restatement impossible?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "always right, since one code path can never drift from itself and is therefore simpler" },
          {
            label: "right when the shop's late-data tail and reprocessing volume fall under computed thresholds, wrong once a restatement needs data the log no longer retains",
            correct: true,
          },
        ],
        explain: (
          <>
            A single code path can't disagree with itself, but it still has a real reprocessing
            cost and a real retention limit. The right call depends on whether this pipeline's
            own numbers fall under the thresholds that make pure streaming actually sufficient.
          </>
        ),
      },
      fig: "one code path can't drift, but it still has a real retention limit",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the same pipeline, two designs",
      body: (
        <>
          Design A, Kappa: one streaming program over a retained log, replay as its only
          reprocessing path. Design B, Lambda: a streaming speed layer plus a batch layer,
          merged at serve time. Each gets its own estimate, failure table, and cost.
        </>
      ),
      duration: 5.0,
      fig: "two pipeline strips stacked, each with its own cost bars",
      Visual: S.RevealTwoDesigns,
    },
    {
      title: "Reveal: the reprocessing-cost crossover",
      body: (
        <>
          Kappa's cost to recompute a year replays the retained log through the streaming
          engine. Lambda's cost re-runs the cheap batch layer over the lake instead. The two
          cross at a retention length and reprocessing frequency computed from the shop's own
          numbers.
        </>
      ),
      duration: 5.0,
      takeaway: "Kappa's reprocessing cost and Lambda's are each a computed number, not a default choice made out of habit.",
      fig: "a replay-cost line and a batch-cost line crossing at a computed retention length",
      Visual: S.RevealCrossover,
    },
    {
      title: "Reveal: dual-logic drift, measured",
      body: (
        <>
          The same synthetic stream runs through both paths, with one deliberately diverged
          rule: how a post-midnight refund gets treated. The two results are plotted side by
          side, diverging exactly at that one planted case.
        </>
      ),
      duration: 4.8,
      fig: "two results plotted together, diverging exactly where the rule was planted",
      Visual: S.RevealDriftMeasured,
    },
    {
      title: "Reveal: a unified engine reduces drift, doesn't remove it",
      body: (
        <>
          One program, executed by the same engine in either streaming or batch mode, produces
          matching results on bounded input. That's real progress — but it's still a second
          mode, still a second path that has to stay correct.
        </>
      ),
      duration: 4.8,
      takeaway: "Two code paths that must agree will drift; a unified engine reduces the drift without removing the second path.",
      fig: "one program, two modes, matching results — and still two modes to maintain",
      Visual: S.RevealUnifiedEngine,
    },
    {
      title: "Reveal: when a batch layer still earns its complexity",
      body: (
        <>
          Four named cases, checked against the shop's own numbers: billing-grade counts that
          must absorb very late data, reprocessing too large or slow for streaming replay, a
          logic change needing a join against a huge historical dimension, and a compliance
          restatement.
        </>
      ),
      duration: 5.0,
      fig: "four named cases, each checked against the shop's own numbers",
      Visual: S.RevealFourConditions,
    },
    {
      title: "Reveal: the decision, stated as thresholds",
      body: (
        <>
          A decision card lines the four conditions up against this pipeline's own numbers and
          checks each one. Whichever ones are met decide whether the batch layer stays, with no
          vague appeal to caution standing in for a number.
        </>
      ),
      duration: 4.8,
      takeaway: "A batch layer earns its place by a threshold computed from the shop's own numbers, not by habit.",
      fig: "a decision card checking each of the four conditions against this pipeline",
      Visual: S.RevealDecisionCard,
    },
    {
      title: "Recap",
      body: (
        <>
          Two designs for one pipeline, each priced. A reprocessing-cost crossover, computed. A
          planted edge case, measured as actual drift. A unified engine that helps, without
          removing the second path. And a batch-layer decision, stated as four checkable
          conditions.
        </>
      ),
      duration: 4.8,
      fig: "the two strips, the crossover, the measured drift, and the decision card",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a Kappa pipeline hits a huge-dimension join",
      body: (
        <>
          A pure Kappa pipeline needs years of history recomputed after a logic change requiring
          a join against a dimension table far larger than the retained log's own window. What's
          the right move?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "extend the log's retention window to cover the years needed, since Kappa's reprocessing is just a longer replay" },
          {
            label: "check this request against the four named conditions directly — the huge-historical-dimension join is one of them",
            correct: true,
          },
        ],
        explain: (
          <>
            A longer retention window trades directly against storage cost and throughput, and a
            replay still can't join against a dimension the log was never built to hold. The
            huge-dimension-join case is already one of the four named conditions that justify a
            batch layer.
          </>
        ),
      },
      fig: "a huge-dimension join; the fix is checking the four conditions, not extending retention",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
