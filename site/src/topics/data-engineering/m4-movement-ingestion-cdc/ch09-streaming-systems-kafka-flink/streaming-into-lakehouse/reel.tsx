import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: halving a toy writer's commit interval on a
// fixed input volume exactly doubles the file count and exactly halves the average staleness;
// the identical commit cadence, run through an LSM-style compaction buffer, lands a fraction of
// the files. No literal digits anywhere below; the real measured values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: commit more often, pay in files',
      body: (
        <>
          Halve a toy streaming writer's commit interval, on the identical input volume, and the
          number of small files it produces roughly doubles. Freshness and file count move in
          opposite directions, and nothing here improves both at once.
        </>
      ),
      duration: 4.8,
      fig: 'halving the commit interval roughly doubles the file count, on the same volume',
      Visual: S.Hook,
    },
    {
      title: 'Setup: every engine lands its output somewhere queryable',
      body: (
        <>
          Every engine this chapter has covered eventually hands its output to something a
          person or another system can query. This topic is the first of the two places that
          happens.
        </>
      ),
      duration: 4.8,
      fig: "every engine's output has to land somewhere queryable, eventually",
      Visual: S.Setup,
    },
    {
      title: 'Predict: commit twice as often — what happens to the file count?',
      body: (
        <>
          Commit twice as often as before, over the same stretch of time, on the identical
          volume of incoming data. What happens to how many files the writer produces?
        </>
      ),
      duration: 2.8,
      fig: 'commit twice as often, same volume — what happens to the file count?',
      predict: {
        options: [
          { label: 'Nothing changes — the same data ends up in the same number of files' },
          { label: 'It roughly doubles, since each commit now covers half as much data', correct: true },
          { label: 'It drops, since committing more often catches more data per file' },
        ],
        explain: (
          <>
            It roughly doubles. Each commit now seals a batch half the size of before, so
            covering the same total volume takes about twice as many files.
          </>
        ),
      },
      Visual: S.PredictFileCount,
    },
    {
      title: 'Reveal: commit cadence sets file count',
      body: (
        <>
          A toy writer committing twice as often, on the same volume, produces exactly twice the
          files — and the average wait before a write becomes visible is exactly half as long.
        </>
      ),
      duration: 4.8,
      fig: 'twice the commit frequency, exactly twice the files, half the staleness',
      Visual: S.RevealCommitCadence,
    },
    {
      title: 'Reveal: automated materialisation or a hand-built sink',
      body: (
        <>
          Confluent Tableflow and Redpanda's Iceberg topics turn a Kafka topic into an Iceberg or
          Delta table automatically. A Flink or Spark job committing to Iceberg, Delta, or Paimon
          reaches the identical destination, built and operated by hand.
        </>
      ),
      duration: 5,
      fig: 'automated materialisation or a hand-built sink, same destination either way',
      takeaway: 'An automated pipeline and a hand-built one land in the same place, trade-off waiting on the other side.',
      Visual: S.RevealAutomatedVsHandbuilt,
    },
    {
      title: "Reveal: a sink's commit rides on the processor's checkpoint",
      body: (
        <>
          A stream processor's own sink guarantees exactly-once delivery by tying its table
          commit to its checkpoint. The commit interval and the checkpoint interval are the same
          setting, not two separate ones.
        </>
      ),
      duration: 4.8,
      fig: "a sink's commit is tied to the processor's own checkpoint interval",
      Visual: S.RevealSinkCheckpoint,
    },
    {
      title: 'Predict: what could absorb frequent commits without slowing them down?',
      body: (
        <>
          A shorter commit interval always costs more small files, on the writer side. What
          could absorb those small commits without forcing the cadence itself to slow down?
        </>
      ),
      duration: 2.8,
      fig: 'shorter intervals always cost more files — what could absorb that without slowing down?',
      predict: {
        options: [
          { label: 'Nothing — the writer has to slow its commits down to reduce file count' },
          { label: 'A storage layer that buffers and merges small files after they land', correct: true },
          { label: 'Running the same writer on more machines in parallel' },
        ],
        explain: (
          <>
            A storage layer that buffers and merges small files after they land. The commit
            cadence stays the same; the storage underneath does the work of compacting what it
            receives.
          </>
        ),
      },
      Visual: S.PredictAbsorb,
    },
    {
      title: 'Reveal: an LSM buffer absorbs them',
      body: (
        <>
          Run the identical commit cadence through a buffer that merges small files on
          compaction, the way an LSM tree does, and the files landing on disk shrink to a
          fraction of what an uncompacted writer would leave behind.
        </>
      ),
      duration: 4.8,
      fig: 'the same cadence, run through a buffer, lands far fewer files',
      Visual: S.RevealLSMBuffer,
    },
    {
      title: 'Reveal: streaming-first storage',
      body: (
        <>
          Paimon's primary-key tables store data in an LSM tree built for exactly this pattern of
          frequent small writes. Fluss sits directly in front of Flink as streaming storage,
          offering sub-second reads and writes before anything reaches a lakehouse table at all.
        </>
      ),
      duration: 5,
      fig: "paimon's lsm layer and fluss both answer the same trade-off from storage",
      takeaway: "A table format built for frequent small writes doesn't remove the trade-off, it just moves where the cost gets paid.",
      Visual: S.RevealStreamingFirstStorage,
    },
    {
      title: 'Reveal: no free setting',
      body: (
        <>
          Automated materialisation, a hand-built sink, and streaming-first storage all place the
          same commit-frequency, file-count, and freshness trade-off somewhere. None of them
          removes it.
        </>
      ),
      duration: 4.8,
      fig: 'automated, hand-built, or streaming-first — the same trade-off gets paid somewhere',
      Visual: S.RevealNoFreeSetting,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just
          now — halving the commit interval genuinely doubled the file count and halved the
          staleness, and the identical cadence, compacted, landed a fraction of the files.
        </>
      ),
      duration: 5,
      fig: "this topic's own real run, every number read straight off it",
      takeaway: "The toy model's own numbers: the same commit cadence, compacted, lands a fraction of the files, unchanged in freshness.",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Commit cadence sets freshness and file count together, and nothing removes that. An
          automated pipeline, a hand-built sink, or streaming-first storage are three different
          places to pay the same cost. A lakehouse table is one destination this chapter's
          streams can land on — the next is the other.
        </>
      ),
      duration: 5.2,
      fig: 'commit cadence sets freshness and file count together, three places to pay the cost',
      Visual: S.Recap,
    },
  ],
};

export default reel;
