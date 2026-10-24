import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A lightweight encoding like run-length can win hugely on repetitive
// data and lose outright on random data, in both compression ratio and
// decode work, so the real choice has to follow the real data's own
// shape, not be applied by default.
const reel: Reel = {
  steps: [
    {
      title: 'Run-length encode a skewed, repetitive column: long stretches of the identical value, the way a real status column often looks. Does the encoding genuinely win big, by compression ratio, on data shaped like that?',
      body: (
        <>
          A skewed column, long runs of the identical value.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the ratio stays close to even' },
          { label: 'Yes, genuinely, a huge compression ratio', correct: true },
          { label: 'Only if every single value in the column is identical' },
        ],
        explain: (
          <>
            A huge ratio. Long runs collapse to one header each.
          </>
        ),
      },
      Visual: S.SkewedPredict,
    },
    {
      title: 'Measured: a huge real compression ratio on the skewed, repetitive column',
      body: (
        <>
          Long runs of the identical value collapse to one header each, so the real win scales directly with how repetitive the data actually is.
        </>
      ),
      duration: 3.0,
      Visual: S.SkewedReveal,
    },
    {
      title: 'Run the identical encoding on a uniformly random column of the identical length instead. Does it still win, or does it genuinely lose there?',
      body: (
        <>
          A uniformly random column, no real runs.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It still wins, just by less' },
          { label: 'It genuinely loses, taking more space than the raw column', correct: true },
          { label: 'It exactly breaks even' },
        ],
        explain: (
          <>
            Genuinely loses. Every run header costs more than one raw value.
          </>
        ),
      },
      Visual: S.RandomPredict,
    },
    {
      title: 'Measured: the identical encoding genuinely lost, taking more space than the raw column, on the uniformly random data',
      body: (
        <>
          The real, measured loss on the identical-length random column.
        </>
      ),
      duration: 3.0,
      takeaway: 'The identical encoding that wins big on repetitive data genuinely loses on random data; choose by the real data.',
      Visual: S.RandomReveal,
    },
    {
      title: "Now measure decode work itself: how many run-headers does decoding have to process, per value it produces, on each column? Does that cost genuinely depend on the data's own distribution too?",
      body: (
        <>
          Run-headers processed per output value, both columns.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, decoding always processes one header per output value regardless' },
          { label: 'Yes, genuinely, far fewer headers per value on the skewed column', correct: true },
          { label: 'Only if the random column happens to repeat a value by chance' },
        ],
        explain: (
          <>
            Far fewer. The skewed column's runs stay long.
          </>
        ),
      },
      Visual: S.DecodeWorkPredict,
    },
    {
      title: 'Measured: decoding the skewed column processed far fewer run-headers per value than decoding the random column did, and both decoded back to their exact original values',
      body: (
        <>
          The real, measured header counts, and a correctness check.
        </>
      ),
      duration: 3.0,
      takeaway: 'Decode cost, like compression ratio, rides on the real shape of the data, not on the encoding scheme alone.',
      Visual: S.DecodeWorkReveal,
    },
    {
      title: "Apache Parquet's own format documentation states the processing-cost side of this trade-off directly. Does it name several real compression codecs as covering different points in a compression-ratio-versus-processing-cost spectrum?",
      body: (
        <>
          Parquet's own words on the spectrum, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, Parquet names one single best codec for every case' },
          { label: 'Yes, genuinely; it names a real spectrum of codecs trading one for the other', correct: true },
          { label: 'Only for codecs applied to already-dictionary-encoded columns' },
        ],
        explain: (
          <>
            Yes. A real spectrum, named directly.
          </>
        ),
      },
      Visual: S.SpectrumPredict,
    },
    {
      title: "Measured, in Apache Parquet's own words: several compression codecs, covering different areas in the compression ratio / processing cost spectrum",
      body: (
        <>
          Parquet's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: "A real format doesn't pick one encoding; it offers a spectrum, and the right point depends on the data.",
      Visual: S.SpectrumReveal,
    },
    {
      title: "Parquet's own documentation also names exactly what run-length encoding itself is doing underneath: does it combine bit-packing with run-length encoding to store repeated values more efficiently?",
      body: (
        <>
          Parquet's own words on the RLE/bit-packing hybrid, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.RleDefinitionReveal,
    },
    {
      title: 'Recap: why an encoding has to follow the data',
      body: (
        <>
          A lightweight encoding like run-length can win hugely on repetitive data and lose outright on random data, in both compression ratio and decode work, so the real choice has to follow the real data's own shape, not be applied by default.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
