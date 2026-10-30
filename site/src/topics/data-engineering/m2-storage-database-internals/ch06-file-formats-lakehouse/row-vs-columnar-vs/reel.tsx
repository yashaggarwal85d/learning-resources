import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number shown is packed, measured and asserted in examples.py on the same 1,000-row,
// 4-attribute table: NSM point lookup touches 32 bytes in 1 read; NSM column scan touches all
// 32,000 bytes; DSM point lookup needs 4 separate reads; DSM column scan touches only 8,000 bytes
// (75% less than NSM); PAX point lookup touches 1 page (like NSM); PAX column scan still opens
// all 10 pages (same I/O as NSM) but only 8,000 of the 32,000 page bytes — 25% — are useful.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A row's four attributes sit side by side on disk. Fetching one row — a point lookup —
          is one contiguous read.
        </>
      ),
      duration: 4.2,
      fig: "NSM's point lookup touches 32 bytes in one contiguous read.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does row storage win the scan too?',
      body: (
        <>
          Row storage just won the point lookup outright. Scanning one column across every row
          is the opposite access pattern — does the same layout still win?
        </>
      ),
      duration: 3,
      fig: 'NSM wins the point lookup. What happens when the question is a single column, across every row?',
      predict: {
        options: [
          { label: "No — a column scan still has to pass over every row's full width", correct: true },
          { label: "Yes — whatever's fast for one row is fast for one column too" },
        ],
        explain: (
          <>
            A row-major file has no notion of "just this column." To read age everywhere, a
            scanner still passes every byte of every attribute it doesn't need.
          </>
        ),
      },
      Visual: S.PredictScan,
    },
    {
      title: 'Reveal: the scan row storage cannot avoid',
      body: (
        <>
          Every attribute of every row sits between you and the one column you wanted. A thousand
          rows, four attributes each, and the scan still touches all of it.
        </>
      ),
      duration: 4.4,
      fig: 'a column scan over 1,000 rows touches all 32,000 bytes of the file.',
      Visual: S.RevealNsmScan,
    },
    {
      title: 'Reveal: DSM wins the scan, loses the lookup',
      body: (
        <>
          Decompose the relation by column and the scan only opens the one sub-relation it needs.
          But now reconstructing a single row means reading four separate files and joining them
          back together.
        </>
      ),
      duration: 4.6,
      fig: "DSM's column scan touches 8,000 bytes; its point lookup costs 4 separate reads across 4 sub-relations.",
      takeaway: 'Decomposing a relation by column wins every scan and loses every point lookup to a join across sub-relations.',
      Visual: S.RevealDsm,
    },
    {
      title: 'Reveal: PAX, the compromise',
      body: (
        <>
          Keep every attribute of a row on the same page, but group each attribute's values into
          its own minipage within that page. A lookup still opens one page; a scan still skips
          the minipages it doesn't need.
        </>
      ),
      duration: 4.8,
      fig: "PAX's point lookup touches 1 page, same as NSM; its scan touches only the needed minipage inside each page.",
      takeaway: "PAX changes a page's layout, not which pages are read, keeping NSM's I/O with DSM's useful-byte ratio.",
      Visual: S.RevealPax,
    },
    {
      title: 'Reveal: the surprising number',
      body: (
        <>
          PAX still has to open every page to scan a column — the same number of pages NSM would
          open. The difference is how much of each page turns out to be useful.
        </>
      ),
      duration: 4.6,
      fig: 'PAX opens all 10 pages for the scan, same as NSM, but only 25% of each page is the column it needed.',
      takeaway: "Grouping columns inside a page keeps the page count unchanged; only the useful fraction of each page's bytes improves.",
      Visual: S.RevealSurprisingNumber,
    },
    {
      title: 'Reveal: why Parquet is PAX',
      body: (
        <>
          A column-oriented file format that compresses and encodes one column at a time is
          exactly the payoff this layout buys — which is why the format that won the lakehouse is
          built this way.
        </>
      ),
      duration: 4.2,
      fig: 'Parquet: a column-oriented file format, compression and encoding set per column.',
      Visual: S.RevealParquet,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three layouts, three trade-offs: row storage wins the lookup and loses the scan, full
          decomposition wins the scan and loses the lookup, and grouping columns inside the page
          keeps both.
        </>
      ),
      duration: 4.6,
      fig: 'NSM, DSM, PAX: three layouts, three trade-offs.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
