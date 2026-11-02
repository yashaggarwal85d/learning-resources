import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every architectural claim here is a word-for-word quote from DuckDB's own current
// documentation (SOURCES.md). Every numeric result (the parallelism speedup, spill files,
// DataFrame sums, Iceberg/Delta row counts, DuckLake snapshot counts) is this sandbox's own
// real, executed output against DuckDB 2.0.0 -- no Docker daemon, no server process involved.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A dedicated server process, however fast, is still a second system to run and operate.
          This topic shows the opposite extreme: an engine with no server process at all.
          DuckDB.
        </>
      ),
      duration: 4.8,
      fig: 'a dedicated server, still a system to run. the opposite extreme: no server process at all. duckdb.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: export the DataFrame, or query it directly?',
      body: (
        <>
          A Pandas DataFrame already sits in the same process as DuckDB. To query it with SQL,
          does DuckDB need an export step first, or can it query the DataFrame directly?
        </>
      ),
      duration: 4.8,
      fig: 'a pandas dataframe sits in the same process. export it first, or query it directly?',
      predict: {
        options: [
          { label: 'Export it first' },
          { label: 'Query it directly', correct: true },
        ],
        explain: (
          <>
            DuckDB's own docs: a replacement scan swaps in a table function that reads the
            DataFrame object itself -- no export, no import.
          </>
        ),
      },
      Visual: S.PredictDataFrameExport,
    },
    {
      title: 'Reveal: direct DataFrame interop, for real',
      body: (
        <>
          A real Pandas sum and a real Polars sum, both queried directly against the live
          DataFrame objects -- confirmed for real, no export step anywhere in between.
        </>
      ),
      duration: 4.8,
      fig: 'a real pandas sum and a real polars sum, both queried directly, for real, no export step.',
      Visual: S.RevealDataFrameInterop,
    },
    {
      title: 'Reveal: vectorized execution and morsel-driven parallelism',
      body: (
        <>
          Columnar, vectorized execution processes a whole batch of values per operation. The
          identical aggregation, timed for real: four threads finish well ahead of one.
        </>
      ),
      duration: 4.8,
      fig: 'the identical aggregation, real wall-clock time, four threads well ahead of one.',
      takeaway: "A real wall-clock measurement: the same aggregation runs several times faster across four threads than one -- morsel-driven parallelism, proven.",
      Visual: S.RevealVectorizedMorsel,
    },
    {
      title: "Predict: does a too-big sort just fail?",
      body: (
        <>
          A sort runs against more rows than a configured memory limit allows. Does the query
          fail outright, or does something else let it finish anyway?
        </>
      ),
      duration: 4.8,
      fig: 'a sort bigger than the configured memory limit. does the query fail, or finish anyway?',
      predict: {
        options: [
          { label: 'It fails' },
          { label: 'It finishes anyway', correct: true },
        ],
        explain: (
          <>
            DuckDB's own docs: larger-than-memory workloads are supported by spilling to disk --
            out-of-core processing, not a hard memory ceiling.
          </>
        ),
      },
      Visual: S.PredictOverMemoryLimit,
    },
    {
      title: 'Reveal: real out-of-core spilling',
      body: (
        <>
          Real spill files land in the configured temp directory, under the memory limit, for
          real. The sort still finishes, and the full row count comes back correct.
        </>
      ),
      duration: 4.8,
      fig: 'real spill files land on disk, under the memory limit, and the full row count still comes back right.',
      takeaway: "A sort over the memory limit still finishes, for real -- spilling to disk, not failing, is out-of-core processing.",
      Visual: S.RevealOutOfCoreSpill,
    },
    {
      title: 'Reveal: a real Iceberg table, queried directly',
      body: (
        <>
          A real local Iceberg table, built in this sandbox with no catalog server -- DuckDB's
          own real query plan shows the filter pushed straight into the Parquet scan.
        </>
      ),
      duration: 4.8,
      fig: 'a real local iceberg table, queried directly -- the filter pushed into the parquet scan itself, for real.',
      Visual: S.RevealIcebergDirectQuery,
    },
    {
      title: 'Reveal: the identical shape for Delta',
      body: (
        <>
          A real local Delta table, built with no Spark cluster anywhere -- the same direct,
          in-process query, the same correct filtered count, confirmed for real.
        </>
      ),
      duration: 4.8,
      fig: 'the identical shape against a real local delta table -- no spark anywhere, same correct count.',
      Visual: S.RevealDeltaDirectQuery,
    },
    {
      title: 'Reveal: DuckLake, a catalog that is just SQL',
      body: (
        <>
          DuckLake's own catalog lives in ordinary SQL tables, not a REST protocol. Two real
          writes become two real, independently queryable versioned snapshots.
        </>
      ),
      duration: 4.8,
      fig: 'two real writes become two real, independently queryable versioned snapshots -- the catalog is just sql.',
      takeaway: "DuckLake stores its catalog as plain SQL tables, not a REST protocol -- a genuinely different way to version one.",
      Visual: S.RevealDuckLakeCatalog,
    },
    {
      title: 'Recap',
      body: (
        <>
          In-process, vectorized, morsel-parallel, spills to disk when it must, reads this
          chapter's own Iceberg, Delta and DuckLake tables directly, with no server at all.
        </>
      ),
      duration: 4.8,
      fig: 'in-process, vectorized, morsel-parallel, spills when it must, reads iceberg, delta and ducklake directly. next: snowflake.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
