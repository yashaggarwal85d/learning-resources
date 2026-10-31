import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every plan-text and generated-code fact here is measured against a real local Apache Spark
// 4.0.1 (PySpark, local[4]) session's own debug.codegen()-equivalent output, reached through the
// JVM gateway: three operators sharing one fused stage marker and one reported subtree; the
// generated Java source itself writing rows through UnsafeRowWriter into UnsafeRow; the vectorised
// Parquet reader reporting Batched: true with no stage marker of its own, bridged in by a separate
// ColumnarToRow node; and a forced fallback (spark.sql.codegen.maxFields = 0) that removes every
// marker and reports zero subtrees, not a smaller number.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Catalyst already chose three operators for this query. Does each one run its own
          virtual call, one row at a time, or does something else entirely take over here?
        </>
      ),
      duration: 4.5,
      fig: 'three chosen operators. One loop each, or something else entirely?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one marker, one subtree',
      body: (
        <>
          Measured directly: Range, Filter, and Project all carry the exact same stage marker,
          star one. Spark's own codegen report confirms it — one subtree, not three.
        </>
      ),
      duration: 4.8,
      fig: 'Range, Filter, Project: all marked *(1). Report says: 1 subtree found.',
      Visual: S.RevealFusion,
    },
    {
      title: 'Predict: how a fused row is held',
      body: (
        <>
          That one generated method still has to hold a row somehow while it works. Does it build
          an ordinary JVM object per row, the way interpreted code would, or something else?
        </>
      ),
      duration: 2.8,
      fig: 'one generated method. Does it build a JVM object per row?',
      predict: {
        options: [
          { label: 'Yes — generated code still needs a normal object to carry each row’s fields' },
          { label: 'No — it writes rows as raw bytes instead, with no object per row at all', correct: true },
        ],
        explain: (
          <>
            A JVM object carries its own per-field overhead. Tungsten's whole point is skipping
            that cost, so the generated code writes binary rows directly, not ordinary objects.
          </>
        ),
      },
      Visual: S.PredictRowShape,
    },
    {
      title: 'Reveal: UnsafeRow, not an object',
      body: (
        <>
          Measured: the generated Java source itself calls UnsafeRowWriter, writing every field
          straight into an UnsafeRow — raw bytes, laid out by hand, never a plain JVM object.
        </>
      ),
      duration: 4.8,
      fig: 'generated code calls UnsafeRowWriter. Rows: UnsafeRow, raw bytes.',
      takeaway: 'Fused generated code writes rows as raw UnsafeRow bytes, not ordinary JVM objects with per-field overhead.',
      Visual: S.RevealUnsafeRow,
    },
    {
      title: 'Predict: the vectorised Parquet reader',
      body: (
        <>
          The same fused pipeline reads from a vectorised Parquet scan. Does that scan carry the
          same stage marker as everything downstream of it, or is it a case apart?
        </>
      ),
      duration: 2.8,
      fig: 'vectorised Parquet scan feeds the fused pipeline. Same marker too?',
      predict: {
        options: [
          { label: 'Yes — it feeds the same fused pipeline, so it shares the same stage marker' },
          { label: 'No — it works in whole columns at once, outside codegen entirely, and bridges in separately', correct: true },
        ],
        explain: (
          <>
            Codegen fuses row-at-a-time operators. The vectorised reader works a batch of columns
            at once, a genuinely different execution model — one a separate bridge node connects.
          </>
        ),
      },
      Visual: S.PredictParquetReader,
    },
    {
      title: 'Reveal: batched, bridged in by ColumnarToRow',
      body: (
        <>
          Measured: the Parquet scan itself reports batched true, with no stage marker at all.
          A separate ColumnarToRow node, carrying its own star one, bridges it into the rest.
        </>
      ),
      duration: 4.8,
      fig: 'FileScan parquet: batched true, no marker. ColumnarToRow: *(1), bridges in.',
      takeaway: 'The vectorised columnar reader sits outside codegen entirely; a separate node bridges it into the fused pipeline.',
      Visual: S.RevealColumnarException,
    },
    {
      title: 'Predict: forcing a fallback',
      body: (
        <>
          Drop the codegen field limit all the way to zero, so every stage blows past the cap on
          purpose. Does the plan show fewer stage markers now, or does it lose them completely?
        </>
      ),
      duration: 2.8,
      fig: 'field limit forced to zero. Fewer markers left, or none at all?',
      predict: {
        options: [
          { label: 'Fewer — some smaller stages should still stay under the new, much lower limit' },
          { label: 'None — once a stage exceeds the limit, Spark drops the whole fused path for it', correct: true },
        ],
        explain: (
          <>
            Codegen fuses a whole subtree as one unit or not at all. One stage over the limit
            drops that entire stage's generation, not just the one field that pushed it over.
          </>
        ),
      },
      Visual: S.PredictForceFallback,
    },
    {
      title: 'Reveal: zero markers, zero subtrees',
      body: (
        <>
          Measured: with the limit at zero, every star marker disappears from the plan, and
          Spark's own codegen report confirms it directly — zero subtrees, not a smaller count.
        </>
      ),
      duration: 4.8,
      fig: 'limit at zero: no *(N) anywhere. Report says: 0 subtrees found.',
      takeaway: 'A codegen fallback is silent in the plan unless checked for: zero stage markers, confirmed by zero reported subtrees.',
      Visual: S.RevealFallback,
    },
    {
      title: 'Recap',
      body: (
        <>
          A shared stage marker fuses a whole subtree into one generated method; that method
          writes UnsafeRow bytes, not objects; the vectorised reader sits outside that entirely,
          bridged in by its own node; and a fallback removes every marker, visibly, when it fires.
        </>
      ),
      duration: 4.8,
      fig: 'fused, UnsafeRow, columnar exception, silent fallback — all visible in the plan.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
