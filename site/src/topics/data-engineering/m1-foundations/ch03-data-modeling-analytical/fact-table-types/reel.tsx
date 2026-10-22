import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real transaction fact table, a real periodic snapshot, a real
// accumulating snapshot updated in place across three milestones, and a real factless
// coverage-minus-activity query (SOURCES.md, examples.py). Every number on screen traces to a
// literal constant in examples.py; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'Same shop, four different fact tables',
      body: (
        <>
          One row per event. One row per period. One row per pipeline, updated as it moves. One row
          with no measure at all. Same business, four different shapes of fact table.
        </>
      ),
      duration: 4.8,
      fig: 'transaction, periodic snapshot, accumulating snapshot, factless',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: transaction fact, quoted directly',
      body: (
        <>
          A row corresponds to a measurement event at a point in space and time — dense or sparse,
          since a row exists only if the measurement actually happened.
        </>
      ),
      duration: 4.8,
      fig: 'one row per event — dense or sparse, never padded',
      Visual: S.RevealTransaction,
    },
    {
      title: 'Predict: does an idle account still get a snapshot row?',
      body: (
        <>
          A periodic snapshot takes one row per account, per day. On a day an account's balance
          doesn't change at all, does that account still get a row?
        </>
      ),
      duration: 2.8,
      fig: 'an idle account, on an idle day — still a row?',
      predict: {
        options: [
          { label: "No — skip the row, nothing happened to record" },
          { label: 'Yes — a row every period, for every entity, active or not', correct: true },
        ],
        explain: (
          <>
            Yes. The periodic snapshot's own grain is the period, not the event — every reporting
            entity appears in every snapshot, whether or not anything happened to it that period.
          </>
        ),
      },
      Visual: S.PredictPeriodicSnapshot,
    },
    {
      title: 'Reveal: periodic snapshot, measured',
      body: (
        <>
          Built for real, over three days with two accounts that never moved: every account shows up
          in every single day's snapshot, measured directly, not merely described as "should."
        </>
      ),
      duration: 4.8,
      fig: 'two accounts, three days — two rows present, every day',
      takeaway: 'A periodic snapshot is dense by grain: every entity, every period, active or not.',
      Visual: S.RevealPeriodicMeasured,
    },
    {
      title: 'Reveal: accumulating snapshot, quoted directly',
      body: (
        <>
          A row is inserted once, when the pipeline begins, then revisited and updated as it
          progresses — the only one of the fact table types where a row is consistently updated.
        </>
      ),
      duration: 4.8,
      fig: 'inserted once at the start. updated, not re-inserted, after.',
      Visual: S.RevealAccumulatingQuote,
    },
    {
      title: 'Predict: how many rows after three milestones?',
      body: (
        <>
          One order line moves through ordered, shipped, and delivered. After all three milestones
          are recorded, how many rows does its accumulating snapshot have?
        </>
      ),
      duration: 2.8,
      fig: 'ordered, then shipped, then delivered — how many rows now?',
      predict: {
        options: [
          { label: 'Three — one new row recorded per milestone' },
          { label: 'Still one — the same row, updated each time', correct: true },
        ],
        explain: (
          <>
            Still one. Every milestone revisits the identical row; nothing is ever inserted again
            after the first time the order line enters the pipeline.
          </>
        ),
      },
      Visual: S.PredictAccumulatingRows,
    },
    {
      title: 'Reveal: accumulating snapshot, measured',
      body: (
        <>
          Built for real: one row, inserted at order, updated at ship, updated again at delivery —
          row count stayed at one throughout, with a one-day and a two-day lag computed along the way.
        </>
      ),
      duration: 4.8,
      fig: 'one row, three milestones, two lags computed, zero re-inserts',
      takeaway: 'The accumulating snapshot is the one type whose own rows are meant to be rewritten.',
      Visual: S.RevealAccumulatingMeasured,
    },
    {
      title: 'Reveal: factless fact, quoted directly',
      body: (
        <>
          Some events carry no numeric fact at all — just dimension keys coming together. Subtracting
          an activity table from a coverage table finds exactly what didn't happen.
        </>
      ),
      duration: 4.8,
      fig: 'coverage, minus activity, equals what never happened',
      Visual: S.RevealFactlessQuote,
    },
    {
      title: 'Reveal: factless fact, measured',
      body: (
        <>
          A real coverage table of three expected students, minus a real activity table of two who
          actually attended, leaves exactly the one student who did not — computed, not asserted.
        </>
      ),
      duration: 4.8,
      fig: 'three expected, two attended, one found missing — by subtraction',
      takeaway: 'A factless fact needs no measure: the question it answers is simply who showed up, or who didn\'t.',
      Visual: S.RevealFactlessMeasured,
    },
    {
      title: 'Predict: which types stay additive under a late update?',
      body: (
        <>
          An order line's amount arrives late and gets corrected. Which of these four fact tables
          absorbs that cleanly, and which one's own numbers have to be recomputed, not summed?
        </>
      ),
      duration: 2.8,
      fig: 'a late correction — which type just re-sums, which recomputes?',
      predict: {
        options: [
          { label: 'All four absorb a late correction the same way' },
          {
            label: "Transaction and periodic snapshot just re-sum; the accumulating snapshot's lags are recomputed",
            correct: true,
          },
        ],
        explain: (
          <>
            A late transaction is just another additive row, and a late snapshot is just another
            period's row. But an accumulating snapshot's own lag measures are a function of two
            milestone dates — updating one milestone means recomputing the lag, never summing it.
          </>
        ),
      },
      Visual: S.PredictAdditivityVerdict,
    },
    {
      title: "Reveal: the additivity verdict",
      body: (
        <>
          Transaction and periodic snapshot facts stay additive the way any measure does. The
          accumulating snapshot's lag measures are recomputed on every update, never summed across
          the milestones that produced them.
        </>
      ),
      duration: 4.8,
      fig: 'transaction, snapshot: additive as usual. accumulating: lags recomputed.',
      takeaway:
        "A fact table's own type decides whether a late update is a new additive row or a recomputation of an existing one.",
      Visual: S.RevealAdditivityVerdict,
    },
    {
      title: 'Recap',
      body: (
        <>
          A row per event, dense or sparse. A row per period, for every entity, every time. A row per
          pipeline, revisited and updated as it moves. A row with no measure, used to find what never
          happened.
        </>
      ),
      duration: 4.8,
      fig: 'transaction, periodic snapshot, accumulating snapshot, factless — measured',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A support ticket has an opened date, a first-response date, and a closed date. Which of the
          four fact-table types fits this pipeline?
        </>
      ),
      duration: 2.8,
      fig: 'opened, first response, closed — which fact table type?',
      predict: {
        options: [
          { label: 'A transaction fact — one immutable row per ticket event' },
          {
            label: 'An accumulating snapshot — one row per ticket, updated at each milestone',
            correct: true,
          },
        ],
        explain: (
          <>
            An accumulating snapshot. The ticket has a defined start, standard intermediate steps, and
            a defined end — exactly the shape this fact table type exists to model, with the same row
            revisited at each milestone rather than a new one inserted every time.
          </>
        ),
      },
      Visual: S.ProveTicketPipeline,
    },
  ],
};

export default reel;
