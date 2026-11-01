import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly against this sandbox's own real PostgreSQL cluster and a real DuckDB
// database — no Iceberg or Paimon table format is available here, so a real DuckDB MERGE INTO
// statement stands in for a lakehouse's periodic MERGE, disclosed in SOURCES.md and REVIEW.md.
// BigQuery's and Snowpipe Streaming's own native CDC paths are named and quoted from their
// current documentation rather than reproduced, since neither warehouse is reachable here.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A replayed batch and a live event for the same order arrive in opposite order, and the
          lakehouse keeps the older value.
        </>
      ),
      duration: 4.8,
      fig: "a replayed batch and a live event for the same order arrive in opposite order, and the lakehouse keeps the older value.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: is append-then-MERGE naturally protected',
      body: (
        <>
          Does landing by append-then-MERGE protect against this on its own, or can the same
          arrival-order bug still reach it?
        </>
      ),
      duration: 2.8,
      fig: "does landing by append-then-MERGE protect against this on its own, or can the same arrival-order bug still reach it?",
      predict: {
        options: [
          { label: 'Append-then-MERGE is naturally safe, since it waits before merging anything' },
          {
            label: "The same bug can reach any merge that doesn't compare source position, no matter the landing strategy",
            correct: true,
          },
        ],
        explain: (
          <>
            Waiting to merge changes nothing about which row a merge keeps unless the merge
            itself compares something about each change's own position in the source. Without
            that comparison, the later-arriving row always wins, whichever strategy landed it.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: append-only change log, periodic MERGE',
      body: (
        <>
          Every change lands in an append-only table first; every few minutes, MERGE takes the
          latest change per key into the current-state table.
        </>
      ),
      duration: 4.8,
      fig: 'every change lands in an append-only table first; every few minutes, MERGE takes the latest change per key into the current-state table.',
      Visual: S.RevealAppendMerge,
    },
    {
      title: 'Reveal: streaming upserts into a merge-on-read table',
      body: (
        <>
          A streaming upsert writes each change as a new data file plus a marker for whatever row
          it replaces — current within seconds, merged again at read time until compaction.
        </>
      ),
      duration: 4.8,
      fig: "a streaming upsert writes each change as a new data file plus a marker for whatever row it replaces, current within seconds, merged at read time until compaction.",
      Visual: S.RevealStreamingUpsert,
    },
    {
      title: 'Reveal: the winner is the greater source LSN',
      body: (
        <>
          The MERGE compares source LSN, not arrival order — an older event never overwrites a
          newer row, whichever order it's replayed in.
        </>
      ),
      duration: 4.8,
      fig: "the MERGE compares source LSN, not arrival order; an older event never overwrites a newer row, in either order it's replayed.",
      takeaway: 'The winner of two changes to the same row is decided by source position, never by arrival.',
      Visual: S.RevealLsnOrdering,
    },
    {
      title: "Reveal: compaction's own cost scales with update rate",
      body: (
        <>
          A table whose rows change often produces proportionally more files for compaction to
          rewrite; append-then-MERGE's own current table never grows with update rate.
        </>
      ),
      duration: 4.8,
      fig: 'a table whose rows change often produces proportionally more files for compaction to rewrite; append-then-merge\'s own current table never grows with update rate.',
      takeaway: "A streaming upsert's own freshness is paid for later, in exactly the files compaction has to rewrite.",
      Visual: S.RevealCompactionCost,
    },
    {
      title: 'Reveal: a warehouse that lands CDC natively',
      body: (
        <>
          BigQuery accepts UPSERT and DELETE on a declared primary key; Snowpipe Streaming's
          Named Channels give ordered, exactly-once ingestion by offset token.
        </>
      ),
      duration: 4.8,
      fig: "BigQuery accepts UPSERT and DELETE on a declared primary key; Snowpipe Streaming's Named Channels give ordered, exactly-once ingestion by offset token.",
      Visual: S.RevealWarehouseNative,
    },
    {
      title: 'Reveal: turning a topic into a table without hand-writing the merge',
      body: (
        <>
          A third way to the same table: turning a change topic directly into one, without a
          team ever writing the merge by hand.
        </>
      ),
      duration: 4.8,
      fig: 'a third way to the same table: turning a change topic directly into one, without a team writing the merge by hand at all.',
      Visual: S.RevealTopicToTable,
    },
    {
      title: 'Recap',
      body: (
        <>
          Append-then-MERGE, streaming upserts, the LSN tiebreak, compaction's own cost, and two
          warehouse-native paths — all one choice, made several ways.
        </>
      ),
      duration: 4.8,
      fig: "append-then-merge, streaming upserts, the LSN tiebreak, compaction's own cost, and two warehouse-native paths — all one choice, made several ways.",
      takeaway: 'Freshness, write cost and read cost trade against each other; no strategy escapes the trade, only moves it.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table's rows now change many times a day each, and the team never runs compaction.
          Which cost grows without bound?
        </>
      ),
      duration: 2.8,
      fig: "a table's rows now change many times a day each, and the team never runs compaction. Which cost grows without bound?",
      predict: {
        options: [
          { label: 'The current-state table itself, since more updates means more distinct rows over time' },
          {
            label: 'The superseded rows piling up in the data files, since every update adds one without ever rewriting the old ones away',
            correct: true,
          },
        ],
        explain: (
          <>
            A streaming upsert never shrinks the number of distinct keys — it only adds more
            superseded versions of the same keys. Without compaction to rewrite those away,
            every read keeps paying to merge a pile that only ever grows.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
