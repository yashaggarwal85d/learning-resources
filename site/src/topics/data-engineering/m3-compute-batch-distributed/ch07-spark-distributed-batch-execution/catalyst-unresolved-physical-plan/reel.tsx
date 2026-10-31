import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every plan-text fact here is measured against a real local Apache Spark 4.0.1 session
// (examples.py), AQE disabled so the plan reflects Catalyst's own up-front decisions: the parsed
// plan marks every node unresolved with a leading tick; analysis resolves attributes against the
// catalog; the optimizer moves a written filter below a select (predicate pushdown) and folds a
// literal 1+2 into 3 (constant folding); physical planning picks BroadcastHashJoin for a join
// against a small side (no shuffle at all) and falls back to SortMergeJoin with a real shuffle
// Exchange on both sides once broadcasting is disabled by hand. Cost-based reordering from
// ANALYZE TABLE statistics is named and quoted from Spark's own docs, not independently measured.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Write one query, once. Underneath, Spark actually carries four different versions of it
          before anything runs. What changes from the first version to the last?
        </>
      ),
      duration: 4.5,
      fig: 'one query, written once. Four plans underneath. What actually changes?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: unresolved, then resolved',
      body: (
        <>
          Measured directly: the parsed plan marks every node unresolved with a leading tick mark.
          Analysis resolves each one against the catalog, and that tick disappears for good.
        </>
      ),
      duration: 4.8,
      fig: "parsed: 'Filter, unresolved. Analyzed: Filter, resolved, every attribute has an id.",
      Visual: S.RevealParseAnalyze,
    },
    {
      title: 'Predict: the filter, written last',
      body: (
        <>
          The query selects two columns, then filters on one of them. Does the optimizer actually
          run it in that order, or does it move the filter somewhere else first?
        </>
      ),
      duration: 2.8,
      fig: 'written: select, then filter. Does the optimizer keep that order?',
      predict: {
        options: [
          { label: 'It keeps the written order — the optimizer runs operations as given' },
          { label: 'It moves the filter earlier, below the select, closer to the scan', correct: true },
        ],
        explain: (
          <>
            Predicate pushdown is one of Catalyst's standard rules: filtering as early as possible,
            before an unrelated projection, throws away rows sooner rather than later. The written
            order is a convenience for the person writing the query, not a plan to honour.
          </>
        ),
      },
      Visual: S.PredictFilterOrder,
    },
    {
      title: 'Reveal: pushed down, as predicted',
      body: (
        <>
          Measured: the analyzed plan keeps the filter on top, exactly as written. The optimized
          plan moves it below the select instead — closer to the scan, filtering sooner.
        </>
      ),
      duration: 4.8,
      fig: 'analyzed: filter, then select (as written). optimized: select wraps filter now.',
      takeaway: 'Predicate pushdown moves a filter as close to the scan as it can, regardless of the written order.',
      Visual: S.RevealPushdown,
    },
    {
      title: 'Reveal: constant folding, the same pass',
      body: (
        <>
          A second rule, in the same optimization pass: a literal one plus two is folded straight
          into three while planning, so no task ever computes that addition at runtime.
        </>
      ),
      duration: 4.5,
      fig: 'analyzed: (1 + 2) as an expression. optimized: 3, already folded.',
      Visual: S.RevealConstantFold,
    },
    {
      title: 'Predict: a huge table, a tiny one',
      body: (
        <>
          Join a hundred-thousand-row table against a ten-row one. Every wide operation measured
          so far in this chapter has shuffled. Does this join shuffle too?
        </>
      ),
      duration: 2.8,
      fig: 'a huge table joins a tiny one. Shuffle, like every wide op so far?',
      predict: {
        options: [
          { label: 'Yes — a join is a wide dependency, so it shuffles like every other one has' },
          { label: 'No — the tiny side gets copied everywhere instead, and the huge side never shuffles', correct: true },
        ],
        explain: (
          <>
            Below a size threshold, shipping the small side to every task once is far cheaper than
            shuffling the huge side across the network at all. Physical planning picks the strategy
            that actually costs less, not the one that always applies.
          </>
        ),
      },
      Visual: S.PredictSmallJoin,
    },
    {
      title: 'Reveal: broadcast, no shuffle at all',
      body: (
        <>
          Measured: the physical plan picks a BroadcastHashJoin. The tiny side is copied to every
          task; the huge side is read straight off disk, no shuffle Exchange anywhere on it.
        </>
      ),
      duration: 4.8,
      fig: 'BroadcastHashJoin chosen. The huge side: zero shuffle Exchange nodes.',
      takeaway: 'Below a size threshold, broadcasting the small side beats shuffling the large one, and the plan reflects that choice directly.',
      Visual: S.RevealBroadcast,
    },
    {
      title: 'Predict: turn broadcasting off',
      body: (
        <>
          Same two tables, same join, same shape — but disable broadcasting by hand this time.
          Does the chosen strategy change, or does Spark find another way to avoid the shuffle?
        </>
      ),
      duration: 2.8,
      fig: 'same join, broadcasting disabled. Does the chosen strategy change?',
      predict: {
        options: [
          { label: "It finds another way to skip the shuffle — the data hasn't changed" },
          { label: 'It falls back to a real shuffle join, on both sides, since broadcasting was the only shortcut', correct: true },
        ],
        explain: (
          <>
            Nothing else about this join avoids a shuffle once broadcasting is off the table. Both
            sides have to be redistributed by key before they can be matched up and merged.
          </>
        ),
      },
      Visual: S.PredictDisableBroadcast,
    },
    {
      title: 'Reveal: SortMergeJoin, both sides shuffle',
      body: (
        <>
          Measured: with broadcasting disabled, the identical join falls back to a SortMergeJoin —
          a real shuffle Exchange appears on both sides, exactly where there was none before.
        </>
      ),
      duration: 4.8,
      fig: 'broadcast allowed: no shuffle. broadcast disabled: SortMergeJoin, 2 Exchanges.',
      takeaway: 'The same join shape plans two different ways depending only on whether broadcasting is allowed — a genuinely cost-based choice.',
      Visual: S.RevealSortMerge,
    },
    {
      title: 'Recap',
      body: (
        <>
          Parse, then analyse against the catalog, then optimise with rules like pushdown and
          folding, then plan physically by cost — four real stages, all readable directly with
          EXPLAIN FORMATTED, with cost-based reordering unlocked only once real table statistics exist.
        </>
      ),
      duration: 4.8,
      fig: 'parse, analyse, optimise, plan physically — four stages, each one readable.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
