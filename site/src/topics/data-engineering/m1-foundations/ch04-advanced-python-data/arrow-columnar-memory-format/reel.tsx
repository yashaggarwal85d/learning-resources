import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own PyArrow 26.0.0 (examples.py): validity-bitmap
// presence/absence, chunked-array/record-batch concatenation without copying, dictionary vs.
// run-end encoding (including the counter-case where each one loses), the string-view
// ("German strings") inline-vs-out-of-line layout, a List array's buffer composition, a real
// pyarrow.compute kernel timed against an equivalent Python loop, and the identical
// pyarrow.Table object consumed directly by both Polars and DuckDB with no conversion step.
// The "German Strings" naming and the ClickBench speedup are DataFusion-specific claims,
// disclosed as sourced-only (DataFusion isn't installed here). No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: how do two different engines read the same bytes at all?',
      body: (
        <>
          A native engine beat a Python loop by a wide margin, and a handoff into that engine
          beat a round trip through a file. Neither measurement asked the more basic question:
          how do two completely different engines agree on what those bytes even mean?
        </>
      ),
      duration: 4.8,
      fig: 'a native engine win and a handoff win, neither one asking how the bytes agree at all',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: an array is buffers, not a blob',
      body: (
        <>
          A validity bitmap plus a data buffer, each its own separately addressable region — not
          one opaque chunk of memory. A real small array, shown as the buffers it's actually made
          of.
        </>
      ),
      duration: 4.8,
      fig: 'a real array, shown as its own separate buffers — a bitmap and a data buffer, not one blob',
      Visual: S.RevealArrayIsBuffers,
    },
    {
      title: 'Predict: does a zero-null array still get a bitmap buffer?',
      body: (
        <>
          This array has no nulls at all. Does the implementation still pay to allocate a
          validity bitmap for it anyway, just in case, or does it skip the buffer entirely?
        </>
      ),
      duration: 2.8,
      fig: 'zero nulls — is a bitmap buffer still allocated anyway, or skipped entirely?',
      predict: {
        options: [
          { label: 'Allocated anyway — consistent with every other array, just in case' },
          { label: 'Skipped — an array that provably has no nulls needs no bitmap', correct: true },
        ],
        explain: (
          <>
            Skipped. The specification allows an array with a zero null count to leave the
            bitmap buffer entirely absent, and this sandbox's own build actually does it, not
            merely permits it.
          </>
        ),
      },
      Visual: S.PredictZeroNullBitmap,
    },
    {
      title: 'Reveal: chunked arrays and record batches',
      body: (
        <>
          Several record batches become one logical column with no copying at all — each batch
          stays exactly where it was written, and the column just keeps a list of them.
        </>
      ),
      duration: 4.8,
      fig: 'several batches, one logical column — no copy, just a list of where each one already lives',
      Visual: S.RevealChunkedArray,
    },
    {
      title: 'Reveal: dictionary encoding',
      body: (
        <>
          Values that repeat a lot become small integer indices into a separate dictionary
          array — a real measured size reduction, for exactly the same reason a foreign key
          beats repeating a long value in every row.
        </>
      ),
      duration: 4.8,
      fig: 'repeated values become small integer indices — a real measured size reduction',
      Visual: S.RevealDictionaryEncoding,
    },
    {
      title: 'Reveal: run-end encoding',
      body: (
        <>
          Dictionary encoding has no idea a run exists — it only counts repeats. Data that
          actually runs — the same value many times in a row — compresses far harder under
          run-end encoding, which stores nothing but where each run ends. Values that repeat
          without running defeat it completely.
        </>
      ),
      duration: 4.8,
      fig: 'real runs compress far harder than dictionary encoding — but values that only alternate defeat it',
      takeaway: 'Dictionary encoding compresses repeats anywhere; run-end encoding only compresses repeats that run in a row.',
      Visual: S.RevealRunEndEncoding,
    },
    {
      title: 'Reveal: the string-view layout',
      body: (
        <>
          A short string gets inlined directly into its own view, no separate buffer at all. A
          longer one keeps just a four-byte copy of its start alongside where the rest actually
          lives — enough to decide most comparisons without ever touching that buffer.
        </>
      ),
      duration: 4.8,
      fig: 'short strings inlined directly; long strings keep only a prefix plus where the rest lives',
      Visual: S.RevealStringView,
    },
    {
      title: 'Reveal: nested types reuse the same primitives',
      body: (
        <>
          A list of values is just a validity bitmap, an offsets buffer, and a child array of
          whatever type the list actually holds — nothing new, the same two kinds of buffer this
          whole topic has already named.
        </>
      ),
      duration: 4.8,
      fig: "a list's own buffers are exactly a bitmap and offsets — nesting needs no new buffer kind",
      Visual: S.RevealNestedTypes,
    },
    {
      title: 'Reveal: compute kernels',
      body: (
        <>
          The same sum, computed one way as a vectorized kernel over these exact buffers and
          another way as a Python loop over boxed objects — a real measured gap, the direct
          payoff of never building a Python object per value in the first place.
        </>
      ),
      duration: 4.8,
      fig: 'the identical sum, vectorized kernel versus a python loop — a real measured gap',
      takeaway: "A compute kernel isn't a faster loop; it never had to box a value at all.",
      Visual: S.RevealComputeKernel,
    },
    {
      title: 'Reveal: why Arrow became the interchange layer',
      body: (
        <>
          The exact same in-memory table, hand to two genuinely different engines, with no
          conversion step between them — not read twice from disk, not rebuilt, just handed
          over directly, and both of them agree on the identical answer.
        </>
      ),
      duration: 4.8,
      fig: 'one table, handed to two different engines directly — no conversion step, same answer from both',
      takeaway: 'Becoming the interchange layer means no engine converts its input, not that every later step is free.',
      Visual: S.RevealInterchangeLayer,
    },
    {
      title: 'Recap',
      body: (
        <>
          Buffers, not a blob. Batches that chunk instead of copying. Two specialists —
          dictionary for repeats, run-end for runs — that trade places on the wrong data. A
          string view that inlines the short case and only prefixes the long one. The same
          buffers underneath a real kernel speedup, and underneath one table two engines could
          both just read directly.
        </>
      ),
      duration: 4.8,
      fig: 'buffers not a blob, chunks not copies, two specialists, one view layout, one shared table',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A column of repeated country codes. A column of timestamps sorted into long runs. A
          column of free-text comments. Which layout actually fits each one — and what happens
          to the one you pick wrong?
        </>
      ),
      duration: 2.8,
      fig: 'country codes, sorted timestamps, free text — which layout fits each, and what breaks if you guess wrong?',
      predict: {
        options: [
          { label: 'Dictionary for the codes, run-end for the sorted runs, string-view for the text' , correct: true },
          { label: 'Run-end for everything — it compresses the hardest of the three' },
        ],
        explain: (
          <>
            Dictionary for the codes, run-end for the sorted runs, string-view for the free text.
            Run-end on the codes alone would need a run per value if they don't actually run
            together — often worse than doing nothing at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
