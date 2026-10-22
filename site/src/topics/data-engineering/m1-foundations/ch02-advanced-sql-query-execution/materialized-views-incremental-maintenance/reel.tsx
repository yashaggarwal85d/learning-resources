import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: PostgreSQL (the existing "shop" database), same sandbox as prior topics in this chapter.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'The same small change, maintained two different ways',
      body: (
        <>
          Ten new rows land in a three-million-row table. A full refresh of its materialized view barely moves. An incrementally maintained
          version of the same result costs about a hundred and eighty times less.
        </>
      ),
      duration: 4.8,
      fig: 'full refresh: ~994 ms. incremental update: ~6 ms.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a full refresh get cheaper for a smaller change?',
      body: (
        <>
          Ten rows changed out of three million. Does a full refresh of the view that depends on them cost less, because so little of the
          underlying data actually moved?
        </>
      ),
      duration: 2.8,
      fig: 'ten rows changed out of three million — does the refresh get cheaper?',
      predict: {
        options: [
          { label: 'Yes — less changed data means less work to redo' },
          { label: 'No — a full refresh reruns the whole query regardless of change size', correct: true },
        ],
        explain: (
          <>
            No — a full refresh discards everything and reruns the entire defining query from scratch, so its cost tracks the size of the
            whole result, never the size of the change.
          </>
        ),
      },
      Visual: S.PredictFullRefreshScales,
    },
    {
      title: 'Reveal: what REFRESH MATERIALIZED VIEW actually does',
      body: (
        <>
          A refresh discards the view's old contents outright and reruns its defining query from scratch, keeping nothing from before.
        </>
      ),
      duration: 4.4,
      fig: 'old contents discarded; the whole query reruns from scratch',
      Visual: S.RevealWhatRefreshDoes,
    },
    {
      title: "Reveal: this topic's own measured result — full refresh is flat",
      body: (
        <>
          With no change to the underlying table, a full refresh takes about nine hundred seventy four milliseconds. After ten new rows are
          inserted, the identical refresh takes about nine hundred ninety four — essentially the same.
        </>
      ),
      duration: 4.8,
      fig: '~974 ms unchanged, ~994 ms after ten new rows — essentially flat',
      takeaway: "A full refresh costs about the same whether a tiny change happened or none did — it reruns everything regardless.",
      Visual: S.RevealFullRefreshFlat,
    },
    {
      title: 'Predict: how much cheaper should incremental maintenance be?',
      body: (
        <>
          An incrementally maintained version of the same result only touches the rows a change actually affects. For a change this small,
          how much cheaper should that be?
        </>
      ),
      duration: 2.8,
      fig: 'only the affected rows get touched — how much cheaper?',
      predict: {
        options: [
          { label: 'Somewhat cheaper, but still proportional to the table size' },
          { label: 'Dramatically cheaper — roughly proportional to the size of the change itself', correct: true },
        ],
        explain: (
          <>
            Dramatically cheaper — since only the rows a change actually touches get recomputed, the cost tracks the change, not the whole
            table, which is exactly what this topic measures next.
          </>
        ),
      },
      Visual: S.PredictIncrementalCheaper,
    },
    {
      title: "Reveal: this topic's own measured incremental-maintenance result",
      body: (
        <>
          Maintaining the identical result incrementally, for the same ten-row change, takes about six milliseconds — roughly a hundred and
          eighty times less than the full refresh above.
        </>
      ),
      duration: 4.8,
      fig: '~6 ms incremental vs. ~994 ms full refresh — about 180 times cheaper',
      takeaway: 'Incremental maintenance tracks the size of the change itself, not the size of the whole table.',
      Visual: S.RevealIncrementalResult,
    },
    {
      title: 'Predict: does PostgreSQL offer a way to refresh without blocking readers?',
      body: (
        <>
          A plain refresh locks out readers while it runs. Does PostgreSQL offer any way to update a materialized view without blocking the
          queries that read from it?
        </>
      ),
      duration: 2.8,
      fig: 'a plain refresh locks out readers — is there another way?',
      predict: {
        options: [
          { label: 'No — any refresh has to block reads while it replaces the data' },
          { label: 'Yes — a concurrent mode exists specifically to avoid blocking readers', correct: true },
        ],
        explain: (
          <>
            Yes — a concurrent mode lets a refresh run alongside ordinary reads, at the cost of a real requirement this topic names next.
          </>
        ),
      },
      Visual: S.PredictConcurrentExists,
    },
    {
      title: 'Reveal: REFRESH MATERIALIZED VIEW CONCURRENTLY',
      body: (
        <>
          A reader querying the view while a plain refresh runs waits most of a second, blocked. The identical query, issued while a
          concurrent refresh runs instead, returns in a few milliseconds — never blocked at all.
        </>
      ),
      duration: 4.8,
      fig: '~861 ms blocked (plain) vs. ~5 ms, never blocked (concurrently)',
      takeaway: 'CONCURRENTLY lets a refresh run alongside ordinary reads instead of locking them out.',
      Visual: S.RevealConcurrentlyResult,
    },
    {
      title: 'Reveal: the requirement CONCURRENTLY comes with',
      body: (
        <>
          This mode only works if the view already has a UNIQUE index covering every row — no expression index, no WHERE clause allowed.
        </>
      ),
      duration: 4.4,
      fig: 'requires: a UNIQUE index, no expression, no WHERE clause',
      Visual: S.RevealConcurrentlyRequirement,
    },
    {
      title: 'Predict: does a floating-point sum still maintain incrementally?',
      body: (
        <>
          A warehouse materialized view's defining query sums a floating-point column. Does that aggregate still maintain incrementally, the
          same way an ordinary sum would?
        </>
      ),
      duration: 2.8,
      fig: 'SUM over a floating-point column — still incremental?',
      predict: {
        options: [
          { label: 'Yes — SUM behaves the same regardless of the column type' },
          { label: 'Not reliably — floating-point sums can force a full recompute instead', correct: true },
        ],
        explain: (
          <>
            Not reliably — floating-point addition isn't exactly associative, so an incrementally updated running sum can drift from a
            freshly recomputed one, which is exactly why this gets singled out in the documentation.
          </>
        ),
      },
      Visual: S.PredictFloatSum,
    },
    {
      title: 'Reveal: floating-point aggregates and the DECIMAL fix',
      body: (
        <>
          Summing or averaging a floating-point column can produce results that depend on the order rows were added, forcing a fallback to
          full recompute. Casting that column to a fixed-precision numeric type keeps incremental refresh working instead.
        </>
      ),
      duration: 4.8,
      fig: 'floating-point SUM/AVG: can force full recompute. cast to a fixed type instead.',
      Visual: S.RevealFloatFix,
    },
    {
      title: 'Reveal: Snowflake dynamic tables and Databricks materialized views choose by cost',
      body: (
        <>
          Both a cloud warehouse's dynamic tables and its materialized views decide automatically between an incremental and a full refresh,
          picking whichever is actually cheaper for a given query shape.
        </>
      ),
      duration: 4.4,
      fig: 'incremental or full — chosen automatically, by estimated cost',
      Visual: S.RevealWarehouseChoosesByCost,
    },
    {
      title: 'Reveal: a staleness bound is a target, not a guarantee',
      body: (
        <>
          A target lag tells the engine how fresh the data should stay — but that lag can still be exceeded whenever a refresh itself takes
          longer than expected.
        </>
      ),
      duration: 4.4,
      fig: 'target lag: a goal the engine tries to keep, not a strict promise',
      Visual: S.RevealStalenessTargetNotGuarantee,
    },
    {
      title: 'Recap',
      body: (
        <>
          A full refresh costs the same regardless of how little changed. Incremental maintenance costs roughly what the change itself costs.
          CONCURRENTLY trades a UNIQUE index requirement for never blocking readers. And a staleness bound is a target, not a promise.
        </>
      ),
      duration: 4.8,
      fig: 'full refresh is flat → incremental tracks the change → CONCURRENTLY unblocks reads → lag is a target',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A materialized view is being refreshed with CONCURRENTLY right now, and a dashboard issues an ordinary SELECT against it at that
          exact moment. Does that SELECT have to wait for the refresh to finish?
        </>
      ),
      duration: 2.8,
      fig: 'a SELECT lands mid-refresh, which is running CONCURRENTLY — does it wait?',
      predict: {
        options: [
          { label: 'Yes — any refresh in progress blocks reads until it completes' },
          { label: 'No — CONCURRENTLY is specifically built so reads are never blocked', correct: true },
        ],
        explain: (
          <>
            No — that's the entire point of CONCURRENTLY, confirmed directly by this topic's own measurement: the same kind of read
            finished in a few milliseconds while a concurrent refresh was still running.
          </>
        ),
      },
      Visual: S.ProveConcurrentSelectBlocks,
    },
  ],
};

export default reel;
