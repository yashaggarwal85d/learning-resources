import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number shown is printed and asserted by examples.py on a 200-row synthetic shop dataset:
// zone column PLAIN 400 bytes -> RLE_DICTIONARY 113 bytes; the high-cardinality column has 200
// distinct values past a 40-entry fallback limit, so it stays PLAIN; shipment ids PLAIN 1600 bytes
// -> DELTA_BINARY_PACKED 60 bytes (96% smaller), block size 128 and miniblock count 4 (the real
// minimum, not the spec's own shortened worked-example size); the float weight column is 800 bytes
// either as PLAIN or BYTE_STREAM_SPLIT (same size, by the spec's own statement), and zlib shrinks
// PLAIN to 307 bytes but the byte-stream-split version to 234 bytes, 24% smaller after encoding
// first and compressing second. Three of the five encoders are also self-checked against the
// Parquet spec's own published worked examples before being run on this topic's own data.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Five encodings, the same 200-row column set: a zone column drops from 400 bytes to 113,
          and shipment ids drop from 1600 bytes to just 60.
        </>
      ),
      duration: 4.2,
      fig: 'five columns, five encodings, all measured and asserted in a 200-row dataset.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: a 6-value column, written 200 times over?',
      body: (
        <>
          The zone column only ever holds one of 6 warehouse codes, across all 200 rows. Does the
          file store 200 full copies of that text?
        </>
      ),
      duration: 3.2,
      fig: '6 warehouse codes, 200 rows. 200 full copies on disk, or something smaller?',
      predict: {
        options: [
          { label: 'No — the 6 unique values are stored once, in a dictionary', correct: true },
          { label: 'Yes — each of the 200 rows gets its own full copy' },
        ],
        explain: (
          <>
            A dictionary page holds each unique value once. The data page then stores only small
            bit-packed indexes into it, one per row.
          </>
        ),
      },
      Visual: S.PredictZoneColumn,
    },
    {
      title: 'Reveal: dictionary + RLE/bit-packing, two pages',
      body: (
        <>
          A dictionary page holds the 6 unique codes once. A data page of RLE/bit-packed indexes
          follows — 400 bytes becomes 113.
        </>
      ),
      duration: 4.4,
      fig: 'a dictionary page of 6 values, then a data page of RLE/bit-packed indexes: 400 -> 113 bytes.',
      Visual: S.RevealDictionaryRLE,
    },
    {
      title: "Reveal: the real fallback, not an idealized one",
      body: (
        <>
          The same scheme, run on a column where all 200 values are distinct, hits a 40-entry
          limit and falls straight back to PLAIN.
        </>
      ),
      duration: 4.4,
      fig: '200 distinct values past a 40-entry fallback limit — no dictionary would help here.',
      takeaway: 'A dictionary with 200 entries for 200 rows saves nothing — the real fallback exists for exactly this case.',
      Visual: S.RevealFallback,
    },
    {
      title: "Reveal: RLE/bit-packing's narrow charter",
      body: (
        <>
          That hybrid is scoped on purpose: only levels, dictionary indices, and booleans, with
          one bit width for the whole page.
        </>
      ),
      duration: 4,
      fig: 'levels, dictionary indices, booleans — and a single bit width, fixed for the whole page.',
      Visual: S.RevealRLEScope,
    },
    {
      title: 'Predict: 200 near-sorted ids — wider or narrower wins?',
      body: (
        <>
          Shipment ids run 200 rows, each one only 1 or 2 more than the last. Does a wider or
          narrower encoding do better here?
        </>
      ),
      duration: 3.4,
      fig: '200 near-sorted ids, 1600 bytes as PLAIN. A wider or narrower encoding wins?',
      predict: {
        options: [
          { label: 'Narrower — storing only the small differences wins', correct: true },
          { label: 'Wider — storing the full 64-bit values wins' },
        ],
        explain: (
          <>
            When consecutive values are close together, the differences between them are tiny —
            far smaller than the values themselves.
          </>
        ),
      },
      Visual: S.PredictShipmentIds,
    },
    {
      title: 'Reveal: DELTA_BINARY_PACKED, miniblock by miniblock',
      body: (
        <>
          Block size 128, 4 miniblocks per block — the real minimum, not the spec's own
          shortened example. 1600 bytes becomes 60, a 96% cut.
        </>
      ),
      duration: 4.6,
      fig: 'block size 128, miniblock count 4: PLAIN 1600 bytes -> DELTA_BINARY_PACKED 60 bytes, 96% smaller.',
      Visual: S.RevealDeltaBinaryPacked,
    },
    {
      title: 'Reveal: two different bets',
      body: (
        <>
          DELTA_BYTE_ARRAY bets that strings share prefixes. BYTE_STREAM_SPLIT bets on what a
          compressor can do, not on shrinking anything by itself.
        </>
      ),
      duration: 4.2,
      fig: 'sorted tracking codes bet on shared prefixes; float weights bet on the compressor after them.',
      takeaway: 'One bets strings share prefixes; the other bets a compressor will do the work after transposition.',
      Visual: S.RevealTwoBets,
    },
    {
      title: 'Reveal: encode first, compress second',
      body: (
        <>
          PLAIN and BYTE_STREAM_SPLIT are both 800 bytes raw. After zlib, PLAIN is 307 bytes —
          the split version is 234, 24% smaller.
        </>
      ),
      duration: 4.4,
      fig: '800 bytes either way raw; after zlib, 307 bytes vs 234 bytes — 24% smaller once transposed.',
      takeaway: 'Encoding alone can leave size unchanged — the real win shows up only after a compressor runs on top.',
      Visual: S.RevealEncodeCompress,
    },
    {
      title: 'Recap',
      body: (
        <>
          Dictionary trades repetition for indirection, and can fall back. Delta encodings bet on
          nearby values or shared prefixes. Byte-stream-split bets on what happens after it.
        </>
      ),
      duration: 4.6,
      fig: 'five encodings, five bets — picking wrong just costs a fallback to PLAIN, not correctness.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
