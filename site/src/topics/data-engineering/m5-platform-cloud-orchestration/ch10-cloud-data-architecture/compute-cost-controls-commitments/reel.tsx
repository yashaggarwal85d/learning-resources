import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// BigQuery's slots/editions vs on-demand and its max-bytes-billed guardrail, Snowflake's
// warehouse sizing, auto-suspend and resource monitors, Databricks' budget policies, spot and
// preemptible compute, committed-use discounts vs flexibility, and cost regressions as CI
// failures — sourced from each vendor's own current documentation (SOURCES.md). No real
// account in any of the four platforms runs in this sandbox; examples.py's dollar and credit
// figures are disclosed-illustrative.
const reel: Reel = {
  steps: [
    {
      title: 'One missing filter, one month of budget, gone',
      body: (
        <>
          A mistyped query with no row limit and no partition filter scans an entire
          multi-terabyte table on an on-demand billing model. Nothing stops it until the bill
          arrives — the same query, with a byte cap configured, fails in an instant instead, at
          no cost at all.
        </>
      ),
      duration: 4.8,
      Visual: S.RunawayQueryHook,
    },
    {
      title: 'Before the guardrails: which of these actually stop a cost, not just flag it?',
      body: (
        <>
          Some of what's coming only tells you after the money is spent. Some of it refuses to
          spend the money at all. Before seeing them side by side: which kind do you expect to
          be rarer?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'A tagging policy that labels spend for later attribution' },
          { label: "An alert that notifies someone once a threshold is crossed" },
          { label: "A guardrail that refuses to run before the cost is incurred at all", correct: true },
          { label: 'A dashboard showing yesterday\'s spend' },
        ],
        explain: (
          <>
            A guardrail that refuses to run. Tags and alerts both happen after spend is already
            committed or already crossed a line — only a check that runs before execution can
            stop a cost from existing in the first place.
          </>
        ),
      },
      Visual: S.PredictStopsVsFlags,
    },
    {
      title: 'A byte cap that fails before the charge, not after',
      body: (
        <>
          Reserved slots price compute by capacity, on-demand prices it by bytes scanned. The
          cap itself estimates bytes before running the query — if the estimate crosses the
          limit, the query fails with no charge at all, reproduced for real.
        </>
      ),
      duration: 4.8,
      Visual: S.MaxBytesBilled,
    },
    {
      title: 'A warehouse that stops billing the moment nobody needs it',
      body: (
        <>
          A bigger warehouse costs more per hour, but billing is per second, so an idle
          warehouse that auto-suspends stops costing anything at all — and a resource monitor
          can suspend it outright at a credit threshold, not just alert on it.
        </>
      ),
      duration: 5.0,
      Visual: S.WarehouseAndMonitor,
      takeaway: "Auto-suspend and a resource monitor both act, on idleness or a credit threshold — neither one merely alerts.",
    },
    {
      title: "A tag is not a cap",
      body: (
        <>
          A Databricks budget policy attaches a tag to serverless spend so it shows up correctly
          in the bill later. It doesn't stop a single dollar from being spent — which makes it a
          different tool entirely from a guardrail that blocks before the cost happens.
        </>
      ),
      duration: 4.4,
      Visual: S.TaggingNotCapping,
      takeaway: "A budget policy that tags spend for attribution is not the same control as a guardrail that blocks spend outright.",
    },
    {
      title: 'A steep discount, and the price of accepting it',
      body: (
        <>
          A preemptible instance costs a fraction of the standard price, in exchange for losing
          it on short notice at any time. Reproduced for real: a checkpointed job only redoes the
          work since its last checkpoint, not the whole job, when that preemption actually hits.
        </>
      ),
      duration: 5.0,
      Visual: S.PreemptionCheckpoint,
    },
    {
      title: 'A multi-year discount, and the flexibility it costs you',
      body: (
        <>
          A committed-use discount trades a long-term spend commitment for a lower rate. Below a
          certain utilization, paying on demand the whole time would actually have been cheaper
          — the same break-even logic this course already used for a single job, now stretched
          across a whole contract term.
        </>
      ),
      duration: 5.0,
      Visual: S.CommitmentBreakeven,
      takeaway: "A committed-use discount only wins above its own break-even utilization — below that, flexibility was worth more.",
    },
    {
      title: 'A cost spike that fails the build, like any other regression',
      body: (
        <>
          A pipeline's measured cost crossing a stated budget, on a specific CI run, is treated
          exactly like a correctness or performance regression: the build goes red, and nobody
          has to notice the bill days later to find out something changed.
        </>
      ),
      duration: 4.4,
      Visual: S.CostRegressionGate,
    },
    {
      title: 'In one breath',
      body: (
        <>
          A byte cap and a resource monitor actually block. A budget policy only tags. A
          preemptible discount costs you short-notice interruption. A commitment only wins past
          its own break-even line. And a cost spike can fail a build before anyone has to notice.
        </>
      ),
      duration: 4.4,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A job runs unattended overnight on a platform with no row-limit review and no byte
          cap configured. Which single change would have actually stopped a runaway query from
          costing anything, rather than merely flagging it the next morning?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Adding a Databricks-style budget tag to the job' },
          { label: 'Configuring a byte cap that fails the query before it runs', correct: true },
          { label: 'Switching the job onto preemptible compute' },
          { label: 'Reviewing yesterday\'s cost dashboard more often' },
        ],
        explain: (
          <>
            The byte cap. A tag only labels spend after it happens, preemptible compute changes
            who can interrupt the job rather than what it costs per byte, and a dashboard only
            ever reports what already happened — only the cap itself runs before the charge.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
