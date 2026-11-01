import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py, standing in for the chapter's own lab -- a pandas-UDF batch
// transform on Spark vs a plain Python generator standing in for Ray Data's operator-level
// streaming, CPU-only and scaled down): a vectorized, batched computation over the same per-row
// workload runs real, meaningfully faster per row than the identical row-at-a-time computation;
// a streaming pipeline that discards each result immediately keeps peak memory flat across a
// hundredfold row-count increase, while a pipeline that materializes the full intermediate
// result has peak memory that grows proportionally with the row count.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Twenty-nine topics taught this chapter's one model: cut the job at every shuffle,
          materialise each stage's output, recover by resubmitting a stage. This closing topic
          steps outside that model to name what it chose not to be.
        </>
      ),
      duration: 4.5,
      fig: "one model, taught for twenty-nine topics. Now: what it chose not to be.",
      Visual: S.Hook,
    },
    {
      title: "Reveal: Spark trades latency for recoverability, by writing every stage's output first",
      body: (
        <>
          Spark writes every stage's output to disk before the next stage starts. A pipelined
          engine instead keeps data moving in-memory, exchange to exchange, with nothing
          written in between.
        </>
      ),
      duration: 4.8,
      fig: 'Spark writes, then moves on. A pipelined engine just keeps moving.',
      Visual: S.RevealTradeLatencyForRecovery,
    },
    {
      title: 'Predict: the same computation, large batches vs one row at a time. Which is faster, per row?',
      body: (
        <>
          The identical per-row computation, run as large vectorised batches versus run one row
          at a time. Which comes out faster, measured per row?
        </>
      ),
      duration: 2.8,
      fig: 'same computation: large batches, or one row at a time. Faster per row?',
      predict: {
        options: [
          { label: 'One row at a time — less overhead per operation, nothing to batch up first' },
          { label: 'Large batches — vectorised work beats a loop over individual rows', correct: true },
        ],
        explain: (
          <>
            Large batches. A vectorised operation processes many rows in one call; a
            row-at-a-time loop pays the per-call overhead on every single one.
          </>
        ),
      },
      Visual: S.PredictBatchVsRow,
    },
    {
      title: 'Reveal: the batched version is faster, by a wide margin, measured directly',
      body: (
        <>
          Measured: the batched, vectorised version runs real, meaningfully faster per row than
          the identical computation done one row at a time.
        </>
      ),
      duration: 4.8,
      fig: 'batched: faster, by a wide margin. One row at a time: slower, measured.',
      Visual: S.RevealBatchFaster,
    },
    {
      title: 'Elaborate: that speed is what a row-at-a-time exchange gives up',
      body: (
        <>
          A pipelined engine's default execution has no stage boundary to retry from. Trino's
          own default behaviour names the cost directly: one failed task fails the whole query.
        </>
      ),
      duration: 5,
      fig: 'no boundary to retry from -- by default, one failure fails everything.',
      takeaway: "A pipelined exchange is fast because it never stops to checkpoint; that's why one failure can cost the whole query.",
      Visual: S.ElaborateGiveUpOnFailure,
    },
    {
      title: 'Predict: streaming row by row vs materialising the whole result. Whose memory grows with row count?',
      body: (
        <>
          One pipeline consumes and discards each row's result immediately. The other
          materialises the whole intermediate result first. Whose memory grows as the row count
          climbs?
        </>
      ),
      duration: 2.8,
      fig: 'streaming, or materialising the whole result. Whose memory grows?',
      predict: {
        options: [
          { label: "The streaming pipeline — holding a running total still costs something" },
          { label: "The materialising pipeline — it keeps every row's result at once", correct: true },
        ],
        explain: (
          <>
            The materialising pipeline. Keeping every row's result in memory at once means that
            memory has to grow right along with the row count; discarding each result as it's
            used does not.
          </>
        ),
      },
      Visual: S.PredictMemoryGrowth,
    },
    {
      title: 'Reveal: materialising grows with row count, streaming stays flat, measured directly',
      body: (
        <>
          Measured across a hundredfold increase in row count: the materialising pipeline's
          peak memory grows right along with it. The streaming pipeline's peak memory barely
          moves.
        </>
      ),
      duration: 4.8,
      fig: '100x more rows: materialising grows with it. Streaming: flat, measured.',
      Visual: S.RevealMemoryGrows,
    },
    {
      title: "Elaborate: fault-tolerant execution is the convergence point",
      body: (
        <>
          Trino's TASK retry policy spools exchange data to storage on purpose, so a failed
          task can be retried from what's already been written -- buying Spark's own
          recoverability back for a model that otherwise has none.
        </>
      ),
      duration: 5,
      fig: 'spooling exchange data on purpose -- recoverability, bought back deliberately.',
      takeaway: "Fault-tolerant execution isn't a different model from Spark's; it's a pipelined engine growing a stage boundary when it needs one.",
      Visual: S.ElaborateFTEConverges,
    },
    {
      title: 'Reveal: three real models, three different trades',
      body: (
        <>
          Spark materialises every stage for recoverability, at the cost of latency. A pipelined
          exchange moves fast but risks the whole query on one failure. Ray Data streams through
          each operator's own out queue, bounding memory without ever batching at Spark's scale.
        </>
      ),
      duration: 5,
      fig: 'recoverable and slow, fast and fragile, or streamed and memory-bounded.',
      Visual: S.RevealThreeModels,
    },
    {
      title: 'Recap',
      body: (
        <>
          One chapter, one model, now named against two others by what each one gives up to get
          what it gets.
        </>
      ),
      duration: 5,
      fig: "one model, named against two others by what each one gives up.",
      takeaway: "Every model here makes the same trade in a different place: speed, memory and recoverability can't all be maximised.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
