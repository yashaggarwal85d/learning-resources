import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real orders fact and a real support-tickets fact, joined two ways
// on their shared conformed date (SOURCES.md, examples.py). Every number on screen traces to a
// literal constant in examples.py; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'Two fact tables, one shared date, one question',
      body: (
        <>
          An orders fact and a support-tickets fact both carry the same date dimension. Join them on
          that shared date and sum the amounts — is the number you get actually the right one?
        </>
      ),
      duration: 4.8,
      fig: 'orders fact + tickets fact, joined on a shared date',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: conformed dimension, quoted directly',
      body: (
        <>
          Dimension tables conform when their attributes share the same column names and the same
          domain contents — the one thing that makes two separate fact tables comparable at all.
        </>
      ),
      duration: 4.8,
      fig: 'same column names, same domain contents — conformed',
      Visual: S.RevealConformedDimension,
    },
    {
      title: 'Predict: is a direct join on a conformed date safe to sum?',
      body: (
        <>
          The shared date dimension genuinely is conformed. Does that make it safe to join the two
          fact tables directly on it, and sum the result?
        </>
      ),
      duration: 2.8,
      fig: 'conformed date, joined directly — safe to sum?',
      predict: {
        options: [
          { label: 'Yes — the dimension is conformed, so the join is sound' },
          { label: "No — the two fact tables' own grains still don't match", correct: true },
        ],
        explain: (
          <>
            No. Conforming the dimension only means the two fact tables can be compared at all; it
            says nothing about whether they share the same grain, and a direct join multiplies rows
            whenever they don't.
          </>
        ),
      },
      Visual: S.PredictDirectJoin,
    },
    {
      title: 'Reveal: drilling across, quoted directly',
      body: (
        <>
          Drilling across means running separate queries against each fact table and aligning their
          answer sets by a sort-merge on the shared row headers — never a row-level join between them.
        </>
      ),
      duration: 4.8,
      fig: 'two separate queries, aligned by sort-merge, never joined directly',
      Visual: S.RevealDrillAcross,
    },
    {
      title: 'Reveal: the bus matrix, quoted directly',
      body: (
        <>
          The bus matrix is the planning tool itself: business processes down the rows, conformed
          dimensions across the columns, marking exactly which dimension each process actually shares.
        </>
      ),
      duration: 4.8,
      fig: 'business processes × conformed dimensions, the planning grid',
      Visual: S.RevealBusMatrix,
    },
    {
      title: 'Reveal: the fan-out, measured',
      body: (
        <>
          Joined directly on the shared date and summed, two orders and three tickets return six
          rows, and the order total comes out nearly triple what it should be — multiplied once per
          matching ticket.
        </>
      ),
      duration: 4.8,
      fig: 'two orders × three tickets, joined directly: six rows, inflated sum',
      takeaway: "A direct join on a conformed dimension still fans out when the two fact tables' grains differ.",
      Visual: S.RevealFanOut,
    },
    {
      title: 'Reveal: aggregate-first, measured',
      body: (
        <>
          Summarize each fact table down to the shared date first, then join those two already-summed
          rows — one row meets one row, and nothing multiplies.
        </>
      ),
      duration: 4.8,
      fig: 'summarize each fact table first, then join the summaries',
      takeaway: 'Aggregate to the shared grain before joining; join first, and the sum is already wrong.',
      Visual: S.RevealAggregateFirst,
    },
    {
      title: 'Predict: which number was actually correct all along?',
      body: (
        <>
          Two different totals came out of the same two fact tables. Which one was the genuinely
          correct figure?
        </>
      ),
      duration: 2.8,
      fig: 'two totals, one real — which is which?',
      predict: {
        options: [
          { label: 'The fanned-out total — more rows means more information' },
          { label: "The aggregate-first total — it matches each fact table's own true sum", correct: true },
        ],
        explain: (
          <>
            The aggregate-first total. Summing each fact table alone, with no join at all, reproduces
            the exact same figure — independent confirmation that the fanned-out number was never real.
          </>
        ),
      },
      Visual: S.PredictWhichIsCorrect,
    },
    {
      title: 'Reveal: both totals confirmed independently',
      body: (
        <>
          Summed alone, with no join involved, each fact table reproduces exactly the aggregate-first
          figure — the fanned-out number matches neither one.
        </>
      ),
      duration: 4.8,
      fig: 'each fact table, summed alone, confirms the aggregate-first total',
      takeaway: 'The fan-out is detectable: an independent, join-free sum of each fact table never agrees with it.',
      Visual: S.RevealIndependentConfirmation,
    },
    {
      title: 'Recap',
      body: (
        <>
          Conformed dimensions make facts comparable at all. The bus matrix is where that gets
          planned, process by process. Drilling across means aggregating each fact table to the
          shared grain first, never joining fact tables to each other directly.
        </>
      ),
      duration: 4.8,
      fig: 'conformed, planned on the matrix, aggregated before joining',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A third fact table, at yet another grain, shares the same conformed date. Should it be
          joined to the others directly, or aggregated to the date first?
        </>
      ),
      duration: 2.8,
      fig: 'a third fact table, same conformed date — join, or aggregate first?',
      predict: {
        options: [
          { label: 'Join it directly — the date dimension is already conformed' },
          { label: 'Aggregate it to the shared date first, then join the summaries', correct: true },
        ],
        explain: (
          <>
            Aggregate first. A conformed dimension only guarantees the two tables can line up on the
            same row headers; it never guarantees their grains match, so a direct join still risks
            exactly the same fan-out.
          </>
        ),
      },
      Visual: S.ProveThirdFactTable,
    },
  ],
};

export default reel;
