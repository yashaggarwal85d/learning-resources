import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Five vendors' real billing units (Glue DPU-hours, EMR Serverless vCPU/GB-seconds, Dataproc
// Serverless DCUs, Databricks DBUs, and the BigQuery slot-ms precision gap), the four hidden
// costs serverless trades for per-second billing, one escape hatch per vendor, and the
// break-even-utilisation formula derived from topic 6's cost model and solved numerically
// (disclosed in OUTLINE.md/examples.py).
const reel: Reel = {
  steps: [
    {
      title: 'The move that was supposed to save money nearly doubled the bill',
      body: (
        <>
          A job that already runs six hours a day, every day, moves from a provisioned cluster to a serverless
          service "to save money." The bill climbs to almost double. Nothing about the job changed — only how it's
          billed.
        </>
      ),
      duration: 4.4,
      Visual: S.NearlyDoubled,
    },
    {
      title: 'Which job is more likely to get cheaper on serverless?',
      body: (
        <>
          Job A runs six hours a day. Job B runs six minutes a day. Before the chart: which one actually benefits
          from moving to a per-second serverless rate instead of an always-on provisioned cluster?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Job A, the one that already runs six hours a day' },
          { label: 'Job B, the one that only runs six minutes a day', correct: true },
        ],
        explain: (
          <>
            Job B. A provisioned cluster charges the same flat rate whether it runs six minutes or twenty-four
            hours a day; serverless only charges for the minutes actually used. The six-minute job pays for almost
            nothing on serverless and a full day's reservation on provisioned. The six-hour job is already closer
            to filling that reservation's worth of use.
          </>
        ),
      },
      Visual: S.PredictWhichJob,
    },
    {
      title: 'Five vendors, five different billing units',
      body: (
        <>
          Glue bills by the DPU-hour — one DPU is 4 vCPU and 16 GB, $0.44 an hour. EMR Serverless bills by actual
          vCPU, memory and storage consumed. Dataproc Serverless bills by the DCU, with a documented 12-DCU floor
          per session. Databricks bills by the DBU, a normalized unit, not a fixed hardware ratio.
        </>
      ),
      duration: 5.4,
      Visual: S.FiveBillingUnits,
    },
    {
      title: "BigQuery's unit isn't a billing unit at all",
      body: (
        <>
          "Slot-ms" sounds like a fifth billing unit to match the other four. It isn't. BigQuery's own docs bill
          on-demand queries by terabytes scanned, and slot-time only under a separate capacity model you have to
          buy into first.
        </>
      ),
      duration: 4.6,
      Visual: S.SlotMsGap,
      takeaway: 'Slot-ms is a usage metric, not a billing unit — real billing is bytes scanned or bought slot capacity.',
    },
    {
      title: 'The same job, converted into two real units',
      body: (
        <>
          One job, 8 vCPU and 32 GB, ten minutes a run. On Glue: 2 DPUs, $0.1467 for the run. On Dataproc
          Serverless: 12 DCUs (the session floor), $0.12 for the run — both computed from each vendor's own
          published rate, not guessed.
        </>
      ),
      duration: 4.8,
      Visual: S.SameJobConverted,
    },
    {
      title: 'Four costs serverless hides by billing per second',
      body: (
        <>
          Cold start: a fresh process has to spin up before it does anything. Autoscaling lag: capacity doesn't
          arrive the instant demand does. Noisy neighbours: you don't own the hardware, so you don't own its other
          tenants. Version lag: the platform upgrades on its own schedule, not yours.
        </>
      ),
      duration: 5.0,
      Visual: S.FourHiddenCosts,
      takeaway: 'Serverless trades four hidden costs — cold start, autoscaling lag, noisy neighbours, version lag — for not owning the hardware.',
    },
    {
      title: 'Every one of these has a documented way out',
      body: (
        <>
          Glue lets you pin a fixed worker type and count instead of relying on autoscaling. EMR Serverless lets
          you configure pre-initialized capacity to keep workers warm. BigQuery lets you buy baseline slots instead
          of paying per query. None of these are secret — they're in each vendor's own docs.
        </>
      ),
      duration: 4.6,
      Visual: S.EscapeHatches,
    },
    {
      title: 'Where the two lines actually cross',
      body: (
        <>
          Provisioned cost is flat no matter how many hours a day the job runs. Serverless cost rises with every
          hour of use. Divide the provisioned daily cost by the serverless per-hour rate, and the crossing point
          falls out — the break-even utilisation.
        </>
      ),
      duration: 4.8,
      Visual: S.BreakEvenChart,
      takeaway: 'Break-even utilisation is the provisioned daily cost divided by the serverless per-hour-busy rate — a formula, not a guess.',
    },
    {
      title: 'Two honest answers to the same re-run problem',
      body: (
        <>
          Glue's job bookmarks track which files or partitions a run already processed, so a scheduled re-run
          skips them — but only Glue understands its own bookmark. A table format's incremental-read API answers
          the same question, portably, for any engine that reads the table.
        </>
      ),
      duration: 4.6,
      Visual: S.BookmarksVsIncremental,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Five vendors, five real billing units — and one, BigQuery's slot-ms, isn't a billing unit at all. Four
          hidden costs serverless trades for per-second billing, each with its own documented escape hatch. And one
          number, break-even utilisation, decides which side of the line a job actually belongs on.
        </>
      ),
      duration: 4.0,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A job runs four hours a day, and this topic's own break-even line for its billing shape sits at just
          over three hours a day. Is this job cheaper left on serverless, or moved to a provisioned cluster?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Cheaper on serverless — four hours is still a light workload' },
          { label: 'Cheaper on provisioned — four hours a day is already past this job\'s own break-even line', correct: true },
        ],
        explain: (
          <>
            Provisioned. Four hours a day is already past the computed break-even point of just over three hours,
            the same line this topic's own `examples.py` solves numerically rather than asserting. Past that line,
            every extra hour serverless bills by the second costs more than the flat rate already paid for by the
            provisioned cluster sitting idle the rest of the day.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
