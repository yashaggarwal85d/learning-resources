import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic hosts the §3.3 chapter lab (CHAPTER.md): the same dataset stored as JSON, a single
// Parquet file, a Hive-partitioned Parquet directory, and an Iceberg table, measured for real
// with DuckDB's own profiler (examples.py). Because the measured byte counts are real runtime
// values that shift slightly run to run, every comparison here is spelled as a relative word
// ("far more," "fewer," "more than") backed by an assertion in examples.py, never a literal digit.
const reel: Reel = {
  steps: [
    {
      title: 'The same data, the same query, stored four ways',
      body: (
        <>
          One dataset, one question asked of it, stored as JSON, as a single Parquet file, as a
          Hive-partitioned Parquet directory, and as an Iceberg table. Which one costs the least
          to actually answer it?
        </>
      ),
      duration: 4.8,
      fig: 'one dataset, one query, four storage shapes — which costs least?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: storage bills several axes at once, quoted directly',
      body: (
        <>
          Object storage's own cost components are storage, requests and retrievals, and data
          transfer — three separate meters, not one bundled price. Even the storage meter splits
          further: the rate depends on object size, how long it's kept, and which storage class
          holds it, since a class traded for slower retrieval latency bills less to store.
        </>
      ),
      duration: 4.8,
      fig: 'storage, requests, transfer — billed separately, not bundled',
      Visual: S.RevealBillingAxesQuote,
    },
    {
      title: "Predict: does the format that's cheapest to write also cost the least to query?",
      body: (
        <>
          JSON needs no schema and no special writer — about as cheap to produce as a format
          gets. Does that cheapness carry through to querying it too?
        </>
      ),
      duration: 2.8,
      fig: 'cheap to write — does that mean cheap to query too?',
      predict: {
        options: [
          { label: 'Yes — simple to write means cheap all the way through' },
          { label: 'No — querying it pays a real, separate cost', correct: true },
        ],
        explain: (
          <>
            No. Writing without a schema is cheap because nothing has to be organized ahead of
            time — which is exactly what makes reading it back slower and costlier later.
          </>
        ),
      },
      Visual: S.PredictFormatCost,
    },
    {
      title: 'Reveal: JSON versus Parquet, measured',
      body: (
        <>
          The exact same query, run against the exact same rows: the JSON copy reads back far
          more bytes than the Parquet copy, which only has to touch the columns the query needs.
        </>
      ),
      duration: 4.8,
      fig: 'same query, same rows — JSON reads far more bytes than Parquet',
      Visual: S.RevealJsonVsParquetMeasured,
    },
    {
      title: 'Reveal: two billing models for query compute, quoted directly',
      body: (
        <>
          One model charges for the bytes a query scans, however long it runs. Another charges
          for reserved compute capacity over time, however many bytes a query scans.
        </>
      ),
      duration: 4.8,
      fig: 'bytes scanned, billed — or reserved compute time, billed — never both the same way',
      Visual: S.RevealBillingModelsQuote,
    },
    {
      title: 'Predict: does splitting one file into many smaller files always lower the bill?',
      body: (
        <>
          Partitioning the data by month sounds like a strict improvement — smaller files,
          fewer bytes touched per query. Does it always come out cheaper?
        </>
      ),
      duration: 2.8,
      fig: 'more, smaller files — always the cheaper choice?',
      predict: {
        options: [
          { label: 'Yes — more partitioning is always strictly better' },
          { label: 'It depends on the query being asked', correct: true },
        ],
        explain: (
          <>
            It depends. Partitioning helps a query that only needs one slice of the data — it
            does nothing to help, and can actively hurt, a query that needs all of it.
          </>
        ),
      },
      Visual: S.PredictPartitionAlwaysWins,
    },
    {
      title: 'Reveal: a narrow query, measured',
      body: (
        <>
          Ask for one month out of twelve: the layout split into one file per month reads far
          fewer bytes than the single file holding every month at once.
        </>
      ),
      duration: 4.8,
      fig: 'one month out of twelve — partitioned layout reads far fewer bytes',
      Visual: S.RevealNarrowQueryMeasured,
    },
    {
      title: 'Reveal: a broad query, measured',
      body: (
        <>
          Ask for every month at once, on that same partitioned layout: it reads more bytes than
          one single large file holding the identical rows — the twelve small files cost more
          overhead than the one big file ever did.
        </>
      ),
      duration: 4.8,
      fig: 'every month at once — the partitioned layout now reads more, not less',
      takeaway: "A file layout that's cheaper for one query shape can be costlier for another, on the exact same data.",
      Visual: S.RevealBroadQueryMeasured,
    },
    {
      title: 'Reveal: storage cost, measured',
      body: (
        <>
          Set queries aside and just look at the disk. The JSON copy of this same dataset takes
          up far more space than any of the three columnar layouts holding the identical rows.
        </>
      ),
      duration: 4.8,
      fig: "disk alone — JSON's footprint dwarfs every columnar layout of the same rows",
      takeaway: 'Storage, requests, and bytes scanned are separate meters, and a format can lose on one while barely moving another.',
      Visual: S.RevealStorageMeasured,
    },
    {
      title: 'Predict: does wrapping the data in an open table format change its bytes-scanned numbers, by itself?',
      body: (
        <>
          An Iceberg table adds transactions and a catalog on top of ordinary files. Does that
          wrapper, by itself, change how many bytes a query against it actually reads?
        </>
      ),
      duration: 2.8,
      fig: 'transactions and a catalog added — does that change bytes scanned too?',
      predict: {
        options: [
          { label: 'Yes — a transactional format reads data differently underneath' },
          { label: 'No — the wrapper adds transactions, not a different byte count', correct: true },
        ],
        explain: (
          <>
            No. The transactions and the catalog are a separate property from how the underlying
            files are physically laid out — and bytes scanned is driven by that physical layout.
          </>
        ),
      },
      Visual: S.PredictIcebergWrapper,
    },
    {
      title: 'Reveal: an Iceberg table, measured',
      body: (
        <>
          Wrap the same unpartitioned data in an Iceberg table and run both queries again: its
          bytes read track the bare Parquet file underneath it almost exactly, narrow query and
          broad query alike.
        </>
      ),
      duration: 4.8,
      fig: 'same data, Iceberg-wrapped — bytes read track the bare Parquet file beneath it',
      takeaway: 'An open table format changes transactions and governance, not bytes scanned by itself — physical layout does that.',
      Visual: S.RevealIcebergMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Storage, requests, and query compute are billed on separate meters. File layout, not
          file format, is what actually moves bytes scanned — and which layout wins depends on
          whether the next query is narrow or broad.
        </>
      ),
      duration: 4.8,
      fig: 'separate meters; layout, not format, moves bytes scanned; it depends on the query',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard that only ever asks for the most recent single day's data, never more. Of
          today's four layouts, which one should it actually be built on?
        </>
      ),
      duration: 2.8,
      fig: 'always the latest single day, never more — which layout fits?',
      predict: {
        options: [
          { label: 'One large unpartitioned file — simplest to manage' },
          { label: 'A layout partitioned finely enough to isolate that one day', correct: true },
        ],
        explain: (
          <>
            A layout partitioned down to roughly that query's own grain. A query that's
            permanently narrow and permanently the same shape is exactly the case where fine
            partitioning keeps winning, with none of the broad-query cost measured earlier ever
            showing up.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
