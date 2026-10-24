import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A column-major layout touches far fewer bytes scanning one column and
// skips exactly the rows its packed validity bitmap marks absent, but it
// pays for that by scattering a single logical row's own update across
// every column's own separate buffer instead of touching one contiguous
// region.
const reel: Reel = {
  steps: [
    {
      title: 'Build the identical rows two ways: a row-major table, and a column-major table split into one buffer per column. Scanning just one column, does the column-major table genuinely touch fewer bytes than the row-major one?',
      body: (
        <>
          One row-major table, one column-major table, the identical rows.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both touch the same number of bytes either way' },
          { label: 'Yes, genuinely, far fewer bytes in the column-major table', correct: true },
          { label: 'Only if the row-major table happens to store that column first' },
        ],
        explain: (
          <>
            Far fewer. The column-major table skips every other column entirely.
          </>
        ),
      },
      Visual: S.ScanPredict,
    },
    {
      title: 'Measured: the column-major table touched far fewer bytes scanning that one column',
      body: (
        <>
          A row-major layout's other columns ride along for free during a narrow scan, so every row's full struct gets touched regardless.
        </>
      ),
      duration: 3.0,
      Visual: S.ScanReveal,
    },
    {
      title: 'Now update every field of one single logical row instead, in each layout. Does the column-major table touch more separate, non-adjacent regions doing that than the row-major table does?',
      body: (
        <>
          One logical row, every field updated, both layouts.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both touch the same single region' },
          { label: 'Yes, genuinely, the column-major table touches several separate regions', correct: true },
          { label: 'Only if the row happens to sit at the very start of the table' },
        ],
        explain: (
          <>
            Several. Every column's own buffer sits far from the others.
          </>
        ),
      },
      Visual: S.UpdatePredict,
    },
    {
      title: 'Measured: the column-major table touched four separate regions updating that one row; the row-major table touched exactly one',
      body: (
        <>
          The real, measured region counts, compared directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A column-major layout trades a cheap, contiguous row update for an expensive, scattered one across every column\'s own buffer.',
      Visual: S.UpdateReveal,
    },
    {
      title: "Mark every seventh row's own value absent, using a packed bitmap, one bit per row, the way Arrow's own format does it. Does a scan over that column correctly skip exactly those marked rows?",
      body: (
        <>
          The packed bitmap, one bit per row, nulled rows marked.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the scan still sums every row\'s raw value regardless' },
          { label: 'Yes, genuinely, exactly those rows get skipped', correct: true },
          { label: 'Only if the bitmap happens to use a full byte per row instead of a single bit' },
        ],
        explain: (
          <>
            Exactly those rows. The bitmap drives the skip directly.
          </>
        ),
      },
      Visual: S.BitmapPredict,
    },
    {
      title: 'Measured: the scan correctly skipped exactly the rows the bitmap marked absent, using one bit, not one byte, per row',
      body: (
        <>
          The real, measured skip count and bitmap size.
        </>
      ),
      duration: 3.0,
      takeaway: "A packed validity bitmap tells a scan exactly which rows to skip, at a fraction of a byte-per-row's cost.",
      Visual: S.BitmapReveal,
    },
    {
      title: "Apache Arrow's own format documentation states this exact trade-off directly. Does it name comparatively more expensive mutation operations as the real cost of its own locality and performance guarantees?",
      body: (
        <>
          Arrow's own words on the trade-off, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, Arrow\'s own format claims both scans and mutations are equally cheap' },
          { label: 'Yes, genuinely; it names the more expensive mutation cost directly', correct: true },
          { label: 'Only for arrays that already contain null values' },
        ],
        explain: (
          <>
            Yes. The trade-off is named directly, not left implicit.
          </>
        ),
      },
      Visual: S.TradeoffPredict,
    },
    {
      title: "Measured, in Apache Arrow's own words: analytical performance and data locality guarantees, in exchange for comparatively more expensive mutation operations",
      body: (
        <>
          Arrow's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: "A columnar format isn't a free upgrade over a row-major one; it trades cheap mutation for cheap scanning, on purpose.",
      Visual: S.TradeoffReveal,
    },
    {
      title: "The arrow-buffer crate's own docs name the identical trade-off from the implementation side: does handling the validity bitmap separately, rather than folding it into each value, genuinely improve real performance?",
      body: (
        <>
          arrow-buffer's own words on the null mask, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.NullMaskReveal,
    },
    {
      title: 'Recap: what a column-major layout buys, and what it costs',
      body: (
        <>
          A column-major layout touches far fewer bytes scanning one column and skips exactly the rows its packed validity bitmap marks absent, but it pays for that by scattering a single logical row's own update across every column's own separate buffer instead of touching one contiguous region.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
