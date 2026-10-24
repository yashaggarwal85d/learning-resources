import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Processing a batch at a time instead of one row at a time cuts the
// real per-row dispatch overhead by exactly the batch size chosen,
// without changing the real result at all, and two real, independent
// vectorized query engines both name this batch-at-a-time approach
// directly in their own words.
const reel: Reel = {
  steps: [
    {
      title: 'Run the identical filter-then-sum operation two ways over the identical column: once evaluating one row at a time, once processing a whole batch at a time instead. Does the batch-at-a-time version genuinely cut the number of per-row dispatches the row-at-a-time version pays?',
      body: (
        <>
          One row-at-a-time loop, one batch-at-a-time loop, the identical column.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both dispatch the same number of times either way' },
          { label: 'Yes, genuinely, far fewer dispatches in the batch-at-a-time version', correct: true },
          { label: "Only if the batch size happens to equal the column's own length" },
        ],
        explain: (
          <>
            Far fewer. One dispatch per batch, not per row.
          </>
        ),
      },
      Visual: S.DispatchPredict,
    },
    {
      title: 'Measured: far fewer dispatches in the batch-at-a-time version, on the identical operation and data',
      body: (
        <>
          One dispatch per batch, instead of one dispatch per row, is exactly where the cut comes from.
        </>
      ),
      duration: 3.0,
      Visual: S.DispatchReveal,
    },
    {
      title: 'Both paths apply the identical filter and the identical sum to the identical column. Does the batch-at-a-time version still produce the exact identical result as the row-at-a-time version?',
      body: (
        <>
          Both paths' own final sums, side by side.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, batching changes which rows get summed' },
          { label: 'Yes, genuinely, the exact identical result', correct: true },
          { label: 'Only if the column happens to contain no values near the threshold' },
        ],
        explain: (
          <>
            The exact identical result. Batching changes cost, not correctness.
          </>
        ),
      },
      Visual: S.CorrectnessPredict,
    },
    {
      title: 'Measured: the exact identical result, from both the row-at-a-time path and the batch-at-a-time path',
      body: (
        <>
          The real, measured identical sums.
        </>
      ),
      duration: 3.0,
      takeaway: 'Cutting dispatch overhead by batching changes nothing about the real answer, only how expensively the engine gets there.',
      Visual: S.CorrectnessReveal,
    },
    {
      title: "Does the batch-at-a-time version's own real dispatch count match exactly what the batch size and the column's own length predict, rather than merely coming out close?",
      body: (
        <>
          The predicted dispatch count, against the measured one.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, it comes out close but not exact, due to rounding' },
          { label: 'Yes, genuinely, an exact match', correct: true },
          { label: "Only when the column's own length divides evenly by the batch size" },
        ],
        explain: (
          <>
            An exact match. The arithmetic predicts it precisely.
          </>
        ),
      },
      Visual: S.ArithmeticPredict,
    },
    {
      title: 'Measured: an exact match between the real, measured dispatch count and the real batch arithmetic',
      body: (
        <>
          The real, measured exact match.
        </>
      ),
      duration: 3.0,
      takeaway: "The dispatch cut a batch-at-a-time engine buys isn't a rough estimate; it follows exactly from the chosen batch size.",
      Visual: S.ArithmeticReveal,
    },
    {
      title: "Real vectorized, Arrow-based query engines state this exact batch-at-a-time approach directly, in their own words. Does Apache DataFusion's own documentation name itself a vectorized execution engine directly?",
      body: (
        <>
          DataFusion's own words, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, it names itself a row-at-a-time engine instead' },
          { label: 'Yes, genuinely; it names itself vectorized directly', correct: true },
          { label: 'Only for queries that use the Apache Arrow in-memory format' },
        ],
        explain: (
          <>
            Yes. Vectorized, named directly, not merely implied.
          </>
        ),
      },
      Visual: S.DataFusionPredict,
    },
    {
      title: "Measured, in Apache DataFusion's own words: a blazingly fast, vectorized, multithreaded, streaming execution engine",
      body: (
        <>
          DataFusion's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A real production query engine names vectorized, batch-at-a-time execution as central to its own speed, not incidental.',
      Visual: S.DataFusionReveal,
    },
    {
      title: "Polars's own documentation names the identical batch-at-a-time idea from a different real engine's own words: does it state that Polars can execute a query in batches, instead of processing all the data at once?",
      body: (
        <>
          Polars's own words on batching, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PolarsReveal,
    },
    {
      title: 'Recap: what batching buys, and what it leaves unchanged',
      body: (
        <>
          Processing a batch at a time instead of one row at a time cuts the real per-row dispatch overhead by exactly the batch size chosen, without changing the real result at all, and two real, independent vectorized query engines both name this batch-at-a-time approach directly in their own words.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
