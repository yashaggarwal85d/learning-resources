import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own column-metrics
// truncation rule and table/partition statistics sections, the Puffin file format spec's own
// Magic/Blob/Footer structure and apache-datasketches-theta-v1 blob type, and Trino's own
// documentation on cost-based join enumeration -- and against real pyiceberg (0.12.0) behavior
// in this sandbox: a real manifest's truncated string bounds, a real byte-exact Puffin file
// holding a real Theta sketch, registered through pyiceberg's own public update_statistics() API
// and read back independently of pyiceberg, checked against the table's true distinct count.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A manifest's column metrics were already read straight off the file, as if they were
          exact — lower bound, upper bound, counts. They aren't always exact.
        </>
      ),
      duration: 4.8,
      fig: "a manifest's column metrics were already read, straight off the file, as if they were exact.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: what happens to a bound when the real value is longer than Iceberg stores?',
      body: (
        <>
          A real column value is longer than the bound Iceberg is willing to store for it. Is it
          stored in full, however long, or truncated — meaning the bound stops being exact?
        </>
      ),
      duration: 4.8,
      fig: 'a real column value is longer than iceberg stores in a bound. what happens to the bound?',
      predict: {
        options: [
          { label: 'Stored in full, however long it is' },
          { label: 'Truncated — the bound is no longer exact', correct: true },
        ],
        explain: (
          <>
            Iceberg caps how much of a string or binary value it stores in a manifest bound. Past
            that cap, the bound is a safe range, not the literal value.
          </>
        ),
      },
      Visual: S.PredictBoundsTruncated,
    },
    {
      title: 'Reveal: truncated, for real',
      body: (
        <>
          Truncated, for real: a real pyiceberg-written manifest stores this table's longer
          column values — one of them 200 bytes long — as 16-byte bounds, the upper bound's
          final byte bumped by one so it still sorts above the real value.
        </>
      ),
      duration: 4.8,
      fig: "truncated, for real: a 200-byte value's bound is stored as 16 bytes, the upper bound's last byte bumped.",
      Visual: S.RevealBoundsTruncatedForReal,
    },
    {
      title: 'Reveal: the spec says it directly',
      body: (
        <>
          The spec says it directly: bounds for string and binary columns are never tight,
          because they may be truncated when written.
        </>
      ),
      duration: 4.8,
      fig: 'the spec says it directly: string and binary bounds are never tight, because they may be truncated.',
      takeaway: "A manifest's string or binary bound is a safe range, not the real minimum or maximum.",
      Visual: S.RevealSpecConfirmsTruncation,
    },
    {
      title: 'Predict: where does a table-wide distinct count come from?',
      body: (
        <>
          Per-file stats are this limited, scattered across manifests. How does a query planner
          actually get a real distinct-count estimate for a whole table?
        </>
      ),
      duration: 4.8,
      fig: 'per-file stats are this limited. how does a planner get a real table-wide distinct count?',
      predict: {
        options: [
          { label: 'It reads every file and counts exactly' },
          { label: 'A separate sidecar file holds a pre-built sketch', correct: true },
        ],
        explain: (
          <>
            Table-level statistics live in their own Puffin sidecar file — not computed on the
            fly from every manifest, built once and read by a planner.
          </>
        ),
      },
      Visual: S.PredictTableLevelNdv,
    },
    {
      title: 'Reveal: a real Puffin file, byte-exact to spec, holding a real sketch',
      body: (
        <>
          A real Puffin file is built here, byte-exact to the spec's Magic/Blob/Footer structure,
          holding this script's own real Theta sketch — then registered on the table through
          pyiceberg's own public statistics API.
        </>
      ),
      duration: 4.8,
      fig: 'a real Puffin file, byte-exact to spec, holding a real sketch -- registered on the table for real.',
      takeaway: "Table-level statistics live in their own sidecar file, not spread across every manifest.",
      Visual: S.RevealPuffinSketchBuilt,
    },
    {
      title: "Reveal: read back independently, checked against the truth",
      body: (
        <>
          Read back independently: the raw Puffin bytes parsed by hand, since pyiceberg has no
          public Puffin reader, and the sketch's distinct-count estimate checked against this
          table's real distinct count — close, not exact.
        </>
      ),
      duration: 4.8,
      fig: "read back independently from raw bytes, and checked against the table's real distinct count.",
      Visual: S.RevealReadBackAgainstTruth,
    },
    {
      title: 'Reveal: partition statistics files are the same idea, one level down',
      body: (
        <>
          Partition statistics files are the same idea, one level down — named from the spec
          here, not built: the partition-level equivalent of a table statistics file, equally
          optional for a reader.
        </>
      ),
      duration: 4.8,
      fig: 'partition statistics files are the same idea, one level down -- named here, not built.',
      Visual: S.RevealPartitionStatsNamed,
    },
    {
      title: 'Reveal: a cost-based optimizer leans on exactly this',
      body: (
        <>
          A cost-based optimizer leans on exactly this: Trino's own join enumeration uses
          connector-supplied statistics to pick a join order, falling back to a weaker strategy —
          or risking a genuinely bad plan — when those statistics are missing or wrong.
        </>
      ),
      duration: 4.8,
      fig: 'a cost-based optimizer leans on exactly this: missing or wrong stats can pick the wrong join plan.',
      takeaway: "A stale or missing sketch doesn't just mislead a human reading it — it can pick the wrong join plan.",
      Visual: S.RevealOptimizerDependsOnIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Per-file column metrics are already in every manifest, but truncated for string and
          binary columns. A real Puffin sidecar file carries whole-table statistics instead,
          built and verified here. Partition statistics are the same idea per partition, and a
          cost-based optimizer's join plan depends on all of it being present and current.
        </>
      ),
      duration: 4.8,
      fig: 'snapshots are already addressable by id; the next topic is giving some of them names.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
