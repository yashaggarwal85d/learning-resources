import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real 100,000-row, hand-rolled stripe/row-index layout (ORC) and row-group/page-index layout
// (Parquet) measured side by side on the same selective query, per each spec's own default
// granularity: ORC's ROW_INDEX entry every 10,000 rows (ORCv1.md), present unconditionally, reads
// 10,000 rows; Parquet's bare row-group statistics at a 25,000-row row group read 25,000 rows;
// Parquet's own opt-in page index at 2,500 rows per page reads 2,500 rows, for 4x ORC's row-index
// metadata. Hive's own zero-point-thirteen release added row-level ACID transactions, built for any row-id-capable format but
// only integrated for ORC — why ORC became Hive's own default. Parquet became the lakehouse-wide
// default anyway: a framework-neutral design, and the table formats of the next section choosing
// it first. ORC still appears in legacy Hive tables and some Trino estates.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A single Parquet file, however well encoded, typed and skippable, is still one
          immutable file. ORC is the one real rival that made nearly every layout decision
          differently.
        </>
      ),
      duration: 4.4,
      fig: 'Parquet (row groups, column chunks, pages) next to ORC (stripes, streams, a built-in row index).',
      Visual: S.Hook,
    },
    {
      title: "Predict: does ORC's row index prune finer by default?",
      body: (
        <>
          Neither format is configured specially. Does ORC's own built-in row index — one entry
          every 10,000 rows, always present — prune finer than Parquet's bare row-group
          statistics?
        </>
      ),
      duration: 3.6,
      fig: "ORC's fixed row index against Parquet's bare row-group statistics, no configuration on either side.",
      predict: {
        options: [
          { label: "Yes — ORC's fixed 10,000-row index is finer than a larger default row group", correct: true },
          { label: "No — Parquet's row-group statistics always match ORC's granularity" },
        ],
        explain: (
          <>
            Parquet's row-group size is a writer choice and is often set larger than 10,000 rows,
            so ORC's always-on, fixed-size index can prune finer with no configuration at all.
          </>
        ),
      },
      Visual: S.PredictRowIndex,
    },
    {
      title: "Reveal: ORC's stripe and stream layout",
      body: (
        <>
          Each ORC column is stored as several named streams — PRESENT and DATA — placed next to
          each other inside the stripe, with index streams always first so a plain scan never has
          to read them.
        </>
      ),
      duration: 4.4,
      fig: 'one column, two streams (PRESENT, DATA), inside a stripe whose index streams sit at the front.',
      Visual: S.RevealStripeLayout,
    },
    {
      title: "Reveal: ORC's fixed index beats a bare row-group default",
      body: (
        <>
          On the same 100,000 rows, a selective query reads 10,000 rows under ORC's fixed,
          always-on row index, against 25,000 rows under Parquet's bare row-group statistics at
          this row-group size.
        </>
      ),
      duration: 4.6,
      fig: "measured: ORC's 10,000-row index vs. Parquet's 25,000-row row-group statistics, same query.",
      takeaway: "ORC's row index needs no configuration — it prunes by default where Parquet's bare row-group stats are coarser.",
      Visual: S.RevealOrcIndex,
    },
    {
      title: "Predict: can Parquet still beat ORC's fixed granularity?",
      body: (
        <>
          ORC's index is fixed at 10,000 rows with no configuration. Does Parquet have a way to
          prune finer than that once a writer turns it on?
        </>
      ),
      duration: 3.6,
      fig: "ORC's fixed 10,000-row default against Parquet's own opt-in page index.",
      predict: {
        options: [
          { label: "Yes — Parquet's page index, once enabled, is a finer, separate structure", correct: true },
          { label: 'No — ORC already prunes as finely as any columnar format can' },
        ],
        explain: (
          <>
            Parquet's page index (from topic 7) adds a second, finer level of statistics inside
            each row group, opt-in because of its own metadata cost — once on, it can out-prune
            ORC's fixed default.
          </>
        ),
      },
      Visual: S.PredictPageIndex,
    },
    {
      title: "Reveal: Parquet's own page index prunes finer",
      body: (
        <>
          With the page index turned on, the same query reads only 2,500 rows — finer than ORC's
          fixed default — but the page index costs 4x ORC's row-index metadata for that
          precision.
        </>
      ),
      duration: 4.4,
      fig: "Parquet's page index at 2,500 rows per page: finer pruning, 4x the metadata bytes of ORC's row index.",
      Visual: S.RevealPageIndexFiner,
    },
    {
      title: 'Reveal: rows read and index bytes, all three ways',
      body: (
        <>
          10,000 rows and 200 index bytes for ORC; 25,000 rows and 80 index bytes for Parquet's
          bare row-group stats; 2,500 rows and 800 index bytes once Parquet's page index is on.
        </>
      ),
      duration: 4.6,
      fig: 'measured rows read and index bytes: ORC, Parquet row-group-only, Parquet with page index.',
      takeaway: "Finer pruning always costs more index bytes — ORC and Parquet just sit at different points on that trade-off.",
      Visual: S.RevealMeasuredSynthesis,
    },
    {
      title: "Reveal: ORC's ACID history in Hive",
      body: (
        <>
          Hive's own zero-point-thirteen release added full row-level ACID transactions, built so any format with a row id
          could support them — but the integration work was only ever done for ORC, which is why
          ORC became Hive's own default.
        </>
      ),
      duration: 4.6,
      fig: "Hive's own zero-point-thirteen release of row-level ACID transactions: built for any row-id-capable format, shipped only for ORC.",
      Visual: S.RevealAcidHistory,
    },
    {
      title: 'Reveal: why Parquet became the lakehouse default anyway',
      body: (
        <>
          Parquet was built from the start to be used by any framework, with no ecosystem
          favored — and the table formats of the next section chose it first. ORC still appears
          in legacy Hive tables and some Trino estates.
        </>
      ),
      duration: 4.6,
      fig: "Parquet's framework-neutral design and the table formats choosing it first; where ORC still runs today.",
      takeaway: "ORC's own transactional history made it Hive's default; Parquet's framework-neutral design made it the lakehouse's.",
      Visual: S.RevealWhyParquetWon,
    },
    {
      title: 'Recap',
      body: (
        <>
          ORC's fixed index beats a bare row-group default with no configuration; Parquet's own
          opt-in page index beats ORC's fixed one; the wider ecosystem picked Parquet anyway.
        </>
      ),
      duration: 4.8,
      fig: 'a fixed index needs no configuration — an opt-in one can still prune finer.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
