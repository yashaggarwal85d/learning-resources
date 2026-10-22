import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: PostgreSQL (the existing "shop" database), same sandbox as prior topics in this chapter.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Same query, same data, fifteen buffers instead of ten thousand',
      body: (
        <>
          The same equality filter, against the same table: without any index at all, over ten thousand buffers get touched. With one tiny
          summary index, fifteen do.
        </>
      ),
      duration: 4.8,
      fig: '15 buffers (summary index) vs. 10,811 buffers (no index)',
      Visual: S.Hook,
    },
    {
      title: 'Predict: could an index with nothing per row still work?',
      body: (
        <>
          A B-tree stores one entry for every single row. Could an index that stores nothing at all per row still help answer a query?
        </>
      ),
      duration: 2.4,
      fig: 'a B-tree: one entry per row. something smaller — possible?',
      predict: {
        options: [
          { label: 'No — an index must have an entry for every row it covers' },
          { label: 'Yes — a much coarser summary can still rule out most of the table', correct: true },
          { label: 'Only if the column has very few distinct values' },
        ],
        explain: (
          <>
            Yes — a summary that covers many rows at once can still prove an entire group of rows cannot match, which is exactly the
            mechanism this topic measures directly.
          </>
        ),
      },
      Visual: S.PredictNothingPerRow,
    },
    {
      title: 'Reveal: what a BRIN index actually stores',
      body: (
        <>
          A block range index keeps one summary per group of physically adjacent pages — for an ordered type, the minimum and maximum value
          seen anywhere in that whole range.
        </>
      ),
      duration: 4.4,
      fig: 'one summary per block range, not one entry per row',
      Visual: S.RevealWhatBrinStores,
    },
    {
      title: "Reveal: this topic's own measured size contrast",
      body: (
        <>
          A BRIN index on this column comes out to twenty four kilobytes. A B-tree over the identical column: about fourteen megabytes — roughly
          six hundred times larger, for the exact same data.
        </>
      ),
      duration: 4.8,
      fig: '24 KB (BRIN) vs. 14 MB (B-tree), same column, same data',
      takeaway: 'A block-range summary needs a tiny fraction of the space a per-row index needs, for the same column.',
      Visual: S.RevealSizeContrast,
    },
    {
      title: 'Predict: does this trick work for any column at all?',
      body: (
        <>
          A summary this coarse only rules out a whole range at once. Does that work no matter how a column's values happen to sit inside the
          table, or does something about the data have to be true first?
        </>
      ),
      duration: 2.8,
      fig: 'a coarse summary — does it need anything true about the data?',
      predict: {
        options: [
          { label: 'It works for any column, regardless of how the data sits in the table' },
          { label: 'It only helps when a range genuinely narrows down the values inside it', correct: true },
        ],
        explain: (
          <>
            It only helps when nearby rows actually tend to share nearby values — a requirement this topic measures directly, on both
            sides.
          </>
        ),
      },
      Visual: S.PredictAnyColumn,
    },
    {
      title: 'Reveal: the physical-correlation requirement',
      body: (
        <>
          A block range's own summary is only useful if that range's rows are genuinely clustered together by value — well-correlated with
          where they physically sit in the table.
        </>
      ),
      duration: 4.4,
      fig: "well-correlated with physical position — or the summary tells you nothing",
      Visual: S.RevealCorrelationRequirement,
    },
    {
      title: "Reveal: this topic's own measured correlated-column contrast",
      body: (
        <>
          On a column that is well-correlated with row position, the same equality filter drops to fifteen buffers and well under a
          millisecond — roughly eight hundred times faster than scanning with no index at all.
        </>
      ),
      duration: 4.8,
      fig: '15 buffers, well under one ms — correlated column',
      takeaway: 'On a well-correlated column, a block-range summary rules out almost the entire table before anything is read.',
      Visual: S.RevealCorrelatedResult,
    },
    {
      title: 'Predict: does it still help on a scattered column?',
      body: (
        <>
          Take the exact same kind of index, on a column whose values are scattered randomly across the table instead. Does it still help at
          all?
        </>
      ),
      duration: 2.8,
      fig: 'values scattered randomly across the table — still helpful?',
      predict: {
        options: [
          { label: 'Yes — a summary always rules out some rows, correlated or not' },
          { label: 'No — a scattered column leaves almost every range containing everything', correct: true },
        ],
        explain: (
          <>
            No — when values are scattered, almost every block range ends up containing the full spread of values, so the summary cannot
            rule much of anything out.
          </>
        ),
      },
      Visual: S.PredictScatteredColumn,
    },
    {
      title: "Reveal: this topic's own measured uncorrelated-column result",
      body: (
        <>
          On a scattered column, the same kind of index touches essentially the whole table — about the same buffer count as no index at
          all, and slightly slower once the extra recheck work is counted.
        </>
      ),
      duration: 4.8,
      fig: 'essentially the whole table touched — no better than no index',
      Visual: S.RevealUncorrelatedResult,
    },
    {
      title: "Predict: what does BRIN have to do before trusting a range's rows?",
      body: (
        <>
          A range's own summary can be consistent with a filter without every row inside that range actually matching it. What has to happen
          before those rows can be trusted as real matches?
        </>
      ),
      duration: 2.8,
      fig: 'the summary matches the range — are the rows inside it trusted outright?',
      predict: {
        options: [
          { label: 'Nothing — a matching summary means every row in the range matches' },
          { label: 'Every row in the range gets rechecked before being trusted', correct: true },
        ],
        explain: (
          <>
            Every row gets rechecked — the summary only proves a range might contain a match, never that every row inside it actually does.
          </>
        ),
      },
      Visual: S.PredictTrustRange,
    },
    {
      title: "Reveal: lossy — rechecking every row in a matching range",
      body: (
        <>
          A matching range returns every one of its rows as a candidate, and the executor rechecks each one against the real filter,
          discarding whatever doesn't actually match — this index is lossy by design.
        </>
      ),
      duration: 4.4,
      fig: 'every row in a matching range: rechecked, then kept or discarded',
      takeaway: 'A block-range summary only narrows down candidates; the executor still has to recheck every one it returns.',
      Visual: S.RevealLossyRecheck,
    },
    {
      title: 'Reveal: the same idea restated — Parquet statistics',
      body: (
        <>
          A Parquet file keeps the same kind of summary per row group — a minimum and maximum value per chunk, read before a single row is
          ever decoded.
        </>
      ),
      duration: 4.4,
      fig: 'Parquet row groups: min/max per chunk, read before decoding',
      Visual: S.RevealParquetStats,
    },
    {
      title: "Reveal: Snowflake's micro-partition metadata",
      body: (
        <>
          A Snowflake micro-partition keeps the range of values for every column inside it, and prunes a whole micro-partition exactly the
          way a block range gets pruned here.
        </>
      ),
      duration: 4.4,
      fig: "one column's value range, per micro-partition — same principle",
      Visual: S.RevealSnowflakeMicropartitions,
    },
    {
      title: 'Recap',
      body: (
        <>
          A block-range summary is tiny compared to a per-row index. It only helps when a column is genuinely correlated with physical row
          order. And even then, the executor still rechecks every row a matching range returns.
        </>
      ),
      duration: 4.8,
      fig: 'tiny summary → needs correlation → still rechecks every candidate',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table has five hundred block ranges. Its rows are loaded in strict date order, and a query filters on exactly one date, which
          appears in only one of those ranges. How many ranges should actually get rechecked?
        </>
      ),
      duration: 2.8,
      fig: '500 block ranges, one date, strictly correlated — how many rechecked?',
      predict: {
        options: [
          { label: 'All five hundred — every range still has to be checked' },
          { label: 'Just one — the rest are ruled out by their own summary', correct: true },
        ],
        explain: (
          <>
            Just one — with the data this strictly correlated, only the single block range whose minimum and maximum actually span that
            date needs any rechecking at all.
          </>
        ),
      },
      Visual: S.ProveBlockRangesScanned,
    },
  ],
};

export default reel;
