import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: the existing PostgreSQL 16.15 sandbox, database "shop", table "orders" (2.4 million rows).
// Every number below is in examples.py and SOURCES.md ("Measured directly").
const reel: Reel = {
  steps: [
    {
      title: 'Same entities, two workloads, in five minutes',
      body: (
        <>
          One table, two completely different questions asked of it. Five minutes on why one schema struggles to
          serve both well.
        </>
      ),
      duration: 2.4,
      fig: 'orders: 2.4 million rows — one lookup, one sum',
      Visual: S.Opening,
    },
    {
      title: 'Reveal: the OLTP access pattern',
      body: (
        <>
          Look up one order by its id. The existing index lands on it directly: a handful of buffers, under a
          millisecond.
        </>
      ),
      duration: 4,
      fig: '~7 buffers, ~0.6 ms — one order, by id',
      Visual: S.RevealOltp,
    },
    {
      title: 'Reveal: the OLAP access pattern',
      body: (
        <>
          Sum one column across every row instead. The same table now forces a sequential scan: tens of thousands
          of buffers, hundreds of milliseconds.
        </>
      ),
      duration: 4.4,
      fig: '~46 thousand buffers, ~479 ms — summed across every row',
      Visual: S.RevealOlap,
    },
    {
      title: 'Predict: does the engine read less, needing only one column?',
      body: (
        <>
          The sum only needs one column, a small slice of each row's bytes. Does the row-oriented engine read any
          less data because of that?
        </>
      ),
      duration: 2.8,
      fig: 'one column needed, out of six — does less get read?',
      predict: {
        options: [
          { label: 'Yes — it reads only the bytes that column needs' },
          { label: 'No — it still reads every byte of every row', correct: true },
        ],
        explain: (
          <>
            No. A row's columns sit interleaved in the same block, so a sequential scan reads every stored column
            of every row it visits — there is no way to address just one column's bytes within a row.
          </>
        ),
      },
      Visual: S.PredictColumnSkip,
    },
    {
      title: 'Reveal: row storage reads whole rows regardless',
      body: (
        <>
          The column the sum actually needs is a small slice of each row's stored bytes, but the engine has no way
          to skip the rest. Every column of every row gets read.
        </>
      ),
      duration: 4.4,
      fig: 'one of six columns needed — all six get read anyway',
      takeaway: 'A row-oriented engine cannot read less than a whole row, however few columns a query needs.',
      Visual: S.RevealRowReadsWhole,
    },
    {
      title: 'Reveal: what column storage changes',
      body: (
        <>
          Store each column's values together instead, and a query over five columns of a hundred reads about five
          percent of the table — the opposite trade from row storage.
        </>
      ),
      duration: 4.4,
      fig: 'five of a hundred columns needed → about five percent read',
      takeaway: 'Columnar storage turns "read only the columns you need" from impossible into cheap.',
      Visual: S.RevealColumnarFlips,
    },
    {
      title: 'Reveal: normalization pressure pulls the other way for each',
      body: (
        <>
          OLTP schemas split data into small, less redundant tables so independent transactions never collide.
          Querying that same normalized shape for an aggregate across every row means rejoining it first, which
          gets expensive at scale.
        </>
      ),
      duration: 4.8,
      fig: 'normalized → cheap independent writes, expensive joined scans',
      takeaway: 'Normalization helps the workload doing point writes and costs the workload doing large scans.',
      Visual: S.RevealNormalizationPressure,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Point reads want few, whole rows. Large scans want few, whole columns. Swipe on to the next refresher:
          the notation that names the same relationships, regardless of which workload ends up reading them.
        </>
      ),
      duration: 2.4,
      Visual: S.Recap,
    },
  ],
};

export default reel;
