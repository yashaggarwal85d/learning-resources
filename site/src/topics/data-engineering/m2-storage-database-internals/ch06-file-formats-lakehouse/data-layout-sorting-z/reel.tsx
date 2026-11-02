import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Delta's own liquid clustering docs (clustering is
// incremental -- data is only rewritten as necessary; already-clustered files with different
// clustering columns are not rewritten; OPTIMIZE FULL reclusters everything and can take hours),
// the Apache Iceberg table spec's own Sorting section (a sort order is an id plus an ordered list
// of sort fields; order id 0 is reserved for unsorted; writers aren't required to sort on write if
// prohibitively expensive), Databricks' own data-skipping docs (per-file min/max statistics used
// to skip files; Z-ordering colocates related information so that co-locality can be used), and
// Apache Hudi's own clustering docs (clustering stitches small files and clusters by sort key;
// file groups are sorted by the specified columns while meeting target file sizes; clustering
// supports incremental scheduling) -- and against a real 256-row, two-column dataset laid out
// three real ways, real row-group bounds computed directly, a real two-column predicate measured
// against each layout, and a real incremental-versus-full reclustering measured by rows rewritten.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic eighteen was about what small files cost, and what a real bin-pack compaction buys
          back. File size is only half of what makes a statistic useful for pruning. This topic is
          the other half: are the rows inside each file actually laid out so a statistic can prune
          anything at all?
        </>
      ),
      duration: 4.8,
      fig: 'last topic was file size -- this topic is the other half: are the rows inside laid out to prune?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: a table is sorted by column A only — does that help a predicate filtering on both A and B?',
      body: (
        <>
          A table's files are sorted by column A only. A query filters on both column A and
          column B at once. Does the existing sort on A help that two-column predicate prune
          files fully, or only partly?
        </>
      ),
      duration: 4.8,
      fig: 'sorted by A only -- does that help a predicate filtering on both A and B, fully or partly?',
      predict: {
        options: [
          { label: 'Fully — the sort helps on both columns equally' },
          { label: 'Only partly — it helps on A, not on B', correct: true },
        ],
        explain: (
          <>
            A single linear sort order has one leading column. It prunes well on that column, but
            rows with wildly different B values still end up sharing the same file.
          </>
        ),
      },
      Visual: S.PredictSortOneColumnHelpsTwo,
    },
    {
      title: 'Reveal: reproduced for real — the same 256 rows, three different physical orders',
      body: (
        <>
          The identical real dataset — every (A, B) pair for A and B in 0 through 15 — laid out
          three real ways: arrival order, a linear sort by (A, B), and a real Z-order. Same 256
          rows every time, genuinely different order on disk.
        </>
      ),
      duration: 4.8,
      fig: 'the same 256 rows, laid out three real ways: arrival order, linear sort, Z-order.',
      Visual: S.RevealThreeLayoutsSameRows,
    },
    {
      title: "Reveal: reproduced for real — real row-group bounds, computed directly",
      body: (
        <>
          Sixteen real row groups per layout, each one's minimum and maximum A and B computed
          directly from its real rows. The linear sort's own groups line up exactly with a single
          A-value, spanning the full range of B every time.
        </>
      ),
      duration: 4.8,
      fig: 'real row-group bounds, computed directly -- a linear sort aligns groups to one A value.',
      Visual: S.RevealRowGroupBoundsComputed,
    },
    {
      title: 'Reveal: reproduced for real — the identical two-column predicate, measured against each layout',
      body: (
        <>
          The same predicate on A and B, run against all three layouts: arrival order needs all
          16 groups. The linear sort prunes to 4, on A alone. A real Z-order prunes to a single
          group — pruning on both columns at once.
        </>
      ),
      duration: 4.8,
      fig: 'the same predicate -- 16 groups needed, then 4, then 1, measured for real.',
      takeaway: 'A real Z-order gives a multi-column predicate real pruning on every column at once, not just the leading one.',
      Visual: S.RevealPredicatePruningMeasured,
    },
    {
      title: "Predict: does liquid clustering rewrite the whole table every time new data arrives?",
      body: (
        <>
          New data keeps arriving into an already-clustered table. When that table gets
          reclustered, does the operation rewrite the whole table every time, or only what's
          needed?
        </>
      ),
      duration: 4.8,
      fig: 'new data arrives into an already-clustered table -- rewrite everything, or only what changed?',
      predict: {
        options: [
          { label: "Always — reclustering rewrites the entire table" },
          { label: "Only what's needed — existing clustered data stays", correct: true },
        ],
        explain: (
          <>
            Delta's own docs say this directly: already-clustered files are not rewritten unless
            the clustering columns themselves change.
          </>
        ),
      },
      Visual: S.PredictLiquidClusteringRewritesEverything,
    },
    {
      title: "Reveal: Delta's, Iceberg's, and Hudi's own words — three formats, the same one idea",
      body: (
        <>
          Delta calls it liquid clustering. Iceberg calls it a sort order. Hudi calls it
          clustering. All three exist for the same reason: making the physical layout of rows
          match the columns a query actually filters on.
        </>
      ),
      duration: 4.8,
      fig: 'three formats, three names, one idea: lay out rows by what a query filters on.',
      takeaway: 'Liquid clustering, sort orders, and clustering are three formats’ names for the same one mechanism.',
      Visual: S.RevealThreeFormatsSameIdea,
    },
    {
      title: 'Reveal: reproduced for real — incremental versus full reclustering, measured by rows rewritten',
      body: (
        <>
          Sixteen new rows, landing entirely in one already-clustered group: an incremental
          recluster rewrites only that group's rows plus the new ones. A full recluster rewrites
          every row in the table, measured directly.
        </>
      ),
      duration: 4.8,
      fig: 'new rows land in one group -- incremental rewrites just that group, full rewrites everything.',
      takeaway: 'Incremental reclustering only rewrites the rows that actually need it; a full recluster rewrites everything.',
      Visual: S.RevealIncrementalVsFullReclustering,
    },
    {
      title: 'Recap',
      body: (
        <>
          A linear sort order only prunes on its leading column. A real Z-order gives a genuine
          multi-column predicate real pruning on every column at once. And reclustering an
          already-laid-out table can touch only what changed, or rewrite everything.
        </>
      ),
      duration: 4.8,
      fig: 'layout decides whether a statistic actually prunes a multi-column query -- measured, not assumed.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
