import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own Polars 2.0.0 (examples.py): eager vs. lazy producing
// identical rows; predicate/projection pushdown and common-subexpression elimination read
// directly from real explain() output; the no-implicit-row-order rule demonstrated by repeating
// the exact same join thirty times and recording every distinct row order observed; the
// streaming engine's lower peak RSS against the same projection, measured in isolated
// subprocesses. The cuDF-backed GPU engine is sourced-only throughout (no GPU on this sandbox),
// named as such at every step that touches it. No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: does writing it lazily actually change what runs?',
      body: (
        <>
          pandas 3.0 adopted the buffers topic 5 described, onto an eager, line-by-line API.
          Here's the first library this chapter shows built around lazy evaluation from the
          ground up. Does calling it "lazy" actually change what runs, or just how the code is
          spelled?
        </>
      ),
      duration: 4.8,
      fig: "pandas adopted the buffers — does polars' own lazy label actually change what runs?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the same transformation, eager and lazy',
      body: (
        <>
          The same filter-and-select, written as an eager call chain and as a lazy scan. The
          eager version runs each step the moment it's called. The lazy version builds a plan
          and runs none of it until collect is called — confirmed directly, and the rows that
          come back either way are identical.
        </>
      ),
      duration: 4.8,
      fig: 'the same filter and select, written eager and lazy — identical rows out, one of them deferred',
      Visual: S.RevealEagerVsLazy,
    },
    {
      title: 'Reveal: predicate and projection pushdown, read from a real query plan',
      body: (
        <>
          A lazy plan has two forms: the plan as written, and the plan the optimizer actually
          runs. Printed directly from a real query, the filter moves into the scan itself, and
          the scan reads only the columns the rest of the query actually touches.
        </>
      ),
      duration: 4.8,
      fig: 'the plan as written vs. the plan polars actually runs — read directly from explain()',
      takeaway: "Pushdown isn't a promise — a real printed plan shows the filter and columns moved into the scan.",
      Visual: S.RevealPushdown,
    },
    {
      title: 'Predict: does collect() with no arguments preserve the original row order?',
      body: (
        <>
          No engine is named, and nothing explicitly asks Polars to reorder anything. Does the
          result still come back in the same row order it started in?
        </>
      ),
      duration: 2.8,
      fig: 'no engine named, no ordering asked for — does the row order survive anyway?',
      predict: {
        options: [
          { label: "Yes — nothing asked Polars to reorder anything, so it keeps the order it got" },
          { label: "No — the engine that runs by default doesn't promise to keep it", correct: true },
        ],
        explain: (
          <>
            No. Since Polars 2.0, collect with no engine argument defaults to the streaming
            engine, and the streaming engine's own contract explicitly doesn't guarantee row
            order for operations like joins, group-bys and unpivots.
          </>
        ),
      },
      Visual: S.PredictRowOrder,
    },
    {
      title: 'Reveal: no implicit row order, measured across repeated runs',
      body: (
        <>
          The exact same join, run thirty separate times. With the default engine, several
          different row orders come back across those runs — measured directly, not read off a
          changelog. Adding one keyword argument, asking to maintain order, gets the same order
          every single time.
        </>
      ),
      duration: 4.8,
      fig: 'the exact same join, run thirty times — how many different row orders come back?',
      takeaway: "Row order isn't missing by accident — nothing asked for it, and asking costs one keyword argument.",
      Visual: S.RevealNoImplicitOrder,
    },
    {
      title: 'Reveal: common subexpression elimination',
      body: (
        <>
          The same expression, used by two different output columns. Written out, it appears
          twice. Run, the printed plan shows it computed exactly once, cached, and reused for
          the second column — confirmed directly, with both columns still coming out correct.
        </>
      ),
      duration: 4.8,
      fig: 'the same expression, used by two output columns — computed once or twice?',
      Visual: S.RevealCommonSubexpression,
    },
    {
      title: 'Reveal: the streaming engine lowers peak memory, short of full out-of-core',
      body: (
        <>
          The same projection, read two ways: a full eager read, and a lazy scan collected on
          the streaming engine. Measured directly, the streaming version peaks lower. But not
          every operation spills to disk yet — the team that builds this engine says so
          themselves, in their own words about what's still being finished.
        </>
      ),
      duration: 4.8,
      fig: 'the same projection, read whole and read in batches — measured peak memory, not claimed',
      takeaway: "The streaming engine already uses less memory today — full out-of-core support is still being built, by the team's account.",
      Visual: S.RevealStreamingMemory,
    },
    {
      title: 'Reveal: the cuDF-backed GPU engine',
      body: (
        <>
          This sandbox has no NVIDIA GPU, so nothing here is run directly — every claim in this
          step is a quote from Polars' own documentation, named as such. Requesting the GPU
          engine dispatches the same query plan to an NVIDIA GPU; an operation it can't run
          there falls back to the CPU engine instead of failing, and both engines share the same
          buffer format, so results and files move between them without conversion.
        </>
      ),
      duration: 4.8,
      fig: 'the same query plan, dispatched to an nvidia gpu instead — sourced, not run here',
      Visual: S.RevealGpuEngine,
    },
    {
      title: 'Recap',
      body: (
        <>
          Eager and lazy produce the same rows, one of them deferred. Pushdown and subexpression
          reuse are visible directly in a real printed plan, not just claimed. Row order is not
          guaranteed unless asked for, measured across repeated runs. The streaming engine
          measurably lowers memory today, with full out-of-core support still being built. And
          the GPU engine, documented but not run here.
        </>
      ),
      duration: 4.8,
      fig: 'deferred execution, a plan that proves its own optimizations, no promise on row order, real memory gains short of the full story',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team's nightly job joins two LazyFrames and writes the result to a report that's
          read back by row position, with no ordering option set. What silently breaks between
          runs, and what's the one-line fix?
        </>
      ),
      duration: 2.8,
      fig: "a nightly job joins two lazyframes and writes a report read by row position — what breaks?",
      predict: {
        options: [
          { label: 'Nothing breaks — a join always returns rows in a consistent order' },
          { label: "The report's row-to-meaning mapping silently drifts between runs; add maintain_order to fix it", correct: true },
        ],
        explain: (
          <>
            The join's row order was never guaranteed to begin with, so a report that reads rows
            by position can silently point at the wrong record from one run to the next. The
            one-line fix is adding maintain_order to the join, or sorting the result explicitly
            before writing it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
