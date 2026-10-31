import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real head-block/WAL/block/compaction simulation at Prometheus's own
// documented constants, the documented capacity formula run against the
// plant's own series count, the documented out-of-order accept/reject rule,
// a TimescaleDB-style chunk-exclusion simulation, and an InfluxDB-3-style
// staged pipeline at its own documented timings (examples.py). No number
// here goes beyond what that file computes or what a source states.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a long restart, and a backup missing three hours',
      body: (
        <>
          A crashed server replays a write-ahead log for over ten minutes
          before it's ready again. A second server, restored from a
          file-copy backup, is missing several hours no WAL could replay.
        </>
      ),
      duration: 5.6,
      fig: "a crashed server replays its write-ahead log for over ten minutes before it's ready, while a second server restored from a file-copy backup is missing hours no WAL could replay",
      Visual: S.Hook,
    },
    {
      title: "Reveal: the head block, the WAL, and the capacity formula",
      body: (
        <>
          Prometheus keeps the current block in memory, secured by a
          write-ahead log on disk. The documented capacity formula, run
          against the plant's own series count, gives the disk this needs.
        </>
      ),
      duration: 5.8,
      fig: "Prometheus keeps the current block in memory secured by a write-ahead log, and the documented capacity formula run against the plant's own series count gives the disk this needs",
      Visual: S.RevealHeadWal,
    },
    {
      title: "Reveal: compaction merges blocks, and a query can skip the rest",
      body: (
        <>
          Once a block is full, compaction merges it with its neighbors into
          one longer block. Every block's own time range lets a query decide
          whether to read it at all.
        </>
      ),
      duration: 5.6,
      fig: "compaction merges a full block with its neighbors into one longer block, and every block's own time range lets a query decide whether to read it at all",
      Visual: S.RevealCompaction,
    },
    {
      title: 'Predict: does a wider out-of-order window change what gets rejected?',
      body: (
        <>
          A server widens its out-of-order window so that older stray
          samples are accepted instead of dropped. Does that remove the
          rejection rule, or only move where it falls?
        </>
      ),
      duration: 4.8,
      fig: "widening the out-of-order window accepts older stray samples that were dropped before — does that remove the rejection rule, or only move where it falls?",
      predict: {
        options: [
          { label: 'It removes the rule — a wide enough window accepts everything' },
          {
            label: 'It only moves the line — something is still rejected beyond it',
            correct: true,
          },
        ],
        explain: (
          <>
            It only moves the line. A sample old enough to fall before even a
            widened window is still rejected — the rule doesn't disappear, it
            just accepts more than it used to.
          </>
        ),
      },
      Visual: S.PredictWindow,
    },
    {
      title: 'Reveal: the window shifts the line, and still has one',
      body: (
        <>
          With the documented default window, any late sample is rejected.
          Widen it, and a sample within the new window is accepted, while
          one still older than that is rejected exactly as before.
        </>
      ),
      duration: 5.6,
      fig: "with the default window any late sample is rejected; widening it accepts a sample within the new window while one still older is rejected exactly as before",
      Visual: S.RevealWindow,
    },
    {
      title: "Reveal: TimescaleDB's chunks, pruned the same way",
      body: (
        <>
          A hypertable splits data into time-partitioned chunks instead of
          blocks. A query naming one day's range touches only that day's
          chunk, not the whole table.
        </>
      ),
      duration: 5.4,
      fig: "a hypertable splits data into time-partitioned chunks instead of blocks, and a query naming one day's range touches only that day's chunk, not the whole table",
      takeaway: "Widening a late-data window moves the boundary of what's accepted — it never removes the boundary itself.",
      Visual: S.RevealChunks,
    },
    {
      title: "Reveal: InfluxDB 3's buffer, WAL, and Parquet, on a clock",
      body: (
        <>
          A write lands in a memory buffer, reaches the WAL within a second,
          and stays queryable for several minutes before the oldest part of
          it is persisted to Parquet, on its own fixed clock.
        </>
      ),
      duration: 5.8,
      fig: "a write lands in a memory buffer, reaches the WAL within a second, stays queryable for several minutes, then the oldest part is persisted to Parquet on a fixed clock",
      takeaway: "Three different engines all draw the same line somewhere — only where they draw it, and on what clock, differs.",
      Visual: S.RevealInfluxPipeline,
    },
    {
      title: 'Reveal: three scaled-out backends, one shared pattern',
      body: (
        <>
          Thanos, Mimir and VictoriaMetrics each describe a different
          architecture in their own words. Underneath, all three push the
          same block format out to object storage, behind a stateless query layer.
        </>
      ),
      duration: 5.6,
      fig: "Thanos, Mimir and VictoriaMetrics describe different architectures in their own words, but all three push the same block format to object storage behind a stateless query layer",
      takeaway: "Three competing projects converging on the same pattern is stronger evidence for it than any one of their own descriptions.",
      Visual: S.RevealScaledOut,
    },
    {
      title: 'Recap',
      body: (
        <>
          A head block in memory, a WAL for crash safety, blocks pruned by
          time range, a window that shifts where late data is rejected, and
          three engines agreeing that the line between memory and object
          storage is where the architecture actually lives.
        </>
      ),
      duration: 5.8,
      fig: "a head block in memory, a WAL for crash safety, blocks pruned by time range, a shifting late-data window, and three engines agreeing the memory/object-storage line is where the architecture lives",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Given the hook's two servers, can what each one lost be stated
          exactly, from the structure alone, without guessing at either
          server's configuration?
        </>
      ),
      duration: 4.8,
      fig: "given the hook's two servers, can what each one lost be stated exactly from the structure alone, without guessing at either server's configuration?",
      predict: {
        options: [
          { label: "No — losing data this way is unpredictable without logs" },
          {
            label: 'Yes — the WAL recovers the head, but a file-copy backup skips it entirely',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The first server's WAL replay recovers everything the head
            held at crash time; the second server's file-copy backup never
            touched the WAL at all, so whatever the head held is simply gone.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
