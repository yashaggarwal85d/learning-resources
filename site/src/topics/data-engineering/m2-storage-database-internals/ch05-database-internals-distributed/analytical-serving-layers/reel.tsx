import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The materialized-table speedup and the freshness gap are both reproduced for real in
// examples.py against a real, in-process DuckDB engine. Cubes and a real-time OLAP store's own
// ingestion-time rollup are sourced from ClickHouse's and Druid's own documentation, named but
// not separately run, since this course's own sandbox does not stand up a real-time OLAP store
// as its own service.
// No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the same query, measured for real: scanning raw rows from scratch versus a table that already holds the answer",
      body: (
        <>
          The identical aggregate question, asked two ways against a real database engine: once
          by scanning every raw row from scratch, once against a table that already holds the
          answer. Measured directly, one of these is dramatically faster.
        </>
      ),
      duration: 5.6,
      fig: "the same query, measured for real: scanning raw rows from scratch versus a table that already holds the answer",
      Visual: S.Hook,
    },
    {
      title: "Predict: is the fast one fast because it's a different kind of database, or because it's a smaller question",
      body: (
        <>
          Both queries ran against the exact same engine. Is the fast one fast because it's
          secretly a different kind of database underneath, or because it's answering a much
          smaller question than the slow one is?
        </>
      ),
      duration: 2.8,
      fig: "is the fast query fast because it's a different kind of database, or a smaller question?",
      predict: {
        options: [
          { label: "A different kind of database — the fast table must work differently" },
          { label: "A smaller question — the hard work already happened, ahead of time", correct: true },
        ],
        explain: (
          <>
            A smaller question. Both queries run on the same engine. The fast one wins because the
            aggregation work already happened once, ahead of time, leaving a tiny table to scan
            instead of the full raw one.
          </>
        ),
      },
      Visual: S.PredictWhyFaster,
    },
    {
      title: 'Reveal: pre-aggregation is a cost shift, not a cost cut',
      body: (
        <>
          The real aggregation work doesn't disappear. It happens once, when data is written,
          instead of being repeated on every single read — a shift in when the cost is paid, not
          a reduction in the total work done.
        </>
      ),
      duration: 5.2,
      fig: "pre-aggregation is a cost shift, not a cost cut: the real work still happens, just once, at write time",
      Visual: S.RevealCostShift,
    },
    {
      title: 'Reveal: a materialized serving table, measured',
      body: (
        <>
          A real precomputed table, measured directly against the raw table it was built from,
          answers the identical question many times faster — the same speedup the hook's own
          measurement already showed, now named for what it is.
        </>
      ),
      duration: 5.2,
      fig: "a real precomputed table, measured, answers the same question many times faster",
      takeaway: 'A precomputed table measurably answers the same question far faster than scanning the raw one.',
      Visual: S.RevealMaterializedSpeedup,
    },
    {
      title: 'Reveal: the freshness gap, measured',
      body: (
        <>
          A real write lands in the raw table and shows up there immediately. The same write,
          checked directly against the materialized table, is measurably absent until that table
          is explicitly refreshed.
        </>
      ),
      duration: 5.2,
      fig: "a real write, measured invisible in the materialized table until it's refreshed",
      takeaway: 'A materialized table can be measurably stale until refreshed, unlike a live raw-table scan.',
      Visual: S.RevealFreshnessGap,
    },
    {
      title: 'Reveal: cubes generalize this to many questions at once',
      body: (
        <>
          One materialized table answers one fixed question. A cube precomputes the aggregate
          along every combination of a chosen set of dimensions at once, trading more storage for
          being ready for any of those questions, not just one.
        </>
      ),
      duration: 5.2,
      fig: "a cube precomputes every combination of a fixed set of dimensions, not just one question",
      Visual: S.RevealCubes,
    },
    {
      title: "Reveal: a real-time OLAP store's own rollup",
      body: (
        <>
          Druid, Pinot and ClickHouse each push this further: pre-aggregation happens right at
          ingestion itself, in the engine's own words, at a real named cost — once rolled up,
          individual events can no longer be queried on their own.
        </>
      ),
      duration: 5.6,
      fig: "a real-time OLAP store pre-aggregates at ingestion itself, losing per-event queries to stay fresh",
      takeaway: 'A real-time OLAP store rolls up on ingestion itself, trading per-event queries for freshness.',
      Visual: S.RevealRealTimeOlap,
    },
    {
      title: 'Recap',
      body: (
        <>
          Pre-aggregation shifts cost to write time rather than cutting it. A materialized table
          is measurably faster, but that speed can mean staleness until refreshed. Cubes
          generalize one table into many questions at once. And a real-time OLAP store pushes the
          same idea all the way to ingestion time.
        </>
      ),
      duration: 5.6,
      fig: "pre-aggregation shifts cost to write time, a materialized table is measurably faster but can go stale, cubes generalize it, real-time OLAP does it at ingestion",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard needs a number that's correct to the second and cheap to query at a huge
          volume of requests a minute. Which of this topic's own three options fits, and what does
          it cost to get there?
        </>
      ),
      duration: 2.8,
      fig: "a number that must be correct to the second and cheap at huge query volume — which option?",
      predict: {
        options: [
          { label: 'A periodic materialized view, refreshed often enough' },
          { label: "A real-time OLAP store, rolling up on ingestion itself", correct: true },
        ],
        explain: (
          <>
            A real-time OLAP store. A periodic materialized view is never fresher than its last
            refresh, and a raw warehouse scan isn't cheap at that request volume. The real cost is
            standing up and running that extra, dedicated system.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
