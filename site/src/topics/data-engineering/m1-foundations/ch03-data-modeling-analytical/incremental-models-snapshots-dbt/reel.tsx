import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real hands-on lab (lab/shop_dbt/, examples.py), extending the previous topic's own dbt
// project: four incremental strategies, a missed late-arriving correction, a three-stage
// schema-change demonstration, and timestamp vs check snapshots, all actually run against a
// local DuckDB target. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: 'Every model so far assumed a full rebuild was fine',
      body: (
        <>
          Every model built in the last topic dropped its own table and rebuilt it completely,
          every single run. What happens once a fact table has far too many rows for that?
        </>
      ),
      duration: 4.8,
      fig: 'a full rebuild, every run — what happens once that table is far too large for it?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: what makes a run incremental, quoted directly',
      body: (
        <>
          A macro that returns true only under specific conditions — that single condition is
          what lets a run touch less than the whole table.
        </>
      ),
      duration: 4.8,
      fig: 'a macro, true under specific conditions — that condition is the whole mechanism',
      Visual: S.RevealIsIncrementalQuote,
    },
    {
      title: 'Predict: does a wide lookback window catch a correction dated in the past?',
      body: (
        <>
          A correction to an old row arrives, dated as of when it actually happened rather than
          when it arrived. Does widening the lookback window catch it safely?
        </>
      ),
      duration: 2.8,
      fig: 'an old-dated correction arrives late — does a wider lookback window catch it?',
      predict: {
        options: [
          { label: 'Yes — widen the lookback window enough and it always gets caught' },
          { label: "No — a correction dated in the past can outrun any lookback window", correct: true },
        ],
        explain: (
          <>
            No. A lookback window only reaches back a fixed distance from the table's current
            high-water mark; a correction dated further back than that distance is missed no
            matter how wide the window is set.
          </>
        ),
      },
      Visual: S.PredictLookback,
    },
    {
      title: 'Reveal: the lab — the strategies, run for real',
      body: (
        <>
          Four real materializations of the same fact table: appending blindly, deleting and
          reinserting by key, merging by key, and splitting by time into batches.
        </>
      ),
      duration: 4.8,
      fig: 'the same fact table, four real strategies — appended, deleted and reinserted, merged, batched',
      Visual: S.RevealStrategies,
    },
    {
      title: "Reveal: the lab — the adapter doesn't support every named strategy",
      body: (
        <>
          A real, documented strategy built specifically for partitioned warehouses — and this
          project's own local database genuinely cannot run it at all.
        </>
      ),
      duration: 4.8,
      fig: "one named strategy, built for partitioned warehouses — this project's own database can't run it",
      takeaway: "Choosing a strategy also means checking it against what the adapter running it actually supports.",
      Visual: S.RevealAdapterGap,
    },
    {
      title: 'Reveal: the lab — a missed correction, confirmed, then fixed',
      body: (
        <>
          A real correction to an old row, with an old timestamp, built and run against this
          project — missed by every lookback-based strategy, caught only by a full rebuild.
        </>
      ),
      duration: 4.8,
      fig: 'an old-dated correction, missed by every lookback strategy — caught only by a full rebuild',
      takeaway: "A lookback window only helps a recent correction; an old-dated one needs a full rebuild, not a wider window.",
      Visual: S.RevealMissedCorrection,
    },
    {
      title: 'Predict: does adding a column to a model just work on the next run?',
      body: (
        <>
          A new column gets added to a model's own select statement. Does the very next
          incremental run just pick it up correctly, with no further action needed?
        </>
      ),
      duration: 2.8,
      fig: 'a new column, added to the select — does the next run just pick it up?',
      predict: {
        options: [
          { label: "Yes — dbt detects the new column and handles it automatically" },
          { label: "No — by default, the new column is silently dropped, with no error at all", correct: true },
        ],
        explain: (
          <>
            No. The default behavior neither refuses nor warns — it silently ignores the
            change, and the new column never reaches the actual destination table at all.
          </>
        ),
      },
      Visual: S.PredictSchemaChange,
    },
    {
      title: 'Reveal: the lab — three real stages of a schema change',
      body: (
        <>
          Ignoring it silently drops the new column entirely. Appending it adds the column but
          leaves every old row empty. Only a full rebuild backfills every row correctly.
        </>
      ),
      duration: 4.8,
      fig: 'ignore drops it silently; append adds it but leaves old rows empty; only a full rebuild backfills everything',
      takeaway: '"Ignore" does not mean "refuse" — it means silent, and silent is exactly the trap.',
      Visual: S.RevealSchemaStages,
    },
    {
      title: 'Reveal: snapshots as SCD two, quoted directly; timestamp vs check, run for real',
      body: (
        <>
          A real customer's own region change, snapshotted two different ways — one strategy
          stamps the data's own change time, the other stamps whenever the snapshot itself ran.
        </>
      ),
      duration: 4.8,
      fig: "the same real change, two snapshot strategies — one stamps the data's time, one stamps the run's own time",
      Visual: S.RevealSnapshotStrategies,
    },
    {
      title: "Reveal: why the timestamp strategy is preferred, quoted directly; tied to this chapter's own SCD mechanism",
      body: (
        <>
          Those exact valid-from and valid-to columns are the same effective and expiry columns
          an earlier topic in this chapter built entirely by hand.
        </>
      ),
      duration: 4.8,
      fig: "valid-from, valid-to — the exact columns an earlier topic in this chapter built by hand",
      takeaway: 'A snapshot is a practical, automatic version of exactly the slowly-changing mechanism this chapter already built once by hand.',
      Visual: S.RevealTimestampPreferred,
    },
    {
      title: 'Recap',
      body: (
        <>
          A lookback window only catches a recent correction, never an old-dated one. The
          default schema-change behavior is silent, not safe. A snapshot's own strategy decides
          whether its valid-from time means something real or just means "whenever this ran."
        </>
      ),
      duration: 4.8,
      fig: 'lookback catches recent corrections only; schema change is silent by default; a snapshot strategy decides what valid-from means',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A fact table is append-only by nature, but every so often receives a correction to a
          row that is months old. Which strategy, and what extra care, actually handles both?
        </>
      ),
      duration: 2.8,
      fig: 'append-only by nature, but occasional months-old corrections — which strategy actually handles both?',
      predict: {
        options: [
          { label: 'Plain append is enough — occasional corrections are rare enough to ignore' },
          { label: 'A merge or delete+insert by key, plus a scheduled full-refresh for old corrections', correct: true },
        ],
        explain: (
          <>
            Append alone can only add rows, never correct one already there. A keyed strategy
            handles recent corrections through its own lookback, but an old-dated correction
            still needs a deliberate, scheduled full-refresh to ever actually land.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
