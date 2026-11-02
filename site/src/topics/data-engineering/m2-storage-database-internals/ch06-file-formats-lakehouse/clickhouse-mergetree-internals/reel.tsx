import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every architectural claim here is a word-for-word quote from ClickHouse's own current
// documentation (SOURCES.md). Every numeric result (parts before/after merge, granules read,
// aggregate values, row counts before/after delete) is chdb's own real, executed output -- chdb
// embeds real ClickHouse directly in this sandbox, no Docker daemon or server process involved.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Trino owns no storage of its own -- every byte it reads belongs to someone else's table
          format. This topic answers the opposite question: what if the engine owned the storage
          directly? ClickHouse's own MergeTree.
        </>
      ),
      duration: 4.8,
      fig: 'trino owns no storage of its own. what if the engine owned it directly? clickhouse.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: parts, or one growing file?',
      body: (
        <>
          Two separate inserts land on the same MergeTree table. Does ClickHouse rewrite one
          growing file, or create two separate files?
        </>
      ),
      duration: 4.8,
      fig: 'two separate inserts land on a table. one growing file, or two separate files?',
      predict: {
        options: [
          { label: 'One growing file' },
          { label: 'Two separate files', correct: true },
        ],
        explain: (
          <>
            ClickHouse's own docs: inserts create parts merged by a background process -- each
            insert is its own immutable part until something merges it.
          </>
        ),
      },
      Visual: S.PredictPartsOrRewrite,
    },
    {
      title: 'Reveal: two immutable parts, for real',
      body: (
        <>
          Two separate, immutable parts, confirmed for real against a live embedded ClickHouse. A
          real merge, run on purpose, collapses them to one part -- without changing the row
          count at all.
        </>
      ),
      duration: 4.8,
      fig: 'two separate, immutable parts, for real. a real merge collapses them to one, same row count.',
      Visual: S.RevealImmutableParts,
    },
    {
      title: 'Reveal: the sparse primary index, for real',
      body: (
        <>
          An hour-wide time range over two hundred thousand real rows reads just one of
          twenty-four granules -- a real execution trace, not a description of how the index
          should behave.
        </>
      ),
      duration: 4.8,
      fig: 'an hour-wide range over two hundred thousand rows reads one of twenty-four granules, for real.',
      takeaway: 'A real query trace reads one of twenty-four granules for an hour-wide range -- the sparse index, proven, not assumed.',
      Visual: S.RevealSparsePrimaryIndex,
    },
    {
      title: "Predict: does the non-sorted column get scanned?",
      body: (
        <>
          A filter lands on a column that isn't the sort key at all. Does ClickHouse scan every
          row, or can something still skip most of the data?
        </>
      ),
      duration: 4.8,
      fig: "a filter on a column that isn't the sort key. scan everything, or still skip most of it?",
      predict: {
        options: [
          { label: 'It scans everything' },
          { label: 'Most of it still gets skipped', correct: true },
        ],
        explain: (
          <>
            A separate, explicit data-skipping index can prune granules on any column -- the sort
            key isn't the only pruning mechanism MergeTree has.
          </>
        ),
      },
      Visual: S.PredictNonSortedColumn,
    },
    {
      title: 'Reveal: a real minmax skip index',
      body: (
        <>
          A real minmax index, added on that non-sorted column, still prunes most granules for
          real -- a second, independent skipping mechanism the sort key never provides on its
          own.
        </>
      ),
      duration: 4.8,
      fig: "a real minmax index still prunes most granules, on a column the sort order never touches.",
      takeaway: 'A minmax index prunes most granules on a column the sort key never covers -- a second real skip mechanism.',
      Visual: S.RevealMinmaxSkipIndex,
    },
    {
      title: 'Reveal: a materialized view, firing as an insert trigger',
      body: (
        <>
          Inserting into the source table, with no query run against it at all, updates a real
          aggregate target automatically -- ClickHouse's own docs: materialized views are
          implemented more like insert triggers.
        </>
      ),
      duration: 4.8,
      fig: 'a materialized view fires as a real insert trigger -- no query needed against the source.',
      Visual: S.RevealMaterializedView,
    },
    {
      title: 'Reveal: ReplacingMergeTree, before the merge',
      body: (
        <>
          Two versions of the same row both stay visible, for real, until a real merge finally
          collapses them down to the latest one -- deduplication only happens during a merge,
          by ClickHouse's own docs.
        </>
      ),
      duration: 4.8,
      fig: 'two versions of one row both stay visible until a real merge collapses them to the latest.',
      Visual: S.RevealReplacingMergeTree,
    },
    {
      title: 'Reveal: a real lightweight delete',
      body: (
        <>
          A real lightweight delete drops the queryable row count immediately -- by marking rows
          deleted, not by rewriting the table on the spot. The physical rewrite waits for a
          merge, by ClickHouse's own docs.
        </>
      ),
      duration: 4.8,
      fig: 'a real lightweight delete drops the row count immediately, by marking rows, not rewriting the table.',
      takeaway: "A lightweight delete marks rows and drops the count right away -- the physical rewrite waits for a real merge.",
      Visual: S.RevealLightweightDelete,
    },
    {
      title: 'Recap',
      body: (
        <>
          A real engine, owning its own storage directly: immutable parts, two real skipping
          mechanisms, an insert-triggered view, real merge semantics throughout.
        </>
      ),
      duration: 4.8,
      fig: 'a real engine owning its own storage: parts, two skip mechanisms, an insert trigger, real merges. next: duckdb.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
