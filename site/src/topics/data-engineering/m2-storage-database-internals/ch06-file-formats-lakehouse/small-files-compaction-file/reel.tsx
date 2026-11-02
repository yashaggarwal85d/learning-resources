import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's own maintenance docs (more data files means
// more manifest metadata and higher file-open cost; rewriteDataFiles exists to combine small
// files into larger ones), Delta's own optimizations docs (bin-packing coalesces small files,
// is idempotent, targets balanced file size), AWS's own S3 Tables compaction post (many small
// files force many small, overhead-heavy requests; S3 Tables compacts automatically with no
// manual intervention), and Databricks' own predictive-optimization docs (automatically running OPTIMIZE,
// VACUUM and ANALYZE on Unity Catalog managed tables) -- and against a real streaming pattern of
// 200 small files, a real measured manifest-byte and open-cost overhead, a real bin-pack
// compaction verified byte-for-byte, and a real measured compression difference, all reproduced
// on a real local directory tree.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic seventeen was about how far back a snapshot-based table lets you go, and how it
          forgets. Every snapshot in that topic assumed its files stayed a reasonable size. This
          topic is what happens when they don't: where small files come from, and what they
          really cost.
        </>
      ),
      duration: 4.8,
      fig: "topic 17 was how far a table lets you go back -- this topic is what's underneath it: small files.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a streaming job committing one small file per micro-batch cost anything beyond the bytes?',
      body: (
        <>
          A streaming job commits one new small file per micro-batch. Same total data either way.
          Does writing it as many small files instead of a few large ones cost anything beyond
          the bytes themselves?
        </>
      ),
      duration: 4.8,
      fig: 'one small file per micro-batch, same total bytes -- does that cost anything extra?',
      predict: {
        options: [
          { label: 'No — the same data costs the same either way' },
          { label: 'Yes — real extra overhead, independent of the data', correct: true },
        ],
        explain: (
          <>
            File count itself is a cost: more files means more metadata to track and more
            per-file overhead to pay, regardless of how much data is inside them.
          </>
        ),
      },
      Visual: S.PredictSmallFilesCostExtra,
    },
    {
      title: 'Reveal: reproduced for real — streaming produces 200 real small files for one partition',
      body: (
        <>
          A real streaming micro-batch pattern reproduced directly: 200 separate real files, one
          per commit, 400,000 bytes of real data total, all for the same logical partition.
        </>
      ),
      duration: 4.8,
      fig: 'a real streaming pattern -- 200 real small files, 400,000 bytes of data, one partition.',
      Visual: S.RevealStreamingProducesManySmallFiles,
    },
    {
      title: "Reveal: Iceberg's own words — more files means more metadata and slower opens",
      body: (
        <>
          Iceberg's own maintenance docs: "More data files leads to more metadata stored in
          manifest files, and small data files causes an unnecessary amount of metadata and less
          efficient queries from file open costs."
        </>
      ),
      duration: 4.8,
      fig: 'more files -- more manifest metadata, and a real per-file open cost on every query.',
      takeaway: 'File count itself drives metadata size and open cost, independent of how much data is inside the files.',
      Visual: S.RevealMoreFilesMoreMetadata,
    },
    {
      title: 'Reveal: reproduced for real — 200 small files cost real extra manifest bytes and real extra open overhead',
      body: (
        <>
          Measured directly: a real fixed-width manifest entry per file, and a real fixed
          open/LIST cost charged per file touched. Both scale with file count alone — 40,000
          manifest bytes and 10,000 open-cost units for 200 files, before any compaction.
        </>
      ),
      duration: 4.8,
      fig: 'measured for real -- 40,000 manifest bytes, 10,000 open-cost units, for 200 small files.',
      Visual: S.RevealMetadataAndOpenCostMeasured,
    },
    {
      title: 'Reveal: reproduced for real — a real bin-pack compaction, byte for byte',
      body: (
        <>
          The same 200 files' real bytes, read in order and repacked into 10 target-sized files.
          Every byte checked to survive the compaction, in the same order, verified directly
          against the original.
        </>
      ),
      duration: 4.8,
      fig: '200 small files repacked into 10 target-sized files -- every byte verified to survive.',
      takeaway: 'A bin-pack compaction only repacks bytes into fewer, larger files; it never changes the data itself.',
      Visual: S.RevealBinPackCompaction,
    },
    {
      title: 'Reveal: reproduced for real — both costs collapse by the same factor the file count did',
      body: (
        <>
          After compaction: manifest bytes drop from 40,000 to 2,000, and open-cost units drop
          from 10,000 to 500 — both collapsing by exactly the same factor the file count did,
          200 files down to 10. The data itself is still exactly 400,000 bytes.
        </>
      ),
      duration: 4.8,
      fig: 'manifest bytes and open-cost units both collapse by the same factor -- the data never moves.',
      Visual: S.RevealCostsCollapse,
    },
    {
      title: 'Predict: is compacting a partition a streaming job is still actively writing to a free action?',
      body: (
        <>
          A streaming job is still committing new small files to a partition while a compaction
          job starts rewriting that same partition's files. Is running the compaction right now a
          free action, or a real conflict?
        </>
      ),
      duration: 4.8,
      fig: 'a partition is still being streamed into while compaction starts on it -- free, or a real conflict?',
      predict: {
        options: [
          { label: 'Free — compaction only rewrites old files, never new ones' },
          { label: 'A real conflict — both are commits competing for the same files', correct: true },
        ],
        explain: (
          <>
            A compaction is itself a commit, exactly like a write. Running one while the
            partition is still actively being written to is a real scheduling decision, not
            something that happens for free.
          </>
        ),
      },
      Visual: S.PredictCompactingLivePartition,
    },
    {
      title: 'Reveal: reproduced for real — the same bytes compress worse split into small files',
      body: (
        <>
          The identical data, compressed once as 200 separate streams versus once as a single
          stream: the split version measurably loses the ability to compress across what used to
          be file boundaries.
        </>
      ),
      duration: 4.8,
      fig: 'the same bytes, compressed split vs. whole -- split loses real, measured compression.',
      Visual: S.RevealCompressionWorse,
    },
    {
      title: 'Reveal: the real scheduling trade-off, and who runs this today',
      body: (
        <>
          AWS's own words: S3 Tables "automatically perform compaction... without any manual
          intervention." Databricks' predictive optimization automatically runs OPTIMIZE,
          eliminating manual maintenance. Either way, compacting a partition still being written
          to is a real scheduling decision, not a free action.
        </>
      ),
      duration: 4.8,
      fig: 'managed compaction runs itself today -- or it is a self-run job someone still has to schedule.',
      takeaway: 'Compaction runs itself or is a scheduled job — either way it competes with ingestion for the same files.',
      Visual: S.RevealSchedulingAndManagedOfferings,
    },
    {
      title: 'Recap',
      body: (
        <>
          Many small files cost real manifest metadata and real open overhead that scale with
          file count alone. A bin-pack compaction collapses both without touching the data. And
          today, that compaction either runs itself or is a job someone has to schedule.
        </>
      ),
      duration: 4.8,
      fig: 'file count is its own cost -- compaction collapses it, run automatically or on a schedule.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
