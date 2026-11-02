import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg partitioning docs' own hidden
// partitioning section (partition values produced and tracked by Iceberg itself, from a real
// column, by a transform; queries never need to name the derived column; partition schemes can
// evolve without an expensive migration) and the Iceberg table spec's own partition transforms
// and partition evolution sections (identity, bucket[N], truncate[W], hour; a spec change gets
// a new spec id added to the table's list of specs; reads use the specs recorded in manifest
// files, not the table's current default; multi-argument transforms require source-ids in v3)
// -- and against a real Apache Iceberg table built in this sandbox with the real pyiceberg
// library, whose partition spec is evolved mid-life with the real update_spec() API, with every
// structural and pruning claim read directly off that table's real specs, manifests, and scan
// planning.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The metadata tree already prunes by partition tuple — but only if the table doesn't
          make the query name the partition column itself. That's hidden partitioning.
        </>
      ),
      duration: 4.8,
      fig: 'the tree already prunes by partition tuple -- as long as the query never names the column.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: partitioned by day(event_time) — does a query on event_time itself still prune?',
      body: (
        <>
          A table is partitioned by `day(event_time)`. A query filters on `event_time` directly,
          never mentioning the partition. Does it still get pruned, or does it have to scan
          everything?
        </>
      ),
      duration: 4.8,
      fig: 'partitioned by day(event_time) -- a query filters on event_time itself. still pruned?',
      predict: {
        options: [
          { label: 'It has to scan everything' },
          { label: 'It still prunes correctly', correct: true },
        ],
        explain: (
          <>
            Iceberg derives the partition value from `event_time` itself and tracks that
            relationship — the query never has to know it exists.
          </>
        ),
      },
      Visual: S.PredictFilterOnSourceColumn,
    },
    {
      title: 'Reveal: reproduced for real — a transform derives the partition value, tracked by Iceberg itself',
      body: (
        <>
          Iceberg derives the partition value from a real column by a transform it tracks
          itself — `identity`, `bucket[N]`, `truncate[W]`, `day`, `hour` — so the query never has
          to name the derived column at all.
        </>
      ),
      duration: 4.8,
      fig: 'identity, bucket[N], truncate[W], day, hour -- derived from a real column, tracked by Iceberg.',
      Visual: S.RevealTransformsHidePartitionColumn,
    },
    {
      title: 'Reveal: reproduced for real — a real table’s partition spec evolved mid-life',
      body: (
        <>
          A real table, evolved mid-life: its partition spec changes from `day(ts)` to `hour(ts)`
          plus `bucket(4, id)` — without rewriting a single existing file.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: spec evolves from day(ts) to hour(ts) plus bucket(id), no file rewritten.',
      Visual: S.RevealSpecEvolvedMidLife,
    },
    {
      title: 'Reveal: reproduced for real — the old era’s files stay on disk under the old spec',
      body: (
        <>
          The old era's files are still on disk, still tagged with the old spec id — evolving the
          spec touched zero existing data.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: old-era files still tagged with the old spec, untouched by the evolution.',
      takeaway: 'Evolving a partition spec changes how new data is written, never old data.',
      Visual: S.RevealOldDataUntouched,
    },
    {
      title: 'Predict: a query by id matches a row in the old era — does it still prune to one file?',
      body: (
        <>
          A query asks for one row by `id`, never naming any partition transform. The matching
          row happens to live in the old era, written under the old spec. Does it still prune?
        </>
      ),
      duration: 4.8,
      fig: 'a source-column query matches a row in the old era, under the old spec -- still prunes?',
      predict: {
        options: [
          { label: 'No — the old spec confuses planning' },
          { label: 'Yes — each manifest plans under its own spec', correct: true },
        ],
        explain: (
          <>
            Every manifest records the spec it was written with, and planning reads that spec
            directly from the manifest — not from the table's current default.
          </>
        ),
      },
      Visual: S.PredictOldEraPruning,
    },
    {
      title: 'Reveal: reproduced for real — a source-column query prunes to one file in either era',
      body: (
        <>
          Measured: a source-column query prunes to exactly one file whether the matching row is
          in the old era or the new one — each manifest is planned under the spec it was
          actually written with, not the table's current default.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: 1 file planned in the old era, 1 file planned in the new era.',
      takeaway: 'Each manifest is planned under the spec it was actually written with.',
      Visual: S.RevealBothErasPrune,
    },
    {
      title: 'Reveal: v3 extends this with multi-argument transforms',
      body: (
        <>
          v3 extends this with multi-argument transforms — more than one source column feeding a
          single partition field — named here as the current extension, not built.
        </>
      ),
      duration: 4.8,
      fig: 'v3 adds multi-argument transforms -- more than one source column, one partition field.',
      Visual: S.RevealV3MultiArgument,
    },
    {
      title: 'Reveal: reproduced for real — a full scan reads every row correctly across both eras',
      body: (
        <>
          A full scan across both eras reads every row correctly: the tree doesn't care that half
          its manifests were written under a spec that no longer exists as the table's default.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: a full scan reads every row correctly, across both partition eras.',
      takeaway: "A manifest's own recorded spec outlives that spec's time as the table's default.",
      Visual: S.RevealFullScanBothEras,
    },
    {
      title: 'Recap',
      body: (
        <>
          Iceberg derives the partition value; a query names the column, never the transform. A
          spec evolves mid-life without rewriting a single old file. Each manifest is planned
          under the spec it was written with — a table's history is never rewritten, only
          extended.
        </>
      ),
      duration: 4.8,
      fig: 'hidden partitioning prunes whole files; a single file’s own rows need deletes.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
